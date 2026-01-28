const axios = require('axios');
const db = require('../config/database');

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION 
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORDER-${timestamp}-${random}`;
};

// Create Transaction (Checkout)
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shipping_address, shipping_cost, shipping_service } = req.body;

    // Validasi input
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keranjang belanja kosong.'
      });
    }

    if (!shipping_address || !shipping_cost || !shipping_service) {
      return res.status(400).json({
        success: false,
        message: 'Data pengiriman tidak lengkap.'
      });
    }

    // Calculate total price
    let totalPrice = 0;
    const itemDetails = [];

    for (const item of items) {
      const [products] = await db.query(
        'SELECT id, name, price, stock FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan.`
        });
      }

      const product = products[0];

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok ${product.name} tidak mencukupi.`
        });
      }

      const subtotal = product.price * item.quantity;
      totalPrice += subtotal;

      itemDetails.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal
      });
    }

    const grandTotal = totalPrice + parseFloat(shipping_cost);
    const orderNumber = generateOrderNumber();

    // Get user info
    const [users] = await db.query(
      'SELECT name, email, phone FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];

    // Insert order to database
    const [orderResult] = await db.query(
      `INSERT INTO orders (
        user_id, order_number, total_price, shipping_cost, grand_total,
        payment_status, order_status, shipping_address, shipping_service
      ) VALUES (?, ?, ?, ?, ?, 'PENDING', 'PENDING', ?, ?)`,
      [userId, orderNumber, totalPrice, shipping_cost, grandTotal, 
       JSON.stringify(shipping_address), shipping_service]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of itemDetails) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price, item.subtotal]
      );

      // Update product stock
      await db.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }

    // Prepare Midtrans Snap API request
    const midtransItems = itemDetails.map(item => ({
      id: item.id.toString(),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name
    }));

    // Add shipping cost as item
    midtransItems.push({
      id: 'SHIPPING',
      price: Math.round(shipping_cost),
      quantity: 1,
      name: `Ongkir - ${shipping_service}`
    });

    const snapPayload = {
      transaction_details: {
        order_id: orderNumber,
        gross_amount: Math.round(grandTotal)
      },
      item_details: midtransItems,
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone || '',
        shipping_address: {
          first_name: shipping_address.recipient_name,
          phone: shipping_address.phone,
          address: shipping_address.address_detail,
          city: shipping_address.city,
          postal_code: shipping_address.postal_code || '',
          country_code: 'IDN'
        }
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/order/success?order_id=${orderNumber}`,
        error: `${process.env.FRONTEND_URL}/order/failed?order_id=${orderNumber}`,
        pending: `${process.env.FRONTEND_URL}/order/pending?order_id=${orderNumber}`
      }
    };

    // Call Midtrans Snap API
    const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
    
    const midtransResponse = await axios.post(
      MIDTRANS_BASE_URL,
      snapPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        }
      }
    );

    const snapToken = midtransResponse.data.token;
    const redirectUrl = midtransResponse.data.redirect_url;

    // Update order with snap token
    await db.query(
      'UPDATE orders SET snap_token = ?, midtrans_order_id = ? WHERE id = ?',
      [snapToken, orderNumber, orderId]
    );

    // Clear user's cart after successful order
    await db.query('DELETE FROM carts WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Order berhasil dibuat!',
      data: {
        order_id: orderId,
        order_number: orderNumber,
        snap_token: snapToken,
        redirect_url: redirectUrl
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat transaksi.'
    });
  }
};

// Midtrans Notification Handler (Webhook)
const handleNotification = async (req, res) => {
  try {
    const {
      order_id,
      transaction_status,
      fraud_status,
      transaction_id
    } = req.body;

    console.log('Midtrans notification:', req.body);

    let paymentStatus = 'PENDING';
    let orderStatus = 'PENDING';

    // Determine payment status based on Midtrans response
    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        paymentStatus = 'PAID';
        orderStatus = 'PROCESSING';
      }
    } else if (transaction_status === 'settlement') {
      paymentStatus = 'PAID';
      orderStatus = 'PROCESSING';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      paymentStatus = 'FAILED';
      orderStatus = 'CANCELLED';
    } else if (transaction_status === 'expire') {
      paymentStatus = 'EXPIRED';
      orderStatus = 'CANCELLED';
    } else if (transaction_status === 'pending') {
      paymentStatus = 'PENDING';
      orderStatus = 'PENDING';
    }

    // Update order in database
    await db.query(
      `UPDATE orders 
       SET payment_status = ?, order_status = ?, midtrans_transaction_id = ? 
       WHERE order_number = ?`,
      [paymentStatus, orderStatus, transaction_id, order_id]
    );

    res.status(200).json({
      success: true,
      message: 'Notification processed'
    });
  } catch (error) {
    console.error('Handle notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process notification'
    });
  }
};

// Get Order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [orders] = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order tidak ditemukan.'
      });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    order.items = items;
    order.shipping_address = JSON.parse(order.shipping_address);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data order.'
    });
  }
};

// Get User Orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data order.'
    });
  }
};

module.exports = {
  createTransaction,
  handleNotification,
  getOrderById,
  getUserOrders
};

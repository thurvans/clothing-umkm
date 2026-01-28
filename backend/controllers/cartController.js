const db = require('../config/database');

// Get User Cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [cartItems] = await db.query(
      `SELECT c.*, p.name, p.price, p.discount_price, p.stock, p.image, p.weight
       FROM carts c
       LEFT JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? AND p.status = 'active'`,
      [userId]
    );

    // Calculate totals
    let totalItems = 0;
    let totalPrice = 0;
    let totalWeight = 0;

    const items = cartItems.map(item => {
      const price = item.discount_price || item.price;
      const subtotal = price * item.quantity;
      totalItems += item.quantity;
      totalPrice += subtotal;
      totalWeight += item.weight * item.quantity;

      return {
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        discount_price: item.discount_price,
        quantity: item.quantity,
        stock: item.stock,
        image: item.image,
        weight: item.weight,
        subtotal
      };
    });

    res.status(200).json({
      success: true,
      data: {
        items,
        summary: {
          totalItems,
          totalPrice,
          totalWeight
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data keranjang.'
    });
  }
};

// Add to Cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID wajib diisi.'
      });
    }

    // Check if product exists and has stock
    const [products] = await db.query(
      'SELECT id, name, stock FROM products WHERE id = ? AND status = "active"',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produk tidak ditemukan.'
      });
    }

    const product = products[0];

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${product.stock}`
      });
    }

    // Check if item already in cart
    const [existingCart] = await db.query(
      'SELECT id, quantity FROM carts WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existingCart.length > 0) {
      // Update quantity
      const newQuantity = existingCart[0].quantity + quantity;

      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak mencukupi. Stok tersedia: ${product.stock}`
        });
      }

      await db.query(
        'UPDATE carts SET quantity = ? WHERE id = ?',
        [newQuantity, existingCart[0].id]
      );
    } else {
      // Insert new cart item
      await db.query(
        'INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke keranjang.'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk ke keranjang.'
    });
  }
};

// Update Cart Item Quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity minimal 1.'
      });
    }

    // Check if cart item exists
    const [cartItems] = await db.query(
      `SELECT c.id, c.product_id, p.stock 
       FROM carts c
       LEFT JOIN products p ON c.product_id = p.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, userId]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di keranjang.'
      });
    }

    const cartItem = cartItems[0];

    if (cartItem.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Stok tersedia: ${cartItem.stock}`
      });
    }

    // Update quantity
    await db.query(
      'UPDATE carts SET quantity = ? WHERE id = ?',
      [quantity, id]
    );

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil diupdate.'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate keranjang.'
    });
  }
};

// Remove from Cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM carts WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan di keranjang.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item berhasil dihapus dari keranjang.'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus item dari keranjang.'
    });
  }
};

// Clear Cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query('DELETE FROM carts WHERE user_id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil dikosongkan.'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengosongkan keranjang.'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};

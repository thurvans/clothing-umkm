import { useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await paymentAPI.getUserOrders();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { class: 'warning', text: 'Menunggu Pembayaran' },
      PAID: { class: 'success', text: 'Dibayar' },
      FAILED: { class: 'danger', text: 'Gagal' },
      EXPIRED: { class: 'secondary', text: 'Kadaluarsa' },
      PROCESSING: { class: 'info', text: 'Diproses' },
      SHIPPED: { class: 'primary', text: 'Dikirim' },
      DELIVERED: { class: 'success', text: 'Diterima' },
      CANCELLED: { class: 'dark', text: 'Dibatalkan' }
    };

    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Pesanan Saya</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box-seam display-1 text-muted"></i>
          <h4 className="mt-3">Belum Ada Pesanan</h4>
          <p className="text-muted">Anda belum memiliki pesanan apapun</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="mb-1">Order #{order.order_number}</h6>
                      <small className="text-muted">{formatDate(order.created_at)}</small>
                    </div>
                    <div className="text-end">
                      {getStatusBadge(order.payment_status)}
                      {' '}
                      {getStatusBadge(order.order_status)}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-8">
                      <p className="mb-1">
                        <strong>Total:</strong> {formatPrice(order.grand_total)}
                      </p>
                      <p className="mb-1">
                        <strong>Pengiriman:</strong> {order.shipping_service} ({formatPrice(order.shipping_cost)})
                      </p>
                      {order.tracking_number && (
                        <p className="mb-0">
                          <strong>Resi:</strong> {order.tracking_number}
                        </p>
                      )}
                    </div>
                    <div className="col-md-4 text-end">
                      {order.payment_status === 'PENDING' && order.snap_token && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => window.location.href = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${order.snap_token}`}
                        >
                          Bayar Sekarang
                        </button>
                      )}
                      <button className="btn btn-outline-primary btn-sm ms-2">
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

import { Link, useSearchParams } from 'react-router-dom';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body p-5">
              <i className="bi bi-check-circle-fill text-success display-1 mb-4"></i>
              <h2 className="mb-3">Pembayaran Berhasil!</h2>
              <p className="text-muted mb-4">
                Terima kasih atas pembelian Anda. Order ID: <strong>{orderId}</strong>
              </p>
              <p className="mb-4">
                Pesanan Anda sedang diproses dan akan segera dikirim.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <Link to="/orders" className="btn btn-primary">
                  Lihat Pesanan
                </Link>
                <Link to="/products" className="btn btn-outline-primary">
                  Belanja Lagi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

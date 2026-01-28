import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">
                Fashion Berkualitas untuk Gaya Hidup Anda
              </h1>
              <p className="lead mb-4">
                Temukan koleksi pakaian terbaik dengan harga terjangkau. 
                Pengiriman ke seluruh Indonesia dengan cepat dan aman.
              </p>
              <Link to="/products" className="btn btn-primary btn-lg">
                Belanja Sekarang
              </Link>
            </div>
            <div className="col-lg-6">
              <img 
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800" 
                alt="Fashion" 
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center mb-5">Kategori Produk</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <Link to="/products?category=kaos" className="text-decoration-none">
                <div className="card text-center h-100 hover-card">
                  <div className="card-body">
                    <i className="bi bi-person-standing display-4 text-primary mb-3"></i>
                    <h5 className="card-title">Kaos</h5>
                    <p className="card-text text-muted">Koleksi kaos casual</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/products?category=kemeja" className="text-decoration-none">
                <div className="card text-center h-100 hover-card">
                  <div className="card-body">
                    <i className="bi bi-suit-heart display-4 text-primary mb-3"></i>
                    <h5 className="card-title">Kemeja</h5>
                    <p className="card-text text-muted">Kemeja formal & casual</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/products?category=celana" className="text-decoration-none">
                <div className="card text-center h-100 hover-card">
                  <div className="card-body">
                    <i className="bi bi-minecart-loaded display-4 text-primary mb-3"></i>
                    <h5 className="card-title">Celana</h5>
                    <p className="card-text text-muted">Celana pria & wanita</p>
                  </div>
                </div>
              </Link>
            </div>
            <div className="col-md-3">
              <Link to="/products?category=jaket" className="text-decoration-none">
                <div className="card text-center h-100 hover-card">
                  <div className="card-body">
                    <i className="bi bi-cloud-drizzle display-4 text-primary mb-3"></i>
                    <h5 className="card-title">Jaket</h5>
                    <p className="card-text text-muted">Jaket & outerwear</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-light py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <i className="bi bi-truck display-4 text-primary mb-3"></i>
              <h5>Gratis Ongkir</h5>
              <p className="text-muted">Untuk pembelian minimal Rp 200.000</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-shield-check display-4 text-primary mb-3"></i>
              <h5>Pembayaran Aman</h5>
              <p className="text-muted">Terintegrasi dengan Midtrans</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="bi bi-arrow-clockwise display-4 text-primary mb-3"></i>
              <h5>Garansi Return</h5>
              <p className="text-muted">7 hari money back guarantee</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

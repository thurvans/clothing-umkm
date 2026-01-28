import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts({ category, search });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const handleCategoryFilter = (slug) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="container py-4">
      <div className="row">
        {/* Sidebar Filter */}
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Kategori</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <button 
                    className={`btn btn-link text-decoration-none ${!category ? 'fw-bold' : ''}`}
                    onClick={() => handleCategoryFilter('')}
                  >
                    Semua Produk
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id} className="mb-2">
                    <button 
                      className={`btn btn-link text-decoration-none ${category === cat.slug ? 'fw-bold' : ''}`}
                      onClick={() => handleCategoryFilter(cat.slug)}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              {category ? categories.find(c => c.slug === category)?.name : 'Semua Produk'}
            </h3>
            <span className="text-muted">{products.length} produk</span>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="alert alert-info">
              Tidak ada produk ditemukan
            </div>
          ) : (
            <div className="row g-4">
              {products.map((product) => (
                <div key={product.id} className="col-md-4">
                  <div className="card h-100 product-card">
                    <img 
                      src={product.image || 'https://via.placeholder.com/300'} 
                      className="card-img-top" 
                      alt={product.name}
                      style={{ height: '250px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title">{product.name}</h6>
                      <p className="text-muted small mb-2">{product.category_name}</p>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          {product.discount_price ? (
                            <>
                              <span className="text-decoration-line-through text-muted small">
                                {formatPrice(product.price)}
                              </span>
                              <span className="fw-bold text-danger">
                                {formatPrice(product.discount_price)}
                              </span>
                            </>
                          ) : (
                            <span className="fw-bold">{formatPrice(product.price)}</span>
                          )}
                        </div>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/products/${product.slug}`} 
                            className="btn btn-outline-primary btn-sm flex-grow-1"
                          >
                            Detail
                          </Link>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddToCart(product.id)}
                            disabled={product.stock === 0}
                          >
                            <i className="bi bi-cart-plus"></i>
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
      </div>
    </div>
  );
};

export default Products;

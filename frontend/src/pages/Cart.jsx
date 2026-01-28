import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { shippingAPI, paymentAPI } from '../services/api';

const Cart = () => {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    recipient_name: '',
    phone: '',
    address_detail: '',
    postal_code: ''
  });
  const [processingCheckout, setProcessingCheckout] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await shippingAPI.getProvinces();
      setProvinces(response.data.data);
    } catch (error) {
      console.error('Fetch provinces error:', error);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvince(provinceId);
    setSelectedCity('');
    setCities([]);
    setShippingOptions([]);
    setSelectedShipping(null);

    if (provinceId) {
      try {
        const response = await shippingAPI.getCities(provinceId);
        setCities(response.data.data);
      } catch (error) {
        console.error('Fetch cities error:', error);
      }
    }
  };

  const handleCalculateShipping = async () => {
    if (!selectedCity) {
      alert('Pilih kota tujuan terlebih dahulu');
      return;
    }

    const totalWeight = cart.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

    try {
      setLoadingShipping(true);
      const response = await shippingAPI.calculateCost({
        origin: '501', // ID kota asal (contoh: Tangerang)
        destination: selectedCity,
        weight: totalWeight,
        courier: 'jne' // bisa diganti: pos, tiki, dll
      });
      setShippingOptions(response.data.data.options);
    } catch (error) {
      console.error('Calculate shipping error:', error);
      alert('Gagal menghitung ongkir');
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(cartId, newQuantity);
  };

  const handleRemove = async (cartId) => {
    if (window.confirm('Hapus item ini dari keranjang?')) {
      await removeItem(cartId);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getGrandTotal = () => {
    const subtotal = getTotalPrice();
    const shippingCost = selectedShipping?.cost || 0;
    return subtotal + shippingCost;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = async () => {
    if (!shippingAddress.recipient_name || !shippingAddress.phone || !shippingAddress.address_detail) {
      alert('Lengkapi alamat pengiriman');
      return;
    }

    if (!selectedShipping) {
      alert('Pilih metode pengiriman');
      return;
    }

    const provinceName = provinces.find(p => p.province_id === selectedProvince)?.province;
    const cityName = cities.find(c => c.city_id === selectedCity)?.city_name;

    const checkoutData = {
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      })),
      shipping_address: {
        ...shippingAddress,
        province: provinceName,
        city: cityName
      },
      shipping_cost: selectedShipping.cost,
      shipping_service: `JNE - ${selectedShipping.service}`
    };

    try {
      setProcessingCheckout(true);
      const response = await paymentAPI.checkout(checkoutData);
      const { redirect_url } = response.data.data;
      
      // Redirect ke Midtrans payment page
      window.location.href = redirect_url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.response?.data?.message || 'Checkout gagal');
    } finally {
      setProcessingCheckout(false);
    }
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

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-cart-x display-1 text-muted"></i>
        <h3 className="mt-3">Keranjang Kosong</h3>
        <p className="text-muted">Belum ada produk di keranjang Anda</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Keranjang Belanja</h2>
      
      <div className="row">
        <div className="col-lg-8 mb-4">
          {/* Cart Items */}
          <div className="card mb-4">
            <div className="card-body">
              {cart.map((item) => (
                <div key={item.id} className="row mb-3 pb-3 border-bottom">
                  <div className="col-md-2">
                    <img 
                      src={item.image || 'https://via.placeholder.com/100'} 
                      alt={item.name}
                      className="img-fluid rounded"
                    />
                  </div>
                  <div className="col-md-10">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6>{item.name}</h6>
                        <p className="text-muted mb-1">
                          {formatPrice(item.discount_price || item.price)} x {item.quantity}
                        </p>
                        <p className="fw-bold">{formatPrice(item.subtotal)}</p>
                      </div>
                      <div>
                        <div className="btn-group btn-group-sm mb-2">
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <button className="btn btn-outline-secondary" disabled>
                            {item.quantity}
                          </button>
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-sm btn-danger d-block w-100"
                          onClick={() => handleRemove(item.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Alamat Pengiriman</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nama Penerima</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.recipient_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, recipient_name: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">No. Telepon</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Provinsi</label>
                  <select 
                    className="form-select"
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map((prov) => (
                      <option key={prov.province_id} value={prov.province_id}>
                        {prov.province}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Kota/Kabupaten</label>
                  <select 
                    className="form-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedProvince}
                  >
                    <option value="">Pilih Kota</option>
                    {cities.map((city) => (
                      <option key={city.city_id} value={city.city_id}>
                        {city.type} {city.city_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Kode Pos</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shippingAddress.postal_code}
                    onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Alamat Lengkap</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={shippingAddress.address_detail}
                    onChange={(e) => setShippingAddress({...shippingAddress, address_detail: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-12">
                  <button 
                    className="btn btn-primary"
                    onClick={handleCalculateShipping}
                    disabled={loadingShipping || !selectedCity}
                  >
                    {loadingShipping ? 'Loading...' : 'Hitung Ongkir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          {/* Shipping Options */}
          {shippingOptions.length > 0 && (
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="card-title">Pilih Layanan Pengiriman</h6>
                {shippingOptions.map((option, index) => (
                  <div key={index} className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="shipping"
                      id={`shipping-${index}`}
                      onChange={() => setSelectedShipping(option)}
                    />
                    <label className="form-check-label w-100" htmlFor={`shipping-${index}`}>
                      <div className="d-flex justify-content-between">
                        <span>{option.service} ({option.etd} hari)</span>
                        <span className="fw-bold">{formatPrice(option.cost)}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ringkasan Belanja</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Ongkir</span>
                <span>{selectedShipping ? formatPrice(selectedShipping.cost) : '-'}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <strong>Total</strong>
                <strong className="text-primary">{formatPrice(getGrandTotal())}</strong>
              </div>
              <button 
                className="btn btn-primary w-100"
                onClick={handleCheckout}
                disabled={!selectedShipping || processingCheckout}
              >
                {processingCheckout ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

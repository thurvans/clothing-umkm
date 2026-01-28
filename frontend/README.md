# UMKM Clothing - Frontend

Frontend aplikasi e-commerce UMKM Clothing menggunakan React, Vite, dan Bootstrap.

## 🚀 Features

- ✅ **Authentication**
  - Login & Register
  - Email verification
  - Forgot password & reset password
  - Protected routes

- 🛍️ **Product Catalog**
  - Browse produk dengan filter kategori
  - Search produk
  - Detail produk
  
- 🛒 **Shopping Cart**
  - Add/Update/Remove items
  - Real-time cart counter
  
- 🚚 **Shipping Calculator**
  - Integration dengan RajaOngkir API
  - Multiple courier options (JNE, POS, TIKI)
  - Real-time shipping cost calculation
  
- 💳 **Payment**
  - Midtrans Snap redirect
  - Multiple payment methods
  - Order tracking

## 📋 Prerequisites

- Node.js v16 atau lebih baru
- NPM atau Yarn

## ⚙️ Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

Application akan berjalan di `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

Build files akan tersimpan di folder `dist/`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx         # Navigation bar
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── CartContext.jsx    # Shopping cart state
│   ├── pages/
│   │   ├── Home.jsx           # Homepage
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Register page
│   │   ├── VerifyEmail.jsx    # Email verification
│   │   ├── ForgotPassword.jsx # Forgot password
│   │   ├── ResetPassword.jsx  # Reset password
│   │   ├── Products.jsx       # Product listing
│   │   ├── Cart.jsx           # Shopping cart
│   │   ├── Orders.jsx         # Order history
│   │   └── OrderSuccess.jsx   # Payment success
│   ├── services/
│   │   └── api.js             # API service & axios config
│   ├── App.jsx                # Main app component
│   ├── App.css                # Global styles
│   └── main.jsx               # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## 🎨 Styling

Project ini menggunakan:
- **Bootstrap 5.3** untuk komponen dan grid system
- **Bootstrap Icons** untuk icon
- **Custom CSS** untuk styling tambahan

CSS murni digunakan untuk styling custom, Bootstrap hanya digunakan untuk:
- Grid system (container, row, col)
- Utility classes (margin, padding, text, display)
- Form components
- Card components
- Buttons

Tidak menggunakan komponen Bootstrap yang berat seperti:
- Bootstrap JavaScript components (modal, carousel, dll)
- Complex Bootstrap layouts

## 🔐 Authentication Flow

1. **Register**
   - User mengisi form register
   - Protected dengan rate limiter (3 attempts/hour)
   - Email verification dikirim
   - User harus verify email sebelum login

2. **Login**
   - User login dengan email & password
   - Mendapat JWT token
   - Token disimpan di localStorage
   - Auto-redirect jika token expired

3. **Forgot Password**
   - User request reset password
   - Email dengan link reset dikirim
   - Link valid 1 jam
   - User set password baru

## 🛒 Shopping Flow

1. **Browse Products**
   - User melihat katalog produk
   - Filter by category
   - Search by name

2. **Add to Cart**
   - User add produk ke cart
   - Quantity adjustment
   - Real-time stock validation

3. **Checkout**
   - User isi alamat pengiriman
   - Calculate shipping cost (RajaOngkir)
   - Pilih kurir & service
   - Review order summary

4. **Payment**
   - Redirect ke Midtrans Snap
   - User pilih payment method
   - Complete payment
   - Redirect back ke website

5. **Order Tracking**
   - User bisa lihat order history
   - Status tracking
   - Payment & shipping status

## 🔌 API Integration

### Authentication API
```javascript
import { authAPI } from './services/api';

// Register
await authAPI.register({ name, email, password, phone });

// Login
await authAPI.login({ email, password });

// Get current user
await authAPI.getCurrentUser();
```

### Product API
```javascript
import { productAPI } from './services/api';

// Get products with filters
await productAPI.getAllProducts({ category, search, page, limit });

// Get product detail
await productAPI.getProductBySlug(slug);
```

### Cart API
```javascript
import { cartAPI } from './services/api';

// Get cart
await cartAPI.getCart();

// Add to cart
await cartAPI.addToCart({ product_id, quantity });

// Update quantity
await cartAPI.updateCartItem(cartId, quantity);

// Remove item
await cartAPI.removeFromCart(cartId);
```

### Shipping API
```javascript
import { shippingAPI } from './services/api';

// Get provinces
await shippingAPI.getProvinces();

// Get cities
await shippingAPI.getCities(provinceId);

// Calculate cost
await shippingAPI.calculateCost({ origin, destination, weight, courier });
```

### Payment API
```javascript
import { paymentAPI } from './services/api';

// Checkout
await paymentAPI.checkout({ items, shipping_address, shipping_cost, shipping_service });

// Get orders
await paymentAPI.getUserOrders();

// Get order detail
await paymentAPI.getOrderById(orderId);
```

## 🔒 Protected Routes

Routes yang memerlukan authentication:
- `/cart` - Shopping cart
- `/orders` - Order history
- `/profile` - User profile

Jika user belum login, akan redirect ke `/login`

## 📱 Responsive Design

Website fully responsive untuk:
- Desktop (1920px+)
- Laptop (1024px - 1920px)
- Tablet (768px - 1024px)
- Mobile (320px - 768px)

## 🚀 Deployment

### Build
```bash
npm run build
```

### Deploy ke Vercel/Netlify
1. Push code ke GitHub
2. Connect repository ke Vercel/Netlify
3. Set environment variables
4. Deploy

### Environment Variables untuk Production
```
VITE_API_URL=https://your-api-domain.com/api
```

## 🐛 Troubleshooting

1. **CORS Error**
   - Check backend CORS configuration
   - Pastikan FRONTEND_URL di backend .env sudah benar

2. **API Not Found**
   - Check VITE_API_URL di .env
   - Pastikan backend server running

3. **Login Failed**
   - Check email sudah verified
   - Check credentials correct
   - Check JWT_SECRET di backend

## 📝 Notes

- **reCAPTCHA**: Implementasi reCAPTCHA v3 untuk register masih placeholder, perlu ditambahkan Google reCAPTCHA keys
- **Image Upload**: Fitur upload image produk belum diimplementasi, masih menggunakan URL
- **Payment Success**: Setelah payment di Midtrans, callback akan update status order di database

## 👨‍💻 Development

### Run Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📄 License

ISC

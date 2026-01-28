# UMKM Clothing - E-Commerce Platform

Platform e-commerce lengkap untuk UMKM Clothing dengan fitur authentication yang aman, payment gateway Midtrans, dan integrasi ekspedisi lokal Indonesia.

## 🌟 Features

### 🔐 Authentication System (Anti Fake & Spam)
- ✅ Register dengan email verification
- ✅ reCAPTCHA v3 integration (anti bot)
- ✅ Rate limiting (3 register/hour per IP)
- ✅ Email domain validation (@gmail.com, @yahoo.com, dll)
- ✅ Password hashing dengan bcrypt
- ✅ JWT token authentication
- ✅ Forgot password & reset password
- ✅ Secure token (1x pakai, dengan expiration)

### 🛍️ E-Commerce Features
- ✅ Product catalog dengan kategori
- ✅ Search & filter products
- ✅ Shopping cart dengan real-time stock validation
- ✅ Product detail pages

### 💳 Payment Gateway (Midtrans)
- ✅ Midtrans Snap (redirect ke halaman Midtrans)
- ✅ Multiple payment methods
- ✅ Webhook notification handler
- ✅ Order status tracking (PENDING, PAID, FAILED, EXPIRED)

### 🚚 Shipping Integration (RajaOngkir)
- ✅ Real-time shipping cost calculation
- ✅ Multiple courier options (JNE, POS, TIKI)
- ✅ Province & city selection
- ✅ Automatic weight calculation

### 📦 Order Management
- ✅ Order creation & tracking
- ✅ Order history
- ✅ Payment status
- ✅ Shipping status
- ✅ Order status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **Axios** - HTTP client untuk external APIs
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

### Frontend
- **React** + **Vite** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **Bootstrap 5** - CSS framework (grid & utilities only)
- **Custom CSS** - Styling

### External Services
- **Midtrans** - Payment gateway
- **RajaOngkir** - Shipping cost calculator
- **SMTP (Gmail)** - Email service

## 📋 Prerequisites

- Node.js v16+
- MySQL 8.0+
- NPM/Yarn
- Midtrans Account (sandbox for testing)
- RajaOngkir API Key
- Gmail SMTP credentials

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd umkm-clothing
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup database
mysql -u root -p < database.sql

# Configure environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Run server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000/api

# Run development server
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 📖 Documentation

Lihat dokumentasi lengkap di masing-masing folder:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=umkm_clothing

JWT_SECRET=your_secret_key
JWT_EXPIRE=30m

EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:5173

MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

RAJAONGKIR_API_KEY=your_rajaongkir_api_key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔐 Security Features

### Anti Fake & Spam Register
1. **reCAPTCHA v3** - Mencegah bot registration
2. **Rate Limiting** - Max 3 registrasi per jam per IP
3. **Email Domain Validation** - Hanya domain terpercaya
4. **Email Verification** - Must verify email before login
5. **Password Hashing** - bcrypt dengan salt rounds 10

### Password Security
- Minimal 6 karakter
- Hashed dengan bcrypt
- Reset token hanya 1x pakai
- Token expire dalam 1 jam

### JWT Security
- Access token: 30 menit
- Refresh token: 7 hari
- Token verified di setiap protected route
- Auto-logout jika token expired

## 💳 Payment Flow

1. User checkout dari cart
2. Backend create order & call Midtrans API
3. Get snap_token & redirect_url dari Midtrans
4. Frontend redirect user ke Midtrans payment page
5. User complete payment di Midtrans
6. Midtrans send webhook notification ke backend
7. Backend update order status
8. User redirect ke success page

## 🚚 Shipping Flow

1. User select province & city
2. Calculate total weight dari cart items
3. Call RajaOngkir API untuk calculate cost
4. Show shipping options (courier, service, cost, ETA)
5. User pilih shipping service
6. Add shipping cost ke grand total
7. Save shipping info ke order

## 📊 Database Schema

### Users
- id, name, email, password, phone, role, status
- verification_token, reset_token, reset_token_expire

### Products
- id, category_id, name, slug, description, price, discount_price, stock, weight, image

### Orders
- id, user_id, order_number, total_price, shipping_cost, grand_total
- payment_method, payment_status, order_status
- midtrans_transaction_id, snap_token
- shipping_address, shipping_service, tracking_number

### Carts
- id, user_id, product_id, quantity

### Categories
- id, name, slug, description

Lihat file `backend/database.sql` untuk schema lengkap.

## 🧪 Testing

### Testing Payment (Sandbox)
Gunakan test cards dari Midtrans:
- Card Number: 4811 1111 1111 1114
- CVV: 123
- Exp: 01/25

### Testing RajaOngkir
- Origin: 501 (Tangerang)
- Destination: Pilih kota tujuan
- Courier: jne, pos, atau tiki

## 📱 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register user
GET    /api/auth/verify-email      - Verify email
POST   /api/auth/login             - Login
POST   /api/auth/forgot-password   - Request reset password
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/me                - Get current user (protected)
```

### Products
```
GET    /api/products               - Get all products (with filters)
GET    /api/products/categories    - Get all categories
GET    /api/products/:slug         - Get product detail
```

### Cart
```
GET    /api/cart                   - Get user cart (protected)
POST   /api/cart                   - Add to cart (protected)
PUT    /api/cart/:id               - Update cart item (protected)
DELETE /api/cart/:id               - Remove from cart (protected)
```

### Shipping
```
GET    /api/shipping/provinces     - Get provinces
GET    /api/shipping/cities        - Get cities
POST   /api/shipping/cost          - Calculate shipping cost
```

### Payment
```
POST   /api/payment/checkout       - Create order & get snap token (protected)
GET    /api/payment/orders         - Get user orders (protected)
GET    /api/payment/orders/:id     - Get order detail (protected)
POST   /api/payment/notification   - Midtrans webhook (public)
```

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Bootstrap grid system
- Custom CSS untuk branding
- Loading states
- Error handling
- Success notifications
- Real-time cart counter
- Product image placeholders

## 🔜 Future Improvements

- [ ] Admin dashboard
- [ ] Product reviews & ratings
- [ ] Wishlist
- [ ] Order cancellation
- [ ] Multiple addresses
- [ ] Promo codes & discounts
- [ ] Social media login
- [ ] Product image upload
- [ ] Advanced search filters
- [ ] Product recommendations
- [ ] Push notifications
- [ ] Live chat support

## 🐛 Known Issues

- reCAPTCHA v3 belum fully implemented (masih placeholder)
- Product image upload feature belum tersedia
- Order cancellation belum tersedia
- Return/refund process belum tersedia

## 📝 Notes

- Pastikan semua environment variables sudah di-set dengan benar
- Untuk production, ganti Midtrans ke production mode
- Untuk production, gunakan HTTPS
- Backup database secara rutin
- Monitor rate limiting logs untuk detect suspicious activities

## 👥 Team

UMKM Clothing Development Team

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

Untuk pertanyaan atau support, hubungi: support@umkmclothing.com

---

Made with ❤️ for Indonesian UMKM
#   c l o t h i n g - u m k m  
 
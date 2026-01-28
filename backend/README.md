# UMKM Clothing - Backend API

Backend API untuk aplikasi e-commerce UMKM Clothing menggunakan Node.js, Express.js, dan MySQL.

## 🚀 Features

- ✅ **Authentication System**
  - Register dengan email verification
  - Login dengan JWT
  - Forgot password & reset password
  - Rate limiting untuk anti spam
  - Validasi email domain
  
- 🛍️ **Product Management**
  - Browse produk dengan filter & search
  - Kategori produk
  - Detail produk
  
- 🛒 **Shopping Cart**
  - Add/Update/Remove items
  - Stock validation
  
- 🚚 **Shipping Integration (RajaOngkir)**
  - Cek ongkir real-time
  - Multiple courier options
  
- 💳 **Payment Gateway (Midtrans)**
  - Snap redirect payment
  - Webhook notification handler
  - Multiple payment methods

## 📋 Prerequisites

- Node.js v16 atau lebih baru
- MySQL 8.0 atau lebih baru
- NPM atau Yarn

## ⚙️ Installation

1. **Clone repository dan masuk ke folder backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   mysql -u root -p < database.sql
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Kemudian edit file `.env` dan isi dengan konfigurasi Anda:
   - Database credentials
   - JWT secrets
   - Email SMTP settings
   - Midtrans API keys
   - RajaOngkir API key

5. **Run server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

Server akan berjalan di `http://localhost:5000`

## 🔐 Authentication Flow

### Register
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "phone": "081234567890"
}
```

### Verify Email
```
GET /api/auth/verify-email?token=YOUR_TOKEN
```

### Login
```
POST /api/auth/login
Body: {
  "email": "john@gmail.com",
  "password": "password123"
}
```

### Forgot Password
```
POST /api/auth/forgot-password
Body: {
  "email": "john@gmail.com"
}
```

### Reset Password
```
POST /api/auth/reset-password
Body: {
  "token": "RESET_TOKEN",
  "newPassword": "newpassword123"
}
```

## 🛍️ Products API

### Get All Products
```
GET /api/products?category=kaos&search=polo&page=1&limit=12
```

### Get Product Detail
```
GET /api/products/:slug
```

### Get Categories
```
GET /api/products/categories
```

## 🛒 Cart API (Requires Auth)

### Get Cart
```
GET /api/cart
Headers: { Authorization: "Bearer YOUR_TOKEN" }
```

### Add to Cart
```
POST /api/cart
Headers: { Authorization: "Bearer YOUR_TOKEN" }
Body: {
  "product_id": 1,
  "quantity": 2
}
```

### Update Cart Item
```
PUT /api/cart/:id
Headers: { Authorization: "Bearer YOUR_TOKEN" }
Body: {
  "quantity": 3
}
```

### Remove from Cart
```
DELETE /api/cart/:id
Headers: { Authorization: "Bearer YOUR_TOKEN" }
```

## 🚚 Shipping API

### Get Provinces
```
GET /api/shipping/provinces
```

### Get Cities
```
GET /api/shipping/cities?province_id=1
```

### Calculate Shipping Cost
```
POST /api/shipping/cost
Body: {
  "origin": "501",
  "destination": "114",
  "weight": 1000,
  "courier": "jne"
}
```

## 💳 Payment API (Requires Auth)

### Checkout
```
POST /api/payment/checkout
Headers: { Authorization: "Bearer YOUR_TOKEN" }
Body: {
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_address": {
    "recipient_name": "John Doe",
    "phone": "081234567890",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "postal_code": "12345",
    "address_detail": "Jl. Sudirman No. 1"
  },
  "shipping_cost": 15000,
  "shipping_service": "JNE REG"
}

Response: {
  "success": true,
  "data": {
    "order_id": 1,
    "order_number": "ORDER-123456",
    "snap_token": "xxx",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/xxx"
  }
}
```

### Get User Orders
```
GET /api/payment/orders
Headers: { Authorization: "Bearer YOUR_TOKEN" }
```

### Get Order Detail
```
GET /api/payment/orders/:id
Headers: { Authorization: "Bearer YOUR_TOKEN" }
```

## 🔒 Security Features

1. **Rate Limiting**
   - Register: 3 attempts per hour per IP
   - Login: 5 attempts per 15 minutes
   - Forgot Password: 3 requests per hour

2. **Email Validation**
   - Hanya domain tertentu yang diizinkan (@gmail.com, @yahoo.com, dll)

3. **Password Security**
   - Hashed dengan bcrypt
   - Minimal 6 karakter

4. **JWT Tokens**
   - Access token: 30 menit
   - Refresh token: 7 hari

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── productController.js # Product logic
│   ├── cartController.js    # Cart logic
│   ├── shippingController.js# Shipping logic
│   └── paymentController.js # Payment logic
├── middleware/
│   ├── auth.js              # JWT verification
│   └── rateLimiter.js       # Rate limiting
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── shippingRoutes.js
│   └── paymentRoutes.js
├── utils/
│   └── emailService.js      # Email service
├── database.sql             # Database schema
├── server.js                # Entry point
├── .env.example             # Environment template
└── package.json
```

## 🌐 API Documentation

Base URL: `http://localhost:5000`

All protected routes require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `.env` file

## 🔗 External APIs

- **Midtrans**: https://midtrans.com
- **RajaOngkir**: https://rajaongkir.com

## 📝 Notes

- Pastikan MySQL service sudah running
- Untuk testing Midtrans, gunakan sandbox mode
- Untuk RajaOngkir, gunakan starter account (gratis)

## 🐛 Troubleshooting

1. **Database connection failed**
   - Check MySQL credentials di `.env`
   - Pastikan MySQL service running

2. **Email tidak terkirim**
   - Check SMTP settings
   - Pastikan App Password Gmail benar

3. **Midtrans error**
   - Check server key dan client key
   - Pastikan mode (sandbox/production) sesuai

## 👨‍💻 Author

UMKM Clothing Team

## 📄 License

ISC

# 🚀 Setup Instructions - UMKM Clothing

Panduan lengkap untuk setup dan menjalankan aplikasi UMKM Clothing.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [External Services Setup](#external-services-setup)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Pastikan Anda sudah install:
- ✅ Node.js v16+ ([Download](https://nodejs.org/))
- ✅ MySQL 8.0+ ([Download](https://dev.mysql.com/downloads/))
- ✅ Git ([Download](https://git-scm.com/))
- ✅ Code Editor (VS Code recommended)

---

## Database Setup

### 1. Start MySQL Server
```bash
# Windows
net start MySQL80

# macOS (Homebrew)
brew services start mysql

# Linux
sudo systemctl start mysql
```

### 2. Login ke MySQL
```bash
mysql -u root -p
```

### 3. Create Database
```sql
CREATE DATABASE umkm_clothing;
exit;
```

### 4. Import Schema
```bash
mysql -u root -p umkm_clothing < backend/database.sql
```

### 5. Verify Database
```bash
mysql -u root -p
USE umkm_clothing;
SHOW TABLES;
```

Anda harus melihat tables: users, products, categories, orders, carts, dll.

---

## Backend Setup

### 1. Navigate to Backend Folder
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

### 4. Edit .env File
Buka file `.env` dan isi dengan konfigurasi Anda:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=umkm_clothing

# JWT (Generate random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=30m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRE=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@umkmclothing.com

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Midtrans (Sandbox)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false

# RajaOngkir
RAJAONGKIR_API_KEY=your_rajaongkir_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=3
```

### 5. Generate JWT Secret
```bash
# Di terminal, run command ini untuk generate random string:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output dan paste ke `JWT_SECRET` dan `JWT_REFRESH_SECRET`

### 6. Run Backend Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

✅ Backend server akan berjalan di `http://localhost:5000`

### 7. Test Backend
Buka browser atau Postman:
```
GET http://localhost:5000
```

Response:
```json
{
  "success": true,
  "message": "UMKM Clothing API is running!",
  "version": "1.0.0"
}
```

---

## Frontend Setup

### 1. Navigate to Frontend Folder
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

### 4. Edit .env File
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Run Frontend Server
```bash
npm run dev
```

✅ Frontend akan berjalan di `http://localhost:5173`

### 6. Test Frontend
Buka browser: `http://localhost:5173`

Anda akan melihat homepage UMKM Clothing.

---

## External Services Setup

### 1. Gmail SMTP Setup

**Cara mendapatkan Gmail App Password:**

1. Login ke Google Account: https://myaccount.google.com/
2. Pilih **Security**
3. Enable **2-Step Verification**
4. Setelah enable 2FA, cari **App passwords**
5. Generate new app password untuk "Mail"
6. Copy password yang di-generate
7. Paste ke `EMAIL_PASSWORD` di `.env`

**Notes:**
- Jangan gunakan password Gmail biasa
- App password hanya bisa di-generate jika 2FA sudah aktif

---

### 2. Midtrans Setup (Payment Gateway)

**Cara mendapatkan Midtrans API Keys:**

1. Register di: https://midtrans.com/
2. Pilih **Sandbox** mode untuk testing
3. Login ke dashboard: https://dashboard.sandbox.midtrans.com/
4. Go to **Settings** → **Access Keys**
5. Copy:
   - **Server Key** → `MIDTRANS_SERVER_KEY`
   - **Client Key** → `MIDTRANS_CLIENT_KEY`
6. Untuk production, register merchant account dan ubah `MIDTRANS_IS_PRODUCTION=true`

**Test Cards (Sandbox):**
```
Card Number: 4811 1111 1111 1114
CVV: 123
Exp: 01/25
OTP/3DS: 112233
```

**Webhook Configuration:**
- Notification URL: `https://your-domain.com/api/payment/notification`
- Finish URL: `https://your-domain.com/order/success`
- Error URL: `https://your-domain.com/order/failed`

---

### 3. RajaOngkir Setup (Shipping)

**Cara mendapatkan RajaOngkir API Key:**

1. Register di: https://rajaongkir.com/
2. Pilih paket **Starter** (GRATIS)
3. Verifikasi email
4. Login ke dashboard
5. Go to **Akun** → **API Key**
6. Copy API Key → `RAJAONGKIR_API_KEY`

**Paket Starter Features:**
- ✅ 1000 requests/hari
- ✅ 3 kurir (JNE, POS, TIKI)
- ✅ Province & City data
- ✅ Cost calculation

---

### 4. reCAPTCHA v3 Setup (Optional)

**Untuk production, tambahkan reCAPTCHA v3:**

1. Register di: https://www.google.com/recaptcha/admin
2. Pilih reCAPTCHA v3
3. Add domain: `localhost` untuk testing
4. Get Site Key & Secret Key
5. Integrate di frontend register page

**Frontend Integration:**
```html
<!-- Add to index.html -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

```javascript
// Register.jsx
const getRecaptchaToken = async () => {
  return new Promise((resolve) => {
    grecaptcha.ready(() => {
      grecaptcha.execute('YOUR_SITE_KEY', {action: 'register'})
        .then(token => resolve(token));
    });
  });
};
```

---

## Testing

### 1. Test User Registration

1. Buka `http://localhost:5173/register`
2. Isi form registrasi dengan email valid
3. Submit form
4. Check email untuk verification link
5. Click verification link
6. Account akan verified

### 2. Test Login

1. Buka `http://localhost:5173/login`
2. Login dengan email & password yang sudah verified
3. Anda akan redirect ke homepage
4. Check navbar, nama user muncul

### 3. Test Shopping Flow

1. Browse products di `http://localhost:5173/products`
2. Click "Detail" pada produk
3. Add to cart
4. Go to cart
5. Isi alamat pengiriman
6. Calculate shipping cost
7. Pilih shipping service
8. Click "Checkout"
9. Anda akan redirect ke Midtrans payment page
10. Complete payment dengan test card
11. Check order history

### 4. Test Forgot Password

1. Click "Lupa password?" di login page
2. Masukkan email
3. Check email untuk reset link
4. Click reset link
5. Set password baru
6. Login dengan password baru

---

## Troubleshooting

### Problem: Backend tidak bisa connect ke database

**Solution:**
```bash
# Check MySQL service
# Windows
net start MySQL80

# Mac/Linux
sudo systemctl status mysql

# Check credentials di .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_correct_password
DB_NAME=umkm_clothing
```

---

### Problem: Email tidak terkirim

**Solution:**
1. Check Gmail App Password sudah benar
2. Check 2FA sudah aktif
3. Pastikan "Less secure apps" di-allow (deprecated)
4. Gunakan App Password, bukan password biasa

**Test Email Service:**
```bash
# Di backend folder
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_app_password'
  }
});
transporter.verify().then(console.log).catch(console.error);
"
```

---

### Problem: CORS Error

**Solution:**
Check backend `server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true
}));
```

---

### Problem: JWT Token Expired

**Solution:**
- Ini normal behavior
- Token expire setelah 30 menit
- User harus login lagi
- Untuk extend, ubah `JWT_EXPIRE` di `.env`

---

### Problem: Midtrans Payment Gagal

**Solution:**
1. Pastikan menggunakan Sandbox mode
2. Check Server Key & Client Key sudah benar
3. Gunakan test card yang valid
4. Check webhook URL di Midtrans dashboard

**Test Midtrans Connection:**
```bash
curl -X GET https://api.sandbox.midtrans.com/v2/heartbeat \
  -H "Authorization: Basic $(echo -n 'YOUR_SERVER_KEY:' | base64)"
```

---

### Problem: RajaOngkir API Error

**Solution:**
1. Check API Key sudah benar
2. Check quota belum habis (1000 req/day)
3. Pastikan menggunakan Starter endpoint
4. Check origin city ID valid

**Test RajaOngkir:**
```bash
curl -X GET https://api.rajaongkir.com/starter/province \
  -H "key: YOUR_API_KEY"
```

---

### Problem: Port sudah digunakan

**Solution:**
```bash
# Kill process di port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Atau ubah PORT di .env
PORT=5001
```

---

### Problem: npm install error

**Solution:**
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Install ulang
npm install
```

---

## Production Deployment

### 1. Build Frontend
```bash
cd frontend
npm run build
```

### 2. Deploy Backend
- Deploy ke VPS (DigitalOcean, AWS, dll)
- Setup PM2 untuk process manager
- Setup Nginx sebagai reverse proxy
- Setup SSL certificate (Let's Encrypt)

### 3. Deploy Frontend
- Deploy build folder ke Netlify/Vercel/Cloudflare Pages
- Atau serve dengan Nginx di VPS yang sama

### 4. Environment Variables Production
- Ubah semua URL ke production URL
- Ubah Midtrans ke production mode
- Setup database backup
- Enable HTTPS

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Midtrans Documentation](https://docs.midtrans.com)
- [RajaOngkir Documentation](https://rajaongkir.com/dokumentasi)

---

## Support

Jika mengalami masalah:
1. Check dokumentasi di README.md
2. Check console logs (backend & frontend)
3. Check MySQL error logs
4. Contact: support@umkmclothing.com

---

**Happy Coding! 🚀**

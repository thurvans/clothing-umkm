# API Documentation - UMKM Clothing

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "password123",
  "phone": "081234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registrasi berhasil! Silakan cek email Anda untuk verifikasi akun.",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@gmail.com"
  }
}
```

---

### 2. Verify Email
**GET** `/auth/verify-email?token={verification_token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Email berhasil diverifikasi! Silakan login.",
  "data": {
    "name": "John Doe",
    "email": "john@gmail.com"
  }
}
```

---

### 3. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@gmail.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login berhasil!",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@gmail.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Forgot Password
**POST** `/auth/forgot-password`

**Body:**
```json
{
  "email": "john@gmail.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Link reset password telah dikirim ke email Anda."
}
```

---

### 5. Reset Password
**POST** `/auth/reset-password`

**Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil direset! Silakan login dengan password baru."
}
```

---

### 6. Get Current User
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@gmail.com",
    "phone": "081234567890",
    "role": "customer",
    "status": "verified",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🛍️ Product Endpoints

### 1. Get All Products
**GET** `/products?category={slug}&search={keyword}&page={1}&limit={12}`

**Query Parameters:**
- `category` (optional): Category slug (kaos, kemeja, celana, jaket)
- `search` (optional): Search keyword
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "category_id": 1,
      "name": "Kaos Polos Premium",
      "slug": "kaos-polos-premium",
      "description": "Kaos polos berkualitas tinggi",
      "price": 150000,
      "discount_price": 120000,
      "stock": 50,
      "weight": 200,
      "image": "image_url.jpg",
      "status": "active",
      "category_name": "Kaos"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 2. Get Product by Slug
**GET** `/products/{slug}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category_id": 1,
    "name": "Kaos Polos Premium",
    "slug": "kaos-polos-premium",
    "description": "Kaos polos berkualitas tinggi dengan bahan cotton combed 30s",
    "price": 150000,
    "discount_price": 120000,
    "stock": 50,
    "weight": 200,
    "image": "main_image.jpg",
    "status": "active",
    "category_name": "Kaos",
    "category_slug": "kaos",
    "images": [
      "image1.jpg",
      "image2.jpg",
      "image3.jpg"
    ]
  }
}
```

---

### 3. Get All Categories
**GET** `/products/categories`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kaos",
      "slug": "kaos",
      "description": "Koleksi kaos berkualitas",
      "image": "category_image.jpg"
    },
    {
      "id": 2,
      "name": "Kemeja",
      "slug": "kemeja",
      "description": "Koleksi kemeja casual dan formal",
      "image": "category_image.jpg"
    }
  ]
}
```

---

## 🛒 Cart Endpoints (Protected)

**All cart endpoints require authentication header:**
```
Authorization: Bearer {jwt_token}
```

### 1. Get User Cart
**GET** `/cart`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "name": "Kaos Polos Premium",
        "price": 150000,
        "discount_price": 120000,
        "quantity": 2,
        "stock": 50,
        "image": "image.jpg",
        "weight": 200,
        "subtotal": 240000
      }
    ],
    "summary": {
      "totalItems": 2,
      "totalPrice": 240000,
      "totalWeight": 400
    }
  }
}
```

---

### 2. Add to Cart
**POST** `/cart`

**Body:**
```json
{
  "product_id": 1,
  "quantity": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Produk berhasil ditambahkan ke keranjang."
}
```

---

### 3. Update Cart Item
**PUT** `/cart/{cart_id}`

**Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Keranjang berhasil diupdate."
}
```

---

### 4. Remove from Cart
**DELETE** `/cart/{cart_id}`

**Response (200):**
```json
{
  "success": true,
  "message": "Item berhasil dihapus dari keranjang."
}
```

---

### 5. Clear Cart
**DELETE** `/cart`

**Response (200):**
```json
{
  "success": true,
  "message": "Keranjang berhasil dikosongkan."
}
```

---

## 🚚 Shipping Endpoints

### 1. Get Provinces
**GET** `/shipping/provinces`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "province_id": "1",
      "province": "Bali"
    },
    {
      "province_id": "2",
      "province": "Bangka Belitung"
    }
  ]
}
```

---

### 2. Get Cities
**GET** `/shipping/cities?province_id={province_id}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "city_id": "1",
      "province_id": "1",
      "province": "Bali",
      "type": "Kabupaten",
      "city_name": "Badung",
      "postal_code": "80351"
    }
  ]
}
```

---

### 3. Calculate Shipping Cost
**POST** `/shipping/cost`

**Body:**
```json
{
  "origin": "501",
  "destination": "114",
  "weight": 1000,
  "courier": "jne"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courier": "JNE",
    "options": [
      {
        "service": "REG",
        "description": "Layanan Reguler",
        "cost": 15000,
        "etd": "2-3",
        "note": ""
      },
      {
        "service": "YES",
        "description": "Yakin Esok Sampai",
        "cost": 25000,
        "etd": "1-1",
        "note": ""
      }
    ]
  }
}
```

---

## 💳 Payment Endpoints (Protected)

### 1. Checkout
**POST** `/payment/checkout`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "shipping_address": {
    "recipient_name": "John Doe",
    "phone": "081234567890",
    "province": "DKI Jakarta",
    "city": "Jakarta Selatan",
    "postal_code": "12345",
    "address_detail": "Jl. Sudirman No. 1, RT 01/RW 02"
  },
  "shipping_cost": 15000,
  "shipping_service": "JNE REG"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order berhasil dibuat!",
  "data": {
    "order_id": 1,
    "order_number": "ORDER-1704067200000-123",
    "snap_token": "66e4fa55-fdac-4ef9-91b5-733b97d1b862",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/66e4fa55-fdac-4ef9-91b5-733b97d1b862"
  }
}
```

**Usage:**
```javascript
// Redirect user to Midtrans payment page
window.location.href = response.data.data.redirect_url;
```

---

### 2. Get User Orders
**GET** `/payment/orders?page={1}&limit={10}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "order_number": "ORDER-1704067200000-123",
      "total_price": 240000,
      "shipping_cost": 15000,
      "grand_total": 255000,
      "payment_method": "credit_card",
      "payment_status": "PAID",
      "order_status": "PROCESSING",
      "midtrans_transaction_id": "abc123",
      "snap_token": "token123",
      "shipping_address": "...",
      "shipping_service": "JNE REG",
      "tracking_number": null,
      "notes": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Get Order Detail
**GET** `/payment/orders/{order_id}`

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "order_number": "ORDER-1704067200000-123",
    "total_price": 240000,
    "shipping_cost": 15000,
    "grand_total": 255000,
    "payment_method": "credit_card",
    "payment_status": "PAID",
    "order_status": "PROCESSING",
    "shipping_address": {
      "recipient_name": "John Doe",
      "phone": "081234567890",
      "province": "DKI Jakarta",
      "city": "Jakarta Selatan",
      "postal_code": "12345",
      "address_detail": "Jl. Sudirman No. 1"
    },
    "shipping_service": "JNE REG",
    "tracking_number": "JNE1234567890",
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "name": "Kaos Polos Premium",
        "quantity": 2,
        "price": 120000,
        "subtotal": 240000,
        "image": "image.jpg"
      }
    ],
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Midtrans Notification Webhook
**POST** `/payment/notification`

**Note:** Endpoint ini dipanggil oleh Midtrans, bukan dari frontend.

**Body (dari Midtrans):**
```json
{
  "order_id": "ORDER-1704067200000-123",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "transaction_id": "abc123",
  "payment_type": "credit_card",
  "gross_amount": "255000.00"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification processed"
}
```

---

## 📊 Status Values

### Payment Status
- `PENDING` - Menunggu pembayaran
- `PAID` - Sudah dibayar
- `FAILED` - Pembayaran gagal
- `EXPIRED` - Pembayaran kadaluarsa

### Order Status
- `PENDING` - Menunggu pembayaran
- `PROCESSING` - Sedang diproses
- `SHIPPED` - Sedang dikirim
- `DELIVERED` - Sudah diterima
- `CANCELLED` - Dibatalkan

### User Status
- `unverified` - Belum verifikasi email
- `verified` - Sudah verifikasi email
- `blocked` - Akun diblokir

### User Role
- `customer` - Pelanggan biasa
- `admin` - Administrator

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email sudah terdaftar."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token tidak valid."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Akun Anda belum diverifikasi."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Produk tidak ditemukan."
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Terlalu banyak percobaan registrasi. Silakan coba lagi nanti."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan saat registrasi."
}
```

---

## 🧪 Testing with Postman

1. Import collection ke Postman
2. Set environment variable:
   - `base_url`: http://localhost:5000/api
   - `token`: (akan otomatis di-set setelah login)
3. Test endpoints sesuai urutan flow
4. Save token dari login response untuk protected endpoints

---

## 📝 Notes

- Semua response menggunakan format JSON
- Protected endpoints memerlukan JWT token di header
- Rate limiting diterapkan pada endpoints tertentu (register, login, forgot password)
- Timestamp menggunakan format ISO 8601
- Currency dalam Rupiah (IDR)
- Weight dalam gram

---

**Last Updated:** 2024

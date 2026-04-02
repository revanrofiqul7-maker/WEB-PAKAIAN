# Supabase Integration Guide

## Status: ✅ SELESAI

Semua endpoint backend telah berhasil diintegrasikan dengan Supabase sebagai database utama.

---

## 📋 Ringkasan Perubahan

### Backend Updates

#### 1. **Environment Configuration** (`.env`)
```
PORT=5000
SUPABASE_URL=https://dbypllqjccsflhvklxaj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=rahasia_saya
JWT_REFRESH_SECRET=refresh_rahasia
```

#### 2. **Package Dependencies**
- ✅ Ditambahkan: `@supabase/supabase-js` (v2.39.0)
- ✅ Dihapus: `pg` (PostgreSQL driver tidak lagi digunakan)

#### 3. **New Supabase Module**
- File baru: `backend/src/db/supabase.js`
- Inisialisasi Supabase client untuk semua queries

#### 4. **Updated Routes** - Semua menggunakan Supabase:
- ✅ `src/routes/auth.js` - Register, Login, Token Refresh, Logout
- ✅ `src/routes/products.js` - CRUD Products dengan upload gambar
- ✅ `src/routes/categories.js` - CRUD Categories
- ✅ `src/routes/users.js` - CRUD Users
- ✅ `src/routes/transactions.js` - CRUD Transactions

#### 5. **Updated Middleware**
- ✅ `src/middleware/authorization.js` - Menggunakan Supabase untuk validasi kategori

### Frontend Updates

#### 6. **Supabase Configuration**
- File: `login-dashboard/src/utils/supabase.js`
- URL dan API Key sudah dikonfigurasi dengan benar

---

## 🔧 Setup Instructions

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

Ini akan menginstall `@supabase/supabase-js` otomatis.

### Step 2: Setup Supabase Database

Pastikan Supabase project Anda memiliki tabel-tabel berikut dengan SQL:

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  membership TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id INTEGER,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  cashier_by INTEGER,
  discount_applied DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- Tokens Table (untuk refresh token)
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 3: Run Backend Server
```bash
npm start
# atau
npm run dev  # untuk development dengan nodemon
```

Server akan berjalan di `http://localhost:5000`

### Step 4: Verify Endpoints
Buka `http://localhost:5000/api-docs` untuk Swagger documentation semua endpoint.

---

## 📝 API Endpoints Sumaray

### Authentication (`/api/auth`)
- `POST /register` - Register user baru
- `POST /login` - Login dan dapatkan access token + refresh token
- `POST /token` - Refresh access token
- `POST /logout` - Logout user

### Products (`/api/products`)
- `GET /` - Ambil semua produk
- `GET /:id` - Ambil produk by ID
- `POST /` - Tambah produk baru (Admin only, support upload gambar)
- `PUT /:id` - Update produk (Admin only)
- `DELETE /:id` - Hapus produk (Admin only)

### Categories (`/api/categories`)
- `GET /` - Ambil semua kategori (Admin only)
- `GET /:id` - Ambil kategori by ID (Admin only)
- `POST /` - Tambah kategori baru (Admin only)
- `PUT /:id` - Update kategori (Admin only)
- `DELETE /:id` - Hapus kategori (Admin only, validasi tidak dipakai produk)

### Users (`/api/users`)
- `GET /` - Ambil semua user (Admin only)
- `GET /profile` - Ambil profil user login
- `POST /` - Tambah user baru (Admin only)
- `PUT /:id` - Update user (Admin only)
- `PUT /:id/deactivate` - Nonaktifkan user (Admin only)
- `DELETE /:id` - Hapus user (Admin only)

### Transactions (`/api/transactions`)
- `GET /` - Ambil semua transaksi (Admin only)
- `GET /:id` - Ambil transaksi by ID
- `POST /` - Buat transaksi baru (Customer only)

---

## 🔐 Security Notes

1. **API Key**: Saat ini menggunakan Anon Key. Untuk production, pertimbangkan menggunakan Service Role Key dengan Row Level Security (RLS).

2. **Refresh Token**: Disimpan di Supabase `tokens` table dengan expiry date.

3. **Password**: Di-hash menggunakan bcrypt sebelum disimpan.

4. **Role-based Access**: Authorization middleware melindungi endpoint spesifik (admin, customer, cashier).

---

## 🧪 Testing

### Test Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123","name":"Test User"}'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### Test Protected Endpoint
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ⚠️ Common Issues & Solutions

### Issue: "SUPABASE_URL or SUPABASE_KEY is missing"
**Solution:** Pastikan `.env` file di folder `backend` memiliki SUPABASE_URL dan SUPABASE_KEY.

### Issue: "Invalid token" di setiap request
**Solution:** Pastikan JWT_SECRET dan JWT_REFRESH_SECRET di `.env` sama dengan yang digunakan untuk generate token.

### Issue: CORS errors
**Solution:** Backend sudah setup CORS. Pastikan frontend mengirim request ke `http://localhost:5000/api/...`

### Issue: File upload tidak bekerja
**Solution:** Pastikan folder `backend/public/uploads` ada dan writable. Buat jika belum:
```bash
mkdir -p backend/public/uploads
```

---

## 📚 Dokumentasi Lengkap

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **JWT Auth**: https://en.wikipedia.org/wiki/JSON_Web_Token

---

## ✨ Features

✅ Complete Supabase integration
✅ JWT-based authentication
✅ Refresh token mechanism
✅ Role-based access control (RBAC)
✅ File upload for products
✅ Swagger API documentation
✅ Error handling
✅ CORS enabled

---

**Last Updated:** 2026-03-31

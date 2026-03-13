# Web Toko Pakaian - Login & Dashboard

Aplikasi web modern untuk toko pakaian dengan fitur login dan dashboard admin.

## 📋 Struktur File

```
login-dashboard/
├── public/
│   └── index.html              # File HTML utama
├── src/
│   ├── pages/
│   │   ├── login.jsx           # Halaman login
│   │   ├── login.css           # Styling login
│   │   ├── dashboard.jsx       # Halaman dashboard
│   │   └── dashboard.css       # Styling dashboard
│   ├── styles/
│   │   └── global.css          # Style global
│   ├── app.jsx                 # Komponen utama dengan routing
│   └── index.jsx               # Entry point React
├── package.json                # Konfigurasi project
└── README.md                   # File ini
```

## ✨ Fitur Utama

### 🔐 Halaman Login
- Form login dengan email dan password
- Validasi input
- Demo akun untuk testing
- UI modern dengan gradient color
- Notifikasi error

**Demo Login:**
- Email: `demo@toko.com`
- Password: `demo123`

### 📊 Dashboard
Dashboard terdiri dari beberapa menu:

1. **Ringkasan (Overview)**
   - Statistik penjualan
   - Total produk
   - Total stok
   - Aktivitas terbaru

2. **Produk**
   - Daftar semua produk
   - Tampilan grid card
   - Info harga dan stok
   - Tombol edit dan hapus

3. **Pesanan**
   - Tabel pesanan
   - Status pesanan (Menunggu, Dikirim, Selesai)
   - Detail pelanggan
   - Total pembayaran

4. **Pengaturan**
   - Profil toko
   - Data kontak
   - Informasi bisnis

## 🚀 Cara Menjalankan

### 1. Instalasi Dependencies
```bash
npm install
```

### 2. Menjalankan Project
```bash
npm start
```

Aplikasi akan terbuka di `http://localhost:3000`

### 3. Build Production
```bash
npm run build
```

## 🎨 Teknologi yang Digunakan

- **React 18.2** - Library frontend
- **React Router v6** - Navigasi & routing
- **CSS3** - Styling & animasi
- **LocalStorage** - Penyimpanan data user

## 📱 Responsive Design

Aplikasi dioptimalkan untuk:
- 🖥️ Desktop
- 💻 Tablet
- 📱 Mobile

## 🔐 Keamanan (Simulasi)

Fitur keamanan yang diimplementasikan:
- Validasi email format
- Validasi password minimal 6 karakter
- Data user disimpan di localStorage
- Proteksi halaman dashboard (cek login status)
- Fitur logout

## 📦 Produk Default

Beberapa produk dummy untuk demo:
- Kemeja Kasual - Rp 150.000
- Dress Wanita - Rp 250.000
- Jaket Denim - Rp 350.000
- T-Shirt Premium - Rp 100.000
- Celana Jeans - Rp 200.000
- Blouse Cantik - Rp 180.000

## 🎯 Catatan Pengembangan

Fitur yang dapat dikembangkan lebih lanjut:
- Backend API integration
- Database real (MongoDB, PostgreSQL, dll)
- Sistem pembayaran
- Email verification
- Authentication JWT
- Upload produk image (frontend now allows file selection or URL; backend needs multer and '/uploads' static folder)
- Rating dan review pelanggan
- Wishlist
- Shopping cart
- Order tracking real-time

## 📝 Lisensi

Proyek ini bebas untuk digunakan dan dikembangkan.

---

Dibuat dengan ❤️ untuk SMT 2 WEB-PAKAIAN

# Auto-Refresh Token Implementation

## Ringkasan
Implementasi ini memungkinkan admin (dan pengguna lain) tetap login tanpa perlu re-login ketika token akses/JWT mereka kadaluarsa. Sistem akan secara otomatis menyegarkan token menggunakan refresh token.

## Komponen yang Diubah

### 1. **AuthContext.jsx** (Frontend)
- Menambah state `refreshToken` untuk menyimpan refresh token
- Menambah method `refreshAccessToken()` yang:
  - Mengambil refresh token dari localStorage
  - Mengirim ke backend endpoint `/api/auth/token`
  - Menyimpan access token baru ke localStorage dan state
  - Logout jika refresh gagal (refresh token expired atau tidak valid)
- Update method `login()` untuk menerima dan menyimpan `refreshToken`

### 2. **api.js** (API Utility Baru)
File baru di `src/utils/api.js` untuk menangani:

**Fungsi Utama:**
- `apiCall()` - Wrapper untuk fetch dengan auto-refresh
  - Jika dapat response 403 (token invalid), secara otomatis:
    - Memanggil `refreshAccessToken()` dari AuthContext
    - Retry request dengan token baru
    - Jika refresh gagal, user logout otomatis

- `apiFormData()` - Special handler untuk upload file (FormData)
  - Untuk product/image uploads yang tidak bisa dengan JSON
  - Juga mendukung auto-refresh

**Helper Functions:**
- `apiGet(endpoint)` - GET request
- `apiPost(endpoint, data)` - POST request  
- `apiPut(endpoint, data)` - PUT request
- `apiDelete(endpoint)` - DELETE request

### 3. **app.jsx** 
- Inisialisasi API context di `AppRoutes` component
- Memastikan authContext tersedia untuk API utility

### 4. **login.jsx**
- Update untuk menyimpan `refreshToken` dari response
- Auto-redirect ke dashboard setelah login berhasil

### 5. **dashboard.jsx**
- Update semua API calls untuk menggunakan API helpers (`apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiFormData`)
- Menghapus kebutuhan untuk pass manual `token` dan `Authorization` header
- Mencakup:
  - `fetchProducts()`, `fetchCategories()`, `fetchUsers()`
  - Product CRUD: create, update, delete (dengan file upload)
  - Category CRUD: create, update, delete
  - User CRUD: create, update, delete, deactivate

## Alur Kerja

### Scenario: Token Expired saat Admin Bekerja

1. Admin login → Backend return `accessToken` (15 menit) + `refreshToken` (7 hari)
2. Frontend simpan keduanya
3. Admin akses API dengan accessToken
4. Setelah 15 menit, accessToken expired
5. Saat admin melakukan aksi (cek produk, dll):
   - Request dengan expired token → backend return 403
   - API utility mendeteksi 403
   - Auto-call `refreshAccessToken()`
   - Kirim refreshToken ke `/api/auth/token`
   - Dapat accessToken baru
   - **Retry original request dengan token baru**
   - Admin bisa terus bekerja **tanpa perlu login ulang**
6. Jika refreshToken juga expired (7 hari), baru force logout

## Keuntungan

✅ **Admin/User tidak perlu login ulang** - Selama refresh token belum expired (7 hari)
✅ **Seamless experience** - Request otomatis retry, user tidak perlu tahu
✅ **Lebih aman** - Access token yang short-lived (15 menit)
✅ **Scalable** - Refresh token disimpan di database, bisa di-revoke dari backend

## Testing

1. Login sebagai admin
2. Tunggu ~15 menit atau manual set token expiry ke waktu lampau di backend
3. Coba buat kategori/produk baru
4. Seharusnya request berhasil (token auto-refresh di background)
5. Jangan keluar halaman → should continue working

## Catatan Penting

- **Refresh Token Security**: 
  - Saat ini disimpan di localStorage (bisa akses via JavaScript)
  - Untuk production, pertimbangkan:
    - Simpan di secure HttpOnly cookie
    - Endpoint terpisah untuk refresh token (bukan dari fetch JS)

- **Backend Requirement**:
  - Pastikan `/api/auth/token` endpoint sudah working (sudah ada di codebase)
  - Pastikan response login include `refreshToken` field

- **Browser Console**:
  - Buka developer tools → Network tab
  - Bisa lihat request yang auto-retry ketika token expired

## File yang Ditambah/Diubah

### Ditambah:
- `src/utils/api.js` - API utility dengan auto-refresh

### Diubah:
- `src/context/AuthContext.jsx` - Add refresh token management
- `src/app.jsx` - Initialize API context
- `src/pages/login.jsx` - Save refresh token saat login
- `src/pages/dashboard.jsx` - Use new API helpers di semua API calls

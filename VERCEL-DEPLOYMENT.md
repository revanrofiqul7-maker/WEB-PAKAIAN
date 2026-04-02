# Panduan Deploy ke Vercel - Frontend (login-dashboard)

## ✅ Prerequisite
- [x] Git repository sudah ada
- [ ] GitHub account terhubung
- [ ] Vercel account sudah ada
- [ ] Project sudah di-push ke GitHub

## 📋 Langkah-Langkah Deployment

### 1. Push Project ke GitHub
```bash
# Jika belum di-push, jalankan ini di root project:
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
# (ganti 'main' dengan branch Anda jika berbeda)
```

### 2. Setup Environment Variables
Jika frontend Anda menggunakan environment variables, buat file `.env.local` di folder `login-dashboard/`:

```
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Deploy ke Vercel (2 Pilihan)

#### **Option A: Menggunakan Vercel Web Dashboard (Recommended)**
1. Buka https://vercel.com/new
2. Pilih "Import Project"
3. Hubungkan dengan GitHub account Anda
4. Pilih repository `WEB-PAKAIAN`
5. Pada "Root Directory", pilih `./login-dashboard`
6. Set Environment Variables:
   - Masukkan semua variabel dari `.env.local`
7. Klik "Deploy"

#### **Option B: Menggunakan Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Pindah ke folder login-dashboard
cd login-dashboard

# Login ke Vercel
vercel login

# Deploy
vercel
# Follow prompts:
# - Link to existing project? → No (first time)
# - Project name → web-pakaian-frontend
# - Which scope? → Your account
# - Detected framework? → Create React App
# - Build command? → (default)
# - Output directory? → build
```

### 4. Konfigurasi Tambahan (Optional)

Jika ingin custom domain, setup di Vercel dashboard:
- Settings → Domains
- Tambahkan custom domain Anda

### 5. Environment Variables di Vercel
Untuk menambah/ubah environment variables setelah deployment:
1. Buka project di Vercel dashboard
2. Settings → Environment Variables
3. Tambahkan/edit sesuai kebutuhan
4. Automatic redeploy akan terjadi

## 🔗 Links
- Vercel Dashboard: https://vercel.com/dashboard
- Project akan auto-redeploy setiap kali ada push ke GitHub

## ⚠️ Important Notes
- Pastikan backend API dapat diakses dari frontend (CORS sudah dikonfigurasi)
- Jika ada asset static, pastikan sudah di folder `public/`
- Build akan gagal jika ada dependencies yang belum diinstall

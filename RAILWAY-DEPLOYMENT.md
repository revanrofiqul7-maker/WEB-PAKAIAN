# Panduan Deploy Backend ke Railway

## ✅ Prerequisites

- [x] GitHub repository sudah ada
- [ ] Railway account (https://railway.app)
- [ ] GitHub account terhubung dengan Railway

## 📋 Environment Variables yang Diperlukan

Siapkan variabel ini sesuai dengan konfigurasi Anda:

```
# Database - PostgreSQL
PGUSER=your_postgres_user
PGHOST=your_postgres_host
PGDATABASE=your_postgres_database
PGPASSWORD=your_postgres_password
PGPORT=5432

# atau jika menggunakan Supabase PostgreSQL:
PGHOST=db.xxxxx.supabase.co
PGUSER=postgres
PGPASSWORD=your_supabase_password
PGDATABASE=postgres
PGPORT=5432

# Supabase (jika digunakan)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_anon_key

# Environment
NODE_ENV=production
```

## 🚀 Langkah-Langkah Deployment

### Step 1: Push ke GitHub (jika belum)

```bash
cd backend
git add .
git commit -m "Prepare backend for Railway deployment"
git push origin main
```

### Step 2: Deploy via Railway Dashboard (Recommended)

1. **Buka** https://railway.app dan login dengan GitHub
2. **Klik** "New Project" → "Deploy from GitHub repo"
3. **Pilih** repository `WEB-PAKAIAN`
4. **Pilih** `backend` folder sebagai root directory
   - Atau biar Railway auto-detect
5. **Configure Environment Variables:**
   - Klik "Add Variables" atau "Environment"
   - Masukkan semua variabel dari `.env.example`
   - Pastikan PGHOST, PGUSER, PGPASSWORD sudah benar

### Step 3: Build & Deploy

Railway akan:
1. Auto-generate domain untuk backend Anda
2. Menjalankan `npm start` secara otomatis (dari package.json)
3. Restart otomatis setiap ada push ke GitHub

### Step 4: Update Frontend API URL

Setelah backend di-deploy, update `REACT_APP_API_URL` di Vercel:

1. Buka Vercel dashboard → Project Settings
2. Environment Variables
3. Update `REACT_APP_API_URL` dengan URL dari Railway:
   ```
   REACT_APP_API_URL=https://your-railway-app.up.railway.app
   ```

## 🔗 Mendapatkan URL Backend di Railway

Setelah deployment:
1. Buka project di Railway dashboard
2. Klik tab "Deployments" atau "Settings"
3. Cari "Domains" - akan ada URL seperti:
   ```
   https://your-service-xxxxx.up.railway.app
   ```
4. Gunakan URL ini di frontend Anda

## 🗄️ Connect Database di Railway

Railway menyediakan PostgreSQL terintegrasi:

### Option A: Menggunakan PostgreSQL Plugin Railway (Recommended)
1. Di Railway project, klik "Add Service"
2. Pilih "PostgreSQL"
3. Railway akan auto-generate environment variables:
   - PGHOST
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
   - PGPORT

### Option B: Menggunakan External Database (Supabase/Custom)
- Masukkan environment variables manual
- Pastikan database credentials benar

## 🔧 Troubleshooting

### Build Error "npm ERR! ERR!"
- Pastikan `package.json` di folder `backend/` memiliki script `"start"`
- Check file ada dan dependencies installed

### Connection Timeout ke Database
- Pastikan PGHOST, PGUSER, PGPASSWORD sudah benar
- Jika menggunakan external database, pastikan IP Railway di-whitelist
- Railway IPs biasanya di-allow otomatis untuk Supabase

### Port Error
- Railway akan provide PORT via environment variable
- Backend sudah updated untuk menggunakan `process.env.PORT || 5000`

### Deployment Gagal
- Cek logs di Railway dashboard
- Pastikan Node.js version compatible
- Pastikan semua dependencies di package.json

## 📚 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- API Docs: `https://your-railway-app.up.railway.app/api-docs`
- Railway Docs: https://docs.railway.app

## 🔄 Auto-Deploy Setup

Railway sudah setup untuk auto-deploy:
- Setiap push ke GitHub main branch → automatic redeploy
- Logs bisa dilihat real-time di dashboard

## 💡 Tips

1. **Jika ingin custom domain:**
   - Settings → Domains → Add Custom Domain
   - Setup DNS records sesuai Railway instructions

2. **Environment Variables:**
   - Add/edit di Railway dashboard
   - Automatic redeploy akan triggered

3. **Monitoring:**
   - Railway dashboard menampilkan CPU, Memory usage
   - Logs tersedia untuk debugging

4. **Restart Service:**
   - Klik "Restart" di Railway dashboard jika perlu

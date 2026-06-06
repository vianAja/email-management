# Gmail Manager

Dashboard email management berbasis `React + Vite` untuk frontend dan Gmail API untuk backend.

Repo ini sekarang sudah disiapkan untuk:

- local development dengan `ReactJS + Node`
- deployment frontend `ReactJS` ke Vercel
- backend API via Vercel Functions di folder `api/`

## Arsitektur

- `src/`: frontend React
- `api/`: endpoint backend untuk Vercel
- `lib/api-handlers.js`: shared auth + Gmail logic
- `server.js`: adapter Express untuk local dev
- `vercel.json`: konfigurasi deploy Vercel

## Kenapa Struktur Ini Cocok untuk Vercel

Vercel sangat cocok untuk frontend React statis hasil build Vite. Untuk backend, Vercel menjalankan file di folder `api/` sebagai Functions.

Karena Vercel bersifat serverless, session auth tidak boleh bergantung pada memory proses. Project ini sekarang memakai signed cookie untuk menyimpan state auth secara stateless, sehingga lebih cocok untuk deploy di Vercel.

## Environment Variables

Gunakan `.env.example` sebagai template. Variable yang perlu Anda isi:

```env
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
SESSION_SECRET=
APP_BASE_URL=
REDIRECT_URL=
```

Arti masing-masing:

- `GOOGLE_OAUTH_CLIENT_ID`: OAuth client ID dari Google Cloud
- `GOOGLE_OAUTH_CLIENT_SECRET`: OAuth client secret dari Google Cloud
- `SESSION_SECRET`: secret panjang acak untuk signing cookie session
- `APP_BASE_URL`: URL frontend utama aplikasi
- `REDIRECT_URL`: callback Google OAuth

## Setting untuk Local

```env
APP_BASE_URL=http://localhost:5173
REDIRECT_URL=http://localhost:5173/api/auth/callback
PORT=3100
VITE_BACKEND_URL=http://localhost:3100
VITE_PORT=5173
```

## Setting untuk Vercel

Saat nanti Anda membuat project di Vercel, isi environment variables ini di Project Settings:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `SESSION_SECRET`
- `APP_BASE_URL`
- `REDIRECT_URL`

Contoh production:

```env
APP_BASE_URL=https://your-app.vercel.app
REDIRECT_URL=https://your-app.vercel.app/api/auth/callback
```

## Catatan Penting untuk Google OAuth di Vercel

Google OAuth tidak mendukung wildcard redirect URI. Artinya:

- production domain Vercel harus didaftarkan eksplisit di Google Cloud Console
- preview deployment Vercel biasanya tidak bisa langsung dipakai login Google kecuali URL preview itu juga Anda daftarkan

Rekomendasi praktis:

1. Gunakan login Google hanya pada domain production atau custom domain yang stabil.
2. Daftarkan `https://your-domain.com/api/auth/callback` di Google Cloud Console.

## Menjalankan Secara Lokal

Install dependency:

```bash
npm install
```

Mode local React + Node:

```bash
npm run dev
```

Default URL:

- frontend: `http://localhost:5173`
- backend: `http://localhost:3100`

## Menjalankan Dengan Vercel Secara Lokal

Kalau ingin meniru environment Vercel:

```bash
npm run dev:vercel
```

Ini akan menjalankan frontend dan Functions sesuai routing Vercel.

## File Sensitif

File berikut tidak boleh ikut ter-push:

- `.env`
- `.env.*`
- `.key.json`
- `.vercel`

Kalau file itu pernah ter-track di git, keluarkan dari index:

```bash
git rm --cached .env .key.json
```

## Endpoint yang Tersedia

- `GET /api/health`
- `GET /api/auth/url`
- `GET /api/auth/callback`
- `GET /api/auth/status`
- `POST /api/auth/logout`
- `GET /api/emails`

## Referensi Resmi

- Vite on Vercel: `https://vercel.com/docs/frameworks/frontend/vite`
- Express on Vercel: `https://vercel.com/docs/frameworks/backend/express`
- Vercel env vars: `https://vercel.com/docs/environment-variables`

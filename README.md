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
CLIENT_ID=
CLIENT_SECRET=
SESSION_SECRET=
APP_BASE_URL=
REDIRECT_URL=
```

Arti masing-masing:

- `CLIENT_ID`: OAuth client ID dari Google Cloud
- `CLIENT_SECRET`: OAuth client secret dari Google Cloud
- `SESSION_SECRET`: secret panjang acak untuk signing cookie session
- `APP_BASE_URL`: URL frontend utama aplikasi
- `REDIRECT_URL`: callback Google OAuth

Catatan:

- `SESSION_SECRET` tetap direkomendasikan.
- Jika `SESSION_SECRET` belum diisi, aplikasi sekarang akan fallback ke `CLIENT_SECRET` agar deployment tidak langsung gagal.
- Untuk production jangka panjang, tetap lebih baik memakai `SESSION_SECRET` terpisah.

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

- `CLIENT_ID`
- `CLIENT_SECRET`
- `SESSION_SECRET`
- `APP_BASE_URL`
- `REDIRECT_URL`

Contoh production:

```env
APP_BASE_URL=https://email.najwan.my.id
REDIRECT_URL=https://email.najwan.my.id/api/auth/callback
```

## Catatan Penting untuk Google OAuth di Vercel

Google OAuth tidak mendukung wildcard redirect URI. Artinya:

- production domain Vercel harus didaftarkan eksplisit di Google Cloud Console
- preview deployment Vercel biasanya tidak bisa langsung dipakai login Google kecuali URL preview itu juga Anda daftarkan

Rekomendasi praktis:

1. Gunakan login Google hanya pada domain production atau custom domain yang stabil.
2. Daftarkan `https://your-domain.com/api/auth/callback` di Google Cloud Console.

## Konfigurasi Google Console untuk Domain Custom

Kalau domain production Anda adalah `https://email.najwan.my.id`, maka untuk OAuth Client tipe `Web application` isi seperti ini:

- `Authorized JavaScript origins`
- `https://email.najwan.my.id`

- `Authorized redirect URIs`
- `https://email.najwan.my.id/api/auth/callback`

Kalau Anda juga ingin menyimpan fallback domain Vercel bawaan, Anda boleh tambahkan juga:

- `https://email-management-dhs8.vercel.app`
- `https://email-management-dhs8.vercel.app/api/auth/callback`

Tetapi untuk penggunaan utama, saya sarankan fokus ke domain custom saja agar `APP_BASE_URL` dan `REDIRECT_URL` konsisten.

## Rekomendasi Env di Vercel

Untuk environment `Production`:

```env
CLIENT_ID=...
CLIENT_SECRET=...
SESSION_SECRET=...
APP_BASE_URL=https://email.najwan.my.id
REDIRECT_URL=https://email.najwan.my.id/api/auth/callback
```

Untuk environment `Preview`, ada dua pilihan:

1. Biarkan login Google tidak dipakai di preview, karena preview URL berubah-ubah dan Google OAuth butuh redirect URI yang exact.
2. Kalau tetap ingin preview bisa login, Anda harus mendaftarkan URL preview yang exact ke Google Console, yang biasanya tidak praktis.

Karena itu, untuk kasus Anda saya lebih menyarankan login Google difokuskan ke `Production` di domain custom.

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

## Batasan Gmail API Saat Ini

Scope Gmail yang dipakai aplikasi saat ini adalah `https://www.googleapis.com/auth/gmail.readonly`.

Artinya:

- aplikasi bisa membaca email
- aplikasi tidak bisa menghapus email
- aplikasi tidak bisa memindahkan email ke trash
- aplikasi tidak bisa menandai read/unread atau mengubah label

Kalau ingin aksi mailbox, scope minimal yang biasanya dibutuhkan adalah:

- `https://www.googleapis.com/auth/gmail.modify` untuk trash, ubah label, mark read/unread
- `https://mail.google.com/` untuk delete permanen

Untuk mengambil "semua email", SSO saja tidak cukup. Yang dibutuhkan adalah:

1. Google OAuth untuk login dan consent user
2. Gmail API untuk akses data mailbox
3. Pagination `users.messages.list` dengan `pageToken` agar seluruh mailbox bisa diambil bertahap

Jadi Anda tidak perlu API pihak ketiga lain, tetapi tetap perlu Gmail API dengan scope yang sesuai.

## Catatan Service Account

File `service_account.json` tidak bisa menggantikan login user Gmail biasa untuk akun personal `@gmail.com`.

Service Account hanya cocok untuk:

- server-to-server access milik project sendiri
- Google Workspace dengan domain-wide delegation yang dikonfigurasi admin

Untuk membaca inbox Gmail milik user personal, tetap harus memakai:

1. OAuth consent user
2. Gmail API
3. scope Gmail yang sesuai

## Referensi Resmi

- Vite on Vercel: `https://vercel.com/docs/frameworks/frontend/vite`
- Express on Vercel: `https://vercel.com/docs/frameworks/backend/express`
- Vercel env vars: `https://vercel.com/docs/environment-variables`

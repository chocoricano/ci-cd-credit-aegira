# Playwright Intro — Latihan Dasar (sebelum use case nyata)

**Durasi estimasi:** 45–60 menit  
**Prasyarat:** lihat [Persiapan cepat](#persiapan-cepat) di bawah — **`npx playwright install chromium` wajib** (bukan otomatis dari `npm install`).

Latihan ini memperkenalkan Playwright dengan aplikasi **CreditApp Demo** yang sama, tetapi fokus pada konsep dasar sebelum Anda mengerjakan skenario integrasi di `tests/workshop/01–03`.

> **Penting — baca dulu**  
> `npm install` hanya memasang package `@playwright/test`. **Browser Chromium tidak ikut ter-download.**  
> Tanpa langkah install, semua tes gagal dengan error:
> `browserType.launch: Executable doesn't exist at .../chrome-headless-shell`
>
> ```bash
> npx playwright install chromium   # sekali per mesin, setelah npm install
> ```

---

## Apa yang akan dipelajari

| Latihan | File | Konsep Playwright |
|---------|------|-------------------|
| 1 | `intro/01-page-load.spec.js` | `test`, `page.goto`, `expect`, `getByRole`, `locator` |
| 2 | `intro/02-form-interaction.spec.js` | `fill`, `getByLabel`, `toHaveValue` |
| 3 | `intro/03-step-navigation.spec.js` | klik tombol, assert perubahan langkah UI |

Setelah ketiga latihan ini, lanjut ke **use case nyata**: happy path (`01-happy-path`), env config (`02-env-config`), dan network failure (`03-network-failure`).

---

## Persiapan cepat

```bash
cd creditappdemo
npm install
npx playwright install chromium   # WAJIB — sekali per mesin (lihat catatan di atas)
# atau: npm run setup:e2e
cp .env.example .env              # opsional untuk lab manual
```

Verifikasi browser sudah terpasang:

```bash
npx playwright --version
# lalu jalankan intro:
npm run test:e2e:intro
```

Harapan: **4 passed, 3 skipped** (3 skipped = latihan TODO peserta).

Dev server: Playwright menjalankan `npm run dev` otomatis via `playwright.config.js`. Untuk eksplorasi manual, jalankan `npm run dev` di terminal terpisah.

Mode UI (disarankan saat belajar):

```bash
npx playwright test tests/workshop/intro --ui
```

---

## Latihan 1 — Buka halaman & cek elemen

**Tujuan:** Memastikan Playwright bisa membuka app dan menemukan elemen yang terlihat.

**Skenario CreditApp:** User membuka halaman awal pengajuan kredit.

**File:** `tests/workshop/intro/01-page-load.spec.js` (sudah lengkap — baca dan jalankan)

```bash
npx playwright test tests/workshop/intro/01-page-load.spec.js
```

**Checklist setelah tes hijau:**

- [ ] `page.goto('/')` memakai `baseURL` dari `playwright.config.js` (`http://localhost:5173`)
- [ ] `getByRole('heading', …)` mencari elemen aksesibel (lebih stabil daripada CSS sembarangan)
- [ ] `[data-component="form-pengajuan"]` adalah selector khusus demo ini untuk langkah formulir

**Refleksi (2 menit):** Mengapa `getByRole` lebih disarankan daripada `page.locator('h1')`?

---

## Latihan 2 — Isi formulir & assert nilai input

**Tujuan:** Berinteraksi dengan form seperti user mengetik.

**Skenario CreditApp:** Petugas memasukkan nama dan telepon pemohon di formulir pengajuan.

**File:** `tests/workshop/intro/02-form-interaction.spec.js`

1. Jalankan tes contoh yang sudah ada (`contoh: isi nama lengkap`).
2. Buka tes `TODO peserta: isi nomor telepon` — **hapus `test.skip`** dan lengkapi:

```javascript
// Petunjuk:
// await page.getByLabel('Nomor telepon').fill('08123456789');
// await expect(page.getByLabel('Nomor telepon')).toHaveValue('08123456789');
```

3. (Opsional) Tambahkan assert untuk field `#monthlyIncome` dengan nilai `8500000`.

```bash
npx playwright test tests/workshop/intro/02-form-interaction.spec.js
```

**Checklist:**

- [ ] `fill()` mengosongkan lalu mengetik nilai baru
- [ ] `toHaveValue()` memverifikasi isi input, bukan hanya teks di layar
- [ ] `getByLabel` terhubung ke `<label for="…">` di `FormPengajuan.js`

---

## Latihan 3 — Navigasi antar langkah aplikasi

**Tujuan:** Klik tombol dan tunggu UI berubah ke langkah berikutnya.

**Skenario CreditApp:** User mengisi formulir minimal → klik **Lanjut verifikasi dokumen** → layar verifikasi muncul.

**File:** `tests/workshop/intro/03-step-navigation.spec.js`

1. Jalankan tes contoh `formulir terisi dapat lanjut ke verifikasi` (sudah lengkap).
2. Kerjakan tes `TODO peserta: klik Periksa pada dokumen pertama`:
   - Hapus `test.skip`
   - Setelah sampai langkah verifikasi, klik tombol **Periksa** pertama (`[data-verify]`)
   - Assert badge **Terverifikasi** terlihat (minimal 1)

```bash
npx playwright test tests/workshop/intro/03-step-navigation.spec.js
```

**Checklist:**

- [ ] Tidak memakai `page.waitForTimeout()` — gunakan `expect(…).toBeVisible()`
- [ ] Tombol diklik dengan `getByRole('button', { name: '…' })`
- [ ] Setelah klik, UI berubah tanpa reload halaman penuh (SPA vanilla JS)

---

## Dari intro ke use case nyata

| Setelah intro | File use case | Apa yang ditambahkan |
|---------------|---------------|----------------------|
| Alur lengkap + scoring | `01-happy-path.spec.js` | loading, hasil, trace ID |
| Env & backend | `02-env-config.spec.js` | `page.on('request')`, mode `uat` |
| Simulasi gagal | `03-network-failure.spec.js` | `page.route()` + `route.abort()` |

```bash
npm run test:e2e          # semua tes workshop (intro + use case)
npm run test:e2e:trace    # dengan trace untuk debugging
```

---

## Cheat sheet singkat

```javascript
import { test, expect } from '@playwright/test';

test('judul skenario', async ({ page }) => {
  await page.goto('/');

  // Navigasi & visibility
  await expect(page.getByRole('heading', { name: 'Pengajuan kredit digital' })).toBeVisible();

  // Interaksi form
  await page.getByLabel('Nama lengkap').fill('Budi Santoso');
  await expect(page.locator('#fullName')).toHaveValue('Budi Santoso');

  // Klik
  await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();

  // Selector stabil di repo ini
  await expect(page.locator('[data-component="verifikasi-dokumen"]')).toBeVisible();
});
```

---

## Troubleshooting

| Gejala | Kemungkinan penyebab | Solusi |
|--------|----------------------|--------|
| `Executable doesn't exist at .../chrome-headless-shell` | Browser Playwright belum di-install | `npx playwright install chromium` |
| `ECONNREFUSED localhost:5173` | Dev server belum jalan | Biarkan `webServer` di config, atau `npm run dev` |
| Tes timeout | Assertion terlalu cepat | Tambah `{ timeout: 10_000 }` pada `expect` |
| Elemen tidak ditemukan | Salah label/role | Inspect di browser → cek teks tombol & label |
| `Process from config.webServer exited early` | Tes dibatalkan (`Ctrl+C`) atau port 5173 bentrok | Ulangi tes; hentikan `npm run dev` lain di port yang sama |

---

*Lanjutkan ke [`frontend-backend-integration-practice.md`](./frontend-backend-integration-practice.md) Lab 2.3 & 4.2 untuk skenario integrasi penuh.*

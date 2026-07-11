# Latihan Praktik Workshop
## Frontend–Backend Integration & Debugging Mastery
### Studi Kasus: CreditApp Demo

**Durasi estimasi:** 3–4 jam (4 sesi)  
**Repo:** `creditappdemo`  
**Stack:** Vanilla JS + Vite (frontend) · Backend Java UAT (opsional, mode `uat`)

---

## Tujuan Pembelajaran

Setelah menyelesaikan latihan ini, peserta dapat:

1. Menelusuri alur integrasi end-to-end (Browser → Frontend → API → UI)
2. Mendiagnosis masalah konfigurasi environment (`.env`, mode scoring)
3. Melakukan debugging lintas layer secara sistematis (UI → Network → API → Log)
4. Menulis dan menjalankan tes E2E dasar dengan Playwright

---

## Persiapan

```bash
git clone <url-repo-creditappdemo>
cd creditappdemo
npm install
npx playwright install chromium   # wajib untuk lab Playwright (Sesi 2 & 4)
cp .env.example .env
npm run dev
```

> `npm install` **tidak** mengunduh browser Playwright. Tanpa `npx playwright install chromium`, tes E2E gagal di `browserType.launch`.

| Variabel env | Default | Fungsi |
|--------------|---------|--------|
| `VITE_SCORING_MODE` | `mock` | `mock` = hitung lokal; `uat` = panggil backend |
| `VITE_BACKEND_BASE_URL` | `http://localhost:8080` | Base URL backend Java |
| `VITE_SCORING_PATH` | `/api/v1/credit-scoring/simulate` | Path endpoint scoring |
| `VITE_SCORING_SCHEMA` | `aegira` | Bentuk JSON request (`aegira` / `kreditku`) |
| `VITE_SCORING_DEFAULT_TENURE` | `12` | Tenor default (bulan) untuk DSR |

**Catatan:** Setelah mengubah `.env`, restart `npm run dev`.

---

# Sesi 1 — Integration Reality & Network Fundamentals

## Teori singkat (dari slide)

Integrasi nyata melibatkan banyak layer. Error sering baru muncul saat layer disambungkan:

```
Browser → Frontend (creditappdemo) → API Backend → Database → kembali ke UI
```

Di demo ini, layer **Database** disimulasikan oleh backend Java (mode `uat`) atau logika mock di browser (mode `mock`).

---

## Lab 1.1 — Jalankan alur end-to-end (Happy Path, mode mock)

**Tujuan:** Memahami alur bisnis sebelum debugging.

| Langkah | Aksi | Yang harus terlihat |
|---------|------|---------------------|
| 1 | Buka http://localhost:5173 | Halaman "Pengajuan kredit digital" |
| 2 | Isi formulir (contoh di bawah) → **Lanjut verifikasi dokumen** | Step indicator pindah ke Verifikasi |
| 3 | Klik **Periksa** pada ketiga dokumen | Semua badge "Terverifikasi" |
| 4 | Klik **Lanjut scoring otomatis** | Loading "Menghitung skor kredit…" (~1,6 detik) |
| 5 | Tunggu hasil | Kartu **Hasil simulasi skor kredit** dengan Kol 1–5 |

**Data uji contoh:**

| Field | Nilai |
|-------|-------|
| Nama | Budi Santoso |
| Telepon | 08123456789 |
| Penghasilan | 8500000 |
| Utang bulanan | 2200000 |
| Plafon | 40000000 |
| Tujuan | Modal kerja |
| Riwayat pembayaran | Baik |

**Checklist verifikasi:**

- [ ] Elemen `[data-component="form-pengajuan"]` tampil di langkah 1
- [ ] Elemen `[data-component="verifikasi-dokumen"]` tampil di langkah 2
- [ ] Elemen `[data-component="scoring-loading"]` tampil sebentar di langkah 4
- [ ] Elemen `[data-component="hasil-scoring"]` tampil di langkah 5
- [ ] Trace ID terlihat di bagian bawah hasil (format `mock-<timestamp>-<random>`)

---

## Lab 1.2 — Inspeksi Network tab (mode mock)

**Tujuan:** Membedakan request nyata vs simulasi lokal.

1. Buka DevTools → tab **Network**
2. Ulangi alur Lab 1.1
3. Jawab pertanyaan berikut (tulis jawaban Anda):

**Pertanyaan 1.2.A**  
Apakah ada request HTTP `POST` ke `/api/v1/credit-scoring/simulate` saat `VITE_SCORING_MODE=mock`?  
Mengapa?

**Pertanyaan 1.2.B**  
Di tab **Console**, expand log `[Credit Scoring — API Dummy] POST simulasi`.  
Field apa saja yang dicetak? URL mana yang ditampilkan?

**Pertanyaan 1.2.C**  
Buka `src/services/creditScoring.js`. Pada baris berapa keputusan `mock` vs `uat` diambil?

---

## Lab 1.3 — Diagram layer (latihan individu)

Gambar alur untuk skenario: *user klik "Lanjut scoring" sampai angka Kol muncul*.

Format minimal:

```
[User click] → [???] → [???] → [???] → [UI render hasil]
```

Isi `???` dengan nama file/fungsi yang relevan di repo ini.  
Petunjuk: mulai dari `VerifikasiDokumen.js` → `App.js` → `HasilScoring.js` → `creditScoring.js`.

---

## Quiz Sesi 1 (10 menit)

1. Sebutkan **4 layer** yang disebut di materi workshop dan contoh masalah masing-masing pada creditappdemo.
2. Mengapa bug integrasi sering tidak terlihat saat unit test frontend saja?
3. Apa perbedaan perilaku `scoreWithMock()` dan `callUatBackend()`?

---

# Sesi 2 — CORS, Env Config, Reverse Proxy

## Teori singkat

> Banyak bug bukan karena code, tapi karena **salah konfigurasi**.

Env Vite harus diawali `VITE_` agar terekspos ke browser. Local dev sebaiknya meniru production (DNS lokal, reverse proxy, env per environment).

---

## Lab 2.1 — Matriks konfigurasi

Ubah `.env`, restart dev server, lalu catat hasilnya.

| # | Konfigurasi | Hasil yang diharapkan Anda amati | ✓/✗ |
|---|-------------|----------------------------------|-----|
| A | `VITE_SCORING_MODE=mock` (default) | Scoring sukses tanpa backend | |
| B | `VITE_SCORING_MODE=uat` + backend **mati** | Error "Scoring gagal diproses" | |
| C | `VITE_SCORING_MODE=uat` + `VITE_BACKEND_BASE_URL=http://localhost:9999` | Error koneksi / gagal fetch | |
| D | `VITE_SCORING_MODE=uat` + `VITE_SCORING_PATH=/api/salah` | HTTP 404 dari backend (jika backend hidup) | |

**Langkah untuk skenario B–D:**

1. Set `.env` sesuai tabel
2. Restart `npm run dev`
3. Selesaikan alur sampai scoring
4. Screenshot atau catat pesan di `[data-component="scoring-error"]`

**Pertanyaan 2.1.A**  
Pesan error apa yang muncul pada skenario B? Salin teks error ke lembar jawaban.

**Pertanyaan 2.1.B**  
Di Network tab (skenario C), status request fetch apa yang terlihat? (`(failed)`, `CORS error`, `404`, dll.)

---

## Lab 2.2 — Debugging checklist: UI → Network → API

Gunakan skenario **2.1.C** (wrong API URL). Isi checklist secara berurutan:

| # | Layer | Apa yang Anda periksa? | Temuan Anda |
|---|-------|------------------------|-------------|
| 1 | UI | Teks di `.err` pada scoring-error | |
| 2 | Network | URL lengkap request POST | |
| 3 | API | Apakah request sampai ke server? | |
| 4 | Config | Nilai `VITE_BACKEND_BASE_URL` di `.env` | |
| 5 | Fix | Nilai yang benar untuk memperbaiki | |

---

## Lab 2.3 — Playwright: tes konfigurasi (hands-on)

**Belum pernah Playwright?** Kerjakan dulu [`playwright-intro.md`](./playwright-intro.md) (3 latihan dasar di `tests/workshop/intro/`, ±45 menit).

Tes use case nyata sudah disiapkan di `tests/workshop/`. Jalankan:

```bash
npx playwright install chromium   # sekali saja — wajib jika belum pernah di mesin ini
npm run test:e2e
```

**Tugas peserta — lengkapi test yang masih `test.skip`:**

Buka `tests/workshop/02-env-config.spec.js` dan implementasikan:

```javascript
// TODO Peserta: hapus test.skip dan lengkapi assertion
test.skip('wrong backend URL shows scoring error', async ({ page }) => {
  // Petunjuk:
  // 1. Set env VITE_SCORING_MODE=uat dan VITE_BACKEND_BASE_URL=http://127.0.0.1:59999
  // 2. Selesaikan alur form → verifikasi → scoring
  // 3. expect(page.getByRole('heading', { name: 'Scoring gagal diproses' })).toBeVisible()
});
```

**Tugas tambahan:** Di `03-network-failure.spec.js`, pastikan tes `simulated network failure` lulus dengan `route.abort()`.

---

## Lab 2.4 — Simulasi CORS (diskusi + opsional)

CreditApp memanggil backend di origin berbeda saat mode `uat`. Diskusikan:

**Pertanyaan 2.4.A**  
Frontend berjalan di `http://localhost:5173`. Backend di `http://localhost:8080`. Mengapa browser memeriksa CORS?

**Pertanyaan 2.4.B**  
Header response backend apa yang dibutuhkan agar browser mengizinkan `POST` dengan `Content-Type: application/json`?

**Opsional (jika backend Java tersedia):** Matikan CORS di backend atau ubah port — catat pesan error di Console.

---

## Quiz Sesi 2

1. Mengapa perubahan `.env` memerlukan restart `npm run dev`?
2. Apa risiko hardcode `http://localhost:8080` langsung di `creditScoring.js`?
3. Sebutkan 3 skenario dari slide "Test Scenarios" dan padankan dengan skenario creditappdemo (tabel di Lab 2.1).

---

# Sesi 3 — Cross-Layer Debugging (Correlation ID & Logs)

## Teori singkat

Centralized logging + **correlation / trace ID** memungkinkan trace request end-to-end di semua layer.

Di creditappdemo, field **`traceId`** di response scoring berfungsi sebagai correlation ID versi demo.

---

## Lab 3.1 — Trace ID end-to-end

1. Pastikan `VITE_SCORING_MODE=mock`
2. Selesaikan alur happy path
3. Catat **Trace ID** dari UI (contoh: `mock-1714275000000-x7k2m9`)
4. Buka Console → log `[Credit Scoring — API Dummy]`
5. Cocokkan `trace_id` di response log dengan Trace ID di UI

**Pertanyaan 3.1.A**  
Apakah nilainya sama di UI dan Console? Jika tidak, di layer mana hilangnya?

**Pertanyaan 3.1.B**  
Di production, log backend Java mungkin memakai `trace_id` yang sama. Bagaimana Anda mencari log tersebut di ELK/Grafana?

---

## Lab 3.2 — Latihan: tambahkan Correlation ID di request (opsional advanced)

Materi slide menyarankan header:

```javascript
headers: {
  'x-correlation-id': uuid()
}
```

**Tugas:** Modifikasi `callUatBackend()` di `src/services/creditScoring.js`:

1. Generate ID unik (boleh `crypto.randomUUID()` atau pola `makeTraceId`)
2. Kirim sebagai header `x-correlation-id`
3. Log ID yang sama di `logDummyApiDebug`
4. Verifikasi di Network tab → Request Headers

*Ini tidak wajib untuk lulus workshop; gunakan sebagai stretch goal.*

---

## Lab 3.3 — Case study debugging (berpasangan)

Fasilitator akan memberikan **kartu skenario**. Selesaikan dengan checklist:

```
UI error → Network tab → API response → Backend log → DB query
```

### Skenario A — "Scoring terus loading, tidak ada hasil"

**Gejala:** Loading spinner tidak berhenti; tidak ada error.

**Petunjuk debugging:**

1. Cek `store.getState().step` dan `scoringPhase` — apa nilai yang diharapkan?
2. Buka `App.js` — kapan `runScoring()` dipanggil?
3. Apakah ada error di Console yang tertelan?

**Pertanyaan:** Tulis minimal 2 hipotesis root cause dan cara membuktikannya.

### Skenario B — "Hasil Kol selalu 5 / Macet"

**Gejala:** Untuk profil yang seharusnya baik, skor selalu buruk.

**Petunjuk:**

1. Periksa input `paymentHistory` di `runScoring()` — apakah mapping-nya benar?
2. Bandingkan nilai `monthlyIncome` / `monthlyDebt` yang dikirim vs yang di form
3. Hitung manual: bobot payment (40%) + income (30%) + DTI (30%)

### Skenario C — "Backend UAT merespons 200 tapi UI error"

**Gejala:** Network menunjukkan 200 OK, UI tetap scoring-error.

**Petunjuk:**

1. Periksa body response — apakah field `result` ada?
2. Buka `scoringContract.js` → `normalizeScoringResponse()` — field apa yang wajib?
3. Apakah skema `aegira` vs `kreditku` cocok dengan response backend?

---

## Quiz Sesi 3

1. Apa manfaat correlation ID sama di frontend log, API log, dan DB log?
2. Sebutkan urutan **Debugging Checklist** dari materi.
3. Di creditappdemo, fungsi apa yang menormalisasi response backend ke bentuk UI?

---

## Latihan Playwright — Warm-up (sebelum Sesi 4)

Jika belum pernah memakai Playwright, kerjakan berurutan:

```bash
npx playwright test tests/workshop/intro/01-page-load.spec.js
npx playwright test tests/workshop/intro/02-form-interaction.spec.js
npx playwright test tests/workshop/intro/03-step-navigation.spec.js
```

**Tugas peserta di folder `intro/`:**

1. `02-form-interaction.spec.js` — hapus `test.skip`, lengkapi isi nomor telepon
2. `03-step-navigation.spec.js` — hapus `test.skip`, klik Periksa dokumen pertama

Setelah warm-up selesai, lanjut ke Lab 4.1–4.2.

---

# Sesi 4 — Systematic Debugging + Pipeline

## Lab 4.1 — Playwright Trace Viewer

```bash
npm run test:e2e:trace
npx playwright show-report
```

Atau untuk satu file:

```bash
npx playwright test tests/workshop/01-happy-path.spec.js --trace on
npx playwright show-trace test-results/.../trace.zip
```

**Tugas:**

1. Jalankan happy-path test dengan `--trace on`
2. Buka trace → tab **Network** — apakah ada request scoring?
3. Tab **Snapshots** — pada step mana `[data-component="hasil-scoring"]` muncul?
4. Screenshot trace viewer untuk laporan Anda

---

## Lab 4.2 — Tulis tes happy path sendiri (jika belum ada)

Minimal flow yang harus dicakup tes Anda:

```javascript
// Pseudocode — implementasi di tests/workshop/01-happy-path.spec.js
await page.goto('/');
await page.fill('#fullName', '...');
// ... isi semua field wajib
await page.getByRole('button', { name: 'Lanjut verifikasi dokumen' }).click();
// verifikasi 3 dokumen
await page.getByRole('button', { name: 'Lanjut scoring otomatis' }).click();
await expect(page.locator('[data-component="hasil-scoring"]')).toBeVisible({ timeout: 10000 });
await expect(page.getByText(/Trace ID/)).toBeVisible();
```

**Kriteria lulus:**

- [ ] Tes lulus di mode `mock`
- [ ] Tidak ada hardcoded wait `page.waitForTimeout()` (gunakan `expect` dengan timeout)
- [ ] Selector memakai `data-component` atau role/label yang stabil

---

## Lab 4.3 — Pipeline mindset (diskusi)

Tanpa CI/CD lengkap di repo ini, jawab secara konseptual:

1. Tes Lab 2.3 dan 4.2 cocok dijalankan di pipeline pada fase apa? (PR check / nightly / pre-deploy)
2. Tes mana yang harus mock network (`route.abort`) vs yang butuh backend nyata?
3. Bagaimana memisahkan tes **mock** dan **uat** di CI?

---

# Assessment Akhir (20 menit)

## Bagian A — Pilihan ganda

**1.** Saat `VITE_SCORING_MODE=mock`, scoring dihitung di:  
a) Backend Java  
b) Browser (client-side)  
c) Database  
d) Reverse proxy  

**2.** File env mana yang sebaiknya tidak di-commit ke git?  
a) `.env.example`  
b) `.env`  
c) `vite.config.js`  
d) `package.json`  

**3.** Urutan debugging yang benar menurut materi:  
a) DB → API → Network → UI  
b) UI → Network → API → Backend → DB  
c) API → UI → Network  
d) Log → UI saja  

**4.** Trace ID di creditappdemo berguna untuk:  
a) Styling CSS  
b) Menghubungkan log antar layer  
c) Menentukan port Vite  
d) Validasi CORS  

**5.** `route.abort()` di Playwright mensimulasikan:  
a) Happy path  
b) Network failure  
c) CORS success  
d) Database migration  

## Bagian B — Studi kasus (esai singkat)

**Studi kasus:** Tim QA melaporkan: *"Di staging, formulir bisa disubmit, verifikasi lancar, tapi scoring gagal dengan pesan `Backend scoring gagal (502)`."*

Tulis langkah debugging Anda (minimal 5 langkah terurut), termasuk:
- Apa yang dicek di UI
- Header / URL di Network
- Env yang diverifikasi
- Siapa yang dikontak jika masalah di infrastructure

## Bagian C — Praktik (opsional, dinilai fasilitator)

- [ ] Happy path selesai manual
- [ ] Minimal 1 skenario error direproduksi (Lab 2.1)
- [ ] Playwright happy-path lulus
- [ ] Mengisi checklist debugging Lab 2.2

---

## Referensi cepat repo

| Topik | File |
|-------|------|
| Service scoring & mode mock/uat | `src/services/creditScoring.js` |
| Kontrak JSON request/response | `src/services/scoringContract.js` |
| UI error & hasil | `src/components/HasilScoring.js` |
| Orchestrasi step | `src/components/App.js` |
| Dokumentasi API | `docs/api/credit-scoring.md` |
| Contoh env | `.env.example` |

---

*Internal — Learning and People Development Department*  
*Workshop: Frontend–Backend Integration & Debugging Mastery*

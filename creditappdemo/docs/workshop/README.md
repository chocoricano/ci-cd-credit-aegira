# Workshop: Frontend–Backend Integration & Debugging

Materi praktik untuk workshop **Frontend–Backend Integration & Debugging Mastery**, menggunakan proyek **creditappdemo** sebagai studi kasus.

## File

| File | Untuk siapa | Isi |
|------|-------------|-----|
| [`playwright-intro.md`](./playwright-intro.md) | Peserta | **Mulai di sini** — 3 latihan Playwright dasar sebelum use case nyata |
| [`frontend-backend-integration-practice.md`](./frontend-backend-integration-practice.md) | Peserta | Lab, quiz, dan skenario debugging langkah demi langkah |
| [`workbook.md.example`](./workbook.md.example) | Peserta | **Satu workbook** — salin, isi jawaban, commit di branch PR |

**Fasilitator:** [`workbook-fasilitator.md`](./workbook-fasilitator.md) — struktur sama + kunci jawaban (lokal, **tidak** di-commit). Bagikan ke co-fasilitator lewat channel internal.

## Prasyarat peserta

```bash
cd creditappdemo
npm install
npx playwright install chromium   # WAJIB untuk tes E2E (tidak otomatis dari npm install)
cp .env.example .env
npm run dev
```

Buka http://localhost:5173 — alur demo: **Formulir → Verifikasi dokumen → Scoring → Hasil**.

> **Tes Playwright gagal dengan `Executable doesn't exist`?**  
> Jalankan `npx playwright install chromium` sekali per mesin, lalu ulangi `npm run test:e2e:intro`.

## Tes otomatis

### Intro Playwright (45–60 menit, sebelum lab integrasi)

```bash
npx playwright install chromium   # wajib sekali, sebelum tes pertama
npm run test:e2e:intro            # harapan: 4 passed, 3 skipped
```

Panduan: [`playwright-intro.md`](./playwright-intro.md).

### Use case nyata (Sesi 2 & 4)

```bash
npm install
npx playwright install chromium
npm run test:e2e          # intro + use case (01–03)
npm run test:e2e:ui       # mode interaktif
npm run test:e2e:trace    # dengan trace untuk debugging
```

| Folder / file | Isi |
|---------------|-----|
| [`tests/workshop/intro/`](../../tests/workshop/intro/) | Latihan 1–3: page load, form, navigasi langkah |
| [`tests/workshop/01–03`](../../tests/workshop/) | Happy path, env config, network failure |

## Mapping ke slide workshop

| Sesi slide | Topik | Lab di practice doc |
|------------|-------|---------------------|
| 1 | Integration Reality & Network Fundamentals | Lab 1.1 – 1.3 |
| 2 | CORS, Env Config, Reverse Proxy | Lab 2.1 – 2.4 + Playwright config tests |
| 3 | Cross-Layer Debugging (Correlation ID & Logs) | Lab 3.1 – 3.3 |
| 4 | Systematic Debugging + Pipeline | Lab 4.1 – 4.2 + case study |

## Pengumpulan jawaban — branch & PR (peserta)

Satu branch per nama → PR ke `main`. Workbook + tes Playwright dalam satu PR.

### Alur

```bash
git checkout main && git pull
git checkout -b workshop/nama-anda
cp docs/workshop/workbook.md.example docs/workshop/workbook-nama-anda.md
```

Kerjakan latihan per sesi, commit bertahap:

```bash
git add tests/workshop/ docs/workshop/workbook-nama-anda.md
git commit -m "workshop sesi 2: playwright intro + env config test"
git push -u origin workshop/nama-anda
```

### Apa yang masuk PR

| Masuk PR | Tidak masuk PR |
|----------|----------------|
| `docs/workshop/workbook-<nama>.md` | `workbook-fasilitator.md` |
| Tes Playwright (`tests/workshop/intro/`, `02`, `03`) | `.env` |
| Screenshot bukti (opsional) | `test-results`, `playwright-report` |

### Template deskripsi PR

```markdown
## Peserta
Nama: ...
Sesi selesai: [ ] 1 [ ] 2 [ ] 3 [ ] 4

## Playwright
- [ ] `npm run test:e2e:intro` — X passed, Y skipped
- [ ] `npm run test:e2e` — (jika sudah Lab 2.3 / 4.2)

## Workbook
Lihat `docs/workshop/workbook-<nama>.md`
```

### Aturan

- Satu branch per peserta; **jangan** push ke `main`
- PR boleh **draft** selama workshop; **Ready for review** di akhir hari
- Fasilitator review + comment; merge opsional

## Fasilitator

`workbook-fasilitator.md` ada di mesin fasilitator (di-ignore git). Isinya kunci jawaban untuk debrief — **jangan** push ke repo publik.

Distribusikan ke co-fasilitator lewat Drive/wiki internal. Peserta hanya mendapat `workbook.md.example`.

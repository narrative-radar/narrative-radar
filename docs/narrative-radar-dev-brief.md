# Narrative Radar — Dev Brief

**Status:** v14 — mega brief, hasil audit agy sudah diselesaikan (2 gap skema + 5 keputusan), siap coding
**Satu kalimat:** Lihat meta-nya sebelum jadi meta.
**File terkait:** `narrative-radar-landing.html` (referensi `(marketing)`), `narrative-radar-dashboard.html` (referensi `(app)/radar`)

---

## PROJECT SEED

```
## Product
Name: Tycho (working name — alternatif: Fujita, Howard)
Working codename: Narrative Radar
One-line: Radar untuk narasi meme — mengelompokkan launch baru di Pump.fun
per tema, jadi narasi yang sedang terbentuk terlihat sebelum ramai.

## Problem
Semua tool yang ada memantau harga/volume/holder pada token yang SUDAH
launching. Tidak ada yang memantau APA yang sedang banyak diluncurkan —
narasi baru terlihat jelas setelah sudah rame, bukan saat sedang lahir.

## User
Primary: trader/degen Solana yang mau lihat narasi terbentuk lebih awal
Secondary: -

## Core Promise
"Waktu banyak token bertema mirip diluncurkan, Tycho mengelompokkannya
otomatis dan menunjukkan bentuk narasi itu terbentuk — sebelum satu pun
tokennya sendiri layak dipantau satu-satu."

## User Input
Tidak ada input wajib untuk melihat — produk ini live read yang terus
update. (Nice-to-have masa depan: filter/cari per tema.)

## Product Output
Daftar cluster narasi yang sedang aktif: nama tema, jumlah anggota, tren
pertumbuhan (sparkline), daftar token per cluster kalau diklik. Plus kartu
ringkasan "meta jam ini" yang bisa dibagikan.

## Core Flow
LANDING → lihat hero + dashboard aktif langsung (tanpa scroll jauh)
       → klik satu tema
       → RESULT: daftar token dalam tema itu, urut waktu lahir

## V1 Must Build
- Pipeline clustering (ingest → embed teks → assign/cluster → cache)
- Daftar cluster live dengan sparkline tren per tema
- Klik tema → daftar token
- Kartu share

## V1 Must Not Build
- Login/akun — TIDAK ADA, keputusan final
- Image similarity (teks dulu di v1)
- Multi-chain (Solana/Pump.fun saja)
- WebSocket custom (polling cukup)

## V1.1 — Distribusi & Bukti (ditambahkan setelah V1 inti disepakati)
- X bot otomatis — post "meta jam ini" ke akun X Tycho, event-triggered
  (bukan jadwal tetap), lihat bagian 2e untuk detail biaya (INI TIDAK
  GRATIS, ada biaya nyata per-post lewat X API)
- Halaman track record publik `(marketing)/track-record` — cluster yang
  pernah capai tier breakout, tanpa login, data dari yang sudah ada

## Project Profile
Dashboard — SvelteKit fullstack kecil (frontend + SSR + API + DB kecil)

## Data
External API (Pump.fun) + Database (cache hasil cluster)

## Authentication
None

## Runtime
SvelteKit serverless/edge, Bun sebagai package manager/runtime

## Free-First Plan
Development: $0
Production: target $0 selama masih di batas free-tier
Expected free services: hosting (Vercel free tier), database
(Supabase free tier — Postgres, tanpa kartu kredit), scheduler
free-tier (lihat checkpoint di bawah)

## Environment Variables
Required: YES
Public: PUBLIC_APP_URL
Private: EMBEDDING_API_KEY, CRON_SECRET, (PUMPFUN_API_KEY kalau perlu)

## Visual Direction
Brand personality: presisi, tenang-percaya-diri, seperti alat ukur —
bukan hype, bukan sci-fi
Visual metaphor: signal readout / seismograf untuk narasi, bukan layar
radar bundar literal
Primary motif: sparkline flat-color per tema, warna = status pertumbuhan
Anti-pattern yang dihindari: gradient blob, glassmorphism, neon glow,
grid 3-kartu generik, styling terminal tanpa alasan produk

## Testing Critical Paths
- Daftar cluster tampil benar
- Klik cluster → token list yang benar
- Endpoint cron nolak request tanpa secret
- Empty state render saat tidak ada cluster aktif

## Deployment Target
Primary: Vercel (adapter SvelteKit, free tier) — bukan Cloudflare

## Definition of Done
- [ ] Daftar cluster live jalan end-to-end dengan data Pump.fun asli
- [ ] Clustering jalan terjadwal tanpa trigger manual
- [ ] Tidak ada login di mana pun di flow
- [ ] Tiap service eksternal lolos free-first checkpoint di bawah
```

---

## 1. Konteks

Lolos 5 kriteria seleksi dari sesi ideasi: satu kalimat di X, backend sederhana tampilan berat, artefak yang mau diposting sendiri, belum ada yang klaim posisi, tidak menabrak project lain di portofolio.

> Catatan riset: ada project open-source **Zeitgeist** (Solana narrative clustering, kompetisi Birdeye) dengan konsep dekat. Bukan penghalang, worth dilihat sebagai pembanding sebelum briefing sore.

## 2. Peta Halaman

Landing dan dashboard sekarang referensi **dua file terpisah** (bukan satu halaman gabungan) — lebih dekat ke struktur route asli:

`(marketing)` — urutan: Nav → Hero (headline + CTA "Open the radar") → stat band (3 angka ringkas) → "what it reads" → "what forms" → **how it works (pinned scrollytelling, 3 tahap)** → **track record preview** (3 entri + link ke halaman penuh) → "who it's for" → "the artifact" (kartu share) → CTA penutup → **sticky footer reveal** (wordmark TYCHO). Nav juga link langsung ke `/track-record`.

`(app)/radar` — halaman tool sungguhan: header kecil + judul → legend warna → **signal list** (baris per tema + sparkline) → kartu share, tanpa login, tanpa chrome marketing.

## 2b. Elemen Struktural Landing (untuk agent — bukan sekadar styling, ini pola interaksi)

- **Vital rail** — garis tipis fixed di tepi kiri viewport, terisi mengikuti persentase scroll halaman, dengan titik penanda posisi. Elemen sinyal, bukan dekorasi kosong — reuse warna `--accent` yang sama dengan CTA.
- **Stat band** — grid 3 kolom, garis pembatas 1px (bikin dari `background` pada container + gap 1px, bukan border tiap sel), tiap sel: angka besar (font serif) + deskripsi pendek.
- **Pinned "how it works"** — section setinggi 300vh dengan panel di dalamnya `position: sticky; top:0; height:100vh`. Saat discroll, progress dalam section itu (0–1) dipakai buat gantian 3 tahap (step list kiri nyala satu-satu, ilustrasi kanan berganti). Di reference pakai `ScrollTrigger.create({trigger, start:"top top", end:"bottom bottom", onUpdate})` murni buat tracking progress — pinning-nya dari CSS `position:sticky`, bukan dari GSAP `pin:true`. Tiap kali tahap berganti, ilustrasinya sendiri re-animasi (garis gambar ulang, titik-titik muncul stagger) — bukan cuma crossfade opacity datar.
- **Smooth scroll — Lenis.** Dipasang di `(marketing)` saja, bukan di `(app)/radar` (dashboard butuh scroll responsif/langsung buat scanning data, bukan momentum halus). Disambungkan ke ScrollTrigger lewat `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker.add((t) => lenis.raf(t*1000))` — pola integrasi standar Lenis+GSAP, bukan dua sistem scroll yang jalan sendiri-sendiri. Nonaktif otomatis kalau `prefers-reduced-motion`.

## 2c. Layout Dashboard — dua kolom, bukan satu kolom sempit

`(app)/radar` sekarang lebar penuh (max-width 1400px, bukan 760px seperti draft sebelumnya) dengan dua kolom:

- **Kolom utama (kiri, lebih lebar)** — judul, legend, signal list. Ini konten inti yang sudah ada.
- **Sidebar (kanan, 340px)** — tiga panel, urut dari atas:
  - **At a glance** — 3 angka: jumlah cluster aktif, total token ter-track hari ini, hitung mundur ke scan berikutnya (live-ticking, bukan statis — nilai riil-nya nanti dari `cluster.status`, `COUNT(tokens)`, dan jadwal cron di bagian 6)
  - **Activity log** — feed scrollable token yang baru masuk, urut terbaru, tiap baris: dot warna (ikut tier cluster-nya), ticker, waktu relatif. Ini representasi UI dari tahap [1] INGEST di alur data — bukan angka fiktif, ini literally log dari proses yang sama yang mengisi signal list
  - **Kartu share** — sengaja dipindah dari kolom utama ke bawah activity log, biar tinggi kolom kiri dan kanan seimbang, bukan kolom kiri jauh lebih tinggi dari kanan

Dua panel sidebar ini butuh data yang SAMA dengan yang sudah dispesifikasikan (bagian 5) — "at a glance" dan "activity log" bukan endpoint baru, cukup turunan dari `GET /api/clusters` (count + status) dan tabel `tokens` (10 terbaru, urut created_at).

## 2d. Data Source & Aksi Pengguna

**Dari mana datanya:** Pump.fun (WebSocket/API resmi mereka) → worker baca launch baru → embed teks (name+ticker) → assign ke cluster → simpan ke DB → `(app)/radar` baca DB lewat `/api/clusters`, poll tiap 15–30 detik. Tidak ada input manual dari user yang memengaruhi data — semuanya otomatis. Detail lengkap alur ini ada di bagian 4.

**Aksi yang bisa dilakukan user** (semua di `(app)/radar`, tanpa login):

| Aksi | Hasil |
|---|---|
| Lihat signal list | Pasif, update sendiri via polling |
| Klik satu baris tema | Panel detail slide in, isi daftar token di tema itu |
| Klik "copy CA" per token | Contract address ter-copy ke clipboard — ini yang bikin dashboard bisa dipakai beneran (ticker doang tidak cukup buat trading, orang butuh CA-nya) |
| Klik "copy summary" di kartu share | Ringkasan "meta jam ini" ter-copy sebagai teks, siap paste ke X |
| Scroll signal list | Kalau cluster aktif > 8-an, list scroll di dalam container-nya sendiri (`max-height` + `overflow-y`), bukan bikin halaman memanjang tanpa batas |

V1 sengaja TIDAK punya: filter/search per tema, sorting manual, notifikasi/alert. Semua itu nice-to-have di luar V1 (lihat Project Seed).

## 2e. Distribusi & Bukti Otomatis (V1.1)

Alasan fitur ini ada: dashboard yang cuma bisa dilihat kalau user inget buka sendiri gampang dilupain. Dua tambahan ini bikin Tycho yang "manggil" user balik, bukan nunggu diinget.

### X bot otomatis

Kartu "meta jam ini" di-post sendiri ke akun X Tycho — bukan nunggu user klik share manual. Mengubah kartu share dari aksi sesekali jadi mesin distribusi yang jalan sendiri; orang lihat tweet-nya dulu, baru masuk ke dashboard buat detail.

> **Koreksi biaya — ini TIDAK gratis, beda dari asumsi awal.** X API sejak Februari 2026 tidak lagi punya free tier buat developer baru — pay-per-use, ~$0.015 per post yang dibuat (kita cuma nulis/post, tidak baca data X, jadi biaya baca tidak relevan). Estimasi:
> - Posting tiap jam (24×/hari, 30 hari): ~$10–11/bulan
> - Posting **event-triggered** — cuma pas ada cluster yang baru naik ke tier breakout sejak run terakhir, bukan jadwal jam tetap: jauh lebih murah (biasanya < $2–3/bulan tergantung seberapa sering breakout kejadian), dan lebih relevan — orang cuma di-notif pas ada yang beneran layak dikabarin

**Rekomendasi: event-triggered, bukan jadwal tetap.** Lebih murah dan lebih baik secara produk.

Arsitektur: endpoint baru `POST /api/cron/post-update` (protected, sama polanya kayak `api/cron/cluster`), dipanggil scheduler terpisah (mis. tiap 15 menit, tapi cuma benar-benar post kalau ada cluster baru breakout sejak terakhir kali post) → generate teks ringkasan dari data cluster yang sudah ada → panggil X API buat post.

### Halaman track record publik

Route baru `(marketing)/track-record`, tanpa login. Nampilin cluster yang **pernah** capai tier breakout, diurut dari yang paling baru archived, dengan: nama tema, puncak jumlah token, puncak growth_rate, kapan pertama kali ke-flag breakout. Ini bukti konkret buat klaim "lihat meta sebelum jadi meta" — dan alasan orang balik lagi bukan cuma buat "apa yang lagi kejadian" tapi "kemarin Tycho bener nggak".

Datanya bukan hitungan baru — cukup query `clusters WHERE ever_reached_breakout = true ORDER BY archived_at DESC`. Butuh satu field baru di schema: `clusters.ever_reached_breakout boolean`, di-set `true` begitu status pertama kali capai breakout dan **tidak pernah di-unset** walau growth-nya turun lagi — biar track record-nya jujur, bukan cuma nampilin yang lagi breakout SEKARANG.

**Warna dot di halaman ini SENGAJA selalu warna breakout**, bukan ikut status/tier cluster saat ini — ini bukan bug. Track record nunjukin "tema ini PERNAH breakout", bukan "tema ini sekarang lagi apa" (itu urusan dashboard, bukan halaman ini). Kalau warnanya ikut status saat ini, sebagian besar entri bakal jadi abu-abu/quiet (karena kebanyakan sudah archived), yang justru menghilangkan poin halamannya.

## 3. Arsitektur

Stack: **Svelte 5, SvelteKit, TypeScript, Tailwind CSS, Zod**, di atas **Bun** sebagai runtime — SvelteKit yang pegang semuanya, bukan server terpisah. **GSAP + ScrollTrigger + MotionPathPlugin + ScrambleTextPlugin** dipakai di KEDUA route group — `(marketing)` (scroll reveal, pinned section, hero animation) DAN `(app)/radar` (title scramble-in, baris masuk staggered, sparkline gambar sendiri, panel detail slide) — koreksi dari draft sebelumnya yang nyebut GSAP cuma buat marketing. **Lenis** (smooth scroll) TETAP cuma di `(marketing)` — ini yang beda, bukan GSAP-nya. Semua npm install biasa, bukan layanan eksternal jadi tidak masuk Free-First Checkpoint.

**Satu repo, satu folder structure.** Frontend dan backend BUKAN dua project terpisah — semuanya satu SvelteKit app: `src/lib/features` dan `src/lib/server` hidup di repo yang sama, di-deploy sebagai satu unit. Tidak ada repo kedua, tidak ada service terpisah yang perlu di-deploy sendiri-sendiri.

```
src/lib/
├── components/ui/            Button, Modal, Spinner
├── components/shared/        Navbar, Footer, EmptyState, ErrorState
├── features/
│   ├── landing/
│   │   └── components/
│   │       ├── Hero.svelte              headline scramble-in + hero-signals
│   │       ├── VitalRail.svelte         indikator scroll di tepi kiri
│   │       ├── StatBand.svelte          3 angka ringkas
│   │       ├── NarrativeSection.svelte  dipakai ulang utk "what it reads" / "what forms" / "who it's for"
│   │       ├── ProcedurePinned.svelte   how-it-works, pinned scrollytelling
│   │       ├── ArtifactSection.svelte   penjelasan + mini share card
│   │       ├── TrackRecordPreview.svelte  3 entri + link, komponen sendiri (bukan inline di +page.svelte) — konsisten sama pola "satu section, satu komponen" yang lain
│   │       ├── FinalCta.svelte          2 link penutup, section normal (animasi .reveal biasa) — TERPISAH dari RevealFooter karena beda mekanisme (flow biasa vs fixed/sticky)
│   │       ├── TrackRecordList.svelte   V1.1 — versi penuh, dipakai di route track-record
│   │       └── RevealFooter.svelte      penutup, sticky footer reveal — fixed positioning, bukan .reveal biasa
│   └── radar/
│       ├── components/
│       │   ├── SignalList.svelte        daftar cluster + sparkline
│       │   ├── SignalRow.svelte         satu baris tema
│       │   ├── ClusterDetailPanel.svelte
│       │   ├── ShareCard.svelte
│       │   ├── QuickStats.svelte        sidebar — angka ringkas + countdown
│       │   └── ActivityLog.svelte       sidebar — feed token masuk terbaru
│       ├── radar.schema.ts       Zod: Cluster, Token
│       ├── radar.types.ts
│       ├── radar.utils.ts
│       └── radar.state.svelte.ts  selectedClusterId, panelOpen
└── server/
    ├── db/schema/              Drizzle (Postgres/Supabase): clusters, tokens
    ├── repositories/cluster.repository.ts, token.repository.ts
    ├── services/clustering.service.ts, postUpdate.service.ts (V1.1)
    └── integrations/
        ├── pumpfun/pumpfun.client.ts
        ├── embedding/embedding.client.ts
        └── x/x.client.ts (V1.1 — posting saja, tidak baca data X)

src/routes/
├── (marketing)/
│   ├── +layout.svelte, +page.svelte        prerender = true, tanpa auth guard
│   └── track-record/+page.svelte           V1.1, prerender = true, publik
├── (app)/radar/+page.svelte, +page.server.ts   tanpa auth guard — publik
└── api/
    ├── clusters/+server.ts                     GET, dipoll TanStack Query
    ├── clusters/trending/+server.ts
    ├── clusters/track-record/+server.ts        V1.1, GET, publik
    ├── clusters/[id]/tokens/+server.ts
    ├── clusters/[id]/share-card/+server.ts
    ├── cron/cluster/+server.ts                 POST, protected shared-secret
    └── cron/post-update/+server.ts             V1.1, POST, protected shared-secret
```

`(marketing)/+page.svelte` tinggal menyusun 9 komponen inti `features/landing` sesuai urutan di bagian 2 — masing-masing section yang ada di file HTML referensi (`narrative-radar-landing.html`) map 1:1 ke satu komponen di atas, bukan satu file besar dan bukan section di-inline langsung di `+page.svelte`. `TrackRecordList.svelte` (beda dari `TrackRecordPreview.svelte`) dipakai terpisah di route `track-record` (V1.1).

**Tidak ada `hooks.server.ts` untuk session/auth** — tidak perlu, tidak ada login di flow manapun.

Live data: **TanStack Svelte Query**, polling 15–30 detik ke `/api/clusters`. DB: **Supabase (Postgres)** + Drizzle ORM (`drizzle-orm/postgres-js`) — bukan SQLite, bukan Cloudflare D1.

## 4. Alur Data — tiap tahap dengan output

```
INPUT   raw launch event { name, ticker, imageUrl, mint, createdAt }
   │
[1] INGEST    → row baru di `tokens`, status: pending_embed
[2] EMBED     → token.embedding terisi (batch, bukan satu-satu), status: pending_cluster
[3] ASSIGN    → gabung cluster existing (similarity ≥ threshold ~0.82) ATAU cluster baru dibuat
[4] RECOMPUTE → cluster.growth_rate, member_count, status di-update; peak_member_count dan peak_growth_rate di-update KALAU nilai baru lebih tinggi (tidak pernah turun); sparkline_points di-append satu titik baru (buang titik terlama kalau sudah 12)
[5] SERVE     → GET /api/clusters baca cache saja, nol komputasi similarity saat request
```

Status cluster: `active` → `cooling` (tidak dapat anggota beberapa jam) → `archived` (tetap di histori).

Image similarity tetap fase 2. Threshold final butuh eksperimen data asli.

## 4a. Pelabelan Cluster — gap yang belum ada mekanismenya sampai draft ini

Setiap contoh di brief dan HTML referensi pakai nama tema yang jelas ("retro game villains", "cats in tiny hats") — tapi **belum pernah ditentukan cluster dapat nama itu dari mana**. Ini bukan detail kecil, ini inti produk: tanpa label yang jelas, "cluster" cuma jadi angka ID, bukan narasi yang bisa dibaca orang.

**Usulan mekanisme:** sekali sebuah cluster baru dapat anggota ke-2 atau ke-3 (bukan pas masih 1 token — belum cukup sinyal buat dibilang "tema"), panggil LLM sekali dengan daftar name+ticker anggotanya, minta label pendek (2-4 kata, gaya sama kayak contoh yang ada). Hasilnya disimpan permanen di `clusters.label` — **tidak dihitung ulang tiap kali cluster dapat anggota baru**, sama seperti prinsip cache-first di bagian lain. Kalau nanti anggotanya berkembang jauh dari label awal, itu risiko yang diterima, bukan alasan buat re-generate terus-menerus (mahal, dan label yang berubah-ubah bikin bingung).

Ini nambah SATU service eksternal baru — lihat Free-First Checkpoint bagian 6 (LLM API buat labeling, biaya kecil tapi bukan zero).

## 4b. Skema Data (konsolidasi — sebelumnya tersebar di beberapa bagian)

```
tokens
  id             uuid, PK
  mint           text, unique — contract address
  ticker         text
  name           text
  image_url      text, nullable — lihat Pertanyaan Terbuka soal ini
  created_at     timestamp — waktu launch di Pump.fun
  embedding      vector, nullable — null sampai tahap [2] EMBED selesai
  cluster_id     uuid, FK → clusters.id, nullable — null sampai tahap [3] ASSIGN
  status         enum: pending_embed | pending_cluster | clustered

clusters
  id                      uuid, PK
  label                   text — lihat 4a, di-generate sekali lewat LLM
  centroid                vector — rata-rata embedding anggota
  member_count            int
  growth_rate             numeric — persen pertambahan 1 jam terakhir vs jam sebelumnya, MELURUH ke 0 begitu cluster berhenti dapat anggota baru
  peak_member_count       int — nilai member_count tertinggi yang PERNAH dicapai, di-update tiap [4] RECOMPUTE kalau nilai baru lebih tinggi (GREATEST), tidak pernah turun
  peak_growth_rate        numeric — sama polanya kayak peak_member_count, tapi buat growth_rate. INI yang dipakai track-record.html buat "peak growth" — growth_rate biasa sudah meluruh ke ~0% begitu cluster archived, jadi peak_growth_rate wajib field terpisah, bukan derivable dari growth_rate
  sparkline_points        jsonb — array angka member_count, urut waktu, di-APPEND tiap [4] RECOMPUTE, dibatasi ~12 titik terakhir (rolling window, bukan histori penuh). Ini yang dipakai endpoint /api/clusters buat "sparkline points" di bagian 5 — jangan dihitung ulang dari histori tokens tiap request
  status                  enum: active | cooling | archived
  ever_reached_breakout   boolean — tidak pernah di-unset, lihat bagian 2e
  first_seen              timestamp
  last_updated            timestamp
  archived_at             timestamp, nullable
```

> **Koreksi dari audit agy:** draft sebelumnya tidak punya `sparkline_points`, `peak_member_count`, `peak_growth_rate` — padahal bagian 5 (API spec) sudah janji return sparkline, dan track-record.html sudah nampilin angka puncak. Tanpa 3 kolom ini, endpoint-nya nggak punya sumber data buat dipenuhi. Sekarang sudah ditambahkan di atas.

**Keputusan `image_url` (sebelumnya pertanyaan terbuka, sekarang diputuskan):** TAMPIL di V1 — thumbnail kecil di signal row dan token list. Datanya sudah ada gratis dari Pump.fun (bukan biaya baru), cuma soal ditampilkan atau tidak. Yang TETAP ditunda ke fase 2 cuma pemakaiannya buat SIMILARITY/clustering, bukan tampilan.

## 4c. Penanganan Kegagalan (gap yang sering kelewat di brief — sengaja ditulis eksplisit)

| Kegagalan | Yang harus terjadi |
|---|---|
| Pump.fun API/WebSocket down | Cron run tetap selesai tanpa error fatal; token baru menyusul di run berikutnya. Log, jangan silent-fail total. |
| Embedding API gagal/limit | Batch itu di-skip, token tetap `pending_embed`, dicoba lagi run berikutnya — bukan token hilang, bukan cluster asal-asalan tanpa embedding. |
| Cron ke-trigger dobel (retry scheduler, dsb) | `clustering.service.ts` harus idempotent — token yang sudah `pending_cluster` diproses ulang tidak menghasilkan cluster ganda. |
| DB tidak bisa diakses saat request halaman | `(app)/radar` tampilkan `ErrorState.svelte` (bukan crash), TanStack Query retry otomatis. |

## 5. Spesifikasi API

| Endpoint | Method | Output |
|---|---|---|
| `/api/clusters` | GET | cluster aktif: id, label, member_count, growth_rate, sparkline points, status |
| `/api/clusters/trending?window=1h` | GET | top N cluster paling cepat tumbuh |
| `/api/clusters/:id/tokens` | GET | token dalam cluster, urut created_at |
| `/api/clusters/:id/share-card` | GET | data kartu share |
| `/api/clusters/track-record` | GET | cluster dengan `ever_reached_breakout=true`, urut archived_at, termasuk `peak_member_count` dan `peak_growth_rate` |
| `/api/cron/cluster` | POST (protected) | trigger clustering service |
| `/api/cron/post-update` | POST (protected) | cek cluster breakout baru sejak terakhir post → post ke X kalau ada |

## 6. Free-First Infrastructure Checkpoint

```
SERVICE: Data source (Pump.fun launch events)
WHY REQUIRED: ini sumber data intinya
CAN WE REMOVE IT: tidak
FREE TIER: Pump.fun sendiri TIDAK punya API resmi publik — tapi datanya bisa
diakses gratis lewat program on-chain Solana-nya via pihak ketiga, mis.
PumpPortal.fun (Data API mereka gratis, kena rate limit; Trading API-nya
yang berbayar 0.5%/transaksi, tapi kita cuma butuh Data API). Cek limit
rate terkini saat build.
WHAT HAPPENS AT LIMIT: pindah provider gratis lain, atau jalankan listener
sendiri ke program Solana-nya Pump.fun langsung (butuh RPC, banyak yang
punya free tier juga)
MIGRATION PATH: ganti client di lib/server/integrations/pumpfun/
ENV REQUIRED: tergantung provider yang dipilih (beberapa tidak butuh key)

SERVICE: Embedding API (kemiripan teks)
WHY REQUIRED: inti mekanisme clustering
CAN WE REMOVE IT: tidak
FREE TIER: cek limit vendor terkini saat build
WHAT HAPPENS AT LIMIT: batch lebih jarang, atau turun ke model lokal kecil
MIGRATION PATH: ganti client di lib/server/integrations/embedding/
ENV REQUIRED: EMBEDDING_API_KEY (private)

SERVICE: Database (cache cluster)
WHY REQUIRED: hasil harus di-cache, bukan dihitung ulang tiap request
CAN WE REMOVE IT: tidak
FREE TIER: **Supabase** — 500 MB storage, tanpa kartu kredit (dicek per
Juni 2026). Catatan: project gratis auto-pause kalau 7 hari tanpa
aktivitas — tapi worker cron kita nulis ke DB tiap 2-5 menit terus,
jadi praktisnya tidak akan pernah idle selama cron-nya jalan
WHAT HAPPENS AT LIMIT: prune cluster archived, atau upgrade ke Pro ($25/bln)
MIGRATION PATH: Drizzle abstrak driver-nya, migrasi murah
ENV REQUIRED: DATABASE_URL, SUPABASE_ANON_KEY (private)

SERVICE: Cron scheduler
WHY REQUIRED: clustering harus jalan berkala
CAN WE REMOVE IT: tidak
FREE TIER: GitHub Actions scheduled workflow, atau cron-job.org free tier
WHAT HAPPENS AT LIMIT: kurangi frekuensi (2-5 menit → 10 menit)
MIGRATION PATH: scheduler apa pun yang bisa POST ke endpoint bisa dipakai
ENV REQUIRED: CRON_SECRET (private)

SERVICE: LLM API (pelabelan cluster, bagian 4a)
WHY REQUIRED: cluster butuh nama yang bisa dibaca orang, sekali per cluster
CAN WE REMOVE IT: tidak sepenuhnya — tanpa ini cluster cuma jadi ID, produk
kehilangan intinya. Bisa DIKURANGI biayanya: pakai model paling murah yang
ada, request-nya kecil (beberapa nama token in, beberapa kata out)
FREE TIER: cek vendor terkini — beberapa provider punya tier gratis kecil
yang mungkin cukup kalau cluster baru tidak terlalu sering terbentuk
WHAT HAPPENS AT LIMIT: cluster baru sementara tampil pakai nama token
pertamanya sebagai fallback, label LLM menyusul begitu kuota reset
MIGRATION PATH: ganti model/vendor di service yang sama dengan embedding,
atau pisah client sendiri kalau vendornya beda
ENV REQUIRED: tergantung vendor yang dipilih (mungkin reuse EMBEDDING_API_KEY
kalau satu vendor yang sama nyediain keduanya)

SERVICE: X API (posting bot, V1.1)
WHY REQUIRED: distribusi otomatis, bagian 2e
CAN WE REMOVE IT: **ya, ini opsional** — kalau mau tetap $0 total, skip fitur
ini dan pakai share button manual saja (sudah ada di V1 inti)
FREE TIER: **tidak ada** sejak Februari 2026 — pay-per-use, ~$0.015/post.
Event-triggered (posting cuma pas ada breakout baru) diperkirakan < $2-3/bulan
WHAT HAPPENS AT LIMIT: tidak ada limit gratis yang bisa "habis" — ini murni
biaya per pemakaian, jadi kontrolnya di frekuensi post, bukan limit tier
MIGRATION PATH: kalau biayanya kerasa, matikan cron post-update, kartu share
manual tetap jalan tanpa X API sama sekali
ENV REQUIRED: X_API_KEY, X_API_SECRET (private)
```

## 7. Mekanisme Sticky Footer Reveal (untuk agent)

Dipasang di penutup halaman `(marketing)`, setelah CTA terakhir. Sebut ke agent sebagai **"sticky footer reveal"** (alternatif: *footer reveal on scroll*, *fixed footer reveal*, *curtain reveal*, *peel away footer*) — jelaskan mekanismenya juga, istilahnya sering ditafsirkan macam-macam.

Tiga hal yang bikin jalan, tanpa library:

1. Footer: `position: fixed; bottom: 0;`, z-index **rendah**
2. Semua konten di atasnya dibungkus **satu wrapper**, z-index lebih tinggi + **background solid** — paling sering kelupaan, tanpa ini footer nembus
3. Spacer 100vh **di luar** wrapper — nyediain jarak scroll biar tirainya keangkat

Kalau agent nambah ScrollTrigger buat animasi ekstra: jangan pasang trigger ke footer yang fixed (pakai spacer-nya), dan panggil `ScrollTrigger.refresh()` setelah spacer masuk DOM.

## 8. Keadaan Sepi (Empty State)

`EmptyState.svelte`. Isinya: indikator "terakhir ada aktivitas X menit lalu" saat benar-benar sepi, baris cluster yang baru redup ditinggalkan pudar sebentar (bukan langsung hilang).

## 9. Bahasa

Brief ini: Bahasa Indonesia. Semua teks di produk (UI, label, copy): Bahasa Inggris.

## 10. Urutan Build

| # | Langkah | Output |
|---|---|---|
| 1 | Schema DB (Drizzle) + repository | migration jalan, `bun run db:push` sukses |
| 2 | Integrasi Pump.fun + embedding client | token baru bisa ditarik & di-embed lewat script test |
| 3 | `clustering.service.ts` | assign/merge teruji lepas dari UI |
| 4 | Endpoint `api/clusters/*` + `api/cron/cluster` | response sesuai spesifikasi bagian 5 |
| 5 | `SignalList` dengan data dummy | UI render benar dari data statis |
| 6 | Sambung TanStack Query | dashboard update sendiri tanpa refresh |
| 7 | `(marketing)` + sticky footer reveal | halaman lengkap, dashboard live demo langsung setelah hero |
| 8 | EmptyState + kartu share | tetap enak dilihat saat sepi, kartu bisa di-screenshot rapi |

**V1.1 (X bot + track record) dikerjakan SETELAH 8 langkah di atas selesai dan V1 inti sudah jalan** — bukan diselipkan di tengah, biar V1 inti tidak keburu rumit sebelum jalan.

## 11. Checklist "Selesai 100%"

- [ ] Tidak ada login/akun di mana pun
- [ ] CTA "Open the radar" di hero mengarah langsung ke `/radar` — bukan dikubur di bawah banyak section marketing dulu
- [ ] Endpoint cron protected
- [ ] Clustering incremental, hasil tersimpan, tidak dihitung ulang tiap request
- [ ] Sticky footer reveal jalan tanpa footer "nembus" wrapper
- [ ] Klik tema menampilkan token list benar, urut waktu
- [ ] Kartu share bisa di-screenshot rapi
- [ ] Semua teks UI Bahasa Inggris
- [ ] Tidak ada API key di client bundle
- [ ] Tiap service eksternal sudah lolos Free-First Checkpoint (bagian 6)
- [ ] 4 kegagalan di bagian 4c sudah ditangani, bukan cuma di-assume tidak akan terjadi
- [ ] Cluster dapat label dari LLM sekali di anggota ke-2/3 (bagian 4a) — bukan hardcode, bukan re-generate tiap update
- [ ] Skema `tokens` dan `clusters` di bagian 4b diimplementasikan persis, termasuk kolom yang gampang kelewat (`ever_reached_breakout`, `status` enum)
- [ ] `sparkline_points`, `peak_member_count`, `peak_growth_rate` ke-update tiap RECOMPUTE — bukan dihitung ulang saat request
- [ ] `image_url` tampil sebagai thumbnail di signal row dan token list (V1, bukan ditunda)
- [ ] X bot cuma post pas event breakout baru (bukan jadwal tetap) — sesuai bagian 2e
- [ ] Biaya X API sudah disadari dan diterima (bukan $0), atau fitur ini di-skip kalau mau tetap full gratis
- [ ] `ever_reached_breakout` tidak pernah di-unset — track record tetap jujur walau cluster-nya sudah redup

## 12. Pertanyaan Terbuka

- Nama final: Tycho / Fujita / Howard / lainnya?
- Sumber data: Pump.fun saja dulu, atau langsung include Base?
- Jendela waktu radar: berapa lama token dianggap "baru"?
- Threshold similarity final — butuh eksperimen data asli
- Vendor embedding API mana, dan berapa limit free-tier-nya saat ini?
- Cron scheduler dipasang di mana?
- Vendor LLM buat pelabelan cluster (bagian 4a) — model apa, apa satu vendor sama dengan embedding atau beda
- Rate limiting di endpoint publik (`/api/clusters`, `/api/clusters/track-record`) — belum dispesifikasikan, worth dipikirkan sebelum production supaya tidak ada yang scraping berlebihan dan menghabiskan kuota Supabase
- SEO dasar buat `(marketing)` — title/description/OG image belum disebut, kecil tapi kelupaan gampang

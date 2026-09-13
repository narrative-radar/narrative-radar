# Handoff: 13 September 2026 (v4 Final)

## Apa yang Berubah Hari Ini
- **Migrasi & Backfill Data**: Mengganti sumber data DexScreener yang menghasilkan token kembar ke GeckoTerminal. Berhasil mem-backfill pool Robinhood dan meng-embed semuanya hingga mencapai total 607 token murni organik tanpa data statis/palsu.
- **Pembersihan Angka Palsu**: Metrik persentase growth (`+14700%`) dihapus dan diganti menjadi angka absolut (`+147 in 24h` atau `—`). Data statis (proyeksi OPUS, dan angka hardcode lain) dibuang dari UI di local dan Vercel production.
- **Perbaikan Labeling Pipeline**: Memperbaiki fallback LLM yang gagal dengan metode *frequency count*, pengenalan substring, dan deteksi CJK. Menambahkan Claude API sebagai backup (walau gagal dan harus dikoreksi besok).
- **Logika UI**: Memperbaiki perhitungan umur (age) di panel detail berdasarkan waktu lahir token tertua, bukan waktu record cluster dibuat. Memperbaiki kriteria `/track-record` yang kini hanya menampilkan cluster `cooling` atau `archived`.

## Angka Final Database
- **Total Token**: 607 (Semua memiliki embedding)
- **Total Active Clusters**: 15
- **Daftar 15 Label Tema Saat Ini**:
  1. `finance`
  2. `cat`
  3. `just`
  4. `alinu`
  5. `ponzi`
  6. `stock`
  7. `chad`
  8. `币`
  9. `oil`
  10. `中`
  11. `罗`
  12. `bond`
  13. `富`
  14. `hood`
  15. `hunter`

## Bug yang Ditemukan & Status Perbaikannya
- **Limit Gemini 20 req/hari**: Ditemukan saat relabel ulang. Status: Ditambahkan fallback ke Claude & fallback frekuensi lokal.
- **Cluster 1-Kata/Unnamed**: Fallback pertama membuang 1-kata yang valid karena stopwords atau karakter non-spasi (CJK). Status: Telah diselamatkan dengan algoritma substring >= 4 huruf dan deteksi karakter CJK.
- **Presentase Growth yang Absurd**: Basis token yang kecil membuat % rusak. Status: Diubah jadi selisih *member_count* absolut, disortir berdasar jumlah *memberCount*.

## TODO Besok (3 Koreksi Penting)
1. **Model Claude**: Ubah model Claude di `labeling.service.ts` menjadi `claude-haiku-4-5-20251001`. (Model `claude-3-haiku-20240307` error 404).
2. **CJK Minimal 2 Karakter**: Label karakter CJK seperti `币`, `中`, `罗`, `富` terlalu generik. Besok wajib naikkan syarat minimal jadi 2 karakter untuk CJK, atau beralih ke kandidat lain.
3. **Update Stopwords**: Masukkan kata `just` ke dalam `STOP_WORDS` karena saat ini lolos menjadi label tema.

## Status Cron & Infrastruktur
- **Cron**: Saat ini **MATI** (scheduler: off di UI). Belum ada cron runner otomatis.
- **Persiapan Cron Besok**: Perlu setup GitHub Actions yang hit `/api/cron`. Butuh menyiapkan `CRON_URL` dan `CRON_SECRET` di GitHub Secrets.
- **Limit API**: Harap diperhatikan bahwa model `gemini-2.5-flash` dari Google AI Studio mentok di batas **20 request/hari** pada free tier. Claude akan jadi bumper utamanya besok.

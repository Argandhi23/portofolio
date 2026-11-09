# Audit portofolio — 7 November 2026

## Kondisi awal dan batas tindakan

- Workspace: `C:\Projects\portofolio`; branch: `main`. Git normal.
- Perubahan awal pengguna: aset untracked `public/Argandhi Avatar.vrm`; dipertahankan.
- Membaca AGENTS.md, README.md, DESIGN_SYSTEM.md, konfigurasi Next/TypeScript/ESLint/Vitest/Playwright/CI/Vercel, dan `.env.example`. Isi file kredensial tidak dibaca atau dicetak. Next build memakai konfigurasi lingkungan yang sudah ada tanpa menampilkan nilainya.
- Pemetaan meliputi route publik/admin/auth/API, Server Actions, Supabase client/guard/middleware, validasi, query cache, Markdown, upload, motion, komponen interaktif, tipe, SQL, dan tes. Dependency, build output, serta aset biner dikecualikan dari audit source; dokumentasi Next yang terpasang dibaca sesuai AGENTS.md.
- Tidak ada commit, push, deploy, instalasi dependency, perubahan Git config, pembacaan data privat, atau migration eksternal. Build/SSG membaca konten publik melalui query yang sudah ada. Browser tests memblokir `/api/track`; tidak mengirim inquiry atau mutasi admin sungguhan.

## Temuan dan implementasi

| Prioritas | Lokasi | Bukti/kondisi pemicu dan dampak | Perbaikan |
| --- | --- | --- | --- |
| Tinggi | `src/actions/project.actions.ts`, `brand.actions.ts`, `settings.actions.ts` | File lama dihapus sebelum update/delete database. Jika save gagal (misalnya slug duplikat), row lama masih menunjuk file yang sudah hilang. | Database disimpan/dihapus terlebih dahulu; kegagalan membaca state lama membatalkan perubahan. Cleanup failure dilaporkan terpisah dari keberhasilan save. |
| Tinggi | `src/actions/project.actions.ts`, `src/actions/storage.actions.ts` | Thumbnail dipindahkan ke galeri atau URL dipakai row lain: cleanup sebelumnya menghapus file yang masih dipakai. | Bandingkan gabungan thumbnail+galeri; verifikasi referensi projects/brands/settings sebelum menghapus URL bucket kanonis. Gagal mengecek referensi berarti file dipertahankan. |
| Tinggi | `src/lib/file-security.ts` | Denylist sebelumnya menerima SVG dengan hyperlink berprotokol yang diobfuscate entity atau elemen animasi yang mengubah atribut aktif. Berbahaya ketika SVG dibuka sebagai dokumen. | Batasi SVG ke subset elemen vektor statis dan referensi fragment lokal; tolak animation/hyperlink/embedded content/entity/CSS escape. Ini pemeriksaan penerimaan yang konservatif, bukan sanitizer XML umum. |
| Sedang | `src/lib/file-security.ts` | Brand generik `mif1` diterima sebagai AVIF walau bukan bukti format AVIF. | Harus memiliki brand `avif`/`avis`; validasi signature tidak diklaim sebagai full image decoding. |
| Sedang | `src/lib/validations/{project,brand,settings,url}.schema.ts` | `.url()` menerima protokol non-web; `cta_url` sebelumnya string bebas. Link dapat tersimpan tetapi tidak aman/tidak berfungsi seperti web URL. | Skema bersama HTTP(S), path lokal tunggal, dan anchor; media menolak protocol-relative path. |
| Sedang | `src/actions/{project,service,brand,inquiry,storage,auth}.actions.ts` | Tipe TS tidak memvalidasi payload POST runtime; ID/toggle/upload/delete/reset belum semuanya memakai Zod. Storage deletion juga memvalidasi sebelum guard. | Tambah safeParse ID/boolean/enum/File/folder/daftar path/email; guard admin didahulukan, termasuk logout dan batch kosong. |
| Sedang | `src/actions/auth.actions.ts`, `src/app/(auth)/auth/callback/route.ts`, `reset-password/page.tsx` | Recovery email menuju login tanpa pertukaran PKCE atau form password baru; pemulihan tidak lengkap. | Callback menukar code, memverifikasi getUser/email admin, membuka form dengan validasi konfirmasi, lalu update password dan sign-out. Redirect tujuan tetap; query `next` eksternal diabaikan. |
| Sedang | `src/lib/rate-limit.ts`, `src/app/api/track/route.ts` | Cleanup memakai window request pemicu untuk semua bucket, sehingga chat 1 menit dapat menghapus batas inquiry 10 menit. Map juga tidak punya hard cap efektif. Track route tidak punya pembatas aplikasi. | Expiry per bucket, kapasitas 2.000 key dengan penolakan key baru saat penuh, dan batas track per IP. Batas distribusi/direct DB tetap berlaku (lihat bawah). |
| Sedang | `src/lib/queries/portfolio.queries.ts` | Hasil services/brands kosong setelah semua dinonaktifkan diganti default, sehingga konten yang dinonaktifkan muncul lagi. | Empty success tetap `[]`; fallback hanya ketika read gagal/tidak tersedia. |
| Sedang | `src/components/motion/GsapProjectsStage.tsx` | Reduced motion menghentikan horizontal tween, tetapi desktop tetap row dengan overflow hidden; kartu berikutnya terpotong. | Layout vertikal dengan tinggi otomatis untuk reduced motion; browser memeriksa seluruh kartu dalam lebar viewport. |
| Sedang | `src/components/public/ImageLightbox.tsx`, `PublicNavbar.tsx`, `src/components/admin/LoginForm.tsx` | Lightbox tidak memindahkan/menahan/mengembalikan fokus; navbar tersembunyi tetap tabbable; tombol tampil password dikeluarkan dari urutan keyboard. | Focus trap lightbox, restore fokus/overflow, outline fokus, inert pada nav tersembunyi, tombol password kembali bisa diakses keyboard. |
| Sedang | `src/components/motion/HeroEyePortal.tsx` | Fragment seperti `#[` dipakai langsung sebagai CSS selector dan bisa melempar exception saat pemasangan controller. | Cari ID melalui decode terjaga; fragment rusak/tidak ditemukan tidak memutus controller. |
| Sedang | `next.config.ts` | Baseline build gagal saat proses loader CSS Turbopack keluar sebelum koneksi, termasuk di luar sandbox. | Gunakan strategi `workerThreads` yang didokumentasikan Next 16.4 terpasang. Build berhasil sesudah perubahan; opsi ini experimental. |
| Rendah | `CopyEmailButton.tsx`, `LanguageProvider.tsx` | Clipboard gagal tetap menampilkan Copied; localStorage gagal membuat atribut bahasa HTML tidak ikut berubah. | Tampilkan kegagalan salin dengan benar; timer dibersihkan; atribut bahasa diperbarui di luar try penyimpanan. |
| Rendah | `SpotlightCard.tsx`, `GsapContactCockpit.tsx`, `ChatWidget.tsx`, `ProjectsArchiveGrid.tsx` | RAF spotlight tidak dibatalkan saat unmount; tween magnetic dibuat setelah context callback; beberapa interaksi tetap bergerak pada reduced motion. | Cleanup RAF/tween dan hentikan gerak terkait ketika reduced motion aktif. |
| Rendah | `VisitorAnalyticsPanel.tsx`, README.md, halaman publik | Statistik dari 1.000 row terbaru diberi label seolah seluruh histori. README mendeskripsikan stack motion/warna lama. Traffic lights palsu melanggar aturan desain eksplisit. | Label sampel dan batas data dibuat jelas; dokumentasi diselaraskan; hapus tiga titik browser palsu, pertahankan metadata dan gambar. |

Refaktor dibatasi ke skema URL bersama dan satu jalur batch cleanup agar validasi dan pengecekan referensi konsisten. Tidak ada rewrite arsitektur atau upgrade dependency.

## Verifikasi

Baseline: typecheck dan lint lulus, 9 file / 66 unit test lulus. Build baseline gagal pada loader CSS Turbopack.

Hasil akhir:

- `npm run typecheck`: lulus.
- `npm run lint`: lulus.
- `npm run test`: 14 file, 104 test lulus.
- `npm run build`: lulus; halaman publik tetap static/SSG dengan cache 1 hari, admin/API/recovery dinamis.
- Playwright Chromium, port lokal terpisah, desktop 1440×900 dan mobile 390×844: 15 test lulus (run terakhir 13,4 detik). Tes meliputi navigasi, portal hero, reduced motion, lightbox keyboard, bahasa, endpoint tanpa secret, recovery tanpa sesi, fragment rusak, dan clipboard ditolak.
- Screenshot arsip desktop/mobile diperiksa secara visual. Ini tidak menggantikan pengujian seluruh kombinasi perangkat.
- `npm audit --omit=dev --json`: nol advisory dependency produksi dari registry pada waktu pemeriksaan. Tidak menilai seluruh dependency pengembangan dan bukan bukti ketiadaan vulnerability.
- `git diff --check`: tidak ada whitespace error; warning normal LF/CRLF Git dicatat.

Playwright pertama di sandbox tidak melewati startup; percobaan dihentikan dan pengujian dijalankan di luar sandbox. Tes navbar lama mengasumsikan scroll dokumen langsung saat portal masih terkunci; diganti interaksi wheel bertahap (controller memang membatasi setiap wheel ke 0,34 scrub) dan memverifikasi fase about sebelum nav. Ekspektasi fitur tidak dihapus.

## Risiko tersisa dan yang belum diverifikasi

1. **Sedang — abuse lintas instance/direct Supabase.** Rate limiter hanya per proses dan IP harus berasal dari proxy tepercaya. `supabase/schema.sql` secara sengaja mengizinkan anon INSERT inquiry/page_views: request langsung ke Supabase melewati limiter aplikasi. Menutupnya memerlukan desain kebijakan DB/edge yang terpisah; tidak diubah tanpa keputusan infrastruktur.
2. **Sedang — cleanup belum transaksional.** Database dan Storage terpisah; concurrent edits antara reference check dan remove masih bisa berlomba. Referensi cleanup memeriksa URL kanonis yang dihasilkan uploader; Review lanjutan memperbaiki pencocokan query-string/fragment/encoded-path pada origin bucket yang sama; alias hostname/domain atau endpoint storage lain belum disetarakan. Upload dibatalkan atau kegagalan Storage dapat meninggalkan orphan. Tidak melakukan penghapusan massal otomatis; perlukan retry/rekonsiliasi yang direview.
3. **Belum diverifikasi — deployment Supabase.** SQL repository memakai email placeholder dalam `is_admin()`. Ini bukti template membutuhkan konfigurasi, bukan bukti kebijakan remote salah. RLS/grants/storage bucket/limit/MIME dan email admin yang benar-benar terpasang belum diperiksa.
4. **Belum diverifikasi — alur admin hidup.** CRUD/storage/recovery diuji dengan mock otorisasi dan respons database; tidak login sebagai admin, membaca data klien/visitor, mengirim email pemulihan sungguhan, atau menulis database production. Form/redirect recovery nyata, SMTP, expiry token, redirect allowlist, serta PKCE cookie perlu staging.
5. **Belum diverifikasi — provider LLM/deployment.** API model Gemini/Groq, quota, dan hasil live provider tidak dipanggil untuk audit. CI tidak dieksekusi di GitHub dan deploy/Vercel Cron tidak dijalankan. Unit chatbot tetap lulus.
6. **Rendah — deprecation middleware.** Next masih menerima `src/middleware.ts` tetapi memperingatkan penggunaan `proxy`. Dipertahankan karena struktur tersebut diwajibkan AGENTS.md; migrasi perlu menyelaraskan aturan proyek, bukan sekadar mengganti file sepihak.
7. Browser yang diuji Chromium. Safari/Firefox, screen reader nyata, real-device GPU/performance, load test, serta perubahan prefers-reduced-motion di tengah sesi pada setiap komponen belum diverifikasi. Tidak ada klaim peningkatan bundle/Lighthouse tanpa pengukuran.

## Sebelum rilis

- Review diff lokal, khususnya pembatasan SVG dan callback pemulihan.
- Di staging, cocokkan email RLS `is_admin()` dengan ADMIN_EMAIL dan tinjau kebijakan tabel/storage terpasang; jangan menjalankan ulang seed/schema membabi buta di production.
- Tambahkan origin situs yang benar + `/auth/callback` ke Supabase Auth Redirect URLs. Minta dan buka recovery link di browser yang sama (PKCE), uji sukses/token kedaluwarsa/non-admin, lalu uji login dan logout.
- Uji CRUD, unpublished project, ganti/hapus media, media bersama, serta revalidasi cache memakai data staging terisolasi. Review/retry cleanup warning dari Storage.
- Putuskan kebutuhan pembatasan terdistribusi/DB untuk public insert, serta review orphan media dan URL alias sebelum pembersihan manual.
- Validasi build pada runtime deploy dan secret CRON_SECRET/REVALIDATE_SECRET lewat konfigurasi layanan, tanpa memasukkannya ke source.


## Review implementasi terfokus (lanjutan)

Review ini dibatasi ke urutan DB/cleanup, subset SVG, recovery, dan workerThreads; bukan audit ulang proyek.

- **Tinggi, diperbaiki — SVG:** pemeriksaan sebelumnya hanya memeriksa tag dan sebagian nilai href. Nilai href multiline dapat lolos match, `xml:base` dapat mengubah tujuan fragment, dan atribut style tidak dibatasi. Sekarang grammar penerimaan mengonsumsi seluruh markup, memeriksa keseimbangan/satu root, atribut allowlist dengan nilai quoted, namespace root yang tetap, serta referensi fragment lokal. Style, atribut asing, duplikat, unquoted, DTD/entity, komentar, dan struktur tak didukung ditolak. Ini sengaja menolak sebagian SVG valid; bukan parser/sanitizer XML umum. Tes mencakup contoh yang membuktikan celah lama dan SVG statis yang tetap diterima.
- **Sedang, diperbaiki — media bersama:** query exact-URL sebelumnya hanya melindungi URL kanonis. Cleanup sekarang memindai kolom referensi secara berhalaman dan menormalisasi query/fragment/encoded-path ke objek pada origin bucket yang sama. Pembacaan berakhir pada halaman kosong, bukan asumsi batas respons 200/1.000; data hilang/error mempertahankan file. Path penghapusan dideduplikasi. Biaya scan hanya saat cleanup admin, tidak pada halaman publik. Race antara scan dan remove tetap ada dan tidak diklaim selesai.
- **Sedang, diperbaiki — peringatan cleanup:** sebelumnya ActionResult mengandung pesan, tetapi beberapa UI membuangnya saat redirect/menutup form. Field opsional `warning` ditambahkan tanpa mengubah field wajib atau arti success; admin menerima alert sebelum row/form hilang, settings menampilkan pesan action. Penyimpanan yang berhasil tidak dilabeli gagal karena cleanup.
- **Sedang, diperbaiki — recovery:** callback kini mengembalikan redirect aman pada exception provider; penolakan non-admin mencoba sign-out lokal tanpa mencabut sesi perangkat lain. Setelah password berhasil diperbarui, error/exception sign-out dilaporkan sebagai keadaan parsial (password sudah berubah, sesi belum selesai), tidak mengklaim logout berhasil. Halaman/action tetap mengizinkan setiap sesi admin yang diverifikasi, bukan hanya sesi bertanda recovery; tidak ada klaim bukti jenis email dari parameter callback. Perilaku cookie PKCE/SMTP/provider/policy password nyata tetap perlu staging.
- **Rendah, diperbaiki — workerThreads:** percobaan lama membuktikan kegagalan loader pada lingkungan audit dan keberhasilan setelah mengganti strategi; tidak membuktikan akar penyebab universal pada Windows. Workaround sekarang hanya aktif pada `process.platform === 'win32'`; Linux/macOS memakai default Next. Dokumentasi paket Next 16.4.2 menyatakan opsi ada sejak 16.4.0, experimental, dan Node 24.13.1+ tertentu fallback ke childProcesses akibat native-addon teardown. Tidak memakai forceWorkerThreads. Linux CI Node 22, Node 24 yang terdampak, dan runtime hosting belum dijalankan pada review ini.

Verifikasi review: typecheck, lint, 14 file/120 unit test lulus. Build ulang diarahkan ke `http://127.0.0.1:9` dengan kredensial placeholder dan origin localhost, sehingga tidak mengakses Supabase production. Percobaan sandbox gagal mengambil Google Font; rerun di luar sandbox berhasil. Error fetch data loopback yang memang mati adalah expected; build memakai fallback dan sebagian cache publik lokal yang sudah ada. Hasil ini memverifikasi kompilasi, bukan data staging atau kesegaran cache. Artifact `.next` terakhir berasal dari konfigurasi uji ini; harus dibangun ulang dengan konfigurasi staging yang benar sebelum uji layanan/rilis. Hasil 15 Playwright di bagian sebelumnya adalah hasil audit sebelumnya, tidak dijalankan ulang dalam review terfokus ini.

Seluruh uji berakses layanan pada [STAGING_CHECKLIST.md](./STAGING_CHECKLIST.md) masih BELUM DIJALANKAN. Tidak mengakses production, mengirim email, mengeksekusi migration, commit, push, atau deploy pada review ini.


## Pengujian fixture production berizin — 7–8 November 2026

Pemilik mengizinkan pengujian fixture baru pada database production dengan larangan menyentuh data/media lama, konfigurasi, settings, password, email/recovery, serta deployment. Kode dijalankan lokal melalui next dev dan proxy yang memblokir tracking dan rute data privat.

Hasil lengkap: [RESULTS.md](PRODUCTION_TEST_RESULTS.md). Bukti UUID/key dan status: `manifest.json` (bukti lokal di `audit-runs/`, tidak disertakan dalam Git). Checklist mendapat bagian hasil khusus; matriks staging yang belum dijalankan tidak otomatis dianggap lulus.

- **PASS:** login manual, draft/edit/validasi URL, dua upload PNG baru, ganti thumbnail dan cleanup, media bersama dua fixture, publish/unpublish singkat tanpa featured, invalidasi detail/list/sitemap lokal, CRUD brand/service baru nonaktif, penolakan anon pada fixture, serta cleanup akhir.
- **Cleanup terkonfirmasi:** 2 project + 1 brand + 1 service dan 2 object Storage dibuat; SELECT read-only memakai UUID/key persis menunjukkan seluruhnya 0 tersisa. Tidak ada cleanup berdasarkan pola nama atau perubahan konten lama yang disengaja. Tidak ada snapshot menyeluruh yang membuktikan seluruh production identik.
- **Metadata nyata:** RLS/policies target, trigger dan FK diperiksa read-only sebelum mutasi. Bucket public, limit 5MB, daftar MIME sesuai. Overview menampilkan Last backup No backups; backup di luar layanan belum diketahui. Tidak mengubah pengaturan.
- **Temuan lokal sedang:** header admin mobile sebelumnya tidak merender logout. Ditambahkan komponen LogoutButton yang sama; tombol terlihat pada 390×844 dan logout resmi berhasil, kemudian admin kembali ditolak ke login.
- **Pembatasan efek logout:** SDK auth terpasang default ke scope global. Logout biasa kini eksplisit scope local agar tidak meminta pencabutan sesi perangkat lain. Argumen diuji dengan mock sebelum flow nyata; tidak membaca sesi perangkat lain. Reset password tidak diubah/dijalankan pada sesi ini.
- **Verifikasi lokal:** typecheck, lint, 14 file / 123 unit test dan build lulus. Build akhir memakai loopback placeholder untuk kompilasi; bukan artifact yang dipakai fixture dan bukan artifact siap deploy. Flow fixture memakai next dev terbaru dengan koneksi production nyata. Tidak mengulang audit atau suite browser lama di luar kebutuhan.
- **BLOCKED/belum diuji:** akun non-admin terautentikasi terpisah tidak tersedia; CRON_SECRET/REVALIDATE_SECRET lokal tidak terkonfigurasi sehingga hanya penolakan 401/metode 405 yang diuji. Email/recovery/password/settings/inquiry/analytics/abuse tetap tidak dijalankan sesuai larangan pengguna. Runtime deployed, Linux/Node lain, dan concurrency cleanup belum terverifikasi.

Server/proxy lokal uji dihentikan setelah pemeriksaan; tidak ada commit, push, migration, perubahan layanan, atau deploy.

# Staging checklist

Dokumen ini adalah rencana uji, bukan izin menjalankan layanan. Semua baris layanan **BELUM DIJALANKAN** pada review lokal ini. Jangan gunakan project, akun, bucket, email, domain, atau secret production.

## Identitas pelaksanaan

| Item | Nilai yang diisi pelaksana |
| --- | --- |
| Tanggal / penguji | — |
| Revisi source / diff yang diuji | — |
| Origin aplikasi staging | — |
| Project ref / origin Supabase staging (tanpa key) | — |
| OS / arsitektur / versi Node dan Next | — |
| Identitas fixture admin / non-admin (alias, bukan password/token) | — |
| Bukti hasil tersanitasi | — |

Isi hasil aktual dengan PASS / FAIL / BLOCKED, observasi, waktu, dan tautan bukti tersanitasi. Tanda `—` bukan PASS. Jangan lampirkan password, token, PKCE code/verifier, Authorization header, recovery URL aktif, atau data orang sungguhan.

## A. Lokal, tanpa akses layanan

Hasil di bagian ini berasal dari review terfokus. Tes memakai mock atau konfigurasi Supabase loopback, bukan staging. Tidak perlu mengulang pemeriksaan yang lulus kecuali source/runtime berubah.

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| L01 | Jalankan typecheck, lint, unit test setelah perubahan keamanan/cleanup/recovery. | Semua lulus; regresi meliputi DB gagal, file dipakai ulang, URL alias/paginasi, SVG multiline/xml:base/struktur invalid, callback gagal, dan sign-out gagal. | Typecheck dan lint lulus; 14 file / 120 unit test lulus. |
| L02 | Build dengan URL Supabase loopback tidak aktif, anon key placeholder, origin localhost, dan admin dummy. | Kompilasi berhasil; fetch data lokal gagal dan memakai fallback. Tidak ada request ke Supabase production. | Lulus di Windows Node 22.20, Next 16.4.2; rerun di luar sandbox diperlukan untuk mengambil Google Font. Bukan bukti data/cache layanan. |
| L03 | Review next.config dan panduan Next terpasang tentang turbopackPluginRuntimeStrategy. | Windows memakai workerThreads; platform lain tidak mengatur opsi. Tidak ada forceWorkerThreads. Opsi experimental dan fallback Node terdampak dicatat. | Sesuai source dan panduan paket; matriks runtime lain belum dijalankan. |
| L04 | Review diff urutan mutasi dan cleanup serta UI warning. | Guard/validasi → baca media lama → mutasi DB berhasil → cek referensi → remove → revalidasi; DB gagal tidak memanggil remove. Warning tidak hilang saat navigasi. | Unit regression dan review source lulus; interaksi UI dengan kegagalan Storage nyata menunggu M06. |

**Artifact lokal:** `.next` terakhir dibangun dengan konfigurasi placeholder. Jangan gunakan artifact ini untuk uji layanan atau deploy. Pelaksana staging perlu build baru memakai konfigurasi staging yang sudah dikonfirmasi; jangan memakai ulang cache hasil build lokal sebagai bukti data staging.

## B. Memerlukan akses layanan staging — prasyarat

Bagian B–G belum dijalankan. Pelaksana harus memiliki otorisasi terpisah untuk login, email, dan perubahan data sintetis staging. Jika prasyarat gagal, tandai BLOCKED dan hentikan baris yang bergantung padanya.

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| P01 | Cocokkan origin app dan project ref Supabase dengan staging sebelum setiap sesi uji; gunakan konfigurasi eksplisit. | Keduanya staging; tidak ada domain/ref production. | BELUM DIJALANKAN — |
| P02 | Inspeksi konfigurasi deployed tanpa menjalankan migration: RLS/grants, fungsi is_admin, policies seluruh tabel, bucket portfolio-media dan batas/MIME. | Email fungsi is_admin cocok ADMIN_EMAIL; policies sama tujuan dengan schema.sql. Perbedaan dicatat, tidak diasumsikan sudah terpasang. | BELUM DIJALANKAN — |
| P03 | Siapkan sesi browser terpisah: pengunjung tanpa cookie, user non-admin terautentikasi, admin. Untuk direct SDK gunakan anon key + token user sesuai peran. | Tidak memakai service-role key; sesi tidak saling tercampur. Login app non-admin dapat ditolak, jadi direct RLS non-admin diuji dengan sesi SDK staging tersendiri. | BELUM DIJALANKAN — |
| P04 | Siapkan hanya fixture sintetis bertanda audit-staging: project published dan draft, brand/service aktif dan nonaktif, inquiry/page_view dummy, gambar A/B/C. Catat UUID dan object key persis. | Fixture terisolasi dan bisa dikenali; tidak memakai pesan/visitor asli. Tidak menjalankan schema/seed ulang untuk membuat fixture. | BELUM DIJALANKAN — |
| P05 | Konfirmasi origin/site URL, redirect allowlist `/auth/callback`, email template recovery yang mendukung PKCE code, test mailbox, kebijakan password dan rate limit provider. | Link mengarah staging; akun admin test dan mailbox dimiliki penguji. Tidak ada email dikirim pada tahap inspeksi. | BELUM DIJALANKAN — |

## C. RLS dan Storage, direct API/SDK serta aplikasi

Jangan hanya melihat HTTP status: SELECT yang dibatasi dapat mengembalikan array kosong, UPDATE/DELETE dapat memengaruhi nol row. Bandingkan state fixture lewat sesi admin setelah setiap upaya. Untuk pemeriksaan negatif jangan menebak ID data non-fixture.

| ID / peran | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| R01 / pengunjung | SELECT settings, services/brands aktif dan nonaktif, projects published dan draft lewat anon SDK. | Settings publik; hanya services/brands aktif dan projects published terlihat. Draft/nonaktif tidak terlihat. | BELUM DIJALANKAN — |
| R02 / non-admin | Ulangi R01 dengan token user non-admin. | Hak baca sama dengan pengunjung; token terautentikasi tidak memberi hak admin. | BELUM DIJALANKAN — |
| R03 / admin | SELECT fixture draft/nonaktif serta inquiry/page_view dummy. | Admin dapat melihat seluruh fixture; tidak mengakses data asli. | BELUM DIJALANKAN — |
| R04 / pengunjung + non-admin, masing-masing | Coba INSERT/UPDATE/DELETE fixture settings/services/brands/projects melalui direct SDK; coba action admin langsung tanpa sesi sah. | Tidak ada perubahan DB; action ditolak guard walau payload valid. Middleware juga menolak `/admin/*`. | BELUM DIJALANKAN — |
| R05 / pengunjung + non-admin, masing-masing | INSERT inquiry sintetis status unread; coba status read/replied; SELECT/UPDATE/DELETE hanya inquiry dummy yang sudah diketahui ID-nya. | INSERT unread saja diizinkan; status lain ditolak. SELECT/UPDATE/DELETE inquiry tidak diberi akses. Direct insert memang melewati limiter aplikasi: catat sebagai batas desain. | BELUM DIJALANKAN — |
| R06 / pengunjung + non-admin, masing-masing | INSERT page_view sintetis sesuai skema, lalu SELECT/DELETE fixture; sebagai admin baca/hapus hanya fixture tersebut. | Publik boleh insert; tidak boleh membaca/menghapus. Admin boleh membaca/menghapus. | BELUM DIJALANKAN — |
| R07 / pengunjung + non-admin, masing-masing | Unduh objek fixture bucket public. Coba upload, overwrite dan remove key fixture dengan direct Storage SDK; coba uploadMedia/deleteMedia action. | Public read berhasil; write/delete ditolak, file tetap identik. Public bucket berarti URL media draft juga publik jika diketahui; jangan menganggap gambar draft privat. | BELUM DIJALANKAN — |
| R08 / admin | Upload gambar kecil valid lewat aplikasi, baca URL, ganti lalu hapus fixture tanpa referensi. | Write/read/delete berhasil dengan sesi admin; URL unik, bucket benar. Referensi bersama diuji lagi di M03–M05. | BELUM DIJALANKAN — |
| R09 / admin | Lewat aplikasi coba ukuran >5MB, MIME palsu, SVG aktif/multiline href/xml:base/style/DTD, dan SVG statis dengan gradient/fragment. | Payload berbahaya/tak didukung ditolak sebelum upload; SVG statis subset diterima. Inline style/comment/atribut di luar allowlist sengaja ditolak meskipun SVG itu valid secara umum. | BELUM DIJALANKAN — |
| R10 / admin | Uji batas ukuran/MIME dengan direct Storage SDK pada key fixture. | Bucket menolak >5MB dan MIME di luar daftar. Magic bytes/grammar SVG adalah guard aplikasi, tidak ditegakkan oleh policy SQL; admin direct upload dapat melewati pemeriksaan konten aplikasi. Catat hasil delivery SVG (Content-Type/Disposition), jangan menyimpulkan sanitizer DB tersedia. | BELUM DIJALANKAN — |

## D. Login, logout, recovery email

Email hanya boleh dikirim ketika pelaksana mengotorisasi sesi uji staging dan mailbox uji. Gunakan password uji unik; jangan simpan password atau link recovery pada kolom hasil.

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| A01 | Buka `/admin` tanpa sesi; login dengan password salah dan akun non-admin test. | Redirect login; kredensial salah gagal; akun non-admin ditolak dan tidak memperoleh akses admin. | BELUM DIJALANKAN — |
| A02 | Login admin test; buka `/login`; lakukan operasi fixture lalu logout dan buka kembali halaman/admin action. | Login menuju admin/projects, login saat sudah admin diarahkan ke admin. Logout berhasil; permintaan baru/action tidak sah ditolak. Jangan gunakan tombol back/cache browser sebagai satu-satunya bukti sesi. | BELUM DIJALANKAN — |
| A03 | Minta recovery untuk email admin test; buka link dari mailbox pada browser/profil yang sama. | Callback menerima code, menukar PKCE, getUser cocok ADMIN_EMAIL, cookie sesi tersimpan, lalu `/reset-password` terbuka. Tidak ada code/verifier bocor di laporan. | BELUM DIJALANKAN — |
| A04 | Coba konfirmasi password berbeda/terlalu pendek, kemudian password sesuai kebijakan Supabase. | Input salah tidak mengubah akun. Sukses memperbarui password, mengakhiri sesi, redirect login; password lama gagal dan baru berhasil. | BELUM DIJALANKAN — |
| A05 | Buka link yang sudah dipakai/kedaluwarsa, callback tanpa code/code rusak, atau link valid di profil berbeda tanpa cookie verifier. | Gagal aman ke login recovery=invalid; tidak memberi akses/reset tanpa verifikasi. Profil berbeda dapat gagal PKCE dan perlu permintaan recovery baru dari profil itu. | BELUM DIJALANKAN — |
| A06 | Uji recovery non-admin melalui mekanisme Auth staging yang disetujui; tambahkan `next` berorigin asing pada callback fixture. | Non-admin tidak masuk form/admin. Tujuan redirect tetap origin konfigurasi staging; `next` eksternal diabaikan. | BELUM DIJALANKAN — |
| A07 | Dengan sesi admin biasa yang valid, buka `/reset-password` tanpa link recovery; tanpa sesi/non-admin ulangi. | Admin biasa memang diizinkan guard mengubah password; implementasi tidak membatasi ke sesi berlabel recovery. Tanpa admin ditolak. Catat jika kebutuhan bisnis menghendaki pembatasan tambahan. | BELUM DIJALANKAN — |
| A08 | Pada harness/local mock, simulasi callback network error serta update password sukses tetapi sign-out error/throw. Jika diuji staging, gunakan fault injection lokal terkontrol, bukan mematikan layanan. | Callback redirect aman. Keadaan parsial menyebut password sudah berubah dan sesi belum diakhiri; tidak mengklaim logout sukses. Setelah provider pulih, admin bisa logout lalu login password baru. | BELUM DIJALANKAN di staging; regresi mock lokal lulus — |
| A09 | Ulangi permintaan recovery sampai batas aplikasi dengan mailbox test sesuai izin penguji. | Rate limit aplikasi bekerja; hasil unknown email tidak membocorkan alamat ADMIN_EMAIL. Rate limit provider dicatat terpisah; tidak menganggap limiter lintas instance/global. | BELUM DIJALANKAN — |

## E. CRUD, media bersama dan cache

Gunakan dua sesi: admin untuk mutasi fixture dan browser pengunjung bersih untuk membaca hasil. Ukur dari respons/navigasi baru, bukan tampilan Router Cache/tab lama saja. Jangan melakukan perubahan policies/infrastruktur untuk memaksa error.

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| M01 | Create → edit judul/order/slug → publish → draft → delete project fixture. Cek list, detail slug lama/baru, landing featured dan sitemap lewat pengunjung setelah tiap mutasi. | Draft tidak tersedia publik; published muncul sesuai urutan. Slug lama tidak menampilkan data lama, slug baru valid. Unpublish/delete menghilangkan detail/list/sitemap yang terkait setelah revalidasi. | BELUM DIJALANKAN — |
| M02 | Ganti thumbnail A→B, tetapi buat save gagal dengan slug duplikat fixture. Ulangi pada brand; uji settings gagal memakai mock. | DB lama dan file A tetap utuh; tidak ada remove sebelum mutasi DB berhasil. Upload B yang belum tersimpan dapat menjadi orphan untuk review manual, bukan dihapus massal. | BELUM DIJALANKAN — |
| M03 | Simpan gambar A sebagai thumbnail dan galeri; pindahkan thumbnail ke galeri atau sebaliknya; lepaskan salah satu referensi. | A tetap dapat dibaca selama masih ada referensi. Tidak ada duplikasi remove. | BELUM DIJALANKAN — |
| M04 | Bagikan A antar dua project (salah satunya draft), brand (termasuk nonaktif), dan hero_image_url legacy settings fixture jika fixture ini sudah tersedia. Hapus referensi bergiliran. | A tetap ada hingga referensi terakhir hilang; admin reference scan mencakup draft/nonaktif. Jangan mengubah DB untuk legacy hero jika tidak disetujui; tandai subkasus BLOCKED. | BELUM DIJALANKAN — |
| M05 | Ulangi M04 dengan URL A ber-query/fragment dan nama file percent-encoded pada origin bucket sama; bila ada >1 halaman, letakkan referensi di halaman berikutnya. | Tetap mengenali objek yang sama dan mempertahankannya. Hostname alias/custom domain atau endpoint signed/render lain belum dijanjikan setara. Setelah referensi terakhir hilang, satu remove untuk satu object path. | BELUM DIJALANKAN — |
| M06 | Dengan mock/fault injection lokal, buat read referensi atau Storage remove gagal sesudah DB sukses; lalu coba ulang cleanup fixture yang dicatat. | Read gagal/null tidak menghapus. Save tetap sukses dengan warning; warning terlihat sebelum project/brand hilang atau pada pesan settings. Tidak menyuruh mengulang mutasi DB yang sudah berhasil. Retry tidak menghapus media yang sudah dipakai ulang. | BELUM DIJALANKAN di staging; regresi action lokal lulus — |
| M07 | CRUD/aktif-nonaktif service dan brand fixture; nonaktifkan seluruh fixture aktif pada staging terisolasi; edit settings bilingual. | Cache tags terkait invalid. Hasil kosong tetap kosong, bukan default palsu; perubahan copy muncul pada route publik terkait. Pastikan staging tidak memiliki konten non-fixture sebelum menonaktifkan semuanya. | BELUM DIJALANKAN — |
| M08 | Catat waktu sesudah mutasi dan setelah GET publik baru, ulangi dengan browser pengunjung terpisah. Cek logs/response yang tersanitasi bila stale. | Invalidasi on-demand menghasilkan data baru tanpa menunggu TTL 1 hari. Jika stale, catat route/tag/cache layer dan waktu; jangan menganggap build sukses membuktikan revalidasi. | BELUM DIJALANKAN — |
| M09 | Dengan dua admin sesi fixture, lakukan edit bersamaan yang memakai/melepas A. | Catat hasil/race. Reference scan dan Storage remove bukan transaksi atomik; tes lulus satu kali bukan bukti aman dari concurrency. Jangan menganggap risiko ini selesai tanpa desain locking/rekonsiliasi terpisah. | BELUM DIJALANKAN — |

## F. Endpoint revalidate dan keep-alive

Secret disediakan lewat pengelola secret/pengaturan staging dan tidak dimasukkan source, URL query, screenshot, atau log. Cookie admin tanpa Bearer bukan pengganti secret.

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| E01 | POST `/api/revalidate` dan GET `/api/keep-alive` tanpa Authorization, Bearer salah, serta hanya cookie admin. | 401; revalidasi/query heartbeat tidak dijalankan. | BELUM DIJALANKAN — |
| E02 | Pada lokal/harness tanpa secret terkonfigurasi, ulangi request dengan header apa pun. | Fail closed 401; jangan menghapus secret staging untuk uji negatif. | BELUM DIJALANKAN — |
| E03 | Kirim GET revalidate atau POST keep-alive. | Method yang tidak didukung 405; tidak ada operasi. HEAD keep-alive dapat dipetakan Next ke GET, sehingga tetap perlu autentikasi. | BELUM DIJALANKAN — |
| E04 | POST revalidate dengan REVALIDATE_SECRET staging; untuk bukti freshness gunakan perubahan fixture staging yang sudah diizinkan dan baca ulang publik. | 200 `{revalidated:true,now:...}`; seluruh empat tag dan root layout diinvalidasi; konten fixture baru muncul. JSON sukses saja bukan bukti freshness. | BELUM DIJALANKAN — |
| E05 | GET keep-alive dengan CRON_SECRET staging. | 200 `{ok:true,now:...}` setelah head/count query settings id=1; tidak memutasi/mengembalikan row privat. Sukses request bukan jaminan vendor tidak akan mem-pause proyek. | BELUM DIJALANKAN — |
| E06 | Simulasikan kegagalan DB pada keep-alive lewat mock/local harness; inspeksi jadwal Vercel staging tanpa mengeksekusi job baru. | Query gagal mengembalikan 500/ok:false; tidak melaporkan heartbeat sehat. Jadwal repository `0 3 * * *` dan dukungan Authorization Cron dicocokkan konfigurasi nyata, bukan diasumsikan aktif. | BELUM DIJALANKAN — |

## G. Kompatibilitas build dan penutupan

| ID | Langkah uji | Hasil yang diharapkan | Hasil aktual |
| --- | --- | --- | --- |
| W01 | Build pada Windows Node 22.20 / Next 16.4.2 yang dipakai audit; catat log strategi tanpa nilai env. | workerThreads aktif dan build lulus. Keberhasilan hanya membuktikan kombinasi itu. | Lokal lulus; staging belum dijalankan — |
| W02 | Build pada Linux Node 22 (sesuai CI) dan runtime hosting staging dengan env staging eksplisit. | Default childProcesses dipakai; build tidak bergantung workaround Windows. Font/native-addon dan cache data diverifikasi pada runtime tersebut. | BELUM DIJALANKAN — |
| W03 | Jika runtime memakai Node 24.13.1+ yang dinyatakan terdampak panduan paket, catat fallback dan hasil build/dev. | Next dapat fallback ke childProcesses; jangan mengaktifkan forceWorkerThreads untuk menutupi kegagalan. Tandai BLOCKED bila kombinasi tidak bekerja. | BELUM DIJALANKAN — |
| X01 | Review hasil FAIL/BLOCKED; catat object key orphan dan warning cleanup. Bersihkan hanya ID/key fixture yang sudah tercatat, dengan izin operator staging. | Tidak ada penghapusan wildcard/global. File shared yang masih dirujuk dipertahankan. Bukti disanitasi; perubahan layanan/migration tetap pekerjaan terpisah. | BELUM DIJALANKAN — |
| X02 | Putuskan kelayakan rilis setelah seluruh requirement wajib layanan PASS atau pengecualian disetujui pemilik. | Tidak menyamakan unit/build lulus dengan RLS, recovery email, atau deploy yang terverifikasi. | BELUM DIJALANKAN — |


## H. Pelaksanaan fixture production yang diizinkan khusus (7–8 November 2026)

Pemilik kemudian memberi izin terbatas untuk fixture production; izin tersebut menggantikan larangan production pada rencana di atas **hanya untuk sesi ini**. Hasil tidak boleh dianggap sebagai penyelesaian semua pengujian staging.

Laporan: [hasil sesi](PRODUCTION_TEST_RESULTS.md). Identitas dan bukti: `manifest.json` (bukti lokal di `audit-runs/`, tidak disertakan dalam Git).

| Cakupan checklist | Hasil aktual sesi | Status |
| --- | --- | --- |
| P01–P02 / W01 | Project produksi dicocokkan; trigger/cascade/policies target dan bucket diperiksa read-only. Kode berjalan next dev lokal terbaru; tidak dideploy. Overview backup: No backups, backup eksternal tidak diketahui. | PASS pada cakupan yang disebut |
| A01–A02 | Login manual, admin tanpa sesi ditolak, logout resmi melalui header mobile setelah fix lokal, admin ditolak lagi sesudah logout. Tidak mencoba password salah/non-admin. | PASS sebagian |
| M01–M05 / M08 | Dua project, dua PNG baru; draft/edit/validasi gagal/ganti gambar; media shared dua project; satu publikasi singkat tidak featured; detail/list/sitemap lokal terinvalidasi. Kasus alias, lintas brand/settings, slug rename, dan concurrency tidak diuji live. | PASS sebagian |
| M07 | Satu brand dan satu service baru, keduanya nonaktif: create/read/edit/delete. Tidak menyentuh singleton atau menonaktifkan semua data lama. | PASS sebagian |
| R01 / R07–R08 | Anon hanya menargetkan fixture; draft/nonaktif tersembunyi; overwrite/remove media fixture ditolak/tidak memengaruhi object; admin CRUD fixture berhasil. | PASS sebagian |
| R02 / non-admin | Tidak ada akun uji non-admin tersendiri; tidak membuat akun. | BLOCKED |
| E01 / E03 | Bearer salah 401; metode salah 405 pada endpoint lokal. | PASS |
| E04–E05 | Secret valid tidak tersedia di lingkungan lokal; tidak mengambil/mengubah konfigurasi hosting. | BLOCKED |
| A03–A09 / R05–R06 / settings / abuse | Email/recovery/password/inquiry/analytics/settings dan pengujian abuse dilarang oleh scope sesi. | BLOCKED oleh batas pengguna |
| X01 | SELECT exact UUID/key: 4 row dan 2 object dibuat lalu seluruhnya dihapus; sisa 0/0. | PASS |

Tidak mengklaim keseluruhan production identik atau seluruh matriks peran lulus. Kode yang diuji tetap lokal.

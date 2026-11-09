# Hasil pengujian fixture production

Sesi: `audit-test-20261107T151731Z-2a83de`.
Pelaksanaan fixture: 7 November 2026 WIB. Penyelesaian logout dan quality gate: 8 November 2026 WIB.

Kode berjalan **lokal** melalui `next dev` port 3111 dan proxy loopback port 3110, menggunakan koneksi Supabase production yang sudah dikonfigurasi. Tidak ada deployment. Proxy memblokir `/api/track`, dashboard analytics, inquiries, settings, dan recovery agar pengujian tidak menulis analytics atau membaca data privat. Dukungan WebSocket HMR ditambahkan ke harness setelah form awal belum terhidrasi; belum ada fixture dibuat ketika hambatan itu terjadi.

## Prasyarat dan bukti metadata

- Project pada Dashboard dicocokkan dengan konfigurasi lokal.
- Login aplikasi dilakukan manual oleh pemilik melalui form resmi. Password/cookie/token tidak disimpan di manifest.
- SELECT katalog read-only memeriksa tabel projects/brands/services dan storage.objects: RLS aktif, tidak ditemukan rule tambahan atau FK cascade yang menjangkau data portofolio lain. Trigger yang diamati hanya timestamp dan guard penghapusan langsung Storage. Policies target sesuai pemisahan public read/admin write yang dicatat manifest. Ini bukan inspeksi seluruh fungsi/konfigurasi production.
- Bucket terpasang: public, maksimum 5.242.880 byte, MIME WebP/JPEG/PNG/AVIF/SVG. Metadata ini tidak membuktikan semua bentuk konten upload aman.
- Overview menampilkan **Last backup: No backups**. Backup di luar Supabase tidak dapat dipastikan; pengaturan backup tidak diubah.

## Hasil

| Area | Status | Bukti / batas |
| --- | --- | --- |
| Publik dan navigasi | PASS | Projects, About, dan beranda dimuat dari kode lokal; tracking dicegat sebelum handler aplikasi. |
| Login admin | PASS | Login manual resmi menuju `/admin/projects`; tidak membuka dashboard analytics/inquiry. |
| Create/read/edit draft | PASS | Project A dibuat draft, tidak featured; edit tersimpan hanya pada UUID fixture. |
| Validasi gagal | PASS | URL `not-a-url` ditolak action; reload menunjukkan nilai tidak tersimpan. Mengosongkan hanya EN kategori ternyata memakai fallback ID yang valid, sehingga itu tidak dihitung sebagai kasus validasi gagal. |
| Upload dan ganti thumbnail | PASS | Dua PNG 32×32 baru; upload upsert=false. Setelah penggantian, metadata object A 404 dan object B tetap ada. |
| Media bersama | PASS | Dua project baru berbagi object B. Delete project A mempertahankan file karena B masih merujuknya; setelah B dihapus file terkonfirmasi 404. Tidak memakai media lama. |
| Publish/unpublish | PASS | Hanya project B berjudul jelas TEST dipublikasikan sebentar, tetap tidak featured; lalu dikembalikan draft dan dihapus. |
| Invalidasi cache lokal | PASS | Detail/list/sitemap lokal memuat fixture setelah publish, lalu detail 404 serta list/sitemap tidak memuatnya setelah unpublish. Ini tidak membuktikan cache situs deployed ikut terinvalidasi. |
| Anon RLS project | PASS | Read draft exact ID kosong; update exact draft ID memengaruhi nol row. Admin reread memastikan summary fixture tidak berubah. Published fixture dapat dibaca anon dan tidak featured. |
| Anon Storage | PASS | File uji public-read cocok hash. Upsert ke key fixture ditolak 403; remove melaporkan nol object dan file/hash tetap utuh. Tidak menyimpulkan penolakan hanya dari status HTTP. |
| Brand/service | PASS | Masing-masing satu row baru dibuat nonaktif, dibaca, diedit, dan dihapus. UUID diperoleh melalui SELECT exact session label + waktu pembuatan, lalu diverifikasi ulang sebelum cleanup. Anon tidak dapat melihat kedua fixture nonaktif. Tidak menonaktifkan konten lama. |
| Cleanup akhir | PASS | SELECT exact UUID dan object key mengembalikan projects=0, brands=0, services=0, storage.objects=0. Dua object juga diverifikasi 404 melalui Storage API. |
| Logout mobile | PASS setelah fix lokal | Tombol keluar kini terlihat pada 390×844. Logout resmi menuju login; navigasi baru `/admin/projects` kembali ke login. |
| Logout scope | PASS mock + flow nyata | Action biasa memakai `scope: local`, agar tidak meminta logout seluruh perangkat. Mock memverifikasi argumen ini; flow nyata mengonfirmasi sesi browser uji ditutup. Sesi perangkat lain tidak dibaca untuk membuktikan keadaannya. |
| Endpoint tanpa secret / metode salah | PASS | POST revalidate dan GET keep-alive dengan Bearer salah: 401. GET revalidate dan POST keep-alive: 405. |
| Endpoint dengan secret valid | BLOCKED | REVALIDATE_SECRET dan CRON_SECRET tidak tersedia pada lingkungan lokal. Tidak mengambil/mengubah secret hosting. |
| Non-admin terautentikasi | BLOCKED | Tidak tersedia akun uji non-admin terpisah; tidak membuat akun atau menggunakan akun orang lain. Anon bukan pengganti bukti non-admin. |
| Recovery/email/password/settings/abuse | BLOCKED oleh batas pengguna | Sengaja tidak dijalankan. Tidak mengirim inquiry, email, recovery, mengubah singleton, password, kebijakan, atau konfigurasi layanan. |

## Manifest dan cleanup

`manifest.json` (bukti lokal di `audit-runs/`, tidak disertakan dalam Git) menyimpan ID/key persis, hash gambar uji, status, rencana mutasi, dan hasil tersanitasi. Seluruh update/delete memakai identitas fixture sesi, bukan pola nama atau operasi massal. Query pencarian label hanya digunakan untuk mengidentifikasi row yang baru saja dibuat, bukan untuk update/delete.

- Dibuat: **2 project + 1 brand + 1 service = 4 row**.
- Diunggah: **2 objek gambar**. Gambar C hanya file lokal untuk upaya anon overwrite yang ditolak, bukan upload production yang berhasil.
- Dihapus: **4 row dan 2 objek sesi**.
- Sisa fixture terverifikasi: **0 row / 0 objek**.


## Perubahan lokal dan pemeriksaan

- `src/app/admin/layout.tsx`: komponen LogoutButton yang sudah ada ditambahkan ke header mobile; sebelumnya hanya sidebar desktop yang memilikinya.
- `src/actions/auth.actions.ts`: logout biasa dibatasi pada sesi saat ini. SDK terpasang menggunakan scope global jika tidak ditentukan. Flow reset password tidak diubah/dijalankan dalam sesi ini.
- `tests/unit/password-recovery.test.ts`: regresi logout local, guard penolakan, dan kegagalan sign-out.
- Harness lokal: proxy tracking/private-route/HMR, manifest, serta gambar sintetis di direktori sesi.

Typecheck dan lint lulus. Seluruh unit test: **14 file / 123 test lulus**; 44 test terfokus sudah dijalankan sebelum fixture dan 11 test auth terfokus sebelum logout nyata. Build akhir lulus dengan URL Supabase loopback placeholder untuk verifikasi kompilasi; aplikasi yang dipakai menguji fixture berjalan next dev dengan konfigurasi production asli. Artifact build placeholder ini tidak boleh dipakai deploy atau sebagai bukti konten production. Tidak mengulang seluruh Playwright lama yang tidak berkaitan; pengujian browser langsung di atas memverifikasi flow aktual yang disebutkan.

## Batas kesimpulan

Tidak ada mutasi yang sengaja menargetkan data/media lama; tidak ada snapshot menyeluruh sebelum/sesudah untuk mengklaim seluruh production identik. Concurrency antara pemeriksaan referensi dan Storage remove tetap bukan transaksi atomik. Pengujian berhalaman/URL alias di unit test bukan bukti semua alias/custom domain/kompetisi edit sudah diuji live. Cached object publik dapat bertahan di CDN; pemeriksaan cleanup memakai metadata Storage exact key, tidak sekadar respons gambar CDN.

Tidak ada commit, push, migration, seed, perubahan Auth/RLS/bucket/hosting, atau deploy. Persetujuan pemilik untuk fixture production berlaku pada sesi ini dan tidak menggantikan batas tindakan yang dilarang. Checklist staging lama tetap rencana umum; hasil sesi ini tidak menandai baris yang dilarang sebagai sudah diuji.

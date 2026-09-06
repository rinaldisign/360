# Panorama Studio — Proposal Landing Page

Struktur project:

```
project/
├── index.html          # Markup halaman (tinggal buka langsung di browser)
├── css/
│   └── style.css       # Semua styling
├── js/
│   └── main.js         # Sticky header + animasi scroll reveal
├── assets/
│   ├── images/         # Taruh foto portofolio / hero di sini
│   └── icons/          # Taruh logo / favicon di sini
└── README.md
```

## Cara pakai
1. Buka `index.html` langsung di browser (double click), atau upload seluruh
   folder `project/` ke hosting statis (Cloudflare Pages, Netlify, Vercel, dsb).
2. Untuk mengganti foto portofolio: taruh file gambar di `assets/images/`,
   lalu di `index.html` cari elemen `<a class="portfolio-img" style="background:#....">`
   dan ganti `style` menjadi `style="background-image:url('assets/images/nama-file.jpg')"`.
3. Untuk mengganti logo header: taruh file di `assets/icons/logo.png`, lalu di
   `index.html` ganti isi `<div class="app-logo">360</div>` menjadi
   `<div class="app-logo"><img src="assets/icons/logo.png" alt="Logo"></div>`.
4. Link tur 360° & QR code sudah otomatis dibuat dari 3 link berikut (via
   layanan QR gratis api.qrserver.com):
   - https://coboybar.vtour.workers.dev
   - https://luma.vtur.workers.dev
   - https://laboug.vtur.workers.dev

   Untuk mengganti link, cukup update `href` pada `<a class="portfolio-img">`,
   `<a class="portfolio-link">`, dan parameter `data=` pada URL QR di
   `<img class="qr-box">`.

## Catatan teknis
- Layout dikunci lebar maksimum 480px (`.page { max-width:480px }`) supaya
  tetap terlihat seperti aplikasi mobile potrait walau dibuka di layar PC.
- Animasi scroll-reveal memakai `IntersectionObserver` di `js/main.js`, dan
  otomatis nonaktif jika sistem pengguna mengaktifkan "reduce motion".
- Tidak ada dependency eksternal selain layanan pembuat QR code
  (`api.qrserver.com`) dan font sistem — tidak perlu build tool/npm.

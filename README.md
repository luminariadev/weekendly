# ⚡ WEEKENDLY [Anti AI-Slop] &bull; KalaPekan

> **Aplikasi Rekomendasi Liburan Akhir Pekan Cerdas Berbasis Prakiraan Cuaca Real-Time, Open-Data POI, Desain Neubrutalisme, dan Sistem RBAC (Role-Based Access Control).**

Proyek ini dibangun berdasarkan integrasi multi-API publik (*API Mashup*) yang dikurasi dari repositori [public-apis/public-apis](https://github.com/public-apis/public-apis).

---

## 🎨 Karakter Desain: Neubrutalism (Anti AI-Slop)

Weekendly sengaja menolak gaya *"AI-slop"* generik (gradien ungu lembut, glassmorphism buram, rounded-3xl seragam) dan mengusung filosofi **Neubrutalisme**:
* **High-Contrast Bold Borders:** Border hitam tegas (`border-[3px] border-black` dan `border-[4px] border-black`).
* **Tactile Hard Drop Shadows:** Bayangan solid tanpa blur (`shadow-[4px_4px_0px_#000]` dan `shadow-[8px_8px_0px_#000]`) yang memberikan kesan tombol fisik nyata saat ditekan.
* **Punchy Color Accents:** Canary Yellow (`#FFE600`), Electric Lime (`#A3E635`), Retro Sky (`#38BDF8`), Hot Coral (`#FF6B6B`), dan Lilac (`#C084FC`).
* **Micro-Stickers & Monospace Labels:** Tipografi tebal bernuansa retro-modern dengan hierarki informasi yang sangat jelas.

---

## 👥 Sistem Autentikasi & RBAC (Role-Based Access Control)

Aplikasi dilengkapi dengan **RBAC Controller Bar** di bagian atas untuk berpindah antar 4 peran secara instan:

| Peran (Role) | Hak Akses & Fitur Khusus |
| :--- | :--- |
| **1. Guest (Publik / Tanpa Login)** | - Mencari kota & cek cuaca akhir pekan Sabtu & Minggu.<br/>- Menjelajahi katalog tempat umum & rute Google Maps.<br/>- *Guarded:* Ditampilkan modal penjelasan saat mencoba simpan agenda atau review. |
| **2. Registered User (Pengguna Terdaftar)** | - **Simpan Agenda Akhir Pekan:** Bookmark tempat ke Wishlist pribadi.<br/>- **Ulasan & Rating Komunitas:** Memberikan feedback dan tips cuaca pada setiap spot wisata.<br/>- Menerima ringkasan strategi liburan akhir pekan. |
| **3. Merchant (Pemilik Usaha / Mitra)** | - **Portal Pendaftaran Spot:** Mengajukan tempat baru (kafe, galeri, arena rekreasi, wisata alam).<br/>- **Kelola Promo Weekend:** Menambahkan penawaran khusus akhir pekan (misal: *Diskon 25% Boardgame Pass saat Hujan*).<br/>- Status verifikasi transparan (`PENDING` / `APPROVED`). |
| **4. Admin (Kurator Platform)** | - **Curator Moderation Desk:** Panel khusus untuk memverifikasi, menyetujui (*Approve*), atau menolak (*Reject*) tempat yang didaftarkan merchant.<br/>- Tempat yang disetujui langsung tampil di peta dan katalog publik secara otomatis.<br/>- Monitoring metrik ketersediaan API Open-Meteo & OpenStreetMap. |

---

## 🔌 Public API Terintegrasi

| Komponen | Sumber / Provider | Deskripsi & Autentikasi |
| :--- | :--- | :--- |
| **Prakiraan Cuaca** | [Open-Meteo API](https://open-meteo.com/) | Data presisi jam-jaman & harian, 100% Free, No API Key. |
| **Geocoding & Koordinat** | [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) | Konversi nama kota ke Latitude/Longitude secara instan. |
| **Data POI / Destinasi** | [Overpass API (OSM)](https://overpass-api.de/) + Curated Database | Query objek wisata, taman, dan museum di sekitar titik. |
| **Peta Interaktif** | [Leaflet.js + OpenStreetMap Tiles](https://leafletjs.com/) | Client-side map rendering ringan dengan custom SVG neubrutalist pins. |

---

## 🚀 Cara Menjalankan

```bash
# 1. Pindah ke direktori
cd "D:\Rizkia\Project Software\weekendly"

# 2. Jalankan development server
npm run dev
```

Buka URL lokal yang muncul (biasanya `http://localhost:5173`) di browser.

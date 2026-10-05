# 🧭 Weekendly (KalaPekan) - Smart Weekend Outing Recommender

> **Aplikasi Rekomendasi Liburan Akhir Pekan Cerdas Berbasis Prakiraan Cuaca Real-Time dan Open-Data POI.**

Aplikasi ini mendemonstrasikan kekuatan integrasi multi-API publik (*API Mashup*) yang diambil dari kurasi katalog [public-apis/public-apis](https://github.com/public-apis/public-apis).

---

## 🌟 Fitur Utama (MVP)

1. **Weekend Weather Forecaster (Open-Meteo):**
   - Mengambil data prakiraan cuaca otomatis untuk hari Sabtu dan Minggu (Suhu Min/Max, Peluang Hujan %, Kondisi WMO).
2. **Decision Engine (Outdoor vs Indoor Safe):**
   - Otomatis mengelompokkan dan merekomendasikan tempat liburan berdasarkan kondisi cuaca:
     - ☀️ **Outdoor Friendly**: Taman kota, hutan raya, pantai, wisata alam saat cuaca cerah/sejuk.
     - 🌧️ **Indoor Safe**: Museum edukasi, galeri seni, perpustakaan modern, cafe nyaman saat potensi hujan tinggi.
3. **Peta Interaktif & Estimasi Jarak (Leaflet & OpenStreetMap):**
   - Pin peta interaktif dengan penanda kategori warna (Ungu = Indoor, Hijau = Outdoor, Oranye = Terpilih).
   - Menghitung jarak garis lurus (*Haversine formula*) dari titik kota ke destinasi.
4. **Pencarian Kota & Autodeteksi Geolokasi:**
   - Geocoding nama kota via Nominatim OSM dan tombol *"Gunakan Lokasi Saya"*.
5. **Rute Cepat ke Google Maps & Bagikan Rencana:**
   - Navigasi instan 1-klik ke Google Maps serta tombol salin rencana liburan ke chat.

---

## 🔌 Public API yang Digunakan

| Komponen | Provider / Sumber API | Deskripsi & Autentikasi |
| :--- | :--- | :--- |
| **Cuaca Real-Time** | [Open-Meteo API](https://open-meteo.com/) | Prakiraan jam-jaman & harian, 100% Free, No API Key |
| **Geocoding & Koordinat** | [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org/) | Konversi nama kota ke Latitude/Longitude, Free |
| **Data POI / Tempat** | [Overpass API (OSM)](https://overpass-api.de/) + Curated Database | Query objek wisata, taman, dan museum di sekitar titik |
| **Map Tiles** | [OpenStreetMap Tiles + Leaflet](https://leafletjs.com/) | Client-side map rendering ringan tanpa kredit kartu |

---

## 🚀 Cara Menjalankan Aplikasi

Pastikan Node.js (v18+) telah terpasang di komputer Anda.

```bash
# 1. Pindah ke direktori proyek
cd C:\Users\majan\.gemini\antigravity\scratch\weekendly

# 2. Jalankan development server
npm run dev
```

Buka URL lokal yang muncul (biasanya `http://localhost:5173`) di browser Anda.

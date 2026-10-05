import type { CityLocation, DayForecast, WeekendWeather, PlacePOI, SmartOutingResult } from '../types';

// Predefined popular cities for quick selection
export const POPULAR_CITIES: CityLocation[] = [
  { name: 'Bandung', displayName: 'Kota Bandung, Jawa Barat', lat: -6.9175, lng: 107.6191 },
  { name: 'Jakarta', displayName: 'DKI Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'Yogyakarta', displayName: 'DI Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { name: 'Bogor', displayName: 'Kota Bogor, Jawa Barat', lat: -6.5971, lng: 106.8060 },
  { name: 'Malang', displayName: 'Kota Malang, Jawa Timur', lat: -7.9666, lng: 112.6326 },
  { name: 'Surabaya', displayName: 'Kota Surabaya, Jawa Timur', lat: -7.2575, lng: 112.7521 },
  { name: 'Denpasar', displayName: 'Denpasar, Bali', lat: -8.6705, lng: 115.2126 },
  { name: 'Semarang', displayName: 'Kota Semarang, Jawa Tengah', lat: -6.9667, lng: 110.4167 },
];

// Helper: Calculate distance between two coordinates in KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Translate WMO Weather Code to Indonesian text and condition
function interpretWeatherCode(code: number): { text: string; isRain: boolean } {
  if (code === 0) return { text: 'Cerah Berawan', isRain: false };
  if (code === 1 || code === 2) return { text: 'Sebagian Berawan', isRain: false };
  if (code === 3) return { text: 'Mendung Berawan Tebal', isRain: false };
  if (code >= 45 && code <= 48) return { text: 'Berkabut', isRain: false };
  if (code >= 51 && code <= 55) return { text: 'Gerimis Ringan', isRain: true };
  if (code >= 61 && code <= 65) return { text: 'Hujan', isRain: true };
  if (code >= 80 && code <= 82) return { text: 'Hujan Deras', isRain: true };
  if (code >= 95 && code <= 99) return { text: 'Hujan Petir', isRain: true };
  return { text: 'Cerah Berawan', isRain: false };
}

// 1. Search city via OpenStreetMap Nominatim
export async function searchCity(query: string): Promise<CityLocation[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'id,en',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.name || query,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));
  } catch (err) {
    console.error('Error searching city:', err);
    return [];
  }
}

// 2. Fetch weekend weather from Open-Meteo
export async function fetchWeekendWeather(lat: number, lng: number): Promise<WeekendWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Gagal mengambil data cuaca dari Open-Meteo');
  const data = await res.json();

  const daily = data.daily;
  const dates: string[] = daily.time;

  // Find Saturday and Sunday dates
  let satIndex = -1;
  let sunIndex = -1;

  for (let i = 0; i < dates.length; i++) {
    const dateObj = new Date(dates[i]);
    const day = dateObj.getDay();
    if (day === 6 && satIndex === -1) satIndex = i;
    if (day === 0 && sunIndex === -1) sunIndex = i;
  }

  // Fallback to day 0 & 1 if weekend not reached
  if (satIndex === -1) satIndex = Math.min(1, dates.length - 1);
  if (sunIndex === -1) sunIndex = Math.min(2, dates.length - 1);

  const makeDayForecast = (idx: number, fallbackDayName: string): DayForecast => {
    const code = daily.weathercode[idx] ?? 0;
    const rainProb = daily.precipitation_probability_max[idx] ?? 20;
    const { text, isRain } = interpretWeatherCode(code);
    const rainy = isRain || rainProb >= 45;

    return {
      date: dates[idx],
      dayName: fallbackDayName,
      tempMax: Math.round(daily.temperature_2m_max[idx] ?? 30),
      tempMin: Math.round(daily.temperature_2m_min[idx] ?? 22),
      precipitationProbability: rainProb,
      weatherCode: code,
      weatherDescription: text,
      isRainy: rainy,
      recommendationMode: rainy ? 'INDOOR' : 'OUTDOOR',
    };
  };

  const saturday = makeDayForecast(satIndex, 'Sabtu');
  const sunday = makeDayForecast(sunIndex, 'Minggu');

  let summary = '';
  if (saturday.isRainy && sunday.isRainy) {
    summary = 'Akhir pekan ini didominasi hujan. Sangat disarankan memilih aktivitas cozy di tempat indoor!';
  } else if (!saturday.isRainy && !sunday.isRainy) {
    summary = 'Cuaca akhir pekan sangat bersahabat! Waktu yang tepat untuk eksplorasi alam dan aktivitas outdoor.';
  } else if (!saturday.isRainy && sunday.isRainy) {
    summary = 'Sabtu cerah untuk jalan-jalan luar ruangan, sementara Minggu lebih cocok santai indoor.';
  } else {
    summary = 'Sabtu berpotensi hujan, simpan aktivitas outdoor untuk hari Minggu yang cerah!';
  }

  return { saturday, sunday, summary };
}

// 3. Curated local POI database with fallback & live enrichment
const CURATED_PLACES_DATABASE: Record<string, PlacePOI[]> = {
  Bandung: [
    {
      id: 'bdg-1',
      name: 'Taman Hutan Raya Ir. H. Djuanda',
      category: 'Wisata Alam & Hutan',
      type: 'OUTDOOR',
      description: 'Hutan lindung sejuk dengan jalur trekking, jembatan gantung, dan gua bersejarah.',
      lat: -6.8573,
      lng: 107.6321,
      weatherFitBadge: 'Cocok saat Cerah',
      rating: 4.8,
      address: 'Kompleks Tahura, Dago Pakar, Bandung',
      imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bdg-2',
      name: 'Selasar Sunaryo Art Space',
      category: 'Galeri Seni & Cafe',
      type: 'INDOOR',
      description: 'Galeri seni kontemporer tenang dengan kafe Kopi Selasar bernuansa perbukitan.',
      lat: -6.8623,
      lng: 107.6384,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.7,
      address: 'Jl. Bukit Pakar Timur No.100, Ciburial',
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bdg-3',
      name: 'Museum Geologi Bandung',
      category: 'Museum Edukasi',
      type: 'INDOOR',
      description: 'Pusat koleksi fosil dinosaurus, batuan langka, dan sejarah bumi Indonesia.',
      lat: -6.9006,
      lng: 107.6214,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.6,
      address: 'Jl. Diponegoro No.57, Cihaur Geulis',
      imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bdg-4',
      name: 'NuArt Sculpture Park',
      category: 'Taman Patung & Galeri',
      type: 'INDOOR',
      description: 'Karya mahakarya Nyoman Nuarta, ruang galeri indoor luas dan taman asri.',
      lat: -6.8778,
      lng: 107.5752,
      weatherFitBadge: 'Semi-Indoor / Aman Hujan',
      rating: 4.7,
      address: 'Jl. Setra Duta Raya No.L6, Sukasari',
      imageUrl: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bdg-5',
      name: 'Tebing Keraton',
      category: 'Pemandangan Alam & Sunrise',
      type: 'OUTDOOR',
      description: 'Spot panorama tebing dengan pemandangan kabut pagi hutan Tahura nan magis.',
      lat: -6.8338,
      lng: 107.6636,
      weatherFitBadge: 'Cocok saat Cerah Pagi',
      rating: 4.8,
      address: 'Puncak Kordon, RT.2/RW.10, Ciburial',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bdg-6',
      name: 'Braga Heritage & Cafe Walk',
      category: 'Kuliner & Wisata Kota',
      type: 'OUTDOOR',
      description: 'Kawasan bangunan kolonial ikonik, deretan kedai kopi artisanal, dan pertunjukan jalanan.',
      lat: -6.9174,
      lng: 107.6094,
      weatherFitBadge: 'Cocok Sore Cerah',
      rating: 4.6,
      address: 'Jl. Braga, Sumur Bandung',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    },
  ],
  Jakarta: [
    {
      id: 'jkt-1',
      name: 'Museum MACAN (Modern and Contemporary Art)',
      category: 'Seni Modern & Galeri',
      type: 'INDOOR',
      description: 'Museum seni kontemporer kelas dunia dengan instalasi imersif ber-AC yang nyaman.',
      lat: -6.1912,
      lng: 106.7681,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.8,
      address: 'AKR Tower Level M, Kebon Jeruk, Jakarta Barat',
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jkt-2',
      name: 'Taman Mini Indonesia Indah (TMII) Revitalisasi',
      category: 'Taman Budaya & Rekreasi',
      type: 'OUTDOOR',
      description: 'Wajah baru TMII ramah pejalan kaki, penyewaan sepeda listrik, dan anjungan nusantara.',
      lat: -6.3024,
      lng: 106.8952,
      weatherFitBadge: 'Cocok saat Cerah',
      rating: 4.7,
      address: 'Cipayung, Jakarta Timur',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jkt-3',
      name: 'Perpustakaan Jakarta & PDS HB Jassin (Taman Ismail Marzuki)',
      category: 'Perpustakaan & Ruang Kreatif',
      type: 'INDOOR',
      description: 'Gedung perpustakaan estetik berjenjang, spot baca tenang dan pameran literatur.',
      lat: -6.1895,
      lng: 106.8402,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.9,
      address: 'TIM, Jl. Cikini Raya No.73, Jakarta Pusat',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jkt-4',
      name: 'Hutan Kota GBK & Gelora Bung Karno',
      category: 'Taman Kota & Piknik',
      type: 'OUTDOOR',
      description: 'Hamparan rumput hijau dengan latar belakang gedung pencakar langit Sudirman.',
      lat: -6.2201,
      lng: 106.8048,
      weatherFitBadge: 'Cocok Sore Cerah',
      rating: 4.7,
      address: 'Pintu 7 GBK, Senayan, Jakarta Pusat',
      imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jkt-5',
      name: 'Pantai Pasir Putih PIK 2 & Aloha Pasir Putih',
      category: 'Pesisir & Kuliner Outdoor',
      type: 'OUTDOOR',
      description: 'Wisata pantai modern dengan kafe tematik gaya Hawaii dan angin laut sejuk.',
      lat: -6.0792,
      lng: 106.7025,
      weatherFitBadge: 'Cocok saat Cerah',
      rating: 4.5,
      address: 'Pantai Indah Kapuk 2',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'jkt-6',
      name: 'M Bloc Space',
      category: 'Creative Hub & Kuliner',
      type: 'INDOOR',
      description: 'Bekas perumahan Peruri yang disulap menjadi pusat musik, vinyl store, dan kedai lokal.',
      lat: -6.2443,
      lng: 106.7981,
      weatherFitBadge: 'Semi-Indoor / Cozy',
      rating: 4.6,
      address: 'Jl. Panglima Polim No.37, Melawai, Kebayoran Baru',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    },
  ],
  Yogyakarta: [
    {
      id: 'yog-1',
      name: 'Candi Prambanan',
      category: 'Situs Sejarah & Budaya',
      type: 'OUTDOOR',
      description: 'Kompleks candi Hindu termegah dengan taman luas dan pertunjukan Ramayana Ballet.',
      lat: -7.7520,
      lng: 110.4915,
      weatherFitBadge: 'Cocok saat Cerah',
      rating: 4.9,
      address: 'Bokoharjo, Sleman, DI Yogyakarta',
      imageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'yog-2',
      name: 'Museum Ullen Sentalu',
      category: 'Museum Seni & Budaya Mataram',
      type: 'INDOOR',
      description: 'Museum tersembunyi di lereng sejuk Gunung Merapi dengan arsitektur bebatuan gotik.',
      lat: -7.5979,
      lng: 110.4234,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.9,
      address: 'Jl. Boyong KM 25, Kaliurang, Sleman',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'yog-3',
      name: 'Taman Sari Water Castle',
      category: 'Situs Warisan Keraton',
      type: 'OUTDOOR',
      description: 'Bekas pemandian permaisuri Sultan dengan lorong bawah tanah masjid bawah air.',
      lat: -7.8099,
      lng: 110.3592,
      weatherFitBadge: 'Cocok saat Cerah',
      rating: 4.7,
      address: 'Patehan, Kraton, Kota Yogyakarta',
      imageUrl: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'yog-4',
      name: 'Affandi Museum',
      category: 'Galeri Maestro Lukis',
      type: 'INDOOR',
      description: 'Kediaman sekaligus galeri maestro ekspresionis Affandi dengan bentuk arsitektur pelepah pisang.',
      lat: -7.7828,
      lng: 110.3963,
      weatherFitBadge: 'Aman Saat Hujan',
      rating: 4.8,
      address: 'Jl. Laksda Adisucipto No.167, Caturtunggal',
      imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    },
  ],
};

// 4. Overpass API integration to fetch live OSM POIs for any arbitrary city
export async function fetchLiveOsmPois(lat: number, lng: number): Promise<PlacePOI[]> {
  try {
    // 5km radius query around coordinate for tourism & leisure
    const query = `
      [out:json][timeout:10];
      (
        nwr["tourism"~"museum|gallery|theme_park|attraction"](around:7000, ${lat}, ${lng});
        nwr["leisure"~"park|garden"](around:7000, ${lat}, ${lng});
      );
      out center 12;
    `;
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const elements = data.elements || [];

    return elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any, idx: number) => {
        const pLat = el.lat || (el.center && el.center.lat) || lat;
        const pLng = el.lon || (el.center && el.center.lon) || lng;
        const tourism = el.tags.tourism || '';
        const leisure = el.tags.leisure || '';

        const isIndoor = tourism === 'museum' || tourism === 'gallery';
        const type: 'OUTDOOR' | 'INDOOR' = isIndoor ? 'INDOOR' : 'OUTDOOR';

        return {
          id: `osm-${el.id || idx}`,
          name: el.tags.name,
          category: tourism ? `Wisata: ${tourism}` : `Taman: ${leisure}`,
          type,
          description: el.tags.description || el.tags['name:en'] || `Destinasi publik di sekitar lokasi.`,
          lat: pLat,
          lng: pLng,
          weatherFitBadge: type === 'INDOOR' ? 'Aman Hujan' : 'Cocok saat Cerah',
          rating: 4.5,
          address: el.tags['addr:street'] || 'Area Sekitar',
          imageUrl: type === 'INDOOR'
            ? 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
        };
      });
  } catch (err) {
    console.warn('Overpass API failed, using curated database instead:', err);
    return [];
  }
}

// 5. Core Recommendation Engine: Orchestrate City + Weather + Places
export async function getSmartOutingRecommendations(city: CityLocation): Promise<SmartOutingResult> {
  // Fetch weather forecast in parallel
  const weather = await fetchWeekendWeather(city.lat, city.lng);

  // Check if we have curated database for this city name
  const matchedKey = Object.keys(CURATED_PLACES_DATABASE).find(
    (k) => city.name.toLowerCase().includes(k.toLowerCase()) || city.displayName.toLowerCase().includes(k.toLowerCase())
  );

  let rawPlaces: PlacePOI[] = [];

  if (matchedKey && CURATED_PLACES_DATABASE[matchedKey].length > 0) {
    rawPlaces = [...CURATED_PLACES_DATABASE[matchedKey]];
  } else {
    // Try live Overpass fetch
    const osmPlaces = await fetchLiveOsmPois(city.lat, city.lng);
    if (osmPlaces.length > 0) {
      rawPlaces = osmPlaces;
    } else {
      // Generic fallback
      rawPlaces = CURATED_PLACES_DATABASE['Bandung'].map((p) => ({
        ...p,
        id: `generic-${p.id}`,
        lat: city.lat + (p.lat - (-6.9175)) * 0.5,
        lng: city.lng + (p.lng - 107.6191) * 0.5,
      }));
    }
  }

  // Calculate distance from city center for each place
  const enrichedPlaces = rawPlaces.map((place) => {
    const dist = calculateDistanceKm(city.lat, city.lng, place.lat, place.lng);
    return {
      ...place,
      distanceKm: dist,
    };
  });

  // Sort places: prioritize places that match the weekend weather best!
  const isWeekendRainy = weather.saturday.isRainy || weather.sunday.isRainy;
  enrichedPlaces.sort((a, b) => {
    if (isWeekendRainy) {
      if (a.type === 'INDOOR' && b.type === 'OUTDOOR') return -1;
      if (a.type === 'OUTDOOR' && b.type === 'INDOOR') return 1;
    } else {
      if (a.type === 'OUTDOOR' && b.type === 'INDOOR') return -1;
      if (a.type === 'INDOOR' && b.type === 'OUTDOOR') return 1;
    }
    return (a.distanceKm || 0) - (b.distanceKm || 0);
  });

  return {
    city,
    weather,
    places: enrichedPlaces,
  };
}

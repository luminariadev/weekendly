import React, { useState, useEffect } from 'react';
import {
  Compass,
  CloudRain,
  Sun,
  MapPin,
  Navigation,
  Share2,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Coffee,
  Check,
} from 'lucide-react';
import type { CityLocation, SmartOutingResult, PlacePOI } from './types';
import {
  POPULAR_CITIES,
  getSmartOutingRecommendations,
  searchCity,
} from './services/api';
import { MapComponent } from './components/MapComponent';

export function App() {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]); // Default: Bandung
  const [data, setData] = useState<SmartOutingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Filter & Selected place
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OUTDOOR' | 'INDOOR'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<PlacePOI | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Fetch recommendations when city changes
  useEffect(() => {
    let isCancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      setSelectedPlace(null);
      try {
        const result = await getSmartOutingRecommendations(selectedCity);
        if (!isCancelled) {
          setData(result);
          if (result.places.length > 0) {
            setSelectedPlace(result.places[0]);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Gagal memuat rekomendasi');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => {
      isCancelled = true;
    };
  }, [selectedCity]);

  // Handle City Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchCity(searchQuery);
      if (results.length > 0) {
        setSelectedCity(results[0]);
        setSearchQuery('');
      } else {
        alert('Kota tidak ditemukan. Silakan coba nama kota lainnya.');
      }
    } catch {
      alert('Gagal mencari kota.');
    } finally {
      setIsSearching(false);
    }
  };

  // Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur geolokasi tidak didukung di browser ini.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc: CityLocation = {
          name: 'Lokasi Anda',
          displayName: 'Lokasi Terdeteksi',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSelectedCity(userLoc);
      },
      (err) => {
        alert(`Gagal mendeteksi lokasi: ${err.message}`);
        setLoading(false);
      }
    );
  };

  // Share functionality
  const handleShare = () => {
    if (!data) return;
    const shareText = `🌟 Rencana Akhir Pekan di ${data.city.name} (Weekendly)
📅 Sabtu: ${data.weather.saturday.weatherDescription} (${data.weather.saturday.tempMax}°C, Hujan ${data.weather.saturday.precipitationProbability}%)
📅 Minggu: ${data.weather.sunday.weatherDescription} (${data.weather.sunday.tempMax}°C, Hujan ${data.weather.sunday.precipitationProbability}%)
💡 Saran: ${data.weather.summary}
🏛️ Top Rekomendasi: ${data.places.slice(0, 3).map((p) => p.name).join(', ')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Filtered places
  const filteredPlaces = data
    ? data.places.filter((p) => {
        if (activeFilter === 'ALL') return true;
        return p.type === activeFilter;
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-800">
                Weekend<span className="text-emerald-600">ly</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                KalaPekan AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectLocation}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition text-slate-700"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Lokasi Saya</span>
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Bagikan Rencana'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero & City Picker */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Weekend Recommender (Weather + Places Mashup)
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Rencanakan Akhir Pekanmu Tanpa Drama Cuaca.
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Otomatis menganalisis prakiraan cuaca Sabtu & Minggu dari <b className="text-white">Open-Meteo</b> dan mencocokkan tempat seru terbaik via <b className="text-white">OpenStreetMap</b>.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama kota... (misal: Bandung, Malang, Bogor)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                {isSearching ? 'Mencari...' : 'Cari Kota'}
              </button>
            </form>

            {/* Quick City Chips */}
            <div className="pt-3 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1">Pilihan Cepat:</span>
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1 rounded-full transition font-medium ${
                    selectedCity.name === c.name
                      ? 'bg-emerald-400 text-slate-950 shadow-md font-semibold'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600 font-medium text-sm">
              Menghubungkan ke Open-Meteo & OpenStreetMap untuk {selectedCity.name}...
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Weather Snapshot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Saturday Forecast Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Sabtu ({data.weather.saturday.date})
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {data.weather.saturday.weatherDescription}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      data.weather.saturday.isRainy
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {data.weather.saturday.isRainy ? (
                      <CloudRain className="w-6 h-6" />
                    ) : (
                      <Sun className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-800">
                      {data.weather.saturday.tempMax}°C
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      / min {data.weather.saturday.tempMin}°C
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Peluang Hujan</span>
                    <span
                      className={`text-sm font-bold ${
                        data.weather.saturday.precipitationProbability > 40
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {data.weather.saturday.precipitationProbability}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block w-full text-center text-xs py-1.5 px-3 rounded-lg font-semibold ${
                      data.weather.saturday.recommendationMode === 'INDOOR'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {data.weather.saturday.recommendationMode === 'INDOOR'
                      ? '🏛️ Disarankan: Aktivitas Indoor'
                      : '☀️ Disarankan: Aktivitas Outdoor'}
                  </span>
                </div>
              </div>

              {/* Sunday Forecast Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Minggu ({data.weather.sunday.date})
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {data.weather.sunday.weatherDescription}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-xl ${
                      data.weather.sunday.isRainy
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {data.weather.sunday.isRainy ? (
                      <CloudRain className="w-6 h-6" />
                    ) : (
                      <Sun className="w-6 h-6" />
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-800">
                      {data.weather.sunday.tempMax}°C
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      / min {data.weather.sunday.tempMin}°C
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Peluang Hujan</span>
                    <span
                      className={`text-sm font-bold ${
                        data.weather.sunday.precipitationProbability > 40
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {data.weather.sunday.precipitationProbability}%
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-block w-full text-center text-xs py-1.5 px-3 rounded-lg font-semibold ${
                      data.weather.sunday.recommendationMode === 'INDOOR'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {data.weather.sunday.recommendationMode === 'INDOOR'
                      ? '🏛️ Disarankan: Aktivitas Indoor'
                      : '☀️ Disarankan: Aktivitas Outdoor'}
                  </span>
                </div>
              </div>

              {/* AI Weather Copilot Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/70 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Kesimpulan Rencana
                  </div>
                  <h4 className="font-bold text-slate-900 mt-2 text-base">
                    Strategi Liburan di {data.city.name}
                  </h4>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                    {data.weather.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-200/50 flex items-center justify-between text-xs text-slate-600">
                  <span>Data: Open-Meteo v1</span>
                  <span className="font-medium text-emerald-800">
                    {filteredPlaces.length} Tempat Tersedia
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    activeFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua Tempat ({data.places.length})
                </button>
                <button
                  onClick={() => setActiveFilter('OUTDOOR')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    activeFilter === 'OUTDOOR'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Outdoor Saja
                </button>
                <button
                  onClick={() => setActiveFilter('INDOOR')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 ${
                    activeFilter === 'INDOOR'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Indoor Safe (Anti Hujan)
                </button>
              </div>

              <span className="text-xs text-slate-500">
                Pilih tempat untuk melihat di peta
              </span>
            </div>

            {/* Main Interactive Grid: Place Cards (Left) & Map (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Place Cards List */}
              <div className="lg:col-span-7 space-y-4">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const isIndoor = place.type === 'INDOOR';

                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`group cursor-pointer bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-sm ${
                            isIndoor
                              ? 'bg-purple-900/80 text-purple-200'
                              : 'bg-emerald-900/80 text-emerald-200'
                          }`}
                        >
                          {isIndoor ? '🏛️ Indoor' : '🌲 Outdoor'}
                        </span>
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                              {place.name}
                            </h4>
                            {place.rating && (
                              <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                ★ {place.rating}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-medium block">
                            {place.category}
                          </span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                            {place.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-3 text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {place.distanceKm} km
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {place.weatherFitBadge}
                            </span>
                          </div>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                          >
                            Rute Google Maps
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPlaces.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 text-sm">
                      Tidak ada tempat dalam filter ini untuk {selectedCity.name}.
                    </p>
                  </div>
                )}
              </div>

              {/* Map & Detail Sidebar (Right) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <MapComponent
                  city={selectedCity}
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                />

                {/* Selected Place Card Detail */}
                {selectedPlace && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Destinasi Terpilih
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedPlace.distanceKm} km dari pusat
                      </span>
                    </div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {selectedPlace.name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {selectedPlace.address || selectedPlace.description}
                    </p>
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Navigasi Sekarang
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p>
            <b>Weekendly (KalaPekan)</b> &mdash; Dibuat dengan data terbuka dari{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline"
            >
              Open-Meteo
            </a>{' '}
            &amp;{' '}
            <a
              href="https://www.openstreetmap.org/"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:underline"
            >
              OpenStreetMap
            </a>
            .
          </p>
          <p className="text-slate-400">
            Koleksi API terinspirasi dari repositori github.com/public-apis/public-apis.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

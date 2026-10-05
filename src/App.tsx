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
  Bookmark,
  MessageSquare,
  PlusCircle,
  ShieldAlert,
  Star,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import type { CityLocation, SmartOutingResult, PlacePOI } from './types';
import {
  POPULAR_CITIES,
  getSmartOutingRecommendations,
  searchCity,
} from './services/api';
import { useAuth } from './context/AuthContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { MapComponent } from './components/MapComponent';
import { MerchantModal } from './components/MerchantModal';
import { AdminDeskModal } from './components/AdminDeskModal';
import { ReviewModal } from './components/ReviewModal';

export function App() {
  const {
    switchRole,
    wishlist,
    toggleWishlist,
    isWishlisted,
    canSaveWishlist,
    canAddReview,
    canSubmitVenue,
    canModerate,
  } = useAuth();

  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]); // Bandung
  const [data, setData] = useState<SmartOutingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Filters & Tabs
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OUTDOOR' | 'INDOOR' | 'WISHLIST'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<PlacePOI | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Modals state
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [reviewPlace, setReviewPlace] = useState<PlacePOI | null>(null);
  const [guestPromptModal, setGuestPromptModal] = useState<boolean>(false);

  // Load recommendations
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSmartOutingRecommendations(selectedCity);
      setData(result);
      if (result.places.length > 0) {
        setSelectedPlace(result.places[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat rekomendasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        alert('Kota tidak ditemukan. Silakan masukkan nama kota lainnya.');
      }
    } catch {
      alert('Gagal mencari kota.');
    } finally {
      setIsSearching(false);
    }
  };

  // Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Fitur geolokasi tidak didukung browser ini.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCity({
          name: 'Lokasi Anda',
          displayName: 'Lokasi Terdeteksi',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        alert(`Gagal mendeteksi lokasi: ${err.message}`);
        setLoading(false);
      }
    );
  };

  // Share
  const handleShare = () => {
    if (!data) return;
    const shareText = `⚡ WEEKENDLY [ANTI AI-SLOP] - Rencana Akhir Pekan di ${data.city.name}
🗓️ SABTU: ${data.weather.saturday.weatherDescription} (${data.weather.saturday.tempMax}°C, Hujan ${data.weather.saturday.precipitationProbability}%)
🗓️ MINGGU: ${data.weather.sunday.weatherDescription} (${data.weather.sunday.tempMax}°C, Hujan ${data.weather.sunday.precipitationProbability}%)
💡 KEPUTUSAN: ${data.weather.summary}
📍 SPOT UNGGULAN: ${data.places.slice(0, 3).map((p) => p.name).join(' | ')}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Handle Wishlist Toggle with RBAC Guard
  const handleWishlistClick = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canSaveWishlist) {
      setGuestPromptModal(true);
      return;
    }
    toggleWishlist(placeId);
  };

  // Handle Review Button with RBAC Guard
  const handleReviewClick = (place: PlacePOI, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddReview) {
      setGuestPromptModal(true);
      return;
    }
    setReviewPlace(place);
  };

  // Filtered Places
  const filteredPlaces = data
    ? data.places.filter((p) => {
        if (activeFilter === 'WISHLIST') {
          return wishlist.includes(p.id);
        }
        if (activeFilter === 'ALL') return true;
        return p.type === activeFilter;
      })
    : [];

  return (
    <div className="min-h-screen bg-[#FBF9F1] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* 1. Neubrutalist RBAC Controller Bar */}
      <RoleSwitcher />

      {/* 2. Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#FFE600] border-[3px] border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
              <Compass className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-2xl tracking-tighter uppercase">
                  WEEKEND<span className="bg-black text-[#FFE600] px-1 ml-0.5">LY</span>
                </span>
                <span className="hidden sm:inline-block bg-[#A3E635] border-2 border-black px-1.5 py-0.5 text-[10px] font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                  ANTI AI-SLOP
                </span>
              </div>
              <p className="text-[11px] font-mono font-bold text-stone-600 hidden sm:block">
                Open-Meteo &bull; OpenStreetMap &bull; RBAC Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Merchant Venue Submission Button */}
            {canSubmitVenue && (
              <button
                onClick={() => setIsMerchantModalOpen(true)}
                className="bg-[#FFDE59] hover:bg-yellow-300 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Tambah Spot</span>
              </button>
            )}

            {/* Admin Curator Desk Button */}
            {canModerate && (
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="bg-[#FF6B6B] hover:bg-rose-400 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 text-black"
              >
                <ShieldAlert className="w-4 h-4" />
                <span className="hidden md:inline">Meja Kurasi</span>
              </button>
            )}

            {/* Geolocation Button */}
            <button
              onClick={handleDetectLocation}
              className="bg-white hover:bg-stone-100 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
            >
              <Navigation className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Lokasi</span>
            </button>

            {/* Share Plan Button */}
            <button
              onClick={handleShare}
              className="bg-[#A3E635] hover:bg-lime-300 border-[3px] border-black px-4 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'TERSALIN!' : 'BAGIKAN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Banner with Neubrutalist Aesthetic */}
        <div className="bg-white border-[4px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FFE600] border-b-2 border-l-2 border-black px-4 py-1 font-mono font-black text-xs uppercase tracking-wider">
            PUBLIC-APIS INTEGRATION #01
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-black text-[#FFE600] border-2 border-black px-3 py-1 rounded font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#FFE600]">
              <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
              Smart Weather &times; OpenStreetMap Mashup
            </div>

            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05] text-black">
              RENCANAKAN AKHIR PEKAN TANPA DRAMA CUACA.
            </h1>

            <p className="text-sm sm:text-base font-medium text-stone-700 leading-relaxed font-sans">
              Menghilangkan rekomendasi generik ala bot. Sistem ini mengekstrak data cuaca presisi dari{' '}
              <b className="underline decoration-2">Open-Meteo</b> dan memetakan ruang terbuka & indoor ramah hujan via{' '}
              <b className="underline decoration-2">OpenStreetMap</b> secara real-time.
            </p>

            {/* Neubrutalist City Search Box */}
            <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
                <input
                  type="text"
                  placeholder="Ketik nama kota... (misal: Bandung, Malang, Yogyakarta)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border-[3px] border-black rounded-xl font-mono text-sm shadow-[4px_4px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/15 placeholder:text-stone-500 font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-[#FFE600] hover:bg-yellow-300 border-[3px] border-black rounded-xl font-mono font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] transition-all"
              >
                {isSearching ? 'MENCARI...' : 'CARI KOTA'}
              </button>
            </form>

            {/* Popular City Quick Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black uppercase text-stone-600">Kota Cepat:</span>
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCity.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCity(c)}
                    className={`px-3 py-1 rounded-lg border-2 border-black font-mono font-black text-xs uppercase transition-all ${
                      isSelected
                        ? 'bg-[#38BDF8] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                        : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="py-20 text-center space-y-4 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000]">
            <div className="w-12 h-12 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto"></div>
            <p className="font-mono font-black text-sm uppercase text-black">
              Sinkronisasi Open-Meteo & OpenStreetMap untuk {selectedCity.name}...
            </p>
          </div>
        )}

        {error && (
          <div className="p-5 bg-rose-100 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] font-mono text-xs font-bold text-rose-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* Loaded Content */}
        {!loading && data && (
          <div className="space-y-6">
            {/* Weather Snapshot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sabtu Forecast */}
              <div className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-black text-[#FFE600] font-mono font-black text-[11px] px-2 py-0.5 uppercase rounded border border-black inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> SABTU &bull; {data.weather.saturday.date}
                      </span>
                      <h3 className="font-mono font-black text-xl text-black uppercase mt-2">
                        {data.weather.saturday.weatherDescription}
                      </h3>
                    </div>
                    <div
                      className={`p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] ${
                        data.weather.saturday.isRainy ? 'bg-[#38BDF8]' : 'bg-[#FFE600]'
                      }`}
                    >
                      {data.weather.saturday.isRainy ? (
                        <CloudRain className="w-7 h-7 stroke-[2.5]" />
                      ) : (
                        <Sun className="w-7 h-7 stroke-[2.5]" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-3xl text-black">
                        {data.weather.saturday.tempMax}°C
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-600 ml-1">
                        / Min {data.weather.saturday.tempMin}°C
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
                        Peluang Hujan
                      </span>
                      <span className="font-mono font-black text-sm text-black">
                        {data.weather.saturday.precipitationProbability}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`block text-center font-mono font-black text-xs py-2 px-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase ${
                      data.weather.saturday.recommendationMode === 'INDOOR'
                        ? 'bg-[#C084FC] text-black'
                        : 'bg-[#A3E635] text-black'
                    }`}
                  >
                    {data.weather.saturday.recommendationMode === 'INDOOR'
                      ? '🏛️ REKOMENDASI: AKTIVITAS INDOOR'
                      : '🌲 REKOMENDASI: AKTIVITAS OUTDOOR'}
                  </span>
                </div>
              </div>

              {/* Minggu Forecast */}
              <div className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="bg-black text-[#FFE600] font-mono font-black text-[11px] px-2 py-0.5 uppercase rounded border border-black inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> MINGGU &bull; {data.weather.sunday.date}
                      </span>
                      <h3 className="font-mono font-black text-xl text-black uppercase mt-2">
                        {data.weather.sunday.weatherDescription}
                      </h3>
                    </div>
                    <div
                      className={`p-3 border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] ${
                        data.weather.sunday.isRainy ? 'bg-[#38BDF8]' : 'bg-[#FFE600]'
                      }`}
                    >
                      {data.weather.sunday.isRainy ? (
                        <CloudRain className="w-7 h-7 stroke-[2.5]" />
                      ) : (
                        <Sun className="w-7 h-7 stroke-[2.5]" />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                    <div>
                      <span className="font-mono font-black text-3xl text-black">
                        {data.weather.sunday.tempMax}°C
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-600 ml-1">
                        / Min {data.weather.sunday.tempMin}°C
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
                        Peluang Hujan
                      </span>
                      <span className="font-mono font-black text-sm text-black">
                        {data.weather.sunday.precipitationProbability}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`block text-center font-mono font-black text-xs py-2 px-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] uppercase ${
                      data.weather.sunday.recommendationMode === 'INDOOR'
                        ? 'bg-[#C084FC] text-black'
                        : 'bg-[#A3E635] text-black'
                    }`}
                  >
                    {data.weather.sunday.recommendationMode === 'INDOOR'
                      ? '🏛️ REKOMENDASI: AKTIVITAS INDOOR'
                      : '🌲 REKOMENDASI: AKTIVITAS OUTDOOR'}
                  </span>
                </div>
              </div>

              {/* Weather Copilot Strategy Card */}
              <div className="bg-[#FFE600] border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-mono font-black text-xs uppercase bg-black text-[#FFE600] px-2 py-1 rounded inline-block">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                    ANALISIS KEPUTUSAN
                  </div>
                  <h4 className="font-mono font-black text-lg text-black uppercase mt-2">
                    Strategi Liburan di {data.city.name}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-black mt-2 leading-relaxed font-sans">
                    {data.weather.summary}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t-2 border-black flex items-center justify-between font-mono text-xs font-black">
                  <span>API: Open-Meteo v1</span>
                  <span className="bg-white border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000]">
                    {filteredPlaces.length} Tempat Terdaftar
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Chips & Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-black pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveFilter('ALL')}
                  className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all ${
                    activeFilter === 'ALL'
                      ? 'bg-black text-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  Semua Tempat ({data.places.length})
                </button>
                <button
                  onClick={() => setActiveFilter('OUTDOOR')}
                  className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
                    activeFilter === 'OUTDOOR'
                      ? 'bg-[#A3E635] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  Outdoor Saja
                </button>
                <button
                  onClick={() => setActiveFilter('INDOOR')}
                  className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
                    activeFilter === 'INDOOR'
                      ? 'bg-[#C084FC] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Indoor Safe (Anti Hujan)
                </button>
                <button
                  onClick={() => setActiveFilter('WISHLIST')}
                  className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-1.5 ${
                    activeFilter === 'WISHLIST'
                      ? 'bg-[#FF6B6B] text-white shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Agenda Saya ({wishlist.length})
                </button>
              </div>

              <span className="font-mono text-xs font-bold text-stone-600">
                Klik kartu tempat untuk fokus di peta
              </span>
            </div>

            {/* Split Layout: Places List (Left) & Map (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Place Cards List */}
              <div className="lg:col-span-7 space-y-4">
                {filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const isIndoor = place.type === 'INDOOR';
                  const wishlisted = isWishlisted(place.id);
                  const reviewCount = place.reviews?.length || 0;

                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
                      className={`group cursor-pointer bg-white rounded-xl p-4 sm:p-5 border-[3px] border-black transition-all duration-150 flex flex-col sm:flex-row gap-4 ${
                        isSelected
                          ? 'shadow-[7px_7px_0px_0px_#000] ring-4 ring-[#FFE600] translate-x-[-2px] translate-y-[-2px]'
                          : 'shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000]'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-full sm:w-40 h-40 rounded-lg overflow-hidden border-2 border-black shrink-0 bg-stone-100">
                        <img
                          src={place.imageUrl}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className={`absolute top-2 left-2 text-[10px] font-mono font-black px-2 py-0.5 rounded border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000] ${
                            isIndoor ? 'bg-[#C084FC] text-black' : 'bg-[#A3E635] text-black'
                          }`}
                        >
                          {isIndoor ? '🏛️ INDOOR' : '🌲 OUTDOOR'}
                        </span>
                      </div>

                      {/* Info & Metadata */}
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-mono font-black text-lg text-black uppercase leading-tight group-hover:text-[#38BDF8] transition">
                              {place.name}
                            </h4>
                            {place.rating && (
                              <span className="shrink-0 font-mono text-xs font-black px-2 py-0.5 rounded bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                                ★ {place.rating}
                              </span>
                            )}
                          </div>

                          <span className="font-mono text-xs font-bold text-stone-600 block mt-0.5">
                            {place.category}
                          </span>

                          <p className="text-xs text-stone-800 mt-1 line-clamp-2 leading-relaxed font-sans font-medium">
                            {place.description}
                          </p>
                        </div>

                        {/* Merchant Promo Banner if available */}
                        {place.promoText && (
                          <div className="bg-[#FFE600]/30 border-2 border-black p-2 rounded text-xs font-mono font-black text-stone-900 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
                            <Tag className="w-3.5 h-3.5 text-black" />
                            {place.promoText}
                          </div>
                        )}

                        {/* Bottom Row Actions & Distance */}
                        <div className="pt-2 border-t-2 border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                          <div className="flex items-center gap-2 text-black font-bold">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {place.distanceKm} KM
                            </span>
                            <span className="bg-stone-100 border border-black px-1.5 py-0.5 text-[10px]">
                              {place.weatherFitBadge}
                            </span>
                          </div>

                          {/* Action Buttons: Wishlist, Review, Maps */}
                          <div className="flex items-center gap-2">
                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => handleWishlistClick(place.id, e)}
                              title={wishlisted ? 'Hapus dari Agenda' : 'Simpan ke Agenda Saya'}
                              className={`p-1.5 rounded border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 ${
                                wishlisted ? 'bg-[#FF6B6B] text-white' : 'bg-white hover:bg-stone-100'
                              }`}
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                            </button>

                            {/* Review Button */}
                            <button
                              onClick={(e) => handleReviewClick(place, e)}
                              title="Tulis Ulasan Tempat"
                              className="px-2 py-1 bg-white hover:bg-stone-100 border-2 border-black rounded text-[11px] font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>({reviewCount})</span>
                            </button>

                            {/* Google Maps External Route */}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 bg-[#A3E635] hover:bg-lime-300 border-2 border-black rounded text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                            >
                              RUTE <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredPlaces.length === 0 && (
                  <div className="text-center py-12 bg-white border-[3px] border-dashed border-black rounded-xl p-6">
                    <p className="font-mono font-bold text-sm text-stone-600 uppercase">
                      Tidak ada tempat dalam filter ini untuk {selectedCity.name}.
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky Map Component & Active Venue Card (Right) */}
              <div className="lg:col-span-5 sticky top-22 space-y-4">
                <MapComponent
                  city={selectedCity}
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                />

                {/* Selected Place Inspector */}
                {selectedPlace && (
                  <div className="bg-white p-5 rounded-xl border-[3px] border-black shadow-[6px_6px_0px_0px_#000] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="bg-black text-[#FFE600] font-mono font-black text-xs px-2 py-0.5 uppercase rounded">
                        DESTINASI TERPILIH
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-600">
                        {selectedPlace.distanceKm} KM DARI PUSAT
                      </span>
                    </div>

                    <h3 className="font-mono font-black text-xl text-black uppercase leading-tight">
                      {selectedPlace.name}
                    </h3>

                    <p className="text-xs text-stone-700 font-medium font-sans">
                      {selectedPlace.address || selectedPlace.description}
                    </p>

                    {/* Reviews List Snippet */}
                    {selectedPlace.reviews && selectedPlace.reviews.length > 0 && (
                      <div className="bg-stone-50 border-2 border-black p-3 rounded-lg space-y-2">
                        <span className="font-mono font-black text-[11px] uppercase text-stone-800 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          Ulasan Komunitas:
                        </span>
                        {selectedPlace.reviews.slice(0, 2).map((rev) => (
                          <div key={rev.id} className="text-xs border-b border-stone-200 pb-1.5 last:border-none last:pb-0">
                            <div className="flex items-center justify-between font-mono text-[10px] text-stone-500">
                              <b>{rev.authorName}</b>
                              <span>{rev.createdAt}</span>
                            </div>
                            <p className="text-[11px] font-sans text-stone-700 mt-0.5">
                              "{rev.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-lg bg-black hover:bg-stone-800 text-[#FFE600] font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#FFE600]"
                      >
                        <Navigation className="w-4 h-4" />
                        BUKA GOOGLE MAPS
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Guest Restricted Prompt Modal (RBAC Demonstration) */}
      {guestPromptModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF5] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-md p-6 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="bg-[#FF6B6B] border-2 border-black p-2 rounded shadow-[2px_2px_0px_0px_#000]">
                <ShieldAlert className="w-6 h-6 text-black" />
              </div>
              <button
                onClick={() => setGuestPromptModal(false)}
                className="font-mono font-black text-sm border-2 border-black px-2 py-0.5 bg-white shadow-[2px_2px_0px_0px_#000]"
              >
                TUTUP
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-mono font-black text-xl uppercase text-black">
                AKSES TERBATAS: ROLE GUEST
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed font-sans font-medium">
                Fitur <b>Simpan Wishlist</b> dan <b>Memberi Ulasan</b> hanya dapat digunakan oleh pengguna dengan role <b>User Terdaftar</b>, <b>Merchant</b>, atau <b>Admin</b>.
              </p>
            </div>

            <div className="bg-[#FFE600]/30 border-2 border-black p-3 rounded font-mono text-xs text-black">
              💡 <b>Coba Simulasi RBAC:</b> Anda dapat langsung beralih ke akun <b>USER (Rian Pratama)</b> dengan 1-klik di bawah ini!
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setGuestPromptModal(false)}
                className="px-4 py-2 border-2 border-black bg-white rounded font-mono font-bold text-xs uppercase"
              >
                Nanti Saja
              </button>
              <button
                onClick={() => {
                  switchRole('user');
                  setGuestPromptModal(false);
                }}
                className="px-5 py-2 border-[3px] border-black bg-[#38BDF8] rounded font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Ganti ke Role USER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals: Merchant & Admin & Review */}
      <MerchantModal
        city={selectedCity}
        isOpen={isMerchantModalOpen}
        onClose={() => setIsMerchantModalOpen(false)}
        onVenueCreated={() => {
          loadData();
        }}
      />

      <AdminDeskModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onModerationChanged={() => {
          loadData();
        }}
      />

      <ReviewModal
        place={reviewPlace}
        isOpen={!!reviewPlace}
        onClose={() => setReviewPlace(null)}
        onReviewAdded={() => {
          loadData();
        }}
      />

      {/* Footer */}
      <footer className="bg-black text-white border-t-[4px] border-black py-8 mt-16 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-black text-base uppercase text-[#FFE600] tracking-wider">
              WEEKENDLY &bull; KALAPEKAN
            </span>
            <p className="text-stone-400">
              Platform mashup cerdas berbasis open-source data dari kurasi public-apis/public-apis.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#A3E635]">
              WEATHER: Open-Meteo
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#38BDF8]">
              MAPS: OpenStreetMap
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#FFE600]">
              RBAC: 4 Roles Active
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

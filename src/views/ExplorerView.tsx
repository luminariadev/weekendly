import React from 'react';
import {
  CloudRain,
  Sun,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Coffee,
  Bookmark,
  MessageSquare,
  Tag,
  AlertTriangle,
  Clock,
  Eye,
  Navigation,
} from 'lucide-react';
import type { CityLocation, SmartOutingResult, PlacePOI } from '../types';
import { POPULAR_CITIES } from '../services/api';
import { MapComponent } from '../components/MapComponent';
import { useAuth } from '../context/AuthContext';

interface ExplorerViewProps {
  data: SmartOutingResult | null;
  loading: boolean;
  error: string | null;
  selectedCity: CityLocation;
  setSelectedCity: (city: CityLocation) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearching: boolean;
  handleSearchSubmit: (e: React.FormEvent) => void;
  activeFilter: 'ALL' | 'OUTDOOR' | 'INDOOR';
  setActiveFilter: (filter: 'ALL' | 'OUTDOOR' | 'INDOOR') => void;
  selectedPlace: PlacePOI | null;
  setSelectedPlace: (place: PlacePOI | null) => void;
  onPreviewPlace: (place: PlacePOI) => void;
  onWishlistClick: (placeId: string, e: React.MouseEvent) => void;
  onReviewClick: (place: PlacePOI, e: React.MouseEvent) => void;
}

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  data,
  loading,
  error,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  isSearching,
  handleSearchSubmit,
  activeFilter,
  setActiveFilter,
  selectedPlace,
  setSelectedPlace,
  onPreviewPlace,
  onWishlistClick,
  onReviewClick,
}) => {
  const { isWishlisted, isAuthenticated } = useAuth();

  const filteredPlaces = data
    ? data.places.filter((p) => {
        if (activeFilter === 'ALL') return true;
        return p.type === activeFilter;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white border-[4px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-[#FFE600] border-b-2 border-l-2 border-black px-4 py-1 font-mono font-black text-xs uppercase tracking-wider">
          OPEN-METEO &times; GOOGLE MAPS
        </div>

        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-black text-[#FFE600] border-2 border-black px-3 py-1 rounded font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#FFE600]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE600]" />
            Smart Weather Forecast &times; Real Landmarks Mashup
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05] text-black">
            RENCANAKAN AKHIR PEKAN TANPA DRAMA CUACA.
          </h1>

          <p className="text-sm sm:text-base font-medium text-stone-700 leading-relaxed font-sans">
            Menghubungkan data prakiraan cuaca jam-jaman dari{' '}
            <b className="underline decoration-2">Open-Meteo</b> dengan tempat wisata terverifikasi di{' '}
            <b className="underline decoration-2">Google Maps</b> lengkap dengan jam buka & tiket masuk resmi.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black" />
              <input
                type="text"
                placeholder="Ketik nama kota... (misal: Bandung, Jakarta, Yogyakarta)"
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

          {/* Popular Cities */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-black uppercase text-stone-600">Kota Pilihan:</span>
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

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center space-y-4 bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_#000]">
          <div className="w-12 h-12 border-4 border-black border-t-[#FFE600] rounded-full animate-spin mx-auto"></div>
          <p className="font-mono font-black text-sm uppercase text-black">
            Mengambil prakiraan cuaca Open-Meteo & Landmark Google Maps untuk {selectedCity.name}...
          </p>
        </div>
      )}

      {error && (
        <div className="p-5 bg-rose-100 border-[3px] border-black rounded-xl shadow-[4px_4px_0px_0px_#000] font-mono text-xs font-bold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Explorer Content */}
      {!loading && data && (
        <div className="space-y-6">
          {/* Weather Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sabtu */}
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

            {/* Minggu */}
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

            {/* Strategy */}
            <div className="bg-[#FFE600] border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-mono font-black text-xs uppercase bg-black text-[#FFE600] px-2 py-1 rounded inline-block">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                  ANALISIS CUACA & TEMPAT
                </div>
                <h4 className="font-mono font-black text-lg text-black uppercase mt-2">
                  Strategi Liburan di {data.city.name}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-black mt-2 leading-relaxed font-sans">
                  {data.weather.summary}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t-2 border-black flex items-center justify-between font-mono text-xs font-black">
                <span>API: Open-Meteo & Google Maps</span>
                <span className="bg-white border-2 border-black px-2 py-0.5 rounded shadow-[2px_2px_0px_0px_#000]">
                  {filteredPlaces.length} Tempat Terverifikasi
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
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
            </div>

            <span className="font-mono text-xs font-bold text-stone-600">
              Pilih tempat untuk melihat di Google Maps
            </span>
          </div>

          {/* Place Cards & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* List */}
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
                    {/* Image */}
                    <div className="relative w-full sm:w-44 h-44 rounded-lg overflow-hidden border-2 border-black shrink-0 bg-stone-100">
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

                    {/* Metadata */}
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

                        <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3 text-stone-700" />
                          <span>{place.operationalHours || 'Buka Setiap Weekend'}</span>
                        </div>

                        <p className="text-xs text-stone-800 mt-1 line-clamp-2 leading-relaxed font-sans font-medium">
                          {place.description}
                        </p>
                      </div>

                      {place.promoText && (
                        <div className="bg-[#FFE600]/30 border-2 border-black p-2 rounded text-xs font-mono font-black text-stone-900 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
                          <Tag className="w-3.5 h-3.5 text-black" />
                          {place.promoText}
                        </div>
                      )}

                      <div className="pt-2 border-t-2 border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-black font-bold">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            {place.distanceKm} KM
                          </span>
                          <span className="bg-stone-100 border border-black px-1.5 py-0.5 text-[10px]">
                            {place.weatherFitBadge}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreviewPlace(place);
                            }}
                            className="px-2 py-1 bg-[#FFE600] hover:bg-yellow-300 border-2 border-black rounded text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 text-black"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Peta & Detail</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => onWishlistClick(place.id, e)}
                            title={
                              !isAuthenticated
                                ? 'Masuk untuk simpan ke Agenda'
                                : wishlisted
                                ? 'Hapus dari Agenda'
                                : 'Simpan ke Agenda Saya'
                            }
                            className={`p-1.5 rounded border-2 border-black font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 ${
                              wishlisted ? 'bg-[#FF6B6B] text-white' : 'bg-white hover:bg-stone-100'
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => onReviewClick(place, e)}
                            className="px-2 py-1 bg-white hover:bg-stone-100 border-2 border-black rounded text-[11px] font-bold uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>({reviewCount})</span>
                          </button>

                          <a
                            href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-1 bg-[#A3E635] hover:bg-lime-300 border-2 border-black rounded text-[11px] font-black uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                          >
                            Maps <ExternalLink className="w-3 h-3" />
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

            {/* Sticky Map Component */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <MapComponent
                city={selectedCity}
                places={filteredPlaces}
                selectedPlace={selectedPlace}
                onSelectPlace={(p) => setSelectedPlace(p)}
              />

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

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-stone-100 border border-black p-1.5 rounded">
                      <span className="font-bold block text-stone-500 uppercase">Jam Operasional:</span>
                      <span className="font-black text-black">
                        {selectedPlace.operationalHours || 'Setiap Weekend'}
                      </span>
                    </div>
                    <div className="bg-stone-100 border border-black p-1.5 rounded">
                      <span className="font-bold block text-stone-500 uppercase">Estimasi Tiket:</span>
                      <span className="font-black text-black">
                        {selectedPlace.ticketPrice || 'Standar'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewPlace(selectedPlace)}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-[#FFE600] hover:bg-yellow-300 text-black font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Eye className="w-4 h-4" />
                      PREVIEW GOOGLE MAPS
                    </button>
                    <a
                      href={selectedPlace.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + ' ' + (selectedPlace.address || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-lg bg-black hover:bg-stone-800 text-white font-mono font-black text-xs uppercase flex items-center justify-center gap-1.5 border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Navigation className="w-4 h-4 text-[#FFE600]" />
                      BUKA MAPS
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

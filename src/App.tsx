import React, { useState, useEffect } from 'react';
import {
  Compass,
  Share2,
  Check,
  Bookmark,
  LogIn,
  LogOut,
  UserPlus,
  Store,
  Shield,
  Eye,
} from 'lucide-react';
import type { CityLocation, SmartOutingResult, PlacePOI } from './types';
import {
  POPULAR_CITIES,
  getSmartOutingRecommendations,
  searchCity,
} from './services/api';
import { useAuth } from './context/AuthContext';
import { ExplorerView } from './views/ExplorerView';
import { UserDashboard } from './views/UserDashboard';
import { MerchantDashboard } from './views/MerchantDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { ReviewModal } from './components/ReviewModal';

export function App() {
  const { user, role, isAuthenticated, logout, wishlist, toggleWishlist, canSaveWishlist, canAddReview } =
    useAuth();

  // Active view: 'EXPLORER' vs 'ROLE_DASHBOARD'
  const [currentView, setCurrentView] = useState<'EXPLORER' | 'ROLE_DASHBOARD'>('EXPLORER');

  // Cities & Weather state
  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]); // Bandung
  const [data, setData] = useState<SmartOutingResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Explorer filters & selected place
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'OUTDOOR' | 'INDOOR'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<PlacePOI | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [detailPlace, setDetailPlace] = useState<PlacePOI | null>(null);
  const [reviewPlace, setReviewPlace] = useState<PlacePOI | null>(null);

  // Automatically adapt default view when role changes
  useEffect(() => {
    if (role === 'merchant' || role === 'admin') {
      setCurrentView('ROLE_DASHBOARD');
    } else {
      setCurrentView('EXPLORER');
    }
  }, [role]);

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

  // City Search
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

  // Share Plan
  const handleShare = () => {
    if (!data) return;
    const shareText = `⚡ WEEKENDLY [Anti AI-Slop] - Agenda Liburan ${data.city.name}
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

  // Wishlist Guard
  const handleWishlistClick = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canSaveWishlist) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    toggleWishlist(placeId);
  };

  // Review Guard
  const handleReviewClick = (place: PlacePOI, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAddReview) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setReviewPlace(place);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F1] text-black flex flex-col font-sans selection:bg-[#FFE600] selection:text-black">
      {/* 1. Header with Role Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b-[3px] border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('EXPLORER')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-11 h-11 bg-[#FFE600] border-[3px] border-black rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
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
                Open-Meteo &bull; Google Maps &bull; Dedicated Role Dashboards
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role-Specific Dashboard Switcher Buttons */}
            {role === 'merchant' && (
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <button
                  onClick={() => setCurrentView('ROLE_DASHBOARD')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'ROLE_DASHBOARD'
                      ? 'bg-[#FFDE59] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Dashboard Mitra</span>
                </button>
                <button
                  onClick={() => setCurrentView('EXPLORER')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'EXPLORER'
                      ? 'bg-black text-[#FFE600] border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tampilan Publik</span>
                </button>
              </div>
            )}

            {role === 'admin' && (
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <button
                  onClick={() => setCurrentView('ROLE_DASHBOARD')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'ROLE_DASHBOARD'
                      ? 'bg-[#FF6B6B] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Control Room</span>
                </button>
                <button
                  onClick={() => setCurrentView('EXPLORER')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'EXPLORER'
                      ? 'bg-black text-[#FFE600] border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tampilan Publik</span>
                </button>
              </div>
            )}

            {role === 'user' && (
              <div className="flex items-center gap-1.5 bg-stone-100 p-1 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                <button
                  onClick={() => setCurrentView('EXPLORER')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'EXPLORER'
                      ? 'bg-black text-[#FFE600] border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Eksplorasi</span>
                </button>
                <button
                  onClick={() => setCurrentView('ROLE_DASHBOARD')}
                  className={`px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                    currentView === 'ROLE_DASHBOARD'
                      ? 'bg-[#38BDF8] text-black border border-black shadow-[2px_2px_0px_0px_#000]'
                      : 'text-stone-700 hover:text-black'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Agenda Saya ({wishlist.length})</span>
                </button>
              </div>
            )}

            {/* Share Plan */}
            <button
              onClick={handleShare}
              className="bg-[#A3E635] hover:bg-lime-300 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'TERSALIN!' : 'BAGIKAN'}</span>
            </button>

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-black">
                <div className="bg-stone-100 border-2 border-black px-2.5 py-1 rounded-lg flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
                  <span
                    className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded border border-black uppercase ${
                      role === 'admin'
                        ? 'bg-[#FF6B6B] text-black'
                        : role === 'merchant'
                        ? 'bg-[#FFDE59] text-black'
                        : 'bg-[#38BDF8] text-black'
                    }`}
                  >
                    {role.toUpperCase()}
                  </span>
                  <span className="font-mono font-black text-xs text-black hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Apakah Anda ingin keluar dari sesi akun?')) {
                      logout();
                    }
                  }}
                  title="Keluar dari akun"
                  className="bg-white hover:bg-stone-100 border-2 border-black p-1.5 rounded-lg shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l-2 border-black">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-white hover:bg-stone-100 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="bg-[#38BDF8] hover:bg-sky-300 border-2 border-black px-3 py-1.5 rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] hidden sm:flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Guest Notice Banner if Not Logged In */}
      {!isAuthenticated && (
        <div className="bg-[#FFE600] border-b-2 border-black px-4 py-2 font-mono text-xs text-black">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-bold">
              <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                HALAMAN PUBLIK (GUEST)
              </span>
              Anda sedang menjelajah sebagai Tamu. Masuk untuk membuka workspace pribadi atau dashboard mitra bisnis.
            </span>
            <button
              onClick={() => {
                setAuthModalMode('login');
                setIsAuthModalOpen(true);
              }}
              className="underline font-black hover:text-stone-700 text-xs shrink-0"
            >
              Masuk / Coba Akun Demo &rarr;
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Body Content Based on Active View & Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW A: DEDICATED MERCHANT DASHBOARD */}
        {role === 'merchant' && currentView === 'ROLE_DASHBOARD' && (
          <MerchantDashboard
            onSwitchToPublic={() => setCurrentView('EXPLORER')}
            onPreviewPlace={(place) => setDetailPlace(place)}
          />
        )}

        {/* VIEW B: DEDICATED ADMIN CONTROL ROOM */}
        {role === 'admin' && currentView === 'ROLE_DASHBOARD' && (
          <AdminDashboard
            onSwitchToPublic={() => setCurrentView('EXPLORER')}
            onPreviewPlace={(place) => setDetailPlace(place)}
          />
        )}

        {/* VIEW C: DEDICATED USER PERSONAL WORKSPACE */}
        {role === 'user' && currentView === 'ROLE_DASHBOARD' && (
          <UserDashboard
            onSwitchToPublic={() => setCurrentView('EXPLORER')}
            onPreviewPlace={(place) => setDetailPlace(place)}
          />
        )}

        {/* VIEW D: PUBLIC WEATHER & PLACES EXPLORER */}
        {currentView === 'EXPLORER' && (
          <ExplorerView
            data={data}
            loading={loading}
            error={error}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            handleSearchSubmit={handleSearchSubmit}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            onPreviewPlace={(place) => setDetailPlace(place)}
            onWishlistClick={handleWishlistClick}
            onReviewClick={handleReviewClick}
          />
        )}
      </main>

      {/* 3. Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <PlaceDetailModal
        place={detailPlace}
        isOpen={!!detailPlace}
        onClose={() => setDetailPlace(null)}
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
              Platform mashup cerdas berbasis Open-Meteo & Google Maps dengan arsitektur role-based terpisah.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#A3E635]">
              WEATHER: Open-Meteo API
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#38BDF8]">
              MAPS: Google Maps Verified
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded border border-stone-700 text-[#FFE600]">
              RBAC: 4 Distinct Views
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

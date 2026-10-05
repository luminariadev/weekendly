import React, { useState, useEffect } from 'react';
import {
  Bookmark,
  Calendar,
  Bell,
  Star,
  MapPin,
  ExternalLink,
  Eye,
  Trash2,
  Navigation,
  Compass,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAllCuratedPlacesList,
  getStoredReviews,
} from '../services/api';
import type { PlacePOI, PlaceReview } from '../types';

interface UserDashboardProps {
  onSwitchToPublic: () => void;
  onPreviewPlace: (place: PlacePOI) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onSwitchToPublic,
  onPreviewPlace,
}) => {
  const { user, wishlist, toggleWishlist } = useAuth();
  const [activeTab, setActiveTab] = useState<'AGENDA' | 'ALERTS' | 'MY_REVIEWS'>('AGENDA');

  const [wishlistPlaces, setWishlistPlaces] = useState<PlacePOI[]>([]);
  const [myReviews, setMyReviews] = useState<PlaceReview[]>([]);
  const [alertCity, setAlertCity] = useState('Bandung');
  const [alertSaved, setAlertSaved] = useState(false);

  const loadUserData = () => {
    const all = getAllCuratedPlacesList();
    const saved = all.filter((p) => wishlist.includes(p.id));
    setWishlistPlaces(saved);

    // Load reviews authored by this user
    if (user) {
      const allReviewsDict = getStoredReviews();
      const userRevs: PlaceReview[] = [];
      Object.values(allReviewsDict).forEach((revList) => {
        revList.forEach((r) => {
          if (r.authorName.toLowerCase() === user.name.toLowerCase()) {
            userRevs.push(r);
          }
        });
      });
      setMyReviews(userRevs);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, wishlist]);

  if (!user) return null;

  const handleSaveAlert = () => {
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. User Hero Banner */}
      <div className="bg-[#38BDF8] border-[4px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="bg-black text-[#38BDF8] font-mono text-xs font-black px-3 py-1 uppercase rounded border border-black shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              TRAVELER PERSONAL WORKSPACE
            </span>
            <h1 className="font-mono font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              AGENDA AKHIR PEKAN: {user.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-stone-900 max-w-2xl font-sans">
              Pantau tempat yang Anda simpan, atur strategi liburan Sabtu & Minggu, dan kelola pengingat prakiraan cuaca otomatis.
            </p>
          </div>

          <button
            onClick={onSwitchToPublic}
            className="px-5 py-2.5 bg-white hover:bg-stone-100 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 shrink-0"
          >
            <Navigation className="w-4 h-4" />
            Cari Spot & Peta Baru
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-black">
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Tempat di Agenda Saya
            </span>
            <span className="font-mono font-black text-2xl text-black">
              {wishlistPlaces.length} Destinasi
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Pengingat Cuaca Weekend
            </span>
            <span className="font-mono font-black text-xs text-[#10b981] flex items-center gap-1 mt-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
              AKTIF: Tiap Jumat 17.00 WIB
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Ulasan Ditulis
            </span>
            <span className="font-mono font-black text-2xl text-[#f59e0b]">
              {myReviews.length} Review
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[3px] border-black pb-3">
        <button
          onClick={() => setActiveTab('AGENDA')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'AGENDA'
              ? 'bg-black text-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Agenda & Wishlist Saya ({wishlistPlaces.length})
        </button>

        <button
          onClick={() => setActiveTab('ALERTS')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'ALERTS'
              ? 'bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Pengingat Cuaca Weekend
        </button>

        <button
          onClick={() => setActiveTab('MY_REVIEWS')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'MY_REVIEWS'
              ? 'bg-[#A3E635] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Star className="w-4 h-4" />
          Riwayat Ulasan Saya ({myReviews.length})
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* Tab 1: Agenda & Wishlist */}
      {activeTab === 'AGENDA' && (
        <div className="space-y-4">
          {wishlistPlaces.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-black p-12 text-center rounded-2xl space-y-3">
              <Bookmark className="w-10 h-10 mx-auto text-stone-400" />
              <h4 className="font-mono font-black text-lg uppercase text-black">
                Agenda Anda Masih Kosong
              </h4>
              <p className="font-mono text-xs text-stone-600 max-w-md mx-auto">
                Buka katalog eksplorasi dan klik ikon Bookmark pada tempat yang ingin Anda kunjungi saat akhir pekan tiba!
              </p>
              <button
                onClick={onSwitchToPublic}
                className="mt-2 px-5 py-2.5 bg-[#FFE600] hover:bg-yellow-300 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000]"
              >
                Eksplorasi Tempat Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlistPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                            place.type === 'INDOOR' ? 'bg-[#C084FC] text-black' : 'bg-[#A3E635] text-black'
                          }`}
                        >
                          {place.type === 'INDOOR' ? '🏛️ INDOOR SAFE' : '🌲 OUTDOOR SAFE'}
                        </span>
                        <h4 className="font-mono font-black text-lg text-black uppercase mt-1">
                          {place.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => toggleWishlist(place.id)}
                        title="Hapus dari Agenda"
                        className="p-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#000] text-rose-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-xs font-mono text-stone-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {place.address}
                    </div>

                    <p className="font-sans text-xs text-stone-700 line-clamp-2">
                      {place.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t-2 border-stone-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPreviewPlace(place)}
                      className="px-3 py-1.5 bg-[#FFE600] border-2 border-black rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 text-black"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Peta Google
                    </button>
                    <a
                      href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#A3E635] border-2 border-black rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 text-black"
                    >
                      Rute <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Weekend Weather Alerts */}
      {activeTab === 'ALERTS' && (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-mono font-black text-xl uppercase text-black">
              PENGATURAN NOTIFIKASI CUACA AKHIR PEKAN
            </h3>
            <p className="font-mono text-xs text-stone-600">
              Dapatkan ringkasan cuaca dan rekomendasi tempat otomatis di inbox atau pesan chat Anda setiap hari Jumat pukul 17.00 WIB.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Pilih Kota Favorit Anda:
              </label>
              <select
                value={alertCity}
                onChange={(e) => setAlertCity(e.target.value)}
                className="w-full bg-stone-50 border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              >
                <option value="Bandung">Bandung, Jawa Barat</option>
                <option value="Jakarta">DKI Jakarta</option>
                <option value="Yogyakarta">DI Yogyakarta</option>
                <option value="Bogor">Bogor, Jawa Barat</option>
                <option value="Malang">Malang, Jawa Timur</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Email Pengiriman:
              </label>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-stone-100 border-2 border-black p-2.5 rounded-lg font-mono text-xs text-stone-600 shadow-[2px_2px_0px_0px_#000]"
              >
              </input>
            </div>
          </div>

          <div className="bg-[#FFE600]/20 border-2 border-black p-4 rounded-xl space-y-2">
            <span className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black" />
              Simulasi Pesan yang Akan Diterima Tiap Jumat Sore:
            </span>
            <div className="bg-white border border-black p-3 rounded font-mono text-xs text-stone-800 leading-relaxed">
              "Halo <b>{user.name}</b>! Prakiraan cuaca akhir pekan untuk <b>{alertCity}</b>: Hari Sabtu diprediksi berawan sejuk (28°C), cocok untuk aktivitas outdoor. Hari Minggu berpotensi hujan (65%), simpan agenda indoor di Museum atau Cafe cozy Anda!"
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={handleSaveAlert}
              className="px-6 py-2.5 bg-[#A3E635] hover:bg-lime-300 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1.5 text-black"
            >
              {alertSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Bell className="w-4 h-4" />}
              <span>{alertSaved ? 'PENGATURAN TERSIMPAN!' : 'SIMPAN PREFERENSI'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: My Reviews */}
      {activeTab === 'MY_REVIEWS' && (
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-black p-12 text-center rounded-2xl space-y-2">
              <Star className="w-10 h-10 mx-auto text-stone-400" />
              <h4 className="font-mono font-black text-lg uppercase text-black">
                Belum Ada Ulasan yang Ditulis
              </h4>
              <p className="font-mono text-xs text-stone-600 max-w-md mx-auto">
                Bantu sesama traveler dengan membagikan tips cuaca dan pengalaman Anda di tempat wisata yang pernah dikunjungi.
              </p>
            </div>
          ) : (
            myReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border-[3px] border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#f59e0b]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="font-mono font-black text-xs text-black ml-1.5">
                      {rev.rating}/5 Bintang
                    </span>
                  </div>
                  <span className="font-mono text-xs text-stone-500">{rev.createdAt}</span>
                </div>
                <p className="font-sans text-xs sm:text-sm text-stone-800 font-medium">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

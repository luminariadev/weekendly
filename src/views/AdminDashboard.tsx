import React, { useState, useEffect } from 'react';
import {
  Shield,
  Check,
  Trash2,
  Tag,
  MapPin,
  Clock,
  Eye,
  RefreshCw,
  Navigation,
  Database,
  Users,
  Search,
} from 'lucide-react';
import { useAuth, SYSTEM_ACCOUNTS } from '../context/AuthContext';
import {
  getStoredVenues,
  updateVenueStatus,
  getAllCuratedPlacesList,
} from '../services/api';
import type { PlacePOI } from '../types';

interface AdminDashboardProps {
  onSwitchToPublic: () => void;
  onPreviewPlace: (place: PlacePOI) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSwitchToPublic,
  onPreviewPlace,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MODERATION' | 'ALL_DATABASE' | 'USER_MANAGEMENT'>('MODERATION');

  const [venues, setVenues] = useState<PlacePOI[]>([]);
  const [allPlaces, setAllPlaces] = useState<PlacePOI[]>([]);
  const [dbSearch, setDbSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');

  const loadData = () => {
    setVenues(getStoredVenues());
    setAllPlaces(getAllCuratedPlacesList());
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const handleApprove = (id: string, name: string) => {
    updateVenueStatus(id, 'APPROVED');
    loadData();
    alert(`🎉 Tempat "${name}" telah DISETUJUI dan langsung live di peta serta katalog publik!`);
  };

  const handleReject = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menolak usulan tempat "${name}"?`)) {
      updateVenueStatus(id, 'REJECTED');
      loadData();
    }
  };

  const pendingList = venues.filter((v) => v.status === 'PENDING');
  const approvedCustomList = venues.filter((v) => v.status === 'APPROVED');

  const filteredDatabasePlaces = allPlaces.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(dbSearch.toLowerCase()) ||
      (p.address || '').toLowerCase().includes(dbSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(dbSearch.toLowerCase());

    if (cityFilter === 'ALL') return matchesSearch;
    return matchesSearch && (p.address || '').toLowerCase().includes(cityFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* 1. Admin Console Hero Banner */}
      <div className="bg-[#FF6B6B] border-[4px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="bg-black text-[#FF6B6B] font-mono text-xs font-black px-3 py-1 uppercase rounded border border-black shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              CURATOR CONTROL ROOM &bull; PLATFORM ADMINISTRATOR
            </span>
            <h1 className="font-mono font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              MEJA KURASI PUSAT: {user.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-stone-900 max-w-2xl font-sans">
              Verifikasi usulan tempat baru dari mitra bisnis, kelola basis data landmark Google Maps, dan pantau status sistem secara terpusat.
            </p>
          </div>

          <button
            onClick={onSwitchToPublic}
            className="px-5 py-2.5 bg-white hover:bg-stone-100 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 shrink-0"
          >
            <Navigation className="w-4 h-4" />
            Buka Halaman Publik & Peta
          </button>
        </div>

        {/* High-Level Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t-2 border-black">
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
              Antrean Verifikasi
            </span>
            <span className="font-mono font-black text-2xl text-[#FF6B6B]">
              {pendingList.length} Menunggu
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
              Spot Mitra Disetujui
            </span>
            <span className="font-mono font-black text-2xl text-[#10b981]">
              {approvedCustomList.length} Live
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
              Total Database POI
            </span>
            <span className="font-mono font-black text-2xl text-black">
              {allPlaces.length} Tempat
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-[11px] font-bold text-stone-500 uppercase block">
              API Status
            </span>
            <span className="font-mono font-black text-xs text-black flex items-center gap-1 mt-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full inline-block animate-pulse"></span>
              Open-Meteo: ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[3px] border-black pb-3">
        <button
          onClick={() => setActiveTab('MODERATION')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'MODERATION'
              ? 'bg-black text-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Shield className="w-4 h-4" />
          Antrean Moderasi ({pendingList.length})
        </button>

        <button
          onClick={() => setActiveTab('ALL_DATABASE')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'ALL_DATABASE'
              ? 'bg-[#38BDF8] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Tempat Terverifikasi ({allPlaces.length})
        </button>

        <button
          onClick={() => setActiveTab('USER_MANAGEMENT')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'USER_MANAGEMENT'
              ? 'bg-[#A3E635] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Users className="w-4 h-4" />
          Direktori Pengguna & Peran
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* Tab 1: Moderation Queue */}
      {activeTab === 'MODERATION' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-black text-base uppercase text-black">
              Usulan Tempat Baru dari Mitra Bisnis ({pendingList.length})
            </h3>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-white border-2 border-black rounded-lg font-mono font-bold text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Segarkan Antrean
            </button>
          </div>

          {pendingList.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-black p-12 text-center rounded-2xl space-y-2">
              <Check className="w-10 h-10 mx-auto text-emerald-500 stroke-[3]" />
              <h4 className="font-mono font-black text-lg uppercase text-black">
                Semua Tempat Telah Selesai Dikurasi!
              </h4>
              <p className="font-mono text-xs text-stone-600">
                Tidak ada usulan tempat baru yang menunggu persetujuan saat ini.
              </p>
            </div>
          ) : (
            pendingList.map((venue) => (
              <div
                key={venue.id}
                className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-black text-[#FFE600] font-mono text-[10px] font-black px-2 py-0.5 rounded uppercase">
                        {venue.type} SPOT
                      </span>
                      <h4 className="font-mono font-black text-xl text-black uppercase">
                        {venue.name}
                      </h4>
                    </div>
                    <span className="font-mono text-xs text-stone-600 block mt-0.5">
                      Kategori: <b>{venue.category}</b> &bull; Diajukan oleh Mitra:{' '}
                      <b className="text-black">{venue.submittedByName || 'Merchant'}</b>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreviewPlace(venue)}
                      className="px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 border-2 border-black rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview Peta
                    </button>
                    <button
                      onClick={() => handleReject(venue.id, venue.name)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded-lg font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(venue.id, venue.name)}
                      className="px-4 py-1.5 bg-[#A3E635] hover:bg-lime-300 border-[3px] border-black rounded-lg font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1 text-black"
                    >
                      <Check className="w-4 h-4 text-black stroke-[3]" /> Setujui & Publish
                    </button>
                  </div>
                </div>

                <p className="font-sans text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {venue.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-stone-50 border border-black p-2 rounded flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    <span className="truncate">{venue.address}</span>
                  </div>
                  <div className="bg-stone-50 border border-black p-2 rounded flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    <span>{venue.operationalHours}</span>
                  </div>
                  <div className="bg-stone-50 border border-black p-2 rounded flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-stone-700 shrink-0" />
                    <span>{venue.ticketPrice}</span>
                  </div>
                </div>

                {venue.promoText && (
                  <div className="bg-[#FFE600]/30 border-2 border-black p-2.5 rounded-lg font-mono text-xs font-black text-black flex items-center gap-2">
                    <Tag className="w-4 h-4 text-black" />
                    Promo Diajukan: {venue.promoText}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Full POI Database Explorer */}
      {activeTab === 'ALL_DATABASE' && (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b-2 border-black pb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="text"
                placeholder="Cari tempat atau alamat di database..."
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border-2 border-black rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase text-stone-600">Kota:</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-white border-2 border-black px-3 py-2 rounded-lg font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              >
                <option value="ALL">Semua Kota</option>
                <option value="Bandung">Bandung</option>
                <option value="Jakarta">Jakarta</option>
                <option value="Yogyakarta">Yogyakarta</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDatabasePlaces.map((place) => (
              <div
                key={place.id}
                className="border-2 border-black rounded-xl p-4 bg-stone-50 shadow-[3px_3px_0px_0px_#000] space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-mono font-black text-base text-black uppercase">
                      {place.name}
                    </h5>
                    <span
                      className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border border-black uppercase ${
                        place.type === 'INDOOR' ? 'bg-[#C084FC] text-black' : 'bg-[#A3E635] text-black'
                      }`}
                    >
                      {place.type}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-stone-600 block">{place.category}</span>
                  <p className="font-sans text-xs text-stone-700 line-clamp-2 mt-1">
                    {place.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-stone-800">
                    ★ {place.rating} ({place.gmapsTotalReviews || 2400} ulasan)
                  </span>
                  <button
                    onClick={() => onPreviewPlace(place)}
                    className="px-2.5 py-1 bg-[#FFE600] border border-black rounded font-mono font-black text-[11px] uppercase shadow-[1px_1px_0px_0px_#000] flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Peta
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: User Directory */}
      {activeTab === 'USER_MANAGEMENT' && (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-mono font-black text-lg uppercase text-black">
              DIREKTORI PENGGUNA TERDAFTAR
            </h3>
            <p className="font-mono text-xs text-stone-600">
              Daftar akun yang memiliki akses ke sistem Role-Based Access Control (RBAC).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SYSTEM_ACCOUNTS.map((acc) => (
              <div
                key={acc.id}
                className="border-2 border-black rounded-xl p-4 bg-stone-50 shadow-[3px_3px_0px_0px_#000] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-12 h-12 rounded-lg border-2 border-black object-cover"
                  />
                  <div>
                    <h5 className="font-mono font-black text-sm text-black uppercase">
                      {acc.name}
                    </h5>
                    <span
                      className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border border-black uppercase ${
                        acc.role === 'admin'
                          ? 'bg-[#FF6B6B] text-black'
                          : acc.role === 'merchant'
                          ? 'bg-[#FFDE59] text-black'
                          : 'bg-[#38BDF8] text-black'
                      }`}
                    >
                      ROLE: {acc.role.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono space-y-1 text-stone-700 pt-2 border-t border-stone-200">
                  <p>Email: <b>{acc.email}</b></p>
                  <p>Hak Akses: <b>{acc.badgeLabel}</b></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

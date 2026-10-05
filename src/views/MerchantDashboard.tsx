import React, { useState, useEffect } from 'react';
import {
  Store,
  PlusCircle,
  Tag,
  Navigation,
  Eye,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getVenuesByMerchant,
  submitNewVenue,
  updateVenuePromo,
  deleteVenue,
} from '../services/api';
import type { PlacePOI } from '../types';

interface MerchantDashboardProps {
  onSwitchToPublic: () => void;
  onPreviewPlace: (place: PlacePOI) => void;
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  onSwitchToPublic,
  onPreviewPlace,
}) => {
  const { user } = useAuth();
  const [venues, setVenues] = useState<PlacePOI[]>([]);
  const [activeTab, setActiveTab] = useState<'MY_VENUES' | 'ADD_NEW' | 'PROMO_GUIDE'>('MY_VENUES');

  // Form state for new venue
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cafe & Roastery');
  const [type, setType] = useState<'INDOOR' | 'OUTDOOR'>('INDOOR');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [operationalHours, setOperationalHours] = useState('Sabtu - Minggu: 09.00 - 22.00 WIB');
  const [ticketPrice, setTicketPrice] = useState('Mulai Rp 20.000 / menu');
  const [promoText, setPromoText] = useState('🎉 Diskon 20% Minuman Hangat Saat Hujan Turun!');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'
  );

  // Edit promo inline state
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [tempPromoText, setTempPromoText] = useState<string>('');

  const loadMyVenues = () => {
    if (!user) return;
    const myVenues = getVenuesByMerchant(user.id);
    setVenues(myVenues);
  };

  useEffect(() => {
    loadMyVenues();
  }, [user]);

  if (!user || user.role !== 'merchant') {
    return null;
  }

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Nama tempat dan deskripsi wajib diisi.');
      return;
    }

    const defaultLat = -6.9175 + (Math.random() - 0.5) * 0.05;
    const defaultLng = 107.6191 + (Math.random() - 0.5) * 0.05;

    const created = submitNewVenue(
      {
        name,
        category,
        type,
        description,
        address: address || 'Kota Bandung, Jawa Barat',
        operationalHours,
        ticketPrice,
        promoText,
        imageUrl,
        lat: defaultLat,
        lng: defaultLng,
        weatherFitBadge: type === 'INDOOR' ? 'Aman Hujan (Indoor)' : 'Cocok Cerah (Outdoor)',
      },
      user.id,
      user.name
    );

    alert(`🎉 Tempat "${created.name}" berhasil didaftarkan!\nStatus: PENDING (Menunggu kurasi Admin sebelum tampil di peta publik).`);
    setName('');
    setDescription('');
    setAddress('');
    loadMyVenues();
    setActiveTab('MY_VENUES');
  };

  const handleSavePromo = (venueId: string) => {
    updateVenuePromo(venueId, tempPromoText);
    setEditingPromoId(null);
    loadMyVenues();
  };

  const handleDelete = (venueId: string, venueName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus spot "${venueName}"?`)) {
      deleteVenue(venueId);
      loadMyVenues();
    }
  };

  const approvedCount = venues.filter((v) => v.status === 'APPROVED').length;
  const pendingCount = venues.filter((v) => v.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* 1. Merchant Portal Hero Banner */}
      <div className="bg-[#FFE600] border-[4px] border-black rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="bg-black text-[#FFE600] font-mono text-xs font-black px-3 py-1 uppercase rounded border border-black shadow-[2px_2px_0px_0px_#000] inline-flex items-center gap-1.5">
              <Store className="w-4 h-4" />
              PORTAL MITRA BISNIS & KAFE
            </span>
            <h1 className="font-mono font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
              HALAMAN PENGELOLA: {user.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-stone-900 max-w-2xl font-sans">
              Kelola profil tempat Anda, tawarkan promo cuaca akhir pekan otomatis, dan pantau status publikasi di katalog Weekendly.
            </p>
          </div>

          <button
            onClick={onSwitchToPublic}
            className="px-5 py-2.5 bg-white hover:bg-stone-100 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-2 shrink-0"
          >
            <Navigation className="w-4 h-4" />
            Lihat Halaman Publik & Peta
          </button>
        </div>

        {/* Quick Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-black">
          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Total Spot Didaftarkan
            </span>
            <span className="font-mono font-black text-2xl text-black">
              {venues.length} Tempat
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Telah Terverifikasi (Live)
            </span>
            <span className="font-mono font-black text-2xl text-[#10b981]">
              {approvedCount} Disetujui
            </span>
          </div>

          <div className="bg-white border-2 border-black p-3.5 rounded-xl shadow-[3px_3px_0px_0px_#000]">
            <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
              Menunggu Kurasi Admin
            </span>
            <span className="font-mono font-black text-2xl text-[#FF6B6B]">
              {pendingCount} Dalam Review
            </span>
          </div>
        </div>
      </div>

      {/* 2. Sub Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-[3px] border-black pb-3">
        <button
          onClick={() => setActiveTab('MY_VENUES')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'MY_VENUES'
              ? 'bg-black text-[#FFE600] shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Store className="w-4 h-4" />
          Tempat Usaha Saya ({venues.length})
        </button>

        <button
          onClick={() => setActiveTab('ADD_NEW')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'ADD_NEW'
              ? 'bg-[#A3E635] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          + Daftarkan Spot Baru
        </button>

        <button
          onClick={() => setActiveTab('PROMO_GUIDE')}
          className={`px-4 py-2 border-2 border-black rounded-lg font-mono font-black text-xs uppercase transition-all flex items-center gap-2 ${
            activeTab === 'PROMO_GUIDE'
              ? 'bg-[#38BDF8] text-black shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px]'
              : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Tag className="w-4 h-4" />
          Panduan Promo Cuaca Weekend
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* Tab 1: My Venues List */}
      {activeTab === 'MY_VENUES' && (
        <div className="space-y-4">
          {venues.length === 0 ? (
            <div className="bg-white border-[3px] border-dashed border-black p-12 text-center rounded-2xl space-y-3">
              <Store className="w-10 h-10 mx-auto text-stone-400" />
              <h3 className="font-mono font-black text-lg uppercase text-black">
                Belum ada tempat yang didaftarkan
              </h3>
              <p className="font-mono text-xs text-stone-600 max-w-md mx-auto">
                Daftarkan kafe, galeri, studio seni, atau arena rekreasi Anda agar otomatis direkomendasikan saat akhir pekan!
              </p>
              <button
                onClick={() => setActiveTab('ADD_NEW')}
                className="mt-2 px-5 py-2.5 bg-[#A3E635] hover:bg-lime-300 border-2 border-black rounded-xl font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000]"
              >
                + Daftarkan Tempat Pertama
              </button>
            </div>
          ) : (
            venues.map((venue) => (
              <div
                key={venue.id}
                className="bg-white border-[3px] border-black rounded-2xl p-5 shadow-[5px_5px_0px_0px_#000] space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 border-b-2 border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase ${
                          venue.status === 'APPROVED'
                            ? 'bg-[#A3E635] text-black'
                            : 'bg-[#FF6B6B] text-black'
                        }`}
                      >
                        STATUS: {venue.status === 'APPROVED' ? 'LIVE & TERVERIFIKASI' : 'MENUNGGU KURASI'}
                      </span>
                      <span className="bg-stone-100 border border-black text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                        {venue.type} SPOT
                      </span>
                    </div>
                    <h3 className="font-mono font-black text-xl text-black uppercase mt-1">
                      {venue.name}
                    </h3>
                    <span className="font-mono text-xs text-stone-600">
                      {venue.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onPreviewPlace(venue)}
                      className="px-3 py-1.5 bg-[#FFE600] hover:bg-yellow-300 border-2 border-black rounded-lg font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview Google Maps
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id, venue.name)}
                      className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded-lg font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000] text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-stone-50 border border-black p-2.5 rounded">
                    <span className="font-bold text-stone-500 block uppercase">Alamat:</span>
                    <span className="font-medium text-stone-800 font-sans">{venue.address}</span>
                  </div>
                  <div className="bg-stone-50 border border-black p-2.5 rounded">
                    <span className="font-bold text-stone-500 block uppercase">Jam Operasional:</span>
                    <span className="font-bold text-stone-800">{venue.operationalHours}</span>
                  </div>
                  <div className="bg-stone-50 border border-black p-2.5 rounded">
                    <span className="font-bold text-stone-500 block uppercase">Estimasi Tiket / Menu:</span>
                    <span className="font-bold text-stone-800">{venue.ticketPrice}</span>
                  </div>
                </div>

                {/* Promo Weekend Manager */}
                <div className="bg-[#FFE600]/20 border-2 border-black p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs uppercase text-black flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-black" />
                      Promo Weekend Aktif:
                    </span>
                    {editingPromoId !== venue.id && (
                      <button
                        onClick={() => {
                          setEditingPromoId(venue.id);
                          setTempPromoText(venue.promoText || '');
                        }}
                        className="text-[11px] font-mono font-bold underline hover:text-stone-700"
                      >
                        Ubah Promo
                      </button>
                    )}
                  </div>

                  {editingPromoId === venue.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempPromoText}
                        onChange={(e) => setTempPromoText(e.target.value)}
                        placeholder="Contoh: Diskon 25% Boardgame Pass saat Hujan!"
                        className="flex-1 bg-white border-2 border-black px-3 py-1.5 rounded font-mono text-xs"
                      />
                      <button
                        onClick={() => handleSavePromo(venue.id)}
                        className="px-3 py-1.5 bg-[#A3E635] border-2 border-black rounded font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Simpan
                      </button>
                      <button
                        onClick={() => setEditingPromoId(null)}
                        className="px-3 py-1.5 bg-white border-2 border-black rounded font-mono text-xs"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <p className="font-mono text-xs font-bold text-stone-900">
                      {venue.promoText || 'Belum ada promo akhir pekan yang dipasang.'}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Add New Venue Full Form */}
      {activeTab === 'ADD_NEW' && (
        <div className="bg-white border-[3px] border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-6">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-mono font-black text-xl uppercase text-black">
              FORMULIR PENDAFTARAN SPOT USAHA BARU
            </h3>
            <p className="font-mono text-xs text-stone-600">
              Isi data detail lokasi usaha Anda. Tempat akan diverifikasi oleh Admin Kurator sebelum terbit.
            </p>
          </div>

          <form onSubmit={handleCreateVenue} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                  Nama Tempat / Brand Usaha *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Titik Temu Boardgame Coffee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                  Kategori Usaha
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                >
                  <option value="Cafe & Roastery">Cafe & Roastery</option>
                  <option value="Cafe & Boardgames Ruang Indoor">Cafe & Boardgames Ruang Indoor</option>
                  <option value="Galeri Seni & Studio">Galeri Seni & Studio</option>
                  <option value="Taman & Rekreasi Alam">Taman & Rekreasi Alam</option>
                  <option value="Creative Hub & Co-working">Creative Hub & Co-working</option>
                  <option value="Kuliner Tradisional">Kuliner Tradisional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                  Karakter Cuaca
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('INDOOR')}
                    className={`py-2 px-3 border-2 border-black rounded-lg font-mono text-xs font-black uppercase transition-all ${
                      type === 'INDOOR'
                        ? 'bg-[#C084FC] shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white opacity-60'
                    }`}
                  >
                    🏛️ Indoor
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('OUTDOOR')}
                    className={`py-2 px-3 border-2 border-black rounded-lg font-mono text-xs font-black uppercase transition-all ${
                      type === 'OUTDOOR'
                        ? 'bg-[#A3E635] shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white opacity-60'
                    }`}
                  >
                    🌲 Outdoor
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                  Jam Buka Weekend
                </label>
                <input
                  type="text"
                  value={operationalHours}
                  onChange={(e) => setOperationalHours(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                  Estimasi Harga / Menu
                </label>
                <input
                  type="text"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Alamat Lengkap Terverifikasi
              </label>
              <input
                type="text"
                required
                placeholder="Jl. Riau No. 42, Citarum, Kec. Bandung Wetan, Kota Bandung"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Deskripsi Keunggulan Spot *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan fasilitas wifi, colokan, area merokok, suasana saat hujan/cerah..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Promo Weekend Spesial (Deal Cuaca)
              </label>
              <input
                type="text"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                className="w-full bg-[#FFE600]/20 border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                URL Foto Tempat
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded-lg font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('MY_VENUES')}
                className="px-4 py-2 border-2 border-black bg-white rounded-lg font-mono font-bold text-xs uppercase"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#A3E635] hover:bg-lime-300 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Daftarkan Tempat Sekarang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Promo Guide */}
      {activeTab === 'PROMO_GUIDE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[5px_5px_0px_0px_#000] space-y-3">
            <span className="bg-[#C084FC] text-black font-mono font-black text-xs px-2.5 py-1 rounded border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000]">
              🌧️ STRATEGI PROMO SAAT HUJAN (INDOOR)
            </span>
            <h4 className="font-mono font-black text-lg text-black uppercase">
              Tarik Pengunjung yang Menghindari Hujan
            </h4>
            <p className="font-sans text-xs text-stone-700 leading-relaxed font-medium">
              Saat Open-Meteo memprediksi curah hujan &gt; 45% di akhir pekan, tempat Anda akan otomatis direkomendasikan di radar <b>Indoor Safe</b>.
            </p>
            <ul className="font-mono text-xs space-y-1 text-stone-800 list-disc list-inside">
              <li>"Diskon 20% Coffee & Croissant saat Hujan Turun"</li>
              <li>"Beli 2 Jam Gratis 1 Jam Sewa Boardgame"</li>
              <li>"Free Wi-Fi Super Cepat + Colokan Setiap Meja"</li>
            </ul>
          </div>

          <div className="bg-white border-[3px] border-black p-6 rounded-2xl shadow-[5px_5px_0px_0px_#000] space-y-3">
            <span className="bg-[#A3E635] text-black font-mono font-black text-xs px-2.5 py-1 rounded border-2 border-black uppercase shadow-[2px_2px_0px_0px_#000]">
              ☀️ STRATEGI PROMO SAAT CERAH (OUTDOOR)
            </span>
            <h4 className="font-mono font-black text-lg text-black uppercase">
              Maksimalkan Trafik Pengunjung Pagi & Sore
            </h4>
            <p className="font-sans text-xs text-stone-700 leading-relaxed font-medium">
              Saat cuaca cerah, traveler gemar mencari spot rooftop, area terbuka hijau, dan nongkrong sore santai.
            </p>
            <ul className="font-mono text-xs space-y-1 text-stone-800 list-disc list-inside">
              <li>"Paket Sunset Mocktail Beli 1 Gratis 1"</li>
              <li>"Diskon 15% Untuk Pesepeda & Komunitas Jalan Pagi"</li>
              <li>"Free Tiket Masuk Taman Sebelum Jam 10.00 WIB"</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

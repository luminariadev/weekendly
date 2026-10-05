import React, { useState } from 'react';
import { X, Store, Sparkles, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { submitNewVenue } from '../services/api';
import type { CityLocation, PlacePOI } from '../types';

interface MerchantModalProps {
  city: CityLocation;
  isOpen: boolean;
  onClose: () => void;
  onVenueCreated: (newVenue: PlacePOI) => void;
}

export const MerchantModal: React.FC<MerchantModalProps> = ({
  city,
  isOpen,
  onClose,
  onVenueCreated,
}) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cafe & Roastery');
  const [type, setType] = useState<'INDOOR' | 'OUTDOOR'>('INDOOR');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [promoText, setPromoText] = useState('🎉 Diskon 20% Minuman Saat Hujan di Hari Sabtu/Minggu!');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Mohon isi nama tempat dan deskripsi.');
      return;
    }

    // Slightly randomize offset from current city coordinate
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.04;

    const newVenue = submitNewVenue(
      {
        name,
        category,
        type,
        description,
        address: address || `${city.name} Area`,
        promoText,
        imageUrl,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
        weatherFitBadge: type === 'INDOOR' ? 'Aman Hujan' : 'Cocok Cerah',
      },
      currentUser.id,
      currentUser.name
    );

    alert(
      `✅ Tempat "${name}" berhasil didaftarkan oleh ${currentUser.name}!\nStatus saat ini: PENDING (Menunggu kurasi dari Admin/Kurator).`
    );
    onVenueCreated(newVenue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl">
        {/* Modal Header */}
        <div className="bg-[#FFDE59] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-[#FFDE59] p-1.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-black text-lg text-black uppercase">
                PORTAL MITRA (MERCHANT)
              </h3>
              <p className="text-xs font-bold text-stone-800">
                Daftarkan Tempat & Promo Akhir Pekan di {city.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-stone-100 border-2 border-black p-1.5 rounded shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-[#A3E635]/30 border-2 border-black p-3 rounded font-mono text-xs text-black">
            💡 <b>Role: Merchant Partner</b> &mdash; Setiap tempat yang diajukan akan masuk ke meja kurasi Admin untuk verifikasi sebelum tampil di peta publik.
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Nama Tempat / Brand Usaha *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kopi Titik Temu & Rooftop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                Kategori Spot
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none"
              >
                <option value="Cafe & Roastery">Cafe & Roastery</option>
                <option value="Cafe & Boardgames">Cafe & Boardgames</option>
                <option value="Galeri Seni & Studio">Galeri Seni & Studio</option>
                <option value="Taman & Rekreasi Alam">Taman & Rekreasi Alam</option>
                <option value="Creative Hub & Co-working">Creative Hub & Co-working</option>
                <option value="Kuliner Tradisional">Kuliner Tradisional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                Karakter Cuaca
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('INDOOR')}
                  className={`py-2 px-3 border-2 border-black rounded font-mono text-xs font-black uppercase transition-all ${
                    type === 'INDOOR'
                      ? 'bg-[#C084FC] shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white opacity-70'
                  }`}
                >
                  🏛️ Indoor
                </button>
                <button
                  type="button"
                  onClick={() => setType('OUTDOOR')}
                  className={`py-2 px-3 border-2 border-black rounded font-mono text-xs font-black uppercase transition-all ${
                    type === 'OUTDOOR'
                      ? 'bg-[#A3E635] shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white opacity-70'
                  }`}
                >
                  🌲 Outdoor
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
              Deskripsi Menarik *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Ceritakan keunggulan tempat Anda, fasilitas wifi, stopkontak, parkir, dan suasana saat cuaca cerah/hujan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Promo Spesial Akhir Pekan (Weekend Deal)
            </label>
            <input
              type="text"
              placeholder="Contoh: Beli 1 Gratis 1 Latte saat Hujan Turun!"
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              className="w-full bg-[#FFE600]/20 border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Alamat Lengkap
              </label>
              <input
                type="text"
                placeholder="Jl. Sukajadi No. 12..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-black mb-1">
                URL Foto Tempat
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-sm shadow-[3px_3px_0px_0px_#000] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-black bg-white hover:bg-stone-100 rounded font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_#000]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 border-[3px] border-black bg-[#A3E635] hover:bg-[#86efac] rounded font-mono font-black text-sm uppercase shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Daftarkan Spot Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

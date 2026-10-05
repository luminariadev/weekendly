import React, { useState, useEffect } from 'react';
import { Shield, X, Check, Trash2, Tag, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { getStoredVenues, updateVenueStatus } from '../services/api';
import type { PlacePOI } from '../types';

interface AdminDeskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModerationChanged: () => void;
}

export const AdminDeskModal: React.FC<AdminDeskModalProps> = ({
  isOpen,
  onClose,
  onModerationChanged,
}) => {
  const [venues, setVenues] = useState<PlacePOI[]>([]);

  const loadVenues = () => {
    setVenues(getStoredVenues());
  };

  useEffect(() => {
    if (isOpen) {
      loadVenues();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = (id: string, name: string) => {
    updateVenueStatus(id, 'APPROVED');
    loadVenues();
    onModerationChanged();
    alert(`🎉 Tempat "${name}" telah DISETUJUI dan sekarang live di peta rekomendasi publik!`);
  };

  const handleReject = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menolak tempat "${name}"?`)) {
      updateVenueStatus(id, 'REJECTED');
      loadVenues();
      onModerationChanged();
    }
  };

  const pendingList = venues.filter((v) => v.status === 'PENDING');
  const approvedList = venues.filter((v) => v.status === 'APPROVED');

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl">
        {/* Header */}
        <div className="bg-[#FF6B6B] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-[#FF6B6B] p-1.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-black text-lg text-black uppercase">
                CURATOR MODERATION DESK
              </h3>
              <p className="text-xs font-bold text-stone-900">
                Pusat Kurasi & Verifikasi Rekomendasi (Role: Admin)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-stone-100 border-2 border-black p-1.5 rounded shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-5 h-5 text-black" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border-2 border-black p-3 rounded shadow-[3px_3px_0px_0px_#000]">
              <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
                Menunggu Review
              </span>
              <span className="font-mono font-black text-2xl text-[#FF6B6B]">
                {pendingList.length} Spot
              </span>
            </div>
            <div className="bg-white border-2 border-black p-3 rounded shadow-[3px_3px_0px_0px_#000]">
              <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
                Telah Terverifikasi
              </span>
              <span className="font-mono font-black text-2xl text-[#10b981]">
                {approvedList.length} Spot
              </span>
            </div>
            <div className="bg-white border-2 border-black p-3 rounded shadow-[3px_3px_0px_0px_#000]">
              <span className="font-mono text-xs font-bold text-stone-500 uppercase block">
                Status Integrasi API
              </span>
              <span className="font-mono font-black text-xs text-black flex items-center gap-1 mt-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 border border-black rounded-full inline-block animate-pulse"></span>
                Open-Meteo & OSM: ONLINE
              </span>
            </div>
          </div>

          {/* Pending Submissions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-mono font-black text-sm uppercase text-black flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-[#FF6B6B]" />
                Antrean Usulan Tempat Baru ({pendingList.length})
              </h4>
              <button
                onClick={loadVenues}
                className="text-xs font-mono font-bold flex items-center gap-1 text-stone-600 hover:text-black"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Segarkan
              </button>
            </div>

            {pendingList.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-black p-8 text-center rounded">
                <p className="font-mono font-bold text-xs text-stone-500 uppercase">
                  Semua tempat usulan mitra telah selesai dikurasi!
                </p>
              </div>
            ) : (
              pendingList.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-white border-[3px] border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_#000] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b-2 border-stone-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-black text-[#FFE600] font-mono text-[10px] font-black px-2 py-0.5 uppercase rounded">
                          {venue.type}
                        </span>
                        <h5 className="font-mono font-black text-base text-black">
                          {venue.name}
                        </h5>
                      </div>
                      <span className="text-xs text-stone-600 font-mono">
                        {venue.category} &bull; Mitra: <b>{venue.submittedByName || 'Merchant'}</b>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(venue.id, venue.name)}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 border-2 border-black rounded font-mono font-bold text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(venue.id, venue.name)}
                        className="px-4 py-1.5 bg-[#A3E635] hover:bg-[#86efac] border-2 border-black rounded font-mono font-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                      >
                        <Check className="w-4 h-4 text-black" />
                        Setujui (Publish)
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed font-sans">
                    {venue.description}
                  </p>

                  {venue.promoText && (
                    <div className="bg-[#FFE600]/30 border-2 border-black p-2 rounded text-xs font-mono font-bold text-stone-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-black" />
                      Promo: {venue.promoText}
                    </div>
                  )}

                  <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-700" />
                    {venue.address}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

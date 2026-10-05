import React, { useState } from 'react';
import { X, Star, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addReviewToPlace } from '../services/api';
import type { PlacePOI, PlaceReview } from '../types';

interface ReviewModalProps {
  place: PlacePOI | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: (placeId: string, review: PlaceReview) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  place,
  isOpen,
  onClose,
  onReviewAdded,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  if (!isOpen || !place || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('Mohon tuliskan ulasan pengalaman Anda.');
      return;
    }

    const newRev = addReviewToPlace(place.id, {
      placeId: place.id,
      authorName: user.name,
      authorRole: user.role,
      rating,
      comment,
    });

    onReviewAdded(place.id, newRev);
    setComment('');
    alert('⭐ Terima kasih! Ulasan Anda telah berhasil disimpan.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-md rounded-xl">
        <div className="bg-[#38BDF8] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-[#38BDF8] p-1.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-black text-base text-black uppercase">
                BERI ULASAN TEMPAT
              </h3>
              <p className="text-xs font-bold text-stone-900 truncate max-w-[220px]">
                {place.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white hover:bg-stone-100 border-2 border-black p-1.5 rounded shadow-[2px_2px_0px_0px_#000]"
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-mono font-black uppercase text-black mb-1.5">
              Rating Kepuasan
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-2 border-2 border-black rounded transition-all ${
                    star <= rating
                      ? 'bg-[#FFE600] shadow-[2px_2px_0px_0px_#000]'
                      : 'bg-white opacity-40'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current text-black" />
                </button>
              ))}
              <span className="font-mono font-black text-sm ml-2">{rating}/5 Bintang</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase text-black mb-1.5">
              Ulasan & Tips Cuaca
            </label>
            <textarea
              required
              rows={4}
              placeholder="Ceritakan pengalaman Anda: apakah tempat ini asyik dinikmati saat hujan atau cerah? Rekomendasi makanan atau spot foto terbaik..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border-2 border-black p-2.5 rounded font-mono text-xs shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/10"
            />
          </div>

          <div className="bg-stone-100 border-2 border-black p-2 rounded text-[11px] font-mono text-stone-600">
            Mengulas sebagai: <b>{user.name}</b> ({user.role.toUpperCase()})
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border-2 border-black bg-white rounded font-mono font-bold text-xs uppercase"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 border-[3px] border-black bg-[#FFE600] hover:bg-yellow-300 rounded font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              Kirim Ulasan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

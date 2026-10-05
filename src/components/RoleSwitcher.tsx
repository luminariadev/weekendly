import React from 'react';
import { useAuth, MOCK_ACCOUNTS } from '../context/AuthContext';
import { User, Shield, Store, Users, KeyRound } from 'lucide-react';
import type { UserRole } from '../types';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole } = useAuth();

  const roleMeta: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; desc: string }
  > = {
    guest: {
      label: 'GUEST',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-stone-200',
      desc: 'Hanya baca & cari spot umum',
    },
    user: {
      label: 'USER',
      icon: <User className="w-4 h-4" />,
      color: 'bg-[#38BDF8]',
      desc: 'Bisa simpan wishlist & review',
    },
    merchant: {
      label: 'MERCHANT',
      icon: <Store className="w-4 h-4" />,
      color: 'bg-[#FFDE59]',
      desc: 'Daftarkan tempat & promo weekend',
    },
    admin: {
      label: 'ADMIN',
      icon: <Shield className="w-4 h-4" />,
      color: 'bg-[#FF6B6B]',
      desc: 'Kurasi, verifikasi & dashboard',
    },
  };

  return (
    <div className="bg-[#FFE600] border-b-[3px] border-black px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Role Switcher Label */}
        <div className="flex items-center gap-2">
          <span className="bg-black text-white px-2.5 py-1 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
            <KeyRound className="w-3.5 h-3.5 text-[#FFE600]" />
            RBAC CONTROLLER:
          </span>
          <span className="text-xs font-bold text-black hidden sm:inline">
            Ganti peran untuk menguji hak akses:
          </span>
        </div>

        {/* Center: The 4 Role Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(roleMeta) as UserRole[]).map((role) => {
            const meta = roleMeta[role];
            const isActive = currentUser.role === role;

            return (
              <button
                key={role}
                onClick={() => switchRole(role)}
                title={meta.desc}
                className={`px-3 py-1.5 rounded-lg border-2 border-black font-mono font-black text-xs uppercase flex items-center gap-1.5 transition-all ${
                  isActive
                    ? `${meta.color} shadow-[3px_3px_0px_0px_#000] translate-x-[-1px] translate-y-[-1px] ring-2 ring-black`
                    : 'bg-white hover:bg-stone-100 shadow-[2px_2px_0px_0px_#000] text-stone-800'
                }`}
              >
                {meta.icon}
                <span>{meta.label}</span>
                {isActive && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-black inline-block animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Active Profile Tag */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-stone-800 font-bold hidden lg:inline">Akun Aktif:</span>
          <span className="bg-white border-2 border-black px-2.5 py-1 rounded font-bold shadow-[2px_2px_0px_0px_#000] text-black">
            {currentUser.name} ({MOCK_ACCOUNTS[currentUser.role].badgeLabel})
          </span>
        </div>
      </div>
    </div>
  );
};

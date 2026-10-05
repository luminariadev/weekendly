import React, { useState } from 'react';
import { X, Lock, Mail, User, Store, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth, SYSTEM_ACCOUNTS } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRoleHint?: 'user' | 'merchant';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRoleHint = 'user',
}) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [registerRole, setRegisterRole] = useState<'user' | 'merchant'>(initialRoleHint);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      const res = login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Login gagal.');
        return;
      }
      onClose();
    } else {
      if (!name.trim()) {
        setErrorMessage('Nama lengkap wajib diisi.');
        return;
      }
      const res = register(name, email, password, registerRole);
      if (!res.success) {
        setErrorMessage(res.message || 'Registrasi gagal.');
        return;
      }
      onClose();
    }
  };

  const handleFillDemo = (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setMode('login');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF5] border-[4px] border-black shadow-[8px_8px_0px_0px_#000] w-full max-w-md rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#FFE600] border-b-[3px] border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-black text-[#FFE600] p-1.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-black text-lg text-black uppercase">
                {mode === 'login' ? 'MASUK KE WEEKENDLY' : 'DAFTAR AKUN BARU'}
              </h3>
              <p className="text-xs font-bold text-stone-800">
                {mode === 'login'
                  ? 'Akses fitur personalisasi & peran khusus'
                  : 'Bergabung sebagai Pengguna atau Mitra Tempat'}
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

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b-2 border-black bg-stone-100 font-mono text-xs font-black uppercase">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2.5 transition-all ${
              mode === 'login'
                ? 'bg-white border-b-2 border-transparent text-black'
                : 'text-stone-500 hover:text-black hover:bg-stone-200'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2.5 transition-all ${
              mode === 'register'
                ? 'bg-white border-b-2 border-transparent text-black'
                : 'text-stone-500 hover:text-black hover:bg-stone-200'
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="bg-rose-100 border-2 border-black p-3 rounded font-mono text-xs font-bold text-rose-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1">
                Nama Lengkap / Nama Bisnis *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Pratama atau Kafe Senja"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/10"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-black uppercase text-black mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                required
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-black uppercase text-black mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-black rounded font-mono text-xs shadow-[2px_2px_0px_0px_#000] focus:outline-none focus:bg-[#FFE600]/10"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-black uppercase text-black mb-1.5">
                Pilih Tipe Akun (Peran)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterRole('user')}
                  className={`p-2.5 rounded border-2 border-black text-left transition-all ${
                    registerRole === 'user'
                      ? 'bg-[#38BDF8] shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white hover:bg-stone-50 opacity-60'
                  }`}
                >
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1 text-black">
                    <User className="w-3.5 h-3.5" /> Pengguna
                  </span>
                  <span className="text-[10px] text-stone-800 block mt-0.5">
                    Simpan wishlist & ulasan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRole('merchant')}
                  className={`p-2.5 rounded border-2 border-black text-left transition-all ${
                    registerRole === 'merchant'
                      ? 'bg-[#FFDE59] shadow-[3px_3px_0px_0px_#000]'
                      : 'bg-white hover:bg-stone-50 opacity-60'
                  }`}
                >
                  <span className="font-mono font-black text-xs uppercase flex items-center gap-1 text-black">
                    <Store className="w-3.5 h-3.5" /> Mitra Bisnis
                  </span>
                  <span className="text-[10px] text-stone-800 block mt-0.5">
                    Daftarkan spot & promo
                  </span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#A3E635] hover:bg-lime-300 border-[3px] border-black rounded-xl font-mono font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] flex items-center justify-center gap-2"
          >
            <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-3 border-t-2 border-black space-y-2">
            <span className="block font-mono text-[10px] font-black uppercase text-stone-600">
              💡 AKUN DEMO PENGUJIAN (KLIK UNTUK ISI KREDENSIAL):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SYSTEM_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleFillDemo(acc.email, acc.password)}
                  className="px-2 py-1 bg-white hover:bg-stone-100 border border-black rounded font-mono text-[10px] font-bold text-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1"
                >
                  <span>{acc.role === 'admin' ? '🛡️' : acc.role === 'merchant' ? '🏪' : '👤'}</span>
                  <span>{acc.role.toUpperCase()}: {acc.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

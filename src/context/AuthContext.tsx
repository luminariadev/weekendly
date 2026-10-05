import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, UserRole } from '../types';

interface StoredAccount extends AuthUser {
  password: string;
}

// Predefined registered accounts in system
export const SYSTEM_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-01',
    name: 'Rian Pratama',
    email: 'rian@weekendly.id',
    password: 'user123',
    role: 'user',
    badgeLabel: 'TRAVELER USER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'mch-01',
    name: 'Kopi Senja & Creative Space',
    email: 'partner@kopisenja.com',
    password: 'merchant123',
    role: 'merchant',
    badgeLabel: 'MERCHANT PARTNER',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'adm-01',
    name: 'Edo Kurator Utama',
    email: 'admin@weekendly.id',
    password: 'admin123',
    role: 'admin',
    badgeLabel: 'PLATFORM ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
];

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; message?: string };
  register: (
    name: string,
    email: string,
    password: string,
    role: 'user' | 'merchant'
  ) => { success: boolean; message?: string };
  logout: () => void;
  wishlist: string[];
  toggleWishlist: (placeId: string) => boolean;
  isWishlisted: (placeId: string) => boolean;
  canSaveWishlist: boolean;
  canAddReview: boolean;
  canSubmitVenue: boolean;
  canModerate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_SESSION_KEY = 'weekendly_logged_user_v2';
const STORAGE_REGISTERED_USERS = 'weekendly_registered_users_v2';
const STORAGE_KEY_WISHLIST = 'weekendly_wishlist_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Registered accounts stored in browser
  const [registeredAccounts, setRegisteredAccounts] = useState<StoredAccount[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_REGISTERED_USERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return SYSTEM_ACCOUNTS;
  });

  // Current session (defaults to NULL / Guest!)
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return null; // By default: GUEST!
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WISHLIST);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REGISTERED_USERS, JSON.stringify(registeredAccounts));
    } catch (e) {
      console.error(e);
    }
  }, [registeredAccounts]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const login = (email: string, password: string): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const found = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === password
    );

    if (!found) {
      return {
        success: false,
        message: 'Email atau password salah. Silakan periksa kembali kredensial Anda.',
      };
    }

    const authUser: AuthUser = {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      badgeLabel: found.badgeLabel,
      avatar: found.avatar,
    };

    setUser(authUser);
    return { success: true };
  };

  const register = (
    name: string,
    email: string,
    password: string,
    role: 'user' | 'merchant'
  ): { success: boolean; message?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const exists = registeredAccounts.some((acc) => acc.email.toLowerCase() === cleanEmail);

    if (exists) {
      return { success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' };
    }

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      badgeLabel: role === 'merchant' ? 'MERCHANT PARTNER' : 'TRAVELER USER',
    };

    setRegisteredAccounts((prev) => [...prev, newAccount]);

    const authUser: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      badgeLabel: newAccount.badgeLabel,
    };

    setUser(authUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const toggleWishlist = (placeId: string): boolean => {
    if (!user) return false;
    const exists = wishlist.includes(placeId);
    if (exists) {
      setWishlist((prev) => prev.filter((id) => id !== placeId));
      return false;
    } else {
      setWishlist((prev) => [...prev, placeId]);
      return true;
    }
  };

  const isWishlisted = (placeId: string) => wishlist.includes(placeId);

  const role: UserRole = user ? user.role : 'guest';
  const isAuthenticated = user !== null;

  const canSaveWishlist = isAuthenticated;
  const canAddReview = isAuthenticated;
  const canSubmitVenue = isAuthenticated && (role === 'merchant' || role === 'admin');
  const canModerate = isAuthenticated && role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        register,
        logout,
        wishlist,
        toggleWishlist,
        isWishlisted,
        canSaveWishlist,
        canAddReview,
        canSubmitVenue,
        canModerate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

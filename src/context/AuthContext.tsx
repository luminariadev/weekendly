import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, UserRole } from '../types';

export const MOCK_ACCOUNTS: Record<UserRole, AuthUser> = {
  guest: {
    id: 'guest',
    name: 'Tamu Publik',
    email: 'guest@weekendly.local',
    role: 'guest',
    badgeLabel: 'GUEST',
  },
  user: {
    id: 'usr-01',
    name: 'Rian Pratama',
    email: 'rian@weekendly.id',
    role: 'user',
    badgeLabel: 'VERIFIED USER',
  },
  merchant: {
    id: 'mch-01',
    name: 'Kopi Senja & Space Owner',
    email: 'partner@kopisenja.com',
    role: 'merchant',
    badgeLabel: 'MERCHANT PARTNER',
  },
  admin: {
    id: 'adm-01',
    name: 'Edo (Lead Curator)',
    email: 'admin@weekendly.id',
    role: 'admin',
    badgeLabel: 'PLATFORM ADMIN',
  },
};

interface AuthContextType {
  currentUser: AuthUser;
  switchRole: (role: UserRole) => void;
  loginCustom: (name: string, role: UserRole) => void;
  logout: () => void;
  wishlist: string[];
  toggleWishlist: (placeId: string) => boolean; // returns true if added, false if removed
  isWishlisted: (placeId: string) => boolean;
  canSaveWishlist: boolean;
  canAddReview: boolean;
  canSubmitVenue: boolean;
  canModerate: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'weekendly_auth_user_v1';
const STORAGE_KEY_WISHLIST = 'weekendly_wishlist_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return MOCK_ACCOUNTS.guest;
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WISHLIST);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['bdg-1', 'bdg-2']; // default initial bookmarks
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WISHLIST, JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const switchRole = (role: UserRole) => {
    setCurrentUser(MOCK_ACCOUNTS[role]);
  };

  const loginCustom = (name: string, role: UserRole) => {
    setCurrentUser({
      id: `usr-${Date.now()}`,
      name: name || 'Pengguna Baru',
      email: `${(name || 'user').toLowerCase().replace(/\s+/g, '')}@weekendly.id`,
      role,
      badgeLabel: role.toUpperCase(),
    });
  };

  const logout = () => {
    setCurrentUser(MOCK_ACCOUNTS.guest);
  };

  const toggleWishlist = (placeId: string): boolean => {
    if (currentUser.role === 'guest') {
      return false;
    }
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

  const canSaveWishlist = currentUser.role !== 'guest';
  const canAddReview = currentUser.role !== 'guest';
  const canSubmitVenue = currentUser.role === 'merchant' || currentUser.role === 'admin';
  const canModerate = currentUser.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        loginCustom,
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

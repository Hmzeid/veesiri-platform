import { create } from 'zustand';
import { api } from '../api/client';

type User = {
  id: string;
  email: string;
  nameEn?: string | null;
  nameAr?: string | null;
  factories?: { factory: { id: string; nameAr: string; nameEn: string; onboardingCompleted: boolean } }[];
};

type AuthState = {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null,
  user: null,
  hydrated: false,
  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    set({ token, user, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ token: null, user: null, hydrated: true });
  },
  refreshUser: async () => {
    const { data } = await api.get<User>('/auth/me');
    set({ user: data });
  },
  hydrate: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ hydrated: true });
      return;
    }
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ token, user: data, hydrated: true });
    } catch {
      localStorage.removeItem('accessToken');
      set({ token: null, user: null, hydrated: true });
    }
  },
}));

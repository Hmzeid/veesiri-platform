import { create } from 'zustand';
import { api } from '../api/client';

type GovUser = {
  id: string;
  email: string;
  nameEn: string;
  nameAr: string;
  organization: string;
  role: string;
  regionScope: string | null;
};

type GovState = {
  token: string | null;
  user: GovUser | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useGovAuth = create<GovState>((set) => ({
  token: typeof localStorage !== 'undefined' ? localStorage.getItem('govToken') : null,
  user: null,
  hydrated: false,
  login: async (email, password) => {
    const { data } = await api.post('/gov/auth/login', { email, password });
    localStorage.setItem('govToken', data.accessToken);
    set({ token: data.accessToken, user: data.user, hydrated: true });
  },
  logout: () => {
    localStorage.removeItem('govToken');
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: async () => {
    const token = localStorage.getItem('govToken');
    if (!token) return set({ hydrated: true });
    try {
      const { data } = await api.get<GovUser>('/gov/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ token, user: data, hydrated: true });
    } catch {
      localStorage.removeItem('govToken');
      set({ token: null, user: null, hydrated: true });
    }
  },
}));

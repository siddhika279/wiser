import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // <-- Import persist

interface User {
  name: string;
  email: string;
  aadharCardNumber?: string;
  ecoScore?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'wiser-auth-storage', // The name of the item in local storage
    }
  )
);
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  username: string;
  deptId?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  setAuth: (user: AuthUser, token: string, roles: string[], permissions: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      roles: [],
      permissions: [],
      setAuth: (user, token, roles, permissions) => set({ user, token, roles, permissions }),
      logout: () => set({ user: null, token: null, roles: [], permissions: [] }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

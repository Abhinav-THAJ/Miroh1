import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();

          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, message: data.message };
          } else {
            set({ isLoading: false });
            return { success: false, message: data.message || "Login failed." };
          }
        } catch {
          set({ isLoading: false });
          return { success: false, message: "Network error. Please try again." };
        }
      },

      register: async (email, password, name, phone) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name, phone }),
          });

          const data = await res.json();

          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, message: data.message };
          } else {
            set({ isLoading: false });
            return { success: false, message: data.message || "Registration failed." };
          }
        } catch {
          set({ isLoading: false });
          return { success: false, message: "Network error. Please try again." };
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      forgotPassword: async (email) => {
        try {
          const res = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          return { success: data.success, message: data.message };
        } catch {
          return { success: false, message: "Network error. Please try again." };
        }
      },

      checkSession: async () => {
        // Skip if we already have a user
        if (get().isAuthenticated) return;
        try {
          const res = await fetch("/api/auth/session");
          const data = await res.json();
          if (data.authenticated && data.user) {
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Session check failed — keep current state
        }
      },
    }),
    {
      name: "auth-store",
      // Only persist non-sensitive data; actual authentication is server-side (HttpOnly cookie)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

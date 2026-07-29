import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  phone?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (
    emailOrUsername: string,
    password: string,
    isEmail?: boolean
  ) => Promise<{ success: boolean; message: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  checkSession: () => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameExists: (username: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),

      login: async (emailOrUsername, password, isEmail = true) => {
        set({ isLoading: true });
        try {
          const body = isEmail
            ? { email: emailOrUsername, password }
            : { username: emailOrUsername, password };

          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          const data = await res.json();

          if (data.success && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false });
            return { success: true, message: data.message };
          }
          set({ isLoading: false });
          return { success: false, message: data.message || "Login failed." };
        } catch {
          set({ isLoading: false });
          return { success: false, message: "Network error. Please try again." };
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          const json = await res.json();

          if (json.success && json.user) {
            set({ user: json.user, isAuthenticated: true, isLoading: false });
            return { success: true, message: json.message };
          }
          set({ isLoading: false });
          return { success: false, message: json.message || "Registration failed." };
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
        try {
          const res = await fetch("/api/auth/session");
          const data = await res.json();
          if (data.authenticated && data.user) {
            set({ user: data.user, isAuthenticated: true });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          // Keep persisted state on network error
        }
      },

      checkEmailExists: async (email) => {
        try {
          const res = await fetch(
            `/api/auth/register?email=${encodeURIComponent(email)}`
          );
          const data = await res.json();
          return !!data.exists;
        } catch {
          return false;
        }
      },

      checkUsernameExists: async (username) => {
        try {
          const res = await fetch(
            `/api/auth/register?username=${encodeURIComponent(username)}`
          );
          const data = await res.json();
          return !!data.exists;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "miorah-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

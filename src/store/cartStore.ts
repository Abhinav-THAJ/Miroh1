import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string | number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  quantity: number;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isSyncing: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number, color?: string) => void;
  updateQuantity: (id: string | number, quantity: number, color?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  /** Load saved cart from WooCommerce and merge with local cart */
  loadServerCart: () => Promise<void>;
  /** Persist current cart to WooCommerce (debounced externally) */
  syncToServer: () => Promise<void>;
  /** Clear server-side cart (called on logout or after order placed) */
  clearServerCart: () => Promise<void>;
}

/** Fire-and-forget cart sync to server */
async function saveCartToServer(items: CartItem[]) {
  try {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch {
    // Fail silently — local cart still works
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isSyncing: false,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.color === item.color
          );
          const newItems = existingItem
            ? state.items.map((i) =>
                i.id === item.id && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              )
            : [...state.items, item];

          // Sync to server (fire-and-forget)
          saveCartToServer(newItems);
          return { items: newItems, isOpen: true };
        });
      },

      removeItem: (id, color) => {
        set((state) => {
          const newItems = state.items.filter(
            (i) => !(i.id === id && i.color === color)
          );
          saveCartToServer(newItems);
          return { items: newItems };
        });
      },

      updateQuantity: (id, quantity, color) => {
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id && i.color === color ? { ...i, quantity } : i
          );
          saveCartToServer(newItems);
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        // Don't clear server cart on clearCart — that's done explicitly via clearServerCart
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),

      loadServerCart: async () => {
        set({ isSyncing: true });
        try {
          const res = await fetch("/api/cart", { cache: "no-store" });
          if (!res.ok) {
            set({ isSyncing: false });
            return;
          }
          const data = await res.json();
          if (!data.success || !Array.isArray(data.items)) {
            set({ isSyncing: false });
            return;
          }

          const serverItems: CartItem[] = data.items;

          // Merge: server cart wins for items, but preserve any local-only items
          set((state) => {
            const merged = [...serverItems];

            // Add local items that aren't in the server cart
            state.items.forEach((localItem) => {
              const inServer = merged.find(
                (s) => s.id === localItem.id && s.color === localItem.color
              );
              if (!inServer) {
                merged.push(localItem);
              }
            });

            // If there were local-only items, push the merged cart back to server
            if (merged.length > serverItems.length) {
              saveCartToServer(merged);
            }

            return { items: merged, isSyncing: false };
          });
        } catch {
          set({ isSyncing: false });
        }
      },

      syncToServer: async () => {
        await saveCartToServer(get().items);
      },

      clearServerCart: async () => {
        try {
          await fetch("/api/cart", { method: "DELETE" });
        } catch {
          // Fail silently
        }
      },
    }),
    {
      name: 'miorah-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

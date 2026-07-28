import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string | number;
  slug?: string;
  name: string;
  price: string;
  category: string;
  images: string[];
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string | number) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'miorah-wishlist',
    }
  )
);

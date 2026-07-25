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
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number, color?: string) => void;
  updateQuantity: (id: string | number, quantity: number, color?: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.id === item.id && i.color === item.color
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.color === item.color
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, item], isOpen: true };
        }),
      removeItem: (id, color) =>
        set((state) => ({
          items: state.items.filter((i) => !(i.id === id && i.color === color)),
        })),
      updateQuantity: (id, quantity, color) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.color === color ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'miorah-cart',
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
);

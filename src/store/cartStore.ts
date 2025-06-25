// src/store/cartStore.ts
import { create } from 'zustand';
// XÓA DÒNG IMPORT CŨ
// import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
// XÓA DÒNG IMPORT CŨ
// import { Platform } from 'react-native';
import type { MenuItem } from '@/types';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  setRestaurantId: (id: string) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  hydrate: () => Promise<void>;
}

const CART_STORAGE_KEY = 'orderflow-cart-storage';

export const useCartStore = create<CartState>((set, get) => ({
      items: [],
      restaurantId: null,
      setRestaurantId: (id) => set({ restaurantId: id }),
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),
      increaseQuantity: (itemId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        })),
      decreaseQuantity: (itemId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      hydrate: async () => {
        try {
            const storedState = await AsyncStorage.getItem(CART_STORAGE_KEY);
            if (storedState) {
                set(JSON.parse(storedState));
            }
        } catch (e) {
            console.error("Lỗi khi tải giỏ hàng từ storage:", e);
        }
    },
}));

// Logic lưu trữ thủ công
useCartStore.subscribe(async (state) => {
    try {
        const stateToPersist = JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
        });
        await AsyncStorage.setItem(CART_STORAGE_KEY, stateToPersist);
    } catch (e) {
        console.error("Lỗi khi lưu giỏ hàng vào storage:", e);
    }
});

useCartStore.getState().hydrate();
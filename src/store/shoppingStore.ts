import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShoppingItem, Ingredient } from '../types';

const STORAGE_KEY = '@kitchen_note_shopping';

interface ShoppingState {
  items: ShoppingItem[];
  isLoaded: boolean;
  loadItems: () => Promise<void>;
  addFromIngredient: (ingredient: Ingredient) => Promise<void>;
  addManual: (name: string) => Promise<void>;
  toggleCheck: (id: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  getCheckedItems: () => ShoppingItem[];
  getUncheckedItems: () => ShoppingItem[];
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useShoppingStore = create<ShoppingState>((set, get) => ({
  items: [],
  isLoaded: false,

  loadItems: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ items: JSON.parse(stored), isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load shopping items', e);
      set({ isLoaded: true });
    }
  },

  addFromIngredient: async (ingredient) => {
    const { items } = get();
    // 既に追加済みの場合はスキップ
    if (items.some(i => i.name === ingredient.name && !i.checked)) return;

    const newItem: ShoppingItem = {
      id: generateId(),
      name: ingredient.name,
      category: ingredient.category,
      checked: false,
      addedAt: Date.now(),
      fromIngredientId: ingredient.id,
    };
    const updated = [newItem, ...items];
    set({ items: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  addManual: async (name) => {
    const { items } = get();
    if (items.some(i => i.name === name && !i.checked)) return;

    const newItem: ShoppingItem = {
      id: generateId(),
      name,
      category: 'その他',
      checked: false,
      addedAt: Date.now(),
    };
    const updated = [newItem, ...items];
    set({ items: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleCheck: async (id) => {
    const updated = get().items.map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    set({ items: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeItem: async (id) => {
    const updated = get().items.filter(i => i.id !== id);
    set({ items: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clearChecked: async () => {
    const updated = get().items.filter(i => !i.checked);
    set({ items: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getCheckedItems: () => get().items.filter(i => i.checked),
  getUncheckedItems: () => get().items.filter(i => !i.checked),
}));

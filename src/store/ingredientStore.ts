import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ingredient, IngredientCategory, SeasoningCategory, ItemType } from '../types';

const STORAGE_KEY = '@kitchen_note_ingredients';

interface IngredientState {
  ingredients: Ingredient[];
  isLoaded: boolean;
  loadIngredients: () => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => Promise<void>;
  removeIngredient: (id: string) => Promise<Ingredient | undefined>;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>;
  getByItemType: (itemType: ItemType) => Ingredient[];
  getByCategory: (category: IngredientCategory | SeasoningCategory) => Ingredient[];
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useIngredientStore = create<IngredientState>((set, get) => ({
  ingredients: [],
  isLoaded: false,

  loadIngredients: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ ingredients: JSON.parse(stored), isLoaded: true });
      } else {
        // サンプルデータ（初回起動時）
        const sampleIngredients: Ingredient[] = [
          // 食材
          { id: generateId(), name: '鶏むね肉', itemType: 'food', category: '肉', memo: '冷凍中', createdAt: Date.now() },
          { id: generateId(), name: 'キャベツ', itemType: 'food', category: '野菜', createdAt: Date.now() },
          { id: generateId(), name: '卵', itemType: 'food', category: '乳製品', memo: '6個', createdAt: Date.now() },
          { id: generateId(), name: '玉ねぎ', itemType: 'food', category: '野菜', createdAt: Date.now() },
          { id: generateId(), name: 'じゃがいも', itemType: 'food', category: '野菜', memo: '3個', createdAt: Date.now() },
          { id: generateId(), name: '豚バラ肉', itemType: 'food', category: '肉', createdAt: Date.now() },
          { id: generateId(), name: '牛乳', itemType: 'food', category: '乳製品', memo: '1L', createdAt: Date.now() },
          { id: generateId(), name: '豆腐', itemType: 'food', category: 'その他', memo: '木綿', createdAt: Date.now() },
          // 調味料
          { id: generateId(), name: '醤油', itemType: 'seasoning', category: '醤油・みりん', memo: '大さじ5残', createdAt: Date.now() },
          { id: generateId(), name: 'みりん', itemType: 'seasoning', category: '醤油・みりん', createdAt: Date.now() },
          { id: generateId(), name: '塩', itemType: 'seasoning', category: '塩・砂糖', createdAt: Date.now() },
          { id: generateId(), name: '砂糖', itemType: 'seasoning', category: '塩・砂糖', memo: '上白糖', createdAt: Date.now() },
          { id: generateId(), name: 'ケチャップ', itemType: 'seasoning', category: 'ソース・ドレッシング', createdAt: Date.now() },
        ];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIngredients));
        set({ ingredients: sampleIngredients, isLoaded: true });
      }
    } catch (e) {
      console.error('Failed to load ingredients', e);
      set({ isLoaded: true });
    }
  },

  addIngredient: async (data) => {
    const newIngredient: Ingredient = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    const updated = [newIngredient, ...get().ingredients];
    set({ ingredients: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  removeIngredient: async (id) => {
    const { ingredients } = get();
    const target = ingredients.find(i => i.id === id);
    const updated = ingredients.filter(i => i.id !== id);
    set({ ingredients: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return target;
  },

  updateIngredient: async (id, updates) => {
    const updated = get().ingredients.map(i => i.id === id ? { ...i, ...updates } : i);
    set({ ingredients: updated });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  getByItemType: (itemType) => {
    return get().ingredients.filter(i => i.itemType === itemType);
  },

  getByCategory: (category) => {
    return get().ingredients.filter(i => i.category === category);
  },
}));

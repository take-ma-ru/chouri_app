/**
 * Gemini APIキー管理ストア
 * キーは端末内の AsyncStorage にのみ保存し、外部へ送信しない
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GEMINI_KEY_STORAGE_KEY = '@kitchen_note_gemini_key';

interface ApiKeyState {
  apiKey: string | null;
  isLoaded: boolean;
  loadApiKey: () => Promise<void>;
  saveApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
}

export const useApiKeyStore = create<ApiKeyState>((set) => ({
  apiKey: null,
  isLoaded: false,

  loadApiKey: async () => {
    try {
      const key = await AsyncStorage.getItem(GEMINI_KEY_STORAGE_KEY);
      set({ apiKey: key, isLoaded: true });
    } catch (e) {
      console.error('APIキーの読み込みに失敗:', e);
      set({ isLoaded: true });
    }
  },

  saveApiKey: async (key: string) => {
    const trimmed = key.trim();
    await AsyncStorage.setItem(GEMINI_KEY_STORAGE_KEY, trimmed);
    set({ apiKey: trimmed });
  },

  clearApiKey: async () => {
    await AsyncStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
    set({ apiKey: null });
  },
}));

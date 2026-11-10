import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Persisted client state. The prompt names MMKV; AsyncStorage keeps the draft
 * runnable in Expo Go. Swap the adapter here for react-native-mmkv in a dev build.
 */
export const persistStorage = createJSONStorage(() => AsyncStorage);

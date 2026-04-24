import { create } from 'zustand';
import { SettingsState, DEFAULT_SETTINGS } from '../types/settings';

interface SettingsStore extends SettingsState {
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  updateSetting: (key, value) => set({ [key]: value }),

  resetSettings: () => set(DEFAULT_SETTINGS),
}));

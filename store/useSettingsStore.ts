import { create } from "zustand";
import { AppSettings, PrecisionLevel, ViewMode } from "@/types/settings";
import { SettingsService } from "@/services/settingsService";

interface SettingsState {
  settings: AppSettings;
  loadSettings: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    isWordWrapEnabled: true,
    ignoreWhitespace: false,
    precision: PrecisionLevel.Word,
    viewMode: ViewMode.Split,
    fontSize: 13.0,
    isOptionsPanelOpen: true,
    theme: "light"
  },
  loadSettings: () => {
    const loaded = SettingsService.loadSettings();
    set({ settings: loaded });
  },
  updateSettings: (newSettings: Partial<AppSettings>) => {
    const current = get().settings;
    const updated = { ...current, ...newSettings };
    SettingsService.saveSettings(updated);
    set({ settings: updated });
  },
  resetToDefaults: () => {
    SettingsService.resetToDefaults();
    const loaded = SettingsService.loadSettings();
    set({ settings: loaded });
  }
}));
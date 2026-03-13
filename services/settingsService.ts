import { AppSettings, PrecisionLevel, ViewMode } from "../types/settings";

const SETTINGS_KEY = "diffapp_settings";

const defaultSettings: AppSettings = {
  isWordWrapEnabled: true,
  ignoreWhitespace: false,
  precision: PrecisionLevel.Word,
  viewMode: ViewMode.Split,
  fontSize: 13.0,
  isOptionsPanelOpen: true,
  theme: "light"
};

export class SettingsService {
  public static loadSettings(): AppSettings {
    if (typeof window === "undefined") {
      return defaultSettings;
    }

    try {
      const json = localStorage.getItem(SETTINGS_KEY);
      if (json) {
        const parsed = JSON.parse(json) as AppSettings;
        return { ...defaultSettings, ...parsed };
      }
    } catch {
    }

    return defaultSettings;
  }

  public static saveSettings(settings: AppSettings): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const json = JSON.stringify(settings);
      localStorage.setItem(SETTINGS_KEY, json);
    } catch {
    }
  }

  public static resetToDefaults(): void {
    const currentSettings = this.loadSettings();
    const resetSettings: AppSettings = {
      ...defaultSettings,
      isOptionsPanelOpen: currentSettings.isOptionsPanelOpen
    };
    this.saveSettings(resetSettings);
  }
}
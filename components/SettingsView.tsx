"use client";

import { PrecisionLevel, ViewMode } from "../types";
import { useSettingsStore } from "../store/useSettingsStore";
import { useEditorStore } from "../store/useEditorStore";
import { originalTestText, modifiedTestText } from "../utils/testData";
import { AVAILABLE_THEMES } from "../config/themes";
import { MdExpandMore } from "react-icons/md";
import clsx from "clsx";

export function SettingsView() {
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();
  const { setLeftText, setRightText, compare } = useEditorStore();

  const handleLoadTestData = () => {
    setLeftText(originalTestText);
    setRightText(modifiedTestText);
    compare(settings, true, false);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Comparison</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.ignoreWhitespace}
            onChange={(e) => updateSettings({ ignoreWhitespace: e.target.checked })}
            className="w-4 h-4 text-accent-primary rounded border-border-default"
          />
          <span className="text-sm font-medium text-text-primary">Ignore Whitespace</span>
        </label>
        <div className="flex bg-bg-secondary rounded-md p-1 mt-2">
          <button
            onClick={() => updateSettings({ precision: PrecisionLevel.Word })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.precision === PrecisionLevel.Word ? "bg-bg-primary shadow text-accent-primary font-medium" : "text-text-secondary hover:bg-hover-overlay")}
          >
            Word
          </button>
          <button
            onClick={() => updateSettings({ precision: PrecisionLevel.Character })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.precision === PrecisionLevel.Character ? "bg-bg-primary shadow text-accent-primary font-medium" : "text-text-secondary hover:bg-hover-overlay")}
          >
            Character
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Appearance</h3>

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-primary">Theme</span>
          <div className="relative flex items-center">
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value })}
              className="appearance-none bg-bg-secondary text-text-primary border border-border-default rounded-md pl-3 pr-8 py-1.5 text-sm outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary cursor-pointer transition-colors"
            >
              {AVAILABLE_THEMES.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            <MdExpandMore className="absolute right-2 text-xl text-text-secondary pointer-events-none" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input
            type="checkbox"
            checked={settings.isWordWrapEnabled}
            onChange={(e) => updateSettings({ isWordWrapEnabled: e.target.checked })}
            className="w-4 h-4 text-accent-primary rounded border-border-default"
          />
          <span className="text-sm font-medium text-text-primary">Word Wrap</span>
        </label>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-text-primary">Font Size</span>
            <span className="text-sm font-bold text-text-primary">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="24"
            step="1"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-accent-primary cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Layout</h3>
        <div className="flex bg-bg-secondary rounded-md p-1 mt-1">
          <button
            onClick={() => updateSettings({ viewMode: ViewMode.Split })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.viewMode === ViewMode.Split ? "bg-bg-primary shadow text-accent-primary font-medium" : "text-text-secondary hover:bg-hover-overlay")}
          >
            Split
          </button>
          <button
            onClick={() => updateSettings({ viewMode: ViewMode.Unified })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.viewMode === ViewMode.Unified ? "bg-bg-primary shadow text-accent-primary font-medium" : "text-text-secondary hover:bg-hover-overlay")}
          >
            Unified
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4 border-t border-border-default pt-6">
        <button
          onClick={handleLoadTestData}
          className="w-full py-2 bg-accent-primary text-white hover:bg-accent-hover rounded text-sm font-semibold transition-all shadow-sm"
        >
          Debug: TestText
        </button>
        <button
          onClick={resetToDefaults}
          className="w-full py-2 bg-danger-bg text-danger hover:brightness-95 rounded text-sm font-semibold transition-all border border-danger/20 mt-2"
        >
          Reset to defaults
        </button>
        <div className="text-center text-xs text-text-secondary mt-2">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
"use client";

import { PrecisionLevel, ViewMode } from "../types";
import { useSettingsStore } from "../store/useSettingsStore";
import clsx from "clsx";

export function SettingsView() {
  const { settings, updateSettings, resetToDefaults } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Comparison</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.ignoreWhitespace}
            onChange={(e) => updateSettings({ ignoreWhitespace: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Ignore Whitespace</span>
        </label>
        <div className="flex bg-gray-100 rounded-md p-1 mt-2">
          <button
            onClick={() => updateSettings({ precision: PrecisionLevel.Word })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.precision === PrecisionLevel.Word ? "bg-white shadow text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200")}
          >
            Word
          </button>
          <button
            onClick={() => updateSettings({ precision: PrecisionLevel.Character })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.precision === PrecisionLevel.Character ? "bg-white shadow text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200")}
          >
            Character
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Appearance</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.isWordWrapEnabled}
            onChange={(e) => updateSettings({ isWordWrapEnabled: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded border-gray-300"
          />
          <span className="text-sm font-medium text-gray-700">Word Wrap</span>
        </label>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Font Size</span>
            <span className="text-sm font-bold text-gray-900">{settings.fontSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="24"
            step="1"
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value, 10) })}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Layout</h3>
        <div className="flex bg-gray-100 rounded-md p-1 mt-1">
          <button
            onClick={() => updateSettings({ viewMode: ViewMode.Split })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.viewMode === ViewMode.Split ? "bg-white shadow text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200")}
          >
            Split
          </button>
          <button
            onClick={() => updateSettings({ viewMode: ViewMode.Unified })}
            className={clsx("flex-1 text-sm py-1.5 rounded", settings.viewMode === ViewMode.Unified ? "bg-white shadow text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200")}
          >
            Unified
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4 border-t pt-6">
        <button
          onClick={resetToDefaults}
          className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded text-sm font-semibold transition-colors border border-red-200"
        >
          Reset to defaults
        </button>
        <div className="text-center text-xs text-gray-400 mt-2">
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}
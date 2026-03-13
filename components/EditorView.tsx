"use client";

import { MdBorderColor, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdTune } from "react-icons/md";
import { useEditorStore } from "../store/useEditorStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { SettingsView } from "./SettingsView";
import { InputView } from "./InputView";
import { ComparisonView } from "./ComparisonView";
import clsx from "clsx";

export function EditorView() {
  const { isInputExpanded, toggleInputPanel, comparisonResult } = useEditorStore();
  const { settings, updateSettings } = useSettingsStore();

  const hasResult = comparisonResult && comparisonResult.blocks.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-primary">
      <div className="relative flex h-full shrink-0 z-30">
        <div
          className={clsx(
            "flex flex-col bg-bg-secondary transition-all duration-300 overflow-hidden h-full border-border-default",
            settings.isSettingsPanelOpen ? "w-64 border-r" : "w-0 border-r-0"
          )}
        >
          <div className="flex w-64 flex-col h-full shrink-0">
            <div className="flex items-center gap-2 border-b border-border-default p-4 shrink-0 bg-bg-secondary">
              <MdTune className="text-xl text-text-secondary" />
              <h2 className="text-base font-bold text-text-primary">Settings</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <SettingsView />
            </div>
          </div>
        </div>

        <button
          onClick={() => updateSettings({ isSettingsPanelOpen: !settings.isSettingsPanelOpen })}
          className="absolute top-14 -right-8 flex h-20 w-8 items-center justify-center rounded-r-md bg-accent-primary text-white shadow-md hover:bg-accent-hover transition-colors z-40"
          title={settings.isSettingsPanelOpen ? "Close Settings" : "Open Settings"}
        >
          {settings.isSettingsPanelOpen ? <MdKeyboardArrowLeft className="text-3xl" /> : <MdKeyboardArrowRight className="text-3xl" />}
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        <div
          className={clsx(
            "flex flex-col bg-bg-primary relative",
            hasResult || !isInputExpanded ? "flex-1 overflow-hidden" : "shrink-0 h-0"
          )}
        >
          <ComparisonView />
        </div>

        <div className="w-full h-12 shrink-0 flex items-center justify-center z-20 bg-bg-primary border-t border-b border-border-default shadow-sm relative">
          <button
            onClick={toggleInputPanel}
            className="flex items-center gap-2 bg-accent-primary text-white hover:bg-accent-hover shadow-md px-6 py-1.5 rounded-full text-sm font-semibold transition-colors"
          >
            <MdBorderColor className="text-lg" />
            <span>{isInputExpanded ? "Hide Input" : "Show Input"}</span>
            {isInputExpanded ? <MdKeyboardArrowDown className="text-xl" /> : <MdKeyboardArrowUp className="text-xl" />}
          </button>
        </div>

        <div
          className={clsx(
            "flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-bg-primary",
            isInputExpanded ? (hasResult ? "h-[450px]" : "flex-1") : "h-0 opacity-0"
          )}
        >
          <InputView />
        </div>
      </div>
    </div>
  );
}
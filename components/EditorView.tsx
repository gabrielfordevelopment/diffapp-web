"use client";

import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdTune, MdBorderColor, MdExpandMore, MdExpandLess } from "react-icons/md";
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
      <div className="flex shrink-0 border-r border-border-default bg-bg-secondary transition-all duration-300">
        {!settings.isSettingsPanelOpen ? (
          <button
            onClick={() => updateSettings({ isSettingsPanelOpen: true })}
            className="flex h-full w-8 items-center justify-center hover:bg-hover-overlay transition-colors"
            title="Open Settings"
          >
            <MdKeyboardArrowRight className="text-2xl text-text-secondary" />
          </button>
        ) : (
          <div className="flex w-64 flex-col h-full">
            <div className="flex items-center justify-between border-b border-border-default p-4">
              <div className="flex items-center gap-2">
                <MdTune className="text-xl text-text-secondary" />
                <h2 className="text-base font-bold text-text-primary">Settings</h2>
              </div>
              <button
                onClick={() => updateSettings({ isSettingsPanelOpen: false })}
                className="rounded p-1 hover:bg-hover-overlay transition-colors"
                title="Close Settings"
              >
                <MdKeyboardArrowLeft className="text-2xl text-text-secondary" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
               <SettingsView />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className={clsx(
            "flex flex-col bg-bg-primary relative",
            (hasResult || !isInputExpanded) ? "flex-1 overflow-hidden" : "shrink-0"
          )}
        >
          <ComparisonView />
        </div>

        <button
          onClick={toggleInputPanel}
          className="flex w-full items-center justify-center gap-2 bg-accent-primary py-1.5 text-white hover:bg-accent-hover transition-colors shrink-0"
        >
          <MdBorderColor className="text-lg" />
          <span className="text-sm font-semibold">Input / Editor</span>
          {!isInputExpanded ? <MdExpandLess className="text-xl" /> : <MdExpandMore className="text-xl" />}
        </button>

        {isInputExpanded && (
          <div
            className={clsx(
              "shrink-0 border-border-default flex flex-col",
              hasResult ? "h-1/2 min-h-[ 300px ] border-t" : "flex-1"
            )}
          >
            <InputView />
          </div>
        )}
      </div>
    </div>
  );
}
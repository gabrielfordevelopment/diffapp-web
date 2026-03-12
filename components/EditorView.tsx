"use client";

import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdTune, MdBorderColor, MdExpandMore, MdExpandLess } from "react-icons/md";
import { useEditorStore } from "../store/useEditorStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { SettingsView } from "./SettingsView";
import { InputView } from "./InputView";
import { ComparisonView } from "./ComparisonView";

export function EditorView() {
  const { isInputExpanded, toggleInputPanel, comparisonResult } = useEditorStore();
  const { settings, updateSettings } = useSettingsStore();

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      <div className="flex shrink-0 border-r border-gray-300 bg-background-ui transition-all duration-300">
        {!settings.isSettingsPanelOpen ? (
          <button
            onClick={() => updateSettings({ isSettingsPanelOpen: true })}
            className="flex h-full w-8 items-center justify-center hover:bg-gray-200 transition-colors"
            title="Open Settings"
         
          >
            <MdKeyboardArrowRight className="text-2xl text-gray-500" />
          </button>
        ) : (
          <div className="flex w-72 flex-col h-full">
            <div className="flex items-center justify-between border-b border-gray-300 p-4">
              <div className="flex items-center gap-2">
               
                <MdTune className="text-xl text-gray-600" />
                <h2 className="text-base font-bold text-gray-900">Settings</h2>
              </div>
              <button
                onClick={() => updateSettings({ isSettingsPanelOpen: false })}
                className="rounded p-1 hover:bg-gray-200 transition-colors"
         
                title="Close Settings"
              >
                <MdKeyboardArrowLeft className="text-2xl text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SettingsView />
    
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden bg-white relative">
          {comparisonResult ?
            (
              <ComparisonView />
            ) : (
              !isInputExpanded && (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-gray-400">No comparison generated yet.</p>
                </div>
          
              )
            )}
        </div>

        <button
          onClick={toggleInputPanel}
          className="flex w-full items-center justify-center gap-2 bg-blue-600 py-1.5 text-white hover:bg-blue-700 transition-colors shrink-0"
        >
          <MdBorderColor className="text-lg" />
          <span className="text-sm font-semibold">Input / Editor</span>
      
          {!isInputExpanded ? <MdExpandLess className="text-xl" /> : <MdExpandMore className="text-xl" />}
        </button>

        {isInputExpanded && (
          <div className="h-1/2 min-h-[300px] shrink-0 border-t border-gray-300">
            <InputView />
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { MdDescription, MdSearch, MdSwapHoriz } from "react-icons/md";
import { useEditorStore } from "../store/useEditorStore";
import { useSettingsStore } from "../store/useSettingsStore";

export function InputView() {
  const { leftText, rightText, setLeftText, setRightText, swapTexts, compare } = useEditorStore();
  const settings = useSettingsStore((state) => state.settings);

  const handleCompare = () => {
    if (leftText || rightText) {
      compare(settings, true);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-4 bg-[#f6f8fa]">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex flex-1 items-center gap-2">
          <MdDescription className="text-gray-500 text-lg" />
          <span className="font-bold text-gray-800 text-sm">Original Text</span>
        </div>
        <button
          onClick={() => swapTexts(settings)}
          className="p-2 mx-4 rounded-full hover:bg-gray-200 text-blue-600 transition-colors"
          title="Swap texts"
        >
          <MdSwapHoriz className="text-2xl" />
        </button>
        <div className="flex flex-1 items-center gap-2">
          <MdDescription className="text-gray-500 text-lg" />
          <span className="font-bold text-gray-800 text-sm">Changed Text</span>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <textarea
          value={leftText}
          onChange={(e) => setLeftText(e.target.value)}
          className="flex-1 resize-none rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono outline-none"
          style={{
            fontSize: `${settings.fontSize}px`,
            whiteSpace: settings.isWordWrapEnabled ? "pre-wrap" : "pre"
          }}
          spellCheck={false}
        />
        <textarea
          value={rightText}
          onChange={(e) => setRightText(e.target.value)}
          className="flex-1 resize-none rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono outline-none"
          style={{
            fontSize: `${settings.fontSize}px`,
            whiteSpace: settings.isWordWrapEnabled ? "pre-wrap" : "pre"
          }}
          spellCheck={false}
        />
      </div>

      <div className="flex justify-center mt-4 shrink-0">
        <button
          onClick={handleCompare}
          disabled={!leftText && !rightText}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-md font-semibold transition-colors shadow-sm"
        >
          <MdSearch className="text-xl" />
          Find Difference
        </button>
      </div>
    </div>
  );
}
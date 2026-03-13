"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { ViewMode } from "@/types/settings";
import { ComparisonToolbar } from "./ComparisonToolbar";
import { SplitView } from "./SplitView";
import { UnifiedView } from "./UnifiedView";
import { DiffMinimap } from "./DiffMinimap";
import clsx from "clsx";

export function ComparisonView() {
  const { comparisonResult, leftText, rightText, compare, selectBlock, isInputExpanded } = useEditorStore();
  const { settings } = useSettingsStore();

  const storeRefs = useRef({ leftText, rightText, compare, settings, selectBlock });

  useEffect(() => {
    storeRefs.current = { leftText, rightText, compare, settings, selectBlock };
  });

  useEffect(() => {
    if (storeRefs.current.leftText || storeRefs.current.rightText) {
      storeRefs.current.compare(storeRefs.current.settings, false, true);
    }
  }, [settings.precision]);

  useEffect(() => {
    storeRefs.current.selectBlock(null);
  }, [settings.ignoreWhitespace]);

  const handleSegmentClick = (blockId: string, offsetPct: number) => {
    selectBlock(blockId);
    
    const container = document.getElementById("diff-container");
    if (container) {
      const scrollArea = container.querySelector(".custom-scrollbar");
      if (scrollArea) {
        const targetScroll = (offsetPct / 100) * scrollArea.scrollHeight - scrollArea.clientHeight / 2;
        scrollArea.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  const hasResult = comparisonResult && comparisonResult.blocks.length > 0;
  const hideBody = !hasResult && isInputExpanded;

  return (
    <div className={clsx("flex w-full flex-col bg-bg-primary relative", !hideBody && "h-full")}>
      <ComparisonToolbar />

      {!hideBody && (
        <div id="diff-container" className="flex flex-1 overflow-hidden relative" style={{ fontSize: `${settings.fontSize}px` }}>
          {!hasResult ? (
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-text-secondary">No comparison generated yet.</p>
            </div>
          ) : settings.viewMode === ViewMode.Split ? (
            <SplitView />
          ) : (
            <UnifiedView />
          )}

          {hasResult && (
            <div className="absolute right-2 top-0 h-full z-30 pointer-events-none">
              <div className="pointer-events-auto h-full">
                <DiffMinimap
                  blocks={comparisonResult.blocks}
                  ignoreWhitespace={settings.ignoreWhitespace}
                  onSegmentClick={handleSegmentClick}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
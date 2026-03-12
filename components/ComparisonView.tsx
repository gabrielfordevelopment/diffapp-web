"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { MdContentCopy, MdSwapHoriz, MdDelete, MdEast, MdWest, MdClose, MdDescription, MdCheck } from "react-icons/md";
import { useEditorStore } from "../store/useEditorStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getBlockColorClass, getFragmentColorClass, calculateStats } from "../utils/diffHelpers";
import { DiffMinimap } from "./DiffMinimap";
import { MergeDirection, ViewMode, ChangeBlock, BlockType, DiffChangeType, TextFragment } from "../types";
import clsx from "clsx";

interface UnifiedLineData {
  line1: number | string | null;
  line2: number | string | null;
  sign: string;
  fragments: Array<TextFragment>;
  bgClass: string;
}

export function ComparisonView() {
  const { comparisonResult, leftText, rightText, swapTexts, clearContent, selectBlock, mergeBlock, compare } = useEditorStore();
  const { settings } = useSettingsStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [copiedSide, setCopiedSide] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    if (leftText || rightText) {
      compare(settings, false, true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.precision]);

  const stats = useMemo(() => {
    return calculateStats(comparisonResult?.blocks, settings.ignoreWhitespace);
  }, [comparisonResult, settings.ignoreWhitespace]);

  const leftLineCount = useMemo(() => leftText ? leftText.split(/\r?\n/).length : 0, [leftText]);
  const rightLineCount = useMemo(() => rightText ? rightText.split(/\r?\n/).length : 0, [rightText]);

  const handleCopy = (text: string, side: "left" | "right") => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedSide(side);
    
    setTimeout(() => {
      setCopiedSide((prev) => (prev === side ? null : prev));
    }, 2000);
  };

  const handleScrollRequest = (percentage: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const targetScroll = percentage * (container.scrollHeight - container.clientHeight);
      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  const renderMergeControls = (block: ChangeBlock) => {
    if (!block.isSelected || block.kind === "Unchanged") {
      return null;
    }

    return (
      <div className="flex w-full items-center border-t border-blue-500 bg-white py-2 relative">
        <div className="flex flex-1 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.LeftToRight, settings); }}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <span>Merge</span>
            <MdEast />
          </button>
        </div>
        <div className="flex shrink-0 px-4">
          <button
            onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
        <div className="flex flex-1 justify-center">
          <button
            onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.RightToLeft, settings); }}
            className="flex items-center gap-2 rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            <MdWest />
            <span>Merge</span>
          </button>
        </div>
      </div>
    );
  };

  if (!comparisonResult || comparisonResult.blocks.length === 0) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 bg-[#f6f8fa] px-4 py-3 shrink-0">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <MdDescription className="text-xl text-gray-500" />
            <span className="font-bold text-red-600 text-sm">{stats.removals} removals</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{leftLineCount} lines</span>
            <button 
              onClick={() => handleCopy(leftText, "left")} 
              disabled={copiedSide === "left"}
              className="flex items-center gap-1 text-blue-600 hover:bg-gray-200 px-2 py-1.5 rounded disabled:text-green-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all" 
              title="Copy Original Text"
            >
              {copiedSide === "left" ? (
                <>
                  <MdCheck className="text-lg" />
                  <span className="text-xs font-bold">Copied</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="text-lg" />
                  <span className="text-xs font-bold">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button onClick={() => swapTexts(settings)} className="mx-6 text-2xl text-blue-600 hover:bg-gray-200 p-1.5 rounded" title="Swap Sides">
          <MdSwapHoriz />
        </button>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <MdDescription className="text-xl text-gray-500" />
            <span className="font-bold text-green-600 text-sm">{stats.additions} additions</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{rightLineCount} lines</span>
            <button 
              onClick={() => handleCopy(rightText, "right")} 
              disabled={copiedSide === "right"}
              className="flex items-center gap-1 text-blue-600 hover:bg-gray-200 px-2 py-1.5 rounded disabled:text-green-600 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all" 
              title="Copy Modified Text"
            >
              {copiedSide === "right" ? (
                <>
                  <MdCheck className="text-lg" />
                  <span className="text-xs font-bold">Copied</span>
                </>
              ) : (
                <>
                  <MdContentCopy className="text-lg" />
                  <span className="text-xs font-bold">Copy</span>
                </>
              )}
            </button>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button onClick={clearContent} className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-red-700">
              <MdDelete />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="flex-1 overflow-auto" style={{ fontSize: `${settings.fontSize}px` }}>
          {comparisonResult.blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => selectBlock(block.id)}
              className={clsx(
                "flex flex-col border-y-2 border-transparent cursor-pointer",
                block.isSelected ? "bg-[#F0F8FF] border-blue-500" : "hover:bg-[#F8F8F8] hover:border-gray-200"
              )}
            >
              {settings.viewMode === ViewMode.Split ? (
                <div className="flex w-full">
                  <div className={clsx("flex flex-1 border-r border-gray-200", getBlockColorClass(block.kind, "old", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                    <div className="flex w-full flex-col">
                      {block.oldLines.map((line, idx) => (
                        <div key={idx} className={clsx("flex min-h-[24px]", line.kind === DiffChangeType.Imaginary && "bg-[#f0f0f0]")}>
                          <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 border-r border-gray-200 py-0.5">
                            {line.lineNumber}
                          </div>
                          <div className={clsx("flex-1 px-2 py-0.5 font-mono break-all whitespace-pre-wrap")}>
                            {line.fragments.map((frag, fIdx) => (
                              <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                {frag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={clsx("flex flex-1", getBlockColorClass(block.kind, "new", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                    <div className="flex w-full flex-col">
                      {block.newLines.map((line, idx) => (
                        <div key={idx} className={clsx("flex min-h-[24px]", line.kind === DiffChangeType.Imaginary && "bg-[#f0f0f0]")}>
                          <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 border-r border-gray-200 py-0.5">
                            {line.lineNumber}
                          </div>
                          <div className={clsx("flex-1 px-2 py-0.5 font-mono break-all whitespace-pre-wrap")}>
                            {line.fragments.map((frag, fIdx) => (
                              <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                {frag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex w-full flex-col">
                  {(() => {
                    if (block.kind === BlockType.Modified) {
                      const lines: Array<UnifiedLineData> = [];
                      block.oldLines.forEach(line => {
                        if (line.kind !== DiffChangeType.Imaginary) {
                          lines.push({
                            line1: line.lineNumber,
                            line2: "",
                            sign: "-",
                            fragments: line.fragments,
                            bgClass: getBlockColorClass(BlockType.Removed, "old", block.isWhitespaceChange, settings.ignoreWhitespace)
                          });
                        }
                      });
                      block.newLines.forEach(line => {
                        if (line.kind !== DiffChangeType.Imaginary) {
                          lines.push({
                            line1: "",
                            line2: line.lineNumber,
                            sign: "+",
                            fragments: line.fragments,
                            bgClass: getBlockColorClass(BlockType.Added, "new", block.isWhitespaceChange, settings.ignoreWhitespace)
                          });
                        }
                      });
                      return lines.map((l, idx) => (
                        <div key={idx} className={clsx("flex min-h-[24px] w-full", l.bgClass)}>
                          <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 py-0.5">
                            {l.line1}
                          </div>
                          <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 border-r border-gray-200 py-0.5">
                            {l.line2}
                          </div>
                          <div className="w-6 shrink-0 select-none px-1 text-center font-bold text-gray-400 py-0.5">
                            {l.sign}
                          </div>
                          <div className="flex-1 px-2 py-0.5 font-mono break-all whitespace-pre-wrap">
                            {l.fragments.map((frag: TextFragment, fIdx: number) => (
                              <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                {frag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      ));
                    } else {
                      return block.oldLines.map((line, idx) => {
                        const newLine = block.newLines[idx];
                        const isRemoved = block.kind === BlockType.Removed;
                        const isAdded = block.kind === BlockType.Added;

                        let bgClass = "bg-transparent";
                        if (isRemoved) bgClass = getBlockColorClass(BlockType.Removed, "old", block.isWhitespaceChange, settings.ignoreWhitespace);
                        if (isAdded) bgClass = getBlockColorClass(BlockType.Added, "new", block.isWhitespaceChange, settings.ignoreWhitespace);

                        return (
                          <div key={idx} className={clsx("flex min-h-[24px] w-full", bgClass)}>
                            <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 py-0.5">
                              {line.lineNumber || ""}
                            </div>
                            <div className="w-10 shrink-0 select-none bg-[#F6F8FA] px-2 text-right text-gray-400 border-r border-gray-200 py-0.5">
                              {newLine?.lineNumber || ""}
                            </div>
                            <div className="w-6 shrink-0 select-none px-1 text-center font-bold text-gray-400 py-0.5">
                              {isRemoved ? "-" : isAdded ? "+" : " "}
                            </div>
                            <div className="flex-1 px-2 py-0.5 font-mono break-all whitespace-pre-wrap">
                              {(isAdded ? newLine?.fragments || [] : line.fragments).map((frag, fIdx) => (
                                <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                  {frag.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    }
                  })()}
                </div>
              )}
              {renderMergeControls(block)}
            </div>
          ))}
        </div>
        <DiffMinimap
          blocks={comparisonResult.blocks}
          ignoreWhitespace={settings.ignoreWhitespace}
          onScrollRequest={handleScrollRequest}
        />
      </div>
    </div>
  );
}
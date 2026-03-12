"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { MdContentCopy, MdSwapHoriz, MdDelete, MdEast, MdWest, MdClose, MdDescription, MdCheck } from "react-icons/md";
import { useEditorStore } from "../store/useEditorStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getBlockColorClass, getFragmentColorClass, calculateStats } from "../utils/diffHelpers";
import { DiffMinimap } from "./DiffMinimap";
import { MergeDirection, ViewMode, BlockType, DiffChangeType, TextFragment } from "../types";
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

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const unifiedScrollRef = useRef<HTMLDivElement>(null);

  const isSyncingScroll = useRef<"left" | "right" | null>(null);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  const [ copiedSide, setCopiedSide ] = useState<"left" | "right" | null>(null);
  const [ hoveredBlockId, setHoveredBlockId ] = useState<string | null>(null);

  useEffect(() => {
    if (leftText || rightText) {
      compare(settings, false, true);
    }
  }, [ settings.precision ]);

  const stats = useMemo(() => {
    return calculateStats(comparisonResult?.blocks, settings.ignoreWhitespace);
  }, [ comparisonResult, settings.ignoreWhitespace ]);

  const leftLineCount = useMemo(() => leftText ? leftText.split(/\r?\n/).length : 0, [ leftText ]);

  const rightLineCount = useMemo(() => rightText ? rightText.split(/\r?\n/).length : 0, [ rightText ]);

  const handleCopy = (text: string, side: "left" | "right") => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedSide(side);

    setTimeout(() => {
      setCopiedSide((prev) => (prev === side ? null : prev));
    }, 2000);

  };

  const handleScrollRequest = (percentage: number) => {
    const container = settings.viewMode === ViewMode.Split ?
      leftScrollRef.current : unifiedScrollRef.current;
    if (container) {
      const targetScroll = percentage * (container.scrollHeight - container.clientHeight);

      container.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  const handleSegmentClick = (blockId: string) => {
    selectBlock(blockId);

    const prefix = settings.viewMode === ViewMode.Split ? "block-left-" : "block-unified-";
    const element = document.getElementById(`${prefix}${blockId}`);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  };

  const handleLeftScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScroll.current === "right") return;
    isSyncingScroll.current = "left";

    if (rightScrollRef.current) {
      rightScrollRef.current.scrollTop = e.currentTarget.scrollTop;
      rightScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;

    }
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      isSyncingScroll.current = null;
    }, 50);

  };

  const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScroll.current === "left") return;
    isSyncingScroll.current = "right";

    if (leftScrollRef.current) {
      leftScrollRef.current.scrollTop = e.currentTarget.scrollTop;
      leftScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;

    }
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      isSyncingScroll.current = null;
    }, 50);

  };

  if (!comparisonResult || comparisonResult.blocks.length === 0) {
    return null;
  }

  const wordWrapClass = settings.isWordWrapEnabled ?
    "break-all whitespace-pre-wrap" : "whitespace-pre";
  const containerWidthClass = settings.isWordWrapEnabled ? "w-full" : "min-w-max";

  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-300 bg-background-ui px-4 py-1.5 shrink-0">
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
              {copiedSide === "left" ?
                (
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
              {copiedSide === "right" ?
                (
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

      <div className="flex flex-1 overflow-hidden relative" style={{ fontSize: `${settings.fontSize}px` }}>
        {settings.viewMode === ViewMode.Split ?
          (
            <div className="flex h-full w-full">
              <div className="flex-1 overflow-auto custom-scrollbar border-r border-gray-300" ref={leftScrollRef} onScroll={handleLeftScroll}>
                <div className={clsx("flex flex-col min-w-full h-max pb-8", containerWidthClass)}>
                  {comparisonResult.blocks.map((block) => {
                    const isHovered = hoveredBlockId === block.id && block.kind !== BlockType.Unchanged;
   
                    return (
                      <div
                        key={`left-${block.id}`}
                        id={`block-left-${block.id}`}
                    
                        onMouseEnter={() => setHoveredBlockId(block.id)}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        onClick={block.kind !== BlockType.Unchanged ? () => selectBlock(block.id) : undefined}
                        className={clsx(
                    
                          "flex flex-col border-y-2 border-transparent w-full",
                          block.kind !== BlockType.Unchanged && "cursor-pointer",
                          block.isSelected ?
                            "bg-ui-selected-bg border-blue-500" : (isHovered ? "bg-ui-hover-bg border-gray-200" : "")
                        )}
                      >
                        <div className={clsx("flex w-full flex-col", getBlockColorClass(block.kind, "old", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                      
                          {block.oldLines.map((line, idx) => (
                            <div key={idx} className={clsx("flex min-h-[24px] w-full", line.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
                              <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 border-r border-gray-200 py-0.5 sticky left-0 z-10">
                    
                                {line.lineNumber}
                              </div>
                              <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
                              
                                {line.fragments.map((frag, fIdx) => (
                                  <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                    {frag.text}
                          
                                  </span>
                                ))}
                              </div>
                            </div>
          
                          ))}
                        </div>
                        {block.isSelected && block.kind !== BlockType.Unchanged && (
                          <div className="flex items-center justify-end w-full min-w-full border-t border-blue-500 bg-white relative h-12">
  
                            <div className="sticky right-0 flex items-center justify-end gap-4 px-4 bg-white h-full z-20">
                              <button
                                onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.LeftToRight, settings); }}
                                className="flex items-center gap-2 rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                              >
                              
                                <span>Merge</span>
                                <MdEast />
                              </button>
                              <button
             
                                onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
                                className="rounded p-1 text-gray-500 hover:bg-gray-100 transition-colors"
                              >
                                <MdClose className="text-xl" />
      
                              </button>
                            </div>
                          </div>
                        )}
      
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 overflow-auto custom-scrollbar" ref={rightScrollRef} onScroll={handleRightScroll}>
                <div className={clsx("flex flex-col min-w-full h-max pb-8", containerWidthClass)}>
                  {comparisonResult.blocks.map((block) => {
                    const isHovered = hoveredBlockId === block.id && block.kind !== BlockType.Unchanged;
                    return (
                      <div
                        key={`right-${block.id}`}
                        id={`block-right-${block.id}`}
          
                        onMouseEnter={() => setHoveredBlockId(block.id)}
                        onMouseLeave={() => setHoveredBlockId(null)}
                        onClick={block.kind !== BlockType.Unchanged ? () => selectBlock(block.id) : undefined}
                        className={clsx(
          
                          "flex flex-col border-y-2 border-transparent w-full",
                          block.kind !== BlockType.Unchanged && "cursor-pointer",
                          block.isSelected ?
                            "bg-ui-selected-bg border-blue-500" : (isHovered ? "bg-ui-hover-bg border-gray-200" : "")
                        )}
                      >
                        <div className={clsx("flex w-full flex-col", getBlockColorClass(block.kind, "new", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                      
                          {block.newLines.map((line, idx) => (
                            <div key={idx} className={clsx("flex min-h-[24px] w-full", line.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
                              <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 border-r border-gray-200 py-0.5 sticky left-0 z-10">
                    
                                {line.lineNumber}
                              </div>
                              <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
                              
                                {line.fragments.map((frag, fIdx) => (
                                  <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                    {frag.text}
                          
                                  </span>
                                ))}
                              </div>
                            </div>
          
                          ))}
                        </div>
                        {block.isSelected && block.kind !== BlockType.Unchanged && (
                          <div className="flex items-center justify-start w-full min-w-full border-t border-blue-500 bg-white relative h-12">
  
                            <div className="sticky left-0 flex items-center justify-start px-4 bg-white h-full z-20">
                              <button
                                onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.RightToLeft, settings); }}
                                className="flex items-center gap-2 rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                              >
                              
                                <MdWest />
                                <span>Merge</span>
                              </button>
                            </div>
              
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto custom-scrollbar" ref={unifiedScrollRef}>
              <div className={clsx("flex flex-col min-w-full h-max pb-8", containerWidthClass)}>
                {comparisonResult.blocks.map((block) => (
        
                  <div
                    key={block.id}
                    id={`block-unified-${block.id}`}
                    onClick={block.kind !== BlockType.Unchanged ? () => selectBlock(block.id) : undefined}
                    className={clsx(
            
                      "flex flex-col border-y-2 border-transparent w-full",
                      block.kind !== BlockType.Unchanged && "cursor-pointer",
                      block.isSelected ? "bg-ui-selected-bg border-blue-500" : (block.kind !== BlockType.Unchanged ? "hover:bg-ui-hover-bg hover:border-gray-200" : "")
                    )}
              
                  >
                    <div className="flex w-full flex-col">
                      {(() => {
                        if (block.kind === BlockType.Modified) {
                          const lines: Array<UnifiedLineData> = [ ];
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
                              <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 py-0.5 sticky left-0 z-10">
                            
                                {l.line1}
                              </div>
                              <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 border-r border-gray-200 py-0.5 sticky left-[40px] z-10">
                            
                                {l.line2}
                              </div>
                              <div className="w-6 shrink-0 select-none px-1 text-center font-bold text-gray-400 py-0.5 sticky left-[80px] z-10 bg-background-ui">
                              
                                {l.sign}
                              </div>
                              <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
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
                            const newLine = block.newLines[ idx ];
                            const isRemoved = block.kind === BlockType.Removed;
  
                            const isAdded = block.kind === BlockType.Added;

                            let bgClass = "bg-transparent";
                            if (isRemoved) bgClass = getBlockColorClass(BlockType.Removed, "old", block.isWhitespaceChange, settings.ignoreWhitespace);
          
                            if (isAdded) bgClass = getBlockColorClass(BlockType.Added, "new", block.isWhitespaceChange, settings.ignoreWhitespace);

                            return (
                              <div key={idx} className={clsx("flex min-h-[24px] w-full", bgClass)}>
                
                                <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 py-0.5 sticky left-0 z-10">
                                  {line.lineNumber || ""}
                                </div>
            
                                <div className="w-10 shrink-0 select-none bg-background-ui px-2 text-right text-gray-400 border-r border-gray-200 py-0.5 sticky left-[40px] z-10">
                                  {newLine?.lineNumber || ""}
                                </div>
                                <div className="w-6 shrink-0 select-none px-1 text-center font-bold text-gray-400 py-0.5 sticky left-[80px] z-10 bg-background-ui">
                              
                                  {isRemoved ? "-" : isAdded ? "+" : " "}
                                </div>
                                <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
                                  {(isAdded ? newLine?.fragments || [ ] : line.fragments).map((frag, fIdx) => (
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
                    {block.isSelected && block.kind !== BlockType.Unchanged && (
                      <div className="flex items-center justify-center w-full min-w-full border-t border-blue-500 bg-white relative h-12">
        
                        <div className="sticky left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 px-4 bg-white h-full z-20 w-max">
                          <button
                            onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.LeftToRight, settings); }}
                  
                            className="flex items-center gap-2 rounded bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                          >
                            <span>Merge</span>
                            <MdEast />
    
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 transition-colors mx-2"
                          >
                            <MdClose className="text-xl" />
                  
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.RightToLeft, settings); }}
                            className="flex items-center gap-2 rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                          >
                            <MdWest />
          
                            <span>Merge</span>
                          </button>
                        </div>
                      </div>
                  
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        <DiffMinimap
          blocks={comparisonResult.blocks}
          ignoreWhitespace={settings.ignoreWhitespace}
          onSegmentClick={handleSegmentClick}
 
        />
      </div>
    </div>
  );
}
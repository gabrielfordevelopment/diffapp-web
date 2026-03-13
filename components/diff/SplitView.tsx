"use client";

import { useRef, useState } from "react";
import { MdEast, MdWest, MdClose } from "react-icons/md";
import { useEditorStore } from "../../store/useEditorStore";
import { useSettingsStore } from "../../store/useSettingsStore";
import { getBlockColorClass, getFragmentColorClass } from "../../utils/diffHelpers";
import { MergeDirection } from "../../types/ui";
import { BlockType, DiffChangeType } from "../../types/diff";
import clsx from "clsx";

export function SplitView() {
  const { comparisonResult, selectBlock, mergeBlock } = useEditorStore();
  const { settings } = useSettingsStore();

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const wrapScrollRef = useRef<HTMLDivElement>(null);

  const isSyncingScroll = useRef<"left" | "right" | null>(null);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  const[hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [selectionSide, setSelectionSide] = useState<"left" | "right" | null>(null);

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

  if (!comparisonResult) {
    return null;
  }

  const wordWrapClass = settings.isWordWrapEnabled ? "break-all whitespace-pre-wrap" : "whitespace-pre";
  const containerWidthClass = settings.isWordWrapEnabled ? "w-full" : "min-w-max";

  if (settings.isWordWrapEnabled) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-8" ref={wrapScrollRef}>
        <div className="flex flex-col min-w-full h-max pb-8 w-full">
          {comparisonResult.blocks.map((block) => {
            const isIgnoredWhitespace = settings.ignoreWhitespace && block.isWhitespaceChange;
            const isSelectable = block.kind !== BlockType.Unchanged && !isIgnoredWhitespace;
            const isHovered = hoveredBlockId === block.id && isSelectable && !block.isSelected;
            const maxLines = Math.max(block.oldLines.length, block.newLines.length);

            return (
              <div
                key={`split-wrap-${block.id}`}
                id={`block-split-wrap-${block.id}`}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={isSelectable ? () => selectBlock(block.id) : undefined}
                className={clsx(
                  "flex flex-col border-y-2 border-transparent w-full relative",
                  isSelectable && "cursor-pointer",
                  block.isSelected && isSelectable && "bg-bg-selected border-accent-primary"
                )}
              >
                {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" /> }
                <div className="flex flex-col w-full relative z-0">
                  {Array.from({ length: maxLines }).map((_, idx) => {
                    const oldLine = block.oldLines[idx] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };
                    const newLine = block.newLines[idx] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };

                    return (
                      <div key={idx} className="flex min-h-[24px] w-full">
                        <div
                          onMouseDown={() => setSelectionSide("left")}
                          className={clsx("flex flex-1 w-1/2", getBlockColorClass(block.kind, "old", block.isWhitespaceChange, settings.ignoreWhitespace), oldLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "right" && "select-none")}
                        >
                          <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary border-r border-border-default py-0.5 sticky left-0 z-10">
                            {oldLine.lineNumber}
                          </div>
                          <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
                            {oldLine.fragments.map((frag, fIdx) => (
                              <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                {frag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          onMouseDown={() => setSelectionSide("right")}
                          className={clsx("flex flex-1 w-1/2 border-l border-border-default", getBlockColorClass(block.kind, "new", block.isWhitespaceChange, settings.ignoreWhitespace), newLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "left" && "select-none")}
                        >
                          <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary border-r border-border-default py-0.5 sticky left-0 z-10">
                            {newLine.lineNumber}
                          </div>
                          <div className={clsx("px-2 py-0.5 font-mono", wordWrapClass)}>
                            {newLine.fragments.map((frag, fIdx) => (
                              <span key={fIdx} className={getFragmentColorClass(frag.kind, frag.isWhitespaceChange, settings.ignoreWhitespace)}>
                                {frag.text}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {block.isSelected && isSelectable && (
                  <div className="flex items-center justify-between w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 px-4 select-none">
                    <div className="flex items-center gap-4 flex-1 justify-end pr-4 border-r border-transparent">
                      <button
                        onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.LeftToRight, settings); }}
                        className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors"
                      >
                        <span>Merge</span>
                        <MdEast />
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
                      className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors shrink-0"
                    >
                      <MdClose className="text-xl" />
                    </button>
                    <div className="flex items-center gap-4 flex-1 justify-start pl-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.RightToLeft, settings); }}
                        className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors"
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
    );
  }

  return (
    <div className="flex h-full w-full">
      <div
        className={clsx("flex-1 overflow-auto hide-vertical-scrollbar border-r border-border-default", selectionSide === "right" && "select-none")}
        ref={leftScrollRef}
        onScroll={handleLeftScroll}
        onMouseDown={() => setSelectionSide("left")}
      >
        <div className={clsx("flex flex-col min-w-full h-max pb-8", containerWidthClass)}>
          {comparisonResult.blocks.map((block) => {
            const isIgnoredWhitespace = settings.ignoreWhitespace && block.isWhitespaceChange;
            const isSelectable = block.kind !== BlockType.Unchanged && !isIgnoredWhitespace;
            const isHovered = hoveredBlockId === block.id && isSelectable && !block.isSelected;
            return (
              <div
                key={`left-${block.id}`}
                id={`block-split-left-${block.id}`}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={isSelectable ? () => selectBlock(block.id) : undefined}
                className={clsx(
                  "flex flex-col border-y-2 border-transparent w-full relative",
                  isSelectable && "cursor-pointer",
                  block.isSelected && isSelectable && "bg-bg-selected border-accent-primary"
                )}
              >
                {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" /> }
                <div className={clsx("flex w-full flex-col relative z-0", getBlockColorClass(block.kind, "old", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                  {block.oldLines.map((line, idx) => (
                    <div key={idx} className={clsx("flex min-h-[24px] w-full", line.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
                      <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary border-r border-border-default py-0.5 sticky left-0 z-10">
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
                {block.isSelected && isSelectable && (
                  <div className="flex items-center justify-end w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none">
                    <div className="sticky right-0 flex items-center justify-end gap-4 px-4 h-full">
                      <button
                        onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.LeftToRight, settings); }}
                        className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors"
                      >
                        <span>Merge</span>
                        <MdEast />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
                        className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors"
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

      <div
        className={clsx("flex-1 overflow-auto custom-scrollbar", selectionSide === "left" && "select-none")}
        ref={rightScrollRef}
        onScroll={handleRightScroll}
        onMouseDown={() => setSelectionSide("right")}
      >
        <div className={clsx("flex flex-col min-w-full h-max pb-8 pr-8", containerWidthClass)}>
          {comparisonResult.blocks.map((block) => {
            const isIgnoredWhitespace = settings.ignoreWhitespace && block.isWhitespaceChange;
            const isSelectable = block.kind !== BlockType.Unchanged && !isIgnoredWhitespace;
            const isHovered = hoveredBlockId === block.id && isSelectable && !block.isSelected;
            return (
              <div
                key={`right-${block.id}`}
                id={`block-split-right-${block.id}`}
                onMouseEnter={() => setHoveredBlockId(block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={isSelectable ? () => selectBlock(block.id) : undefined}
                className={clsx(
                  "flex flex-col border-y-2 border-transparent w-full relative",
                  isSelectable && "cursor-pointer",
                  block.isSelected && isSelectable && "bg-bg-selected border-accent-primary"
                )}
              >
                {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" /> }
                <div className={clsx("flex w-full flex-col relative z-0", getBlockColorClass(block.kind, "new", block.isWhitespaceChange, settings.ignoreWhitespace))}>
                  {block.newLines.map((line, idx) => (
                    <div key={idx} className={clsx("flex min-h-[24px] w-full", line.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
                      <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary border-r border-border-default py-0.5 sticky left-0 z-10">
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
                {block.isSelected && isSelectable && (
                  <div className="flex items-center justify-start w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none">
                    <div className="sticky left-0 flex items-center justify-start px-4 h-full">
                      <button
                        onClick={(e) => { e.stopPropagation(); mergeBlock(block, MergeDirection.RightToLeft, settings); }}
                        className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors"
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
  );
}
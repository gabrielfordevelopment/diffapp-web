"use client";

import { useRef, useState, useMemo } from "react";
import { MdEast, MdWest, MdClose } from "react-icons/md";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getBlockColorClass, getFragmentColorClass } from "@/utils/diffHelpers";
import { MergeDirection } from "@/types/ui";
import { BlockType, DiffChangeType, ChangeBlock } from "@/types/diff";
import { useSyncedScroll } from "@/hooks/useSyncedScroll";
import clsx from "clsx";

interface RowData {
  id: string;
  type: "line" | "controls";
  block: ChangeBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isSelectable: boolean;
}

export function SplitView() {
  const { comparisonResult, selectBlock, mergeBlock } = useEditorStore();
  const { settings } = useSettingsStore();
  
  const wrapScrollRef = useRef<HTMLDivElement>(null);
  const { leftScrollRef, rightScrollRef, handleLeftScroll, handleRightScroll } = useSyncedScroll();

  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [selectionSide, setSelectionSide] = useState<"left" | "right" | null>(null);

  const rows = useMemo(() => {
    const result: Array<RowData> = [ ];
    if (!comparisonResult) return result;

    comparisonResult.blocks.forEach((block) => {
      const isIgnoredWhitespace = settings.ignoreWhitespace && block.isWhitespaceChange;
      const isSelectable = block.kind !== BlockType.Unchanged && !isIgnoredWhitespace;
      const maxLines = Math.max(block.oldLines.length, block.newLines.length);

      if (maxLines === 0) return;

      for (let i = 0; i < maxLines; i++) {
        result.push({
          id: `${block.id}-line-${i}`,
          type: "line",
          block,
          index: i,
          isFirst: i === 0,
          isLast: i === maxLines - 1 && !block.isSelected,
          isSelectable
        });
      }

      if (block.isSelected && isSelectable) {
        result.push({
          id: `${block.id}-controls`,
          type: "controls",
          block,
          index: -1,
          isFirst: false,
          isLast: true,
          isSelectable
        });
      }
    });
    return result;
  }, [comparisonResult, settings.ignoreWhitespace]);

  const maxLineChars = useMemo(() => {
    let max = 0;
    if (!comparisonResult || settings.isWordWrapEnabled) return max;

    comparisonResult.blocks.forEach((block) => {
      block.oldLines.forEach((line) => {
        const len = line.fragments.reduce((acc, f) => acc + f.text.length, 0);
        if (len > max) max = len;
      });
      block.newLines.forEach((line) => {
        const len = line.fragments.reduce((acc, f) => acc + f.text.length, 0);
        if (len > max) max = len;
      });
    });
    return max;
  }, [comparisonResult, settings.isWordWrapEnabled]);

  const wrapVirtualizer = useVirtualizer({
    count: settings.isWordWrapEnabled ? rows.length : 0,
    getScrollElement: () => wrapScrollRef.current,
    estimateSize: () => 24,
    overscan: 10
  });

  const leftVirtualizer = useVirtualizer({
    count: !settings.isWordWrapEnabled ? rows.length : 0,
    getScrollElement: () => leftScrollRef.current,
    estimateSize: () => 24,
    overscan: 10
  });

  const rightVirtualizer = useVirtualizer({
    count: !settings.isWordWrapEnabled ? rows.length : 0,
    getScrollElement: () => rightScrollRef.current,
    estimateSize: () => 24,
    overscan: 10
  });

  if (!comparisonResult) {
    return null;
  }

  const wordWrapClass = settings.isWordWrapEnabled ? "break-all whitespace-pre-wrap w-full" : "whitespace-pre";
  const containerWidthClass = settings.isWordWrapEnabled ? "w-full" : "w-max min-w-full";
  const minWidthStyle = !settings.isWordWrapEnabled && maxLineChars > 0 ? { minWidth: `calc(${maxLineChars}ch + 80px)` } : {};

  const getRowContainerClass = (row: RowData) => {
    return clsx(
      "flex flex-col w-full relative",
      row.isSelectable && "cursor-pointer",
      row.block.isSelected && row.isSelectable && "bg-bg-selected"
    );
  };

  if (settings.isWordWrapEnabled) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-8" ref={wrapScrollRef}>
        <div className="w-full relative" style={{ height: `${wrapVirtualizer.getTotalSize()}px` }}>
          {wrapVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const row = rows[virtualRow.index];
            const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;

            if (row.type === "controls") {
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={wrapVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="flex items-center justify-between w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 px-4 select-none">
                    <div className="flex items-center gap-4 flex-1 justify-end pr-4 border-r border-transparent">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeBlock(row.block, MergeDirection.LeftToRight, settings);
                        }}
                        className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors"
                      >
                        <span>Merge</span>
                        <MdEast />
                      </button>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectBlock(null);
                      }}
                      className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors shrink-0"
                    >
                      <MdClose className="text-xl" />
                    </button>
                    <div className="flex items-center gap-4 flex-1 justify-start pl-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeBlock(row.block, MergeDirection.RightToLeft, settings);
                        }}
                        className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors"
                      >
                        <MdWest />
                        <span>Merge</span>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />
                  </div>
                </div>
              );
            }

            const oldLine = row.block.oldLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };
            const newLine = row.block.newLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={wrapVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                onMouseEnter={() => setHoveredBlockId(row.block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={row.isSelectable ? () => selectBlock(row.block.id) : undefined}
              >
                <div className={getRowContainerClass(row)}>
                  {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" />}
                  {row.isFirst && row.block.isSelected && row.isSelectable && <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />}
                  <div className="flex min-h-[24px] w-full relative z-0">
                    <div
                      onMouseDown={() => setSelectionSide("left")}
                      className={clsx("flex flex-1 w-1/2", getBlockColorClass(row.block.kind, "old", row.block.isWhitespaceChange, settings.ignoreWhitespace), oldLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "right" && "select-none")}
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
                      className={clsx("flex flex-1 w-1/2 border-l border-border-default", getBlockColorClass(row.block.kind, "new", row.block.isWhitespaceChange, settings.ignoreWhitespace), newLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "left" && "select-none")}
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
                </div>
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
        <div className={clsx("relative", containerWidthClass)} style={{ height: `${leftVirtualizer.getTotalSize()}px`, ...minWidthStyle }}>
          {leftVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const row = rows[virtualRow.index];
            const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;

            if (row.type === "controls") {
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={leftVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="flex items-center justify-end w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none">
                    <div className="sticky right-0 flex items-center justify-end gap-4 px-4 h-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeBlock(row.block, MergeDirection.LeftToRight, settings);
                        }}
                        className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors"
                      >
                        <span>Merge</span>
                        <MdEast />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          selectBlock(null);
                        }}
                        className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors"
                      >
                        <MdClose className="text-xl" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />
                  </div>
                </div>
              );
            }

            const oldLine = row.block.oldLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={leftVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                onMouseEnter={() => setHoveredBlockId(row.block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={row.isSelectable ? () => selectBlock(row.block.id) : undefined}
              >
                <div className={getRowContainerClass(row)}>
                  {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" />}
                  {row.isFirst && row.block.isSelected && row.isSelectable && <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />}
                  <div className={clsx("flex w-full flex-col relative z-0", getBlockColorClass(row.block.kind, "old", row.block.isWhitespaceChange, settings.ignoreWhitespace))}>
                    <div className={clsx("flex min-h-[24px] w-full", oldLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
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
                  </div>
                </div>
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
        <div className={clsx("relative pr-8", containerWidthClass)} style={{ height: `${rightVirtualizer.getTotalSize()}px`, ...minWidthStyle }}>
          {rightVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const row = rows[virtualRow.index];
            const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;

            if (row.type === "controls") {
              return (
                <div
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rightVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className="flex items-center justify-start w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none">
                    <div className="sticky left-0 flex items-center justify-start px-4 h-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mergeBlock(row.block, MergeDirection.RightToLeft, settings);
                        }}
                        className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors"
                      >
                        <MdWest />
                        <span>Merge</span>
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />
                  </div>
                </div>
              );
            }

            const newLine = row.block.newLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };

            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={rightVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
                onMouseEnter={() => setHoveredBlockId(row.block.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={row.isSelectable ? () => selectBlock(row.block.id) : undefined}
              >
                <div className={getRowContainerClass(row)}>
                  {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" />}
                  {row.isFirst && row.block.isSelected && row.isSelectable && <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />}
                  <div className={clsx("flex w-full flex-col relative z-0", getBlockColorClass(row.block.kind, "new", row.block.isWhitespaceChange, settings.ignoreWhitespace))}>
                    <div className={clsx("flex min-h-[24px] w-full", newLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg")}>
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
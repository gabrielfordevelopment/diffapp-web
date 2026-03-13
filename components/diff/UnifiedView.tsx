"use client";

import { useRef, useState, useMemo } from "react";
import { MdEast, MdWest, MdClose } from "react-icons/md";
import { useVirtualizer, VirtualItem } from "@tanstack/react-virtual";
import { useEditorStore } from "@/store/useEditorStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { getBlockColorClass, getFragmentColorClass } from "@/utils/diffHelpers";
import { MergeDirection } from "@/types/ui";
import { BlockType, DiffChangeType, TextFragment, ChangeBlock } from "@/types/diff";
import clsx from "clsx";

interface UnifiedLineData {
  line1: number | string | null;
  line2: number | string | null;
  sign: string;
  fragments: Array<TextFragment>;
  bgClass: string;
}

interface RowData {
  id: string;
  type: "line" | "controls";
  block: ChangeBlock;
  lineIndex: number;
  unifiedLine?: UnifiedLineData;
  isFirst: boolean;
  isLast: boolean;
  isSelectable: boolean;
}

export function UnifiedView() {
  const { comparisonResult, selectBlock, mergeBlock } = useEditorStore();
  const { settings } = useSettingsStore();
  const unifiedScrollRef = useRef<HTMLDivElement>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const result: Array<RowData> = [ ];
    if (!comparisonResult) return result;

    comparisonResult.blocks.forEach((block) => {
      const isIgnoredWhitespace = settings.ignoreWhitespace && block.isWhitespaceChange;
      const isSelectable = block.kind !== BlockType.Unchanged && !isIgnoredWhitespace;

      const blockRows: Array<Omit<RowData, "isFirst" | "isLast">> = [ ];

      if (block.kind === BlockType.Modified) {
        block.oldLines.forEach((line, idx) => {
          if (line.kind !== DiffChangeType.Imaginary) {
            blockRows.push({
              id: `${block.id}-old-${idx}`,
              type: "line",
              block,
              lineIndex: idx,
              unifiedLine: {
                line1: line.lineNumber,
                line2: "",
                sign: "-",
                fragments: line.fragments,
                bgClass: getBlockColorClass(BlockType.Removed, "old", block.isWhitespaceChange, settings.ignoreWhitespace)
              },
              isSelectable
            });
          }
        });
        block.newLines.forEach((line, idx) => {
          if (line.kind !== DiffChangeType.Imaginary) {
            blockRows.push({
              id: `${block.id}-new-${idx}`,
              type: "line",
              block,
              lineIndex: idx + block.oldLines.length,
              unifiedLine: {
                line1: "",
                line2: line.lineNumber,
                sign: "+",
                fragments: line.fragments,
                bgClass: getBlockColorClass(BlockType.Added, "new", block.isWhitespaceChange, settings.ignoreWhitespace)
              },
              isSelectable
            });
          }
        });
      } else {
        const maxLines = Math.max(block.oldLines.length, block.newLines.length);
        for (let idx = 0; idx < maxLines; idx++) {
          const oldLine = block.oldLines[idx];
          const newLine = block.newLines[idx];
          const isRemoved = block.kind === BlockType.Removed;
          const isAdded = block.kind === BlockType.Added;

          let bgClass = "bg-transparent";
          if (isRemoved) bgClass = getBlockColorClass(BlockType.Removed, "old", block.isWhitespaceChange, settings.ignoreWhitespace);
          if (isAdded) bgClass = getBlockColorClass(BlockType.Added, "new", block.isWhitespaceChange, settings.ignoreWhitespace);

          blockRows.push({
            id: `${block.id}-line-${idx}`,
            type: "line",
            block,
            lineIndex: idx,
            unifiedLine: {
              line1: oldLine?.lineNumber || "",
              line2: newLine?.lineNumber || "",
              sign: isRemoved ? "-" : isAdded ? "+" : " ",
              fragments: isAdded ? (newLine?.fragments || [ ]) : (oldLine?.fragments || [ ]),
              bgClass
            },
            isSelectable
          });
        }
      }

      const len = blockRows.length;
      blockRows.forEach((r, i) => {
        result.push({
          ...r,
          isFirst: i === 0,
          isLast: i === len - 1 && !block.isSelected
        });
      });

      if (block.isSelected && isSelectable) {
        result.push({
          id: `${block.id}-controls`,
          type: "controls",
          block,
          lineIndex: -1,
          isSelectable,
          isFirst: false,
          isLast: true
        });
      }
    });

    return result;
  }, [comparisonResult, settings.ignoreWhitespace]);

  const maxLineChars = useMemo(() => {
    let max = 0;
    if (!comparisonResult || settings.isWordWrapEnabled) return max;
    
    rows.forEach((row) => {
      if (row.type === "line" && row.unifiedLine) {
        const len = row.unifiedLine.fragments.reduce((acc, f) => acc + f.text.length, 0);
        if (len > max) max = len;
      }
    });
    return max;
  }, [comparisonResult, settings.isWordWrapEnabled, rows]);

  const unifiedVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => unifiedScrollRef.current,
    estimateSize: () => 24,
    overscan: 10
  });

  if (!comparisonResult) {
    return null;
  }

  const wordWrapClass = settings.isWordWrapEnabled ? "break-all whitespace-pre-wrap" : "whitespace-pre";
  const containerWidthClass = settings.isWordWrapEnabled ? "w-full" : "w-max min-w-full";
  const minWidthStyle = !settings.isWordWrapEnabled && maxLineChars > 0 ? { minWidth: `calc(${maxLineChars}ch + 100px)` } : {};

  const getRowContainerClass = (row: RowData) => {
    return clsx(
      "flex flex-col w-full relative",
      row.isSelectable && "cursor-pointer",
      row.block.isSelected && row.isSelectable && "bg-bg-selected"
    );
  };

  return (
    <div className="flex-1 overflow-auto custom-scrollbar" ref={unifiedScrollRef}>
      <div className={clsx("relative pr-8", containerWidthClass)} style={{ height: `${unifiedVirtualizer.getTotalSize()}px`, ...minWidthStyle }}>
        {unifiedVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const row = rows[virtualRow.index];
          const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;

          if (row.type === "controls") {
            return (
              <div
                key={row.id}
                data-index={virtualRow.index}
                ref={unifiedVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div className="flex items-center justify-center w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none">
                  <div className="sticky left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 px-4 h-full w-max">
                    <button
                      onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.LeftToRight, settings); }}
                      className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors"
                    >
                      <span>Merge</span>
                      <MdEast />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); selectBlock(null); }}
                      className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors mx-2"
                    >
                      <MdClose className="text-xl" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.RightToLeft, settings); }}
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

          const l = row.unifiedLine!;

          return (
            <div
              key={row.id}
              data-index={virtualRow.index}
              ref={unifiedVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
              onMouseEnter={() => setHoveredBlockId(row.block.id)}
              onMouseLeave={() => setHoveredBlockId(null)}
              onClick={row.isSelectable ? () => selectBlock(row.block.id) : undefined}
            >
              <div className={getRowContainerClass(row)}>
                {isHovered && <div className="absolute inset-0 bg-hover-overlay pointer-events-none z-10" />}
                {row.isFirst && row.block.isSelected && row.isSelectable && <div className="absolute top-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />}
                <div className="flex w-full flex-col relative z-0">
                  <div className={clsx("flex min-h-[24px] w-full", l.bgClass)}>
                    <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary py-0.5 sticky left-0 z-10">
                      {l.line1}
                    </div>
                    <div className="w-10 shrink-0 select-none bg-bg-secondary px-2 text-right text-text-secondary border-r border-border-default py-0.5 sticky left-[40px] z-10">
                      {l.line2}
                    </div>
                    <div className="w-6 shrink-0 select-none px-1 text-center font-bold text-text-secondary py-0.5 sticky left-[80px] z-10 bg-bg-secondary">
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
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
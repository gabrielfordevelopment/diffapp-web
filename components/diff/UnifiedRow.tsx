import React, { memo } from "react";
import { VirtualItem } from "@tanstack/react-virtual";
import { MdEast, MdWest, MdClose } from "react-icons/md";
import { ChangeBlock, TextFragment } from "@/types/diff";
import { MergeDirection } from "@/types/ui";
import { AppSettings } from "@/types/settings";
import { getFragmentColorClass } from "@/utils/diffHelpers";
import clsx from "clsx";

export interface UnifiedLineData {
  line1: number | string | null;
  line2: number | string | null;
  sign: string;
  fragments: Array<TextFragment>;
  bgClass: string;
}

export interface UnifiedRowData {
  id: string;
  type: "line" | "controls";
  block: ChangeBlock;
  lineIndex: number;
  unifiedLine?: UnifiedLineData;
  isFirst: boolean;
  isLast: boolean;
  isSelectable: boolean;
}

interface UnifiedRowProps {
  row: UnifiedRowData;
  virtualRow: VirtualItem;
  settings: AppSettings;
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
  selectBlock: (id: string | null) => void;
  mergeBlock: (block: ChangeBlock, dir: MergeDirection, settings: AppSettings) => void;
  measureRef: (node: HTMLElement | null) => void;
}

export const UnifiedRow = memo(({ row, virtualRow, settings, hoveredBlockId, setHoveredBlockId, selectBlock, mergeBlock, measureRef }: UnifiedRowProps) => {
  const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;
  const wordWrapClass = settings.isWordWrapEnabled ? "break-all whitespace-pre-wrap" : "whitespace-pre";

  const containerClass = clsx(
    "flex flex-col w-full relative",
    row.isSelectable && "cursor-pointer",
    row.block.isSelected && row.isSelectable && "bg-bg-selected"
  );

  if (row.type === "controls") {
    return (
      <div
        data-index={virtualRow.index}
        ref={measureRef}
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
      data-index={virtualRow.index}
      ref={measureRef}
      className="absolute top-0 left-0 w-full"
      style={{ transform: `translateY(${virtualRow.start}px)` }}
      onMouseEnter={() => setHoveredBlockId(row.block.id)}
      onMouseLeave={() => setHoveredBlockId(null)}
      onClick={row.isSelectable ? () => selectBlock(row.block.id) : undefined}
    >
      <div className={containerClass}>
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
});
UnifiedRow.displayName = "UnifiedRow";
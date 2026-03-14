import React, { memo } from "react";
import { VirtualItem } from "@tanstack/react-virtual";
import { MdEast, MdWest, MdClose } from "react-icons/md";
import { ChangeBlock, DiffChangeType } from "@/types/diff";
import { MergeDirection } from "@/types/ui";
import { AppSettings } from "@/types/settings";
import { getBlockColorClass, getFragmentColorClass } from "@/utils/diffHelpers";
import clsx from "clsx";

export interface SplitRowData {
  id: string;
  type: "line" | "controls";
  block: ChangeBlock;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  isSelectable: boolean;
}

interface SplitRowProps {
  row: SplitRowData;
  virtualRow: VirtualItem;
  settings: AppSettings;
  hoveredBlockId: string | null;
  setHoveredBlockId: (id: string | null) => void;
  selectBlock: (id: string | null) => void;
  mergeBlock: (block: ChangeBlock, dir: MergeDirection, settings: AppSettings) => void;
  selectionSide: "left" | "right" | null;
  setSelectionSide: (side: "left" | "right" | null) => void;
  renderMode: "wrap" | "left" | "right";
  measureRef: (node: HTMLElement | null) => void;
}

export const SplitRow = memo(({ row, virtualRow, settings, hoveredBlockId, setHoveredBlockId, selectBlock, mergeBlock, selectionSide, setSelectionSide, renderMode, measureRef }: SplitRowProps) => {
  const isHovered = hoveredBlockId === row.block.id && row.isSelectable && !row.block.isSelected;
  const wordWrapClass = settings.isWordWrapEnabled ? "break-all whitespace-pre-wrap w-full" : "whitespace-pre";

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
        <div className={clsx("flex items-center w-full min-w-full border-t border-accent-primary bg-bg-selected relative h-12 z-20 select-none", renderMode === "wrap" ? "justify-between px-4" : renderMode === "left" ? "justify-end" : "justify-start")}>
          {renderMode === "wrap" && (
            <>
              <div className="flex items-center gap-4 flex-1 justify-end pr-4 border-r border-transparent">
                <button onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.LeftToRight, settings); }} className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors">
                  <span>Merge</span><MdEast />
                </button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); selectBlock(null); }} className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors shrink-0">
                <MdClose className="text-xl" />
              </button>
              <div className="flex items-center gap-4 flex-1 justify-start pl-4">
                <button onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.RightToLeft, settings); }} className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors">
                  <MdWest /><span>Merge</span>
                </button>
              </div>
            </>
          )}
          {renderMode === "left" && (
            <div className="sticky right-0 flex items-center justify-end gap-4 px-4 h-full">
              <button onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.LeftToRight, settings); }} className="flex items-center gap-2 rounded bg-danger px-4 py-1.5 text-sm font-semibold text-white hover:bg-danger-hover transition-colors">
                <span>Merge</span><MdEast />
              </button>
              <button onClick={(e) => { e.stopPropagation(); selectBlock(null); }} className="rounded p-1 text-text-secondary hover:bg-hover-overlay transition-colors">
                <MdClose className="text-xl" />
              </button>
            </div>
          )}
          {renderMode === "right" && (
            <div className="sticky left-0 flex items-center justify-start px-4 h-full">
              <button onClick={(e) => { e.stopPropagation(); mergeBlock(row.block, MergeDirection.RightToLeft, settings); }} className="flex items-center gap-2 rounded bg-success px-4 py-1.5 text-sm font-semibold text-white hover:bg-success-hover transition-colors">
                <MdWest /><span>Merge</span>
              </button>
            </div>
          )}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary z-20 pointer-events-none" />
        </div>
      </div>
    );
  }

  const oldLine = row.block.oldLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };
  const newLine = row.block.newLines[row.index] || { lineNumber: null, kind: DiffChangeType.Imaginary, fragments: [ ] };

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
        <div className="flex min-h-[24px] w-full relative z-0">
          {(renderMode === "wrap" || renderMode === "left") && (
            <div
              onMouseDown={() => setSelectionSide("left")}
              className={clsx("flex flex-1", renderMode === "wrap" ? "w-1/2" : "w-full flex-col z-0", getBlockColorClass(row.block.kind, "old", row.block.isWhitespaceChange, settings.ignoreWhitespace), oldLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "right" && "select-none")}
            >
              <div className="flex min-h-[24px] w-full">
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
          )}
          
          {(renderMode === "wrap" || renderMode === "right") && (
            <div
              onMouseDown={() => setSelectionSide("right")}
              className={clsx("flex flex-1", renderMode === "wrap" ? "w-1/2 border-l border-border-default" : "w-full flex-col z-0", getBlockColorClass(row.block.kind, "new", row.block.isWhitespaceChange, settings.ignoreWhitespace), newLine.kind === DiffChangeType.Imaginary && "bg-diff-empty-bg", selectionSide === "left" && "select-none")}
            >
              <div className="flex min-h-[24px] w-full">
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
          )}
        </div>
      </div>
    </div>
  );
});
SplitRow.displayName = "SplitRow";
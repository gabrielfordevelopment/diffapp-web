"use client";

import { useMemo } from "react";
import { BlockType, ChangeBlock } from "../types";
import clsx from "clsx";

interface DiffMinimapProps {
  blocks: Array<ChangeBlock>;
  ignoreWhitespace: boolean;
  onScrollRequest: (percentage: number) => void;
}

export function DiffMinimap({ blocks, ignoreWhitespace, onScrollRequest }: DiffMinimapProps) {
  const segments = useMemo(() => {
    let totalHeight = 0;

    for (let i = 0; i < blocks.length; i++) {
      totalHeight += Math.max(blocks[i].oldLines.length, blocks[i].newLines.length);
    }

    if (totalHeight === 0) {
      totalHeight = 1;
    }

    let currentIndex = 0;
    const result = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const height = Math.max(block.oldLines.length, block.newLines.length);

      if (block.kind !== BlockType.Unchanged) {
        if (!(ignoreWhitespace && block.isWhitespaceChange)) {
          const offsetPct = (currentIndex / totalHeight) * 100;
          let heightPct = (height / totalHeight) * 100;

          if (heightPct < 0.5) {
            heightPct = 0.5;
          }

          result.push({
            id: block.id,
            offsetPct,
            heightPct,
            kind: block.kind
          });
        }
      }
      currentIndex += height;
    }

    return result;
  }, [blocks, ignoreWhitespace]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = y / rect.height;
    onScrollRequest(percentage);
  };

  const getLeftColor = (kind: BlockType) => {
    if (kind === BlockType.Removed || kind === BlockType.Modified) return "bg-[#f5a4a4]";
    return "bg-transparent";
  };

  const getRightColor = (kind: BlockType) => {
    if (kind === BlockType.Added || kind === BlockType.Modified) return "bg-[#8fe3c7]";
    return "bg-transparent";
  };

  return (
    <div
      className="w-10 shrink-0 bg-[#F6F8FA] border-l border-r border-gray-300 relative cursor-pointer mr-1"
      onClick={handleTrackClick}
    >
      {segments.map((seg) => (
        <div
          key={seg.id}
          className="absolute w-full flex opacity-80 hover:opacity-100 transition-opacity"
          style={{ top: `${seg.offsetPct}%`, height: `${seg.heightPct}%` }}
        >
          <div className={clsx("flex-1 border-r border-gray-200/50", getLeftColor(seg.kind))} />
          <div className={clsx("flex-1", getRightColor(seg.kind))} />
        </div>
      ))}
    </div>
  );
}
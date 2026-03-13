"use client";

import { useMemo } from "react";
import { BlockType, ChangeBlock } from "../types/diff";
import clsx from "clsx";

interface DiffMinimapProps {
  blocks: Array<ChangeBlock>;
  ignoreWhitespace: boolean;
  onSegmentClick: (blockId: string) => void;
}

export function DiffMinimap({ blocks, ignoreWhitespace, onSegmentClick }: DiffMinimapProps) {
  const segments = useMemo(() => {
    let totalHeight = 0;

    for (let i = 0; i < blocks.length; i++) {
      totalHeight += Math.max(blocks[i].oldLines.length, blocks[i].newLines.length);
    }

    if (totalHeight === 0) {
      totalHeight = 1;
    }

    let currentIndex = 0;
    const result = [ ];

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

  const getLeftColor = (kind: BlockType) => {
    if (kind === BlockType.Removed || kind === BlockType.Modified) return "bg-minimap-removed";
    if (kind === BlockType.Added) return "bg-minimap-empty";
    return "bg-transparent";
  };

  const getRightColor = (kind: BlockType) => {
    if (kind === BlockType.Added || kind === BlockType.Modified) return "bg-minimap-added";
    if (kind === BlockType.Removed) return "bg-minimap-empty";
    return "bg-transparent";
  };

  return (
    <div className="h-full w-6 shrink-0 bg-bg-secondary border-l border-r border-border-default relative cursor-default">
      {segments.map((seg) => (
        <div
          key={seg.id}
          onClick={(e) => {
            e.stopPropagation();
            onSegmentClick(seg.id);
          }}
          className="absolute w-full flex opacity-80 hover:opacity-100 transition-opacity cursor-pointer z-40"
          style={{ top: `${seg.offsetPct}%`, height: `${seg.heightPct}%` }}
        >
          <div className={clsx("flex-1 border-r border-border-default", getLeftColor(seg.kind))} />
          <div className={clsx("flex-1", getRightColor(seg.kind))} />
        </div>
      ))}
    </div>
  );
}
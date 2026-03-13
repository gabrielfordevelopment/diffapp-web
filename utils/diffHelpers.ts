import { BlockType, ChangeBlock, DiffChangeType } from "../types/diff";

export function getBlockColorClass(kind: BlockType, side: "old" | "new", isWhitespaceChange: boolean, ignoreWhitespace: boolean): string {
  if (ignoreWhitespace && isWhitespaceChange) {
    return "bg-transparent";
  }

  if (kind === BlockType.Modified) {
    return side === "old" ? "bg-diff-removed-bg" : "bg-diff-added-bg";
  }

  if (kind === BlockType.Added) {
    return side === "new" ? "bg-diff-added-bg" : "bg-diff-empty-bg";
  }

  if (kind === BlockType.Removed) {
    return side === "old" ? "bg-diff-removed-bg" : "bg-diff-empty-bg";
  }

  return "bg-transparent";
}

export function getFragmentColorClass(kind: DiffChangeType, isWhitespaceChange: boolean, ignoreWhitespace: boolean): string {
  if (ignoreWhitespace && isWhitespaceChange) {
    return "bg-transparent text-text-primary";
  }

  if (kind === DiffChangeType.Inserted) {
    return "bg-diff-added-fg text-text-primary";
  }

  if (kind === DiffChangeType.Deleted) {
    return "bg-diff-removed-fg text-text-primary";
  }

  return "bg-transparent text-text-primary";
}

export function calculateStats(blocks: Array<ChangeBlock> | undefined, ignoreWhitespace: boolean) {
  let removals = 0;
  let additions = 0;

  if (!blocks) {
    return { removals, additions };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[ i ];

    if (ignoreWhitespace && block.isWhitespaceChange) {
      continue;
    }

    if (block.kind === BlockType.Removed || block.kind === BlockType.Modified) {
      removals += block.oldLines.length;
    }

    if (block.kind === BlockType.Added || block.kind === BlockType.Modified) {
      additions += block.newLines.length;
    }
  }

  return { removals, additions };
}
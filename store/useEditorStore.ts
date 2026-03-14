import { create } from "zustand";
import { ComparisonResult, ChangeBlock } from "@/types/diff";
import { CompareSettings } from "@/types/settings";
import { MergeDirection } from "@/types/ui";
import { ComparisonService } from "@/services/comparisonService";
import { MergeService } from "@/services/mergeService";
import { HistoryService } from "@/services/historyService";
import { useEditorUIStore } from "@/store/useEditorUIStore";

interface EditorState {
  leftText: string;
  rightText: string;
  comparisonResult: ComparisonResult | null;
  setLeftText: (text: string) => void;
  setRightText: (text: string) => void;
  swapTexts: (settings: CompareSettings) => void;
  clearContent: () => void;
  compare: (settings: CompareSettings, saveToHistory: boolean, preserveInputState?: boolean) => Promise<void>;
  selectBlock: (blockId: string | null) => void;
  mergeBlock: (block: ChangeBlock, direction: MergeDirection, settings: CompareSettings) => void;
  loadFromHistory: (left: string, right: string, settings: CompareSettings) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  leftText: "",
  rightText: "",
  comparisonResult: null,

  setLeftText: (text: string) => set({ leftText: text }),

  setRightText: (text: string) => set({ rightText: text }),

  swapTexts: (settings: CompareSettings) => {
    const { leftText, rightText, comparisonResult } = get();
    set({ leftText: rightText, rightText: leftText });

    if (comparisonResult) {
      get().compare(settings, true, true);
    }
  },

  clearContent: () => {
    set({
      leftText: "",
      rightText: "",
      comparisonResult: null
    });
    useEditorUIStore.getState().setIsInputExpanded(true);
  },

  compare: async (settings: CompareSettings, saveToHistory: boolean, preserveInputState: boolean = false) => {
    const { leftText, rightText } = get();
    const uiStore = useEditorUIStore.getState();

    uiStore.setIsComparing(true);
    const result = ComparisonService.compare(leftText, rightText, settings);

    set({
      comparisonResult: result
    });
    
    uiStore.setIsInputExpanded(preserveInputState ? uiStore.isInputExpanded : false);
    uiStore.setIsComparing(false);

    if (saveToHistory && (leftText || rightText)) {
      await HistoryService.addAsync(leftText, rightText);
    }
  },

  selectBlock: (blockId: string | null) => {
    const currentResult = get().comparisonResult;
    if (!currentResult) {
      return;
    }

    const updatedBlocks = currentResult.blocks.map(b => ({
      ...b,
      isSelected: b.id === blockId
    }));

    set({
      comparisonResult: { blocks: updatedBlocks }
    });
  },

  mergeBlock: (block: ChangeBlock, direction: MergeDirection, settings: CompareSettings) => {
    const { leftText, rightText } = get();
    let newLeft = leftText;
    let newRight = rightText;

    if (direction === MergeDirection.LeftToRight) {
      newRight = MergeService.mergeBlock(rightText, block, direction);
    } else {
      newLeft = MergeService.mergeBlock(leftText, block, direction);
    }

    set({ leftText: newLeft, rightText: newRight });

    get().compare(settings, false, true);
  },

  loadFromHistory: async (left: string, right: string, settings: CompareSettings) => {
    set({ leftText: left, rightText: right });
    await get().compare(settings, false);
  }
}));
import { create } from "zustand";
import { ComparisonResult, ChangeBlock } from "../types/diff";
import { CompareSettings } from "../types/settings";
import { MergeDirection } from "../types/ui";
import { ComparisonService } from "../services/comparisonService";
import { MergeService } from "../services/mergeService";
import { HistoryService } from "../services/historyService";

interface EditorState {
  leftText: string;
  rightText: string;
  comparisonResult: ComparisonResult | null;
  isInputExpanded: boolean;
  isComparing: boolean;
  setLeftText: (text: string) => void;
  setRightText: (text: string) => void;
  swapTexts: (settings: CompareSettings) => void;
  clearContent: () => void;
  compare: (settings: CompareSettings, saveToHistory: boolean, preserveInputState?: boolean) => Promise<void>;
  selectBlock: (blockId: string | null) => void;
  mergeBlock: (block: ChangeBlock, direction: MergeDirection, settings: CompareSettings) => void;
  toggleInputPanel: () => void;
  loadFromHistory: (left: string, right: string, settings: CompareSettings) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  leftText: "",
  rightText: "",
  comparisonResult: null,
  isInputExpanded: true,
  isComparing: false,

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
      comparisonResult: null,
      isInputExpanded: true
    });
  },

  toggleInputPanel: () => {
    set((state) => ({ isInputExpanded: !state.isInputExpanded }));
  },

  compare: async (settings: CompareSettings, saveToHistory: boolean, preserveInputState: boolean = false) => {
    const { leftText, rightText, isInputExpanded } = get();

    set({ isComparing: true });

    const result = ComparisonService.compare(leftText, rightText, settings);

    set({
      comparisonResult: result,
      isInputExpanded: preserveInputState ? isInputExpanded : false,
      isComparing: false
    });

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
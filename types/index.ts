export enum BlockType {
  Unchanged = "Unchanged",
  Added = "Added",
  Removed = "Removed",
  Modified = "Modified"
}

export enum DiffChangeType {
  Unchanged = "Unchanged",
  Inserted = "Inserted",
  Deleted = "Deleted",
  Modified = "Modified",
  Imaginary = "Imaginary"
}

export enum ViewMode {
  Split = "Split",
  Unified = "Unified"
}

export enum PrecisionLevel {
  Word = "Word",
  Character = "Character"
}

export enum Side {
  Old = "Old",
  New = "New"
}

export enum MergeDirection {
  LeftToRight = "LeftToRight",
  RightToLeft = "RightToLeft"
}

export enum DialogButtons {
  Ok = "Ok",
  YesNo = "YesNo",
  ConfirmCancel = "ConfirmCancel"
}

export enum DialogResult {
  None = "None",
  Ok = "Ok",
  Yes = "Yes",
  No = "No",
  Confirm = "Confirm",
  Cancel = "Cancel"
}

export enum DialogImage {
  None = "None",
  Information = "Information",
  Question = "Question",
  Warning = "Warning",
  Error = "Error"
}

export interface TextFragment {
  kind: DiffChangeType;
  text: string;
  isWhitespaceChange: boolean;
}

export interface ChangeLine {
  fragments: Array<TextFragment>;
  lineNumber: number | null;
  kind: DiffChangeType;
  isInModifiedBlock: boolean;
}

export interface ChangeBlock {
  id: string;
  kind: BlockType;
  oldLines: Array<ChangeLine>;
  newLines: Array<ChangeLine>;
  startIndexOld: number;
  startIndexNew: number;
  isWhitespaceChange: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}

export interface ComparisonResult {
  blocks: Array<ChangeBlock>;
}

export interface CompareSettings {
  ignoreWhitespace: boolean;
  precision: PrecisionLevel;
}

export interface AppSettings {
  isWordWrapEnabled: boolean;
  ignoreWhitespace: boolean;
  precision: PrecisionLevel;
  viewMode: ViewMode;
  fontSize: number;
  isSettingsPanelOpen: boolean;
}

export interface DiffHistoryItem {
  id: string;
  originalText: string;
  modifiedText: string;
  createdAt: string;
  isBookmarked: boolean;
}

export interface MinimapSegment {
  offsetPercentage: number;
  heightPercentage: number;
  leftType: BlockType;
  rightType: BlockType;
  targetLineIndex: number;
  block: ChangeBlock;
}
import Dexie, { type Table } from "dexie";
import { DiffHistoryItem } from "../types/history";

export class DiffAppDatabase extends Dexie {
  history!: Table<DiffHistoryItem, string>;

  constructor() {
    super("DiffAppDatabase");
    this.version(1).stores({
      history: "id, createdAt, isBookmarked"
    });
  }
}

export const db = new DiffAppDatabase();
"use client";

import { useEffect } from "react";
import { MdHistory, MdDelete, MdHistoryToggleOff, MdArrowForward, MdBookmark, MdBookmarkBorder } from "react-icons/md";
import { useHistoryStore } from "../store/useHistoryStore";
import { useEditorStore } from "../store/useEditorStore";
import { useAppStore } from "../store/useAppStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { getLineCount, generatePreviewLines, getRelativeTime } from "../utils/formatters";
import clsx from "clsx";

export function HistoryView() {
  const { items, loadHistory, deleteItem, deleteAll, toggleBookmark } = useHistoryStore();
  const loadFromHistory = useEditorStore((state) => state.loadFromHistory);
  const navigate = useAppStore((state) => state.navigate);
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    loadHistory();
  },[ loadHistory ]);

  const handleRestore = async (original: string, modified: string) => {
    await loadFromHistory(original, modified, settings);
    navigate("editor");
  };

  const handleDeleteAll = async () => {
    if (window.confirm("You are about to delete the whole history database. Are you sure?")) {
      await deleteAll();
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Delete this item?")) {
      await deleteItem(id);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.stopPropagation();
    await toggleBookmark(id, currentStatus);
  };

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-300 bg-background-ui px-6 py-4">
        <div className="flex items-center gap-3">
          <MdHistory className="text-2xl text-gray-500" />
          <h2 className="text-xl font-bold text-gray-900">History</h2>
        </div>
        {items.length > 0 && (
          <button
         
            onClick={handleDeleteAll}
            className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            title="Clear all history"
          >
            <MdDelete className="text-lg" />
            Delete All
          </button>
        )}
     
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <MdHistoryToggleOff className="mb-4 text-6xl text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-500">No history yet</h3>
            <p className="mt-1 text-sm text-gray-400">Comparisons will appear here automatically.</p>
          </div>
 
        ) : (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRestore(item.originalText, item.modifiedText)}
            
                className={clsx(
                  "group relative flex cursor-pointer flex-col overflow-hidden rounded-md border bg-white p-4 shadow-sm transition-all hover:border-blue-600 hover:shadow-md",
                  item.isBookmarked ?
                    "border-blue-400" : "border-gray-200"
                )}
              >
                {item.isBookmarked && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/10 pointer-events-none" />
                )}

         
                <div className="relative flex items-center justify-between">
                  <span className="min-w-[70px] truncate text-xs font-bold text-blue-600">
                    {getRelativeTime(item.createdAt)}
                  </span>

                  <div className="mx-4 flex flex-1 items-center gap-4 overflow-hidden">
    
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="mb-1 text-[11px] font-semibold text-red-600">
                        {getLineCount(item.originalText)} lines
                      </span>
       
                      <div className="flex flex-col gap-0.5 rounded bg-background-ui px-3 py-2">
                        {generatePreviewLines(item.originalText).map((line, idx) => (
                          <span key={idx} className="truncate font-mono text-xs text-gray-500">
                    
                            {line}
                          </span>
                        ))}
                      </div>
                    
                    </div>

                    <MdArrowForward className="text-lg shrink-0 text-gray-400" />

                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="mb-1 text-[11px] font-semibold text-green-600">
                        {getLineCount(item.modifiedText)} lines
 
                      </span>
                      <div className="flex flex-col gap-0.5 rounded bg-background-ui px-3 py-2">
                        {generatePreviewLines(item.modifiedText).map((line, idx) => (
                       
                          <span key={idx} className="truncate font-mono text-xs font-semibold text-gray-800">
                            {line}
                          </span>
                        ))}
             
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
           
                      onClick={(e) => handleToggleBookmark(e, item.id, item.isBookmarked)}
                      className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600"
                      title="Bookmark this item"
                    >
              
                      {item.isBookmarked ?
                        (
                          <MdBookmark className="text-2xl text-blue-600" />
                        ) : (
                          <MdBookmarkBorder className="text-2xl" />
                        )}
 
                    </button>
                    <button
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
         
                      title="Delete this item"
                    >
                      <MdDelete className="text-2xl" />
                    </button>
                  </div>
   
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
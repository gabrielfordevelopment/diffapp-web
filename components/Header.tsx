"use client";

import { MdDifference } from "react-icons/md";
import { useAppStore } from "../store/useAppStore";
import clsx from "clsx";

export function Header() {
  const currentView = useAppStore((state) => state.currentView);
  const navigate = useAppStore((state) => state.navigate);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-300 bg-white px-6">
      <div className="flex items-center gap-3">
        <MdDifference className="text-2xl text-blue-600" />
        <h1 className="text-lg font-bold text-gray-900">DiffApp</h1>
      </div>
      <nav className="flex items-center gap-2 h-full">
        <button
          onClick={() => navigate("editor")}
          className={clsx(
            "flex h-full items-center px-4 text-sm font-semibold transition-colors relative",
            currentView === "editor" ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
          )}
        >
          Editor
          {currentView === "editor" && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" />
          )}
        </button>
        <button
          onClick={() => navigate("history")}
          className={clsx(
            "flex h-full items-center px-4 text-sm font-semibold transition-colors relative",
            currentView === "history" ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
          )}
        >
          History
          {currentView === "history" && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" />
          )}
        </button>
      </nav>
    </header>
  );
}
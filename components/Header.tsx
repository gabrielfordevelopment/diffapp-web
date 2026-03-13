"use client";

import { MdDifference } from "react-icons/md";
import { useAppStore } from "../store/useAppStore";
import clsx from "clsx";

export function Header() {
  const currentView = useAppStore((state) => state.currentView);
  const navigate = useAppStore((state) => state.navigate);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-default bg-bg-primary px-6">
      <div className="flex items-center gap-3">
        <MdDifference className="text-2xl text-accent-primary" />
        <h1 className="text-lg font-bold text-text-primary">DiffApp</h1>
      </div>
      <nav className="flex items-center gap-2 h-full">
        <button
          onClick={() => navigate("editor")}
          className={clsx(
            "flex h-full items-center px-4 text-sm font-semibold transition-colors relative",
            currentView === "editor" ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
          )}
        >
          Editor
          {currentView === "editor" && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-accent-primary" />
          )}
        </button>
        <button
          onClick={() => navigate("history")}
          className={clsx(
            "flex h-full items-center px-4 text-sm font-semibold transition-colors relative",
            currentView === "history" ? "text-accent-primary" : "text-text-secondary hover:text-accent-primary"
          )}
        >
          History
          {currentView === "history" && (
            <span className="absolute bottom-0 left-0 h-1 w-full bg-accent-primary" />
          )}
        </button>
      </nav>
    </header>
  );
}
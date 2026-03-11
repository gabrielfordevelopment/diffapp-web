"use client";

import { Header } from "../components/Header";
import { EditorView } from "../components/EditorView";
import { HistoryView } from "../components/HistoryView";
import { useAppStore } from "../store/useAppStore";

export default function Home() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50">
      <Header />
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {currentView === "editor" ? <EditorView /> : <HistoryView />}
      </main>
    </div>
  );
}
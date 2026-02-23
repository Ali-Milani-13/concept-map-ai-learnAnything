import { useState, useEffect } from "react";
import { HistoryItem } from "../../../types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aiMapHistory");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHistory(JSON.parse(saved));
      } catch (e: unknown) {
        console.error("Failed to parse local history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("aiMapHistory", JSON.stringify(history));
    }
  }, [history, isLoaded]);

  const addHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const clearHistory = () => setHistory([]);

  const updateHistoryItem = (id: string, updates: Partial<HistoryItem>) => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    );
  };

  return {
    history,
    setHistory,
    isLoaded,
    addHistoryItem,
    deleteHistoryItem,
    clearHistory,
    updateHistoryItem,
  };
}

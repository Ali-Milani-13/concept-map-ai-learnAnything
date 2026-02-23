import { Node, Edge } from "@xyflow/react";
import { HistoryItem } from "../../../types";

export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  bg: string;
  color: string;
  border: string;
  edge: string;
  edgeLabel: string;
  bgClass: string;
}

export interface UseMapThemeHandlersProps {
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

export interface UseMapHistoryHandlersProps {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  theme: ThemeMode;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  currentMapId: string | null;
  setCurrentMapId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentTopic: React.Dispatch<React.SetStateAction<string>>;
  setPreFormatState: React.Dispatch<React.SetStateAction<{ nodes: Node[]; edges: Edge[] } | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  setIsHistoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLegend: React.Dispatch<React.SetStateAction<boolean>>;
  updateHistoryItem: (id: string, updates: Partial<HistoryItem>) => void;
  clearHistory: () => void;
  handleDeleteAllCloud: () => Promise<void>;
  deleteSingleMapFromCloud: (prompt: string) => Promise<void>;
}

export interface UseMapGenerationHandlersProps {
  theme: ThemeMode;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setCurrentMapId: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentTopic: React.Dispatch<React.SetStateAction<string>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  setShowLegend: React.Dispatch<React.SetStateAction<boolean>>;
  setPreFormatState: React.Dispatch<React.SetStateAction<{ nodes: Node[]; edges: Edge[] } | null>>;
  setGlobalError: React.Dispatch<React.SetStateAction<string | null>>;
  addHistoryItem: (item: HistoryItem) => void;
  pushNewMapToCloud: (item: HistoryItem) => void;
}
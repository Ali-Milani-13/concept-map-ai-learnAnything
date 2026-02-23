import { useState, useCallback } from "react";
import { Node } from "@xyflow/react";

import { useHistory } from "../../history/hooks/useHistory";
import { useAiGeneration } from "../../ai/hooks/useAiGeneration";
import { useMapSync } from "./useMapSync";
import { useMapLayout, ThemeMode } from "./useMapLayout"; // Adjust if you moved ThemeMode to ../types

import { useMapThemeHandlers } from "./useMapThemeHandlers";
import { useMapHistoryHandlers } from "./useMapHistoryHandlers";
import { useMapGenerationHandlers } from "./useMapGenerationHandlers";

export function useMapOrchestrator() {
  // 1. Root UI State
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 2. Core Domain Hooks
  const { history, setHistory, isLoaded, addHistoryItem, updateHistoryItem, clearHistory } = useHistory();
  
  const { 
    user, isSyncing, syncError, setSyncError, 
    isAuthModalOpen, setIsAuthModalOpen, 
    handleAuthSuccess, handleLogout, handleDeleteAllCloud, 
    deleteSingleMapFromCloud, pushNewMapToCloud // <-- FIXED: Added missing extraction here
  } = useMapSync({ history, setHistory });

  const {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange, onConnect,
    setReactFlowInstance, preFormatState, setPreFormatState,
    handleOrganizeMap, handleExportSVG, hasMap
  } = useMapLayout(theme, currentTopic);

  // 3. Extracted Event Handlers
  const { toggleTheme } = useMapThemeHandlers({ theme, setTheme, setNodes, setEdges });

  const { 
    loadMapFromHistory, deleteMapFromHistoryHandler, deleteAllHistoryHandler, saveExplanation, saveSubMap 
  } = useMapHistoryHandlers({
    history, setHistory, theme, setNodes, setEdges, currentMapId, setCurrentMapId, 
    setCurrentTopic, setPreFormatState, setSelectedNode, setIsHistoryOpen, 
    setShowLegend, updateHistoryItem, clearHistory, handleDeleteAllCloud, deleteSingleMapFromCloud
  });

  const { onGenerationSuccess, handleGenerateTrigger } = useMapGenerationHandlers({
    theme, setNodes, setEdges, setCurrentMapId, setCurrentTopic, setSelectedNode, 
    setShowLegend, setPreFormatState, setGlobalError, addHistoryItem, pushNewMapToCloud
  });

  const { generateMap, isGenerating, progress } = useAiGeneration({
    onSuccess: onGenerationSuccess,
    onError: setGlobalError
  });

  // Basic Interactions
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => setSelectedNode(node), []);
  const onPaneClick = useCallback(() => setSelectedNode(null), []);

  const activeHistoryItem = history.find((h) => h.id === currentMapId);
  const displayError = globalError || syncError;

  // 4. Return Flat Interface for MapCanvas
  return {
    theme, toggleTheme,
    selectedNode, setSelectedNode, onNodeClick, onPaneClick,
    currentTopic, showLegend, setShowLegend,
    isHistoryOpen, setIsHistoryOpen, currentMapId,
    globalError, setGlobalError, displayError,
    history, isLoaded, activeHistoryItem,
    user, isSyncing, syncError, setSyncError,
    isAuthModalOpen, setIsAuthModalOpen,
    nodes, onNodesChange, edges, onEdgesChange, onConnect,
    hasMap, preFormatState, setReactFlowInstance,
    isGenerating, progress,
    handleGenerateTrigger: (prompt: string) => handleGenerateTrigger(prompt, generateMap),
    loadMapFromHistory, deleteMapFromHistoryHandler, deleteAllHistoryHandler,
    saveExplanation, saveSubMap,
    handleOrganizeMap, handleExportSVG,
    handleAuthSuccess, handleLogout
  };
}
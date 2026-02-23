import { useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import { THEMES } from "./useMapLayout";
import { formatHistoryData } from "../utils/flowMapper";
import { UseMapHistoryHandlersProps } from "../types";

export function useMapHistoryHandlers({
  history, setHistory, theme, setNodes, setEdges, currentMapId, setCurrentMapId, 
  setCurrentTopic, setPreFormatState, setSelectedNode, setIsHistoryOpen, 
  setShowLegend, updateHistoryItem, clearHistory, handleDeleteAllCloud
}: UseMapHistoryHandlersProps) {

  const loadMapFromHistory = useCallback((id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      setPreFormatState(null);
      const { nodes: themedNodes, edges: themedEdges } = formatHistoryData(item, THEMES[theme]);

      setNodes(themedNodes);
      setEdges(themedEdges);
      setCurrentTopic(item.prompt);
      setCurrentMapId(item.id);
      setSelectedNode(null);
      setIsHistoryOpen(false);
      setShowLegend(true);
    }
  }, [history, theme, setNodes, setEdges, setCurrentTopic, setCurrentMapId, setSelectedNode, setIsHistoryOpen, setShowLegend, setPreFormatState]);

  const deleteMapFromHistoryHandler = useCallback((id: string) => {
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    if (currentMapId === id) {
      setNodes([]); setEdges([]); setCurrentMapId(null); setCurrentTopic(""); setPreFormatState(null);
    }
  }, [history, currentMapId, setHistory, setNodes, setEdges, setCurrentMapId, setCurrentTopic, setPreFormatState]);

  const deleteAllHistoryHandler = async () => {
    clearHistory();
    setNodes([]); setEdges([]); setCurrentMapId(null); setCurrentTopic(""); setPreFormatState(null);
    await handleDeleteAllCloud();
  };

  const saveExplanation = useCallback((nodeLabel: string, text: string) => {
    if (!currentMapId) return;
    const currentMap = history.find((h) => h.id === currentMapId);
    if (currentMap) {
      updateHistoryItem(currentMapId, { explanations: { ...currentMap.explanations, [nodeLabel]: text } });
    }
  }, [currentMapId, history, updateHistoryItem]);

  const saveSubMap = useCallback((nodeLabel: string, subNodes: Node[], subEdges: Edge[]) => {
    if (!currentMapId) return;
    const currentMap = history.find((h) => h.id === currentMapId);
    if (currentMap) {
      updateHistoryItem(currentMapId, { subMaps: { ...currentMap.subMaps, [nodeLabel]: { nodes: subNodes, edges: subEdges } } });
    }
  }, [currentMapId, history, updateHistoryItem]);

  return { loadMapFromHistory, deleteMapFromHistoryHandler, deleteAllHistoryHandler, saveExplanation, saveSubMap };
}
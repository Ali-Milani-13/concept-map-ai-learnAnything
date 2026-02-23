import { useCallback } from "react";
import { THEMES } from "./useMapLayout";
import { formatGeneratedData, RawNode, RawEdge } from "../utils/flowMapper";
import { UseMapGenerationHandlersProps } from "../types";

export function useMapGenerationHandlers({
  theme, setNodes, setEdges, setCurrentMapId, setCurrentTopic, setSelectedNode, 
  setShowLegend, setPreFormatState, setGlobalError, addHistoryItem, pushNewMapToCloud
}: UseMapGenerationHandlersProps) {

  const onGenerationSuccess = useCallback((data: { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] }, prompt: string) => {
    // Cast the generic Record objects to the specific RawNode/RawEdge interfaces
    const { nodes: lNodes, edges: lEdges } = formatGeneratedData(
      data as unknown as { nodes: RawNode[]; edges: RawEdge[] }, 
      THEMES[theme]
    );
    
    setNodes(lNodes);
    setEdges(lEdges);

    const newId = Date.now().toString();
    setCurrentMapId(newId);

    const newItem = { id: newId, prompt, nodes: lNodes, edges: lEdges, explanations: {}, subMaps: {} };
    addHistoryItem(newItem);
    pushNewMapToCloud(newItem);
  }, [theme, setNodes, setEdges, setCurrentMapId, addHistoryItem, pushNewMapToCloud]);

  const handleGenerateTrigger = useCallback(async (prompt: string, generateMap: (p: string) => Promise<void>) => {
    setGlobalError(null);
    setSelectedNode(null);
    setCurrentTopic(prompt);
    setShowLegend(true);
    setPreFormatState(null);
    await generateMap(prompt);
  }, [setGlobalError, setSelectedNode, setCurrentTopic, setShowLegend, setPreFormatState]);

  return { onGenerationSuccess, handleGenerateTrigger };
}
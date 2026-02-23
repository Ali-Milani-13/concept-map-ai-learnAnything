import { useCallback } from "react";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { UseMapThemeHandlersProps } from "../types";
import { THEMES, ThemeMode } from "./useMapLayout";

export function useMapThemeHandlers({ theme, setTheme, setNodes, setEdges }: UseMapThemeHandlersProps) {
  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    const styles = THEMES[newTheme];
    
    setNodes((nds) => nds.map((node) => ({
      ...node, style: { ...node.style, background: styles.bg, color: styles.color, border: styles.border },
    })));
    
    setEdges((eds) => eds.map((edge) => ({
      ...edge,
      style: { ...edge.style, stroke: styles.edge },
      markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
      labelStyle: { ...(edge.labelStyle || {}), fill: styles.edgeLabel },
      // FIX: Dynamically update the label background when switching themes
      labelBgStyle: { fill: styles.bg },
    })));
  }, [theme, setTheme, setNodes, setEdges]);

  return { toggleTheme };
}
import { useCallback } from "react";
import { Node, Edge, MarkerType } from "@xyflow/react";
import { ThemeMode, THEMES } from "./useMapLayout";

interface UseMapThemeHandlersProps {
  theme: ThemeMode;
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

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
    })));
  }, [theme, setTheme, setNodes, setEdges]);

  return { toggleTheme };
}
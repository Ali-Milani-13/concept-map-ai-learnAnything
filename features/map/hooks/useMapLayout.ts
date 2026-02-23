import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge, Connection, ReactFlowInstance } from '@xyflow/react';
import dagre from 'dagre';
import { toSvg } from 'html-to-image';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  bg: string;
  color: string;
  border: string;
  edge: string;
  edgeLabel: string;
  bgClass: string;
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  dark: {
    bg: "#1e1e24", color: "#ffffff", border: "1px solid #6366f1",
    edge: "#6366f1", edgeLabel: "#a5b4fc", bgClass: "bg-neutral-950",
  },
  light: {
    bg: "#ffffff", color: "#1f2937", border: "1px solid #4f46e5",
    edge: "#4f46e5", edgeLabel: "#4f46e5", bgClass: "bg-gray-50",
  },
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));
const nodeWidth = 240;
const nodeHeight = 120;

export const getLayoutedElements = (nodes: Node[], edges: Edge[], isFormat = false) => {
  const ranksep = isFormat ? 300 : 200;
  const nodesep = isFormat ? 200 : 150;

  dagreGraph.setGraph({ rankdir: "TB", ranksep, nodesep, edgesep: 100 });
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: "top",
      sourcePosition: "bottom",
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - nodeWidth / 2 : 0,
        y: nodeWithPosition ? nodeWithPosition.y - nodeHeight / 2 + 150 : 0,
      },
    };
  }) as Node[];

  const layoutedEdges = edges.map((edge) => ({
    ...edge,
    type: isFormat ? "straight" : edge.type || "default",
  })) as Edge[];

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

export function useMapLayout(theme: ThemeMode, currentTopic: string) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [preFormatState, setPreFormatState] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

  const hasMap = nodes.length > 0;

  const handleOrganizeMap = useCallback(() => {
    if (preFormatState) {
      setNodes(preFormatState.nodes);
      setEdges(preFormatState.edges);
      setPreFormatState(null);
    } else {
      setPreFormatState({ nodes, edges });
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, true);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
    setTimeout(() => {
      if (reactFlowInstance) reactFlowInstance.fitView({ duration: 800, padding: 0.2 });
    }, 50);
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance, preFormatState]);

  const handleExportSVG = useCallback((setError: (err: string) => void) => {
    if (!hasMap || !reactFlowInstance) return;
    reactFlowInstance.fitView({ duration: 0, padding: 0.2 });
    setTimeout(() => {
      const flowElement = document.querySelector(".react-flow") as HTMLElement;
      if (!flowElement) return;

      toSvg(flowElement, {
        backgroundColor: THEMES[theme].bg,
        filter: (node) => {
          if (node?.classList?.contains("react-flow__minimap") || node?.classList?.contains("react-flow__controls")) {
            return false;
          }
          return true;
        },
      })
        .then((dataUrl) => {
          const a = document.createElement("a");
          const safeFileName = currentTopic ? currentTopic.replace(/[^a-z0-9]/gi, "-").toLowerCase() : "concept-map";
          a.setAttribute("download", `${safeFileName}.svg`);
          a.setAttribute("href", dataUrl);
          a.click();
        })
        .catch((err) => {
          console.error("Export Error:", err);
          setError("Failed to export diagram as SVG.");
        });
    }, 100);
  }, [reactFlowInstance, theme, currentTopic, hasMap]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return {
    nodes, setNodes, onNodesChange,
    edges, setEdges, onEdgesChange, onConnect,
    reactFlowInstance, setReactFlowInstance,
    preFormatState, setPreFormatState,
    handleOrganizeMap, handleExportSVG, hasMap
  };
}
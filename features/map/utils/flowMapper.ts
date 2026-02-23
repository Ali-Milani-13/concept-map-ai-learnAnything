import { Node, Edge, MarkerType } from "@xyflow/react";
import { ThemeConfig, getLayoutedElements } from "../hooks/useMapLayout";
import { HistoryItem } from "../../../types";

export interface RawNode {
  id: string | number;
  label?: string;
  summary?: string;
  [key: string]: unknown;
}

export interface RawEdge {
  source: string | number;
  target: string | number;
  [key: string]: unknown;
}
export function formatGeneratedData(data: { nodes: RawNode[]; edges: RawEdge[] }, styles: ThemeConfig): { nodes: Node[], edges: Edge[] } {

  
  const rawNodes: Node[] = data.nodes.map((node: RawNode) => ({
    id: String(node.id),
    type: "default",
    data: { label: node.label, summary: node.summary },
    position: { x: 0, y: 0 },
    style: {
      background: styles.bg, color: styles.color, border: styles.border,
      borderRadius: "12px", padding: "16px", width: 220,
      fontSize: "15px", fontWeight: "600", textAlign: "center",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", cursor: "pointer",
    },
  }));

  const validNodeIds = new Set(rawNodes.map((n) => n.id));
  const seenTargets = new Set();

  const rawEdges: Edge[] = data.edges
    .map((edge: RawEdge) => ({ ...edge, source: String(edge.source), target: String(edge.target) }))
    .filter((e: RawEdge) => {
      if (!e.source || !e.target || e.source === e.target || !validNodeIds.has(e.source) || !validNodeIds.has(e.target)) return false;
      if (seenTargets.has(e.target)) return false;
      seenTargets.add(e.target);
      return true;
    })
    .map((edge: Record<string, unknown>, index: number) => ({
      ...edge,
      id: `e-${edge.source}-${edge.target}-${index}`,
      type: "default",
      markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
      style: { stroke: styles.edge, strokeWidth: 2, opacity: 0.6 },
      animated: true,
      labelStyle: { fill: styles.edgeLabel, fontWeight: 500, fontSize: 12 },
      // FIX: Explicitly style the label background to prevent black boxes on export
      labelBgStyle: { fill: styles.bg },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
    }));

  return getLayoutedElements(rawNodes, rawEdges, false);
}

export function formatHistoryData(item: HistoryItem, styles: ThemeConfig): { nodes: Node[], edges: Edge[] } {
  const themedNodes = item.nodes.map((node) => ({
    ...node, style: { ...node.style, background: styles.bg, color: styles.color, border: styles.border },
  }));

  const validHistoryNodeIds = new Set(themedNodes.map((n) => String(n.id)));
  const historySeenTargets = new Set();

  const themedEdges = item.edges
    .map((edge) => ({ ...edge, source: String(edge.source), target: String(edge.target) }))
    .filter((e) => {
      if (!e.source || !e.target || e.source === e.target || !validHistoryNodeIds.has(e.source) || !validHistoryNodeIds.has(e.target)) return false;
      if (historySeenTargets.has(e.target)) return false;
      historySeenTargets.add(e.target);
      return true;
    })
    .map((edge) => ({
      ...edge, type: "default",
      style: { ...edge.style, stroke: styles.edge },
      markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
      labelStyle: { ...(edge.labelStyle || {}), fill: styles.edgeLabel },
      // FIX: Apply background styling to history maps as well
      labelBgStyle: { fill: styles.bg },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
    })) as Edge[];

  return { nodes: themedNodes, edges: themedEdges };
}
// types/index.ts (Add this to your existing types)
import { Node, Edge } from '@xyflow/react';

export interface HistoryItem {
  id: string;
  prompt: string;
  nodes: Node[];
  edges: Edge[];
  explanations: Record<string, string>;
  subMaps: Record<string, { nodes: Node[]; edges: Edge[] }>;
}
import { useState, useEffect } from 'react';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { formatGeneratedData } from '../utils/flowMapper';
import { THEMES } from './useMapLayout';

interface UseSubDiagramProps {
  selectedNode: Node | null;
  currentTopic: string;
  theme: 'light' | 'dark';
  cachedSubMap?: { nodes: Node[]; edges: Edge[] };
  onSaveSubMap: (nodeLabel: string, subNodes: Node[], subEdges: Edge[]) => void;
}

export function useSubDiagram({ selectedNode, currentTopic, theme, cachedSubMap, onSaveSubMap }: UseSubDiagramProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (cachedSubMap) {
      const styles = THEMES[theme];
      const themedNodes = cachedSubMap.nodes.map((node) => ({
        ...node,
        style: { ...node.style, background: styles.bg, color: styles.color, border: styles.border },
      }));
      const themedEdges = cachedSubMap.edges.map((edge) => ({
        ...edge,
        style: { ...edge.style, stroke: styles.edge },
        markerEnd: { type: MarkerType.ArrowClosed, color: styles.edge },
        labelStyle: { ...(edge.labelStyle || {}), fill: styles.edgeLabel },
        labelBgStyle: { fill: styles.bg },
      })) as Edge[];

      setNodes(themedNodes);
      setEdges(themedEdges);
      setSaved(true);
    } else {
      setNodes([]);
      setEdges([]);
      setSaved(false);
    }
  }, [selectedNode, cachedSubMap, theme]);

  const handleGenerateSubMap = async () => {
    if (!selectedNode) return;
    setLoading(true);
    try {
      const prompt = `Break down ${selectedNode.data.label} in the context of ${currentTopic}`;
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.nodes && data.edges) {
        // 1. Prefix IDs so they don't collide with the main map
        const prefixedData = {
          nodes: data.nodes.map((n: any) => ({ ...n, id: `sub-${n.id}` })),
          edges: data.edges.map((e: any) => ({ ...e, source: `sub-${e.source}`, target: `sub-${e.target}` }))
        };

        // 2. Pass it through the exact same Dagre layout engine!
        const { nodes: subNodes, edges: subEdges } = formatGeneratedData(prefixedData, THEMES[theme]);

        setNodes(subNodes);
        setEdges(subEdges);
        onSaveSubMap(selectedNode.data.label as string, subNodes, subEdges);
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to fetch sub-diagram:", err);
    } finally {
      setLoading(false);
    }
  };

  return { nodes, edges, loading, saved, handleGenerateSubMap };
}
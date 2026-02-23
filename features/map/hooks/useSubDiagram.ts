import { useState, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';

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

  const isDark = theme === 'dark';

  useEffect(() => {
    if (cachedSubMap) {
      setNodes(cachedSubMap.nodes);
      setEdges(cachedSubMap.edges);
      setSaved(true);
    } else {
      setNodes([]);
      setEdges([]);
      setSaved(false);
    }
  }, [selectedNode, cachedSubMap]);

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
        const subNodes = data.nodes.map((n: any, i: number) => ({
          ...n,
          id: `sub-${n.id}`,
          position: { x: (i % 3) * 150, y: Math.floor(i / 3) * 100 },
          style: { 
            background: isDark ? '#1e1e24' : '#ffffff', 
            color: isDark ? '#ffffff' : '#1f2937', 
            border: `1px solid ${isDark ? '#6366f1' : '#4f46e5'}`,
            borderRadius: '8px', padding: '10px', fontSize: '12px', width: 120, textAlign: 'center'
          }
        })) as Node[];

        const subEdges = data.edges.map((e: any, i: number) => ({
          ...e,
          id: `sub-e-${i}`,
          source: `sub-${e.source}`,
          target: `sub-${e.target}`,
          style: { stroke: isDark ? '#6366f1' : '#4f46e5' }
        })) as Edge[];

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

  return {
    nodes,
    edges,
    loading,
    saved,
    handleGenerateSubMap
  };
}
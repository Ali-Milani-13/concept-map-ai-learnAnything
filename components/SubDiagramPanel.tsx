import React, { useState, useEffect } from 'react';
import { X, Network, Loader2, Sparkles, Save, CheckCircle, Info } from 'lucide-react';
import { ReactFlow, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. Strictly type the expected props to eliminate implicit 'any' warnings
interface SubDiagramPanelProps {
  selectedNode: any; // Using 'any' briefly here to accept React Flow's internal Node type without strict generic coupling
  currentTopic: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  cachedSubMap?: { nodes: Node[]; edges: Edge[] };
  onSaveSubMap: (nodeLabel: string, subNodes: Node[], subEdges: Edge[]) => void;
}

export default function SubDiagramPanel({
  selectedNode,
  currentTopic,
  theme,
  onClose,
  cachedSubMap,
  onSaveSubMap
}: SubDiagramPanelProps) {
  // Explicitly type the state arrays so TypeScript knows what they hold
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const isDark = theme === 'dark';

  // Load cached sub-map if it exists when the node changes
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

  if (!selectedNode) return null;

  const handleGenerateSubMap = async () => {
    setLoading(true);
    try {
      const prompt = `Break down ${selectedNode.data.label} in the context of ${currentTopic}`;
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      
      if (data.nodes && data.edges) {
        // Transform the data visually for the sub-map canvas
        const subNodes = data.nodes.map((n: any, i: number) => ({
          ...n,
          id: `sub-${n.id}`,
          position: { x: (i % 3) * 150, y: Math.floor(i / 3) * 100 }, // Simple grid layout fallback
          style: { 
            background: isDark ? '#1e1e24' : '#ffffff', 
            color: isDark ? '#ffffff' : '#1f2937', 
            border: `1px solid ${isDark ? '#6366f1' : '#4f46e5'}`,
            borderRadius: '8px',
            padding: '10px',
            fontSize: '12px',
            width: 120,
            textAlign: 'center'
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
        onSaveSubMap(selectedNode.data.label, subNodes, subEdges);
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to fetch sub-diagram:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      // Applied canonical w-100 and h-75 classes here
      className={`fixed top-24 left-6 z-50 w-100 h-75 rounded-2xl shadow-2xl border flex flex-col animate-in slide-in-from-left-4 duration-300 ${
        isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-900'
      }`}
    >
      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Network size={18} className="text-indigo-500" />
          <span className="font-bold truncate max-w-50">Sub-Map: {selectedNode.data.label}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden bg-transparent">
        {nodes.length > 0 ? (
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView 
            colorMode={theme}
            proOptions={{ hideAttribution: true }} // Cleans up the mini-map watermark
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <Network size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Explore {selectedNode.data.label}</h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Generate a deeper, nested concept map specifically for this node.
            </p>
            <button
              onClick={handleGenerateSubMap}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Mapping...' : 'Generate Sub-Map'}
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {nodes.length > 0 && (
        <div className={`p-3 border-t flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            {saved ? <CheckCircle size={12} className="text-emerald-500" /> : <Info size={12} />}
            {saved ? 'Saved to Map' : 'Analysis Complete'}
          </div>
          <button 
            onClick={() => onSaveSubMap(selectedNode.data.label, nodes, edges)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isDark ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            <Save size={14} />
            Save State
          </button>
        </div>
      )}
    </div>
  );
}
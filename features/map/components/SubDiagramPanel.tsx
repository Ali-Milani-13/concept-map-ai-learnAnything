import React from 'react';
import { X, Network, Loader2, Sparkles, Save, CheckCircle, Info } from 'lucide-react';
import { ReactFlow, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useSubDiagram } from '../hooks/useSubDiagram';
import { useDraggablePanel } from '../hooks/useDraggablePanel';

interface SubDiagramPanelProps {
  selectedNode: Node | null;
  currentTopic: string;
  theme: 'light' | 'dark';
  onClose: () => void;
  cachedSubMap?: { nodes: Node[]; edges: Edge[] };
  onSaveSubMap: (nodeLabel: string, subNodes: Node[], subEdges: Edge[]) => void;
}

export default function SubDiagramPanel(props: SubDiagramPanelProps) {
  const { selectedNode, theme, onClose } = props;
  const isDark = theme === 'dark';
  
  const { nodes, edges, loading, saved, handleGenerateSubMap } = useSubDiagram(props);
  const { position, size, onDragStart, onResizeStart } = useDraggablePanel(32, 96, 600, 450);

  if (!selectedNode) return null;

  return (
    <div 
      className={`absolute z-90 flex flex-col rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in duration-300 ${isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
      style={{ left: position.x, top: position.y, width: size.w, height: size.h }}
    >
      {/* Header acts as drag handle */}
      <div 
        onMouseDown={onDragStart}
        className={`cursor-move p-4 border-b flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <Network size={18} className="text-indigo-500" />
          <span className="font-bold truncate max-w-50 select-none">Sub-Map: {selectedNode.data.label as string}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-transparent">
        {nodes.length > 0 ? (
          <ReactFlow nodes={nodes} edges={edges} fitView colorMode={theme} proOptions={{ hideAttribution: true }} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className={`p-4 rounded-full mb-4 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <Network size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-sm font-semibold mb-2">Explore {selectedNode.data.label as string}</h3>
            <p className={`text-xs mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Generate a deeper, nested concept map specifically for this node.</p>
            <button onClick={handleGenerateSubMap} disabled={loading} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Mapping...' : 'Generate Sub-Map'}
            </button>
          </div>
        )}
      </div>
      
      {nodes.length > 0 && (
        <div className={`p-3 border-t flex items-center justify-between relative ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            {saved ? <CheckCircle size={12} className="text-emerald-500" /> : <Info size={12} />}
            {saved ? 'Saved to Map' : 'Analysis Complete'}
          </div>
          <button onClick={() => props.onSaveSubMap(selectedNode.data.label as string, nodes, edges)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all mr-4 ${isDark ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            <Save size={14} /> Save State
          </button>

          {/* Resize Handle */}
          <div 
            onMouseDown={onResizeStart}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-end justify-end p-1.5 opacity-50 hover:opacity-100 z-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-gray-400">
              <path d="M21 15L15 21M21 8L8 21" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
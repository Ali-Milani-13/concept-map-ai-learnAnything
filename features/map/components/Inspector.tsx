import React from 'react';
import { X, BookOpen, Info, Save, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { Node } from '@xyflow/react';
import { useAiExplanation } from '@/features/ai/hooks/useAiExplanation';

interface InspectorProps {
  selectedNode: Node | null;
  onClose: () => void;
  theme: 'light' | 'dark';
  currentTopic: string;
  cachedExplanation?: string;
  onSaveExplanation: (nodeLabel: string, text: string) => void;
}

export default function Inspector(props: InspectorProps) {
  const { selectedNode, onClose, theme } = props;
  const isDark = theme === 'dark';
  
  const { explanation, loading, saved, handleFetchExplanation } = useAiExplanation(props);

  if (!selectedNode) return null;

  return (
    <div className={`fixed bottom-24 right-6 z-50 w-85 h-125 rounded-2xl shadow-2xl border flex flex-col animate-in slide-in-from-right-4 duration-300 ${isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-500" />
          <span className="font-bold truncate max-w-50">{selectedNode.data.label as string}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
          <X size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className={`p-3 rounded-xl text-sm leading-relaxed ${isDark ? 'bg-neutral-800/50 text-gray-300' : 'bg-blue-50/50 text-gray-600'}`}>
          <div className="flex items-start gap-2 mb-2">
            <Info size={16} className="text-indigo-500 mt-0.5" />
            <span className="font-semibold text-indigo-500">Node Summary</span>
          </div>
          {selectedNode.data.summary as string}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Detailed Explanation</h3>
          {explanation ? (
            <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {explanation}
            </p>
          ) : (
            <div className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
              <button onClick={handleFetchExplanation} disabled={loading} className="flex flex-col items-center gap-2 group">
                <div className={`p-3 rounded-full transition-all group-hover:scale-110 ${isDark ? 'bg-neutral-800 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                </div>
                <span className="text-xs font-bold text-indigo-500">AI Deep Dive</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {explanation && (
        <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            {saved ? <CheckCircle size={12} className="text-emerald-500" /> : <Info size={12} />}
            {saved ? 'Saved to Map' : 'Analysis Complete'}
          </div>
          <button onClick={() => props.onSaveExplanation(selectedNode.data.label as string, explanation)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
            <Save size={14} /> Save State
          </button>
        </div>
      )}
    </div>
  );
}
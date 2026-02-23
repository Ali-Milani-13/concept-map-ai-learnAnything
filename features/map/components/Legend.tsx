import React from 'react';
import { X, Waypoints } from 'lucide-react';

interface LegendProps {
  theme: 'light' | 'dark';
  onClose: () => void;
}

export default function Legend({ theme, onClose }: LegendProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`absolute bottom-3.75 left-17.5 p-3 md:p-4 rounded-xl shadow-lg border animate-in fade-in zoom-in-95 duration-300 z-50 ${
      isDark ? 'bg-neutral-900 border-neutral-800 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
    }`}>
      <div className="flex items-center justify-between mb-4 gap-6">
        <div className="flex items-center gap-2">
          <Waypoints size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-500'} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Map Legend
          </span>
        </div>
        <button 
          onClick={onClose} 
          className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
            isDark ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-indigo-200 bg-indigo-50'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-500'}`} />
          </div>
          <span className="font-medium">Concept Node</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 flex items-center justify-center relative">
            <div className={`w-full h-0 border-t-2 border-dashed ${
              isDark ? 'border-indigo-500/50' : 'border-indigo-400'
            }`} />
            <div className={`absolute right-0 w-0 h-0 border-t-4 border-t-transparent border-l-[6px] border-b-4 border-b-transparent ${
              isDark ? 'border-l-indigo-500/50' : 'border-l-indigo-400'
            }`} />
          </div>
          <span className="font-medium">Relationship</span>
        </div>
      </div>
    </div>
  );
}
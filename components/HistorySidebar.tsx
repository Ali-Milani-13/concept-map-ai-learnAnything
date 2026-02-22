import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Library, AlertTriangle } from 'lucide-react';

// 1. Define the shape of the history items used in the sidebar
interface HistoryItem {
  id: string;
  prompt: string;
}

// 2. Define the exact types for every prop the component receives
interface HistorySidebarProps {
  isOpen: boolean;
  theme: 'light' | 'dark';
  history: HistoryItem[];
  currentMapId: string | null;
  onClose: () => void;
  onSelectMap: (id: string) => void;
  onDeleteMap: (id: string) => void;
  onDeleteAll: () => void;
}

export default function HistorySidebar({ 
  isOpen, 
  theme, 
  history, 
  currentMapId, 
  onClose, 
  onSelectMap, 
  onDeleteMap,
  onDeleteAll 
}: HistorySidebarProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const isDark = theme === 'dark';

  // Reset confirmation state if the sidebar is closed
  useEffect(() => {
    if (!isOpen) setConfirmClear(false);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Replaced z-[90] with the canonical z-90 Tailwind class
    <div className={`fixed inset-y-0 left-0 z-90 w-80 shadow-2xl transform transition-transform duration-300 flex flex-col ${
      isDark ? 'bg-neutral-900 border-r border-neutral-800 text-white' : 'bg-white border-r border-gray-200 text-gray-900'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-neutral-800' : 'border-gray-200'}`}>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Library size={20} /> Library
        </h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && !confirmClear && (
            <button 
              onClick={() => setConfirmClear(true)} 
              className={`p-1.5 rounded-md transition-colors ${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}`} 
              title="Clear All Maps"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Confirmation Panel */}
      {confirmClear && (
        <div className={`p-4 border-b animate-in slide-in-from-top-2 ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Are you sure you want to delete all maps? This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setConfirmClear(false)} 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${isDark ? 'hover:bg-neutral-800 text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              Cancel
            </button>
            <button 
              onClick={() => { onDeleteAll(); setConfirmClear(false); }} 
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Delete All
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {history.length === 0 ? (
          <div className={`text-center mt-10 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No maps generated yet.
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                currentMapId === item.id 
                  ? (isDark ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-indigo-50 border border-indigo-200')
                  : (isDark ? 'hover:bg-neutral-800 border border-transparent' : 'hover:bg-gray-50 border border-transparent')
              }`}
              onClick={() => onSelectMap(item.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare size={16} className={currentMapId === item.id ? 'text-indigo-500' : (isDark ? 'text-gray-500' : 'text-gray-400')} />
                <span className={`text-sm font-medium truncate ${currentMapId === item.id ? (isDark ? 'text-indigo-300' : 'text-indigo-700') : (isDark ? 'text-gray-300' : 'text-gray-700')}`}>
                  {item.prompt}
                </span>
              </div>
              
              <button
                // e parameter is now properly inferred as React.MouseEvent by the onClick handler
                onClick={(e) => { e.stopPropagation(); onDeleteMap(item.id); }}
                className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
                  isDark ? 'hover:bg-neutral-700 text-red-400' : 'hover:bg-gray-200 text-red-500'
                }`}
                title="Delete Map"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
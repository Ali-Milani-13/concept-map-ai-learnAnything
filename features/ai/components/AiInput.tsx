'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';

interface AiInputProps {
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
  hasMap: boolean;
  theme: 'light' | 'dark';
  progress: number;
}

const HEADING_TRANSLATIONS = [
  { text: "What do you want to learn?", dir: "ltr" },
  { text: "چه چیزی می‌خواهید یاد بگیرید؟", dir: "rtl" },
  { text: "Ne öğrenmek istersin?", dir: "ltr" },
  { text: "Nə öyrənmək istəyirsiniz?", dir: "ltr" },
  { text: "Що ви хочете вивчити?", dir: "ltr" }
];

const ANIMATION_DURATION_MS = 3500; 

export default function AiInput({ onGenerate, isGenerating, hasMap, theme, progress }: AiInputProps) {
  const [prompt, setPrompt] = useState('');
  const [langIndex, setLangIndex] = useState(0);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (hasMap) return; 
    const interval = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % HEADING_TRANSLATIONS.length);
    }, ANIMATION_DURATION_MS);
    return () => clearInterval(interval);
  }, [hasMap]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onGenerate(prompt);
  };

  const containerClasses = hasMap
    ? "absolute top-24 md:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4 transition-all duration-700 ease-in-out pointer-events-none"
    : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl px-4 flex flex-col items-center transition-all duration-700 ease-in-out pointer-events-none";

  const inputBg = isDark 
    ? "bg-neutral-900/80 border-neutral-700/50 text-white ring-white/5" 
    : "bg-white/80 border-gray-200 text-gray-900 ring-black/5";

  const getLoadingText = () => {
    if (progress < 30) return "Initializing AI...";
    if (progress < 60) return "Structuring Knowledge...";
    if (progress < 80) return "Designing Layout...";
    return "Finalizing Map...";
  };

  const currentTranslation = HEADING_TRANSLATIONS[langIndex];

  return (
    <div className={containerClasses}>
      <style>{`
        @keyframes cinematic-hello {
          0% { opacity: 0; filter: blur(16px); transform: scale(1.05) translateY(10px); }
          15% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
          85% { opacity: 1; filter: blur(0px); transform: scale(1) translateY(0); }
          100% { opacity: 0; filter: blur(12px); transform: scale(0.95) translateY(-10px); }
        }
        .animate-cinematic {
          animation: cinematic-hello ${ANIMATION_DURATION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {!hasMap && (
        <div className="text-center mb-8 pointer-events-auto">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6 animate-in fade-in zoom-in duration-700 ${
            isDark ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
          }`}>
            <Sparkles size={12} />
            <span>AI Knowledge Engine</span>
          </div>
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight min-h-24 md:min-h-20 flex items-center justify-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span key={langIndex} className="animate-cinematic will-change-transform" dir={currentTranslation.dir}>
              {currentTranslation.text}
            </span>
          </h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full relative group animate-in fade-in zoom-in duration-700 delay-300 fill-mode-both pointer-events-auto">
        <div className={`absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 ${hasMap ? 'hidden' : 'block'}`}></div>
        
        <div className={`relative flex items-center rounded-2xl shadow-2xl p-3 w-full backdrop-blur-md border overflow-hidden ${inputBg}`}>
          <Search className={`ml-4 ${isDark ? 'text-neutral-400' : 'text-gray-400'}`} />
          
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={hasMap ? "Search for a new topic..." : "e.g., 'How Blockchain Works'"}
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 placeholder-gray-500"
            disabled={isGenerating}
          />

          <button
            type="submit"
            disabled={isGenerating || !prompt}
            className={`rounded-xl transition-all disabled:opacity-50 flex items-center justify-center ${
              hasMap ? 'p-2 rounded-full' : 'px-6 py-3 font-medium'
            } ${isDark ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : hasMap ? <Search size={16} /> : "Generate Map"}
          </button>

          {isGenerating && (
            <div className="absolute bottom-0 left-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          )}
        </div>

        {isGenerating && !hasMap && (
          <div className={`text-center mt-4 text-sm font-medium animate-pulse ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
            {getLoadingText()}
          </div>
        )}
      </form>
    </div>
  );
}
'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700 border border-neutral-700'
          : 'bg-white text-indigo-600 hover:bg-gray-50 border border-gray-200'
      }`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
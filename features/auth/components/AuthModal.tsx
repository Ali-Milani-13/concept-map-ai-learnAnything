import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  onAuthSuccess: (user: Record<string, unknown>) => void;
}

export default function AuthModal({ isOpen, onClose, theme, onAuthSuccess }: AuthModalProps) {
  const {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleAuth,
    toggleMode
  } = useAuth({ onAuthSuccess, onClose });

  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div 
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative border ${
          isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-neutral-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h2>
        <p className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isLogin 
            ? 'Log in to sync your concept maps to the cloud.' 
            : 'Sign up to secure your maps and access them anywhere.'}
        </p>

        {error && (
          <div className={`mb-4 p-3 rounded-lg border flex items-start gap-2 text-sm ${
            error.includes('Success') 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' 
              : 'bg-red-500/10 border-red-500/50 text-red-500'
          }`}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Email
            </label>
            <div className="relative">
              <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 focus:border-indigo-500 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Password
            </label>
            <div className="relative">
              <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all ${
                  isDark 
                    ? 'bg-neutral-800 border-neutral-700 focus:border-indigo-500 text-white placeholder-gray-500' 
                    : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-gray-900 placeholder-gray-400'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button"
            onClick={toggleMode}
            className="text-indigo-500 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
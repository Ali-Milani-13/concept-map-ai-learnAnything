import { useState, useRef } from 'react';

interface AiGenerationProps {
  onSuccess: (data: { nodes: Record<string, unknown>[]; edges: Record<string, unknown>[] }, prompt: string) => void;
  onError: (error: string) => void;
}

export function useAiGeneration({ onSuccess, onError }: AiGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateMap = async (prompt: string) => {
    setIsGenerating(true);
    setProgress(0);

    progressInterval.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : Math.min(p + (p < 50 ? 5 : 2), 90)));
    }, 150);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
      
      if (!res.ok) throw new Error(`Network Error: ${res.status} ${res.statusText}`);
      
      const data = await res.json();

      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(100);

      if (data.nodes && data.edges) {
        onSuccess(data, prompt);
      }
    } catch (err: unknown) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      setProgress(0);
      onError(err instanceof Error ? err.message : "Failed to connect to server");
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  return {
    generateMap,
    isGenerating,
    progress
  };
}
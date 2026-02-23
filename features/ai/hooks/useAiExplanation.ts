import { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';

interface UseAiExplanationProps {
  selectedNode: Node | null;
  currentTopic: string;
  cachedExplanation?: string;
  onSaveExplanation: (nodeLabel: string, text: string) => void;
}

export function useAiExplanation({ selectedNode, currentTopic, cachedExplanation, onSaveExplanation }: UseAiExplanationProps) {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (cachedExplanation) {
      setExplanation(cachedExplanation);
    } else {
      setExplanation('');
    }
    setSaved(false);
  }, [selectedNode, cachedExplanation]);

  const handleFetchExplanation = async () => {
    if (!selectedNode) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        body: JSON.stringify({ 
          topic: currentTopic, 
          nodeLabel: selectedNode.data.label 
        }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
      onSaveExplanation(selectedNode.data.label as string, data.explanation);
      setSaved(true);
    } catch (err) {
      console.error("Failed to fetch explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    explanation,
    loading,
    saved,
    handleFetchExplanation
  };
}
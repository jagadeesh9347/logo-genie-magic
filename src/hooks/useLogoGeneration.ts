
import { useState } from 'react';

export const useLogoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState(null);

  const generateLogo = async (data: {
    industry: string;
    description: string;
    companyName: string;
    slogan: string;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate logo suggestions');
      }

      const result = await response.json();
      setSuggestions(result.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateLogo, isGenerating, error, suggestions };
};

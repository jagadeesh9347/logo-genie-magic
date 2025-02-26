
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export const useLogoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const generateLogo = async (data: {
    industry: string;
    description: string;
    companyName: string;
    slogan: string;
  }) => {
    setIsGenerating(true);
    setError(null);

    try {
      const { data: response, error: fetchError } = await supabase.functions.invoke('generate-logo', {
        body: data
      });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setSuggestions(response.suggestions);
      setImageUrl(response.imageUrl);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating the logo';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateLogo, isGenerating, error, suggestions, imageUrl };
};

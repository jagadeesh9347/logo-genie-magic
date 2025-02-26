
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAIApiKey = Deno.env.get('OPENAI_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured')
    }

    const { industry, description, companyName, slogan } = await req.json()

    if (!industry || !description || !companyName) {
      throw new Error('Missing required fields')
    }

    console.log('Generating logo for:', { industry, companyName, slogan })

    // Simplified prompt to focus on logo generation
    const imagePrompt = `Create a modern, professional business logo for a ${industry} company named "${companyName}"${slogan ? ` with the slogan "${slogan}"` : ''}.

    The brand description is: ${description}

    Requirements:
    - Modern, minimalist, and professional design
    - Company name must be clearly readable
    - Clean layout with good spacing
    - Suitable for business use
    - Simple design that works at small sizes
    
    The logo should be a high-quality, professional business logo that reflects the company's industry and values.`

    console.log('Sending request to generate logo...')

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "512x512",
        quality: "standard",
        style: "natural"
      }),
    })

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    console.log('Successfully generated logo')

    return new Response(
      JSON.stringify({ 
        imageUrl,
        suggestions: '' // We're not using suggestions anymore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in generate-logo function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

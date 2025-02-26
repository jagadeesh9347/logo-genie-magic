
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
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key is not configured')
    }

    const requestData = await req.json()
    console.log('Received request data:', requestData);

    const { industry, description, companyName, slogan } = requestData

    if (!industry || !description || !companyName) {
      console.error('Missing required fields:', { industry, description, companyName });
      throw new Error('Missing required fields: industry, description, and company name are required')
    }

    const prompt = `Create a modern, minimalist logo for ${companyName}, a ${industry} company.
    Brand description: ${description}
    ${slogan ? `Include the slogan: ${slogan}` : ''}

    Requirements:
    - Clean, professional design
    - Company name must be clearly readable
    - Simple layout with good spacing
    - Must work at small sizes
    - Include company name as text`

    console.log('Making request to OpenAI API...');

    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "512x512",
        quality: "standard"
      }),
    })

    console.log('OpenAI API response status:', imageResponse.status);

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image')
    }

    const imageData = await imageResponse.json()
    console.log('OpenAI API response:', JSON.stringify(imageData, null, 2));

    if (!imageData.data?.[0]?.url) {
      console.error('No image URL in response:', imageData);
      throw new Error('No image URL returned from OpenAI')
    }

    const response = {
      imageUrl: imageData.data[0].url,
      suggestions: ''
    };

    console.log('Sending successful response');
    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in generate-logo function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})

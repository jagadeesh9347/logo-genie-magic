
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
const aiGatewayBaseUrl = 'https://ai.gateway.lovable.dev/v1'

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
    if (!lovableApiKey) {
      throw new Error('Missing AI gateway credentials')
    }

    const { industry, description, companyName, slogan } = await req.json()

    if (!industry || !description || !companyName) {
      return new Response(
        JSON.stringify({ error: 'industry, description, and companyName are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // First, get the design suggestions from GPT
    const designPrompt = `Create a detailed logo design suggestion for:
      Company Name: ${companyName}
      Industry: ${industry}
      Description: ${description}
      Slogan: ${slogan}

      Please provide:
      1. Color palette recommendations (with hex codes)
      2. Typography suggestions
      3. Logo symbol/icon description
      4. Overall logo composition
      5. Design rationale explaining how it connects to the brand
      
      Format the response in a clear, structured way.`

    const gptResponse = await fetch(`${aiGatewayBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional logo designer with expertise in branding and visual identity. Provide detailed, actionable logo design suggestions.'
          },
          {
            role: 'user',
            content: designPrompt
          }
        ],
      }),
    })

    const gptData = await gptResponse.json()
    if (!gptResponse.ok) {
      throw new Error(gptData?.error?.message || gptData?.error || 'Failed to generate logo design direction')
    }

    const suggestions = gptData?.choices?.[0]?.message?.content

    if (!suggestions || typeof suggestions !== 'string') {
      throw new Error('AI response did not include usable design suggestions')
    }

    const cleanedDescription = description.trim()
    const visualDirection = suggestions.trim().replace(/\s+/g, ' ')

    // Generate a more specific image prompt that includes the company name and slogan
    const imagePrompt = `Create a professional business logo that includes:
      1. The company name "${companyName}" prominently displayed
      ${slogan ? `2. The slogan "${slogan}" integrated below the company name` : ''}
      3. Brand description: ${cleanedDescription}
      4. Industry: ${industry}
      5. Visual direction: ${visualDirection}
      
      Style requirements:
      - Modern, professional, clean design
      - Company name must be clearly readable
      - Balanced composition with clear negative space
      - Suitable for business use across all media
      - The logo should work well at different sizes
      - Must look like a professional business logo, not an illustration
      
      Important: Ensure the text is clear and readable. The company name should be the most prominent text element.`

    const imageResponse = await fetch(`${aiGatewayBaseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "high"
      }),
    })

    const imageData = await imageResponse.json()
    if (!imageResponse.ok) {
      throw new Error(imageData?.error?.message || imageData?.error || 'Failed to generate logo image')
    }

    const imageUrl = imageData.data?.[0]?.url

    if (!imageUrl) {
      throw new Error('AI image response did not include an image URL')
    }

    return new Response(
      JSON.stringify({ 
        suggestions,
        imageUrl 
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


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
    const { industry, description, companyName, slogan } = await req.json()

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

    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
    const suggestions = gptData.choices[0].message.content

    // Generate a more specific image prompt that includes the company name and slogan
    const imagePrompt = `Create a professional business logo that includes:
      1. The company name "${companyName}" prominently displayed
      ${slogan ? `2. The slogan "${slogan}" integrated below the company name` : ''}
      3. Visual elements:
      ${suggestions.split('### 3. Logo Symbol/Icon Description')[1].split('### 4.')[0]}
      
      Style requirements:
      - Modern, professional, clean design
      - Company name must be clearly readable
      - Balanced composition with clear negative space
      - Suitable for business use across all media
      - The logo should work well at different sizes
      - Must look like a professional business logo, not an illustration
      
      Important: Ensure the text is clear and readable. The company name should be the most prominent text element.`

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
        size: "1024x1024",
        quality: "hd",
        style: "natural"
      }),
    })

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data?.[0]?.url

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

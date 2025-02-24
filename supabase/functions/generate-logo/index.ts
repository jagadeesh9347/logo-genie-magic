
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

    // Construct a detailed prompt for the logo design
    const prompt = `Create a detailed logo design suggestion for:
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: prompt
          }
        ],
      }),
    })

    const data = await response.json()
    const suggestions = data.choices[0].message.content

    return new Response(
      JSON.stringify({ suggestions }),
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

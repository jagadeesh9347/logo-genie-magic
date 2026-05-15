
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
const aiGatewayBaseUrl = 'https://ai.gateway.lovable.dev/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const parseJsonSafely = async (response: Response) => {
  const rawText = await response.text()

  try {
    return rawText ? JSON.parse(rawText) : null
  } catch {
    return { rawText }
  }
}

const extractSvgMarkup = (content: string) => {
  const fencedMatch = content.match(/```(?:svg)?\s*([\s\S]*?<svg[\s\S]*?<\/svg>)\s*```/i)
  const directMatch = content.match(/<svg[\s\S]*?<\/svg>/i)
  return (fencedMatch?.[1] || directMatch?.[0] || '').trim()
}

const toBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
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

    const gptData = await parseJsonSafely(gptResponse)
    if (!gptResponse.ok) {
      throw new Error(gptData?.error?.message || gptData?.error || gptData?.rawText || 'Failed to generate logo design direction')
    }

    const suggestions = gptData?.choices?.[0]?.message?.content

    if (!suggestions || typeof suggestions !== 'string') {
      throw new Error('AI response did not include usable design suggestions')
    }

    const cleanedDescription = description.trim()
    const visualDirection = suggestions.trim().replace(/\s+/g, ' ')
    const svgPrompt = `Create a single self-contained SVG logo for this business.

Company name: ${companyName}
Industry: ${industry}
Brand description: ${cleanedDescription}
${slogan ? `Slogan: ${slogan}` : 'Slogan: none'}
Visual direction: ${visualDirection}

Requirements:
- Return only SVG markup, no explanation
- Start with <svg and end with </svg>
- Use a square 1024 by 1024 viewBox
- Keep the composition centered with a premium, modern, readable look
- Include the company name as clear vector text inside the SVG
- ${slogan ? 'Include the slogan in smaller readable text' : 'Do not add placeholder slogan text'}
- Use 2 to 4 colors max
- Avoid tiny details, raster effects, embedded images, scripts, external fonts, or unsupported filters
- Make it suitable for restaurant branding and Android display
- Prefer strong contrast and clean geometry`

    const imageResponse = await fetch(`${aiGatewayBaseUrl}/chat/completions`, {
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
            content: 'You are an expert brand designer who creates valid production-ready SVG logos. Return only SVG markup.'
          },
          {
            role: 'user',
            content: svgPrompt
          }
        ]
      }),
    })

    const imageData = await parseJsonSafely(imageResponse)
    if (!imageResponse.ok) {
      throw new Error(imageData?.error?.message || imageData?.error || imageData?.rawText || 'Failed to generate logo image')
    }

    const svgContent = imageData?.choices?.[0]?.message?.content
    const svgMarkup = typeof svgContent === 'string' ? extractSvgMarkup(svgContent) : ''

    if (!svgMarkup) {
      throw new Error('AI response did not include valid SVG logo markup')
    }

    const imageUrl = `data:image/svg+xml;base64,${toBase64(svgMarkup)}`

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

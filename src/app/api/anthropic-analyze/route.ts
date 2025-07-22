import { NextRequest, NextResponse } from 'next/server'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(request: NextRequest) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 })
    }

    const body = await request.json()
    const { imageBase64, childName, title } = body

    // Log the incoming base64 (first 100 chars for brevity)
    console.log('Received imageBase64:', typeof imageBase64 === 'string' ? imageBase64.slice(0, 100) : imageBase64)

    if (!imageBase64 || !childName || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: imageBase64, childName, title' }, 
        { status: 400 }
      )
    }

    // Remove data URL prefix if present
    const base64Data = typeof imageBase64 === 'string' ? imageBase64.replace(/^data:image\/[a-zA-Z0-9+]+;base64,/, '') : ''
    console.log('base64Data sent to Anthropic:', base64Data.slice(0, 100))

    // Defensive checks for base64 validity
    if (!base64Data || base64Data.length < 100) {
      return NextResponse.json(
        { error: 'Invalid or empty base64 image data' },
        { status: 400 }
      )
    }
    // Basic base64 validation (only checks for valid characters)
    const base64Pattern = /^[A-Za-z0-9+/=\r\n]+$/
    if (!base64Pattern.test(base64Data)) {
      return NextResponse.json(
        { error: 'Malformed base64 image data' },
        { status: 400 }
      )
    }

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a supportive art therapy observer analyzing a child's drawing. \n\nChild's name: ${childName}\nDrawing title: ${title}\n\nPlease analyze this artwork and provide therapeutic insights in this exact JSON format:\n\n{\n  "primaryEmotion": "one word emotion",\n  "secondaryEmotion": "one word emotion", \n  "strokeIntensity": "Confident/Gentle/Energetic",\n  "colorsUsed": number,\n  "colorExpression": "2-3 sentences about color choices and emotional meaning",\n  "linesMovement": "2-3 sentences about stroke quality and creative confidence",\n  "spaceComposition": "2-3 sentences about spatial usage and artistic approach", \n  "creativeJourney": "2-3 sentences celebrating artistic growth and creativity",\n  "suggestedActions": ["action 1", "action 2", "action 3", "action 4", "action 5"]\n}\n\nUse warm, encouraging language that celebrates the child's creativity and provides parents with meaningful conversation tools. Avoid clinical language.`
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: imageBase64.startsWith('/9j/') ? 'image/jpeg' : 'image/png',
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    })

    if (!anthropicRes.ok) {
      const error = await anthropicRes.text()
      return NextResponse.json({ error: `API Error: ${error}` }, { status: 500 })
    }

    const data = await anthropicRes.json()
    const responseText = data.content?.[0]?.text || ''
    try {
      const parsedResult = JSON.parse(responseText)
      return NextResponse.json(parsedResult)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return NextResponse.json({ 
        primaryEmotion: 'Creativity',
        secondaryEmotion: 'Joy',
        strokeIntensity: 'Confident',
        colorsUsed: 5,
        colorExpression: responseText,
        linesMovement: 'Shows creative confidence',
        spaceComposition: 'Thoughtful use of space',
        creativeJourney: 'Demonstrates artistic growth',
        suggestedActions: [
          'Encourage more art creation', 
          'Ask about their process', 
          'Display the artwork', 
          'Try new art materials', 
          'Celebrate their creativity'
        ]
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Anthropic Analysis API is running',
    method: 'POST required',
    timestamp: new Date().toISOString()
  })
}
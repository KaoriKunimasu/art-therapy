// lib/anthropic.ts
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ''
export const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

// Updated interface to match your API response structure
export interface ArtTherapyAnalysis {
  primaryEmotion: string
  secondaryEmotion: string
  strokeIntensity: string  // Changed from 'Light' | 'Medium' | 'Heavy' to string
  colorsUsed: number      // Changed from coloursUsed to colorsUsed (matches API)
  colorExpression: string
  linesMovement: string
  spaceComposition: string
  creativeJourney: string
  suggestedActions: string[]
}

// Simplified analysis function that matches your API
export async function analyzeDrawingWithClaude({ 
  imageBase64, 
  childName, 
  title 
}: { 
  imageBase64: string
  childName: string
  title: string 
}): Promise<ArtTherapyAnalysis> {
  
  try {
    console.log('🎨 Starting artwork analysis...')
    console.log('📝 Child:', childName, '| Title:', title)
    
    const response = await fetch('/api/anthropic-analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        imageBase64, 
        childName, 
        title 
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ API error:', response.status, errorData)
      throw new Error(`API error (${response.status}): ${errorData.error || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('✅ Analysis completed successfully')
    
    // Validate the response structure
    return validateAnalysisResponse(data, childName, title)

  } catch (error) {
    console.error('❌ Analysis error:', error)
    // Return fallback analysis instead of throwing
    return createFallbackAnalysis(childName, title)
  }
}

// Validation function to ensure proper response structure
function validateAnalysisResponse(data: any, childName: string, title: string): ArtTherapyAnalysis {
  // If the API returned the expected structure, use it
  if (data && typeof data === 'object' && data.primaryEmotion) {
    return {
      primaryEmotion: ensureString(data.primaryEmotion, 'Creativity'),
      secondaryEmotion: ensureString(data.secondaryEmotion, 'Joy'),
      strokeIntensity: ensureString(data.strokeIntensity, 'Confident'),
      colorsUsed: ensureNumber(data.colorsUsed, 5, 0, 20),
      colorExpression: ensureString(data.colorExpression, 'Vibrant and expressive color choices'),
      linesMovement: ensureString(data.linesMovement, 'Shows creative confidence'),
      spaceComposition: ensureString(data.spaceComposition, 'Thoughtful use of space'),
      creativeJourney: ensureString(data.creativeJourney, 'Demonstrates artistic growth'),
      suggestedActions: ensureArray(data.suggestedActions)
    }
  }
  
  // If structure is unexpected, create fallback
  return createFallbackAnalysis(childName, title)
}

// Helper functions
function ensureString(value: any, fallback: string): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }
  return fallback
}

function ensureNumber(value: any, fallback: number, min: number = 0, max: number = 20): number {
  const num = typeof value === 'number' ? value : parseInt(value) || fallback
  return Math.max(min, Math.min(max, num))
}

function ensureArray(value: any): string[] {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string' && item.trim()).map(item => item.trim())
  }
  return [
    'Encourage more art creation',
    'Ask about their creative process',
    'Display the artwork proudly',
    'Try new art materials together',
    'Celebrate their creativity'
  ]
}

// Fallback analysis for when API fails
function createFallbackAnalysis(childName: string, title: string): ArtTherapyAnalysis {
  return {
    primaryEmotion: 'Creativity',
    secondaryEmotion: 'Joy',
    strokeIntensity: 'Confident',
    colorsUsed: 5,
    colorExpression: `${childName}'s color choices in "${title}" show creative expression and emotional engagement with their artwork.`,
    linesMovement: 'The artwork demonstrates developing fine motor skills and creative confidence in mark-making.',
    spaceComposition: 'Shows thoughtful consideration of how to organize elements within the drawing space.',
    creativeJourney: `${childName} is developing their artistic voice and showing growth in creative expression through this piece.`,
    suggestedActions: [
      'Encourage continued art creation',
      'Ask open-ended questions about their artwork',
      'Display their artwork to show appreciation',
      'Provide varied art materials for exploration',
      'Celebrate their creative process, not just the result'
    ]
  }
}

// Age-appropriate context (keeping for potential future use)
const getAgeAppropriateContext = (childAge?: number): string => {
  if (!childAge) return "school-age child"
  
  if (childAge <= 4) {
    return "preschool child (ages 2-4): Focus on basic emotional expression, motor skill development, and simple symbolic representation"
  } else if (childAge <= 7) {
    return "early elementary child (ages 5-7): Consider developing fine motor skills, emerging symbolic thinking, and basic emotional vocabulary"
  } else if (childAge <= 10) {
    return "middle childhood (ages 8-10): Analyze more complex emotional expression, social awareness, and detailed artistic elements"
  } else if (childAge <= 13) {
    return "pre-adolescent (ages 11-13): Consider identity formation, peer relationships, and increasing emotional complexity"
  } else {
    return "adolescent (ages 14+): Focus on identity exploration, emotional regulation, and sophisticated symbolic expression"
  }
}

// Utility function for parent-friendly formatting
export function formatAnalysisForParents(analysis: ArtTherapyAnalysis): {
  summary: string
  keyInsights: string[]
  actionItems: string[]
  wellbeingIndicator: string
} {
  const summary = `Your child's artwork shows ${analysis.primaryEmotion.toLowerCase()} and ${analysis.secondaryEmotion.toLowerCase()}, with ${analysis.colorsUsed} colors used.`
  
  const keyInsights = [
    `Primary emotion: ${analysis.primaryEmotion}`,
    `Artistic approach: ${analysis.strokeIntensity}`,
    `Color expression: ${analysis.colorExpression}`,
    `Creative development: ${analysis.creativeJourney}`
  ]
  
  const actionItems = analysis.suggestedActions.slice(0, 3) // Take first 3 actions
  
  // Simple wellbeing indicator based on stroke intensity and emotions
  const positiveIndicators = ['confident', 'joyful', 'creative', 'happy', 'excited']
  const hasPositiveIndicators = positiveIndicators.some(indicator => 
    analysis.primaryEmotion.toLowerCase().includes(indicator) ||
    analysis.secondaryEmotion.toLowerCase().includes(indicator) ||
    analysis.strokeIntensity.toLowerCase().includes(indicator)
  )
  
  const wellbeingIndicator = hasPositiveIndicators ? 'Positive' : 'Developing'
  
  return { summary, keyInsights, actionItems, wellbeingIndicator }
}

// Batch analysis function (simplified)
export async function analyzeBatchDrawings(
  drawings: Array<{
    imageBase64: string
    childName: string
    title: string
  }>
): Promise<ArtTherapyAnalysis[]> {
  const analyses = await Promise.allSettled(
    drawings.map(drawing => analyzeDrawingWithClaude(drawing))
  )
  
  return analyses.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      console.error(`Analysis failed for drawing ${index}:`, result.reason)
      return createFallbackAnalysis(drawings[index].childName, drawings[index].title)
    }
  })
}
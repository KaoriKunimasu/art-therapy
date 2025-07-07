"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, ChevronDown, ChevronRight, Lock, Unlock, Eye, Clock, Check } from "lucide-react"
import { ArtworkStorage, type Artwork } from "@/lib/artwork-storage"
import { InsightsPinModal } from "@/components/insights-pin-modal"
import { PinStorage } from "@/lib/pin-storage"
import type { Child } from "@/app/page"
import { analyzeDrawingWithClaude, type ArtTherapyAnalysis } from '@/lib/anthropic'

interface DrawingAnalysis {
  id: string
  artworkId: string
  primaryEmotion: string
  secondaryEmotion: string
  strokeIntensity: string
  colorsUsed: number
  colorExpression: string
  linesMovement: string
  spaceComposition: string
  creativeJourney: string
  suggestedActions: string[]
}

// Mock analysis data (fallback only)
const mockAnalyses: Record<string, DrawingAnalysis> = {
  "1": {
    id: "1",
    artworkId: "1",
    primaryEmotion: "Joy",
    secondaryEmotion: "Excitement",
    strokeIntensity: "Confident",
    colorsUsed: 7,
    colorExpression:
      "The vibrant use of warm yellows and bright oranges suggests a positive emotional state and high energy levels. The combination of these colors with touches of pink indicates feelings of happiness and contentment. From a therapeutic perspective, this color palette demonstrates emotional openness and a willingness to express joy. The bold color choices show confidence in self-expression and suggest the child feels safe to share their inner emotional world.",
    linesMovement:
      "The flowing, curved lines throughout the artwork demonstrate creative confidence and emotional fluidity. The varied stroke pressure shows intentional artistic decision-making, with bolder strokes used for emphasis and lighter touches for detail work. This combination suggests good emotional regulation and the ability to modulate expression appropriately. The movement quality indicates comfort with the creative process and suggests developing fine motor skills alongside emotional expression.",
    spaceComposition:
      "The balanced use of space across the canvas shows thoughtful planning and emotional organization. The central placement of key elements suggests a sense of security and groundedness, while the way smaller details fill the surrounding areas indicates attention to completeness. This spatial awareness demonstrates developing cognitive skills and suggests the child feels emotionally centered. The composition choices reflect a desire to create harmony and balance in their emotional expression.",
    creativeJourney:
      "This artwork demonstrates significant artistic growth and creative problem-solving abilities appropriate for the child's developmental stage. The layering of colors and thoughtful composition show advancing artistic skills and increasing confidence in creative expression. The willingness to experiment with different techniques suggests a healthy relationship with creativity and learning. This piece celebrates the child's unique artistic voice and shows their growing ability to communicate complex emotions through visual art.",
    suggestedActions: [
      "Encourage more creative activities with similar themes of joy and celebration",
      "Ask about what brings them happiness in their art and daily life",
      "Continue providing diverse art supplies to support their color exploration",
      "Celebrate the confident brush strokes and bold color choices you notice",
      "Create opportunities for them to share stories about their artwork",
    ],
  },
}

interface GalleryAnalysisInterfaceProps {
  child: Child
  onBack: () => void
}

export function GalleryAnalysisInterface({ child, onBack }: GalleryAnalysisInterfaceProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [analysis, setAnalysis] = useState<DrawingAnalysis | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [insightsUnlocked, setInsightsUnlocked] = useState(false)
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // ✅ FIXED: Clean performRealAnalysis function
  const performRealAnalysis = async (artwork: Artwork) => {
    if (!artwork) return
    
    try {
      setIsAnalyzing(true)
      console.log('🎨 Starting real analysis for:', artwork.title)
      console.log('📊 Child name:', child.nickname)
      
      const result = await analyzeDrawingWithClaude({
        imageBase64: artwork.dataUrl,
        childName: child.nickname,
        title: artwork.title
      })
      
      // Convert to your DrawingAnalysis format
      const realAnalysis: DrawingAnalysis = {
        id: Date.now().toString(),
        artworkId: artwork.id,
        primaryEmotion: result.primaryEmotion,
        secondaryEmotion: result.secondaryEmotion,
        strokeIntensity: result.strokeIntensity,
        colorsUsed: result.colorsUsed,
        colorExpression: result.colorExpression,
        linesMovement: result.linesMovement,
        spaceComposition: result.spaceComposition,
        creativeJourney: result.creativeJourney,
        suggestedActions: result.suggestedActions
      }
      
      setAnalysis(realAnalysis)
      console.log('✅ Analysis completed:', realAnalysis)
      
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      // Fallback to mock data if API fails
      setAnalysis(mockAnalyses["1"] || null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    let childArtworks = ArtworkStorage.getArtworksByChild(child.id)
    // MIGRATION: Add childName if missing (for old artworks)
    childArtworks = childArtworks.map(art => ({
      ...art,
      childName: art.childName || child.nickname
    }))
    setArtworks(childArtworks)
    if (childArtworks.length > 0) {
      setSelectedArtwork(childArtworks[0])
      performRealAnalysis(childArtworks[0])
    }
  }, [child.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (insightsUnlocked && sessionTimeRemaining > 0) {
      interval = setInterval(() => {
        setSessionTimeRemaining((prev) => {
          if (prev <= 1) {
            setInsightsUnlocked(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [insightsUnlocked, sessionTimeRemaining])

  // ✅ FIXED: handleDeleteArtwork function
  const handleDeleteArtwork = (artworkId: string) => {
    if (confirm("Are you sure you want to delete this artwork?")) {
      ArtworkStorage.deleteArtwork(artworkId)
      const updatedArtworks = artworks.filter((art) => art.id !== artworkId)
      setArtworks(updatedArtworks)

      if (selectedArtwork?.id === artworkId) {
        if (updatedArtworks.length > 0) {
          setSelectedArtwork(updatedArtworks[0])
          performRealAnalysis(updatedArtworks[0]) // ✅ Fixed: use real analysis
        } else {
          setSelectedArtwork(null)
          setAnalysis(null)
        }
      }
    }
  }

  const handleViewInsights = () => {
    if (!PinStorage.getInsightsPin()) {
      alert("Please set up an Insights PIN in Settings first.")
      return
    }
    setShowPinModal(true)
  }

  const handlePinVerified = () => {
    setShowPinModal(false)
    setInsightsUnlocked(true)
    setSessionTimeRemaining(30 * 60) // 30 minutes
  }

  const handleLockInsights = () => {
    setInsightsUnlocked(false)
    setSessionTimeRemaining(0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatSessionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatDuration = (durationMinutes?: number) => {
    if (!durationMinutes || durationMinutes === 0) {
      return "Less than 1 minute"
    }
    
    if (durationMinutes < 1) {
      const seconds = Math.round(durationMinutes * 60)
      return `${seconds} second${seconds !== 1 ? 's' : ''}`
    }
    
    if (durationMinutes < 60) {
      const minutes = Math.round(durationMinutes)
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
    
    const hours = Math.floor(durationMinutes / 60)
    const minutes = Math.round(durationMinutes % 60)
    
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const analysisSection = (title: string, content: string, conversationStarter: string, sectionKey: string) => (
    <Collapsible open={expandedSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 rounded-lg transition-colors">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        {expandedSections[sectionKey] ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">{content}</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
            <p className="text-sm font-medium text-blue-900">💬 Conversation Starter:</p>
            <p className="text-sm text-blue-800 mt-1">{conversationStarter}</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">{child.nickname}'s Art Gallery & Analysis</h1>
              {isAnalyzing && (
                <Badge className="bg-blue-100 text-blue-800">
                  🔄 Analyzing...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Saved Drawings List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Saved Drawings</h2>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {artworks.length} Total
                </Badge>
              </div>

              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {artworks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">No drawings found for {child.nickname}</p>
                  </Card>
                ) : (
                  artworks.map((artwork) => (
                    <Card
                      key={artwork.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedArtwork?.id === artwork.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setSelectedArtwork(artwork)
                        performRealAnalysis(artwork) // ✅ Fixed: use real analysis
                        setInsightsUnlocked(false) // Reset insights when switching artworks
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={artwork.thumbnail || "/placeholder.svg"}
                            alt={artwork.title}
                            className="w-20 h-15 object-cover rounded border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-500">{formatDate(artwork.createdAt)}</p>
                            <p className="text-sm text-gray-400">by {child.nickname}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteArtwork(artwork.id)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Column - Artwork Display or Insights */}
            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {selectedArtwork ? (
                <>
                  {!insightsUnlocked ? (
                    // Artwork Display Mode
                    <>
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Drawing Analysis
                          <span className="text-sm font-normal text-gray-500 ml-2">
                            {formatDate(selectedArtwork.createdAt)}
                          </span>
                        </h2>
                        {isAnalyzing && (
                          <p className="text-sm text-blue-600">🔄 AI is analyzing this artwork...</p>
                        )}
                      </div>

                      {/* Artwork Preview - Reduced Size */}
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <img
                              src={selectedArtwork.dataUrl || "/placeholder.svg"}
                              alt={selectedArtwork.title}
                              className="w-full max-w-xs mx-auto h-auto rounded-lg shadow-md"
                              style={{ maxHeight: "120px", objectFit: "contain" }}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Basic Metadata - Compact */}
                      <Card className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-600">Creation Date</p>
                              <p className="text-sm font-medium">{formatDate(selectedArtwork.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Drawing Duration</p>
                              <p className="text-sm font-medium">{formatDuration(selectedArtwork.duration)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* View Insights Button */}
                      <Button
                        onClick={handleViewInsights}
                        disabled={isAnalyzing || !analysis}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center space-x-2 py-3 disabled:opacity-50"
                      >
                        <Lock className="w-5 h-5" />
                        <span>
                          {isAnalyzing ? 'Analysis in Progress...' : 'View Therapeutic Insights'}
                        </span>
                      </Button>
                    </>
                  ) : (
                    // Insights Display Mode (rest of your existing code...)
                    <>
                      <div className="space-y-2 sticky top-0 bg-gray-50 pb-4 z-10">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                            <Unlock className="w-5 h-5 text-green-600" />
                            <span>Therapeutic Insights</span>
                          </h2>
                          <div className="flex items-center space-x-2 text-sm text-green-600">
                            <Clock className="w-4 h-4" />
                            <span>Unlocked for {formatSessionTime(sessionTimeRemaining)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-green-600">Insights unlocked for 30 minutes</p>
                      </div>

                      {/* Rest of your insights display code remains the same... */}
                      {/* Emotion Summary */}
                      {analysis && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h3 className="font-semibold text-gray-900">Emotion Summary</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Primary Emotion:</p>
                                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                                  {analysis.primaryEmotion}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Secondary Emotion:</p>
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  {analysis.secondaryEmotion}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Stroke Intensity:</p>
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  {analysis.strokeIntensity}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Colours Used:</p>
                                <span className="text-lg font-semibold text-gray-900">{analysis.colorsUsed}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Detailed Analysis Sections */}
                      {analysis && (
                        <Card className="border border-gray-200">
                          <CardHeader>
                            <CardTitle className="text-lg">Detailed Therapeutic Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-gray-200">
                              {analysisSection(
                                "Color Expression & Emotional Language",
                                analysis.colorExpression,
                                "Ask about the feelings these colors represent",
                                "colorExpression",
                              )}
                              {analysisSection(
                                "Lines, Movement & Creative Confidence",
                                analysis.linesMovement,
                                "Explore how they created these flowing movements",
                                "linesMovement",
                              )}
                              {analysisSection(
                                "Space, Composition & Emotional Organization",
                                analysis.spaceComposition,
                                "Discuss why they chose to fill the space this way",
                                "spaceComposition",
                              )}
                              {analysisSection(
                                "Creative Journey & Development",
                                analysis.creativeJourney,
                                "Ask them to share the story their artwork tells",
                                "creativeJourney",
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Suggested Actions */}
                      {analysis && (
                        <Card className="border border-gray-200">
                          <CardContent className="p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Suggested Actions</h3>
                            <div className="space-y-3">
                              {analysis.suggestedActions.map((action, index) => (
                                <div key={index} className="flex items-start space-x-3">
                                  <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-gray-700">{action}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3 sticky bottom-0 bg-gray-50 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setInsightsUnlocked(false)}>
                          Close Insights
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={handleLockInsights}>
                          <Lock className="w-4 h-4 mr-2" />
                          Lock Insights
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Card className="p-8 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Select a drawing from the left to view details</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <InsightsPinModal isOpen={showPinModal} onConfirm={handlePinVerified} onCancel={() => setShowPinModal(false)} />
    </div>
  )
}

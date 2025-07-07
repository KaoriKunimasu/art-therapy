"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3 } from "lucide-react"
import { getFamilyStats } from "@/lib/analysis-data"
import type { Child } from "@/app/page"

export function FamilyArtJourneyWidget({ children }: { children: Child[] }) {
  const stats = getFamilyStats(children)

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Family Art Journey</span>
          </CardTitle>
          <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
            <BarChart3 className="w-4 h-4 mr-2" />
            View All Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{stats.weeklyDrawings}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalInsights}</div>
            <div className="text-sm text-gray-600">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.dailyAnalyses}/{stats.maxDailyAnalyses}
            </div>
            <div className="text-sm text-gray-600">Daily Analyses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">3</div>
            <div className="text-sm text-gray-600">Active Children</div>
          </div>
        </div>

        {/* Recent Analyzed Artworks */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Recently Analyzed</h4>
          <div className="flex space-x-3">
            {stats.recentAnalyzedArtworks.map((artwork) => (
              <div key={artwork.id} className="flex-1 max-w-[120px]">
                <div className="relative group cursor-pointer">
                  <img
                    src={artwork.thumbnail || "/placeholder.svg"}
                    alt={`${artwork.theme} by ${artwork.childName}`}
                    className="w-full h-16 object-cover rounded-lg border-2 border-gray-200 group-hover:border-indigo-300 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                </div>
                <div className="mt-2 text-center">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {artwork.theme}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">{artwork.childName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

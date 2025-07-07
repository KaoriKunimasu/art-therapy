"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Zap, Filter, Activity } from "lucide-react"
import { getFamilyStats } from "@/lib/analysis-data"
import type { Child } from "@/app/page"

export function AnalysisQuickActions({ children }: { children: Child[] }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filter, setFilter] = useState("all")
  const stats = getFamilyStats(children)

  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true)
    // Simulate batch processing
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsAnalyzing(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleAnalyzeAll}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Analyze All Pending</span>
              </>
            )}
          </Button>

          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="review">Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Daily analyses:</span>
            <Badge variant="outline" className="font-mono">
              {stats.dailyAnalyses}/{stats.maxDailyAnalyses}
            </Badge>
          </div>
        </div>
      </div>

      {isAnalyzing && (
        <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            <div>
              <div className="text-sm font-medium text-indigo-900">Processing artworks...</div>
              <div className="text-xs text-indigo-700">Analyzing themes, emotions, and developmental indicators</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

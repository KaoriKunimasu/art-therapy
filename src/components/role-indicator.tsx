"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Baby } from "lucide-react"
import type { SessionState } from "@/app/page"

interface RoleIndicatorProps {
  session: SessionState
  onTimeoutWarning: () => void
}

export function RoleIndicator({ session, onTimeoutWarning }: RoleIndicatorProps) {
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (session.user?.role === "child" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1

          // Show warning at 5 minutes (300 seconds)
          if (newTime === 300 && !showWarning) {
            setShowWarning(true)
            onTimeoutWarning()
          }

          // Session expired
          if (newTime <= 0) {
            clearInterval(timer)
            return 0
          }

          return newTime
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [session.user?.role, timeRemaining, showWarning, onTimeoutWarning])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!session.isActive) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Role Indicator Bar */}
      <div
        className={`px-4 py-2 ${
          session.user?.role === "parent" ? "bg-indigo-600" : "bg-gradient-to-r from-pink-500 to-purple-500"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {session.user?.role === "parent" ? (
              <>
                <User className="w-5 h-5 text-white" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Parent View
                </Badge>
              </>
            ) : (
              <>
                <Baby className="w-5 h-5 text-white" />
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Drawing with {session.activeChild?.nickname}
                </Badge>
              </>
            )}
          </div>

          {session.user?.role === "child" && timeRemaining > 0 && (
            <div className="flex items-center space-x-2 text-white">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-sm">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeout Warning */}
      {showWarning && session.user?.role === "child" && (
        <Alert className="mx-4 mt-2 border-orange-500 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Session ending soon!</strong> You have {formatTime(timeRemaining)} remaining.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

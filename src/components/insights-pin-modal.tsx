"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, X } from "lucide-react"
import { PinStorage } from "@/lib/pin-storage"

interface InsightsPinModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function InsightsPinModal({ isOpen, onConfirm, onCancel }: InsightsPinModalProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setPin("")
      setError("")
      checkLockoutStatus()
    }
  }, [isOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isLockedOut && remainingTime > 0) {
      interval = setInterval(() => {
        const remaining = PinStorage.getRemainingLockoutTime()
        setRemainingTime(remaining)
        if (remaining <= 0) {
          setIsLockedOut(false)
          setError("")
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isLockedOut, remainingTime])

  const checkLockoutStatus = () => {
    const lockedOut = PinStorage.isLockedOut()
    setIsLockedOut(lockedOut)
    if (lockedOut) {
      setRemainingTime(PinStorage.getRemainingLockoutTime())
    }
  }

  const handleNumberClick = (number: string) => {
    if (pin.length < 4 && !isLockedOut) {
      setPin((prev) => prev + number)
    }
  }

  const handleClear = () => {
    setPin("")
    setError("")
  }

  const handleVerify = () => {
    if (pin.length !== 4) return

    if (PinStorage.verifyInsightsPin(pin)) {
      PinStorage.resetFailedAttempts()
      setPin("")
      setError("")
      onConfirm()
    } else {
      const attempts = PinStorage.incrementFailedAttempts()
      if (attempts >= 3) {
        setError("Too many attempts. Try again in 5 minutes.")
        setIsLockedOut(true)
        setRemainingTime(PinStorage.getRemainingLockoutTime())
      } else {
        setError("Incorrect PIN. Try again.")
      }
      setPin("")
    }
  }

  const handleCancel = () => {
    setPin("")
    setError("")
    onCancel()
  }

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center space-x-2">
            <Lock className="w-5 h-5" />
            <span>Enter Analysis PIN</span>
          </DialogTitle>
          <p className="text-center text-sm text-gray-600 mt-2">Access detailed therapeutic observations</p>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLockedOut && (
            <Alert>
              <AlertDescription>Account locked. Try again in {formatTime(remainingTime)}</AlertDescription>
            </Alert>
          )}

          {/* PIN Display */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg flex items-center justify-center text-xl font-bold"
              >
                {pin[index] ? "•" : ""}
              </div>
            ))}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {numbers.slice(0, 9).map((number) => (
              <Button
                key={number}
                variant="outline"
                size="lg"
                className="h-16 text-xl font-semibold hover:bg-indigo-50"
                onClick={() => handleNumberClick(number)}
                disabled={isLockedOut}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="lg"
              className="h-16 text-lg hover:bg-red-50"
              onClick={handleClear}
              disabled={isLockedOut}
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 text-xl font-semibold hover:bg-indigo-50"
              onClick={() => handleNumberClick("0")}
              disabled={isLockedOut}
            >
              0
            </Button>
            <div></div> {/* Empty space */}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              onClick={handleVerify}
              disabled={pin.length !== 4 || isLockedOut}
            >
              Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

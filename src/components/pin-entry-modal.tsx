"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface PinEntryModalProps {
  isOpen: boolean
  childName: string
  onConfirm: (pin: string) => void
  onCancel: () => void
  error: string
}

export function PinEntryModal({ isOpen, childName, onConfirm, onCancel, error }: PinEntryModalProps) {
  const [pin, setPin] = useState("")

  const handleNumberClick = (number: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + number)
    }
  }

  const handleClear = () => {
    setPin("")
  }

  const handleConfirm = () => {
    if (pin.length === 4) {
      onConfirm(pin)
      setPin("")
    }
  }

  const handleCancel = () => {
    setPin("")
    onCancel()
  }

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Enter PIN for {childName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
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
              >
                {number}
              </Button>
            ))}
            <Button variant="outline" size="lg" className="h-16 text-lg hover:bg-red-50" onClick={handleClear}>
              <X className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-16 text-xl font-semibold hover:bg-indigo-50"
              onClick={() => handleNumberClick("0")}
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
              onClick={handleConfirm}
              disabled={pin.length !== 4}
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

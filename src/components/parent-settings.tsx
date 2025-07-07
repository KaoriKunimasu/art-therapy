"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, CheckCircle } from "lucide-react"
import { PinStorage } from "@/lib/pin-storage"

interface ParentSettingsProps {
  onBack: () => void
}

export function ParentSettings({ onBack }: ParentSettingsProps) {
  const [newPin, setNewPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [hasExistingPin, setHasExistingPin] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    setHasExistingPin(!!PinStorage.getInsightsPin())
  }, [])

  const handleSavePin = () => {
    setError("")
    setSuccess("")

    if (newPin.length !== 4) {
      setError("PIN must be exactly 4 digits")
      return
    }

    if (!/^\d{4}$/.test(newPin)) {
      setError("PIN must contain only numbers")
      return
    }

    if (newPin !== confirmPin) {
      setError("PINs do not match")
      return
    }

    PinStorage.setInsightsPin(newPin)
    setSuccess("Insights PIN saved successfully")
    setHasExistingPin(true)
    setNewPin("")
    setConfirmPin("")
  }

  const isFormValid = newPin.length === 4 && confirmPin.length === 4 && newPin === confirmPin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Therapeutic Insights Protection</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Set a 4-digit PIN to protect detailed analysis from children</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="newPin">{hasExistingPin ? "Enter new 4-digit PIN" : "Enter 4-digit PIN"}</Label>
                <Input
                  id="newPin"
                  type="password"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.slice(0, 4))}
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div>
                <Label htmlFor="confirmPin">Confirm PIN</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.slice(0, 4))}
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <Button
                onClick={handleSavePin}
                disabled={!isFormValid}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {hasExistingPin ? "Change PIN" : "Save PIN"}
              </Button>
            </div>

            {hasExistingPin && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Insights PIN is currently set</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

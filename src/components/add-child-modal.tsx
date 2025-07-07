"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User } from "lucide-react"
import type { Child } from "@/app/page"

interface AddChildModalProps {
  isOpen: boolean
  onClose: () => void
  onAddChild: (child: Omit<Child, "id">) => void
}

export function AddChildModal({ isOpen, onClose, onAddChild }: AddChildModalProps) {
  const [nickname, setNickname] = useState("")
  const [ageRange, setAgeRange] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const ageRanges = ["4-6", "7-9", "10-12", "12+"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!nickname.trim()) {
      setError("Please enter a nickname")
      return
    }

    if (nickname.trim().length < 2) {
      setError("Nickname must be at least 2 characters")
      return
    }

    if (!ageRange) {
      setError("Please select an age range")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newChild: Omit<Child, "id"> = {
        nickname: nickname.trim(),
        ageRange,
        pin: "0000", // Default PIN
        avatar: "/placeholder.svg?height=80&width=80",
      }

      onAddChild(newChild)
      handleClose()
    } catch (error) {
      setError("Failed to add child. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setNickname("")
    setAgeRange("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center space-x-2">
            <User className="w-5 h-5" />
            <span>Add New Child</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="nickname">Child's Nickname</Label>
            <Input
              id="nickname"
              type="text"
              placeholder="Enter nickname (e.g., Emma, Alex)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isSubmitting}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ageRange">Age Range</Label>
            <Select value={ageRange} onValueChange={setAgeRange} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                {ageRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range} years old
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
              {isSubmitting ? "Adding Child..." : "Add Child"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

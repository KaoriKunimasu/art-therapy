"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Palette } from "lucide-react"
import { signInUser, signInWithGoogle, signUpUser, resetPassword } from "@/lib/firebase"

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
  onGoogleLogin: (user: any) => void
  isLoading: boolean
  error: string
}

export function LoginPage({ onLogin, onGoogleLogin, isLoading, error }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [socialError, setSocialError] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isSignUpLoading, setIsSignUpLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState("")
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setEmailError("")
    setPasswordError("")

    // Validation
    let hasErrors = false

    if (!email) {
      setEmailError("Email is required")
      hasErrors = true
    } else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      hasErrors = true
    }

    if (!password) {
      setPasswordError("Password is required")
      hasErrors = true
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      hasErrors = true
    }

    if (!hasErrors) {
      if (isSignUp) {
        await handleSignUp()
      } else {
        onLogin(email, password)
      }
    }
  }

  const handleSignUp = async () => {
    setIsSignUpLoading(true)
    setEmailError("")
    setPasswordError("")

    try {
      const result = await signUpUser(email, password)
      if (result.success && result.user) {
        // Show success message and switch to sign in mode
        setEmailError("")
        setPasswordError("")
        setSuccessMessage("Account created successfully! Please sign in with your new credentials.")
        setIsSignUp(false)
        // Clear the form
        setEmail("")
        setPassword("")
        // You could add a success message here if needed
      } else {
        if (result.error?.includes("email")) {
          setEmailError(result.error)
        } else if (result.error?.includes("password")) {
          setPasswordError(result.error)
        } else {
          setEmailError(result.error || "Sign up failed")
        }
      }
    } catch (error) {
      setEmailError("Sign up failed. Please try again.")
    } finally {
      setIsSignUpLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    setSocialError("")

    try {
      const result = await signInWithGoogle()
      if (result.success && result.user) {
        onGoogleLogin(result.user)
      } else {
        setSocialError(result.error || "Google sign-in failed. Please try again.")
      }
    } catch (error) {
      setSocialError("Google sign-in failed. Please try again.")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      setForgotPasswordError("Please enter your email address")
      return
    }

    if (!validateEmail(forgotPasswordEmail)) {
      setForgotPasswordError("Please enter a valid email address")
      return
    }

    setIsForgotPasswordLoading(true)
    setForgotPasswordError("")
    setForgotPasswordSuccess("")

    try {
      const result = await resetPassword(forgotPasswordEmail)
      if (result.success) {
        setForgotPasswordSuccess("Password reset email sent! Please check your inbox.")
        setForgotPasswordEmail("")
      } else {
        setForgotPasswordError(result.error || "Failed to send reset email")
      }
    } catch (error) {
      setForgotPasswordError("Failed to send reset email. Please try again.")
    } finally {
      setIsForgotPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Family Art Therapy</CardTitle>
          <CardDescription className="text-gray-600">
            {isSignUp ? "Create your account to get started" : "Sign in to access your family's creative space"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500 focus:border-red-500" : ""}
                disabled={isLoading || isSignUpLoading}
              />
              {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500 focus:border-red-500" : ""}
                disabled={isLoading || isSignUpLoading}
              />
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700" 
              disabled={isLoading || isSignUpLoading}
            >
              {isLoading || isSignUpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignUp ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>

            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setForgotPasswordEmail(email) // Pre-fill with current email if available
                    setForgotPasswordError("")
                    setForgotPasswordSuccess("")
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setEmailError("")
                setPasswordError("")
                setSocialError("")
                setSuccessMessage("")
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              disabled={isLoading || isSignUpLoading}
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          {/* Social Sign-in Buttons */}
          <div className="space-y-3">
            {socialError && <div className="text-sm text-red-600 text-center">{socialError}</div>}

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading || isSignUpLoading}
              className="w-full h-12 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sign in with Google"
            >
              {isGoogleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Welcome to Family Art Therapy!</strong>
              <br />
              Create an account to start your family's creative journey.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {forgotPasswordError && (
                <Alert variant="destructive">
                  <AlertDescription>{forgotPasswordError}</AlertDescription>
                </Alert>
              )}

              {forgotPasswordSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>{forgotPasswordSuccess}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={isForgotPasswordLoading}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleForgotPassword}
                  disabled={isForgotPasswordLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {isForgotPasswordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Email"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotPasswordEmail("")
                    setForgotPasswordError("")
                    setForgotPasswordSuccess("")
                  }}
                  disabled={isForgotPasswordLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

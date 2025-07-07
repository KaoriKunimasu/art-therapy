"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { ParentDashboard } from "@/components/parent-dashboard"
import { ChildDrawingInterface } from "@/components/child-drawing-interface"
import { signInUser, signInWithGoogle, signInWithApple, signOutUser, onAuthStateChange, getCurrentUser } from "@/lib/firebase"
import type { User as FirebaseUser } from "firebase/auth"

export type User = {
  id: string
  name: string
  email: string
  role: "parent" | "child"
}

export type Child = {
  id: string
  nickname: string
  ageRange: string
  avatar: string
  pin: string
}

export type SessionState = {
  isActive: boolean
  user: User | null
  activeChild: Child | null
  timeRemaining: number
}

export default function App() {
  const [session, setSession] = useState<SessionState>({
    isActive: false,
    user: null,
    activeChild: null,
    timeRemaining: 0,
  })

  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check for existing Firebase auth state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setSession({
          isActive: true,
          user: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || "",
            email: firebaseUser.email || "",
            role: "parent",
          },
          activeChild: null,
          timeRemaining: 0,
        })
      } else {
        // User is signed out
        setSession({
          isActive: false,
          user: null,
          activeChild: null,
          timeRemaining: 0,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError("")

    const result = await signInUser(email, password)
    if (result.success && result.user) {
      setSession({
        isActive: true,
        user: {
          id: result.user.uid,
          name: result.user.displayName || result.user.email || "",
          email: result.user.email || "",
          role: "parent",
        },
        activeChild: null,
        timeRemaining: 0,
      })
    } else {
      setError(result.error || "Login failed")
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = async (firebaseUser: FirebaseUser) => {
    setSession({
      isActive: true,
      user: {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "",
        email: firebaseUser.email || "",
        role: "parent",
      },
      activeChild: null,
      timeRemaining: 0,
    })
  }

  const handleAppleLogin = async (firebaseUser: FirebaseUser) => {
    setSession({
      isActive: true,
      user: {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email || "",
        email: firebaseUser.email || "",
        role: "parent",
      },
      activeChild: null,
      timeRemaining: 0,
    })
  }

  const handleAddChild = (childData: Omit<Child, "id">) => {
    const newChild: Child = {
      ...childData,
      id: Date.now().toString(),
    }
    setChildren((prev) => [...prev, newChild])
  }

  const handleStartSession = (child: Child) => {
    setSession((prev) => ({
      ...prev,
      user: {
        id: child.id,
        name: child.nickname,
        email: "",
        role: "child",
      },
      activeChild: child,
      timeRemaining: 30 * 60,
    }))
  }

  const handleReturnToParent = () => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setSession((prev) => ({
        ...prev,
        user: {
          id: currentUser.uid,
          name: currentUser.displayName || currentUser.email || "",
          email: currentUser.email || "",
          role: "parent",
        },
        activeChild: null,
        timeRemaining: 0,
      }))
    }
  }

  const handleLogout = async () => {
    try {
      await signOutUser()
      setSession({
        isActive: false,
        user: null,
        activeChild: null,
        timeRemaining: 0,
      })
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (!session.isActive) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onGoogleLogin={handleGoogleLogin}
        onAppleLogin={handleAppleLogin}
        isLoading={isLoading} 
        error={error} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session.user?.role === "parent" ? (
        <ParentDashboard
          user={session.user}
          children={children}
          onStartSession={handleStartSession}
          onLogout={handleLogout}
          onAddChild={handleAddChild}
        />
      ) : (
        <ChildDrawingInterface child={session.activeChild!} onReturnToParent={handleReturnToParent} />
      )}
    </div>
  )
}

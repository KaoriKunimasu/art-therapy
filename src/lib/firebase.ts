import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'

// Firebase configuration
// You'll need to replace these with your actual Firebase config values
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Auth providers
const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

// Types
export interface AuthResult {
  success: boolean
  user?: FirebaseUser | null
  error?: string
}

// Email/Password Sign In
export const signInUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error: any) {
    let errorMessage = "An error occurred during sign in"
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No account found with this email address"
        break
      case 'auth/wrong-password':
        errorMessage = "Incorrect password"
        break
      case 'auth/invalid-email':
        errorMessage = "Invalid email address"
        break
      case 'auth/user-disabled':
        errorMessage = "This account has been disabled"
        break
      case 'auth/too-many-requests':
        errorMessage = "Too many failed attempts. Please try again later"
        break
      default:
        errorMessage = error.message || "Sign in failed"
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Google Sign In
export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return {
      success: true,
      user: result.user
    }
  } catch (error: any) {
    let errorMessage = "Google sign in failed"
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign in was cancelled"
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "Sign in popup was blocked. Please allow popups for this site"
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Apple Sign In
export const signInWithApple = async (): Promise<AuthResult> => {
  try {
    const result = await signInWithPopup(auth, appleProvider)
    return {
      success: true,
      user: result.user
    }
  } catch (error: any) {
    let errorMessage = "Apple sign in failed"
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Sign in was cancelled"
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = "Sign in popup was blocked. Please allow popups for this site"
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Sign Up
export const signUpUser = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user
    }
  } catch (error: any) {
    let errorMessage = "An error occurred during sign up"
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "An account with this email already exists"
        break
      case 'auth/invalid-email':
        errorMessage = "Invalid email address"
        break
      case 'auth/weak-password':
        errorMessage = "Password is too weak. Please choose a stronger password"
        break
      default:
        errorMessage = error.message || "Sign up failed"
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Password Reset
export const resetPassword = async (email: string): Promise<AuthResult> => {
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true
    }
  } catch (error: any) {
    let errorMessage = "An error occurred during password reset"
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "No account found with this email address"
        break
      case 'auth/invalid-email':
        errorMessage = "Invalid email address"
        break
      case 'auth/too-many-requests':
        errorMessage = "Too many requests. Please try again later"
        break
      default:
        errorMessage = error.message || "Password reset failed"
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Sign Out
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

// Auth State Observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser
}

export { auth } 
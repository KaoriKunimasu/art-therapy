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
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getFirestore, doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const storage = getStorage(app)
const db = getFirestore(app)

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

// Firebase Storage helpers
export const uploadArtworkImage = async (imageDataUrl: string, artworkId: string): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `artworks/${artworkId}/image.png`)
    await uploadBytes(storageRef, blob)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error uploading artwork image:', error)
    throw error
  }
}

export const uploadArtworkThumbnail = async (thumbnailDataUrl: string, artworkId: string): Promise<string> => {
  try {
    // Convert data URL to blob
    const response = await fetch(thumbnailDataUrl)
    const blob = await response.blob()
    
    // Upload to Firebase Storage
    const storageRef = ref(storage, `artworks/${artworkId}/thumbnail.jpg`)
    await uploadBytes(storageRef, blob)
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error uploading artwork thumbnail:', error)
    throw error
  }
}

export const deleteArtworkFromStorage = async (artworkId: string): Promise<void> => {
  try {
    // Delete image
    const imageRef = ref(storage, `artworks/${artworkId}/image.png`)
    await deleteObject(imageRef)
    
    // Delete thumbnail
    const thumbnailRef = ref(storage, `artworks/${artworkId}/thumbnail.jpg`)
    await deleteObject(thumbnailRef)
  } catch (error) {
    console.error('Error deleting artwork from storage:', error)
    throw error
  }
}

// Firestore helpers for artwork metadata
export const saveArtworkMetadata = async (artwork: any): Promise<void> => {
  try {
    const docRef = doc(db, 'artworks', artwork.id)
    await setDoc(docRef, {
      ...artwork,
      userId: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error saving artwork metadata:', error)
    throw error
  }
}

export const getArtworkMetadata = async (artworkId: string): Promise<any | null> => {
  try {
    const docRef = doc(db, 'artworks', artworkId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    }
    return null
  } catch (error) {
    console.error('Error getting artwork metadata:', error)
    throw error
  }
}

export const getArtworksByChild = async (childId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, 'artworks'),
      where('childId', '==', childId),
      where('userId', '==', auth.currentUser?.uid)
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error getting artworks by child:', error)
    throw error
  }
}

export const deleteArtworkMetadata = async (artworkId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'artworks', artworkId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting artwork metadata:', error)
    throw error
  }
}

export { auth, storage, db }
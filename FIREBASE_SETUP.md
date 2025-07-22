# Firebase Setup Guide

## Authentication Setup

This guide will help you set up Firebase Authentication and Firestore for the Therapy Canvas application.

### Step 1: Firebase Console Configuration

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `therapycanvas-d1b03`
3. **Navigate to Authentication**: In the left sidebar, click "Authentication"

### Step 2: Update Firestore Rules

1. **Navigate to Firestore**: In the left sidebar, click "Firestore Database"
2. **Click on "Rules" tab**
3. **Replace the existing rules** with the content from `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read and write their own artwork metadata
    match /artworks/{artworkId} {
      allow read, write: if request.auth != null 
        && request.auth.uid != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Allow authenticated users to read and write their own user data
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write their own children data
    match /children/{childId} {
      allow read, write: if request.auth != null 
        && request.auth.uid != null
        && request.auth.uid == resource.data.userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. **Click "Publish"** to save the rules

### Step 3: Enable Authentication Methods

1. **Navigate to Authentication**: In the left sidebar, click "Authentication"
2. **Click on "Sign-in method" tab**
3. **Enable the following providers**:
   - **Email/Password**: Click "Enable" and save
   - **Google**: Click "Enable", configure OAuth consent screen, and save

### Step 4: Add Authorized Domains

1. **In Authentication**, click on "Settings" tab
2. **Scroll down to "Authorized domains"**
3. **Add the following domains**:
   - `localhost`
   - `localhost:3000`
   - Your production domain (when ready)

### Step 5: Environment Variables

Make sure your `.env.local` file has the correct Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=therapycanvas-d1b03.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=therapycanvas-d1b03
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 6: Test the Setup

1. **Restart your development server**: `npm run dev`
2. **Try to sign in**: The authentication should work properly
3. **Check the console**: You should see success messages instead of errors

## Troubleshooting

### If authentication fails:

1. **Verify your Firebase config** in `.env.local`
2. **Check if Authentication is enabled** in Firebase Console
3. **Ensure authorized domains** include localhost

### If Firestore access fails:

1. **Check Firestore rules** are published
2. **Verify you have sufficient quota**
3. **Check browser console** for detailed error messages

## Security Notes

- The rules provided allow authenticated users to access their own data
- For production, consider more restrictive rules based on your needs
- Always test thoroughly before deploying to production

## Data Storage

This application now uses localStorage for artwork storage instead of Firebase Storage. This provides:
- Faster access to artwork data
- No network dependencies for artwork storage
- Simplified setup and maintenance
- Better offline functionality

Artwork metadata can still be stored in Firestore if needed for cross-device synchronization. 

---

## **How to Fix Firebase Storage CORS Errors**

### 1. **Set CORS Rules for Your Storage Bucket**

Firebase Storage buckets do **not** allow cross-origin requests by default.  
You must set CORS rules using the Google Cloud CLI.

#### **A. Install the Google Cloud SDK (if you haven’t already)**
- [Download and install the gcloud CLI](https://cloud.google.com/sdk/docs/install)

#### **B. Authenticate with your Google account**
```sh
gcloud auth login
```

#### **C. Set your project**
```sh
gcloud config set project therapycanvas-d1b03
```

#### **D. Create a CORS configuration file (cors.json)**
Create a file named `cors.json` with the following content:
```json
[
  {
    "origin": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-meta-custom"]
  }
]
```
- Add your production domain to the `origin` array when you deploy.

#### **E. Apply the CORS rules to your bucket**
```sh
gsutil cors set cors.json gs://therapycanvas-d1b03.appspot.com
```
- If you get a "gsutil: command not found" error, make sure the Google Cloud SDK is installed and initialized.

---

### 2. **Restart Your App and Test Again**

- After running the above command, CORS should be fixed for your local development and you should be able to upload and download images from Firebase Storage.

---

## **Why This Works**

- The Firebase Console UI does **not** provide a way to set CORS for Storage.  
- The CORS rules must be set using the `gsutil` tool from the Google Cloud SDK.

---

## **Summary Checklist**

- [x] Firebase config includes `storageBucket`
- [x] `.env.local` is correct
- [x] Firebase Storage rules allow authenticated users
- [x] **CORS rules set using `gsutil cors set`**

---

**If you follow these steps, your CORS errors will be resolved.**  
If you need a step-by-step for your OS or run into issues with `gsutil`, let me know! 
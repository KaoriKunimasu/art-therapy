# Firebase Authentication Setup

This project now uses Firebase Authentication for secure user login. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Follow the setup wizard

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Enable and configure
   - **Google**: Enable and configure (add your domain to authorized domains)
   - **Apple**: Enable and configure (requires Apple Developer account)

## 3. Get Your Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) to add a web app if you haven't already
4. Copy the configuration object

## 4. Set Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here
```

Replace the values with your actual Firebase configuration.

## 5. Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings
2. Add your domain to "Authorized domains" for production
3. For development, `localhost` should already be included

## 6. Test the Authentication

1. Start your development server: `npm run dev`
2. Try signing in with email/password
3. Test Google and Apple sign-in (if configured)

## Features Implemented

- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Apple Sign-In
- ✅ Automatic session persistence
- ✅ Secure logout
- ✅ Error handling for all auth methods
- ✅ User-friendly error messages

## Demo Mode

If you don't have Firebase configured, the app will use demo credentials:
- Email: `parent@example.com`
- Password: `password`

## Security Notes

- All Firebase config variables are prefixed with `NEXT_PUBLIC_` to work with client-side authentication
- The Firebase configuration is safe to expose in the client as it's designed for public use
- User authentication state is managed securely by Firebase
- Session persistence is handled automatically by Firebase Auth

## Troubleshooting

- **"Firebase App named '[DEFAULT]' already exists"**: This is normal if you have multiple Firebase instances
- **"auth/popup-blocked"**: Allow popups for your domain
- **"auth/unauthorized-domain"**: Add your domain to Firebase authorized domains
- **Apple Sign-In not working**: Ensure you have a valid Apple Developer account and have configured Sign in with Apple 
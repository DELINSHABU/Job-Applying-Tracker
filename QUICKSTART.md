# Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### 1. Set Up Firebase (One-time setup)

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable **Authentication** → Email/Password AND Google
4. Enable **Firestore Database** → Production mode
5. Add Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /jobs/{jobId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```
6. Go to Project Settings → Your apps → Copy the config object

### 2. Configure Your App

Open `firebase-config.js` and replace these values from your Firebase config:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                    // ← Replace this
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Replace this
    projectId: "YOUR_PROJECT_ID",              // ← Replace this
    storageBucket: "YOUR_PROJECT_ID.appspot.com",   // ← Replace this
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Replace this
    appId: "YOUR_APP_ID"                       // ← Replace this
};
```

### 3. Run the App

```bash
python3 -m http.server 8000
```

Open: http://localhost:8000

### 4. Create Account & Use

1. Click "🔐 Login / Sign Up"
2. Choose sign-in method:
   - Email/Password: Go to "Sign Up" tab, enter email & password
   - Google: Click "Continue with Google"
3. Start tracking jobs!

### 5. Import/Export Data

- **Export**: Click "📤 Export to XML" to backup your data
- **Import**: Click "📥 Import XML" to restore or transfer data

## What You Get

✅ **Cloud Storage** - Access from any device
✅ **Private Data** - Your data is secure and private
✅ **Auto Sync** - Changes save automatically
✅ **Free Forever** - Firebase free tier is generous

## Need Help?

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions.

## Files Overview

- `index.html` - The web page
- `script.js` - App logic (authentication + data)
- `styles.css` - Styling
- `firebase-config.js` - **YOU NEED TO CONFIGURE THIS**
- `FIREBASE_SETUP.md` - Detailed setup guide
- `README.md` - Full documentation

That's it! 🎉

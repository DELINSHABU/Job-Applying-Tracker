# Firebase Setup Guide

This guide will help you set up Firebase Authentication and Firestore for your Job Application Tracker.

## Prerequisites

- A Google account
- Web browser

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Job Application Tracker")
4. (Optional) Enable Google Analytics if you want usage statistics
5. Click **"Create project"** and wait for it to be created
6. Click **"Continue"** once the project is ready

## Step 2: Register Your Web App

1. In the Firebase Console, click on the **Web icon** (</>) to add a web app
2. Enter an app nickname (e.g., "Job Tracker Web")
3. **Do NOT** check "Set up Firebase Hosting" (unless you plan to host on Firebase)
4. Click **"Register app"**
5. You'll see a configuration code block - **Keep this page open**, you'll need these values

## Step 3: Enable Authentication

1. In the Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab

### Enable Email/Password
4. Click on **"Email/Password"**
5. Toggle **"Enable"** to ON
6. Click **"Save"**

### Enable Google Sign-In
7. Click on **"Google"** in the sign-in providers list
8. Toggle **"Enable"** to ON
9. Select a support email from the dropdown (your email)
10. Click **"Save"**

## Step 4: Set Up Firestore Database

1. In the Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set up rules next)
4. Select a Firestore location (choose one closest to your users)
5. Click **"Enable"**

### Configure Firestore Security Rules

1. In Firestore Database, click on the **"Rules"** tab
2. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users can only read/write their own root doc and any nested subcollections
    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```

3. Click **"Publish"**

These rules ensure that:
- Users must be authenticated to access data
- Users can only see and modify their own documents and subcollections
- Features that store data outside `jobs` (such as profile, scraping settings, suggested jobs, goals, and streak stats) can load and save correctly
- Data is private and secure per user

## Step 5: Configure Your Application

1. Go back to **Project Settings** (click the gear icon ⚙️ in the sidebar)
2. Scroll down to **"Your apps"** section
3. You'll see your Firebase configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

4. Open `firebase-config.js` in your project folder
5. Replace the placeholder values with your actual Firebase configuration:
   - Replace `YOUR_API_KEY` with your `apiKey`
   - Replace `YOUR_PROJECT_ID` with your `projectId` (appears 3 times)
   - Replace `YOUR_MESSAGING_SENDER_ID` with your `messagingSenderId`
   - Replace `YOUR_APP_ID` with your `appId`

**Example:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "job-tracker-12345.firebaseapp.com",
    projectId: "job-tracker-12345",
    storageBucket: "job-tracker-12345.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

6. Save the file

## Step 6: Run Your Application

Since the app uses Firebase, you need to serve it over HTTP:

### Option 1: Using Python
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Option 2: Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run
http-server -p 8000
```

### Option 3: Using PHP
```bash
php -S localhost:8000
```

Then open your browser and go to: `http://localhost:8000`

## How to Use

### First Time Setup

1. Click **"🔐 Login / Sign Up"** button
2. Choose one of the following options:
   - **Email/Password**: Click "Sign Up" tab, enter email and password (min 6 chars)
   - **Google Sign-In**: Click "Continue with Google" button
3. You're now logged in and can start adding job applications!

### Adding Job Applications

1. Click **"+ Add Job Application"**
2. Fill in the job details
3. Click **"Save"**
4. Your data is automatically saved to Firebase Firestore

### Accessing From Another Device

1. Open the app on any device
2. Sign in with your credentials (email/password or Google)
3. All your job applications will load automatically!

### Importing Data

1. If you have previously exported data as XML, click **"📥 Import XML"**
2. Select your XML export file
3. The app will:
   - Import all job applications from the file
   - Skip any duplicates (based on job ID)
   - Save imported jobs to your Firestore database
4. You'll see a summary showing how many items were imported

### Exporting Data

1. Click **"📤 Export to XML"**
2. Your browser will download an XML file with all your job applications
3. Use this as a backup or to import data on another account

## Features

✅ **Secure Authentication** - Email/password or Google Sign-In via Firebase
✅ **Cloud Storage** - Data stored in Firestore, accessible from any device
✅ **Real-time Sync** - Changes are instantly saved to the cloud
✅ **Private Data** - Each user can only see their own applications
✅ **Import/Export** - Import and export job data as XML
✅ **No Installation** - Works directly in the browser
✅ **Cross-Device** - Access your data from any device with a browser

## Data Structure

Your data is stored in Firestore with the following structure:

```
users (collection)
  └── {userId} (document)
      └── jobs (collection)
          ├── {jobId} (document)
          │   ├── id: string
          │   ├── companyName: string
          │   ├── position: string
          │   ├── website: string
          │   ├── jobListing: string
          │   ├── salary: string
          │   ├── location: string
          │   ├── email: string
          │   ├── phone: string
          │   ├── jobPostDate: string
          │   ├── appliedDate: string
          │   ├── platform: string
          │   ├── status: string
          │   ├── notes: string
          │   └── createdAt: string
          └── ...
```

## Troubleshooting

### "Firebase is not configured properly"
- Make sure you've replaced all placeholder values in `firebase-config.js`
- Check that your Firebase configuration is correct
- Look at the browser console (F12) for detailed error messages

### "Failed to load your data"
- Check your internet connection
- Verify Firestore security rules are set up correctly
- Make sure you're signed in

### "Authentication failed"
- For sign up: Make sure password is at least 6 characters
- For sign in: Verify your email and password are correct
- Check that Email/Password authentication is enabled in Firebase Console

### Can't access the app
- Make sure you're running a local server (not just opening the HTML file)
- Check that port 8000 is not being used by another application
- Try a different port if needed

### Security Rules Error
- Go to Firestore → Rules in Firebase Console
- Make sure the rules are published
- Rules may take a few seconds to propagate

## Security Best Practices

1. **Never commit firebase-config.js to public repositories** - Consider adding it to `.gitignore`
2. **Use strong passwords** - Minimum 6 characters, but longer is better
3. **Enable additional security** - Consider enabling email verification in Firebase Console
4. **Monitor usage** - Check Firebase Console regularly for unusual activity
5. **Set up budget alerts** - Firebase has a free tier, but set up alerts to avoid surprises

## Cost Information

Firebase offers a generous free tier (Spark plan):
- **Authentication**: 50,000 MAU (Monthly Active Users) free
- **Firestore**: 50,000 reads/day, 20,000 writes/day, 1 GB storage free
- **Hosting**: 10 GB storage, 360 MB/day transfer free

For a personal job tracker, you'll likely never exceed the free tier.

## Next Steps

1. **Backup Your Data**: Use the XML export feature regularly as a backup
2. **Enable Email Verification**: In Firebase Console → Authentication → Templates
3. **Add Password Reset**: Implement password reset functionality
4. **Share with Friends**: Help others track their job applications too!

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Review Firebase Console for any alerts or errors
3. Verify all configuration steps were completed
4. Check Firebase status page for any service outages

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)

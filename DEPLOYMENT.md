# Deployment Guide

## Live Site URL
- https://job-tracker-f18bc.web.app
- https://job-tracker-f18bc.firebaseapp.com

## How to Deploy Updates

After making code changes:

1. **Push to GitHub** (using GitHub Desktop or your Git client)

2. **Open terminal** in your project folder:
   ```
   C:\Users\celin\OneDrive\Documents\GitHub\Job-Applying-Tracker
   ```

3. **Build the project first** (compiles your source code into `dist/`):
   ```powershell
   npm run build
   ```

4. **Then deploy to Firebase:**
   ```powershell
   firebase deploy --only hosting
   ```

   > ⚠️ **Important:** Always run `npm run build` before deploying!
   > Firebase only uploads the `dist/` folder. If you skip the build step,
   > your latest code changes will NOT appear on the live site.

   Or run both steps in one command:
   ```powershell
   npm run build; firebase deploy --only hosting
   ```

5. **Done!** Your site will update within a few seconds.

## First-Time Setup (Already Completed)

If you need to set up Firebase Hosting on a new machine:

1. Install Firebase CLI:
   ```powershell
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```powershell
   firebase login
   ```

3. Then deploy as usual:
   ```powershell
   firebase deploy --only hosting
   ```

## Troubleshooting

- **Not logged in?** Run `firebase login`
- **Wrong project?** Run `firebase use job-tracker-f18bc`
- **Check deployment status:** Visit [Firebase Console](https://console.firebase.google.com/project/job-tracker-f18bc/hosting)

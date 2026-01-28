# Fix: "Google Sign-In is not properly configured"

This error means the Google Sign-In provider is not enabled in your Firebase Console.

## Quick Fix (5 minutes)

### Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com/
2. Select your project

### Step 2: Enable Google Sign-In Provider
1. Click **Authentication** in the left sidebar
2. Click **Sign-in method** tab at the top
3. Look for **Google** in the list of providers
4. Click on **Google**
5. Toggle the **Enable** switch to **ON**
6. In the dropdown, select your **support email** (your email address)
7. Click **Save**

### Step 3: Verify Authorized Domains
1. While still in Authentication, click the **Settings** tab
2. Scroll down to **Authorized domains**
3. Make sure these are listed:
   - `localhost` ✓
   - `127.0.0.1` (might need to add manually)
4. If `localhost` is not there, click **Add domain** and add it

### Step 4: Test Again
1. Refresh your app page
2. Try Google Sign-In again
3. Should work now!

## Visual Guide

```
Firebase Console
│
├─ Authentication
│  ├─ Sign-in method tab
│  │  └─ Google [Enable ✓]
│  │     └─ Support email: [Select your email]
│  │     └─ Save
│  │
│  └─ Settings tab
│     └─ Authorized domains
│        ├─ localhost ✓
│        └─ 127.0.0.1 (add if needed)
```

## What Each Step Does

**Enable Google Provider:**
- Allows users to sign in with Google accounts
- Required for the "Continue with Google" button to work

**Support Email:**
- Required by Google OAuth
- Shown to users when they sign in
- Usually your email address

**Authorized Domains:**
- Lists domains allowed to use Firebase Authentication
- `localhost` needed for local development
- Your production domain needed when hosting online

## Common Issues

### "Can't find Authentication"
- Make sure you've created a Firebase project first
- Authentication should be in the left sidebar

### "Google option is grayed out"
- Your project might not be set up properly
- Try refreshing the Firebase Console page

### Still getting error after enabling
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh the app page
3. Try signing in again

### Error persists
Check if you have:
- ✓ Email/Password provider enabled (should already be on)
- ✓ Google provider enabled
- ✓ Support email selected
- ✓ Clicked "Save"
- ✓ localhost in authorized domains

## Alternative: Email/Password Sign-In

If you don't want to use Google Sign-In, you can:
1. Click "Sign Up" tab instead
2. Create account with email and password
3. This should work immediately (Email/Password is already enabled)

## Screenshots Reference

When you enable Google Sign-In, you should see:
- Toggle switch turns **green** (enabled)
- Status shows "Enabled"
- Your support email is displayed

## Need More Help?

Run the diagnostic script from `DIAGNOSTIC.md` to check:
1. If Firebase is configured properly
2. If Google provider can be created
3. Exact error codes

In browser console (F12), run:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider)
    .then(r => console.log("Success!", r.user.email))
    .catch(e => console.log("Error:", e.code, e.message));
```

This will show the exact error.

## Success Indicators

When properly configured, you should:
1. See the Google sign-in popup window open
2. Be able to select your Google account
3. See "Google Sign-In successful: [your-email]" in console
4. Modal closes automatically
5. Your email appears in the header

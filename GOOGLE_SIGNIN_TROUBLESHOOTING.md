# Google Sign-In Troubleshooting Guide

If you're getting "Failed to sign in with Google. Please try again." error, follow these steps:

## Quick Checklist

✅ **Step 1: Check Firebase Console**
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Verify **Google** is enabled (should have green checkmark)
5. Make sure you selected a support email

✅ **Step 2: Check Authorized Domains**
1. In Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure these domains are listed:
   - `localhost`
   - `127.0.0.1`
4. If hosting online, add your domain

✅ **Step 3: Check Your Configuration**
1. Open `firebase-config.js`
2. Verify all values are replaced (no `YOUR_` placeholders)
3. Make sure `authDomain` is correct (usually `your-project.firebaseapp.com`)

✅ **Step 4: Check Browser Console**
1. Open Developer Tools (F12)
2. Go to **Console** tab
3. Try Google Sign-In again
4. Look for error messages

## Common Error Codes and Solutions

### Error: `auth/unauthorized-domain`
**Problem**: Your domain is not authorized in Firebase

**Solution**:
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost` if testing locally
3. Add your production domain if hosting online

### Error: `auth/operation-not-allowed`
**Problem**: Google Sign-In provider not enabled

**Solution**:
1. Firebase Console → Authentication → Sign-in method
2. Click on "Google"
3. Toggle "Enable" to ON
4. Select support email
5. Click "Save"

### Error: `auth/popup-blocked`
**Problem**: Browser blocked the popup

**Solution**:
1. Look for popup blocker icon in address bar
2. Click and allow popups for this site
3. Try again

### Error: `auth/network-request-failed`
**Problem**: No internet connection or Firebase is down

**Solution**:
1. Check your internet connection
2. Check Firebase status: https://status.firebase.google.com/
3. Try again

### Error: Firebase not defined
**Problem**: Firebase scripts not loaded

**Solution**:
1. Make sure you're running via HTTP server (not file://)
2. Check internet connection (Firebase CDN)
3. Look for script errors in console

## Step-by-Step Testing

### Test 1: Verify Firebase is Loaded
Open browser console (F12) and type:
```javascript
console.log(firebase);
console.log(auth);
```
- Should show Firebase objects
- If undefined, Firebase scripts didn't load

### Test 2: Check Firebase Config
In console, type:
```javascript
console.log(firebase.apps[0].options);
```
- Should show your config (apiKey, authDomain, etc.)
- Verify authDomain matches your project

### Test 3: Test Google Provider
In console, type:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
console.log(provider);
```
- Should show GoogleAuthProvider object
- If error, Firebase Auth not loaded properly

### Test 4: Manual Sign-In Test
In console, try:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider)
  .then(result => console.log('Success:', result))
  .catch(error => console.log('Error:', error.code, error.message));
```
- This will show the exact error code and message

## Detailed Error Messages

With the updated code, you should now see detailed error messages in the browser console. Look for:

```
Google Sign-In error: [error object]
Error code: auth/xxxxx
Error message: [detailed message]
```

Common codes:
- `auth/popup-closed-by-user` - User closed the popup (not an error)
- `auth/cancelled-popup-request` - Multiple popups requested (ignore)
- `auth/popup-blocked` - Browser blocked popup
- `auth/unauthorized-domain` - Domain not authorized
- `auth/operation-not-allowed` - Provider not enabled
- `auth/network-request-failed` - Network issue

## Hosting Issues

### If using file:// protocol
Google Sign-In **will not work** with `file://` URLs. You MUST use HTTP server:

```bash
# Use Python
python3 -m http.server 8000

# Or Node.js
npx http-server -p 8000

# Or PHP
php -S localhost:8000
```

Then access: `http://localhost:8000`

### If hosting online
1. Add your domain to Firebase authorized domains
2. Make sure you're using HTTPS (required for production)
3. Update authorized JavaScript origins in Google Cloud Console if needed

## Firebase Console Double-Check

Go through this checklist in Firebase Console:

1. **Project Settings**
   - Verify project ID matches your config
   - Check API key is correct

2. **Authentication → Sign-in method**
   - Email/Password: Enabled ✓
   - Google: Enabled ✓
   - Support email selected ✓

3. **Authentication → Settings**
   - Authorized domains include localhost ✓

4. **Firestore Database**
   - Database created ✓
   - Rules configured ✓

## Still Not Working?

### Get Detailed Error Info
1. Open browser DevTools (F12)
2. Go to Console tab
3. Clear console
4. Try Google Sign-In
5. Copy ALL error messages
6. Look for the `Error code:` line

### Check Firebase Project Status
1. Go to Firebase Console
2. Check if project has any warnings/errors
3. Verify billing is not an issue (shouldn't be on free tier)

### Browser-Specific Issues

**Chrome/Edge:**
- Check if third-party cookies are blocked
- Settings → Privacy → Cookies → Allow all cookies (temporarily for testing)

**Firefox:**
- Check Enhanced Tracking Protection
- Shield icon in address bar → Turn off for this site

**Safari:**
- Preferences → Privacy → Uncheck "Prevent cross-site tracking"

### Try Alternative Approach

If popup doesn't work, you can use redirect method:

1. In browser console, try:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithRedirect(provider);
```

2. After redirect, check result:
```javascript
auth.getRedirectResult()
  .then(result => console.log(result))
  .catch(error => console.log(error));
```

## Need More Help?

1. **Check Console Errors**: Look at browser DevTools console for exact error
2. **Verify Configuration**: Make sure Firebase config is correct
3. **Test Different Browser**: Try in incognito/private mode
4. **Check Firebase Status**: https://status.firebase.google.com/

## Configuration Template

Your `firebase-config.js` should look like this:

```javascript
const firebaseConfig = {
    apiKey: "AIza...",                              // Real API key
    authDomain: "your-project-id.firebaseapp.com",  // Must match project
    projectId: "your-project-id",                   // From Firebase
    storageBucket: "your-project-id.appspot.com",   // From Firebase
    messagingSenderId: "123456789012",              // From Firebase
    appId: "1:123456789012:web:abc123"             // From Firebase
};
```

**All values must be real - no placeholders!**

## Success Indicators

When working correctly, you should see:
1. Google account picker popup opens
2. No errors in console
3. After selecting account: "Google Sign-In successful: [your-email]"
4. Modal closes automatically
5. Your email appears in header
6. Jobs list loads

## Report the Specific Error

If still having issues, please provide:
1. Exact error code from console (e.g., `auth/unauthorized-domain`)
2. Full error message
3. Whether you're using localhost or online hosting
4. Browser and version
5. Screenshot of Firebase Authentication settings

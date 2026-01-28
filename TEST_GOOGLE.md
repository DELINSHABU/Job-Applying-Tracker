# Test Google Sign-In - Find the Real Error

Since Firebase Console shows Google is enabled, let's find the actual error.

## Quick Test (30 seconds)

### Step 1: Open Browser Console
1. Open your app: http://localhost:8000
2. Press **F12** (or Right-click → Inspect)
3. Click **Console** tab

### Step 2: Run This Command

Copy and paste this into the console and press Enter:

```javascript
(async function testGoogleSignIn() {
    console.log("=== Testing Google Sign-In ===");
    console.log("1. Checking Firebase...");
    
    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase not loaded!");
        return;
    }
    console.log("✓ Firebase loaded");
    
    console.log("\n2. Checking Auth...");
    if (typeof auth === 'undefined') {
        console.error("❌ Auth not loaded!");
        return;
    }
    console.log("✓ Auth loaded");
    
    console.log("\n3. Creating Google Provider...");
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        console.log("✓ Provider created");
    } catch (e) {
        console.error("❌ Provider creation failed:", e);
        return;
    }
    
    console.log("\n4. Attempting Google Sign-In...");
    console.log("(Popup should open now...)");
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await auth.signInWithPopup(provider);
        
        console.log("\n✅ SUCCESS!");
        console.log("User email:", result.user.email);
        console.log("Display name:", result.user.displayName);
        console.log("Sign-in successful!");
        
    } catch (error) {
        console.log("\n❌ FAILED!");
        console.log("==========================================");
        console.log("ERROR CODE:", error.code);
        console.log("ERROR MESSAGE:", error.message);
        console.log("==========================================");
        
        console.log("\nDiagnosing issue...");
        
        switch(error.code) {
            case 'auth/popup-blocked':
                console.log("→ Browser blocked the popup");
                console.log("→ Solution: Allow popups for this site");
                break;
                
            case 'auth/unauthorized-domain':
                console.log("→ Domain not authorized in Firebase");
                console.log("→ Current domain:", window.location.hostname);
                console.log("→ Solution: Add this domain to Firebase Console");
                console.log("   Firebase Console → Authentication → Settings → Authorized domains");
                break;
                
            case 'auth/operation-not-allowed':
                console.log("→ Google provider is NOT enabled");
                console.log("→ Solution: Enable it in Firebase Console");
                console.log("   Firebase Console → Authentication → Sign-in method → Google");
                break;
                
            case 'auth/popup-closed-by-user':
                console.log("→ You closed the popup");
                console.log("→ Solution: Try again and select an account");
                break;
                
            case 'auth/network-request-failed':
                console.log("→ Network error or Firebase is down");
                console.log("→ Solution: Check internet connection");
                break;
                
            case 'auth/internal-error':
                console.log("→ Internal Firebase error");
                console.log("→ This might be a configuration issue");
                console.log("→ Check firebase-config.js has correct values");
                break;
                
            default:
                console.log("→ Unknown error:", error.code);
                console.log("→ Full error details above");
        }
        
        console.log("\n📋 Firebase Config Check:");
        try {
            const config = firebase.apps[0].options;
            console.log("Project ID:", config.projectId);
            console.log("Auth Domain:", config.authDomain);
            console.log("API Key:", config.apiKey ? "Set (length: " + config.apiKey.length + ")" : "NOT SET");
        } catch (e) {
            console.log("Could not read config:", e.message);
        }
    }
    
    console.log("\n=== Test Complete ===");
})();
```

### Step 3: Read the Output

The test will show you:
- ✓ What's working
- ❌ What's failing
- **ERROR CODE** - The exact error
- **Solution** - What to fix

## Common Error Codes & Solutions

### `auth/popup-blocked`
**What it means:** Browser blocked the popup  
**Fix:** Look for popup blocker icon in address bar, click and allow

### `auth/unauthorized-domain`
**What it means:** Your domain (localhost) is not in Firebase authorized list  
**Fix:** 
1. Firebase Console → Authentication → Settings
2. Authorized domains → Add domain → `localhost`

### `auth/operation-not-allowed`
**What it means:** Google provider is actually NOT enabled (despite what you see)  
**Fix:**
1. Firebase Console → Authentication → Sign-in method
2. Click on "Google"
3. Make sure toggle is GREEN and says "Enabled"
4. Select support email again
5. Click Save

### `auth/popup-closed-by-user`
**What it means:** You closed the popup before selecting account  
**Fix:** Run test again, this time select a Google account

### `auth/internal-error`
**What it means:** Configuration problem  
**Fix:** Check `firebase-config.js` - all values must be real (no `YOUR_` placeholders)

## What to Look For

After running the test, tell me:
1. The **ERROR CODE** (e.g., `auth/popup-blocked`)
2. Whether the popup opened or not
3. The current domain shown in the output

## Quick Checks

**Check 1:** Is popup blocker active?
- Look for icon in browser address bar
- Usually shows "popup blocked" notification

**Check 2:** Is config correct?
Open `firebase-config.js` and verify:
```javascript
apiKey: "AIza..." // Real key, not "YOUR_API_KEY"
authDomain: "your-project.firebaseapp.com" // Real domain
projectId: "your-project-id" // Real project ID
```

**Check 3:** Browser issues?
Try in incognito/private mode:
- Chrome: Ctrl+Shift+N
- Firefox: Ctrl+Shift+P

## Still Not Working?

If the test shows an error, copy this info:
1. The ERROR CODE from console
2. Your browser name and version
3. Whether popup opened
4. Current domain (shown in test output)

Then we can provide specific solution for your exact error.

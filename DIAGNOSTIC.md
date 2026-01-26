# Google Sign-In Diagnostic Script

Copy and paste this script into your browser console (F12 → Console tab) to diagnose Google Sign-In issues:

```javascript
console.log("=== Firebase & Google Sign-In Diagnostic ===\n");

// Check 1: Firebase loaded
console.log("1. Checking Firebase...");
if (typeof firebase !== 'undefined') {
    console.log("✅ Firebase is loaded");
    console.log("   Version:", firebase.SDK_VERSION);
} else {
    console.log("❌ Firebase is NOT loaded - Check script tags in HTML");
}

// Check 2: Auth loaded
console.log("\n2. Checking Firebase Auth...");
if (typeof auth !== 'undefined') {
    console.log("✅ Firebase Auth is loaded");
} else {
    console.log("❌ Firebase Auth is NOT loaded");
}

// Check 3: Firebase config
console.log("\n3. Checking Firebase Config...");
if (firebase.apps.length > 0) {
    const config = firebase.apps[0].options;
    console.log("✅ Firebase initialized");
    console.log("   Project ID:", config.projectId);
    console.log("   Auth Domain:", config.authDomain);
    console.log("   API Key:", config.apiKey ? "Set (" + config.apiKey.substring(0, 10) + "...)" : "NOT SET");
    
    if (config.projectId.includes('YOUR_')) {
        console.log("❌ WARNING: Config contains placeholder values!");
    }
} else {
    console.log("❌ Firebase NOT initialized");
}

// Check 4: Current auth state
console.log("\n4. Checking Auth State...");
const currentUser = auth.currentUser;
if (currentUser) {
    console.log("✅ User is signed in");
    console.log("   Email:", currentUser.email);
    console.log("   UID:", currentUser.uid);
} else {
    console.log("⚠️  No user signed in (this is OK if you haven't logged in yet)");
}

// Check 5: Test Google Provider
console.log("\n5. Testing Google Provider...");
try {
    const provider = new firebase.auth.GoogleAuthProvider();
    console.log("✅ Google Provider created successfully");
    console.log("   Provider ID:", provider.providerId);
} catch (error) {
    console.log("❌ Error creating Google Provider:", error.message);
}

// Check 6: Network connectivity
console.log("\n6. Checking Network...");
if (navigator.onLine) {
    console.log("✅ Browser reports online");
} else {
    console.log("❌ Browser reports OFFLINE");
}

// Check 7: Test Google Sign-In
console.log("\n7. Ready to test Google Sign-In");
console.log("Run this command to test:");
console.log("\n   testGoogleSignIn()\n");

// Create test function
window.testGoogleSignIn = async function() {
    console.log("Starting Google Sign-In test...");
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        console.log("Opening Google Sign-In popup...");
        const result = await auth.signInWithPopup(provider);
        
        console.log("✅ SUCCESS!");
        console.log("   User:", result.user.email);
        console.log("   Display Name:", result.user.displayName);
        console.log("   Provider:", result.credential.providerId);
        
    } catch (error) {
        console.log("❌ FAILED");
        console.log("   Error Code:", error.code);
        console.log("   Error Message:", error.message);
        console.log("\n   Troubleshooting tips:");
        
        switch(error.code) {
            case 'auth/popup-blocked':
                console.log("   → Enable popups for this site in browser settings");
                break;
            case 'auth/popup-closed-by-user':
                console.log("   → You closed the popup - try again");
                break;
            case 'auth/unauthorized-domain':
                console.log("   → Add this domain to Firebase Console → Authentication → Settings → Authorized domains");
                break;
            case 'auth/operation-not-allowed':
                console.log("   → Enable Google Sign-In in Firebase Console → Authentication → Sign-in method");
                break;
            default:
                console.log("   → See GOOGLE_SIGNIN_TROUBLESHOOTING.md for more help");
        }
    }
};

console.log("\n=== Diagnostic Complete ===");
console.log("\nNext steps:");
console.log("1. Review any ❌ errors above");
console.log("2. Run: testGoogleSignIn() to test sign-in");
console.log("3. Check GOOGLE_SIGNIN_TROUBLESHOOTING.md for solutions");
```

## Quick Test

After running the diagnostic, test Google Sign-In by running:
```javascript
testGoogleSignIn()
```

## What to Look For

### ✅ Good Signs
- All checks show green ✅
- Config shows real values (not placeholders)
- Google Provider creates successfully

### ❌ Problems
- Firebase not loaded → Check HTML script tags
- Config has placeholders → Update firebase-config.js
- Provider creation fails → Check Firebase Auth scripts

## Common Fixes

### Firebase Not Loaded
Check `index.html` has these scripts:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
<script src="firebase-config.js"></script>
```

### Config Has Placeholders
Edit `firebase-config.js` and replace ALL `YOUR_` values with real Firebase config values.

### Google Provider Fails
1. Check Firebase Console → Authentication → Sign-in method
2. Enable "Google" provider
3. Select support email
4. Save

## Manual Test Commands

### Check if Google popup works at all:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider)
    .then(r => console.log("Success!", r.user.email))
    .catch(e => console.log("Error:", e.code, e.message));
```

### Check authorized domains:
```javascript
console.log("Current domain:", window.location.hostname);
console.log("Auth domain:", firebase.apps[0].options.authDomain);
```

### Force account selection:
```javascript
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });
auth.signInWithPopup(provider);
```

## Get Help

If diagnostic shows errors, check:
1. GOOGLE_SIGNIN_TROUBLESHOOTING.md
2. Firebase Console Authentication settings
3. Browser console for detailed error messages

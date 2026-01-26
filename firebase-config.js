// Firebase Configuration
// IMPORTANT: Replace these values with your own Firebase project credentials
// See FIREBASE_SETUP.md for detailed setup instructions

const firebaseConfig = {
    apiKey: "AIzaSyAM7jisSpIKMFvwHPJBkkxhdFRKQwOBJAg",
    authDomain: "job-tracker-f18bc.firebaseapp.com",
    projectId: "job-tracker-f18bc",
    storageBucket: "job-tracker-f18bc.firebasestorage.app",
    messagingSenderId: "229135559373",
    appId: "1:229135559373:web:8f06cb4ff6957d08689784"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    alert("Firebase is not configured properly. Please check firebase-config.js and follow the setup guide in FIREBASE_SETUP.md");
}

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import type { Job, User, UserProfile } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM7jisSpIKMFvwHPJBkkxhdFRKQwOBJAg",
  authDomain: "job-tracker-f18bc.firebaseapp.com",
  projectId: "job-tracker-f18bc",
  storageBucket: "job-tracker-f18bc.firebasestorage.app",
  messagingSenderId: "229135559373",
  appId: "1:229135559373:web:8f06cb4ff6957d08689784"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Convert Firebase User to our User type
const toUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
});

// Auth functions
export const authService = {
  // Sign in with email/password
  signIn: async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return toUser(result.user);
  },

  // Sign up with email/password
  signUp: async (email: string, password: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return toUser(result.user);
  },

  // Sign in with Google
  signInWithGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return toUser(result.user);
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await signOut(auth);
  },

  // Subscribe to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? toUser(firebaseUser) : null);
    });
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? toUser(firebaseUser) : null;
  },
};

// Firestore job operations
export const jobsService = {
  // Get all jobs for a user
  getJobs: async (userId: string): Promise<Job[]> => {
    const jobsRef = collection(db, 'users', userId, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  },

  // Save a job (create or update)
  saveJob: async (userId: string, job: Job): Promise<void> => {
    const jobRef = doc(db, 'users', userId, 'jobs', job.id);
    await setDoc(jobRef, job);
  },

  // Delete a job
  deleteJob: async (userId: string, jobId: string): Promise<void> => {
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobRef);
  },
};

// Firestore profile operations
export const profileService = {
  // Get user profile
  getProfile: async (userId: string): Promise<UserProfile | null> => {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const snapshot = await getDoc(profileRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    return snapshot.data() as UserProfile;
  },

  // Save user profile (create or update)
  saveProfile: async (userId: string, profile: UserProfile): Promise<void> => {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    await setDoc(profileRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },

  // Create initial profile for new user
  createInitialProfile: async (userId: string, email: string, displayName: string | null): Promise<UserProfile> => {
    const now = new Date().toISOString();
    const initialProfile: UserProfile = {
      name: displayName || '',
      email: email,
      phone: '',
      location: '',
      skills: [],
      experienceSummary: '',
      resumeUrl: '',
      portfolioUrl: '',
      githubUrl: '',
      targetSalaryMin: undefined,
      targetSalaryMax: undefined,
      preferredLocations: [],
      aiProvider: 'gemini',
      onboardingComplete: false,
      createdAt: now,
      updatedAt: now,
    };
    
    await profileService.saveProfile(userId, initialProfile);
    return initialProfile;
  },

  // Check if profile exists
  hasProfile: async (userId: string): Promise<boolean> => {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    const snapshot = await getDoc(profileRef);
    return snapshot.exists();
  },

  // Mark onboarding as complete
  completeOnboarding: async (userId: string): Promise<void> => {
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    await setDoc(profileRef, {
      onboardingComplete: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  },
};

// Auth error messages
export const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
    'auth/unauthorized-domain': 'This domain is not authorized for sign in.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  };
  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
};

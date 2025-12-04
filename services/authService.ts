import { auth, db, googleProvider } from "../firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  increment 
} from "firebase/firestore";
import { UserProfile } from "../types";

// Helper to prevent hanging on slow DB connections
const withTimeout = <T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallbackValue), ms))
  ]);
};

export const authService = {
  // Register new user and assign 10 free credits
  register: async (email: string, pass: string, name: string, username: string): Promise<UserProfile> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      // Update the Auth Profile with the Display Name
      try {
        await updateProfile(user, {
            displayName: name
        });
      } catch (e) {
        console.warn("Failed to update auth profile name", e);
      }
      
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        username: username,
        credits: 10 // Starting credits
      };

      // Try to save to Firestore, but don't fail registration if DB is unreachable
      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: name,
          username: username,
          credits: 10,
          createdAt: new Date()
        });
      } catch (dbError) {
        console.warn("Could not create Firestore profile (likely offline), proceeding with auth only:", dbError);
      }

      return newProfile;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Login existing user and fetch profile
  login: async (email: string, pass: string): Promise<UserProfile> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      // Default fallback profile
      const fallbackProfile: UserProfile = { 
        uid: user.uid, 
        email: user.email, 
        credits: 10,
        displayName: user.displayName || undefined
      };

      // Race against a 2.5s timeout. If DB is slow, just let the user in.
      try {
        const profile = await withTimeout(
          authService.getUserProfile(user.uid),
          2500, // 2.5s max wait time
          null
        );
        
        if (profile) {
          return profile;
        }
      } catch (e) {
        console.warn("Failed to fetch user profile quickly, using fallback:", e);
      }

      return fallbackProfile;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  loginWithGoogle: async (): Promise<UserProfile> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Default fallback
      const fallbackProfile: UserProfile = { 
          uid: user.uid, 
          email: user.email, 
          credits: 10,
          displayName: user.displayName || undefined 
      };

      // Check if user already exists in DB to preserve credits
      // Use timeout to prevent popup hanging after close
      let existingProfile: UserProfile | null = null;
      try {
        existingProfile = await withTimeout(
          authService.getUserProfile(user.uid),
          2500,
          null
        );
      } catch (e) {
        console.warn("Error checking existing Google user:", e);
      }

      if (existingProfile) {
        return existingProfile;
      }

      // New Google user (or failed to fetch), create profile with 10 credits
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || undefined,
        credits: 10
      };

      try {
        // Fire and forget - don't await this if it might take too long, or assume success
        setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          credits: 10,
          createdAt: new Date()
        }, { merge: true }).catch(err => console.warn("Background profile create failed", err));
      } catch (dbError) {
        console.warn("Could not create Firestore profile for Google user:", dbError);
      }

      return newProfile;
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  },

  logout: async () => {
    await signOut(auth);
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  // Get user profile from Firestore
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: uid,
          email: data.email,
          credits: data.credits ?? 0,
          displayName: data.displayName,
          username: data.username
        };
      }
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
         console.warn("Firestore offline. Using local fallback profile.");
         return null;
      }
      console.error("Error fetching user profile:", error);
      return null;
    }
    return null;
  },

  // Deduct 1 credit
  deductCredit: async (uid: string): Promise<number> => {
    try {
      const userRef = doc(db, "users", uid);
      
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
         const currentCredits = docSnap.data().credits || 0;
         if (currentCredits <= 0) {
           throw new Error("Insufficient credits");
         }
      }

      await updateDoc(userRef, {
        credits: increment(-1)
      });

      const updatedSnap = await getDoc(userRef);
      return updatedSnap.data()?.credits ?? 0;
    } catch (error: any) {
      if (error.code === 'unavailable' || error.message?.includes('offline')) {
        return 9; 
      }
      console.error("Error deducting credit:", error);
      return 9; 
    }
  },

  // Mock Purchase Function
  purchaseCredits: async (uid: string, amount: number): Promise<number> => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        credits: increment(amount)
      });
      const updatedSnap = await getDoc(userRef);
      return updatedSnap.data()?.credits || 0;
    } catch (error) {
      console.error("Error purchasing credits:", error);
      throw error;
    }
  }
};
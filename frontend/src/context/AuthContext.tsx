"use client";

/**
 * context/AuthContext.tsx
 * ----------------------
 * Global authentication context.
 * Wraps the app with Firebase Auth state and provides:
 *   - user object (Firebase User)
 *   - loading state
 *   - sign in / sign out methods
 *   - getIdToken helper for API calls
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getAuth, googleProvider, githubProvider } from "@/lib/firebase";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ----------------------------------------------------------------
// Provider
// ----------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Auto-register new users with the backend
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err: any) {
          // If the backend is down, we don't want to crash the frontend or spam logs
          if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
            console.warn("Backend server not reached for auto-registration (likely offline).");
          } else {
            console.error("Auto-register failed:", err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(getAuth(), googleProvider);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with GitHub
  const signInWithGithub = async () => {
    setLoading(true);
    try {
      await signInWithPopup(getAuth(), githubProvider);
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Email/Password
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
    } finally {
      setLoading(false);
    }
  };

  // Sign up with Email/Password
  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(getAuth(), email, password);
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    await firebaseSignOut(getAuth());
    setUser(null);
  };

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    return user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ----------------------------------------------------------------
// Hook
// ----------------------------------------------------------------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

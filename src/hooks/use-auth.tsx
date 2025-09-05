
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile, UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Omit<UserProfile, 'uid' | 'email'> & {email: string, password: string}) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/', '/signup'];
const roleRedirects: Record<UserRole, string> = {
  user: '/dashboard',
  doctor: '/doctor',
  it_team: '/it-team',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = { uid: user.uid, ...userDoc.data() } as UserProfile;
          setUserProfile(profile);
          // Redirect based on role if not on the correct page
          const expectedPath = roleRedirects[profile.role];
          if (pathname !== expectedPath && !publicRoutes.includes(pathname)) {
            router.replace(expectedPath);
          }
        } else {
          // User exists in Auth but not Firestore, log them out.
          await signOut(auth);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        // If on a protected route, redirect to login
        if (!publicRoutes.includes(pathname)) {
          router.replace('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);


  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // The onAuthStateChanged listener will handle the redirect.
  };

  const signup = async (data: Omit<UserProfile, 'uid'> & {password: string}) => {
    const { name, email, password, role, bayName, seatNumber, wifiName } = data;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfileData: Omit<UserProfile, 'uid'> = {
        name,
        email,
        role,
        bayName: bayName || '',
        seatNumber: seatNumber || '',
        wifiName: wifiName || '',
        avatar: `https://i.pravatar.cc/150?u=${user.uid}`
    };

    await setDoc(doc(db, "users", user.uid), userProfileData);

    // After signup, log the user out and redirect to login
    await signOut(auth);
    router.push('/');
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

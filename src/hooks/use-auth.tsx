
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
  logout: () => Promise<void>;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/'];
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
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const profile = { uid: user.uid, ...userDoc.data() } as UserProfile;
          setUserProfile(profile);
          
          const expectedPathPrefix = roleRedirects[profile.role];
          const isAuthRoute = publicRoutes.includes(pathname);
          const isOnCorrectDashboard = pathname.startsWith(expectedPathPrefix);

          // If on an auth page, redirect to correct dashboard
          if (isAuthRoute) {
            router.replace(expectedPathPrefix);
          } 
          // If on the wrong dashboard, redirect them
          else if (!isOnCorrectDashboard) {
             // Exception for mock page
            if (pathname !== '/dashboard/mock-ai-signals') {
                router.replace(expectedPathPrefix);
            }
          }

        } else {
          // This can happen if user exists in Auth but not Firestore
          await signOut(auth);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        if (!publicRoutes.includes(pathname)) {
          router.replace('/');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  // Using a stable reference for router and pathname
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);


  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, setUserProfile }}>
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

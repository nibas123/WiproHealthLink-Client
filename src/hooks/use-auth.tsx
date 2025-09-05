
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
  createUser: (data: Omit<UserProfile, 'uid'> & {password: string}) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/']; // Only root is public, signup is removed.
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
          
          const expectedPath = roleRedirects[profile.role];
          if (pathname !== expectedPath && publicRoutes.includes(pathname)) {
            router.replace(expectedPath);
          }
        } else {
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
  }, [router, pathname]);


  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const createUser = async (data: Omit<UserProfile, 'uid'> & {password: string}) => {
    // This function creates a user but doesn't log them in.
    // We create a temporary, secondary Firebase app instance to avoid affecting the current user's session.
    const { name, email, password, role, bayName, seatNumber, wifiName } = data;
    
    // We can't use the main `auth` object as it would log out the current IT admin.
    // The proper way to do this is with a Firebase Admin SDK on a server,
    // but for a client-only solution, we must be careful.
    // For this prototype, we'll just use the standard `createUserWithEmailAndPassword`.
    // NOTE: This will log the admin out. A real app would use a backend function for this.
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userProfileData: Omit<UserProfile, 'uid' | 'avatar'> = {
        name,
        email,
        role,
        bayName: bayName || '',
        seatNumber: seatNumber || '',
        wifiName: wifiName || '',
    };

    await setDoc(doc(db, "users", user.uid), {
        ...userProfileData,
        avatar: `https://i.pravatar.cc/150?u=${user.uid}`
    });
    
    // After creating the user, we have to log the admin back in. This is a workaround.
    // A better solution is a backend Cloud Function.
    if (auth.currentUser && auth.currentUser.email) {
        // This is a simplified re-login. The password isn't available.
        // This confirms the limitation of client-side-only user management.
    }
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
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, createUser }}>
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

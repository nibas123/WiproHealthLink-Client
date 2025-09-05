
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, query, orderBy, setDoc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MedicalHistory, EmergencyAlert, User } from '@/lib/types';
import { medicalHistory as initialMedicalHistory } from '@/lib/data';

interface GlobalState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  medicalHistory: MedicalHistory | null;
  setMedicalHistory: (history: Partial<MedicalHistory>) => Promise<void>;
  alerts: EmergencyAlert[];
  addAlert: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [medicalHistory, setMedicalHistoryState] = useState<MedicalHistory | null>(null);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollectionRef);
        const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Set up listeners for alerts
  useEffect(() => {
    const alertsCollectionRef = collection(db, 'alerts');
    const q = query(alertsCollectionRef, orderBy('timestamp', 'desc'));
    const unsubAlerts = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyAlert));
      setAlerts(alertsData);
      setLoading(false)
    }, (error) => {
        console.error("Error fetching alerts:", error);
        setLoading(false);
    });

    return () => unsubAlerts();
  }, []);

  // Listener for the current user's medical history
  useEffect(() => {
    if (!currentUser) {
      setMedicalHistoryState(null);
      return;
    }

    const medicalHistoryDocRef = doc(db, 'medicalHistory', currentUser.id);
    const unsubHistory = onSnapshot(medicalHistoryDocRef, (doc) => {
      if (doc.exists()) {
        setMedicalHistoryState(doc.data() as MedicalHistory);
      } else {
        // If doc doesn't exist for the user, create it with initial data
        const newHistory = { ...initialMedicalHistory };
        setDoc(medicalHistoryDocRef, newHistory);
        setMedicalHistoryState(newHistory);
      }
    }, (error) => {
        console.error("Error fetching medical history:", error);
    });
    
    return () => unsubHistory();
  }, [currentUser]);

  const handleSetMedicalHistory = async (historyUpdate: Partial<MedicalHistory>) => {
    if (!currentUser) return;
    const docRef = doc(db, 'medicalHistory', currentUser.id);
    await setDoc(docRef, historyUpdate, { merge: true });
  };

  const addAlert = async (alertData: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => {
     await addDoc(collection(db, "alerts"), {
      ...alertData,
      status: 'Pending',
      timestamp: new Date().toISOString(),
    });
  }

  const acknowledgeAlert = async (id: string) => {
    const docRef = doc(db, 'alerts', id);
    await updateDoc(docRef, { status: 'Acknowledged' });
  };

  if (loading && users.length === 0) {
      return (
          <div className="w-full h-screen flex items-center justify-center">
              <p>Loading application data...</p>
          </div>
      )
  }

  return (
    <GlobalStateContext.Provider value={{ 
        currentUser, 
        setCurrentUser, 
        users,
        medicalHistory, 
        setMedicalHistory: handleSetMedicalHistory, 
        alerts, 
        addAlert, 
        acknowledgeAlert 
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

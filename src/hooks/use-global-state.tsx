"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, doc, onSnapshot, updateDoc, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { MedicalHistory, EmergencyAlert } from '@/lib/types';
import { medicalHistory as initialMedicalHistory } from '@/lib/data';

interface GlobalState {
  medicalHistory: MedicalHistory;
  setMedicalHistory: (history: Partial<MedicalHistory>) => Promise<void>;
  alerts: EmergencyAlert[];
  setAlerts: (alerts: EmergencyAlert[]) => void; // This will be used for local updates, firebase will handle backend
  addAlert: (alert: Omit<EmergencyAlert, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>(initialMedicalHistory);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data and set up listeners
  useEffect(() => {
    // There is only one medical history document, with a known ID
    const medicalHistoryDocRef = doc(db, 'medicalHistory', 'user-jane-doe');
    const unsubHistory = onSnapshot(medicalHistoryDocRef, (doc) => {
      if (doc.exists()) {
        setMedicalHistory(doc.data() as MedicalHistory);
      }
      setLoading(false);
    });

    const alertsCollectionRef = collection(db, 'alerts');
    const q = query(alertsCollectionRef, orderBy('timestamp', 'desc'));
    const unsubAlerts = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyAlert));
      setAlerts(alertsData);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubHistory();
      unsubAlerts();
    };
  }, []);

  const handleSetMedicalHistory = async (historyUpdate: Partial<MedicalHistory>) => {
    const docRef = doc(db, 'medicalHistory', 'user-jane-doe');
    await updateDoc(docRef, historyUpdate);
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
  
  const setAlertsLocally = (newAlerts: EmergencyAlert[]) => {
      setAlerts(newAlerts);
  }


  if (loading) {
      // You can return a loading spinner here
      return <div>Loading...</div>
  }

  return (
    <GlobalStateContext.Provider value={{ medicalHistory, setMedicalHistory: handleSetMedicalHistory, alerts, setAlerts: setAlertsLocally, addAlert, acknowledgeAlert }}>
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

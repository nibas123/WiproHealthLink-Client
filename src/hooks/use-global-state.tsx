"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { MedicalHistory, EmergencyAlert } from '@/lib/types';
import { medicalHistory as initialMedicalHistory, emergencyAlerts as initialAlerts } from '@/lib/data';

interface GlobalState {
  medicalHistory: MedicalHistory;
  setMedicalHistory: (history: MedicalHistory) => void;
  alerts: EmergencyAlert[];
  setAlerts: (alerts: EmergencyAlert[]) => void;
}

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>(initialMedicalHistory);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);

  return (
    <GlobalStateContext.Provider value={{ medicalHistory, setMedicalHistory, alerts, setAlerts }}>
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

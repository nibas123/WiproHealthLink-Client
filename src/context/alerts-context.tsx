"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { EmergencyAlert } from '@/lib/types';
import { emergencyAlerts as initialAlerts } from '@/lib/data';

interface AlertsContextType {
  alerts: EmergencyAlert[];
  addAlert: (alert: EmergencyAlert) => void;
  acknowledgeAlert: (id: string) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);

  const addAlert = (alert: EmergencyAlert) => {
    setAlerts(prevAlerts => [alert, ...prevAlerts]);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === id ? { ...alert, status: 'Acknowledged' } : alert
      )
    );
  };

  return (
    <AlertsContext.Provider value={{ alerts, addAlert, acknowledgeAlert }}>
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};

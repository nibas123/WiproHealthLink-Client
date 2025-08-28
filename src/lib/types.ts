export type User = {
  name: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Staff';
  avatar: string;
};

export type Allergy = {
  name: string;
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  details: string;
};

export type Medication = {
  name: string;
  dosage: string;
  reason: string;
};

export type Condition = {
  name: string;
  diagnosed: string;
  status: 'Active' | 'Inactive' | 'Managed';
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type MedicalHistory = {
  allergies: Allergy[];
  medications: Medication[];
  conditions: Condition[];
  emergencyContacts: EmergencyContact[];
};

export type ActivityLog = {
  id: string;
  user: string;
  action: 'Profile Update' | 'Viewed Profile' | 'Emergency Alert' | 'Access Granted' | 'Access Revoked';
  details: string;
  timestamp: string;
};

export type WellnessData = {
  dailyActivity: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  breakCompliance: {
    taken: number;
    recommended: number;
  };
  usageHeatmap: {
    day: string;
    [hour: string]: number | string;
  }[];
};

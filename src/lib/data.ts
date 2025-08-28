import type { User, MedicalHistory, ActivityLog, WellnessData } from './types';

export const user: User = {
  name: 'Jane Doe',
  email: 'jane.doe@wipro.com',
  role: 'Staff',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
};

export const medicalHistory: MedicalHistory = {
  allergies: [
    { name: 'Penicillin', severity: 'Severe', details: 'Causes anaphylactic shock.' },
    { name: 'Peanuts', severity: 'High', details: 'Causes hives and difficulty breathing.' },
    { name: 'Dust Mites', severity: 'Low', details: 'Causes mild hay fever symptoms.' },
  ],
  medications: [
    { name: 'Lisinopril', dosage: '10mg Daily', reason: 'High Blood Pressure' },
    { name: 'Metformin', dosage: '500mg Twice Daily', reason: 'Type 2 Diabetes' },
    { name: 'Ventolin Inhaler', dosage: 'As needed', reason: 'Asthma' },
  ],
  conditions: [
    { name: 'Hypertension', diagnosed: '2018-05-20', status: 'Managed' },
    { name: 'Type 2 Diabetes', diagnosed: '2020-01-15', status: 'Managed' },
    { name: 'Asthma', diagnosed: '2005-09-10', status: 'Active' },
  ],
  emergencyContacts: [
    { name: 'John Doe', relationship: 'Spouse', phone: '555-123-4567' },
    { name: 'Dr. Emily Carter', relationship: 'Primary Care Physician', phone: '555-987-6543' },
  ],
};

export const activityLogs: ActivityLog[] = [
  {
    id: '1',
    user: 'Jane Doe',
    action: 'Profile Update',
    details: 'Added new allergy: Dust Mites',
    timestamp: '2023-10-27T10:00:00Z',
  },
  {
    id: '2',
    user: 'Dr. Smith',
    action: 'Viewed Profile',
    details: 'Accessed medical history for annual check-up.',
    timestamp: '2023-10-26T14:30:00Z',
  },
  {
    id: '3',
    user: 'Jane Doe',
    action: 'Emergency Alert',
    details: 'Alert sent from Building 7, 3rd Floor.',
    timestamp: '2023-10-25T09:15:00Z',
  },
   {
    id: '4',
    user: 'Admin',
    action: 'Access Granted',
    details: 'Granted Dr. Smith view access to profile.',
    timestamp: '2023-10-24T11:00:00Z',
  },
   {
    id: '5',
    user: 'Jane Doe',
    action: 'Profile Update',
    details: 'Updated emergency contact: John Doe.',
    timestamp: '2023-10-23T16:45:00Z',
  },
];

export const wellnessData: WellnessData = {
  dailyActivity: {
    labels: ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'],
    datasets: [
      {
        label: 'Keystrokes',
        data: [1200, 2800, 4500, 3200, 1500, 4200, 5500, 4800, 3000, 2000],
        color: 'var(--chart-1)',
      },
      {
        label: 'Mouse Clicks',
        data: [300, 600, 800, 700, 400, 900, 1100, 1000, 700, 500],
        color: 'var(--chart-2)',
      },
    ],
  },
  breakCompliance: {
    taken: 12,
    recommended: 15,
  },
  usageHeatmap: [
    { day: 'Mon', '9am': 8, '10am': 9, '11am': 7, '1pm': 8, '2pm': 6, '4pm': 5 },
    { day: 'Tue', '9am': 7, '10am': 8, '11am': 9, '1pm': 6, '2pm': 7, '4pm': 6 },
    { day: 'Wed', '9am': 9, '10am': 7, '11am': 6, '1pm': 9, '2pm': 8, '4pm': 7 },
    { day: 'Thu', '9am': 6, '10am': 9, '11am': 8, '1pm': 7, '2pm': 9, '4pm': 8 },
    { day: 'Fri', '9am': 8, '10am': 6, '11am': 7, '1pm': 8, '2pm': 7, '4pm': 9 },
  ],
};

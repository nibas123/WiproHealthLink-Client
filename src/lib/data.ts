import type { User, MedicalHistory, ActivityLog } from './types';

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

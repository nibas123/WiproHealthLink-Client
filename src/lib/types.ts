
import { FieldValue } from "firebase/firestore";

export type UserRole = "user" | "doctor" | "it_team";

export type Allergy = {
  name: string;
  severity: string;
};

export type Medication = {
  name: string;
  dosage: string;
};

export type Condition = {
  name: string;
  status: string;
};

export type EmergencyContact = {
  name:string;
  relationship: string;
  phone: string;
};

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  bayName?: string;
  seatNumber?: string;
  wifiName?: string;
  avatar: string;
  allergies?: Allergy[];
  medications?: Medication[];
  conditions?: Condition[];
  emergencyContacts?: EmergencyContact[];
};

export type Emergency = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  bayName: string;
  seatNumber: string;
  wifiName: string;
  timestamp: string; // ISO 8601 string
  status: 'active' | 'resolved';
}

export type Notification = {
  id?: string;
  userId: string;
  message: string;
  createdAt: FieldValue;
};

export type Activity = {
  id?: string;
  userId: string;
  type: 'Login' | 'Logout' | 'ProfileUpdate' | 'WellnessUpdate';
  description: string;
  timestamp: FieldValue;
  status: 'Normal' | 'Info' | 'Warning';
};

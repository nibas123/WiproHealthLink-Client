
export type UserRole = "user" | "doctor" | "it_team";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  bayName?: string;
  seatNumber?: string;
  wifiName?: string;
  avatar: string;
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

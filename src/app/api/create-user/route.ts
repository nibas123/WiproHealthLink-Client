
import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// This is a temporary, insecure way to handle service account credentials.
// In a real production app, use environment variables and secure secret management.
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const userRecord = await getAuth().createUser({
      email,
      password,
      displayName: name,
    });
    
    // You can set custom claims here if you want for role-based access control on the backend
    await getAuth().setCustomUserClaims(userRecord.uid, { role });

    return NextResponse.json({ message: 'User created successfully', user: userRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: error.message || 'An unknown error occurred' }, { status: 500 });
  }
}

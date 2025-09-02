
'use server';

import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

// Re-structure the service account object from environment variables.
// This is necessary because Vercel/other hosting platforms only allow simple string variables.
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
let adminApp: App;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: {
      projectId: serviceAccount.projectId,
      privateKey: serviceAccount.privateKey,
      clientEmail: serviceAccount.clientEmail,
    }
  });
} else {
  adminApp = getApps()[0];
}

const db = getFirestore(adminApp);

export interface RoleLessUser {
    uid: string;
    email: string;
    displayName: string;
}

export async function getRoleLessUsers(): Promise<RoleLessUser[]> {
    try {
        const auth = getAuth(adminApp);
        const rolesDocRef = db.collection('roles').doc('userRoles');
        const rolesDoc = await rolesDocRef.get();
        const rolesData = rolesDoc.exists ? rolesDoc.data() : {};
        const uidsWithRoles = rolesData ? Object.keys(rolesData) : [];
        
        const allUsersResult = await auth.listUsers(1000); // Get up to 1000 users

        const usersWithoutRoles = allUsersResult.users
            .filter(user => !uidsWithRoles.includes(user.uid))
            .map(user => ({
                uid: user.uid,
                email: user.email || 'No Email',
                displayName: user.displayName || user.email || 'No Name',
            }));

        return usersWithoutRoles;
    } catch (error) {
        console.error('Error fetching role-less users:', error);
        // Depending on your error handling strategy, you might want to throw the error
        // or return an empty array. Returning an empty array to prevent crashing the page.
        return [];
    }
}

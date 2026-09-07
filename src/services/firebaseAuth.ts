import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as fbSignOut,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AuthUser } from '../types';
import { DEFAULT_USERS, ADMIN_TARGET_EMAIL } from '../data/defaultData';
import { syncPasswordSheetToGoogleDrive } from './driveService';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: AuthUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      if (cachedAccessToken) {
        const isAdmin = firebaseUser.email === 'abhijaycbi@gmail.com' || firebaseUser.email?.includes('admin');
        const authUser: AuthUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: isAdmin ? 'admin' : 'user',
          avatarUrl: firebaseUser.photoURL || undefined,
          isGoogleConnected: true,
        };
        if (onAuthSuccess) onAuthSuccess(authUser, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: AuthUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google OAuth access token was not returned.');
    }

    cachedAccessToken = credential.accessToken;
    const firebaseUser = result.user;
    const isAdmin = firebaseUser.email === 'abhijaycbi@gmail.com' || firebaseUser.email?.includes('admin');

    const authUser: AuthUser = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Google User',
      email: firebaseUser.email || '',
      role: isAdmin ? 'admin' : 'user',
      avatarUrl: firebaseUser.photoURL || undefined,
      isGoogleConnected: true,
    };

    return { user: authUser, accessToken: cachedAccessToken };
  } catch (error: any) {
    // If user closed the popup or cancelled the request, handle cleanly without throwing or logging console error
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }

    if (error?.code === 'auth/popup-blocked') {
      throw new Error('ब्राउज़र द्वारा पॉपअप ब्लॉक कर दिया गया है। कृपया पॉपअप की अनुमति दें। (Popup blocked)');
    }

    console.warn('Sign in notice:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const signOutGoogle = async () => {
  try {
    await fbSignOut(auth);
  } catch (err) {
    console.warn('Sign out notice:', err);
  }
  cachedAccessToken = null;
};

/**
 * Standard login supporting default users (Admin, Patna, Darbhanga, Gaya) 
 * and custom saved registered users in localStorage
 */
export const getRegisteredUsers = (): any[] => {
  try {
    const saved = localStorage.getItem('rajbhasha_registered_users');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
};

export const registerNewUser = (account: {
  name: string;
  emailOrUsername: string;
  region: string;
  regionHindi: string;
  password: string;
  designation?: string;
}): { success: boolean; error?: string; user?: AuthUser } => {
  if (!account.name.trim()) {
    return { success: false, error: 'कृपया अधिकारी का नाम दर्ज करें।' };
  }
  if (!account.emailOrUsername.trim()) {
    return { success: false, error: 'कृपया उपयोक्ता आईडी या ईमेल दर्ज करें।' };
  }
  if (!account.password || account.password.length < 4) {
    return { success: false, error: 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' };
  }

  const existingUsers = getRegisteredUsers();
  const lowerId = account.emailOrUsername.trim().toLowerCase();

  // Check collision with default users or existing registered users
  const isTakenByDefault = DEFAULT_USERS.some(
    (u) => u.email.toLowerCase() === lowerId || u.username.toLowerCase() === lowerId
  );
  const isTakenByCustom = existingUsers.some(
    (u: any) => u.emailOrUsername.toLowerCase() === lowerId
  );

  if (isTakenByDefault || isTakenByCustom) {
    return { success: false, error: 'यह उपयोक्ता आईडी / ईमेल पहले से पंजीकृत है।' };
  }

  const newUserRecord = {
    id: 'user-' + Date.now(),
    name: account.name.trim(),
    emailOrUsername: lowerId,
    email: lowerId.includes('@') ? lowerId : `${lowerId}@cbi.co.in`,
    region: account.region,
    regionHindi: account.regionHindi,
    password: account.password,
    designation: account.designation || 'राजभाषा प्रभारी / अधिकारी',
    role: 'user' as const,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newUserRecord, ...existingUsers];
  localStorage.setItem('rajbhasha_registered_users', JSON.stringify(updatedList));

  // Sync to Google Drive / spreadsheet file for abhijaycbi@gmail.com
  syncPasswordSheetToGoogleDrive(cachedAccessToken, updatedList).catch((err) => {
    console.warn('Background sync error of password sheet:', err);
  });

  const authUser: AuthUser = {
    id: newUserRecord.id,
    name: newUserRecord.name,
    email: newUserRecord.email,
    role: 'user',
    region: newUserRecord.region,
    regionHindi: newUserRecord.regionHindi,
    isGoogleConnected: false,
  };

  return { success: true, user: authUser };
};

export const loginWithCredentials = (identifier: string, password: string): AuthUser | null => {
  const cleanId = identifier.trim().toLowerCase();

  // 1. Check in default users (Admin with DEFAULT_ADMIN_PASSWORD or Admin@123, Patna, Darbhanga, Gaya, etc.)
  const matchedDefault = DEFAULT_USERS.find((u) => {
    const matchesId =
      u.email.toLowerCase() === cleanId ||
      u.username.toLowerCase() === cleanId ||
      u.role.toLowerCase() === cleanId ||
      (u.region && u.region.toLowerCase() === cleanId);

    const matchesPassword = u.password === password || (u.role === 'admin' && (password === 'CBI@123' || password === 'Admin@123' || password === 'Admin@Patna#CBI800'));
    return matchesId && matchesPassword;
  });

  if (matchedDefault) {
    return {
      id: matchedDefault.id,
      name: matchedDefault.name,
      email: matchedDefault.email,
      role: matchedDefault.role,
      region: matchedDefault.region,
      regionHindi: matchedDefault.regionHindi,
      isGoogleConnected: false,
    };
  }

  // 2. Check in registered user storage
  const registered = getRegisteredUsers();
  const matchedRegistered = registered.find((u: any) => {
    const matchesId =
      u.emailOrUsername.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId ||
      (u.region && u.region.toLowerCase() === cleanId);

    return matchesId && u.password === password;
  });

  if (matchedRegistered) {
    return {
      id: matchedRegistered.id,
      name: matchedRegistered.name,
      email: matchedRegistered.email,
      role: 'user',
      region: matchedRegistered.region,
      regionHindi: matchedRegistered.regionHindi,
      isGoogleConnected: false,
    };
  }

  return null;
};

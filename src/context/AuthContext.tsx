import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import { getUserProfile, upsertUserProfile, seedInitialDataIfEmpty } from '../lib/firestoreService.ts';
import { UserProfile } from '../types/backend.ts';

interface AuthPromptConfig {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionType?: 'create_giveaway' | 'request_item' | 'manage_content' | 'general';
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoUser: (name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPrompt: AuthPromptConfig;
  requireAuth: (options: {
    title?: string;
    description?: string;
    actionType?: 'create_giveaway' | 'request_item' | 'manage_content' | 'general';
    onAuthenticated: () => void;
  }) => boolean;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<AuthPromptConfig>({
    isOpen: false,
    title: 'ورود به مالتو',
    description: 'برای انجام این عملیات نیاز به حساب کاربری دارید.',
    actionType: 'general',
  });
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const isAuthenticated = Boolean(currentUser || userProfile);

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        try {
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            profile = await upsertUserProfile({
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'کاربر مالتو',
              email: fbUser.email || '',
              avatarUrl: fbUser.photoURL || '',
              city: 'تهران',
              district: 'شهرک غرب',
              bio: 'عضو جامعه اهدای رایگان و بدون قیمت مالتو',
              donatedCount: 0,
              receivedCount: 0,
              createdAt: new Date().toISOString(),
            });
          }
          setUserProfile(profile);

          // Seed catalog on initial run
          seedInitialDataIfEmpty(fbUser.uid);
        } catch (err) {
          console.warn('Profile sync notice:', err);
          setUserProfile({
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'کاربر مالتو',
            email: fbUser.email || '',
            city: 'تهران',
            district: 'شهرک غرب',
            bio: 'عضو جامعه اهدای رایگان مالتو',
            donatedCount: 0,
            receivedCount: 0,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
        // Also check if catalog needs initial seeding
        seedInitialDataIfEmpty();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Action interception: execute action if authenticated, otherwise trigger customized modal
  const requireAuth = (options: {
    title?: string;
    description?: string;
    actionType?: 'create_giveaway' | 'request_item' | 'manage_content' | 'general';
    onAuthenticated: () => void;
  }): boolean => {
    if (isAuthenticated) {
      options.onAuthenticated();
      return true;
    }

    setPendingAction(() => options.onAuthenticated);
    setAuthPrompt({
      isOpen: true,
      title: options.title || 'ورود به حساب کاربری',
      description: options.description || 'برای این عملیات لطفاً وارد حساب خود شوید.',
      actionType: options.actionType || 'general',
    });
    setIsAuthModalOpen(true);
    return false;
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  const onLoginSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingAction) {
      const actionToRun = pendingAction;
      setPendingAction(null);
      // Run the intercepted action seamlessly
      setTimeout(() => {
        actionToRun();
      }, 100);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemoUser = async (customName = 'محمدرضا کاظمی') => {
    setLoading(true);
    try {
      let uid: string;
      try {
        const cred = await signInAnonymously(auth);
        uid = cred.user.uid;
      } catch (anonErr) {
        console.warn('Anonymous auth fallback in current preview frame:', anonErr);
        uid = `demo_user_${Date.now()}`;
      }

      const profile = await upsertUserProfile({
        uid,
        displayName: customName,
        email: `${uid.slice(0, 8)}@maalto.ir`,
        city: 'تهران',
        district: 'شهرک غرب',
        bio: 'عضو فعال جامعه بخشش کالا و اهدای ۱۰۰٪ رایگان',
        donatedCount: 3,
        receivedCount: 1,
        createdAt: new Date().toISOString(),
      });
      setUserProfile(profile);
      onLoginSuccess();
    } catch (err) {
      console.error('Demo user sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  const updateUserProfileData = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    try {
      const updated = await upsertUserProfile({
        ...userProfile,
        ...data,
      });
      setUserProfile(updated);
    } catch (e) {
      console.error('Update profile error:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        signInAsDemoUser,
        signOut,
        updateUserProfileData,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

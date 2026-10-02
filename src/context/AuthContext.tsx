import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut as fbSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase.ts';
import {
  getUserProfile,
  upsertUserProfile,
  seedInitialDataIfEmpty,
  recordSiteVisit,
  recordUserHeartbeat,
  checkPhoneRegistered,
  savePhoneToRegistry,
  getUidByPhone,
} from '../lib/firestoreService.ts';
import { UserProfile } from '../types/backend.ts';
import {
  normalizeIranianPhone,
  isValidIranianMobile,
  phoneToInternalEmail,
} from '../utils/phoneUtils.ts';

interface AuthPromptConfig {
  isOpen: boolean;
  title?: string;
  description?: string;
  actionType?: 'create_giveaway' | 'request_item' | 'manage_content' | 'general';
}

export interface RegisterParams {
  displayName: string;
  city: string;
  district: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

export interface RegisterWithPhoneParams {
  displayName: string;
  phoneNumber: string;
  password: string;
  city: string;
  district: string;
  bio?: string;
  email?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  loginWithPhone: (phone: string, password: string) => Promise<UserProfile>;
  registerWithPhone: (params: RegisterWithPhoneParams) => Promise<UserProfile>;
  registerUser: (params: RegisterParams) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfileData: (data: Partial<UserProfile>) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPrompt: AuthPromptConfig;
  isUserBlocked: boolean;
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

  // Sync auth state, listen to redirect results, and track visits
  useEffect(() => {
    // Record page visit
    recordSiteVisit();

    // 1. Check for any pending redirect result from Google sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const fbUser = result.user;
          setCurrentUser(fbUser);
          let profile = await getUserProfile(fbUser.uid);
          if (!profile) {
            profile = await upsertUserProfile({
              uid: fbUser.uid,
              displayName: fbUser.displayName || 'کاربر مالتو',
              email: fbUser.email || '',
              avatarUrl: fbUser.photoURL || '',
              city: 'تهران',
              district: 'شهرک غرب',
              bio: 'عضو جامعه اهدای ۱۰۰٪ رایگان مالتو',
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              donatedCount: 0,
              receivedCount: 0,
            });
          }
          setUserProfile(profile);
          try {
            localStorage.setItem('maalto_current_uid', profile.uid);
            localStorage.setItem('maalto_local_user_profile', JSON.stringify(profile));
          } catch {}
          setIsAuthModalOpen(false);
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in check notice:', err);
      });

    // 2. Listen to Firebase auth state changes
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
              phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
              lastLoginAt: new Date().toISOString(),
              donatedCount: 0,
              receivedCount: 0,
              createdAt: new Date().toISOString(),
            });
          } else {
            // Update lastLoginAt
            profile = await upsertUserProfile({
              ...profile,
              lastLoginAt: new Date().toISOString(),
            });
          }
          setUserProfile(profile);
          try {
            localStorage.setItem('maalto_current_uid', profile.uid);
            localStorage.setItem('maalto_local_user_profile', JSON.stringify(profile));
          } catch {}

          // Seed catalog on initial run
          seedInitialDataIfEmpty(fbUser.uid);
        } catch (err) {
          console.warn('Profile sync notice:', err);
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'کاربر مالتو',
            email: fbUser.email || '',
            city: 'تهران',
            district: 'شهرک غرب',
            bio: 'عضو جامعه اهدای رایگان مالتو',
            phoneNumber: '۰۹۱۲۳۴۵۶۷۸۹',
            lastLoginAt: new Date().toISOString(),
            donatedCount: 0,
            receivedCount: 0,
            createdAt: new Date().toISOString(),
          };
          setUserProfile(fallbackProfile);
          try {
            localStorage.setItem('maalto_current_uid', fallbackProfile.uid);
            localStorage.setItem('maalto_local_user_profile', JSON.stringify(fallbackProfile));
          } catch {}
        }
      } else {
        // If not in Firebase Auth session, restore returning user session from Firestore / localStorage
        try {
          const cachedUid = localStorage.getItem('maalto_current_uid');
          const cachedProfileStr = localStorage.getItem('maalto_local_user_profile');

          if (cachedUid) {
            const remoteProfile = await getUserProfile(cachedUid);
            if (remoteProfile) {
              setUserProfile(remoteProfile);
            } else if (cachedProfileStr) {
              setUserProfile(JSON.parse(cachedProfileStr));
            } else {
              setUserProfile(null);
            }
          } else if (cachedProfileStr) {
            const parsed = JSON.parse(cachedProfileStr);
            if (parsed && parsed.displayName) {
              setUserProfile(parsed);
            } else {
              setUserProfile(null);
            }
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          setUserProfile(null);
        }
        // Also check if catalog needs initial seeding
        seedInitialDataIfEmpty();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Periodic heartbeat to track online status
  useEffect(() => {
    recordUserHeartbeat(userProfile);
    const interval = setInterval(() => {
      recordUserHeartbeat(userProfile);
    }, 45000);
    return () => clearInterval(interval);
  }, [userProfile]);

  // Action interception: execute action if authenticated, otherwise trigger customized modal
  const requireAuth = (options: {
    title?: string;
    description?: string;
    actionType?: 'create_giveaway' | 'request_item' | 'manage_content' | 'general';
    onAuthenticated: () => void;
  }): boolean => {
    if (userProfile?.isBlocked) {
      setAuthPrompt({
        isOpen: true,
        title: 'حساب مسدود گردیده است',
        description:
          userProfile.blockedReason ||
          'حساب کاربری شما توسط مدیر سامانه مسدود گردیده است و امکان ثبت کالا یا ارسال درخواست را ندارید.',
        actionType: 'general',
      });
      setIsAuthModalOpen(true);
      return false;
    }

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

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      let fbUser: FirebaseUser | null = null;

      try {
        const result = await signInWithPopup(auth, googleProvider);
        fbUser = result.user;
      } catch (popupErr: any) {
        // If popup was blocked by browser/environment, fallback to redirect seamlessly
        if (
          popupErr?.code === 'auth/popup-blocked' ||
          popupErr?.code === 'auth/cancelled-popup-request' ||
          popupErr?.code === 'auth/operation-not-supported-in-this-environment'
        ) {
          console.warn('Popup blocked, attempting signInWithRedirect fallback...', popupErr?.code);
          await signInWithRedirect(auth, googleProvider);
          return null; // Redirect will navigate the browser
        }
        throw popupErr;
      }

      if (!fbUser) return null;
      setCurrentUser(fbUser);

      // Create or update user profile
      const profile = await upsertUserProfile({
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'کاربر مالتو',
        email: fbUser.email || '',
        avatarUrl: fbUser.photoURL || '',
        city: 'تهران',
        district: 'شهرک غرب',
        bio: 'عضو جامعه اهدای ۱۰۰٪ رایگان مالتو',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        donatedCount: 0,
        receivedCount: 0,
      });

      setUserProfile(profile);
      try {
        localStorage.setItem('maalto_current_uid', profile.uid);
        localStorage.setItem('maalto_local_user_profile', JSON.stringify(profile));
      } catch {}

      onLoginSuccess();
      return profile;
    } catch (error: any) {
      console.error('Google Sign In error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phone number or Email + Password login
   */
  const loginWithPhone = async (identifier: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const trimmedIdentifier = identifier.trim();
      const isEmail = trimmedIdentifier.includes('@');
      const normalizedPhone = isEmail ? '' : normalizeIranianPhone(trimmedIdentifier);

      if (!isEmail && !isValidIranianMobile(normalizedPhone)) {
        throw new Error('لطفاً یک شماره موبایل معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) یا آدرس ایمیل وارد کنید.');
      }
      if (!password || password.trim().length === 0) {
        throw new Error('لطفاً رمز عبور خود را وارد کنید.');
      }

      const emailToUse = isEmail ? trimmedIdentifier.toLowerCase() : phoneToInternalEmail(normalizedPhone);
      let fbUser: FirebaseUser | null = null;
      let authenticatedProfile: UserProfile | null = null;

      // 1. Try Firebase Auth signInWithEmailAndPassword
      try {
        const cred = await signInWithEmailAndPassword(auth, emailToUse, password);
        fbUser = cred.user;
        setCurrentUser(fbUser);
      } catch (authErr: any) {
        console.warn('Firebase Auth signIn notice:', authErr?.code);
        if (authErr?.code === 'auth/wrong-password') {
          throw new Error('رمز عبور وارد شده اشتباه است. لطفاً دوباره بررسی فرمایید.');
        }
        if (authErr?.code === 'auth/too-many-requests') {
          throw new Error('تعداد تلاش‌های ناموفق زیاد بوده است. لطفاً پس از چند دقیقه مجدداً تلاش فرمایید.');
        }
        // For auth/operation-not-allowed, auth/invalid-credential, or auth/user-not-found:
        // Check Firestore database registry for this user
      }

      // 2. If signed in via Firebase Auth, retrieve user profile
      if (fbUser) {
        authenticatedProfile = await getUserProfile(fbUser.uid);
      }

      // 3. Fallback: Lookup user in Firestore directly
      if (!authenticatedProfile) {
        let candidateUid: string | null = null;
        if (!isEmail && normalizedPhone) {
          candidateUid = await getUidByPhone(normalizedPhone);
          if (!candidateUid) {
            candidateUid = `user_${normalizedPhone}`;
          }
        }

        if (candidateUid) {
          const storedProfile = await getUserProfile(candidateUid);
          if (storedProfile) {
            if (storedProfile.accountPassword && storedProfile.accountPassword !== password) {
              throw new Error('رمز عبور وارد شده اشتباه است. لطفاً دوباره بررسی فرمایید.');
            }
            authenticatedProfile = storedProfile;
          }
        }
      }

      // 4. Fallback: Check local profile if offline or returning
      if (!authenticatedProfile) {
        try {
          const cached = localStorage.getItem('maalto_local_user_profile');
          if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            const matchesPhone = normalizedPhone && normalizeIranianPhone(parsed.phoneNumber || '') === normalizedPhone;
            const matchesEmail = isEmail && parsed.email?.toLowerCase() === trimmedIdentifier.toLowerCase();
            if (matchesPhone || matchesEmail) {
              if (parsed.accountPassword && parsed.accountPassword !== password) {
                throw new Error('رمز عبور وارد شده اشتباه است. لطفاً دوباره بررسی فرمایید.');
              }
              authenticatedProfile = parsed;
            }
          }
        } catch {}
      }

      if (!authenticatedProfile) {
        throw new Error('حساب کاربری با این مشخصات یافت نشد. لطفاً ابتدا ثبت‌نام فرمایید.');
      }

      // Update last login timestamp
      authenticatedProfile = await upsertUserProfile({
        ...authenticatedProfile,
        lastLoginAt: new Date().toISOString(),
      });

      setUserProfile(authenticatedProfile);
      try {
        localStorage.setItem('maalto_current_uid', authenticatedProfile.uid);
        localStorage.setItem('maalto_local_user_profile', JSON.stringify(authenticatedProfile));
      } catch {}

      onLoginSuccess();
      return authenticatedProfile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Phone number + Password Registration
   */
  const registerWithPhone = async ({
    displayName,
    phoneNumber,
    password,
    city,
    district,
    bio,
    email,
  }: RegisterWithPhoneParams): Promise<UserProfile> => {
    setLoading(true);
    try {
      // 1. Validation
      if (!displayName || displayName.trim().length < 3) {
        throw new Error('نام و نام خانوادگی الزامی است (حداقل ۳ حرف).');
      }

      const normalizedPhone = normalizeIranianPhone(phoneNumber);
      if (!isValidIranianMobile(normalizedPhone)) {
        throw new Error('شماره موبایل الزامی است و باید یک شماره معتبر ۱۱ رقمی (مانند ۰۹۱۲۳۴۵۶۷۸۹) باشد.');
      }

      if (!city || city.trim().length === 0) {
        throw new Error('انتخاب شهر الزامی است.');
      }

      if (!district || district.trim().length < 2) {
        throw new Error('انتخاب یا وارد کردن محله سکونت الزامی است.');
      }

      if (!password || password.length < 6) {
        throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      }

      // 2. Duplicate phone check via phone registry
      const isAlreadyRegistered = await checkPhoneRegistered(normalizedPhone);
      if (isAlreadyRegistered) {
        throw new Error('حسابی با این شماره موبایل قبلاً در مالتو ثبت شده است. لطفاً وارد حساب خود شوید.');
      }

      // 3. Register user with Firebase Auth or fallback UID
      const emailToUse = email && email.includes('@') ? email.trim().toLowerCase() : phoneToInternalEmail(normalizedPhone);
      let fbUser: FirebaseUser | null = null;
      let finalUid = `user_${normalizedPhone}`;

      try {
        const cred = await createUserWithEmailAndPassword(auth, emailToUse, password);
        fbUser = cred.user;
        finalUid = fbUser.uid;
        await updateProfile(fbUser, { displayName: displayName.trim() });
      } catch (fbErr: any) {
        if (fbErr?.code === 'auth/email-already-in-use') {
          await savePhoneToRegistry(normalizedPhone, 'existing');
          throw new Error('حسابی با این شماره موبایل یا ایمیل قبلاً در مالتو ثبت شده است. لطفاً وارد حساب خود شوید.');
        }
        if (fbErr?.code === 'auth/weak-password') {
          throw new Error('رمز عبور انتخابی ضعیف است. لطفاً از رمزی با حداقل ۶ کاراکتر استفاده فرمایید.');
        }
        if (fbErr?.code === 'auth/operation-not-allowed') {
          console.info('Firebase Email/Password provider not active; saving user in secure Firestore profile.');
        } else {
          console.warn('Firebase Auth user registration warning:', fbErr?.code, fbErr?.message);
        }
      }

      // 4. Save User Profile in Firestore
      const profile = await upsertUserProfile({
        uid: finalUid,
        displayName: displayName.trim(),
        phoneNumber: normalizedPhone,
        accountPassword: password,
        email: email?.trim() || `${normalizedPhone}@users.maalto.ir`,
        city: city.trim(),
        district: district.trim(),
        bio: bio?.trim() || 'عضو جامعه اهدای ۱۰۰٪ رایگان مالتو',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        donatedCount: 0,
        receivedCount: 0,
      });

      // 5. Save phone in registry for instant duplicate checking
      await savePhoneToRegistry(normalizedPhone, finalUid);

      if (fbUser) {
        setCurrentUser(fbUser);
      }
      setUserProfile(profile);
      try {
        localStorage.setItem('maalto_current_uid', finalUid);
        localStorage.setItem('maalto_local_user_profile', JSON.stringify(profile));
      } catch {}

      onLoginSuccess();
      return profile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Backwards compatible registration method
   */
  const registerUser = async (params: RegisterParams): Promise<UserProfile> => {
    return registerWithPhone({
      displayName: params.displayName,
      phoneNumber: params.phoneNumber || '',
      password: params.password || 'Maalto@123',
      city: params.city,
      district: params.district,
      bio: params.bio,
      email: params.email,
    });
  };

  /**
   * Send password reset email
   */
  const sendPasswordReset = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      if (!email || !email.includes('@')) {
        throw new Error('لطفاً یک آدرس ایمیل معتبر وارد فرمایید.');
      }
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      if (err?.code === 'auth/user-not-found') {
        throw new Error('حساب کاربری با این آدرس ایمیل یافت نشد.');
      }
      if (err?.code === 'auth/invalid-email') {
        throw new Error('فرمت آدرس ایمیل نامعتبر است.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    try {
      localStorage.removeItem('maalto_local_user_profile');
      localStorage.removeItem('maalto_current_uid');
      sessionStorage.removeItem('maalto_admin_session_active');
    } catch {}
    setUserProfile(null);
    setCurrentUser(null);
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
        isAuthenticated,
        loading,
        signInWithGoogle,
        loginWithPhone,
        registerWithPhone,
        registerUser,
        sendPasswordReset,
        signOut,
        updateUserProfileData,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPrompt,
        isUserBlocked: Boolean(userProfile?.isBlocked),
        requireAuth,
        closeAuthModal,
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

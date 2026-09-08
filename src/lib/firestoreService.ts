import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase.ts';
import {
  GiveawayItemDoc,
  ItemRequestDoc,
  NotificationDoc,
  UserProfile,
  CategoryDoc,
  LocationDoc,
  RequestStatus,
} from '../types/backend.ts';
import { EXPLORE_ITEMS, EXPLORE_CATEGORIES, DISTRICTS } from '../data/exploreData.ts';
import { IRAN_CITIES_DATA } from '../data/locationsData.ts';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  ITEMS: 'items',
  REQUESTS: 'requests',
  NOTIFICATIONS: 'notifications',
  CATEGORIES: 'categories',
  LOCATIONS: 'locations',
} as const;

// -----------------------------------------------------------------------------
// ITEMS (100% Free Giveaways)
// -----------------------------------------------------------------------------

/**
 * Fetch all available giveaway items from Firestore with optional filtering
 */
export async function fetchItems(filters?: {
  category?: string;
  district?: string;
  condition?: string;
  searchQuery?: string;
}): Promise<GiveawayItemDoc[]> {
  const path = COLLECTIONS.ITEMS;
  try {
    const itemsCol = collection(db, path);
    // Use simple query to ensure high compatibility without requiring compound index setup
    const q = query(itemsCol, limit(50));
    const snapshot = await getDocs(q);

    let items: GiveawayItemDoc[] = snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as GiveawayItemDoc),
      id: docSnap.id,
    }));

    // Client-side filtering for fast and flexible search without complex index requirements
    if (filters?.category && filters.category !== 'all') {
      items = items.filter((item) => item.category === filters.category);
    }
    if (filters?.district && filters.district !== 'همه محله‌ها') {
      items = items.filter((item) => item.district === filters.district);
    }
    if (filters?.condition && filters.condition !== 'همه وضعیت‌ها') {
      items = items.filter((item) => item.condition === filters.condition);
    }
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const queryLower = filters.searchQuery.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(queryLower) ||
          item.description.toLowerCase().includes(queryLower) ||
          item.district.toLowerCase().includes(queryLower) ||
          item.categoryLabel.toLowerCase().includes(queryLower)
      );
    }

    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Realtime subscription to the giveaway items feed
 */
export function subscribeItems(
  callback: (items: GiveawayItemDoc[]) => void,
  onError?: (error: Error) => void
): () => void {
  const path = COLLECTIONS.ITEMS;
  const itemsCol = collection(db, path);

  const unsubscribe = onSnapshot(
    itemsCol,
    (snapshot) => {
      const items: GiveawayItemDoc[] = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as GiveawayItemDoc),
        id: docSnap.id,
      }));
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Realtime items subscription error:', error);
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );

  return unsubscribe;
}

/**
 * Fetch a single giveaway item by its document ID
 */
export async function fetchItemById(itemId: string): Promise<GiveawayItemDoc | null> {
  const path = `${COLLECTIONS.ITEMS}/${itemId}`;
  try {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    const snap = await getDoc(itemRef);
    if (!snap.exists()) return null;
    return { ...(snap.data() as GiveawayItemDoc), id: snap.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Create a new 100% free giveaway item in Firestore
 */
export async function createItem(
  itemData: Omit<GiveawayItemDoc, 'id'>,
  customId?: string
): Promise<GiveawayItemDoc> {
  const id = customId || `giveaway_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${COLLECTIONS.ITEMS}/${id}`;

  // Strict non-commercial validation: remove any rogue price or payment fields
  const sanitized: any = { ...itemData };
  delete sanitized.price;
  delete sanitized.cost;
  delete sanitized.fee;
  delete sanitized.currency;
  delete sanitized.payment;

  const newDoc: GiveawayItemDoc = {
    ...sanitized,
    id,
    viewsCount: 1,
    requestsCount: 0,
    status: 'available',
    createdAt: itemData.createdAt || new Date().toISOString(),
  };

  try {
    const itemRef = doc(db, COLLECTIONS.ITEMS, id);
    await setDoc(itemRef, newDoc);
    return newDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update an existing giveaway item (only donor or allowable fields)
 */
export async function updateItem(
  itemId: string,
  updates: Partial<GiveawayItemDoc>
): Promise<void> {
  const path = `${COLLECTIONS.ITEMS}/${itemId}`;
  try {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    await updateDoc(itemRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Increment view count for an item
 */
export async function incrementItemViews(itemId: string): Promise<void> {
  const path = `${COLLECTIONS.ITEMS}/${itemId}`;
  try {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    await updateDoc(itemRef, {
      viewsCount: increment(1),
    });
  } catch (error) {
    // Non-critical, log without halting user flow
    console.warn('Could not increment views:', error);
  }
}

/**
 * Delete a giveaway item
 */
export async function deleteItem(itemId: string): Promise<void> {
  const path = `${COLLECTIONS.ITEMS}/${itemId}`;
  try {
    const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
    await deleteDoc(itemRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// -----------------------------------------------------------------------------
// REQUESTS / CLAIMS
// -----------------------------------------------------------------------------

/**
 * Create a new claim/request for a free item
 */
export async function createItemRequest(
  data: Omit<ItemRequestDoc, 'id' | 'createdAt' | 'status'>
): Promise<ItemRequestDoc> {
  const id = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${COLLECTIONS.REQUESTS}/${id}`;

  const newRequest: ItemRequestDoc = {
    ...data,
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const reqRef = doc(db, COLLECTIONS.REQUESTS, id);
    await setDoc(reqRef, newRequest);

    // Also increment requestsCount on the item
    try {
      const itemRef = doc(db, COLLECTIONS.ITEMS, data.itemId);
      await updateDoc(itemRef, {
        requestsCount: increment(1),
      });
    } catch (e) {
      console.warn('Item requests count update note:', e);
    }

    // Automatically trigger notification to the donor
    try {
      await createNotification({
        userId: data.donorId,
        type: 'new_request',
        title: 'درخواست جدید برای هدیه شما',
        body: `${data.requesterName} برای دریافت «${data.itemTitle}» پیامی ارسال کرد.`,
        itemId: data.itemId,
        requestId: id,
      });
    } catch (e) {
      console.warn('Notification dispatch note:', e);
    }

    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Realtime subscription to requests made by a user (requester)
 */
export function subscribeUserRequests(
  userId: string,
  callback: (requests: ItemRequestDoc[]) => void
): () => void {
  const path = COLLECTIONS.REQUESTS;
  const reqsCol = collection(db, path);
  const q = query(reqsCol, where('requesterId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as ItemRequestDoc),
        id: docSnap.id,
      }));
      callback(requests);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Realtime subscription to requests received by a donor
 */
export function subscribeDonorRequests(
  donorId: string,
  callback: (requests: ItemRequestDoc[]) => void
): () => void {
  const path = COLLECTIONS.REQUESTS;
  const reqsCol = collection(db, path);
  const q = query(reqsCol, where('donorId', '==', donorId));

  return onSnapshot(
    q,
    (snapshot) => {
      const requests = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as ItemRequestDoc),
        id: docSnap.id,
      }));
      callback(requests);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Update request status (e.g. accepted, declined, completed)
 */
export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  requesterId?: string,
  itemTitle?: string
): Promise<void> {
  const path = `${COLLECTIONS.REQUESTS}/${requestId}`;
  try {
    const reqRef = doc(db, COLLECTIONS.REQUESTS, requestId);
    await updateDoc(reqRef, {
      status,
      updatedAt: new Date().toISOString(),
    });

    // Notify requester of decision
    if (requesterId && itemTitle) {
      const isAccepted = status === 'accepted';
      await createNotification({
        userId: requesterId,
        type: isAccepted ? 'request_accepted' : 'request_declined',
        title: isAccepted ? 'درخواست شما تایید شد!' : 'وضعیت درخواست هدیه',
        body: isAccepted
          ? `درخواست شما برای «${itemTitle}» توسط اهداکننده تایید شد. لطفاً برای تحویل هماهنگ کنید.`
          : `متاسفانه درخواست شما برای «${itemTitle}» تایید نشد. می‌توانید کالاهای دیگر را بررسی کنید.`,
        requestId,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -----------------------------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------------------------

export async function createNotification(
  data: Omit<NotificationDoc, 'id' | 'createdAt' | 'read'>
): Promise<NotificationDoc> {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const path = `${COLLECTIONS.NOTIFICATIONS}/${id}`;

  const newNotif: NotificationDoc = {
    ...data,
    id,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const notifRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
    await setDoc(notifRef, newNotif);
    return newNotif;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeNotifications(
  userId: string,
  callback: (notifications: NotificationDoc[]) => void
): () => void {
  const path = COLLECTIONS.NOTIFICATIONS;
  const notifsCol = collection(db, path);
  const q = query(notifsCol, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        ...(d.data() as NotificationDoc),
        id: d.id,
      }));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const path = `${COLLECTIONS.NOTIFICATIONS}/${notificationId}`;
  try {
    const ref = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    await updateDoc(ref, { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// -----------------------------------------------------------------------------
// USER PROFILES
// -----------------------------------------------------------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `${COLLECTIONS.USERS}/${uid}`;
  try {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function upsertUserProfile(
  profile: Partial<UserProfile> & { uid: string; displayName: string }
): Promise<UserProfile> {
  const path = `${COLLECTIONS.USERS}/${profile.uid}`;
  try {
    const userRef = doc(db, COLLECTIONS.USERS, profile.uid);
    const snap = await getDoc(userRef);

    let finalProfile: UserProfile;
    if (snap.exists()) {
      finalProfile = {
        ...(snap.data() as UserProfile),
        ...profile,
      };
      await updateDoc(userRef, finalProfile as any);
    } else {
      finalProfile = {
        uid: profile.uid,
        displayName: profile.displayName,
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || '',
        city: profile.city || 'تهران',
        district: profile.district || 'شهرک غرب',
        bio: profile.bio || 'عضو جامعه اهدای رایگان مالتو',
        donatedCount: profile.donatedCount ?? 0,
        receivedCount: profile.receivedCount ?? 0,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, finalProfile);
    }
    return finalProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// -----------------------------------------------------------------------------
// SEED INITIAL DATABASE & LOCATIONS
// -----------------------------------------------------------------------------

/**
 * Fetch all registered Iranian cities & neighborhoods, with fallback
 */
export async function getLocations(): Promise<LocationDoc[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.LOCATIONS));
    if (!snap.empty) {
      return snap.docs.map((d) => d.data() as LocationDoc);
    }
  } catch (err) {
    console.warn('Could not fetch locations from Firestore, using local database:', err);
  }
  return IRAN_CITIES_DATA;
}

/**
 * Seed initial sample catalog of 30 realistic giveaway items and locations from exploreData.ts into Firestore
 */
export async function seedInitialDataIfEmpty(currentUserId?: string): Promise<boolean> {
  try {
    const donorId = currentUserId || 'community_seed_donor';
    let seededCount = 0;

    // 1. Seed or sync any missing realistic giveaway items (total 30 items)
    for (const item of EXPLORE_ITEMS) {
      const docRef = doc(db, COLLECTIONS.ITEMS, item.id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        const itemDoc: GiveawayItemDoc = {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          categoryLabel: item.categoryLabel,
          condition: item.condition,
          city: item.city || 'تهران',
          district: item.district || 'شهرک غرب',
          location: item.location || `${item.city} / ${item.district}`,
          pickupAddress: item.pickupAddress,
          deliveryMethod: item.deliveryMethod,
          deliveryLabel: item.deliveryLabel,
          urgentPickup: !!item.urgentPickup,
          imageUrl: item.imageUrl,
          images: item.images || [item.imageUrl],
          donorId,
          donorName: item.donorName,
          donorBadge: item.donorBadge,
          donorJoined: item.donorJoined,
          donorDonatedCount: item.donorDonatedCount || 3,
          donorResponseTime: item.donorResponseTime,
          donorRating: item.donorRating,
          viewsCount: item.viewsCount || 10,
          requestsCount: item.requestsCount || 0,
          status: 'available',
          specs: item.specs,
          createdAt: item.createdAt || new Date().toISOString(),
        };

        await setDoc(docRef, itemDoc);
        seededCount++;
      }
    }

    // 2. Seed locations database (major Iranian cities and neighborhoods) into Firestore
    for (const loc of IRAN_CITIES_DATA) {
      const locRef = doc(db, COLLECTIONS.LOCATIONS, loc.id);
      const locSnap = await getDoc(locRef);
      if (!locSnap.exists()) {
        await setDoc(locRef, loc);
      }
    }

    if (seededCount > 0) {
      console.info(`Successfully seeded ${seededCount} new giveaway items and locations database into Firestore.`);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Seeding check note:', e);
    return false;
  }
}

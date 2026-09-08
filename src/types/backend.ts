export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  city: string;
  district: string;
  bio?: string;
  donatedCount: number;
  receivedCount: number;
  createdAt: string;
}

export type ItemCondition = 'سالم' | 'کاملاً نو' | 'در حد نو' | 'نیازمند تعمیر';
export type DeliveryMethod = 'pickup' | 'courier' | 'any';
export type ItemStatus = 'available' | 'reserved' | 'given';

export interface GiveawayItemDoc {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  condition: ItemCondition;
  city: string;
  district: string;
  location: string;
  pickupAddress?: string;
  deliveryMethod: DeliveryMethod;
  deliveryLabel: string;
  urgentPickup?: boolean;
  imageUrl: string;
  images?: string[];
  donorId: string;
  donorName: string;
  donorBadge?: string;
  donorJoined?: string;
  donorDonatedCount?: number;
  donorResponseTime?: string;
  donorRating?: string;
  viewsCount: number;
  requestsCount: number;
  status: ItemStatus;
  specs?: { label: string; value: string }[];
  createdAt: string;
  updatedAt?: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export interface ItemRequestDoc {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImageUrl?: string;
  requesterId: string;
  requesterName: string;
  donorId: string;
  donorName: string;
  message: string;
  pickupOption?: DeliveryMethod;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'new_request'
  | 'request_accepted'
  | 'request_declined'
  | 'item_comment';

export interface NotificationDoc {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  itemId?: string;
  requestId?: string;
  read: boolean;
  createdAt: string;
}

export interface CategoryDoc {
  id: string;
  label: string;
  icon: string;
  sortOrder: number;
  itemCount?: number;
}

export interface LocationDoc {
  id: string;
  cityName: string;
  districts: string[];
}

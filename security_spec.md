# Maalto Firebase Security Specification

## 1. Core Data Invariants & Zero-Trust Policies
1. **100% Free Donation Model**: Items MUST NOT have any fields for `price`, `currency`, `cost`, `fee`, or `payment`. Any payload attempting to introduce pricing or financial transaction keys is strictly rejected.
2. **Item Ownership**: `donorId` MUST strictly match `request.auth.uid` on item creation. Non-donors cannot update item metadata or delete items.
3. **Request Integrity**: `requesterId` MUST strictly match `request.auth.uid` on claim creation. A user cannot claim an item on behalf of someone else.
4. **Request State Transitions**: Status can only transition between `pending`, `accepted`, `declined`, and `completed`. Only the item's donor or the original requester can update the request status.
5. **Notification Confidentiality**: Notifications can only be read or modified by the user whose `userId` matches `request.auth.uid`.
6. **User Profile Protection**: Users can only create or update their own profile document (`/users/{userId}` where `userId == request.auth.uid`).

## 2. The "Dirty Dozen" Malicious Payloads
1. **Dirty Payload 1 (Price Injection Attack)**: An item payload injecting `price: 50000` or `currency: "IRR"`.
2. **Dirty Payload 2 (Donor Identity Spoof)**: Creating an item with `donorId: "victim_user_123"` while authenticated as `attacker_uid`.
3. **Dirty Payload 3 (Ghost Field Injection)**: Attempting to insert arbitrary unverified boolean properties like `isVerified: true` or `isAdmin: true`.
4. **Dirty Payload 4 (Requester Impersonation)**: Creating a claim request with `requesterId: "other_user"` to impersonate someone else.
5. **Dirty Payload 5 (Unauthorized Item Deletion)**: Calling `deleteDoc(itemRef)` when `request.auth.uid != resource.data.donorId`.
6. **Dirty Payload 6 (Illegal Status Hijack)**: Arbitrary non-donor attempting to transition request status to `accepted`.
7. **Dirty Payload 7 (Denial-of-Wallet Payload)**: Injecting 2MB strings into `title` or `description`.
8. **Dirty Payload 8 (Notification Siphoning)**: Attempting to query or list `/notifications` without scoping to `resource.data.userId == request.auth.uid`.
9. **Dirty Payload 9 (User Profile Overwrite)**: Attempting to overwrite `/users/target_uid` while signed in as a different user.
10. **Dirty Payload 10 (Path Poisoning)**: Submitting junk document IDs containing path traversal or non-alphanumeric characters.
11. **Dirty Payload 11 (Unauthenticated Item Publication)**: Attempting to create an item without an authenticated Firebase session.
12. **Dirty Payload 12 (Immortality Violation)**: Attempting to alter `createdAt` or `donorId` during an item update.

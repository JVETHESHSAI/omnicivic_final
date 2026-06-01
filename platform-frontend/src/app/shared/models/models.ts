
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarBase64: string | null;
  role: Role;
  communityPrefix: string;
  isFirstLogin: boolean;
  branding: CommunityBranding | null;
}

export interface ResetPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CO_ADMIN' | 'RESIDENT' | 'STAFF';

export interface CommunityBranding {
  communityPrefix: string;
  name: string;
  logoBase64: string | null;
  bannerBase64: string | null;
  themeColor: string | null;
  mapCenterLat: number | null;
  mapCenterLng: number | null;
  mapZoom: number | null;
  mapBoundary: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
}

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarBase64: string | null;
  bio: string | null;
  role: Role;
  communityPrefix: string;
  active: boolean;
  firstLogin: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarBase64?: string | null;
}

export interface CreateUserResponse {
  id: number;
  username: string;
  temporaryPassword: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  communityPrefix: string;
}

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PROOF_SUBMITTED'
  | 'RESOLVED'
  | 'CLOSED';

export interface ComplaintProof {
  id: number;
  submittedByUsername: string;
  workNote: string;
  imageBase64: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason: string | null;
  reviewedByUsername: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Complaint {
  id: number;
  communityComplaintNumber: number | null;
  communityPrefix: string;
  categoryName: string;
  categoryId: number;
  submittedByUsername: string;
  assignedToUsername: string | null;
  description: string;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  upvoteCount: number;
  canUpvote: boolean;
  resolutionNote: string | null;
  estimatedResolutionAt: string | null;
  thumbnailBase64: string | null;   // first image — for card thumbnails
  mediaBase64List: string[];        // full list — for detail view
  proofs: ComplaintProof[];
  myProofRejected: boolean;      // backend computed — true when this staff's proof was rejected and handed over
  myRejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface ComplaintDetail extends Complaint {
  mediaBase64List: string[];
}

export interface CreateComplaintRequest {
  categoryId: number;
  description: string;
  latitude: number;
  longitude: number;
  mediaBase64List?: string[];
}

export interface SubmitProofRequest {
  workNote: string;
  imageBase64?: string | null;
}

export interface ReviewProofRequest {
  decision: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
  reassignToStaffId?: number | null;
}

export interface AssignComplaintRequest {
  staffId: number;
  estimatedResolutionAt?: string;
}

export interface Category {
  id: number;
  communityPrefix: string;
  name: string;
  description: string;
  iconName: string;
  active: boolean;
}

export interface MapPin {
  complaintId: number;
  latitude: number;
  longitude: number;
  status: ComplaintStatus;
  categoryName: string;
  description: string;
}

export interface Notification {
  id: number;
  type: string;
  message: string;
  complaintId: number | null;
  read: boolean;
  createdAt: string;
}

export interface ServiceRequest {
  id: number;
  organizationName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  description: string;
  address: string;
  addressLat: number | null;
  addressLng: number | null;
  logoBase64: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  status: string;
  assignedPrefix: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

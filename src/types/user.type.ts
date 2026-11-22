export interface ITermsAgreement {
  accepted: boolean;
  version?: string;
  acceptedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  latestVersion?: string;
  requiresReacceptance?: boolean;
}

export interface IUserData {
  _id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  isEmailVerified?: boolean;
  termsAgreement?: ITermsAgreement;
  verificationStatus?: string;
  isVerified?: boolean;
  hasActiveSubscription?: boolean;
  currentSubscription?: unknown;
  subscribedChildrenCount?: number;
  totalChildrenCount?: number;
  childSubscriptions?: Array<{
    childPlayerId: string;
    childUserId?: string;
    fullName?: string;
    hasActiveSubscription: boolean;
    subscriptionStatus?: string;
    currentSubscription?: unknown;
  }>;
  [key: string]: unknown;
}

export interface IUserProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IUserData;
}

export interface IAcceptTermsPayload {
  termsAccepted: boolean;
  version: string;
}

export interface IAcceptTermsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: unknown;
}


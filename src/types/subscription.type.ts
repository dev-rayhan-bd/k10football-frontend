export interface ISubscriptionPlan {
  _id: string;
  id?: string;
  title: string;
  planName: string;
  planCategory: "PLAYER" | "COACH" | "AGENT" | "CLUB" | "ACADEMY" | string;
  targetRole?: string;
  price: number;
  currency?: string;
  billingCycle?: "MONTHLY" | "YEARLY" | string;
  features: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status?: "ACTIVE" | "INACTIVE" | string;
  isDefaultPricing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubscriptionPlansResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISubscriptionPlan[];
}

export interface ISubscribeToPlanPayload {
  planId: string;
}

export interface ISubscribeToPlanResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: {
    checkoutSessionUrl?: string;
    checkoutUrl?: string;
    url?: string;
    subscriptionId?: string;
    [key: string]: unknown;
  };
  checkoutSessionUrl?: string;
}

export interface ICurrentSubscription {
  id?: string;
  _id?: string;
  planId?: string;
  planTitle?: string;
  planCategory?: string;
  billingCycle?: string;
  amountPaid?: number;
  currency?: string;
  formattedAmount?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  nextBillingDate?: string | null;
  daysRemaining?: number;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  isAdminGrant?: boolean;
  features?: string[];
  paymentReference?: string | null;
}

export interface IUserSubscriptionData {
  hasActiveSubscription: boolean;
  userRole?: string;
  currentSubscription?: ICurrentSubscription | null;
}

export interface IUserSubscriptionResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IUserSubscriptionData;
}


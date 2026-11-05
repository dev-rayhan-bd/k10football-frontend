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

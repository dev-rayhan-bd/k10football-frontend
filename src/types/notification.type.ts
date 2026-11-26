/* eslint-disable @typescript-eslint/no-explicit-any */
export interface INotificationData {
  subscriptionId?: string;
  planId?: string;
  status?: string;
  playerId?: string;
  academyId?: string;
  actionUrl?: string;
  reportId?: string;
  newsId?: string;
  affiliationId?: string;
  coachId?: string;
  /** CV validation is paid but its coach left the academy — the user must pick another coach. */
  needsCoachReassignment?: boolean;
  [key: string]: any;
}

export interface INotificationItem {
  _id: string;
  recipientId?: string;
  recipientRole?: string;
  title: string;
  message: string;
  type: string;
  data?: INotificationData;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface INotificationsMeta {
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IGetNotificationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: INotificationsMeta;
  data: INotificationItem[];
}

export interface IGetUnreadCountResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    unreadCount: number;
  };
}

export interface IGetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface IBaseNotificationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

export interface INotificationControl {
  key: string;
  title: string;
  description: string;
  value: boolean;
}

export type INotificationSettingsDict = Record<string, boolean | undefined>;

export interface INotificationSettingsData {
  role: string;
  settings: INotificationSettingsDict;
  controls: INotificationControl[];
}

export interface IGetNotificationSettingsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: INotificationSettingsData;
}

export type IUpdateNotificationSettingsPayload = Partial<INotificationSettingsDict>;

export interface IUpdateNotificationSettingsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: INotificationSettingsData;
}


/** Notifications that change the player's CV validation state: refetch the CV when they arrive. */
export const CV_REFRESH_NOTIFICATION_TYPES = ["PLAYER_CV_VALIDATED", "PAYMENT_SUCCESS", "CV_VALIDATION_REQUEST"];

/** Academy ↔ coach affiliation changes: refetch the coach lists / invitations when they arrive. */
export const AFFILIATION_REFRESH_NOTIFICATION_TYPES = [
  "ACADEMY_INVITATION",
  "ACADEMY_INVITATION_WITHDRAWN",
  "ACADEMY_AFFILIATION_APPROVED",
  "ACADEMY_AFFILIATION_REJECTED",
];

/** ACADEMY_INVITATION (coach) → the invitations view; affiliation answers (academy) → My Coaches. */
export const getAcademyAffiliationPath = (item: INotificationItem): string | null => {
  if (item.type === "ACADEMY_INVITATION" || item.type === "ACADEMY_INVITATION_WITHDRAWN") {
    return "/dashboard/coach/academy-invitations";
  }
  if (item.type === "ACADEMY_AFFILIATION_APPROVED" || item.type === "ACADEMY_AFFILIATION_REJECTED") {
    return "/dashboard/academy/analysis/coach-players";
  }
  return null;
};

/** PAYOUT_REVIEW (admin): a re-assigned CV validation whose share was already paid. */
export const getPayoutReviewPath = (item: INotificationItem): string | null => {
  if (item.type !== "PAYOUT_REVIEW") return null;
  const transactionId = item.data?.transactionId;
  return transactionId
    ? `/dashboard/admin/payouts?transactionId=${encodeURIComponent(String(transactionId))}`
    : "/dashboard/admin/payouts";
};

/** PLAYER_CV_VALIDATED: the coach validated the CV, so open it. */
export const getCvValidatedPath = (item: INotificationItem, role: string): string | null => {
  if (item.type !== "PLAYER_CV_VALIDATED") return null;
  return role === "parent" ? "/dashboard/parent/profiles" : "/dashboard/player/my-cv";
};

/** PLAYER_EVALUATION_COMPLETED: open the player evaluation report. */
export const getEvaluationReportPath = (item: INotificationItem): string | null => {
  if (item.type !== "PLAYER_EVALUATION_COMPLETED") return null;
  const evaluationId = item.data?.evaluationId;
  return evaluationId
    ? `/dashboard/player/evaluations?evaluationId=${encodeURIComponent(String(evaluationId))}`
    : "/dashboard/player/evaluations";
};

/** CV validation whose coach left: send the player/parent to the "choose another coach" banner. */
export const getCoachReassignmentPath = (item: INotificationItem, role: string): string | null => {
  if (item.data?.needsCoachReassignment !== true) return null;
  if (item.type !== "CV_VALIDATION_REQUEST" && item.type !== "PAYMENT_SUCCESS") return null;
  return role === "parent" ? "/dashboard/parent/profiles" : "/dashboard/player/my-cv";
};

/** Academy Extra Events: a new registration (academy) / a paid registration confirmed (player/parent). */
export const EXTRA_EVENT_NOTIFICATION_TYPES = ["EXTRA_EVENT_REGISTRATION", "EXTRA_EVENT_REGISTERED"];

/**
 * EXTRA_EVENT_REGISTRATION (academy) → the event's management page;
 * EXTRA_EVENT_REGISTERED (player/parent) → My Events (or the public event page for other roles).
 */
export const getExtraEventPath = (item: INotificationItem, role: string): string | null => {
  const eventId = item.data?.eventId ? encodeURIComponent(String(item.data.eventId)) : null;
  if (item.type === "EXTRA_EVENT_REGISTRATION") {
    return eventId
      ? `/dashboard/academy/management/extra-events/${eventId}`
      : "/dashboard/academy/management/extra-events";
  }
  if (item.type === "EXTRA_EVENT_REGISTERED") {
    if (role === "player" || role === "parent") return `/dashboard/${role}/my-events`;
    return eventId ? `/events/${eventId}` : "/events";
  }
  return null;
};

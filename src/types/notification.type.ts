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

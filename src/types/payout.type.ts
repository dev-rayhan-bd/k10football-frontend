export type PayoutRecipientType = "COACH" | "ACADEMY";
export type PayoutRecipientFilter = "ALL" | PayoutRecipientType;
export type PayoutFilterStatus = "PENDING" | "PAID" | "ON_HOLD";
export type PayoutLineStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "ON_HOLD"
  | "LOCKED_NO_SUBSCRIPTION";

export interface IPayoutPlayerRef {
  _id?: string;
  id?: string;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
}

export interface IPayoutTransaction {
  transactionId: string;
  transactionType?: string | null;
  grossCost?: number | null;
  commission?: number | null;
  payoutStatus?: PayoutLineStatus | string | null;
  payoutReference?: string | null;
  paidAt?: string | null;
  player?: string | IPayoutPlayerRef | null;
  date?: string | null;
  notes?: string | null;
}

export interface IPayoutRecipient {
  recipientType: PayoutRecipientType;
  recipientId: string;
  recipientUserId?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  stripeConnected?: boolean;
  stripePayoutsEnabled?: boolean;
  totalEarned?: number | null;
  pendingAmount?: number | null;
  onHoldAmount?: number | null;
  completedPayoutAmount?: number | null;
  transactionsCount?: number | null;
  transactions?: IPayoutTransaction[];
}

export interface IPayoutSummary {
  totalPendingOverall?: number;
  totalPaidOverall?: number;
  totalOnHoldOverall?: number;
  totalCoachPending?: number;
  totalCoachPaid?: number;
  totalCoachOnHold?: number;
  totalAcademyPending?: number;
  totalAcademyPaid?: number;
  totalAcademyOnHold?: number;
  currency?: string;
}

export interface IAdminPayoutsData {
  summary?: IPayoutSummary;
  recipients?: IPayoutRecipient[];
}

export interface IApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: Record<string, unknown>;
  data: T;
}

export type IAdminPayoutsResponse = IApiEnvelope<IAdminPayoutsData>;

export interface IGetAdminPayoutsParams {
  recipientType?: PayoutRecipientType;
  status?: PayoutFilterStatus;
  recipientId?: string;
}

export interface IRecordPayoutPayload {
  recipientType: PayoutRecipientType;
  recipientId: string;
  transactionIds?: string[];
  payoutReference?: string;
  notes?: string;
}

export interface IRecordPayoutResult {
  success: boolean;
  recipientName?: string | null;
  amountPaid?: number | null;
  payoutReference?: string | null;
  stripeTransferId?: string | null;
  transactionsCount?: number | null;
  paidAt?: string | null;
}

export type IRecordPayoutResponse = IApiEnvelope<IRecordPayoutResult>;

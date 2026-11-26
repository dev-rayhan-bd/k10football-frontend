// Player/Parent → pay → Coach validates (K10 CV validation flow).

export type CvValidationStatus = "PENDING" | "AWAITING_PAYMENT" | "VERIFIED" | "EXPIRED";

export interface IRequestCvValidationPayload {
  coachId: string;
  /** Parent only — the linked child's player id. Never send a price. */
  playerId?: string;
}

export interface IRequestCvValidationData {
  /** null when a PAID request was just moved to a new coach (no extra payment). */
  checkoutUrl: string | null;
  sessionId?: string;
  amount: number;
  coachName?: string;
  status: CvValidationStatus | string;
}

export interface IRequestCvValidationResponse {
  success: boolean;
  message: string;
  data: IRequestCvValidationData;
}

export interface IVerifyCvValidationPaymentResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message?: string;
    /** Payment completed after the chosen coach left their academy — pick another coach. */
    needsCoachReassignment?: boolean;
    [key: string]: unknown;
  };
}

// GET /coaches/dropdown — academy-verified coaches for the picker ("" = unknown → "—").
export interface ICoachDropdownItem {
  _id: string;
  userId?: string;
  name: string;
  title?: string;
  avatar?: string;
  academyId?: string;
  academyName?: string;
  academyLogo?: string;
  isVerifiedByAcademy?: boolean;
  licenseStatus?: string;
  yearsExperience?: number | string;
  overallRatingScore?: number | string;
}

export interface ICoachDropdownResponse {
  success: boolean;
  message: string;
  data: ICoachDropdownItem[];
}

export interface IGetCoachDropdownParams {
  search?: string;
  academyId?: string;
}

// GET /players/me/cv → data.revalidation (also mirrored in data.tierStatus).
export type CvRevalidationState =
  | "NOT_VALIDATED"
  | "PAYMENT_PENDING"
  | "AWAITING_COACH"
  | "CHOOSE_NEW_COACH"
  | "VALID"
  | "EXPIRED";

export interface ICvRevalidation {
  state?: CvRevalidationState | string;
  action?: "REQUEST" | "COMPLETE_PAYMENT" | "CHOOSE_NEW_COACH" | "NONE" | string;
  canRequestRevalidation?: boolean;
  requiresPayment?: boolean;
  isValidationActive?: boolean;
  validUntil?: string | null;
  paymentStatus?: "UNPAID" | "PAID" | "USED" | string | null;
}

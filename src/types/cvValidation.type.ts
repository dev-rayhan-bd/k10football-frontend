// Player/Parent → pay → Coach validates (K10 CV validation flow).

export type CvValidationStatus = "PENDING" | "AWAITING_PAYMENT" | "VERIFIED" | "EXPIRED";

export interface IRequestCvValidationPayload {
  coachId: string;
  /** Parent only — the linked child's player id. Never send a price. */
  playerId?: string;
}

export interface IRequestCvValidationData {
  checkoutUrl: string;
  sessionId: string;
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
    [key: string]: unknown;
  };
}

// External coach evaluation via emailed access link (no account / no auth).

export interface IAccessLinkMatchDetails {
  homeTeam?: string;
  awayTeam?: string;
  matchDate?: string;
  leagueType?: string;
  location?: string;
  weather?: string;
  temperature?: number | string;
  result?: string;
  homeScore?: number;
  awayScore?: number;
}

export interface IAccessLinkAthlete {
  id?: string;
  name?: string;
  position?: string;
  club?: string;
  profileImage?: string;
}

export interface IAccessLinkEvaluator {
  name?: string;
  email?: string;
  role?: string;
}

export interface IEvaluationCriterion {
  id: string;
  name: string;
  category?: string;
  basePoints?: number;
}

export type AccessLinkStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | string;

export interface IAccessLinkReport {
  reportId: string;
  matchDetails?: IAccessLinkMatchDetails;
  athlete?: IAccessLinkAthlete;
  assignedEvaluator?: IAccessLinkEvaluator;
  status?: AccessLinkStatus;
  isExpired?: boolean;
  isCompleted?: boolean;
  canSubmit?: boolean;
  reportPdfUrl?: string | null;
  evaluationCriteriaList?: IEvaluationCriterion[];
}

export type AccessLinkRespondPayload =
  | { action: "ACCEPT"; evaluatorName: string; evaluatorRole: string }
  | { action: "REJECT"; rejectionReason: string };

export interface IAccessLinkSubmitPayload {
  minutesPlayed: string;
  stats: Record<string, number>;
  accurateShots: Array<{ x: number; y: number; target: "goal" | "saved" | "missed" }>;
  accurateAssists: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    assistType: "ground" | "through" | "aerial" | "cross";
  }>;
  coachFeedback: string;
  evaluatorName: string;
  evaluatorRole: string;
}

export interface IAccessLinkSubmitResult {
  reportId: string;
  overallRating?: number;
  reportPdfUrl?: string;
  pdfViewUrl?: string;
  pdfDownloadUrl?: string;
  isProfessionallyVerified?: boolean;
  author?: string;
}

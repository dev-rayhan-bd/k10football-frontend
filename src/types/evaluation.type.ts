// K10 Player Evaluations — 4-month cycle. Shapes follow the backend contract; anything the
// backend may omit is optional/nullable. Never derive status, due dates or grades on the client.

export type EvaluationGrade = "EXCELLENT" | "GOOD" | "IMPROVEMENT";

/** Client-side value for each grade (used only for display/preview, never sent). */
export const EVALUATION_GRADE_VALUES: Record<EvaluationGrade, number> = {
  EXCELLENT: 95,
  GOOD: 80,
  IMPROVEMENT: 65,
};

export const EVALUATION_GRADES: EvaluationGrade[] = ["IMPROVEMENT", "GOOD", "EXCELLENT"];

/** Exact skill keys accepted by POST /coaches/me/player-evaluations/:id/submit. */
export const EVALUATION_SKILLS = {
  techniques: [
    { key: "dribbling", label: "Dribbling" },
    { key: "ballMastery", label: "Ball Mastery" },
    { key: "runningWithBall", label: "Running with the Ball" },
    { key: "rangeOfPassing", label: "Range of Passing" },
    { key: "strikingFinishing", label: "Striking / Finishing" },
    { key: "defending", label: "Defending" },
    { key: "firstTouch", label: "First Touch" },
    { key: "nonDominantFoot", label: "Non Dominant Foot" },
  ],
  characteristics: [
    { key: "gameAwareness", label: "Game Awareness" },
    { key: "gamesUnderstanding", label: "Games Understanding" },
    { key: "decisionMaking", label: "Decision Making" },
    { key: "concentration", label: "Concentration" },
    { key: "leadership", label: "Leadership" },
    { key: "desire", label: "Desire" },
    { key: "maturity", label: "Maturity" },
  ],
  physical: [
    { key: "speedAcceleration", label: "Speed + Acceleration" },
    { key: "movement", label: "Movement" },
    { key: "balance", label: "Balance" },
    { key: "power", label: "Power" },
    { key: "strength", label: "Strength" },
    { key: "agility", label: "Agility" },
    { key: "coordination", label: "Co-ordination" },
  ],
} as const;

export type EvaluationSkillGroup = keyof typeof EVALUATION_SKILLS;
export type EvaluationGradeMap = Partial<Record<string, EvaluationGrade>>;

interface IApiEnvelope<T> {
  success: boolean;
  message: string;
  statusCode?: number;
  meta?: IEvaluationMeta;
  data: T;
}

export interface IEvaluationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface IEvaluationPersonRef {
  _id?: string;
  id?: string;
  name?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  profileImage?: string | null;
  position?: string | null;
  title?: string | null;
  [key: string]: unknown;
}

// ---------- A1. GET /academies/evaluations/dashboard ----------
export interface IAcademyEvaluationRequestItem {
  _id: string;
  /** Populated player (may be a bare id string on older rows). */
  playerId: IEvaluationPersonRef | string | null;
  /** Populated coach (may be a bare id string on older rows). */
  coachId: IEvaluationPersonRef | string | null;
  status: string;
  createdAt?: string | null;
  reminderCount?: number | null;
  lastReminderAt?: string | null;
  nextEvaluationDue?: string | null;
  notes?: string | null;
  [key: string]: unknown;
}

export interface IAcademyEvaluationsDashboardData {
  summary: {
    totalEvaluations: number;
    evaluatedCount: number;
    dueCount: number;
    overdueCount: number;
    evaluationCycleMonths: number;
  };
  due: IAcademyEvaluationRequestItem[];
  overdue: IAcademyEvaluationRequestItem[];
  evaluated: IAcademyEvaluationRequestItem[];
}
export type IAcademyEvaluationsDashboardResponse = IApiEnvelope<IAcademyEvaluationsDashboardData>;

// ---------- A2 / A3 ----------
export interface IRequestEvaluationPayload {
  playerId: string;
  coachId: string;
  notes?: string;
}
export type IRequestEvaluationResponse = IApiEnvelope<IAcademyEvaluationRequestItem>;
export type IRemindEvaluationResponse = IApiEnvelope<{ reminderCount: number; sentAt: string }>;

// ---------- A4. GET /academies/player-evaluations/dashboard ----------
export type AcademyEvaluationStatusFilter = "ALL" | "NEED_EVALUATION" | "EVALUATED" | "EXPIRED";

export interface IGetAcademyEvaluationAnalyticsParams {
  searchTerm?: string;
  ageGroup?: string;
  status?: AcademyEvaluationStatusFilter;
  page?: number;
  limit?: number;
}

export interface IAcademyEvaluationAnalyticsRow {
  _id?: string;
  evaluationId?: string | null;
  playerId?: string | null;
  player: {
    _id?: string;
    name?: string | null;
    avatar?: string | null;
    position?: string | null;
    tierBadge?: string | null;
    currentClub?: string | null;
  };
  coach?: { _id?: string; name?: string | null; avatar?: string | null; title?: string | null } | null;
  ageGroup?: string | null;
  formattedDate?: string | null;
  overallRating?: number | null;
  overallRatingFormatted?: string | null;
  /** Out of 20; may be null. */
  scores?: { technical?: number | null; physical?: number | null; mental?: number | null } | null;
  status: string;
  nextEvaluationDue?: string | null;
  reminderCount?: number | null;
  [key: string]: unknown;
}

export interface IAcademyEvaluationAnalyticsData {
  metrics: {
    avgOverallRating: number | string | null;
    improvingPlayers: number;
    evaluatedThisMonth: number;
    totalEvaluations: number;
    openRequests: number;
    evaluationCycleMonths: number;
  };
  mostImproved: { playerName?: string | null; ageGroup?: string | null; delta?: string | null; isPositive?: boolean }[];
  topPerformers: {
    rank: number;
    playerName?: string | null;
    ageGroup?: string | null;
    position?: string | null;
    rating?: number | string | null;
  }[];
  evaluations: IAcademyEvaluationAnalyticsRow[];
  meta?: IEvaluationMeta;
}
export type IAcademyEvaluationAnalyticsResponse = IApiEnvelope<IAcademyEvaluationAnalyticsData>;

// ---------- A5. GET /academies/player-evaluations/:id ----------
export interface IEvaluationSheetSkill {
  skill: string;
  rating: number | string | null;
  grade?: string | null;
}

export interface IEvaluationSheetData {
  _id?: string;
  evaluationId?: string;
  player?: IEvaluationPersonRef | null;
  coach?: IEvaluationPersonRef | string | null;
  academy?: { name?: string | null; logo?: string | null } | string | null;
  overallRating?: number | null;
  overallRatingFormatted?: string | null;
  grade?: string | null;
  status?: string | null;
  formattedDate?: string | null;
  formattedNextEvaluationDue?: string | null;
  coachFeedback?: string | null;
  notes?: string | null;
  sections: {
    technical?: IEvaluationSheetSkill[];
    mental?: IEvaluationSheetSkill[];
    physical?: IEvaluationSheetSkill[];
  };
  [key: string]: unknown;
}
export type IEvaluationSheetResponse = IApiEnvelope<IEvaluationSheetData>;

// ---------- A6 / B4. .../:id/pdf ----------
export interface IEvaluationPdfData {
  cycle?: string | null;
  formattedDate?: string | null;
  formattedNextEvaluationDue?: string | null;
  overallRating?: number | null;
  grade?: string | null;
  categoryScores?: { technical?: number | null; physical?: number | null; mental?: number | null } | null;
  player?: IEvaluationPersonRef | null;
  coach?: IEvaluationPersonRef | null;
  academy?: { name?: string | null; logo?: string | null } | null;
  breakdown?: {
    techniques?: EvaluationGradeMap;
    characteristics?: EvaluationGradeMap;
    physical?: EvaluationGradeMap;
  } | null;
  coachFeedback?: string | null;
  [key: string]: unknown;
}
export type IEvaluationPdfResponse = IApiEnvelope<IEvaluationPdfData>;

// ---------- B1. GET /coaches/me/player-evaluations ----------
export type CoachEvaluationStatusFilter = "PENDING" | "EVALUATED" | "EXPIRED" | "ALL";

export interface IGetCoachEvaluationsParams {
  status?: CoachEvaluationStatusFilter;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ICoachEvaluationRow {
  /** Player id. */
  _id: string;
  evaluationId?: string | null;
  name?: string | null;
  avatar?: string | null;
  position?: string | null;
  rating?: number | null;
  academy?: string | null;
  lastEvaluationDate?: string | null;
  nextEvaluationDue?: string | null;
  status: string;
  requestedByAcademy?: boolean;
  canSubmit?: boolean;
}

export interface ICoachEvaluationsData {
  summary: { total: number; pendingCount: number; evaluatedCount: number; expiredCount: number };
  players: ICoachEvaluationRow[];
}
export type ICoachEvaluationsResponse = IApiEnvelope<ICoachEvaluationsData>;

// ---------- B2. GET /coaches/me/player-evaluations/:id ----------
export interface ICoachEvaluationDetailData {
  player: IEvaluationPersonRef & { age?: number | null; rating?: number | null; academy?: string | null };
  evaluation: {
    _id?: string;
    status?: string | null;
    date?: string | null;
    overallRating?: number | null;
    technicalScore?: number | null;
    physicalScore?: number | null;
    mentalScore?: number | null;
    techniques?: EvaluationGradeMap;
    characteristics?: EvaluationGradeMap;
    physical?: EvaluationGradeMap;
    coachFeedback?: string | null;
    notes?: string | null;
    nextEvaluationDue?: string | null;
  } | null;
}
export type ICoachEvaluationDetailResponse = IApiEnvelope<ICoachEvaluationDetailData>;

// ---------- B3. POST /coaches/me/player-evaluations/:id/submit ----------
export interface ISubmitCoachEvaluationPayload {
  /** evaluationId for an open PENDING request, otherwise the player _id. */
  id: string;
  techniques?: EvaluationGradeMap;
  characteristics?: EvaluationGradeMap;
  physical?: EvaluationGradeMap;
  coachFeedback?: string;
  notes?: string;
}
export type ISubmitCoachEvaluationResponse = IApiEnvelope<{
  player?: { overallRating?: number | null; [key: string]: unknown };
  [key: string]: unknown;
}>;

// ---------- C. GET /academies/evaluations (player's own history) ----------
export interface IPlayerEvaluationHistoryItem {
  _id: string;
  status?: string | null;
  overallRating?: number | null;
  grade?: string | null;
  createdAt?: string | null;
  submittedAt?: string | null;
  evaluationDate?: string | null;
  nextEvaluationDue?: string | null;
  coachId?: IEvaluationPersonRef | string | null;
  academyId?: { name?: string | null } | string | null;
  [key: string]: unknown;
}
export type IPlayerEvaluationHistoryResponse = IApiEnvelope<IPlayerEvaluationHistoryItem[]>;

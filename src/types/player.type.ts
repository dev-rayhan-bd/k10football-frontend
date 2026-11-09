/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IPlayerRecentMatch {
  _id: string;
  title: string;
  matchDate: string;
  date: string;
  leagueType: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  result: string;
  location: string;
  playerRating: number;
  rating: number;
  rating10: number;
  rating100: number;
  interpretation: string;
  categoryRatings: Record<string, number>;
  goals: number;
  assists: number;
  passes: number;
  passAccuracy: number;
  minutesPlayed: number;
  file?: string | null;
  reportPdfUrl?: string | null;
  isVerified: boolean;
}

export interface IPlayerProfileData {
  _id: string;
  userId: string;
  playerId: string;
  fullName: string;
  position: string;
  secondaryPositions: string[];
  age: number;
  dateOfBirth: string;
  country: string;
  currentClub: string;
  marketValue: number;
  marketValueFormatted: string;
  formattedMarketValue: string;
  overallRating: number;
  cvTier: string;
  profileCompletion: number;
  profileImage: string;
  preferredFoot: string;
  isVerifiedByCoach: boolean;
  profileViews: number;
  totalLikes: number;
  clubsInterested: any[];
  createdAt: string;
  updatedAt: string;
  contractUntil: string;
  dualNationality: string;
  height: number;
  weight: number;
  accomplishments: any[];
  clubHistory: any[];
  coachVerification: {
    isVerified: boolean;
  };
  futsalMap: any[];
  languages: any[];
  perceptionMetrics: Record<string, any>;
  playerStyles: any[];
  positionMap: any[];
  transferStatus: {
    status: string;
  };
  visionMetrics: Record<string, any>;
  highlightVideo: string;
  phone: string;
  email: string;
  interpretation: string;
  rightFootDominance: number;
  leftFootDominance: number;
  footDonut: {
    right: number;
    left: number;
    preferredFoot: string;
  };
  website: string;
  availableStyles: string[];
  overviewStats: {
    profileViews: number;
    totalLikes: number;
    reports: number;
  };
  totalReports: number;
  attributes: {
    _id: string;
    playerId: string;
    categories: Record<string, Record<string, number>>;
    createdAt: string;
    updatedAt: string;
  };
  categoryAverages: Record<string, number>;
  skillsDonutScore: number;
  keyAttributes: Array<{
    key: string;
    label: string;
    value: number;
    weight: number;
  }>;
  performanceStats: {
    matches: number;
    goals: number;
    assists: number;
    reports: number;
  };
  matchSummary: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalPasses: number;
    avgPassAccuracy: number;
    wins: number;
    draws: number;
    losses: number;
    formGuide: string[];
    avgMatchRating: number;
  };
  recentMatches: IPlayerRecentMatch[];
  professionalReports: any[];
  documents?: IPlayerDocument[];
  certificates?: IPlayerDocument[];
}

export interface IPlayerDocument {
  _id: string;
  id?: string;
  title: string;
  url: string;
  fileUrl?: string;
  fileType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface IPlayerProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPlayerProfileData;
}

export interface IUpdatePlayerPayload {
  fullName?: string;
  position?: string;
  secondaryPositions?: string[];
  dateOfBirth?: string;
  country?: string;
  dualNationality?: string;
  academy?: string;
  coachName?: string;
  licenseNumber?: string;
  clubManaged?: string;

  height?: number;
  weight?: number;
  preferredFoot?: string;
  rightFootDominance?: number;
  leftFootDominance?: number;

  phone?: string;
  website?: string;

  languages?: Array<{
    language: string;
    proficiency: string;
  }>;

  agentStatus?: string;
  agentName?: string;
  agencyName?: string;
  clubStatus?: string;
  currentClub?: string;
  contractUntil?: string;
  marketValue?: number;

  playerStyles?: string[];

  positionMap?: Array<{
    slot: string;
    position: string;
    role: string;
    x: number;
    y: number;
  }>;
  futsalMap?: Array<{
    slot: string;
    position: string;
    role: string;
    x: number;
    y: number;
  }>;

  accomplishments?: Array<{
    year: number;
    title: string;
  }>;

  clubHistory?: Array<{
    clubName: string;
    period?: string;
    from?: string;
    to?: string;
    isCurrent: boolean;
    logoUrl?: string;
  }>;

  perceptionMetrics?: {
    spaceAwareness?: { score: number; trend: number; grade?: string };
    opponentReading?: { score: number; trend: number; grade?: string };
    gameFlowUnderstanding?: { score: number; trend: number; grade?: string };
    pressureHandling?: { score: number; trend: number; grade?: string };
    [key: string]: any;
  };

  visionMetrics?: {
    peripheralVision?: { score: number; trend: number; grade?: string };
    focusControl?: { score: number; trend: number; grade?: string };
    patternRecognition?: { score: number; trend: number; grade?: string };
    decisionSpeed?: { score: number; trend: number; grade?: string };
    visualAcuity?: { score: number; trend: number; grade?: string };
    visionField?: { score: number; trend: number; grade?: string };
    targetFinding?: { score: number; trend: number; grade?: string };
    [key: string]: any;
  };

  strength?: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
    heading?: number;
    [key: string]: any;
  };

  [key: string]: any;
}

export interface ICreateSelfGameReportPayload {
  playerInfo: {
    playerName: string;
    dateOfBirth: string;
    clubName: string;
    position: string;
    foot: string;
    characteristics: string[];
    weight: number;
    height: number;
  };
  scoutName: string;
  gameType: string;
  gameDate: string;
  gameLocation: string;
  matchResult: string;
  weather: string;
  temperature: number;
  opponentTeam: string;
  ownTeam: string;
  homeScore: number;
  awayScore: number;
  minutesPlayed?: string;
  stats?: {
    shotsOnGoal?: number;
    goalScored?: number;
    assists?: number;
    passAccurate?: number;
    wrongPass?: number;
    penaltiesTaken?: number;
    standTackle?: number;
    slidingTackle?: number;
    interception?: number;
    appearances?: number;
    fault?: number;
    redCard?: number;
    yellowCard?: number;
    punching?: number;
    handling?: number;
    reflex?: number;
    aerialAbility?: number;
    throwing?: number;
    reactions?: number;
    savesAccurate?: number;
    freeKick?: number;
    cornerKick?: number;
    goalUnsave?: number;
    penaltiesSaves?: number;
    [key: string]: any;
  };
  accurateShots?: Array<{
    x: number;
    y: number;
  }>;
  accurateAssists?: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>;
}

export interface ICompleteSelfGameReportPayload {
  minutesPlayed: string;
  stats: Record<string, number>;
  accurateShots: Array<{
    x: number;
    y: number;
  }>;
  accurateAssists: Array<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>;
  coachFeedback?: string;
}

export interface IRequestCoachGameReportPayload {
  coachId: string;
  playerInfo: {
    playerName: string;
    dateOfBirth: string;
    clubName: string;
    position: string;
    foot: string;
    characteristics: string[];
    weight: number;
    height: number;
  };
  scoutName?: string;
  gameType?: string;
  gameDate?: string;
  gameLocation?: string;
  matchResult?: string;
  weather?: string;
  temperature?: number;
  ownTeam?: string;
  opponentTeam?: string;
  homeScore?: number;
  awayScore?: number;
  [key: string]: any;
}

export interface IRequestCoachGameReportResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: {
    reportId?: string;
    checkoutUrl?: string;
    sessionId?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
  checkoutUrl?: string;
}

export interface IGameReportResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    reportId?: string;
    checkoutUrl?: string;
    sessionId?: string;
    amount?: number;
    status?: string;
    [key: string]: any;
  };
  checkoutUrl?: string;
}

export interface IGameReportPerformanceMetrics {
  goals: number;
  assists: number;
  passes: number;
  [key: string]: number;
}

export interface IGameReportItem {
  _id: string;
  reportId?: string;
  report?: string;
  title: string;
  subtitle?: string;
  homeTeam?: string;
  awayTeam?: string;
  position?: string;
  league?: string;
  score?: string;
  homeScore?: number;
  awayScore?: number;
  rating?: number;
  scoutRating?: number;
  amount?: string;
  amountNumber?: number;
  approvalDate?: string;
  date?: string;
  status: "PAID" | "PENDING" | string;
  paymentStatus?: "PAID" | "UNPAID" | "FREE" | string;
  evaluationStatus?: "PENDING" | "UNREQUESTED" | "COMPLETED" | string;
  performanceMetrics?: IGameReportPerformanceMetrics;
  scoutAnalysis?: string;
  reportPdfUrl?: string | null;
  action?: {
    view?: boolean;
    download?: boolean;
  };
}

export interface IGameReportsSummary {
  totalReports: number;
  averageRating: number;
  completed: number;
  pending: number;
}

export interface IGameReportsData {
  summary: IGameReportsSummary;
  reports: IGameReportItem[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IPlayerGameReportsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IGameReportsData;
}

// Player Analytics Types
export interface IPlayerAnalyticsSummaryItem {
  value: number | string;
  label: string;
  icon: string;
}

export interface IPlayerAnalyticsSummary {
  overallRating?: IPlayerAnalyticsSummaryItem;
  goals?: IPlayerAnalyticsSummaryItem;
  assists?: IPlayerAnalyticsSummaryItem;
  improvement?: IPlayerAnalyticsSummaryItem;
  [key: string]: IPlayerAnalyticsSummaryItem | undefined;
}

export interface IRadarDataItem {
  attribute?: string;
  subject?: string;
  value?: number;
  A?: number;
  fullMark?: number;
}

export interface IFullPotentialAnalytics {
  title?: string;
  subtitle?: string;
  overallScore?: number;
  overallScoreDisplay?: string;
  scoreColor?: string;
  growth?: number;
  growthDisplay?: string;
  growthDirection?: "up" | "down" | string;
  growthText?: string;
  radarColor?: string;
  radarData?: IRadarDataItem[];
  attributes?: Record<string, number>;
}

export interface IMentalAnalysisAnalytics {
  title?: string;
  subtitle?: string;
  overallScore?: number;
  overallScoreDisplay?: string;
  scoreColor?: string;
  growth?: number;
  growthDisplay?: string;
  growthDirection?: "up" | "down" | string;
  growthText?: string;
  radarColor?: string;
  radarData?: IRadarDataItem[];
  attributes?: Record<string, number>;
}

export interface ISubSkillItem {
  key?: string;
  name: string;
  value: number;
  percentage?: string;
  color?: string;
}

export interface ISkillAnalysisItem {
  id?: string;
  title: string;
  score?: number;
  percentage?: string | number;
  color?: string;
  subSkills?: ISubSkillItem[];
  subMetrics?: ISubSkillItem[];
}

export interface IPerformanceTrendItem {
  month: string;
  monthFull?: string;
  goals: number;
  assists: number;
  rating: number;
}

export interface IPlayerAnalyticsInfo {
  fullName?: string;
  position?: string;
  currentClub?: string;
  profileImage?: string;
  tier?: string;
}

export interface IPlayerAnalyticsData {
  playerId?: string;
  playerInfo?: IPlayerAnalyticsInfo;
  summary?: IPlayerAnalyticsSummary;
  fullPotential?: IFullPotentialAnalytics;
  mentalAnalysis?: IMentalAnalysisAnalytics;
  skillsAnalysis?: ISkillAnalysisItem[];
  performanceTrend?: IPerformanceTrendItem[];
}

export interface IPlayerAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPlayerAnalyticsData;
}



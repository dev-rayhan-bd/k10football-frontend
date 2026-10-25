/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ICoachPersonalInformation {
  fullName?: string;
  dateOfBirth?: string;
  age?: number;
  birthCountry?: string;
  birthCountryFlag?: string;
  dualNationality?: string;
  dualNationalityFlag?: string;
}

export interface ICoachContact {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface ICoachSeasonStats {
  matchesCoached?: number;
  totalWins?: number;
  losses?: number;
  draws?: number;
  winRate?: number;
  cleanSheets?: number;
}

export interface ICoachTransferStatus {
  footballAgentContract?: string;
  contractUntil?: string;
  agent?: string;
  agency?: string;
  salary?: string;
  statusBadge?: string;
}

export interface ICoachAccomplishment {
  _id?: string;
  text: string;
}

export interface ICoachLanguage {
  _id?: string;
  language: string;
  proficiency: "NATIVE" | "FLUENT" | "INTERMEDIATE" | "BASIC" | string;
}

export interface ICoachMajorTrophy {
  _id?: string;
  title: string;
  count: number;
  year?: number;
}

export interface ICoachCupPlayed {
  _id?: string;
  year: number;
  tournament: string;
}

export interface ICoachKeySkill {
  _id?: string;
  name: string;
  icon?: string;
  isCustom?: boolean;
}

export interface ICoachClubHistory {
  _id?: string;
  clubName: string;
  role: string;
  period: string;
  startYear?: number;
  endYear?: number;
  isCurrent?: boolean;
  logoUrl?: string;
}

export interface ICoachAssociation {
  _id?: string;
  name: string;
  code: string;
  isSelected: boolean;
}

export interface ICoachCourse {
  _id?: string;
  name: string;
  category?: string;
  isCompleted?: boolean;
  isSelected?: boolean;
}

export interface ICoachFormationPosition {
  id: string;
  x: number;
  y: number;
}

export interface ICoachFormation {
  _id?: string;
  formationSlot: number;
  formationName?: string;
  positions: ICoachFormationPosition[];
  coachId?: string;
}

export interface ICoachDocument {
  _id?: string;
  title: string;
  fileUrl: string;
  fileType: string;
  uploadedAt?: string;
}

export interface ICoachAssignedPlayerReview {
  _id: string;
  playerName: string;
  playerPosition: string;
  playerAvatar: string;
  rating: number;
  status: string;
  matchDate?: string;
  amount?: string;
  action?: string;
}

export interface ICoachTierStatus {
  currentTier: string;
  profileCompletion: number;
  completionPercentage: number;
  label?: string;
  canRequestRevalidation?: boolean;
}

export interface ICoachProfileData {
  _id?: string;
  userId?: string;
  overallRatingScore?: number;
  status?: string;
  coachType?: "INDIVIDUAL_COACH" | "CLUB_COACH" | string;
  fullName?: string;
  title?: string;
  yearsExperience?: number;
  cvTier?: string;
  profileCompletion?: number;
  completionPercentage?: number;
  speciality?: string;
  licenseStatus?: string;
  currentClub?: string;
  clubLogo?: string;
  profileImage?: string;
  coverImage?: string;
  validationStatus?: string;
  revalidationRequested?: boolean;
  tierStatus?: ICoachTierStatus;
  personalInformation?: ICoachPersonalInformation;
  contact?: ICoachContact;
  seasonStats?: ICoachSeasonStats;
  transferStatus?: ICoachTransferStatus;
  accomplishments?: ICoachAccomplishment[];
  coachStyles?: string[];
  languages?: ICoachLanguage[];
  majorTrophies?: ICoachMajorTrophy[];
  cupsPlayed?: ICoachCupPlayed[];
  keySkills?: ICoachKeySkill[];
  clubHistory?: ICoachClubHistory[];
  associations?: ICoachAssociation[];
  courses?: ICoachCourse[];
  formations?: ICoachFormation[];
  documents?: ICoachDocument[];
  assignedPlayerReviews?: ICoachAssignedPlayerReview[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICoachCvResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICoachProfileData;
}

export interface IUpdateCoachPayload {
  coachType?: string;
  fullName?: string;
  title?: string;
  yearsExperience?: number;
  overallRatingScore?: number;
  licenseStatus?: string;
  speciality?: string;
  status?: string;
  currentClub?: string;
  personalInformation?: ICoachPersonalInformation;
  contact?: ICoachContact;
  seasonStats?: ICoachSeasonStats;
  transferStatus?: ICoachTransferStatus;
  clubHistory?: ICoachClubHistory[];
  coachStyles?: string[];
  languages?: { language: string; proficiency: string }[];
  keySkills?: { name: string; icon?: string }[];
  associations?: { name: string; code: string; isSelected: boolean }[];
  courses?: { name: string; category?: string; isCompleted?: boolean; isSelected?: boolean }[];
  formations?: { formationSlot: number; formationName?: string; positions: { id: string; x: number; y: number }[] }[];
  accomplishments?: { text: string }[];
  majorTrophies?: { title: string; count: number; year?: number }[];
  cupsPlayed?: { year: number; tournament: string }[];
  profileImage?: File | string;
  coverImage?: File | string;
  data?: string;
}

export interface ICoachTestimonial {
  _id: string;
  id?: string;
  coachId?: string;
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
  authorAvatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICoachTestimonialsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICoachTestimonial[];
}

export interface ICreateCoachTestimonialPayload {
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
  authorAvatar?: File;
}

export interface IUpdateCoachTestimonialPayload {
  testimonialId: string;
  authorName?: string;
  authorRole?: string;
  rating?: number;
  comment?: string;
  authorAvatar?: File;
}

export interface ICoachListItem {
  _id: string;
  userId: {
    _id: string;
    email?: string;
    name?: string;
    avatar?: string;
    phone?: string;
  } | string;
  fullName?: string;
  title?: string;
  coachType?: string;
  currentClub?: string;
  speciality?: string;
  licenseStatus?: string;
  status?: string;
  overallRatingScore?: number;
  profileImage?: string;
  yearsExperience?: number;
  [key: string]: any;
}

export interface ICoachListResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ICoachListItem[];
}

export interface ICoachProfileAnalysis {
  tactics: number;
  leadership: number;
  communication: number;
  adaptability: number;
  discipline: number;
  development: number;
  overall?: number;
}

export interface ITournamentPercentages {
  win: number;
  loss: number;
  draw: number;
  runnerUp: number;
  champion: number;
}

export interface ITournamentStats {
  win: number;
  loss: number;
  draw: number;
  runnerUp: number;
  champion: number;
  totalMatches: number;
  percentages: ITournamentPercentages;
}

export interface ICoachMajorTrophyItem {
  name: string;
  value: number;
}

export interface ICoachTrophyTableRow {
  _id?: string;
  trophyName: string;
  number: number;
  win: number;
  loss: number;
  draw: number;
  runnerUp: number;
  champion: number;
}

export interface ICoachAnalyticsData {
  coachType?: string;
  cvTier?: string;
  coachProfileAnalysis: ICoachProfileAnalysis;
  tournamentStats: ITournamentStats;
  majorTrophies: ICoachMajorTrophyItem[];
  trophiesTable: ICoachTrophyTableRow[];
}

export interface ICoachAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICoachAnalyticsData;
}

export interface ICoachTeamSummary {
  totalPlayers: number;
  avgRating: number;
  active: number;
  injured: number;
}

export interface ICoachTeamAcademy {
  id?: string;
  name?: string;
  logo?: string;
}

export interface ICoachTeamAttendance {
  sessionId?: string;
  attendanceId?: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "UNMARKED" | string;
  isAttended: boolean;
  isIn: boolean;
  markedAt?: string | null;
  rsvpStatus?: string;
  notes?: string;
}

export interface ICoachTeamPlayer {
  _id: string;
  id?: string;
  name: string;
  email: string;
  position: string;
  avatar?: string;
  jerseyNumber?: string | number;
  rating: number;
  matches: number;
  goals: number;
  assists: number;
  status: string;
  country?: string;
  age?: number;
  attendance?: ICoachTeamAttendance;
}

export interface ICoachTeamActiveSession {
  _id?: string;
  id?: string;
  sessionName?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  trainingLocation?: string;
  sessionType?: string;
  focusArea?: string;
  presentCount?: number;
  lateCount?: number;
  absentCount?: number;
  unmarkedCount?: number;
  totalPlayers?: number;
  attendancePercentage?: number;
  isAttendanceCompleted?: boolean;
}

export interface ICoachTeamAvailableSession {
  _id?: string;
  id?: string;
  sessionName?: string;
  sessionDate?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  trainingLocation?: string;
  teamName?: string;
  presentCount?: number;
  totalPlayers?: number;
}

export interface ICoachTeamSessionInfo {
  selectedDate?: string;
  activeSession?: ICoachTeamActiveSession | null;
  availableSessions?: ICoachTeamAvailableSession[];
}

export interface ICoachTeamData {
  summary: ICoachTeamSummary;
  academy?: ICoachTeamAcademy;
  sessionInfo?: ICoachTeamSessionInfo;
  players: ICoachTeamPlayer[];
}

export interface ICoachTeamResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ICoachTeamData;
}

export interface ICoachGameReportsSummary {
  totalReports: number;
  completed: number;
  pending: number;
  thisMonth: number;
  paidReports?: number;
  unpaidReports?: number;
}

export interface ICoachGameReportPlayer {
  _id: string;
  name: string;
  position: string;
  avatar?: string;
}

export interface ICoachGameReportItem {
  _id: string;
  player: ICoachGameReportPlayer;
  rating: number | string;
  matches: string;
  goals: number;
  assists: number;
  date: string;
  amount: string;
  paymentStatus?: string;
  isPaid?: boolean;
  transactionId?: string;
  status: "PENDING" | "COMPLETED" | string;
  createdAt?: string;
}

export interface ICoachGameReportsData {
  summary: ICoachGameReportsSummary;
  reports: ICoachGameReportItem[];
}

export interface ICoachGameReportsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ICoachGameReportsData;
}

export interface ICoachPlayerCvValidationSummary {
  pendingValidations: number;
  verifiedCvs: number;
  updatedThisMonth: number;
  expiredStatus: number;
}

export interface ICoachPlayerCvValidationPlayer {
  _id: string;
  id?: string;
  name: string;
  email: string;
  position: string;
  avatar?: string;
  rating: number;
  club?: string;
  goals: number;
  assists: number;
  matches?: number;
  lastValidated?: string;
  status: "VERIFIED" | "PENDING" | "EXPIRED" | string;
  createdAt?: string;
}

export interface ICoachPlayerCvValidationsData {
  summary: ICoachPlayerCvValidationSummary;
  players: ICoachPlayerCvValidationPlayer[];
}

export interface ICoachPlayerCvValidationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ICoachPlayerCvValidationsData;
}

export interface ICoachPlayerEvaluationSummary {
  pendingCount: number;
  evaluatedCount: number;
}

export interface ICoachPlayerEvaluationItem {
  _id: string;
  id?: string;
  evaluationId?: string | null;
  name: string;
  avatar?: string;
  position: string;
  rating: number;
  academy?: string;
  lastEvaluated?: string;
  status: "PENDING" | "EVALUATED" | string;
  nextEvaluationDue?: string | null;
  age?: number | string;
}

export interface ICoachPlayerEvaluationsData {
  summary: ICoachPlayerEvaluationSummary;
  players: ICoachPlayerEvaluationItem[];
}

export interface ICoachPlayerEvaluationsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: ICoachPlayerEvaluationsData;
}

export type FitnessStatusType = "ACTIVE" | "INJURED";

export interface IUpdatePlayerFitnessStatusPayload {
  playerId: string;
  status: FitnessStatusType | string;
}

export interface IUpdatePlayerFitnessStatusResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

export interface ICoachCompleteGameReportStats {
  shotsOnGoal: number;
  goalScored: number;
  assists: number;
  passAccurate: number;
  wrongPass: number;
  penaltiesTaken: number;
  standTackle: number;
  slidingTackle: number;
  interception: number;
  appearances: number;
  fault: number;
  redCard: number;
  yellowCard: number;
  punching: number;
  handling: number;
  reflex: number;
  aerialAbility: number;
  throwing: number;
  reactions: number;
  savesAccurate: number;
  freeKick: number;
  cornerKick: number;
  goalUnsave: number;
  penaltiesSaves: number;
}

export interface ICoachCompleteGameReportPayload {
  reportId: string;
  minutesPlayed: string;
  stats: ICoachCompleteGameReportStats | Record<string, number>;
  accurateShots: Array<{ x: number; y: number }>;
  accurateAssists: Array<{ fromX: number; fromY: number; toX: number; toY: number }>;
  coachFeedback: string;
}

export interface ICoachCompleteGameReportResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: any;
}

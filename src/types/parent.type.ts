export interface IAssignedCoach {
  id: string;
  name: string;
  title?: string;
  profileImage?: string;
}

export interface ILinkedChild {
  linkId: string;
  relationshipType: string;
  childPlayerId: string;
  childUserId?: string;
  fullName: string;
  email?: string;
  position: string;
  profileImage?: string | null;
  cvTier?: string;
  isCvVerified?: boolean;
  isVerifiedByCoach?: boolean;
  isVerified?: boolean;
  overallRating?: number;
  age?: number;
  dateOfBirth?: string | null;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  currentClub?: string;
  accountManagedBy?: string;
  academy?: string;
  academyLocation?: string;
  coachesAssigned?: string;
  coachName?: string;
  assignedCoach?: IAssignedCoach;
  assignedCoaches?: IAssignedCoach[];
}

export interface ICreateChildData {
  name: string;
  email: string;
  dateOfBirth: string;
  position: string;
  height?: number;
  weight?: number;
  currentClub?: string;
  relationshipType: string;
}

export interface ICreateChildPayload {
  avatar?: File | null;
  data: ICreateChildData;
}

export interface ICreateChildResponse {
  statusCode: number;
  success: boolean;
  message: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any;
}

export interface ILinkedChildrenResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ILinkedChild[];
}

export interface IUpdateChildProfilePayload {
  fullName?: string;
  dateOfBirth?: string | null;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  position?: string;
  academyLocation?: string;
  academy?: string;
}

export interface IParentStatItem {
  count?: number;
  amount?: number;
  formatted: string;
  session?: unknown;
}

export interface IParentOverviewStats {
  children?: IParentStatItem;
  nextSession?: IParentStatItem;
  pendingFees?: IParentStatItem;
  activeReports?: IParentStatItem;
}

export interface IParentYouthProfile {
  _id?: string;
  id?: string;
  fullName: string;
  profileImage?: string | null;
  tier?: string;
  tierBadge?: string;
  position?: string;
  academyName?: string;
  headCoachName?: string;
  rating?: number;
  ratingFormatted?: string;
  formattedSubtitle?: string;
  headCoachFormatted?: string;
}

export interface IParentTrainingRsvpItem {
  id?: string | number;
  _id?: string;
  title?: string;
  sessionName?: string;
  date?: string;
  time?: string;
  location?: string;
  pitch?: string;
  status?: "Pending" | "Attending" | "Declined" | string;
  rsvpStatus?: "Pending" | "Attending" | "Declined" | string;
}

export interface IParentRecentActivityItem {
  id?: string | number;
  _id?: string;
  type?: string;
  title: string;
  description: string;
  time?: string;
  createdAt?: string;
  iconColor?: string;
}

export interface IParentOverviewChildItem {
  _id?: string;
  id?: string;
  fullName: string;
  position?: string;
  profileImage?: string | null;
  overallRating?: number;
  tier?: string;
  isCurrent?: boolean;
}

export interface IParentOverviewData {
  stats: IParentOverviewStats;
  youthProfile: IParentYouthProfile;
  trainingRsvp: IParentTrainingRsvpItem[];
  recentActivity: IParentRecentActivityItem[];
  children?: IParentOverviewChildItem[];
}

export interface IParentOverviewResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IParentOverviewData;
}

export interface IGetParentOverviewParams {
  childId?: string;
}

export interface IParentFeeChildPlayer {
  _id: string;
  fullName: string;
  position?: string;
  profileImage?: string | null;
}

export interface IParentFeeAcademy {
  _id: string;
  name: string;
  logo?: string;
}

export interface IParentFeeEvent {
  _id: string;
  eventName: string;
  eventDate?: string;
  venueName?: string;
}

export interface IParentFeeInvoice {
  _id: string;
  id?: string;
  title: string;
  invoiceNumber: string;
  idDisplay?: string;
  dueDate: string;
  dueDateFormatted?: string;
  amount: number;
  amountFormatted?: string;
  status: "UNPAID" | "PAID" | string;
  displayStatus?: string;
  feeType?: string;
  canPay: boolean;
  canDownload: boolean;
  childPlayer?: IParentFeeChildPlayer;
  academy?: IParentFeeAcademy;
  event?: IParentFeeEvent;
  paidAt?: string | null;
  transactionId?: string | null;
  paymentMethod?: string | null;
  createdAt?: string;
}

export interface IGetParentFeesParams {
  status?: "ALL" | "UNPAID" | "PAID" | string;
}

export interface IGetParentFeesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IParentFeeInvoice[];
}

export interface IPayFeeData {
  checkoutUrl: string;
  sessionId: string;
  invoiceNumber: string;
  amount: number;
}

export interface IPayFeeResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPayFeeData;
}

export interface IVerifyFeePaymentParams {
  session_id: string;
  invoiceId?: string;
  sessionId?: string;
}

export interface IVerifyFeePaymentResponse {
  statusCode: number;
  success: boolean;
  message: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data?: any;
}

export interface IParentSessionTeam {
  _id?: string;
  teamName: string;
  ageGroup?: string;
}

export interface IParentSessionCoach {
  name: string;
  avatar?: string | null;
}

export interface IParentSessionChild {
  playerId: string;
  fullName: string;
  position?: string;
  avatar?: string | null;
  jerseyNumber?: string;
}

export interface IParentSessionRsvp {
  status: "PENDING" | "CONFIRMED" | "DECLINED" | string;
  isConfirmed?: boolean;
  notes?: string;
  confirmedAt?: string | null;
}

export interface IParentSessionAttendance {
  status: "UNMARKED" | "PRESENT" | "ABSENT" | string;
  isAttended?: boolean;
  markedAt?: string | null;
}

export interface IParentTrainingSessionItem {
  sessionId: string;
  _id?: string;
  sessionName: string;
  sessionTitle?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  trainingLocation?: string;
  location?: string;
  sessionType?: string;
  focusArea?: string;
  team?: IParentSessionTeam;
  coach?: IParentSessionCoach;
  coachName?: string;
  child?: IParentSessionChild;
  rsvpStatus: "PENDING" | "CONFIRMED" | "DECLINED" | string;
  rsvp?: IParentSessionRsvp;
  attendanceStatus?: "UNMARKED" | "PRESENT" | "ABSENT" | string;
  actualAttendance?: IParentSessionAttendance;
}

export interface IParentAttendanceStats {
  attendanceRate: number;
  attendanceRateFormatted: string;
  totalSessions: number;
  present: number;
  absent: number;
}

export interface IParentTrainingSessionsData {
  stats: IParentAttendanceStats;
  upcomingSessions: IParentTrainingSessionItem[];
  pastSessions: IParentTrainingSessionItem[];
  total?: number;
  sessions?: IParentTrainingSessionItem[];
}

export interface IParentTrainingSessionsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: IParentTrainingSessionsData;
}

export interface IGetParentTrainingSessionsParams {
  childPlayerId?: string;
  childId?: string;
  page?: number;
  limit?: number;
}

export interface ISubmitSessionRsvpPayload {
  sessionId: string;
  childPlayerId: string;
  rsvpStatus: "CONFIRMED" | "DECLINED";
  notes?: string;
}

export interface ISwitchProfileToChildPayload {
  childUserId: string;
}

export interface ISwitchProfileUserData {
  _id: string;
  email: string;
  name: string;
  role: string;
  status?: string;
  avatar?: string;
  phone?: string;
  accountManagedBy?: string;
  isEmailVerified?: boolean;
  playerId?: string;
  position?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any;
}

export interface ISwitchProfileData {
  user: ISwitchProfileUserData;
  accessToken: string;
  refreshToken?: string;
  switchedFromParentId?: string;
}

export interface ISwitchProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISwitchProfileData;
}





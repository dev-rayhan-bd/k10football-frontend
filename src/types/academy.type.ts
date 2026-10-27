/* eslint-disable @typescript-eslint/no-explicit-any */

export interface IAcademyDashboardSummary {
  totalTeams: number;
  totalCoaches: number;
  totalPlayers: number;
  totalRosterMembers: number;
}

export interface IAcademyTeamCapacity {
  currentPlan: string;
  usedTeams: number;
  maxTeams: number | null;
  isUnlimited: boolean;
  capacityDisplay: string;
  usagePercentage: number;
  isLimitReached: boolean;
  upgradeRequired: boolean;
  message: string;
}

export interface IAcademyPlayerItem {
  _id: string;
  fullName: string;
  position: string;
  age: number;
  dateOfBirth: string;
  overallRating: number;
  cvTier: string;
  profileImage: string;
}

export interface IAcademyTeamItem {
  _id: string;
  academyId: string;
  teamName: string;
  ageGroup: string;
  coachesCount: number;
  playersCount: number;
  totalMembers: number;
  status: "ACTIVE" | "INACTIVE" | string;
  coachIds: any[];
  playerIds: IAcademyPlayerItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IAcademyCoachAndPlayersData {
  summary: IAcademyDashboardSummary;
  teamCapacity?: IAcademyTeamCapacity;
  teams: IAcademyTeamItem[];
}

export interface IAcademyCoachAndPlayersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyCoachAndPlayersData;
}

export interface ICreateAcademyTeamPayload {
  teamName: string;
  ageGroup: string;
  status: "ACTIVE" | "INACTIVE" | string;
}

export interface IUpdateAcademyTeamPayload {
  teamName?: string;
  ageGroup?: string;
  status?: "ACTIVE" | "INACTIVE" | string;
}

export interface IAssignCoachToTeamPayload {
  coachId: string;
  role: "HEAD COACH" | "ASSISTANT COACH" | string;
}

export interface IAssignPlayerToTeamPayload {
  playerId: string;
}

// Team Roster Details Types
export interface ITeamRosterAcademy {
  _id: string;
  name: string;
  city?: string;
  country?: string;
  logo?: string;
  currentPlan?: string;
}

export interface ITeamRosterTeamInfo {
  _id: string;
  teamName: string;
  ageGroup: string;
  status: "ACTIVE" | "INACTIVE" | string;
  academy?: ITeamRosterAcademy;
}

export interface ITeamRosterSummary {
  coaches: string;
  coachesCount: number;
  maxCoaches: number;
  players: string;
  playersCount: number;
  maxPlayers: number;
  totalTeamRoster: number;
  availableCoachSlots: number;
  availablePlayerSlots: number;
}

export interface ITeamRosterCoachItem {
  _id: string;
  name: string;
  role: string;
  profileImage?: string;
  cvType?: string;
  status?: string;
}

export interface ITeamRosterPlayerItem {
  _id: string;
  name: string;
  position: string;
  profileImage?: string;
  rating?: number;
  matches?: number;
  goals?: number;
  assists?: number;
  cvType?: string;
  status?: string;
}

export interface ITeamRosterData {
  team: ITeamRosterTeamInfo;
  summary: ITeamRosterSummary;
  coaches: ITeamRosterCoachItem[];
  players: ITeamRosterPlayerItem[];
}

export interface ITeamRosterResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITeamRosterData;
}

// Success Story Types
export interface ISuccessStoriesMeta {
  categories: string[];
  positions: string[];
}

export interface ISuccessStoriesMetaResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISuccessStoriesMeta;
}

export interface ISuccessStoryItem {
  _id: string;
  storyTitle: string;
  playerName: string;
  position: string;
  currentAcademy: string;
  date: string;
  formattedDate?: string;
  category: string;
  photo: string;
  storyContent: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  statusBadge?: {
    label: string;
    variant: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ISuccessStoryCounts {
  all: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface ISuccessStoriesPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ISuccessStoriesData {
  counts: ISuccessStoryCounts;
  stories: ISuccessStoryItem[];
  meta: ISuccessStoriesPaginationMeta;
}

export interface ISuccessStoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISuccessStoriesData;
}

export interface IGetSuccessStoriesParams {
  status?: string;
  category?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ICreateSuccessStoryPayload {
  storyTitle: string;
  playerName: string;
  position: string;
  currentAcademy: string;
  date: string;
  category: string;
  storyContent: string;
}

// Academy Parent Types
export interface ILinkedPlayer {
  _id: string;
  id?: string;
  name: string;
  position?: string;
  avatar?: string;
  teamName?: string;
  age?: string;
  ageValue?: number;
  relationshipType?: string;
}

export interface IAcademyParentItem {
  _id: string;
  id?: string;
  userId?: string;
  name?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primaryPhone?: string;
  alternatePhone?: string;
  relationship: string;
  occupation?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  address?: string;
  notes?: string;
  avatar?: string;
  status?: string;
  linkedPlayers: ILinkedPlayer[];
  linkedPlayersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAcademyParentStats {
  totalParents: number;
  totalLinkedPlayers: number;
  parentsWithLinkedPlayers: number;
  parentsWithoutLinkedPlayers: number;
}

export interface IAcademyParentsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    academy?: {
      _id: string;
      name: string;
      logo?: string;
    };
    stats?: IAcademyParentStats;
    meta?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    parents: IAcademyParentItem[];
  };
}

export interface IGetAcademyParentsParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
}

export interface ICreateAcademyParentPayload {
  firstName: string;
  lastName: string;
  relationship: string;
  occupation?: string;
  email: string;
  primaryPhone: string;
  alternatePhone?: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  linkedPlayerIds: string[];
  notes?: string;
}

export interface IUpdateAcademyParentPayload {
  firstName?: string;
  lastName?: string;
  relationship?: string;
  occupation?: string;
  email?: string;
  primaryPhone?: string;
  alternatePhone?: string;
  streetAddress?: string;
  city?: string;
  zipCode?: string;
  linkedPlayerIds?: string[];
  notes?: string;
}

// Transfer Request Types
export interface ITransferRequestAcademy {
  _id: string;
  name: string;
  logo?: string;
  city?: string;
  country?: string;
}

export interface ITransferPlayerSummary {
  _id: string;
  name: string;
  position: string;
  avatar?: string;
  rating?: number;
  age?: number;
}

export interface ITransferRequestItem {
  _id: string;
  id?: string;
  name: string;
  position: string;
  avatar?: string;
  player: ITransferPlayerSummary;
  incoming: string;
  outgoing: string;
  fromAcademy: ITransferRequestAcademy;
  toAcademy: ITransferRequestAcademy;
  requestedBy: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  transferType: "INCOMING" | "OUTGOING" | string;
  reason: string;
  responseNote?: string;
  canApprove?: boolean;
  canReject?: boolean;
  canCancel?: boolean;
}

export interface ITransferRequestsStats {
  incomingCount: number;
  outgoingCount: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export interface ITransferRequestsDashboardData {
  academy?: ITransferRequestAcademy;
  stats: ITransferRequestsStats;
  incoming: ITransferRequestItem[];
  outgoing: ITransferRequestItem[];
}

export interface ITransferRequestsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITransferRequestsDashboardData;
}

export interface ITargetAcademyItem {
  _id: string;
  name: string;
  logo?: string;
  city?: string;
  country?: string;
  teams?: any[];
}

export interface ITargetAcademiesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITargetAcademyItem[];
}

export interface ITransferMyPlayerItem {
  _id: string;
  id?: string;
  name: string;
  position: string;
  avatar?: string;
  rating?: number;
  age?: number;
  currentTeamName?: string;
  teamId?: string;
  fitnessStatus?: string;
}

export interface ITransferMyPlayersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITransferMyPlayerItem[];
}

export interface ICreateTransferRequestPayload {
  playerId: string;
  transferType: "OUTGOING" | "INCOMING" | string;
  targetAcademyId: string;
  reason: string;
}

// Fees & Payments Types
export interface IFeesPaymentsStats {
  totalCollected: number;
  totalCollectedFormatted: string;
  pending: number;
  pendingFormatted: string;
  thisMonth: number;
  thisMonthFormatted: string;
  currency: string;
}

export interface IFeesPaymentPlayer {
  _id: string;
  id?: string;
  name: string;
  position?: string;
  avatar?: string;
  currentClub?: string;
}

export interface IFeesPaymentItem {
  _id: string;
  id?: string;
  playerId?: string;
  player: IFeesPaymentPlayer;
  feeType: string;
  type?: string;
  amount: number;
  amountFormatted: string;
  paymentDate?: string;
  date: string;
  status: "PAID" | "UNPAID" | "PENDING" | string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFeesPaymentsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IFeesPaymentsData {
  stats: IFeesPaymentsStats;
  payments: IFeesPaymentItem[];
  meta?: IFeesPaymentsMeta;
  pagination?: IFeesPaymentsMeta;
}

export interface IFeesPaymentsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IFeesPaymentsData;
}

export interface IGetFeesPaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}

// Finance Committee Types
export interface IFinanceStats {
  gameReportsCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalEarnings: number;
  totalEarningsFormatted: string;
  thisMonth: number;
  thisMonthFormatted: string;
  currency: string;
}

export interface IFinancePlayer {
  _id: string;
  id?: string;
  name: string;
  position?: string;
  avatar?: string;
}

export interface IFinanceTransactionItem {
  _id: string;
  id?: string;
  playerId?: string;
  player: IFinancePlayer;
  transactionType: string;
  type?: string;
  cost: number;
  costFormatted: string;
  commissionAcademy: number;
  commissionAcademyFormatted: string;
  commissionPercentage: string;
  transactionDate?: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "REJECTED" | string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFinanceCommitteeData {
  stats: IFinanceStats;
  transactions: IFinanceTransactionItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IFinanceCommitteeResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IFinanceCommitteeData;
}

export interface IGetFinanceCommitteeParams {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
}

// Scheduled Matches Types
export interface IMatchOurTeam {
  _id: string;
  id?: string;
  name: string;
  ageGroup?: string;
}

export interface IMatchVenue {
  homeOrAway?: string;
  name: string;
  address: string;
}

export interface IMatchCostBreakdown {
  transport?: number;
  transportFormatted?: string;
  groundCost?: number;
  groundCostFormatted?: string;
  mealsCost?: number;
  mealsCostFormatted?: string;
  otherCosts?: number;
  otherCostsFormatted?: string;
  totalCost?: number;
  totalCostFormatted?: string;
}

export interface IAcademyMatchItem {
  _id: string;
  id?: string;
  matchTitle?: string;
  title: string;
  ourTeamId?: string;
  ourTeam?: IMatchOurTeam;
  opponentTeam: string;
  matchType?: string;
  competitionName?: string;
  homeOrAway?: "HOME GROUND" | "AWAY" | string;
  venue?: IMatchVenue;
  venueName?: string;
  venueAddress?: string;
  matchDate?: string;
  date?: string;
  formattedDate?: string;
  kickOffTime?: string;
  time?: string;
  referees?: string;
  travelRequired?: boolean;
  costs?: IMatchCostBreakdown;
  transportCost?: number;
  groundCost?: number;
  mealsCost?: number;
  otherCosts?: number;
  totalCost?: number;
  estimatedTotalCost?: number;
  notes?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAcademyMatchesPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAcademyMatchesData {
  matches: IAcademyMatchItem[];
  meta?: IAcademyMatchesPaginationMeta;
  pagination?: IAcademyMatchesPaginationMeta;
}

export interface IAcademyMatchesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyMatchesData;
}

export interface IGetAcademyMatchesParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  teamId?: string;
  matchType?: string;
}

export interface ICreateAcademyMatchPayload {
  matchTitle: string;
  title?: string;
  ourTeamId: string;
  opponentTeam: string;
  matchType: string;
  competitionName?: string;
  homeOrAway: "HOME GROUND" | "AWAY" | string;
  venueName: string;
  venueAddress: string;
  matchDate: string;
  kickOffTime: string;
  referees?: string;
  travelRequired?: boolean;
  transportCost?: number;
  groundCost?: number;
  mealsCost?: number;
  otherCosts?: number;
  estimatedTotalCost?: number;
  notes?: string;
}

// Extra Events Types
export interface IExtraEventsMetaData {
  eventTypes: string[];
  groups: string[];
  ageGroups: string[];
  targetAttendees: string[];
  statusOptions: string[];
  dateFilters: string[];
  teams: Array<{
    _id: string;
    teamName: string;
    ageGroup: string;
  }>;
}

export interface IExtraEventsMetaResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IExtraEventsMetaData;
}

export interface IExtraEventItem {
  _id: string;
  id?: number | string;
  eventName: string;
  eventType: string;
  group: string;
  ageGroup: string;
  targetAttendees: string;
  status: string;
  statusBadge?: {
    label: string;
    variant: string;
  };
  formattedDate?: string;
  eventDate: string;
  eventEndDate?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  venueName?: string;
  venueAddress?: string;
  registrationFee?: number;
  currency?: string;
  feeFormatted?: string;
  currentAttendees?: number;
  maxCapacity?: number;
  capacityRatio?: string;
  description?: string;
  requirements?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  bannerImage?: string;
  canRegister?: boolean;
  shareUrl?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface IGetExtraEventsParams {
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface IExtraEventsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    events: IExtraEventItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ICreateExtraEventPayload {
  eventName: string;
  eventType: string;
  group: string;
  ageGroup: string;
  targetAttendees: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  venueName: string;
  venueAddress: string;
  registrationFee?: number;
  currency?: string;
  maxCapacity?: number;
  description: string;
  requirements?: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  status?: string;
  bannerImage?: File | null;
}

// Academy Sponsors Types
export interface ISponsorsMetaData {
  sponsorshipTypes: string[];
  sponsorshipStatuses: string[];
  paymentStatuses: string[];
}

export interface ISponsorsMetaResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISponsorsMetaData;
}

export interface ISponsorStats {
  totalContractValue: number;
  totalContractValueFormatted: string;
  activeSponsors: number;
  expiringSoon: number;
  pendingPayments: number;
  pendingPaymentsFormatted: string;
}

export interface ISponsorBadge {
  label: string;
  variant: string;
}

export interface ISponsorItem {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  fullAddress: string;
  sponsorshipType: string;
  sponsorshipTypeBadge?: ISponsorBadge;
  contractValue: number;
  currency: string;
  contractValueFormatted?: string;
  contractPeriod?: string;
  startDate: string;
  endDate: string;
  status: string;
  statusBadge?: ISponsorBadge;
  paymentStatus: string;
  paymentBadge?: ISponsorBadge;
  sponsorshipDescription: string;
  benefitsAndDeliverables?: string;
  logo?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface IGetSponsorsParams {
  searchTerm?: string;
  sponsorshipType?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export interface ISponsorsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    stats: ISponsorStats;
    sponsors: ISponsorItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ICreateSponsorPayload {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  fullAddress: string;
  sponsorshipType: string;
  sponsorshipStatus: string;
  contractValue: number;
  currency: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  sponsorshipDescription: string;
  benefitsAndDeliverables?: string;
}

export interface IUpdateSponsorPayload {
  sponsorId: string;
  data: Partial<ICreateSponsorPayload>;
}

// Academy Training Sessions Types
export interface ITrainingSessionCoachItem {
  _id: string;
  id?: string;
  coachId: string;
  fullName: string;
  title?: string;
  label?: string;
  displayName?: string;
  profileImage?: string;
  email?: string;
  phone?: string;
}

export interface ITrainingSessionCoachesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITrainingSessionCoachItem[];
}

export interface ITrainingSessionTeamItem {
  _id: string;
  id?: string;
  teamId: string;
  teamName: string;
  ageGroup?: string;
  label?: string;
  displayName?: string;
  playersCount?: number;
  coachesCount?: number;
}

export interface ITrainingSessionTeamsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ITrainingSessionTeamItem[];
}

export interface IGetTrainingSessionsParams {
  searchTerm?: string;
  page?: number;
  limit?: number;
  teamId?: string;
  coachId?: string;
  status?: string;
}

export interface ITrainingSessionCardStats {
  present: number;
  late: number;
  absent: number;
  total: number;
}

export interface ITrainingSessionListItem {
  _id: string;
  id?: string | number;
  sessionName?: string;
  title?: string;
  teamBadge?: string;
  teamName?: string;
  team?: string;
  date?: string;
  sessionDate?: string;
  formattedDate?: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  time?: string;
  coachName?: string;
  coach?: string;
  trainingLocation?: string;
  locationVenue?: string;
  sessionType?: string;
  focusArea?: string;
  attendancePercentage?: number;
  attendanceRate?: number;
  attendance?:
    | number
    | {
        percentage: number;
        isCompleted?: boolean;
        statusLabel?: string;
        present?: number;
        late?: number;
        absent?: number;
        unmarked?: number;
        total?: number;
      };
  stats?: ITrainingSessionCardStats;
  overviewChips?: {
    presentCount: number;
    lateCount: number;
    absentCount: number;
    unmarkedCount: number;
    totalPlayers: number;
  };
  color?: string;
  [key: string]: any;
}

export interface IGetTrainingSessionsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data:
    | ITrainingSessionListItem[]
    | {
        sessions: ITrainingSessionListItem[];
        meta?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
}

export interface ICreateTrainingSessionPayload {
  sessionName: string;
  teamId: string;
  coachId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  trainingLocation: string;
  sessionType: string;
  focusArea: string;
  maxParticipants?: number;
  sessionDescription: string;
  requiredEquipment?: string;
  additionalNotes?: string;
}

export interface IUpdateTrainingSessionArgs {
  sessionId: string;
  body: Partial<ICreateTrainingSessionPayload>;
}

// Session Attendance Sheet Types
export interface ISessionAttendanceSession {
  _id: string;
  sessionName: string;
  teamBadge?: string;
  teamName: string;
  date: string;
  startTime?: string;
  endTime?: string;
  timeRange?: string;
  coachName: string;
  locationVenue: string;
}

export interface ISessionAttendanceOverviewChips {
  presentCount: number;
  lateCount: number;
  absentCount: number;
  unmarkedCount: number;
  totalPlayers: number;
  hasUnmarked?: boolean;
  unmarkedAlert?: string;
}

export interface ISessionAttendancePlayer {
  serialNumber: number;
  attendanceId: string;
  playerId: string;
  name: string;
  avatar: string;
  jerseyNumber: string;
  position: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "UNMARKED" | string;
  notes?: string;
}

export interface ISessionAttendanceSheetData {
  session: ISessionAttendanceSession;
  overviewChips: ISessionAttendanceOverviewChips;
  players: ISessionAttendancePlayer[];
}

export interface ISessionAttendanceResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ISessionAttendanceSheetData;
}

export interface IAttendanceItemPayload {
  playerId: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "UNMARKED" | string;
  notes?: string;
}

export interface IUpdateSessionAttendancePayload {
  attendances?: IAttendanceItemPayload[];
  markAll?: "PRESENT" | "ABSENT" | "CLEAR" | string;
}

export interface IUpdateSessionAttendanceArgs {
  sessionId: string;
  body: IUpdateSessionAttendancePayload;
}

// ─── Analytics Report Interfaces ──────────────────────────────────────────
export interface IAnalyticsCardItem {
  raw: number;
  formatted: string;
}

export interface IAnalyticsOverview {
  academyId: string;
  academyName: string;
  reportingPeriod: string;
  cards: {
    totalRevenue: IAnalyticsCardItem;
    totalExpenses: IAnalyticsCardItem;
    activePlayers: IAnalyticsCardItem;
    matchesWon: IAnalyticsCardItem;
  };
}

export interface IRevenueBreakdownItem {
  month: string;
  fees: number;
  events: number;
  store: number;
  total: number;
}

export interface IExpenseCategoryItem {
  key: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface IFinancialAnalytics {
  revenueBreakdown: IRevenueBreakdownItem[];
  expensesDistribution: {
    total: number;
    categories: IExpenseCategoryItem[];
  };
}

export interface IMonthlyReportVolumeItem {
  month: string;
  wins: number;
  draws: number;
  losses: number;
  total: number;
}

export interface IReportsTrendItem {
  month: string;
  reports: number;
}

export interface IGameReportsAnalytics {
  monthlyReportVolume: IMonthlyReportVolumeItem[];
  reportsTrend: IReportsTrendItem[];
}

export interface IEvaluationStatusItem {
  month: string;
  completed: number;
  pending: number;
  expired: number;
  total: number;
}

export interface IAverageSkillScoreItem {
  axis: string;
  value: number;
  fullMark: number;
}

export interface IPlayerEvaluationsAnalytics {
  evaluationStatusByMonth: IEvaluationStatusItem[];
  averageSkillScores: IAverageSkillScoreItem[];
}

export interface ITransferActivityItem {
  month: string;
  incoming: number;
  outgoing: number;
  pending: number;
}

export interface ITransferStatusSlice {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ITransfersAnalytics {
  transferActivityTrend: ITransferActivityItem[];
  transferStatusOverview: {
    total: number;
    slices: ITransferStatusSlice[];
  };
}

export interface ICvValidationMonthItem {
  month: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface ICvTierDistributionSlice {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface IPlayerCvValidationAnalytics {
  validationsByMonthAndTier: ICvValidationMonthItem[];
  cvTierDistribution: {
    total: number;
    slices: ICvTierDistributionSlice[];
  };
  cumulativeCvValidations: ICvValidationMonthItem[];
}

export interface IDetailedReportItem {
  id: string;
  reportType: string;
  title: string;
  subtitle: string;
  period: string;
  downloadPdfUrl: string;
}

export interface IAcademyAnalyticsReportData {
  overview: IAnalyticsOverview;
  financialAnalytics: IFinancialAnalytics;
  gameReportsAnalytics: IGameReportsAnalytics;
  playerEvaluationsAnalytics: IPlayerEvaluationsAnalytics;
  transfersAnalytics: ITransfersAnalytics;
  playerCvValidationAnalytics: IPlayerCvValidationAnalytics;
  detailedReports: IDetailedReportItem[];
  exportReportUrl: string;
}

export interface IAcademyAnalyticsReportResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyAnalyticsReportData;
}

// Academy Management Dashboard Types
export interface IAcademyDashboardAcademy {
  id: string;
  name: string;
  badge: string;
  coverPhoto: string;
  category: string;
  foundedYear: number;
  foundedText: string;
  location: string;
  status: string;
  isActive: boolean;
  contactPhone: string;
  contactEmail: string;
}

export interface IAcademyDashboardMetricCardItem {
  label: string;
  count: number;
}

export interface IAcademyDashboardMetricCards {
  teams: IAcademyDashboardMetricCardItem;
  players: IAcademyDashboardMetricCardItem;
  coaches: IAcademyDashboardMetricCardItem;
  gameReports: IAcademyDashboardMetricCardItem;
  pendingEvaluations: IAcademyDashboardMetricCardItem;
  pendingCvs: IAcademyDashboardMetricCardItem;
}

export interface IAcademyDashboardPeriod {
  period: string;
  count: number;
}

export interface IAcademyDashboardGameReportsEngagement {
  title: string;
  periods: IAcademyDashboardPeriod[];
  total: number;
}

export interface IAcademyDashboardAgeBracket {
  bracket: string;
  count: number;
}

export interface IAcademyDashboardAgeCategory {
  title: string;
  brackets: IAcademyDashboardAgeBracket[];
  totalPlayers: number;
}

export interface IAcademyDashboardEvaluationSlice {
  key: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface IAcademyDashboardPlayerEvaluationStatus {
  title: string;
  total: number;
  slices: IAcademyDashboardEvaluationSlice[];
}

export interface IAcademyDashboardAnalytics {
  title: string;
  subtitle: string;
  fullAnalyticsUrl: string;
  gameReportsEngagement: IAcademyDashboardGameReportsEngagement;
  ageCategory: IAcademyDashboardAgeCategory;
  playerEvaluationStatus: IAcademyDashboardPlayerEvaluationStatus;
}

export interface IAcademyDashboardPendingGameReport {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string | null;
  position: string;
  score: string;
  matchName: string;
  matchDate: string;
}

export interface IAcademyDashboardPendingCvValidation {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string | null;
  coachName: string;
  coachLabel: string;
  badge: string;
  isOverdue: boolean;
}

export interface IAcademyDashboardPlayerEvaluation {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string | null;
  coachName: string;
  coachLabel: string;
  badge: string;
  status: string;
}

export interface IAcademyDashboardClubInterested {
  clubId: string;
  clubName: string;
  clubLogo: string | null;
  action: string;
  country: string;
  league: string;
}

export interface IAcademyDashboardQuickStatItem {
  raw: number;
  formatted: string;
}

export interface IAcademyDashboardQuickStats {
  profileViews: IAcademyDashboardQuickStatItem;
  totalLikes: IAcademyDashboardQuickStatItem;
  reports: IAcademyDashboardQuickStatItem;
}

export interface IAcademyDashboardSidebar {
  pendingGameReports: IAcademyDashboardPendingGameReport[];
  pendingCvValidations: IAcademyDashboardPendingCvValidation[];
  playerEvaluations: IAcademyDashboardPlayerEvaluation[];
  clubsInterested: IAcademyDashboardClubInterested[];
  quickStats: IAcademyDashboardQuickStats;
}

export interface IAcademyDashboardData {
  academy: IAcademyDashboardAcademy;
  metricCards: IAcademyDashboardMetricCards;
  analytics: IAcademyDashboardAnalytics;
  sidebar: IAcademyDashboardSidebar;
}

export interface IAcademyDashboardResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyDashboardData;
}

// ---------------- ACADEMY NEWS ---------------- //

export interface IAcademyNewsMeta {
  categories: string[];
  priorities: string[];
  visibilities: string[];
  statuses: string[];
}

export interface IAcademyNewsMetaResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyNewsMeta;
}

export interface IAcademyNewsBadge {
  label: string;
  variant: string;
}

export interface IAcademyNewsItem {
  _id: string;
  articleTitle: string;
  category: string;
  author: string;
  publishedBy?: string;
  publishDate: string;
  formattedPublishDate?: string;
  fullArticle?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;
  visibility: "PUBLIC" | "PRIVATE" | string;
  visibilityBadge?: IAcademyNewsBadge;
  status: "PUBLISHED" | "DRAFT" | "BIN" | string;
  statusBadge?: IAcademyNewsBadge;
  views?: number;
  sendPushNotification?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAcademyNewsTabCounts {
  all: number;
  published: number;
  private: number;
  draft: number;
  bin: number;
}

export interface IAcademyNewsPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAcademyNewsData {
  tabCounts: IAcademyNewsTabCounts;
  news: IAcademyNewsItem[];
  meta: IAcademyNewsPaginationMeta;
}

export interface IAcademyNewsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAcademyNewsData;
}

export interface IGetAcademyNewsParams {
  status?: "ALL_NEWS" | "PUBLISHED" | "PRIVATE" | "DRAFT" | "BIN" | string;
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

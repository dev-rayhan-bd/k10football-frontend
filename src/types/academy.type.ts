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

export type PlanCategory = "PLAYER" | "COACH" | "AGENT" | "CLUB" | "ACADEMY" | string;

export interface IMembershipPlan {
  _id: string;
  id?: string;
  planName: string;
  title?: string;
  planCategory: PlanCategory;
  targetRole?: string;
  price: number;
  planPrice?: number;
  currency?: string;
  billingCycle?: "MONTHLY" | "YEARLY" | string;
  billingLabel?: string;
  features: string[];
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status?: "ACTIVE" | "INACTIVE" | string;
  isDefaultPricing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembershipPlansMeta {
  total: number;
  activeCount: number;
  inactiveCount: number;
}

export interface IMembershipPlansResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: IMembershipPlansMeta;
  data: IMembershipPlan[];
}

export interface ISingleMembershipPlanResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IMembershipPlan;
}

export interface ICreateMembershipPlanPayload {
  planName: string;
  planCategory: string;
  features: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  price: number;
  billingCycle?: string;
  isDefaultPricing?: boolean;
}

export interface IUpdateMembershipPlanPayload {
  planName?: string;
  planCategory?: string;
  features?: string[];
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  price?: number;
  billingCycle?: string;
  isDefaultPricing?: boolean;
}

export interface IDropdownUser {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  category: string;
  currentPlan?: string;
  displayLabel?: string;
}

export interface IMembershipGrantUserDetails {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface IMembershipGrant {
  _id: string;
  grantId?: string;
  userId: string;
  userDetails?: IMembershipGrantUserDetails;
  name: string;
  email: string;
  category: string;
  duration?: string;
  durationMonths?: number | null;
  startDate?: string;
  endDate?: string;
  validityPeriod?: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED" | string;
  isAdminGrant?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IMembershipGrantsMeta {
  total: number;
  totalGrants: number;
  page: number;
  limit: number;
  totalPages: number;
  dropdownUsers: IDropdownUser[];
}

export interface IMembershipGrantsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IMembershipGrantsMeta;
  data: IMembershipGrant[];
}

export interface IGrantMembershipPayload {
  category: string;
  userId: string;
  duration: string;
}

export interface IGrantMembershipResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: IMembershipGrant;
}

export interface IApprovalVerificationDoc {
  _id: string;
  documentType?: string;
  fileUrl: string;
  status?: string;
  adminReviewNotes?: string;
  createdAt?: string;
}

export interface IApprovalUserDetails {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  isVerified?: boolean;
  verificationStatus?: string;
  country?: string;
  fifaLicenseNumber?: string;
  agencyName?: string;
  clubName?: string;
  officialWebsite?: string;
  identityDocument?: string;
  licenseCertificateDocument?: string;
  adminReviewNotes?: string;
  verifiedAt?: string;
  createdAt?: string;
}

export interface IApprovalProfileDetails {
  _id: string;
  createdAt?: string;
  licenseId?: string;
  fifaLicenseNumber?: string;
  agencyName?: string;
  country?: string;
  countryOfOperation?: string;
  fullName?: string;
  name?: string;
  officialWebsite?: string;
  clubType?: string;
  league?: string;
  logo?: string;
  authorizedRepresentativeJobTitle?: string;
  identityDocument?: string;
  licenseCertificateDocument?: string;
  associationMembershipDocument?: string;
  verificationStatus?: string;
  adminReviewNotes?: string;
  verifiedAt?: string;
  verificationDocuments?: IApprovalVerificationDoc[];
}

export interface IApprovalApplication {
  _id: string;
  userId: string;
  profileId?: string | null;
  name: string;
  email: string;
  avatar?: string;
  role: "AGENT" | "CLUB" | "ACADEMY" | string;
  roleLabel?: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  verificationStatus?: string;
  reviewNotes?: string;
  user?: IApprovalUserDetails;
  profile?: IApprovalProfileDetails | null;
}

export interface IApprovalsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface IApprovalsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IApprovalsMeta;
  data: IApprovalApplication[];
}

export interface IApprovalDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IApprovalApplication;
}

export interface IUpdateApprovalStatusPayload {
  status: "APPROVED" | "REJECTED";
  reviewNotes: string;
}

export interface IGetApprovalsParams {
  role?: "ALL" | "ACADEMIES" | "AGENTS" | "CLUBS" | string;
  status?: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ISuccessStoryAuthor {
  _id: string;
  userId?: string;
  city?: string;
  country?: string;
  logo?: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface IAdminSuccessStory {
  _id: string;
  storyId?: string;
  storyTitle: string;
  image?: string;
  photo?: string;
  coverImage?: string;
  role: "ACADEMY" | "AGENT" | "CLUB" | string;
  roleLabel?: string;
  authorName?: string;
  authorId?: string;
  author?: ISuccessStoryAuthor;
  category?: string;
  playerName?: string;
  position?: string;
  signedClub?: string;
  previousAcademy?: string;
  currentAcademy?: string;
  storyContent?: string;
  date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  reviewNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISuccessStoriesMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface ISuccessStoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: ISuccessStoriesMeta;
  data: IAdminSuccessStory[];
}

export interface ISuccessStoryDetailsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAdminSuccessStory;
}

export interface IUpdateSuccessStoryStatusPayload {
  status: "APPROVED" | "REJECTED";
  reviewNotes: string;
}

export interface IGetSuccessStoriesParams {
  role?: "ALL" | "ACADEMIES" | "AGENTS" | "CLUBS" | string;
  status?: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | string;
  search?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN PLATFORM ANALYTICS
// ===================

export interface IAdminAnalyticsSummary {
  totalUsers: number;
  allTimeTotalUsers?: number;
  revenue: number;
  subscriptionRevenue?: number;
  gameReportRevenue?: number;
  gameReports: number;
  currency?: string;
}

export interface IUserGrowthByRoleItem {
  period: string;
  label?: string;
  bucketIndex?: number;
  total: number;
  cumulativeTotal?: number;
  Player?: number;
  Coach?: number;
  Academy?: number;
  Agent?: number;
  Clubs?: number;
  Club?: number;
  player?: number;
  coach?: number;
  academy?: number;
  agent?: number;
  clubs?: number;
}

export interface IUserRoleDistributionItem {
  role: "PLAYER" | "COACH" | "ACADEMY" | "AGENT" | "CLUB" | string;
  label: string;
  name: string;
  count: number;
  value: number;
  percentage: number;
  roundedPercentage?: number;
}

export interface IRevenueBreakdownItem {
  period: string;
  label?: string;
  bucketIndex?: number;
  subscriptions: number;
  reports: number;
  subscriptionRevenue: number;
  reportRevenue: number;
  otherRevenue?: number;
  totalRevenue: number;
}

export interface IAdminPlatformAnalytics {
  summary: IAdminAnalyticsSummary;
  userGrowthByRole: IUserGrowthByRoleItem[];
  userRoleDistribution: IUserRoleDistributionItem[];
  revenueBreakdown: IRevenueBreakdownItem[];
}

export interface IAdminAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAdminPlatformAnalytics;
}

// ===================
// ADMIN PLAYERS LIST
// ===================

export interface IAdminPlayerItem {
  _id: string;
  userId?: string;
  playerId?: string;
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  profileImage?: string;
  position?: string;
  secondaryPositions?: string[];
  age?: number | null;
  country?: string;
  gender?: string;
  academy?: string;
  academyId?: string | null;
  cvType?: string;
  cvTier?: string;
  reports?: number;
  status?: string;
  displayStatus?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface IAdminPlayersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAdminPlayersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminPlayersMeta;
  data: IAdminPlayerItem[];
}

export interface IGetAdminPlayersParams {
  search?: string;
  position?: string;
  country?: string;
  ageRange?: string;
  status?: string;
  cvTier?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN COACHES LIST
// ===================

export interface IAdminCoachItem {
  _id: string;
  userId?: string;
  coachId?: string | null;
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  profileImage?: string;
  roleTitle?: string;
  title?: string;
  license?: string;
  licenseStatus?: string;
  academy?: string;
  academyId?: string | null;
  player?: number;
  playersCount?: number;
  cvType?: string;
  cvTier?: string;
  status?: string;
  displayStatus?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface IAdminCoachesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminPlayersMeta;
  data: IAdminCoachItem[];
}

export interface IGetAdminCoachesParams {
  search?: string;
  status?: string;
  academy?: string;
  cvTier?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN ACADEMIES LIST
// ===================

export interface IAdminAcademyItem {
  _id: string;
  userId?: string;
  academyId?: string;
  name?: string;
  academyName?: string;
  subtitle?: string;
  category?: string;
  league?: string;
  email?: string;
  logo?: string;
  avatar?: string;
  country?: string;
  city?: string;
  location?: string;
  teams?: number;
  teamsCount?: number;
  coaches?: number;
  coachesCount?: number;
  player?: number;
  playersCount?: number;
  status?: string;
  displayStatus?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface IAdminAcademiesSummary {
  academies?: number;
  totalAcademies?: number;
  totalTeams?: number;
  totalCoaches?: number;
  totalPlayers?: number;
}

export interface IAdminAcademiesMeta extends IAdminPlayersMeta {
  summary?: IAdminAcademiesSummary;
}

export interface IAdminAcademiesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminAcademiesMeta;
  data: IAdminAcademyItem[];
}

export interface IGetAdminAcademiesParams {
  search?: string;
  status?: string;
  country?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN AGENTS LIST
// ===================

export interface IAdminAgentItem {
  _id: string;
  userId?: string;
  agentId?: string | null;
  name?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  agencyName?: string;
  fifaLicenseNumber?: string;
  country?: string;
  verification?: string;
  verificationStatus?: string;
  cvsShared?: number;
  cvsSharedCount?: number;
  status?: string;
  displayStatus?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface IAdminAgentsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminPlayersMeta;
  data: IAdminAgentItem[];
}

export interface IGetAdminAgentsParams {
  search?: string;
  status?: string;
  verificationStatus?: string;
  country?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN CLUBS LIST
// ===================

export interface IAdminClubItem {
  _id: string;
  userId?: string;
  clubId?: string | null;
  name?: string;
  clubName?: string;
  subtitle?: string;
  clubType?: string;
  email?: string;
  logo?: string;
  avatar?: string;
  country?: string;
  league?: string;
  verificationStatus?: string;
  likedPlayers?: number;
  likedPlayersCount?: number;
  status?: string;
  displayStatus?: string;
  isBlocked?: boolean;
  createdAt?: string;
}

export interface IAdminClubsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminPlayersMeta;
  data: IAdminClubItem[];
}

export interface IGetAdminClubsParams {
  search?: string;
  status?: string;
  country?: string;
  league?: string;
  page?: number;
  limit?: number;
}

// ===================
// ADMIN PAYMENTS & REVENUE
// ===================

export interface IAdminPaymentEntity {
  _id?: string;
  userId?: string | null;
  profileId?: string | null;
  name?: string;
  email?: string;
  role?: string;
  avatar?: string;
}

export interface IAdminPaymentItem {
  _id: string;
  paymentId: string;
  sourceId?: string;
  sourceModel?: string;
  type: string;
  category?: string;
  subType?: string;
  userOrEntity: string;
  entity?: IAdminPaymentEntity;
  amount: number;
  spend: number;
  commissionPaid?: number;
  commissionRate?: string;
  commissionRecipient?: string;
  adminEarnings?: number;
  currency?: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED" | "CANCELLED" | string;
  rawStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
}

export interface IAdminPaymentsSummaryBreakdownItem {
  count: number;
  revenue?: number;
  spend?: number;
  netAdminEarnings?: number;
  amount?: number;
}

export interface IAdminPaymentsSummary {
  totalRevenue: number;
  subscription: number;
  gameReports: number;
  totalSpend: number;
  otherRevenue?: number;
  totalCommissionPaid?: number;
  netAdminEarnings?: number;
  pendingAmount?: number;
  failedOrRefundedAmount?: number;
  thisMonth?: {
    revenue: number;
    spend: number;
    netAdminEarnings: number;
    transactionsCount: number;
  };
  breakdownByType?: Record<string, IAdminPaymentsSummaryBreakdownItem>;
  breakdownByStatus?: Record<string, IAdminPaymentsSummaryBreakdownItem>;
}

export interface IAdminPaymentsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: IAdminPaymentsSummary;
}

export interface IAdminPaymentsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  meta: IAdminPaymentsMeta;
  data: IAdminPaymentItem[];
}

export interface IGetAdminPaymentsParams {
  search?: string;
  type?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface IToggleUserStatusResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}









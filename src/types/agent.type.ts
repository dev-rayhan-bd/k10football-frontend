export interface IAgentSuccessStoryItem {
  _id: string;
  storyTitle: string;
  category: string;
  playerName: string;
  position: string;
  previousAcademy: string;
  signedClub: string;
  date: string;
  formattedDate?: string;
  image: string;
  storyContent: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  statusLabel?: string;
  adminReviewNotes?: string;
  creatorId?: {
    _id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface IAgentSuccessStoriesMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAgentSuccessStoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    meta: IAgentSuccessStoriesMeta;
    data: IAgentSuccessStoryItem[];
  };
}

export interface IGetAgentSuccessStoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface ICreateAgentSuccessStoryData {
  storyTitle: string;
  playerName: string;
  position: string;
  previousAcademy: string;
  date: string;
  signedClub: string;
  category: string;
  storyContent: string;
}

export interface IUpdateAgentSuccessStoryData {
  storyTitle?: string;
  playerName?: string;
  position?: string;
  previousAcademy?: string;
  date?: string;
  signedClub?: string;
  category?: string;
  storyContent?: string;
}

export interface IAgentAnalyticsOverviewItem {
  label: string;
  count: number;
}

export interface IAgentAnalyticsOverview {
  playersProfileViewed?: IAgentAnalyticsOverviewItem;
  likedCvs?: IAgentAnalyticsOverviewItem;
  sharedProfiles?: IAgentAnalyticsOverviewItem;
  profileViews?: IAgentAnalyticsOverviewItem;
}

export interface IAgentCvsViewsOverTimeItem {
  week: string;
  views: number;
}

export interface IAgentLikesAndSharesActivityItem {
  week: string;
  likes: number;
  shares: number;
}

export interface IAgentAnalyticsData {
  selectedYear: number;
  title: string;
  subtitle: string;
  overview: IAgentAnalyticsOverview;
  cvsViewsOverTime: IAgentCvsViewsOverTimeItem[];
  likesAndSharesActivity: IAgentLikesAndSharesActivityItem[];
}

export interface IAgentAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAgentAnalyticsData;
}

export interface IGetAgentAnalyticsParams {
  year?: number | string;
}

export interface IAgentCvsLibraryPlayer {
  id: string;
  playerId: string;
  name: string;
  position: string;
  avatar?: string;
  rating: string | number;
  rawRating?: number;
  club: string;
  country: string;
  age: number;
  status: "GOLD" | "SILVER" | "BRONZE" | string;
  isLiked?: boolean;
  isShared?: boolean;
  shareCount?: number;
  sharedWith?: string;
  sharedStatus?: "Viewed" | "Not Viewed" | string;
  shareableUrl?: string;
}

export interface IAgentCvsLibraryMetricsItem {
  label: string;
  count: number;
}

export interface IAgentCvsLibraryMetrics {
  allCvs?: IAgentCvsLibraryMetricsItem;
  likedCvs?: IAgentCvsLibraryMetricsItem;
  profilesShared?: IAgentCvsLibraryMetricsItem;
}

export interface IAgentCvsLibraryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAgentCvsLibraryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    metrics?: IAgentCvsLibraryMetrics;
    currentTab?: string;
    meta: IAgentCvsLibraryMeta;
    data: IAgentCvsLibraryPlayer[];
  };
}

export interface IGetAgentCvsLibraryParams {
  liked?: boolean | string;
  shared?: boolean | string;
  page?: number;
  limit?: number;
  position?: string;
  country?: string;
  status?: string;
}

export interface IAgentDiscoverPlayer {
  id: string;
  playerId: string;
  name: string;
  position: string;
  avatar?: string | null;
  rating: string | number;
  rawRating?: number;
  club: string;
  country: string;
  age?: number | null;
  matches?: number;
  goals?: number;
  assists?: number;
  status: "Gold" | "Silver" | "Bronze" | string;
  statusBadge?: string;
  tier?: string;
  cvTier?: string;
  fitnessStatus?: string;
  isFavourite?: boolean;
  isLiked?: boolean;
  shareableUrl?: string;
}

export interface IAgentDiscoverPlayersSummary {
  totalPlayers: number;
  avgRating: number;
  active: number;
  injured: number;
}

export interface IAgentDiscoverPlayersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IAgentDiscoverPlayersData {
  summary?: IAgentDiscoverPlayersSummary;
  players: IAgentDiscoverPlayer[];
  meta: IAgentDiscoverPlayersMeta;
}

export interface IAgentDiscoverPlayersResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAgentDiscoverPlayersData;
}

export interface IGetAgentDiscoverPlayersParams {
  page?: number;
  limit?: number;
  position?: string;
  country?: string;
  status?: string;
  ageRange?: string;
}

export interface IAgentProfileUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  country?: string;
}

export interface IAgentPersonalInformation {
  fullName?: string;
  nationality?: string;
  licenseId?: string;
  dateOfBirth?: string | null;
  contact?: string;
  email?: string;
  coverPhoto?: string;
  avatar?: string;
}

export interface IAgentProfessionalDetails {
  yearsOfExperience?: number | string | null;
  certifications?: string;
  achievements?: string;
  agencyName?: string;
  officialWebsite?: string;
  countryOfOperation?: string;
}

export interface IAgentBiography {
  bio?: string;
  professionalBio?: string;
}

export interface IAgentHeaderCard {
  fullName?: string;
  tagline?: string;
  licenseId?: string;
  certifications?: string;
  contact?: string;
  email?: string;
  coverPhoto?: string;
  avatar?: string;
  profileCompletion?: number;
  tier?: string;
}

export interface IAgentVerificationDocument {
  documentType: string;
  title: string;
  status: string;
  statusLabel?: string;
  fileUrl?: string;
  isUploaded?: boolean;
}

export interface IAgentLicensedVerification {
  status: string;
  statusLabel?: string;
  isVerified?: boolean;
  message?: string;
  documents?: IAgentVerificationDocument[];
}

export interface IAgentProfileData {
  _id: string;
  userId?: IAgentProfileUser;
  fullName?: string;
  name?: string;
  nationality?: string;
  country?: string;
  dateOfBirth?: string | null;
  contact?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  coverPhoto?: string;
  licenseId?: string;
  fifaLicenseNumber?: string;
  certifications?: string;
  yearsOfExperience?: number | string | null;
  achievements?: string;
  agencyName?: string;
  officialWebsite?: string;
  countryOfOperation?: string;
  bio?: string;
  professionalBio?: string;
  profileCompletion?: number;
  verificationStatus?: "APPROVED" | "PENDING" | "REJECTED" | string;
  isVerified?: boolean;
  tier?: string;
  currentTier?: string;
  personalInformation?: IAgentPersonalInformation;
  professionalDetails?: IAgentProfessionalDetails;
  biography?: IAgentBiography;
  headerCard?: IAgentHeaderCard;
  licensedVerification?: IAgentLicensedVerification;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAgentProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAgentProfileData;
}

export interface IAgentLicenseVerificationDocument {
  _id?: string | null;
  documentType: string;
  title: string;
  description?: string;
  fileKey: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  statusLabel?: string;
  isUploaded?: boolean;
  fileUrl?: string | null;
  uploadedAt?: string | null;
  adminReviewNotes?: string;
}

export interface IAgentLicenseVerificationUploadEndpoint {
  method: string;
  url: string;
  supportedFileKeys: string[];
}

export interface IAgentLicenseVerificationData {
  verificationStatus: "APPROVED" | "PENDING" | "REJECTED" | string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  statusLabel?: string;
  isVerified: boolean;
  message?: string;
  adminReviewNotes?: string;
  documents: IAgentLicenseVerificationDocument[];
  uploadEndpoint?: IAgentLicenseVerificationUploadEndpoint;
  rawDocuments?: any[];
}

export interface IAgentLicenseVerificationResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IAgentLicenseVerificationData;
}






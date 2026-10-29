export interface IScoutingBoardPlayer {
  id: string;
  playerId: string;
  name: string;
  position: string;
  avatar: string | null;
  rating: string;
  rawRating: number;
  club: string;
  country: string;
  age: number | null;
  status: "GOLD" | "SILVER" | "BRONZE" | string;
  isFavourite: boolean;
}

export interface IScoutingBoardCoach {
  id: string;
  coachId: string;
  name: string;
  role: string;
  speciality: string;
  club: string;
  country: string;
  experience: string;
  yearsExperience: number;
  status: "AVAILABLE" | "CONTRACTED" | string;
  avatar: string | null;
  isFavourite: boolean;
}

export interface IScoutingBoardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IScoutingBoardData {
  players: IScoutingBoardPlayer[];
  coaches: IScoutingBoardCoach[];
  meta: {
    players: IScoutingBoardPagination;
    coaches: IScoutingBoardPagination;
  };
}

export interface IScoutingBoardResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IScoutingBoardData;
}

export interface IGetScoutingBoardParams {
  position?: string;
  country?: string;
  status?: string;
  role?: string;
  speciality?: string;
  coachStatus?: string;
  playerPage?: number;
  playerLimit?: number;
  coachPage?: number;
  coachLimit?: number;
}

export interface IToggleScoutingBoardFavouritePayload {
  targetType: "PLAYER" | "COACH";
  targetId: string;
}

export interface IToggleScoutingBoardFavouriteResponse {
  statusCode: number;
  success: boolean;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export interface ICvsLibraryPlayer {
  id: string;
  playerId: string;
  name: string;
  position: string;
  avatar: string | null;
  rating: string;
  rawRating: number;
  club: string;
  country: string;
  age: number | null;
  status: "GOLD" | "SILVER" | "BRONZE" | string;
  isLiked: boolean;
  isShared: boolean;
  shareCount: number;
  sharedWith: string;
  sharedStatus: string;
  shareableUrl: string;
}

export interface ICvsLibraryMetricsItem {
  label: string;
  count: number;
}

export interface ICvsLibraryMetrics {
  allCvs: ICvsLibraryMetricsItem;
  likedCvs: ICvsLibraryMetricsItem;
  profilesShared: ICvsLibraryMetricsItem;
}

export interface ICvsLibraryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ICvsLibraryData {
  metrics: ICvsLibraryMetrics;
  currentTab: "ALL" | "LIKED" | "SHARED" | string;
  meta: ICvsLibraryPagination;
  data: ICvsLibraryPlayer[];
}

export interface ICvsLibraryResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: ICvsLibraryData;
}

export interface IGetCvsLibraryParams {
  tab?: "ALL" | "LIKED" | "SHARED" | string;
  page?: number;
  limit?: number;
  position?: string;
  status?: string;
}

export interface IToggleLikeCvsPlayerResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: {
    isLiked?: boolean;
    totalLiked?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

export interface IShareCvsPlayerData {
  shareableUrl: string;
  shareCount: number;
  totalProfilesShared: number;
  message: string;
}

export interface IShareCvsPlayerResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data?: IShareCvsPlayerData;
}

export interface IClubSuccessStoryItem {
  _id: string;
  storyTitle: string;
  category: string;
  date: string;
  formattedDate?: string;
  coverImage?: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | string;
  statusLabel?: string;
  adminReviewNotes?: string;
  createdAt?: string;
}

export interface IClubSuccessStoriesData {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IClubSuccessStoryItem[];
}

export interface IClubSuccessStoriesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IClubSuccessStoriesData;
}

export interface IGetClubSuccessStoriesParams {
  page?: number;
  limit?: number;
}

export interface IClubAnalyticsMetricsItem {
  label: string;
  count: number;
}

export interface IClubAnalyticsMetrics {
  playersProfileViewed: IClubAnalyticsMetricsItem;
  likedCvs: IClubAnalyticsMetricsItem;
  sharedProfiles: IClubAnalyticsMetricsItem;
  profileViews: IClubAnalyticsMetricsItem;
}

export interface IMonitoredPeriod {
  period: string;
  players: number;
  coaches: number;
}

export interface IPositionInterestItem {
  position: string;
  value: number;
  percentage: number;
}

export interface ITopPlayerEngagedItem {
  id: string;
  playerId: string;
  name: string;
  position: string;
  avatar: string | null;
  rating: string;
  rawRating: number;
  age: number | null;
  country: string;
  club: string;
  status: "GOLD" | "SILVER" | "BRONZE" | string;
  views: number;
  likes: number;
  shares: number;
}

export interface IClubAnalyticsData {
  selectedYear: number;
  metrics: IClubAnalyticsMetrics;
  playersAndCoachesMonitored: IMonitoredPeriod[];
  positionInterestDistribution: IPositionInterestItem[];
  topPlayersEngaged: {
    data: ITopPlayerEngagedItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface IClubAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IClubAnalyticsData;
}

export interface IGetClubAnalyticsParams {
  year?: number | string;
  page?: number;
  limit?: number;
  position?: string;
  status?: string;
}

export interface IClubProfileBannerInfo {
  name?: string;
  clubName?: string;
  logo?: string | null;
  coverPhoto?: string | null;
  category?: string;
  status?: string;
  tier?: string;
  subInfo?: string;
  country?: string;
  foundedYear?: number;
  contact?: string;
  email?: string;
}

export interface IClubProfileAboutClub {
  description?: string;
  visionAndMission?: string;
}

export interface IClubProfileVerification {
  status?: string;
  officialWebsite?: string;
  footballAssociation?: string;
  authorizedRepresentativeName?: string;
  authorizedRepresentativeJobTitle?: string;
  authorizationDocument?: string;
  clubRegistrationDocument?: string;
  adminReviewNotes?: string;
  verifiedAt?: string;
}

export interface IClubAchievementItem {
  year?: string | number;
  championship?: string;
  venue?: string;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface IClubProfileData {
  _id: string;
  id?: string;
  userId?: {
    _id: string;
    email: string;
    name: string;
    avatar?: string | null;
    phone?: string;
  };
  name?: string;
  clubName?: string;
  clubType?: string;
  country?: string;
  clubCountry?: string;
  league?: string;
  clubLeague?: string;
  establishedYear?: number;
  dateOfEstablishment?: string | number;
  contact?: string;
  contactPhone?: string;
  email?: string;
  contactEmail?: string;
  logo?: string | null;
  tier?: string;
  activeStatus?: string;
  bannerInfo?: IClubProfileBannerInfo;
  aboutClub?: IClubProfileAboutClub;
  description?: string;
  visionAndMission?: string;
  officialWebsite?: string;
  footballAssociation?: string;
  authorizedRepresentativeName?: string;
  authorizedRepresentativeJobTitle?: string;
  achievements?: IClubAchievementItem[];
  verification?: IClubProfileVerification;
  verificationStatus?: string;
  verifiedAt?: string;
  profileViews?: number;
  likedPlayerIds?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedPlayerProfiles?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewedPlayerProfiles?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IClubProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IClubProfileData;
}

export interface IClubDashboardClub {
  id: string;
  name: string;
  tier: string;
  clubType: string;
  category: string;
  establishedYear: number;
  country: string;
  league: string;
  contactPhone: string;
  contactEmail: string;
  logo: string | null;
  coverPhoto: string | null;
  description: string;
}

export interface IClubDashboardMetricsItem {
  label: string;
  count: number;
}

export interface IClubDashboardMetrics {
  players: IClubDashboardMetricsItem;
  coaches: IClubDashboardMetricsItem;
  likedCvs: IClubDashboardMetricsItem;
  profileShare: IClubDashboardMetricsItem;
}

export interface IClubDashboardPlayerItem {
  id: string;
  playerId: string;
  name: string;
  avatar: string | null;
  position: string;
  rating: string;
  rawRating: number;
  club: string;
  country: string;
  age: number | null;
  matches?: number;
  goals?: number;
  assists?: number;
  status?: string;
  fitnessStatus?: string;
  shareableUrl?: string;
}

export interface IClubDashboardCoachItem {
  id: string;
  coachId: string;
  name: string;
  avatar: string | null;
  role: string;
  speciality: string;
  team: string;
  club: string;
  country: string;
  experience: string;
  yearsExperience?: number;
  status: string;
  shareableUrl?: string;
}

export interface IClubDashboardRecentActivityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  timeAgo: string;
  createdAt: string;
}

export interface IClubDashboardAnalyticsData {
  club: IClubDashboardClub;
  metrics: IClubDashboardMetrics;
  analytics: {
    selectedYear: number;
    playersAndCoachesMonitored: Array<{
      period: string;
      players: number;
      coaches: number;
    }>;
    positionInterestDistribution: Array<{
      position: string;
      value: number;
      percentage: number;
    }>;
  };
  coachesAndPlayers: {
    players: IClubDashboardPlayerItem[];
    coaches: IClubDashboardCoachItem[];
  };
  favourites: {
    players: IClubDashboardPlayerItem[];
    coaches: IClubDashboardCoachItem[];
  };
  media: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    images: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    videos: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    all: any[];
    totalImages: number;
    totalVideos: number;
  };
  recentActivity: IClubDashboardRecentActivityItem[];
}

export interface IClubDashboardAnalyticsResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IClubDashboardAnalyticsData;
}



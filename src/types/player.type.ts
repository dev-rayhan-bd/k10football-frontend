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
}

export interface IPlayerProfileResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: IPlayerProfileData;
}

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

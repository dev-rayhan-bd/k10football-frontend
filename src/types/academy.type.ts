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





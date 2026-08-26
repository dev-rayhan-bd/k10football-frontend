import { MatchStats } from "@/lib/constants/reports";

export type ReportStats = {
  shotsOnGoal: number;
  goalScored: number;
  assists: number;
  passAccurate: number;
  wrongPass: number;
  penaltiesTaken: number;
  standTackle: number;
  slidingTackle: number;
  interception: number;
  savesAccurate: number;
  freeKick: number;
  cornerKick: number;
  goalUnsave: number;
  penaltiesSaves: number;
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
};

export type RadarStat = {
  label: string;
  value: number;
};

export type Marker = {
  x: number;
  y: number;
};

export type PitchMarker = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Player = {
  id?: string | number;
  fullName?: string;
  age?: string | number;
  position?: string;
  validationStatus?: string;
  playerImage?: string | { src?: string };
  dob?: string;
  seasonStats?: {
    matches?: number;
  };
};

export type ReportView = MatchStats & {
  id?: string | number;
  playerId?: string | number;
  playerName?: string;
  playerPosition?: string;
  scoutName?: string;
  team1?: string;
  team2?: string;
  date?: string;
  rating?: number;
  goals?: number;
  assists?: number;
  passes?: number;
  passAccuracy?: number;
  score?: string;
  stadium?: string;
  weather?: string;
  temperature?: string | number;
  gameType?: string;
  weight?: string;
  timePlayedMinutes?: number | string;
  height?: string;
  foot?: string;
  characteristics?: string[];
  goalMarkers?: Marker[];
  pitchMarkers?: PitchMarker[];
  tag?: string;
  tier?: string;
  dateFormatted?: string;
};

export type SummaryCardProps = {
  label: string;
  value: string | number;
  icon: any;
  bgColor: string;
  textColor: string;
};

export type GameReportCardProps = {
  tag: string;
  playerName: string;
  date: string;
  coach: string;
  rating: number;
  goals: number;
  assists: number;
  passes: number;
  pos: string;
  tier: string;
  team1: string;
  team2: string;
  onClick: () => void;
};

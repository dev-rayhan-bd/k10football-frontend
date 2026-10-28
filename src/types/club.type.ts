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

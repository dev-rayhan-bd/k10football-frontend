/* eslint-disable @typescript-eslint/no-explicit-any */
import flagFr from "@/assets/cvs/id/flag-fr.png";
import flagIt from "@/assets/cvs/id/flag-itally.png";
import flagImage from "@/assets/cvs/id/flag.png";
import futsalMap from "@/assets/cvs/id/Futsal Pitch.jpg";
// import leftLeg from "@/assets/cvs/id/left-leg-image.png";
import leftLeg from "@/assets/cvs/id/left_foot.png";
import playerImage from "@/assets/cvs/id/player-image.png";
import positionMap from "@/assets/cvs/id/position-map.png";
// import right from "@/assets/cvs/id/right-legt-image.png";
import right from "@/assets/cvs/id/right_foot.png";
import trofeeIcon from "@/assets/cvs/id/trofeeIcon.png";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calculateWeightedRating } from "@/lib/utils/rating";
import { formatDate } from "@/lib/utils";
import { IPlayerDocument } from "@/types/player.type";

export interface Club {
  id: string;
  _id?: string;
  name: string;
  from: string;
  to: string;
  logo: string;
  color: string;
  shortName: string;
  category?: string;
  isCurrent?: boolean;
}

export interface PlayerData {
  fullName: string;
  dob: string;
  age: string;
  birthCountry: string;
  birthCountryFlag: any;
  dualNationality: string;
  dualNationalityFlag: any;
  email: string;
  phone: string;
  location: string;
  website: string;
  height: string;
  weight: string;
  leftLegUsage: number;
  rightLegUsage: number;
  leftLegImage: any;
  rightLegImage: any;
  languages: { name: string; level: string; color: string }[];
  rating: number;
  playerImage: any;
  profileImage?: string;
  cardImage?: string;
  cardPhoto?: string;
  coverImage?: string;
  strengths: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    heading?: number;
  };
  performanceMetrics: {
    passAccuracy: number;
    shootAccuracy: number;
    dribbleSuccess: number;
    tackleSuccess: number;
  };
  marketValue: string;
  marketTrend: string;
  transferStatus: string;
  contractUntil: string;
  agent: string;
  agency: string;
  mainFlag: any;
  position: string;
  jerseyNumber: number;
  selectedStyleIds: string[];
  careerHighlights: {
    year: string;
    title: string;
    club: string;
    icon: any;
  }[];
  seasonStats: {
    matches: number;
    goals: number;
    assists: number;
    avgRating: number;
  };
  clubs: Club[];
  skillsCategories: SkillCategory[];
  futsalMap?: any;
  positionMap?: any;
  positionMarkers: Marker[];
  futsalMarkers: Marker[];
  coachName?: string;
  academyName?: string;
  coachLicenseNumber?: string;
  clubManaged?: string;
  evaluation?: any;
  evaluationDate?: string;
  currentClub?: string;
  certificates?: IPlayerDocument[];
  documents?: IPlayerDocument[];
  isVerifiedByCoach?: boolean;
  validationStatus?: "pending" | "verified" | "expired" | "not_needed";
}

export interface Marker {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  name?: string;
}

export interface Skill {
  key?: string;
  name: string;
  value: number;
}

export interface SkillCategory {
  category: string;
  categoryKey?: string;
  color: string;
  skills: Skill[];
  borderColor: string;
}

const basePlayerData: PlayerData = {
  fullName: "Marcus Silva",
  dob: "15/03/1996",
  age: "24",
  birthCountry: "France",
  birthCountryFlag: flagFr,
  dualNationality: "Italy",
  dualNationalityFlag: flagIt,
  email: "marcus.silva@email.com",
  phone: "+351 912 345 678",
  location: "France",
  website: "www.k10football.com",
  height: "1.82",
  weight: "76",
  leftLegUsage: 31,
  rightLegUsage: 87,
  leftLegImage: leftLeg,
  rightLegImage: right,
  languages: [
    { name: "Portuguese", level: "Native", color: "text-primary" },
    { name: "English", level: "Fluent", color: "text-yellow" },
    { name: "Spanish", level: "Intermediate", color: "text-orange" },
  ],
  rating: 94,
  jerseyNumber: 10,
  playerImage: playerImage,
  profileImage: "",
  cardImage: "",
  cardPhoto: "",
  strengths: {
    pace: 82,
    shooting: 84,
    passing: 89,
    dribbling: 85,
    defending: 78,
    physical: 70,
    heading: 85,
  },
  performanceMetrics: {
    passAccuracy: 92,
    shootAccuracy: 78,
    dribbleSuccess: 85,
    tackleSuccess: 72,
  },
  marketValue: "45M",
  marketTrend: "5 Mln last season",
  transferStatus: "Active",
  contractUntil: "June, 2026",
  agent: "John Morrison",
  agency: "Elite Sports Mgmt",
  currentClub: "Manchester City",
  mainFlag: flagImage,
  position: "Defensive Midfielder",
  selectedStyleIds: ["technical", "finesse-shot", "incisive-pass"],
  careerHighlights: [
    {
      year: "2019",
      title: "BRAZILIAN CHAMPIONSHIP",
      club: "FLAMENGO",
      icon: trofeeIcon,
    },
    {
      year: "2010",
      title: "CAMPEONATA - PAULISTA",
      club: "CORINTHIANS",
      icon: trofeeIcon,
    },
    {
      year: "2015",
      title: "BRAZILIAN CHAMPIONSHIP",
      club: "FLAMENGO FC",
      icon: trofeeIcon,
    },
    {
      year: "2014",
      title: "PAULISTA CUP",
      club: "SAO PAULO FC",
      icon: trofeeIcon,
    },
    {
      year: "2017/2020",
      title: "CAMPEONATO CARIOCA",
      club: "VASCO FC",
      icon: trofeeIcon,
    },
  ],
  seasonStats: {
    matches: 28,
    goals: 8,
    assists: 16,
    avgRating: 8.4,
  },
  clubs: [
    {
      id: "1",
      name: "Manchester City",
      from: "2020",
      to: "Present",
      logo: "bg-blue-600",
      color: "border-blue-400",
      shortName: "MC",
    },
    {
      id: "2",
      name: "Liverpool FC",
      from: "2016",
      to: "2020",
      logo: "bg-red-700",
      color: "border-red-500",
      shortName: "LFC",
      category: "U-10 to U-14",
    },
    {
      id: "3",
      name: "Chelsea FC",
      from: "2020",
      to: "Present",
      logo: "bg-blue-700",
      color: "border-blue-500",
      shortName: "CFC",
    },
  ],
  skillsCategories: [
    {
      category: "Technical",
      color: "#0077FF",
      borderColor: "border-l-blue-500",
      skills: [
        { name: "Ball Control", value: 90 },
        { name: "Dribbling", value: 85 },
        { name: "Short Passing", value: 92 },
        { name: "Long Passing", value: 88 },
        { name: "Crossing", value: 82 },
        { name: "Shooting", value: 78 },
        { name: "Finishing", value: 75 },
        { name: "Long Shots", value: 80 },
      ],
    },
    {
      category: "Tactical",
      color: "#00FF62",
      borderColor: "border-l-green-500",
      skills: [
        { name: "Positioning", value: 88 },
        { name: "Vision", value: 91 },
        { name: "Anticipation", value: 86 },
        { name: "Composition", value: 84 },
        { name: "Teamwork", value: 89 },
        { name: "Work Rate", value: 87 },
        { name: "Decisions", value: 85 },
        { name: "Att. Position", value: 83 },
      ],
    },
    {
      category: "Physical",
      color: "#FF1010",
      borderColor: "border-l-red-500",
      skills: [
        { name: "Acceleration", value: 78 },
        { name: "Sprint Speed", value: 76 },
        { name: "Stamina", value: 85 },
        { name: "Strength", value: 72 },
        { name: "Balance", value: 83 },
        { name: "Agility", value: 81 },
        { name: "Reactions", value: 86 },
        { name: "Jumping", value: 70 },
      ],
    },
    {
      category: "Mental",
      color: "#ffffff",
      borderColor: "border-l-yellow-500",
      skills: [
        { name: "Aggression", value: 65 },
        { name: "Interceptions", value: 74 },
        { name: "Marking", value: 87 },
        { name: "Leadership", value: 79 },
        { name: "Bravery", value: 73 },
        { name: "Determination", value: 88 },
        { name: "Heading", value: 85 },
        { name: "Influence", value: 82 },
      ],
    },
    {
      category: "Attacking",
      color: "#F200FF",
      borderColor: "border-l-purple-500",
      skills: [
        { name: "First Touch", value: 86 },
        { name: "Shot Power", value: 84 },
        { name: "Curve", value: 80 },
        { name: "Free Kick", value: 78 },
        { name: "Penalties", value: 82 },
        { name: "Volleys", value: 75 },
        { name: "Heading Accuracy", value: 83 },
        { name: "Weak Foot", value: 79 },
      ],
    },
    {
      category: "Defending",
      color: "#FF8010",
      borderColor: "border-l-orange-500",
      skills: [
        { name: "Standing Tackle", value: 76 },
        { name: "Sliding Tackle", value: 72 },
        { name: "Interception", value: 85 },
        { name: "Marking", value: 80 },
        { name: "Aerial Duels", value: 78 },
        { name: "Clearance", value: 74 },
        { name: "Pressing", value: 86 },
        { name: "Defensive Awareness", value: 82 },
      ],
    },
  ],
  futsalMap: futsalMap,
  positionMap: positionMap,
  positionMarkers: [{ id: "1", x: 50, y: 50 }],
  futsalMarkers: [{ id: "1", x: 50, y: 50 }],
  coachName: "Pep Guardiola",
  academyName: "Manchester City Academy",
  coachLicenseNumber: "CBF-2026-4587",
  clubManaged: "Manchester City Academy",
  isVerifiedByCoach: false,
  validationStatus: "pending",
};

export interface PlayerStateItem extends PlayerData {
  id: number;
  validationStatus: "pending" | "verified" | "expired" | "not_needed";
  assignedMonthsAgo?: number;
  requestedValidation?: boolean;
  lastValidatedDate?: string;
}

export interface PlayerSliceState {
  players: PlayerStateItem[];
  selectedPlayerId: number;
}

const createMockPlayer = (
  id: number,
  fullName: string,
  position: string,
  birthCountry: string,
  rating: number,
  validationStatus: "pending" | "verified" | "expired" | "not_needed",
  assignedMonthsAgo?: number,
  requestedValidation?: boolean,
  lastValidatedDate?: string,
  coachName?: string,
  academyName?: string,
  jerseyNumber?: number
) => {
  // Clone base categories
  const categories = JSON.parse(JSON.stringify(basePlayerData.skillsCategories));
  // Set all skill values to rating to ensure average is exact
  categories.forEach((cat: any) => {
    cat.skills.forEach((skill: any) => {
      skill.value = rating;
    });
  });

  return {
    ...basePlayerData,
    id,
    fullName,
    position,
    jerseyNumber: jerseyNumber || (id === 1 ? 10 : id === 2 ? 7 : id === 3 ? 4 : id === 4 ? 1 : id === 5 ? 9 : (id * 3) % 97 || 11),
    birthCountry,
    rating,
    validationStatus,
    assignedMonthsAgo,
    requestedValidation,
    lastValidatedDate,
    skillsCategories: categories,
    coachName: coachName || "N/A",
    academyName: academyName || "N/A",
    coachLicenseNumber: "CBF-2026-4587",
    clubManaged: academyName || "Atlético Nacional",
    // Add variations to make stats realistic
    strengths: {
      pace: Math.min(100, rating + 5),
      shooting: Math.max(0, rating - 3),
      passing: rating,
      dribbling: Math.min(100, rating + 2),
      defending: Math.max(0, rating - 5),
      physical: rating,
      heading: rating,
    },
    // Keep player image same as original template
    playerImage: basePlayerData.playerImage,
    cardImage: "",
  };
};

const playersDataList = [
  createMockPlayer(1, "Marcus Silva", "Defensive Midfielder", "France", 88, "verified", 1, false, undefined, "Pep Guardiola", "Manchester City Academy"),
  createMockPlayer(2, "David Chen", "Forward", "China", 74, "pending", 4, false, undefined, "Zheng Zhi", "Guangzhou Youth Academy"),
  createMockPlayer(3, "Alex Jonson", "Defender", "United Kingdom", 52, "pending", 1, true, undefined, "Frank Lampard", "Chelsea Academy"),
  createMockPlayer(4, "James Brown", "Goalkeeper", "United States", 68, "expired", 2, false, "2026-01-10", "Greg Vanney", "LA Galaxy Academy"),
  createMockPlayer(5, "Lucas Hernandez", "Forward", "Spain", 84, "verified", 2, false, undefined, "Raul Gonzalez", "Real Madrid Academy"),
  createMockPlayer(6, "Yuki Tanaka", "Midfielder", "Japan", 48, "pending", 5, false, undefined, "N/A", "N/A"),
  createMockPlayer(7, "Gabriel Barbosa", "Forward", "Brazil", 82, "pending", 1, true, undefined, "Filipe Luis", "Flamengo Academy"),
  createMockPlayer(8, "Mateo Kovacic", "Midfielder", "Croatia", 78, "verified", 1, false, undefined, "Zlatko Dalic", "Dinamo Zagreb Academy"),
  createMockPlayer(9, "Kofi Mensah", "Defender", "Ghana", 56, "verified", 2, false, undefined, "N/A", "Right to Dream Academy"),
  createMockPlayer(10, "Liam O'Connor", "Goalkeeper", "Ireland", 71, "pending", 6, false, undefined, "Roy Keane", "Irish Elite Academy"),
  createMockPlayer(11, "Antoine Dupont", "Midfielder", "France", 86, "expired", 2, false, "2026-02-15", "Didier Deschamps", "INF Clairefontaine"),
  createMockPlayer(12, "Santi Cazorla", "Forward", "Spain", 65, "verified", 1, false, undefined, "Unai Emery", "Villarreal Academy"),
  createMockPlayer(13, "Ivan Petrovic", "Defender", "Serbia", 45, "verified", 2, false, undefined, "N/A", "Red Star Belgrade Academy"),
  createMockPlayer(14, "Diego Maradona", "Forward", "Argentina", 92, "verified", 1, false, undefined, "N/A", "Argentinos Juniors Academy"),
  createMockPlayer(15, "John Doe", "Midfielder", "United States", 79, "pending", 1, true, undefined, "Gregg Berhalter", "US Soccer DA"),
];

const initialState: PlayerSliceState = {
  players: playersDataList,
  selectedPlayerId: 1,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setPlayerData: (state, action: PayloadAction<Partial<PlayerData>>) => {
      const activePlayer = state.players.find((p) => p.id === state.selectedPlayerId);
      if (activePlayer) {
        Object.assign(activePlayer, action.payload);

        // Sync heading if present in payload
        if (action.payload.strengths?.heading !== undefined && activePlayer.skillsCategories) {
          for (const cat of activePlayer.skillsCategories) {
            const headingSkill = cat.skills?.find((s) => s.name.toLowerCase() === "heading");
            if (headingSkill) {
              headingSkill.value = action.payload.strengths.heading;
            }
          }
        } else if (action.payload.skillsCategories && activePlayer.strengths) {
          for (const cat of action.payload.skillsCategories) {
            const headingSkill = cat.skills?.find((s) => s.name.toLowerCase() === "heading");
            if (headingSkill) {
              activePlayer.strengths.heading = headingSkill.value;
            }
          }
        }

        activePlayer.rating = calculateWeightedRating(activePlayer.position, activePlayer.strengths);
      }
    },
    syncFromCvResponse: (state, action: PayloadAction<any>) => {
      const data = action.payload;
      if (!data) return;
      const activePlayer = state.players.find((p) => p.id === state.selectedPlayerId) || state.players[0];
      if (activePlayer) {
        if (data.fullName) activePlayer.fullName = data.fullName;
        if (data.position) activePlayer.position = data.position;
        if (data.dateOfBirth) {
          activePlayer.dob = data.dateOfBirth.includes("T") ? data.dateOfBirth.split("T")[0] : data.dateOfBirth;
        }
        if (data.age !== undefined && data.age !== null) activePlayer.age = String(data.age);
        if (data.country) activePlayer.birthCountry = data.country;
        if (data.dualNationality !== undefined) activePlayer.dualNationality = data.dualNationality;
        if (data.email) activePlayer.email = data.email;
        if (data.phone) activePlayer.phone = data.phone;
        if (data.website !== undefined) activePlayer.website = data.website;
        if (data.height !== undefined && data.height !== null) activePlayer.height = String(data.height);
        if (data.weight !== undefined && data.weight !== null) activePlayer.weight = String(data.weight);
        if (data.rightFootDominance !== undefined) activePlayer.rightLegUsage = data.rightFootDominance;
        if (data.leftFootDominance !== undefined) activePlayer.leftLegUsage = data.leftFootDominance;
        if (data.preferredFoot) (activePlayer as any).preferredFoot = data.preferredFoot;
        if (data.overallRating !== undefined) activePlayer.rating = data.overallRating;
        if (data.profileImage !== undefined) {
          activePlayer.playerImage = data.profileImage;
          (activePlayer as any).profileImage = data.profileImage;
        }
        if (data.coverImage) activePlayer.coverImage = data.coverImage;
        const apiCardImg =
          data.cardImage ||
          data.cardPhoto ||
          data.fifaCardStats?.cardImage ||
          data.fifaCardStats?.cardPhoto ||
          "";
        if (
          data.cardImage !== undefined ||
          data.cardPhoto !== undefined ||
          data.fifaCardStats?.cardImage !== undefined ||
          data.fifaCardStats?.cardPhoto !== undefined
        ) {
          activePlayer.cardImage = apiCardImg;
          activePlayer.cardPhoto = apiCardImg;
        }
        if (data.marketValue !== undefined) activePlayer.marketValue = String(data.marketValue);
        if (data.contractUntil !== undefined) activePlayer.contractUntil = formatDate(data.contractUntil);
        if (data.agentName !== undefined) activePlayer.agent = data.agentName;
        if (data.agencyName !== undefined) activePlayer.agency = data.agencyName;
        if (data.agentStatus) (activePlayer as any).agentStatus = data.agentStatus;
        if (data.clubStatus) (activePlayer as any).clubStatus = data.clubStatus;
        if (data.currentClub) activePlayer.currentClub = data.currentClub;
        if (data.cvTier) (activePlayer as any).cvTier = data.cvTier;
        if (data.profileCompletion !== undefined) (activePlayer as any).profileCompletion = data.profileCompletion;
        if (data.transferStatus) {
          activePlayer.transferStatus = typeof data.transferStatus === 'string' ? data.transferStatus : (data.transferStatus.status || "Active");
        }
        if (Array.isArray(data.languages) && data.languages.length > 0) {
          activePlayer.languages = data.languages.map((l: any, i: number) => ({
            name: l.language || l.name || "",
            level: l.proficiency || l.level || "",
            color: i === 0 ? "text-primary" : i === 1 ? "text-yellow" : "text-orange"
          }));
        }
        const rawClubList = Array.isArray(data.clubHistory)
          ? data.clubHistory
          : Array.isArray(data.clubs)
            ? data.clubs
            : Array.isArray(data)
              ? data
              : null;

        if (rawClubList) {
          activePlayer.clubs = rawClubList.map((c: any, i: number) => {
            const periods = (c.period || "").split("-").map((s: string) => s.trim());
            return {
              id: c._id || c.id || String(i + 1),
              _id: c._id || c.id,
              name: c.clubName || c.name || "",
              from: c.from || periods[0] || "2020",
              to: c.to || periods[1] || (c.isCurrent ? "Present" : "2022"),
              logo: c.logoUrl || c.logo || c.image || "bg-blue-600",
              color: "border-primary",
              shortName: (c.clubName || c.name || "").slice(0, 3).toUpperCase(),
              isCurrent: c.isCurrent ?? (String(c.to || "").toLowerCase() === "present")
            };
          });
        } else if (data && typeof data === "object" && (data.clubName || data.name) && (data._id || data.from || data.to)) {
          const periods = (data.period || "").split("-").map((s: string) => s.trim());
          const newClubItem = {
            id: data._id || data.id || String(Date.now()),
            _id: data._id || data.id,
            name: data.clubName || data.name || "",
            from: data.from || periods[0] || "2020",
            to: data.to || periods[1] || (data.isCurrent ? "Present" : "2022"),
            logo: data.logoUrl || data.logo || data.image || "bg-blue-600",
            color: "border-primary",
            shortName: (data.clubName || data.name || "").slice(0, 3).toUpperCase(),
            isCurrent: data.isCurrent ?? (String(data.to || "").toLowerCase() === "present")
          };
          if (!activePlayer.clubs) activePlayer.clubs = [];
          const existingIndex = activePlayer.clubs.findIndex((c) => c.id === newClubItem.id);
          if (existingIndex >= 0) {
            activePlayer.clubs[existingIndex] = newClubItem;
          } else {
            activePlayer.clubs.push(newClubItem);
          }
        }
        if (Array.isArray(data.positionMap) && data.positionMap.length > 0) {
          activePlayer.positionMarkers = data.positionMap.map((m: any, idx: number) => ({
            id: m._id || `pos-${idx + 1}`,
            name: `position${idx + 1}`,
            x: m.x,
            y: m.y
          }));
        }
        if (Array.isArray(data.futsalMap) && data.futsalMap.length > 0) {
          activePlayer.futsalMarkers = data.futsalMap.map((m: any, idx: number) => ({
            id: m._id || `futsal-${idx + 1}`,
            name: `futsal${idx + 1}`,
            x: m.x,
            y: m.y
          }));
        }
        if (data.strength) {
          activePlayer.strengths = {
            pace: data.strength.pace ?? 50,
            shooting: data.strength.shooting ?? 50,
            passing: data.strength.passing ?? 50,
            dribbling: data.strength.dribbling ?? 50,
            defending: data.strength.defending ?? 50,
            physical: data.strength.physical ?? 50,
            heading: data.strength.heading ?? 88,
          };
        }
        if (data.performanceStats) {
          activePlayer.seasonStats = {
            matches: data.performanceStats.matches ?? 0,
            goals: data.performanceStats.goals ?? 0,
            assists: data.performanceStats.assists ?? 0,
            avgRating: data.matchSummary?.avgMatchRating ?? 0
          };
        }
        if (Array.isArray(data.playerStyles)) {
          activePlayer.selectedStyleIds = data.playerStyles;
        }
        if (Array.isArray(data.accomplishments) && data.accomplishments.length > 0) {
          activePlayer.careerHighlights = data.accomplishments.map((a: any) => ({
            year: String(a.year || ""),
            title: a.title || "",
            club: a.club || (activePlayer as any).currentClub || "",
            icon: trofeeIcon
          }));
        }
        if (data.isVerifiedByCoach !== undefined) {
          activePlayer.isVerifiedByCoach = Boolean(data.isVerifiedByCoach);
          activePlayer.validationStatus = data.isVerifiedByCoach ? "verified" : "pending";
        }
        if (data.coachVerification) {
          if (data.coachVerification.coachName) activePlayer.coachName = data.coachVerification.coachName;
          if (data.coachVerification.licenseNumber) activePlayer.coachLicenseNumber = data.coachVerification.licenseNumber;
          if (data.coachVerification.clubManaged) activePlayer.clubManaged = data.coachVerification.clubManaged;
          if (data.isVerifiedByCoach === undefined && data.coachVerification.isVerified !== undefined) {
            activePlayer.isVerifiedByCoach = Boolean(data.coachVerification.isVerified);
            activePlayer.validationStatus = data.coachVerification.isVerified ? "verified" : "pending";
          }
        } else if (data.isVerified !== undefined && data.isVerifiedByCoach === undefined) {
          activePlayer.isVerifiedByCoach = Boolean(data.isVerified);
          activePlayer.validationStatus = data.isVerified ? "verified" : "pending";
        }
        if (data.academy || data.academyDoc?.name || data.academyDetails?.name) {
          activePlayer.academyName = data.academy || data.academyDoc?.name || data.academyDetails?.name;
        }
        if (Array.isArray(data.clubsInterested) && data.clubsInterested.length > 0 && (!data.clubHistory || data.clubHistory.length === 0)) {
          activePlayer.clubs = data.clubsInterested.map((c: any, i: number) => ({
            id: String(i + 1),
            name: c.clubName || "Club",
            from: "2024",
            to: "Present",
            logo: c.logoUrl || "bg-blue-600",
            color: "border-blue-500",
            shortName: (c.clubName || "").slice(0, 3).toUpperCase(),
            isCurrent: true,
          }));
        }
        if (data.attributes?.categories) {
          const cats = data.attributes.categories;
          activePlayer.skillsCategories = [
            {
              category: "Technical",
              categoryKey: "technical",
              color: "#0077FF",
              borderColor: "border-l-blue-500",
              skills: Object.entries(cats.technical || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
            {
              category: "Tactical",
              categoryKey: "tactical",
              color: "#00FF62",
              borderColor: "border-l-green-500",
              skills: Object.entries(cats.tactical || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
            {
              category: "Physical",
              categoryKey: "physical",
              color: "#FF1010",
              borderColor: "border-l-red-500",
              skills: Object.entries(cats.physical || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
            {
              category: "Mental",
              categoryKey: "mental",
              color: "#FFD700",
              borderColor: "border-l-yellow-500",
              skills: Object.entries(cats.mental || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
            {
              category: "Attacking",
              categoryKey: "attacking",
              color: "#FF0055",
              borderColor: "border-l-pink-500",
              skills: Object.entries(cats.attacking || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
            {
              category: "Defending",
              categoryKey: "defending",
              color: "#00FFFF",
              borderColor: "border-l-cyan-500",
              skills: Object.entries(cats.defending || {}).map(([key, value]) => ({
                key,
                name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
                value: Number(value) || 50,
              })),
            },
          ];
        }
        if (Array.isArray(data.recentMatches) && data.recentMatches.length > 0) {
          (activePlayer as any).recentMatches = data.recentMatches;
        }
        if (data.additionalNotes !== undefined) {
          (activePlayer as any).additionalNotes = data.additionalNotes;
        }
        if (Array.isArray(data.certificates)) {
          (activePlayer as any).certificates = data.certificates;
        } else if (Array.isArray(data.documents)) {
          (activePlayer as any).certificates = data.documents;
        }
        if (Array.isArray(data.documents)) {
          (activePlayer as any).documents = data.documents;
        }
        (activePlayer as any).cvData = data;
      }
    },
    updatePlayerField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      const activePlayer = state.players.find((p) => p.id === state.selectedPlayerId);
      if (activePlayer) {
        const keys = field.split(".");
        if (keys.length === 1) {
          (activePlayer as any)[field] = value;
        } else {
          let current = activePlayer as any;
          for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        }

        // Two-way synchronization for Heading
        if (field === "cardImage" || field === "cardPhoto") {
          activePlayer.cardImage = value;
          activePlayer.cardPhoto = value;
        } else if (field === "strengths.heading") {
          if (activePlayer.skillsCategories) {
            for (const cat of activePlayer.skillsCategories) {
              const headingSkill = cat.skills?.find((s) => s.name.toLowerCase() === "heading");
              if (headingSkill) {
                headingSkill.value = value;
              }
            }
          }
        } else if (field === "skillsCategories" && Array.isArray(value)) {
          for (const cat of value) {
            const headingSkill = cat.skills?.find((s: any) => s.name.toLowerCase() === "heading");
            if (headingSkill && activePlayer.strengths) {
              activePlayer.strengths.heading = headingSkill.value;
            }
          }
        } else if (field.startsWith("skillsCategories.")) {
          if (activePlayer.skillsCategories && activePlayer.strengths) {
            for (const cat of activePlayer.skillsCategories) {
              const headingSkill = cat.skills?.find((s) => s.name.toLowerCase() === "heading");
              if (headingSkill) {
                activePlayer.strengths.heading = headingSkill.value;
              }
            }
          }
        }

        if (field === "position" || field.startsWith("strengths")) {
          activePlayer.rating = calculateWeightedRating(activePlayer.position, activePlayer.strengths);
        }
      }
    },
    setSelectedPlayerId: (state, action: PayloadAction<number>) => {
      state.selectedPlayerId = action.payload;
    },
    validatePlayerCv: (state, action: PayloadAction<number>) => {
      const player = state.players.find((p) => p.id === action.payload);
      if (player) {
        player.validationStatus = "verified";
        player.requestedValidation = false;
        player.lastValidatedDate = new Date().toISOString().split("T")[0];
        player.assignedMonthsAgo = 0; // reset assignment counter
      }
    },
    savePlayerEvaluation: (state, action: PayloadAction<{ id: number; evaluation: any; date: string }>) => {
      const player = state.players.find((p) => p.id === action.payload.id);
      if (player) {
        player.evaluation = action.payload.evaluation;
        player.evaluationDate = action.payload.date;
      }
    },
    addPlayer: (state, action: PayloadAction<Partial<PlayerStateItem>>) => {
      const newId = state.players.length > 0 ? Math.max(...state.players.map(p => p.id)) + 1 : 1;
      const newPlayer = {
        ...basePlayerData,
        id: newId,
        validationStatus: "pending",
        ...action.payload,
      };
      state.players.push(newPlayer as PlayerStateItem);
    },
  },
});

export const {
  setPlayerData,
  syncFromCvResponse,
  updatePlayerField,
  setSelectedPlayerId,
  validatePlayerCv,
  savePlayerEvaluation,
  addPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;


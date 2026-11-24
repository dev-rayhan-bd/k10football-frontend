/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import clubImage from "@/assets/cvs/club1.png";
import flagImage from "@/assets/cvs/id/coach-bio-flag.png";
import coachStyleImage from "@/assets/cvs/id/coach-style-image.png";
import flagFr from "@/assets/cvs/id/flag-fr.png";
import flagIt from "@/assets/cvs/id/flag-itally.png";
import courseLogo1 from "@/assets/cvs/id/courses-logo1.png";
import courseLogo2 from "@/assets/cvs/id/courses-logo2.png";
import courseLogo3 from "@/assets/cvs/id/courses-logo3.png";
import courseLogo4 from "@/assets/cvs/id/courses-logo4.png";
import { ICoachProfileData } from "@/types/coach.type";
import { coachStylesFromApi } from "@/components/cvs/coach-cv-details/bio-components/constants";

export interface CoachLanguage {
  name: string;
  level: string;
  color: string;
}

export interface CoachData {
  _id?: string;
  userId?: string;
  overallRatingScore: number;
  status: string;
  coachType: string;
  fullName: string;
  title: string;
  yearsExperience: number;
  cvTier: string;
  profileCompletion: number;
  completionPercentage: number;
  speciality: string;
  licenseStatus: string;
  currentClub: string;
  clubLogo: string;
  profileImage: string;
  coverImage: string;
  cardImage?: string;
  cardPhoto?: string;
  validationStatus: string;
  revalidationRequested: boolean;
  tierStatus: {
    currentTier: string;
    profileCompletion: number;
    completionPercentage: number;
    label?: string;
    canRequestRevalidation?: boolean;
  };
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
  languages: CoachLanguage[];
  seasonStats: {
    matches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    cleanSheets: number;
  };
  transferStatus: string;
  contractUntil: string;
  agent: string;
  agency: string;
  salary: string;
  statusBadge: string;
  majorTrophies: { id?: string; name: string; count: number; year?: number }[];
  cupHistory: string[];
  keySkills: { id: string | number; text: string; icon?: string; isCustom?: boolean }[];
  clubs: { id: string; _id?: string; name: string; from: string; to: string; logo?: any; color?: string; role?: string; isCurrent?: boolean }[];
  qualifications: { id: number; text: string; icon?: string }[];
  accomplishments: { id?: string; text: string }[];
  coachImage: any;
  mainFlag: any;
  selectedStyleIds: string[];
  complementaryLogos: { id: number; name: string; image: any }[];
  complementaryCourses: { id: number; title: string; icon?: string; isCompleted?: boolean; isSelected?: boolean }[];
  associations: { id?: string; name: string; code: string; isSelected: boolean }[];
  courses?: any[];
  formationMarkers: { id: number | string; x: number; y: number }[][];
  formations: any[];
  documents: any[];
  assignedPlayerReviews: any[];
  testimonials: { id: number; name: string; role: string; text: string; avatar: string }[];
  cvData?: any;
}

const initialState: CoachData = {
  overallRatingScore: 0,
  status: "ACTIVE",
  coachType: "INDIVIDUAL_COACH",
  fullName: "",
  title: "Coach",
  yearsExperience: 0,
  cvTier: "",
  profileCompletion: 0,
  completionPercentage: 0,
  speciality: "",
  licenseStatus: "",
  currentClub: "",
  clubLogo: "",
  profileImage: "",
  coverImage: "",
  cardImage: "",
  cardPhoto: "",
  validationStatus: "",
  revalidationRequested: false,
  tierStatus: {
    currentTier: "BRONZE",
    profileCompletion: 0,
    completionPercentage: 0,
    label: "COMPLETE ALL MANDATORY SECTIONS TO UNLOCK TIER STATUS",
    canRequestRevalidation: true,
  },
  dob: "",
  age: "",
  birthCountry: "",
  birthCountryFlag: null,
  dualNationality: "",
  dualNationalityFlag: null,
  email: "",
  phone: "",
  location: "",
  website: "",
  languages: [],
  seasonStats: {
    matches: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    cleanSheets: 0,
  },
  transferStatus: "",
  statusBadge: "",
  contractUntil: "",
  agent: "",
  agency: "",
  salary: "",
  majorTrophies: [],
  coachImage: coachStyleImage,
  mainFlag: flagImage,
  cupHistory: [],
  keySkills: [],
  clubs: [],
  qualifications: [],
  accomplishments: [],
  selectedStyleIds: [],
  complementaryLogos: [
    { id: 1, name: 'Logo 1', image: courseLogo1 },
    { id: 2, name: 'Logo 2', image: courseLogo2 },
    { id: 3, name: 'Logo 3', image: courseLogo3 },
    { id: 4, name: 'Logo 4', image: courseLogo4 },
  ],
  complementaryCourses: [
    { id: 1, title: 'UEFA Pro Licence', icon: 'award', isCompleted: true, isSelected: true },
    { id: 2, title: 'UEFA A Licence', icon: 'award', isCompleted: true, isSelected: true },
    { id: 3, title: 'Level 3 Coaching Certificate', icon: 'award', isCompleted: true, isSelected: true },
    { id: 4, title: 'Performance Analysis in Professional Football', icon: 'award', isCompleted: true, isSelected: true },
  ],
  associations: [
    { name: "CAF", code: "CAF", isSelected: true },
    { name: "CONCACAF", code: "CONCACAF", isSelected: true },
    { name: "DFB", code: "DFB", isSelected: true },
    { name: "UEFA", code: "UEFA", isSelected: true },
    { name: "FIFA", code: "FIFA", isSelected: true },
    { name: "CBF", code: "CBF", isSelected: true },
    { name: "The FA", code: "THE_FA", isSelected: true },
    { name: "RFEF", code: "RFEF", isSelected: true },
    { name: "FFF", code: "FFF", isSelected: true },
  ],
  formationMarkers: [
    [
      { id: "pin-1", x: 50, y: 90 },
      { id: "pin-2", x: 35, y: 75 },
      { id: "pin-3", x: 65, y: 75 },
      { id: "pin-4", x: 50, y: 20 },
    ],
    [
      { id: "pin-1", x: 55, y: 55 },
    ],
    [],
  ],
  formations: [],
  documents: [],
  assignedPlayerReviews: [],
  testimonials: [
    {
      id: 1,
      name: 'Emanuel',
      role: 'Assistant Coach',
      text: 'Working with this coach changed everything for our team. Skills that felt impossible now look effortless.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    },
    {
      id: 2,
      name: 'Dylan Hodges',
      role: 'Head Coach of the club',
      text: 'The coach improved our squad faster than we expected. Progress that used to take months now shows within days.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    },
    {
      id: 3,
      name: 'Madonna',
      role: 'Youth Academy Director',
      text: 'Our players develop twice as fast under this coach. What once felt confusing is now clear and structured.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
    },
  ]
};

export const coachSlice = createSlice({
  name: "coach",
  initialState,
  reducers: {
    setCoachData: (state, action: PayloadAction<Partial<CoachData>>) => {
      return { ...state, ...action.payload };
    },
    updateCoachField: (state, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      if (field === "cardImage" || field === "cardPhoto") {
        state.cardImage = value;
        state.cardPhoto = value;
      }
      const keys = field.split(".");
      if (keys.length === 1) {
        (state as any)[field] = value;
      } else {
        let current = state as any;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
      }
    },
    syncFromCoachCvResponse: (state, action: PayloadAction<ICoachProfileData | any>) => {
      const data = action.payload;
      if (!data) return;

      if (data._id !== undefined) state._id = data._id;
      if (data.userId !== undefined) state.userId = data.userId;
      if (data.overallRatingScore !== undefined) state.overallRatingScore = data.overallRatingScore;
      if (data.status !== undefined) state.status = data.status;
      if (data.coachType !== undefined) state.coachType = data.coachType;
      if (data.fullName !== undefined) state.fullName = data.fullName;
      if (data.title !== undefined) state.title = data.title;
      if (data.yearsExperience !== undefined) state.yearsExperience = data.yearsExperience;
      if (data.cvTier !== undefined) state.cvTier = data.cvTier;
      if (data.profileCompletion !== undefined) state.profileCompletion = data.profileCompletion;
      if (data.completionPercentage !== undefined) state.completionPercentage = data.completionPercentage;
      if (data.speciality !== undefined) state.speciality = data.speciality;
      if (data.licenseStatus !== undefined) state.licenseStatus = data.licenseStatus;
      if (data.currentClub !== undefined) state.currentClub = data.currentClub;
      if (data.clubLogo !== undefined) state.clubLogo = data.clubLogo;
      if (data.profileImage !== undefined) {
        state.profileImage = data.profileImage;
        state.coachImage = data.profileImage;
      }
      if (data.coverImage !== undefined) state.coverImage = data.coverImage;
      const apiCoachCardImg =
        data.cardImage ||
        data.cardPhoto ||
        data.coachCardStats?.cardImage ||
        data.coachCardStats?.cardPhoto ||
        "";
      if (
        data.cardImage !== undefined ||
        data.cardPhoto !== undefined ||
        data.coachCardStats?.cardImage !== undefined ||
        data.coachCardStats?.cardPhoto !== undefined
      ) {
        state.cardImage = apiCoachCardImg;
        state.cardPhoto = apiCoachCardImg;
      }
      if (data.validationStatus !== undefined) state.validationStatus = data.validationStatus;
      if (data.revalidationRequested !== undefined) state.revalidationRequested = data.revalidationRequested;
      if (data.tierStatus !== undefined) state.tierStatus = data.tierStatus;

      // Personal Info
      if (data.personalInformation) {
        const pi = data.personalInformation;
        if (pi.fullName !== undefined) state.fullName = pi.fullName;
        if (pi.dateOfBirth !== undefined) state.dob = pi.dateOfBirth || "";
        if (pi.age !== undefined) state.age = pi.age !== null && pi.age !== undefined ? String(pi.age) : "";
        if (pi.birthCountry !== undefined) state.birthCountry = pi.birthCountry || "";
        if (pi.dualNationality !== undefined) state.dualNationality = pi.dualNationality || "";
      }

      // Contact
      if (data.contact) {
        const c = data.contact;
        if (c.email !== undefined) state.email = c.email || "";
        if (c.phone !== undefined) state.phone = c.phone || "";
        if (c.location !== undefined) state.location = c.location || "";
        if (c.website !== undefined) state.website = c.website || "";
      }

      // Season Stats
      if (data.seasonStats) {
        const s = data.seasonStats;
        state.seasonStats = {
          matches: s.matchesCoached ?? s.matches ?? state.seasonStats?.matches ?? 0,
          wins: s.totalWins ?? s.wins ?? state.seasonStats?.wins ?? 0,
          losses: s.losses ?? state.seasonStats?.losses ?? 0,
          draws: s.draws ?? state.seasonStats?.draws ?? 0,
          winRate: s.winRate ?? state.seasonStats?.winRate ?? 0,
          cleanSheets: s.cleanSheets ?? state.seasonStats?.cleanSheets ?? 0,
        };
      }

      // Transfer Status
      if (data.transferStatus) {
        const t = data.transferStatus;
        state.transferStatus = t.statusBadge || t.footballAgentContract || state.transferStatus || "";
        if (t.statusBadge !== undefined) state.statusBadge = t.statusBadge;
        if (t.contractUntil !== undefined) state.contractUntil = t.contractUntil || "";
        if (t.agent !== undefined) state.agent = t.agent || "";
        if (t.agency !== undefined) state.agency = t.agency || "";
        if (t.salary !== undefined) state.salary = t.salary || "";
      }

      // Languages
      if (Array.isArray(data.languages) && data.languages.length > 0) {
        state.languages = data.languages.map((l: any, i: number) => ({
          name: l.language || l.name || "",
          level: l.proficiency || l.level || "",
          color: i === 0 ? "text-primary" : i === 1 ? "text-yellow" : "text-orange",
        }));
      }

      // Accomplishments
      if (Array.isArray(data.accomplishments) && data.accomplishments.length > 0) {
        state.accomplishments = data.accomplishments.map((a: any) => ({
          id: a._id,
          text: a.text || "",
        }));
        state.qualifications = data.accomplishments.map((a: any, idx: number) => ({
          id: idx + 1,
          text: a.text || "",
          icon: "users",
        }));
      }

      // Coach Styles
      if (Array.isArray(data.coachStyles)) {
        state.selectedStyleIds = coachStylesFromApi(data.coachStyles);
      }

      // Major Trophies
      if (Array.isArray(data.majorTrophies) && data.majorTrophies.length > 0) {
        state.majorTrophies = data.majorTrophies.map((t: any) => ({
          id: t._id,
          name: t.title || t.name || "",
          count: t.count || 1,
          year: t.year,
        }));
      }

      // Cups Played
      if (Array.isArray(data.cupsPlayed) && data.cupsPlayed.length > 0) {
        state.cupHistory = data.cupsPlayed.map((c: any) => `${c.year} - ${c.tournament}`);
      }

      // Key Skills
      if (Array.isArray(data.keySkills) && data.keySkills.length > 0) {
        state.keySkills = data.keySkills.map((k: any, idx: number) => ({
          id: k._id || idx + 1,
          text: k.name || k.text || "",
          icon: k.icon || "star",
          isCustom: k.isCustom,
        }));
      }

      // Club History
      if (Array.isArray(data.clubHistory)) {
        state.clubs = data.clubHistory.map((c: any, i: number) => {
          const periods = (c.period || "").split("-").map((s: string) => s.trim());
          return {
            id: c._id || String(i + 1),
            _id: c._id,
            name: c.clubName || c.name || "",
            from: periods[0] || String(c.startYear || "2020"),
            to: periods[1] || (c.isCurrent ? "Present" : String(c.endYear || "2022")),
            logo: c.logoUrl || c.logo || clubImage,
            color: "border-primary",
            role: c.role || "Coach",
            isCurrent: c.isCurrent ?? false,
          };
        });
      }

      // Formations
      if (Array.isArray(data.formations) && data.formations.length > 0) {
        state.formations = data.formations;
        const markers: { id: number | string; x: number; y: number }[][] = [[], [], []];
        data.formations.forEach((f: any) => {
          const slotIdx = (f.formationSlot || 1) - 1;
          if (slotIdx >= 0 && slotIdx < 3 && Array.isArray(f.positions)) {
            markers[slotIdx] = f.positions.map((p: any, idx: number) => ({
              id: p.id || idx + 1,
              x: p.x,
              y: p.y,
            }));
          }
        });
        state.formationMarkers = markers;
      }

      // Courses & Associations
      if (Array.isArray(data.courses) && data.courses.length > 0) {
        state.courses = data.courses;
        state.complementaryCourses = data.courses.map((c: any, idx: number) => ({
          id: idx + 1,
          title: c.name || "",
          icon: "award",
          isCompleted: c.isCompleted,
          isSelected: c.isSelected,
        }));
      }
      if (Array.isArray(data.associations) && data.associations.length > 0) {
        state.associations = data.associations;
      }

      // Documents
      if (Array.isArray(data.documents)) {
        state.documents = data.documents;
      }

      // Assigned player reviews
      if (Array.isArray(data.assignedPlayerReviews)) {
        state.assignedPlayerReviews = data.assignedPlayerReviews;
      }

      state.cvData = data;
    },
  },
});

export const { setCoachData, updateCoachField, syncFromCoachCvResponse } = coachSlice.actions;

export default coachSlice.reducer;

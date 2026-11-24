/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useMemo } from "react";
import flagFr from "@/assets/cvs/id/flag-fr.png";
import flagIt from "@/assets/cvs/id/flag-itally.png";
import playerDefaultImage from "@/assets/cvs/id/player-image.png";
import trofeeIcon from "@/assets/cvs/id/trofeeIcon.png";
import futsalMap from "@/assets/cvs/id/Futsal Pitch.jpg";
import positionMap from "@/assets/cvs/id/position-map.png";
import leftLeg from "@/assets/cvs/id/left_foot.png";
import rightLeg from "@/assets/cvs/id/right_foot.png";
import { formatDate } from "@/lib/utils";
import { stylesFromApi } from "@/components/cvs/player-cv-details/bio-components/bioConstants";

export interface ViewPlayerData {
  id: string;
  userId: string;
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
  leftLegImage?: any;
  rightLegImage?: any;
  languages: { name: string; level: string; color: string }[];
  rating: number;
  playerImage: any;
  cardImage?: string;
  strengths: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
    heading: number;
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
  currentClub: string;
  position: string;
  secondaryPositions: string[];
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
  clubs: {
    id: string;
    name: string;
    from: string;
    to: string;
    logo: string;
    color: string;
    shortName: string;
    isCurrent?: boolean;
  }[];
  skillsCategories: {
    category: string;
    categoryKey?: string;
    color: string;
    borderColor: string;
    skills: { key?: string; name: string; value: number }[];
  }[];
  coachName: string;
  academyName: string;
  coachLicenseNumber: string;
  clubManaged: string;
  isVerifiedByCoach: boolean;
  validationStatus: "pending" | "verified" | "expired" | "not_needed";
  positionMarkers: Array<{ id: string; name?: string; position?: string; slot?: string; role?: string; x: number; y: number }>;
  futsalMarkers: Array<{ id: string; name?: string; position?: string; slot?: string; role?: string; x: number; y: number }>;
  positionOverall?: number;
  additionalNotes: string;
  highlightVideo?: string;
  profileImage?: string;
  documents: any[];
  certificates: any[];
  recentMatches: any[];
  matchSummary: any;
  perceptionMetrics?: any;
  visionMetrics?: any;
  footDonut?: any;
  skillsDonutScore?: number;
  positionalCoefficients?: any[];
  keyAttributes?: any[];
  profileViews?: number;
  totalLikes?: number;
  rawCvData: any;
}

interface PlayerCvViewContextType {
  playerData: ViewPlayerData;
  cvData: any;
}

const PlayerCvViewContext = createContext<PlayerCvViewContextType | undefined>(undefined);

export const usePlayerCvView = () => {
  const context = useContext(PlayerCvViewContext);
  if (!context) {
    throw new Error("usePlayerCvView must be used within a PlayerCvViewProvider");
  }
  return context;
};

export const PlayerCvViewProvider = ({
  children,
  apiData,
}: {
  children: React.ReactNode;
  apiData: any;
}) => {
  const playerData = useMemo<ViewPlayerData>(() => {
    const data = apiData || {};
    const cats = data.attributes?.categories || {};

    const technicalSkills = Object.entries(cats.technical || {
      ballControl: 74, dribbling: 74, shortPassing: 74, longPassing: 74, crossing: 74, shooting: 74, finishing: 74, longShots: 74
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const tacticalSkills = Object.entries(cats.tactical || {
      positioning: 50, vision: 50, anticipation: 78, composition: 80, teamwork: 50, workRate: 50, decisions: 82, attPosition: 80
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const physicalSkills = Object.entries(cats.physical || {
      acceleration: 74, sprintSpeed: 74, stamina: 74, strength: 74, balance: 74, agility: 74, reactions: 74, jumping: 74
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const mentalSkills = Object.entries(cats.mental || {
      aggression: 50, concentration: 50, consistency: 50, leadership: 50, bravery: 50, determination: 50, heading: 50, influence: 50
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const attackingSkills = Object.entries(cats.attacking || {
      firstTouch: 88, shotPower: 50, curve: 50, freeKick: 50, penalties: 50, volleys: 50, headingAccuracy: 50, weakFoot: 50
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const defendingSkills = Object.entries(cats.defending || {
      standingTackle: 50, slidingTackle: 50, interception: 50, marking: 50, aerialDuels: 50, clearance: 50, pressing: 50, defensiveAwareness: 50
    }).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const skillsCategories = [
      { category: "Technical", categoryKey: "technical", color: "#0077FF", borderColor: "border-l-blue-500", skills: technicalSkills },
      { category: "Tactical", categoryKey: "tactical", color: "#00FF62", borderColor: "border-l-green-500", skills: tacticalSkills },
      { category: "Physical", categoryKey: "physical", color: "#FF1010", borderColor: "border-l-red-500", skills: physicalSkills },
      { category: "Mental", categoryKey: "mental", color: "#FFD700", borderColor: "border-l-yellow-500", skills: mentalSkills },
      { category: "Attacking", categoryKey: "attacking", color: "#FF0055", borderColor: "border-l-pink-500", skills: attackingSkills },
      { category: "Defending", categoryKey: "defending", color: "#00FFFF", borderColor: "border-l-cyan-500", skills: defendingSkills },
    ];

    let clubsList: ViewPlayerData["clubs"] = [];
    if (Array.isArray(data.clubHistory) && data.clubHistory.length > 0) {
      clubsList = data.clubHistory.map((c: any, i: number) => {
        const periods = (c.period || "").split("-").map((s: string) => s.trim());
        return {
          id: c._id || String(i + 1),
          name: c.clubName || c.name || "Club",
          from: c.from || periods[0] || "2020",
          to: c.to || periods[1] || (c.isCurrent ? "Present" : "2024"),
          logo: c.logoUrl || c.logo || c.image || "",
          color: "border-primary",
          shortName: (c.clubName || c.name || "CLB").slice(0, 3).toUpperCase(),
          isCurrent: c.isCurrent,
        };
      });
    }

    const positionMarkers = Array.isArray(data.positionMap) && data.positionMap.length > 0
      ? data.positionMap.map((m: any, idx: number) => ({
          id: m._id || `pos-${idx + 1}`,
          name: m.position || m.slot || `Position-${idx + 1}`,
          position: m.position || "",
          slot: m.slot || "",
          role: m.role || "",
          x: Number(m.x ?? 50),
          y: Number(m.y ?? 50),
        }))
      : [];

    const futsalMarkers = Array.isArray(data.futsalMap) && data.futsalMap.length > 0
      ? data.futsalMap.map((m: any, idx: number) => ({
          id: m._id || `futsal-${idx + 1}`,
          name: m.position || m.slot || `Futsal-${idx + 1}`,
          position: m.position || "",
          slot: m.slot || "",
          role: m.role || "",
          x: Number(m.x ?? 50),
          y: Number(m.y ?? 50),
        }))
      : [];

    const isVerified = Boolean(data.coachVerification?.isVerified ?? data.isVerifiedByCoach);
    const resolvedUserId =
      typeof data.userId === "object" && data.userId !== null
        ? data.userId._id || data.userId.id || ""
        : typeof data.userId === "string"
          ? data.userId
          : "";

    return {
      id: data._id || data.playerId || "",
      userId: resolvedUserId,
      fullName: data.fullName || "Player",
      dob: data.dateOfBirth ? (data.dateOfBirth.includes("T") ? data.dateOfBirth.split("T")[0] : data.dateOfBirth) : "",
      age: String(data.age ?? ""),
      birthCountry: data.country || "",
      birthCountryFlag: flagFr,
      dualNationality: data.dualNationality || "",
      dualNationalityFlag: flagIt,
      email: data.email || "",
      phone: data.phone || data.contact || "",
      location: data.country || "",
      website: data.website || "",
      height: String(data.height ?? 0),
      weight: String(data.weight ?? 0),
      leftLegUsage: data.leftFootDominance ?? data.footDonut?.left ?? 50,
      rightLegUsage: data.rightFootDominance ?? data.footDonut?.right ?? 50,
      leftLegImage: leftLeg,
      rightLegImage: rightLeg,
      languages: Array.isArray(data.languages)
        ? data.languages.map((l: any, i: number) => ({
            name: l.language || l.name || "",
            level: l.proficiency || l.level || "Fluent",
            color: i === 0 ? "text-primary" : i === 1 ? "text-yellow" : "text-orange",
          }))
        : [],
      rating: data.positionOverall ?? data.overallRating ?? 0,
      positionOverall: typeof data.positionOverall === "number" ? data.positionOverall : undefined,
      profileImage: data.profileImage || "",
      cardImage: data.cardImage || data.cardPhoto || data.fifaCardStats?.cardImage || data.fifaCardStats?.cardPhoto || "",
      playerImage:
        data.profileImage ||
        data.cardImage ||
        data.cardPhoto ||
        data.fifaCardStats?.cardImage ||
        data.fifaCardStats?.cardPhoto ||
        "/profile_placeholder.jpg",
      strengths: {
        pace: data.strength?.pace ?? data.strengths?.pace ?? 50,
        shooting: data.strength?.shooting ?? data.strengths?.shooting ?? 50,
        passing: data.strength?.passing ?? data.strengths?.passing ?? 50,
        dribbling: data.strength?.dribbling ?? data.strengths?.dribbling ?? 50,
        defending: data.strength?.defending ?? data.strengths?.defending ?? 50,
        physical: data.strength?.physical ?? data.strengths?.physical ?? 50,
        heading: data.strength?.heading ?? data.strengths?.heading ?? 50,
      },
      performanceMetrics: {
        passAccuracy: data.matchSummary?.avgPassAccuracy ?? 0,
        shootAccuracy: data.strength?.shooting ?? 0,
        dribbleSuccess: data.strength?.dribbling ?? 0,
        tackleSuccess: data.strength?.defending ?? 0,
      },
      marketValue: String(data.marketValue ?? 0),
      marketTrend: data.marketTrend || "",
      transferStatus:
        typeof data.transferStatus === "string"
          ? data.transferStatus
          : data.transferStatus?.status || data.clubStatus || "Available for Loan / Transfer",
      contractUntil: data.contractUntil ? formatDate(data.contractUntil) : "N/A",
      agent: data.agentName || data.transferStatus?.agentName || "N/A",
      agency: data.agencyName || data.transferStatus?.agencyName || "N/A",
      currentClub: data.currentClub || clubsList[0]?.name || "Unattached",
      position: data.position || "CM",
      secondaryPositions: Array.isArray(data.secondaryPositions) ? data.secondaryPositions : [],
      jerseyNumber: data.jerseyNumber ?? 10,
      selectedStyleIds: stylesFromApi(data.playerStyles),
      careerHighlights: Array.isArray(data.accomplishments)
        ? data.accomplishments.map((a: any) => ({
            year: String(a.year || ""),
            title: a.title || "",
            club: a.club || data.currentClub || "",
            icon: trofeeIcon,
          }))
        : [],
      seasonStats: {
        matches: data.performanceStats?.matches ?? data.matchSummary?.totalMatches ?? 0,
        goals: data.performanceStats?.goals ?? data.matchSummary?.totalGoals ?? 0,
        assists: data.performanceStats?.assists ?? data.matchSummary?.totalAssists ?? 0,
        avgRating: data.matchSummary?.avgMatchRating ?? 0,
      },
      clubs: clubsList,
      skillsCategories,
      positionMarkers,
      futsalMarkers,
      coachName: data.coachVerification?.coachName || data.coachName || "N/A",
      academyName: data.academy || data.academyDetails?.name || "N/A",
      coachLicenseNumber: data.coachVerification?.licenseNumber || data.licenseNumber || "",
      clubManaged: data.coachVerification?.clubManaged || data.clubManaged || "N/A",
      isVerifiedByCoach: isVerified,
      validationStatus: isVerified ? "verified" : "pending",
      additionalNotes: data.additionalNotes || "",
      highlightVideo: data.highlightVideo,
      documents: data.documents || [],
      certificates: data.certificates || data.documents || [],
      recentMatches: data.recentMatches || [],
      matchSummary: data.matchSummary || {},
      perceptionMetrics: data.perceptionMetrics,
      visionMetrics: data.visionMetrics,
      footDonut: data.footDonut,
      skillsDonutScore: data.skillsDonutScore ?? 0,
      positionalCoefficients: data.positionalCoefficients,
      keyAttributes: data.keyAttributes,
      profileViews: data.overviewStats?.profileViews ?? data.profileViews ?? 0,
      totalLikes: data.overviewStats?.totalLikes ?? data.totalLikes ?? 0,
      rawCvData: data,
    };
  }, [apiData]);

  return (
    <PlayerCvViewContext.Provider value={{ playerData, cvData: apiData }}>
      {children}
    </PlayerCvViewContext.Provider>
  );
};

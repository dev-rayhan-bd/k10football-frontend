/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useMemo } from "react";
import flagFr from "@/assets/cvs/id/flag-fr.png";
import flagIt from "@/assets/cvs/id/flag-itally.png";
import playerDefaultImage from "@/assets/cvs/id/player-image.png";
import trofeeIcon from "@/assets/cvs/id/trofeeIcon.png";
import { formatDate } from "@/lib/utils";

export interface CoachViewPlayerData {
  id: string;
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

interface CoachPlayerCvContextType {
  playerData: CoachViewPlayerData;
  cvData: any;
}

const CoachPlayerCvContext = createContext<CoachPlayerCvContextType | undefined>(undefined);

export const useCoachPlayerCv = () => {
  const context = useContext(CoachPlayerCvContext);
  if (!context) {
    throw new Error("useCoachPlayerCv must be used within a CoachPlayerCvProvider");
  }
  return context;
};

export const CoachPlayerCvProvider = ({
  children,
  apiData,
}: {
  children: React.ReactNode;
  apiData: any;
}) => {
  const playerData = useMemo<CoachViewPlayerData>(() => {
    const data = apiData || {};
    const cats = data.attributes?.categories || {};

    const technicalSkills = Object.entries(
      cats.technical || {
        ballControl: 74,
        dribbling: 74,
        shortPassing: 74,
        longPassing: 74,
        crossing: 74,
        shooting: 74,
        finishing: 74,
        longShots: 74,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const tacticalSkills = Object.entries(
      cats.tactical || {
        positioning: 50,
        vision: 50,
        anticipation: 78,
        composition: 80,
        teamwork: 50,
        workRate: 50,
        decisions: 82,
        attPosition: 80,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const physicalSkills = Object.entries(
      cats.physical || {
        acceleration: 74,
        sprintSpeed: 74,
        stamina: 74,
        strength: 74,
        balance: 74,
        agility: 74,
        reactions: 74,
        jumping: 74,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const mentalSkills = Object.entries(
      cats.mental || {
        aggression: 50,
        concentration: 50,
        consistency: 50,
        leadership: 50,
        bravery: 50,
        determination: 50,
        heading: 50,
        influence: 50,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const attackingSkills = Object.entries(
      cats.attacking || {
        firstTouch: 88,
        shotPower: 50,
        curve: 50,
        freeKick: 50,
        penalties: 50,
        volleys: 50,
        headingAccuracy: 50,
        weakFoot: 50,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const defendingSkills = Object.entries(
      cats.defending || {
        standingTackle: 50,
        slidingTackle: 50,
        interception: 50,
        marking: 50,
        aerialDuels: 50,
        clearance: 50,
        pressing: 50,
        defensiveAwareness: 50,
      }
    ).map(([k, v]) => ({
      key: k,
      name: k.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: Number(v) || 50,
    }));

    const skillsCategories = [
      {
        category: "Technical",
        categoryKey: "technical",
        color: "#0077FF",
        borderColor: "border-l-blue-500",
        skills: technicalSkills,
      },
      {
        category: "Tactical",
        categoryKey: "tactical",
        color: "#00FF62",
        borderColor: "border-l-green-500",
        skills: tacticalSkills,
      },
      {
        category: "Physical",
        categoryKey: "physical",
        color: "#FF1010",
        borderColor: "border-l-red-500",
        skills: physicalSkills,
      },
      {
        category: "Mental",
        categoryKey: "mental",
        color: "#FFD700",
        borderColor: "border-l-yellow-500",
        skills: mentalSkills,
      },
      {
        category: "Attacking",
        categoryKey: "attacking",
        color: "#FF0055",
        borderColor: "border-l-pink-500",
        skills: attackingSkills,
      },
      {
        category: "Defending",
        categoryKey: "defending",
        color: "#00FFFF",
        borderColor: "border-l-cyan-500",
        skills: defendingSkills,
      },
    ];

    let clubsList = [];
    if (Array.isArray(data.clubHistory) && data.clubHistory.length > 0) {
      clubsList = data.clubHistory.map((c: any, i: number) => {
        const periods = (c.period || "").split("-").map((s: string) => s.trim());
        return {
          id: c._id || String(i + 1),
          name: c.clubName || c.name || "Club",
          from: periods[0] || "2020",
          to: periods[1] || (c.isCurrent ? "Present" : "2024"),
          logo: c.logoUrl || c.logo || "bg-blue-600",
          color: "border-blue-500",
          shortName: (c.clubName || "CLB").slice(0, 3).toUpperCase(),
          isCurrent: c.isCurrent,
        };
      });
    } else if (Array.isArray(data.clubsInterested) && data.clubsInterested.length > 0) {
      clubsList = data.clubsInterested.map((c: any, i: number) => ({
        id: String(i + 1),
        name: c.clubName || "Club",
        from: "2024",
        to: "Present",
        logo: c.logoUrl || "bg-blue-600",
        color: "border-blue-500",
        shortName: (c.clubName || "CLB").slice(0, 3).toUpperCase(),
        isCurrent: true,
      }));
    } else {
      clubsList = [
        {
          id: "1",
          name: data.currentClub || "Real Madrid Youth",
          from: "2024",
          to: "Present",
          logo: "bg-blue-600",
          color: "border-blue-400",
          shortName: "RMY",
        },
      ];
    }

    return {
      id: data._id || data.playerId || "",
      fullName: data.fullName || "Player",
      dob: data.dateOfBirth
        ? data.dateOfBirth.includes("T")
          ? data.dateOfBirth.split("T")[0]
          : data.dateOfBirth
        : "2008-05-15",
      age: String(data.age || 18),
      birthCountry: data.country || "Bangladesh",
      birthCountryFlag: flagFr,
      dualNationality: data.dualNationality || "Spain",
      dualNationalityFlag: flagIt,
      email: data.email || "",
      phone: data.phone || data.contact || "",
      location: data.country || "Bangladesh",
      website: data.website || "",
      height: String(data.height || 180),
      weight: String(data.weight || 75),
      leftLegUsage: data.leftFootDominance ?? 50,
      rightLegUsage: data.rightFootDominance ?? 50,
      languages:
        Array.isArray(data.languages) && data.languages.length > 0
          ? data.languages.map((l: any, i: number) => ({
              name: l.language || l.name || "",
              level: l.proficiency || l.level || "Fluent",
              color: i === 0 ? "text-primary" : i === 1 ? "text-yellow" : "text-orange",
            }))
          : [
              { name: "English", level: "Fluent", color: "text-primary" },
              { name: "Spanish", level: "Intermediate", color: "text-yellow" },
            ],
      rating: data.overallRating ?? 85,
      playerImage: data.profileImage || playerDefaultImage,
      cardImage: data.profileImage || "",
      strengths: {
        pace: data.strength?.pace ?? 50,
        shooting: data.strength?.shooting ?? 50,
        passing: data.strength?.passing ?? 50,
        dribbling: data.strength?.dribbling ?? 50,
        defending: data.strength?.defending ?? 50,
        physical: data.strength?.physical ?? 50,
        heading: data.strength?.heading ?? 50,
      },
      performanceMetrics: {
        passAccuracy: 88,
        shootAccuracy: 75,
        dribbleSuccess: 80,
        tackleSuccess: 70,
      },
      marketValue: String(data.marketValue ?? 0),
      marketTrend: "Stable",
      transferStatus:
        typeof data.transferStatus === "string"
          ? data.transferStatus
          : data.transferStatus?.status || "Active",
      contractUntil: data.contractUntil ? formatDate(data.contractUntil) : "June, 2028",
      agent: data.agentName || "Unrepresented",
      agency: data.agencyName || "",
      currentClub: data.currentClub || "Real Madrid Youth",
      position: data.position || "ST",
      secondaryPositions: data.secondaryPositions || ["Winger", "CF"],
      jerseyNumber: 10,
      selectedStyleIds: data.playerStyles || ["technical", "finesse-shot"],
      careerHighlights:
        Array.isArray(data.accomplishments) && data.accomplishments.length > 0
          ? data.accomplishments.map((a: any) => ({
              year: String(a.year || "2024"),
              title: a.title || "Championship",
              club: a.club || data.currentClub || "K10 Academy",
              icon: trofeeIcon,
            }))
          : [
              {
                year: "2026",
                title: "Youth Premier League",
                club: "Real Madrid Youth",
                icon: trofeeIcon,
              },
            ],
      seasonStats: {
        matches: data.performanceStats?.matches ?? (data.matchSummary?.totalMatches ?? 1),
        goals: data.performanceStats?.goals ?? (data.matchSummary?.totalGoals ?? 0),
        assists: data.performanceStats?.assists ?? (data.matchSummary?.totalAssists ?? 0),
        avgRating: data.matchSummary?.avgMatchRating ?? 10,
      },
      clubs: clubsList,
      skillsCategories,
      coachName: data.coachVerification?.coachName || "Marcus Silva",
      academyName: data.academy || data.academyDetails?.name || "Santos FC Academy",
      coachLicenseNumber: data.coachVerification?.licenseNumber || "UEFA Pro Licence",
      clubManaged: data.coachVerification?.clubManaged || "Kings Football Academy",
      isVerifiedByCoach: Boolean(data.coachVerification?.isVerified ?? data.isVerifiedByCoach),
      additionalNotes:
        data.additionalNotes ||
        `${data.fullName || "Player"} demonstrates outstanding spatial awareness and decision-making on the pitch. Tactical discipline is exceptional with strong work ethic and positional flexibility.`,
      highlightVideo: data.highlightVideo,
      profileImage: data.profileImage,
      documents: data.documents || [],
      certificates: data.certificates || data.documents || [],
      recentMatches: data.recentMatches || [],
      matchSummary: data.matchSummary || {},
      perceptionMetrics: data.perceptionMetrics,
      visionMetrics: data.visionMetrics,
      footDonut: data.footDonut,
      skillsDonutScore: data.skillsDonutScore ?? 61,
      positionalCoefficients: data.positionalCoefficients,
      keyAttributes: data.keyAttributes,
      profileViews: data.profileViews ?? 127,
      totalLikes: data.totalLikes ?? 8,
      rawCvData: data,
    };
  }, [apiData]);

  return (
    <CoachPlayerCvContext.Provider value={{ playerData, cvData: apiData }}>
      {children}
    </CoachPlayerCvContext.Provider>
  );
};

import { ComponentType } from "react";
import {
  IconBallFootball,
  IconSchool,
  IconBuildingCommunity,
  IconBriefcase,
  IconUsers,
  IconClipboardText
} from "@tabler/icons-react";

export type RoleType = "PARENT" | "AGENT" | "CLUB" | "ACADEMY" | "PLAYER" | "COACH";

export interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  termsAccepted?: boolean;

  // Coach fields
  experience: string;
  license: string;
  formation: string;

  // Player fields
  dob: string;
  position: string;
  height: string;
  weight: string;
  currentClub: string;

  // Academy fields
  academyName: string;
  location?: string;
  academyLocation?: string;
  registrationId?: string;
  academyLicense?: string;
  estimatedAcademySize?: string;
  academySize?: string;

  // Club fields
  clubName: string;
  title: string;
  leagueTier: string;
  country: string;
  repTitle?: string;
  clubCountry?: string;

  // Agent fields
  agentLicense?: string;
  fifaLicenseNumber?: string;
  agencyName: string;
  agentCountry?: string;
  countryOfOperation?: string;

  // Parent fields
  childName: string;
  childEmail: string;
  relationship: string;
}

export interface RoleInfo {
  id: RoleType;
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
}

export const ROLES_INFO: RoleInfo[] = [
  {
    id: "PLAYER",
    title: "Player",
    subtitle: "Player",
    description: "Create your football CV, track attributes, and showcase matches.",
    icon: IconBallFootball,
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400"
  },
  {
    id: "COACH",
    title: "Coach",
    subtitle: "Coach",
    description: "Build CV, manage formations, evaluate players, and create reports.",
    icon: IconClipboardText,
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400"
  },
  {
    id: "ACADEMY",
    title: "Academy",
    subtitle: "Academy",
    description: "Manage players, training sessions, coaches, and tournaments.",
    icon: IconSchool,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400"
  },
  {
    id: "CLUB",
    title: "Club",
    subtitle: "Club",
    description: "Search talent, scout candidates, and shortlist players.",
    icon: IconBuildingCommunity,
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400"
  },
  {
    id: "AGENT",
    title: "Agent / Intermediary",
    subtitle: "Agent",
    description: "FIFA/FA licensed scouting and talent management.",
    icon: IconBriefcase,
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400"
  },
  {
    id: "PARENT",
    title: "Parent / Guardian",
    subtitle: "Parent",
    description: "Manage youth profiles, track development, and submit match stats.",
    icon: IconUsers,
    color: "from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400"
  }
];

export const phoneRegex = /^\+?\d{1,14}$/;

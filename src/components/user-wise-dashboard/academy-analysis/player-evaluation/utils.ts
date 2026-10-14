/* eslint-disable @typescript-eslint/no-explicit-any */
import { EvaluationData } from "@/redux/features/evaluation/evaluationSlice";

export const technicalKeys: (keyof EvaluationData)[] = [
  "dribbling", "ballMastery", "runningWithBall", "rangePassing",
  "strikingFinishing", "defending", "firstTouch", "nonDominantFoot"
];

export const physicalKeys: (keyof EvaluationData)[] = [
  "speedAcceleration", "movement", "balance", "power", "strength", "agility", "coordination"
];

export const mentalKeys: (keyof EvaluationData)[] = [
  "gameAwareness", "gamesUnderstanding", "decisionMaking", "concentration", "leadership", "desire", "maturity"
];

export const DEFAULT_EVALUATION: EvaluationData = {
  dribbling: 2,
  ballMastery: 2,
  runningWithBall: 2,
  rangePassing: 2,
  strikingFinishing: 2,
  defending: 2,
  firstTouch: 2,
  nonDominantFoot: 2,
  gameAwareness: 2,
  gamesUnderstanding: 2,
  decisionMaking: 2,
  concentration: 2,
  leadership: 2,
  desire: 2,
  maturity: 2,
  speedAcceleration: 2,
  movement: 2,
  balance: 2,
  power: 2,
  strength: 2,
  agility: 2,
  coordination: 2,
};

export const getPlayerTag = (player: any) => {
  if (player.fullName === "Marcus Silva") return "U-15";
  if (player.fullName === "Sarah Williams") return "U-16";
  if (player.fullName === "David Chen") return "U-17";
  if (player.fullName === "Alex Jonson" || player.fullName === "Alex Jordan") return "U-17";
  if (player.fullName === "James Brown") return "U-19";
  const ageNum = parseInt(player.age);
  if (!isNaN(ageNum)) {
    return `U-${ageNum}`;
  }
  return "U-15";
};

export const mockCards = [
  { id: 101, tag: "U-15", name: "Marcus Silva", date: "Jan 25, 2026", coach: "John Smith", rating: 7.2, tech: 16, phys: 14, ment: 15, pos: "Forward", tier: "TIER 1", btnColor: "text-red-500 bg-red-500" },
  { id: 102, tag: "U-16", name: "Sarah Williams", date: "Jan 25, 2026", coach: "Mike Williams", rating: 8.5, tech: 18, phys: 16, ment: 18, pos: "Midfielder", tier: "TIER 2", btnColor: "text-emerald-500 bg-emerald-500" },
  { id: 103, tag: "U-17", name: "David Chen", date: "Jan 25, 2026", coach: "Sarah Johnson", rating: 7.2, tech: 15, phys: 14, ment: 16, pos: "Midfielder", tier: "TIER 1", btnColor: "text-red-500 bg-red-500" },
  { id: 104, tag: "U-17", name: "Alex Jordan", date: "Jan 25, 2026", coach: "Sarah Johnson", rating: 8.5, tech: 19, phys: 17, ment: 18, pos: "Defender", tier: "TIER 2", btnColor: "text-emerald-500 bg-emerald-500" },
  { id: 105, tag: "U-19", name: "James Brown", date: "Jan 25, 2026", coach: "Mike Williams", rating: 8.5, tech: 18, phys: 15, ment: 17, pos: "Forward", tier: "TIER 1", btnColor: "text-yellow-500 bg-yellow-500" },
  { id: 106, tag: "U-16", name: "Sarah Williams", date: "Jan 25, 2026", coach: "Mike Williams", rating: 7.8, tech: 16, phys: 15, ment: 16, pos: "Midfielder", tier: "TIER 2", btnColor: "text-emerald-500 bg-emerald-500" }
];

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import { IconPlayerPlay, IconPlayerStop } from "@tabler/icons-react";

interface StatInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  colorClass: string;
  align?: "left" | "right";
}

const StatInput = ({ label, value, onChange, colorClass, align = "left" }: StatInputProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5 w-full", align === "right" ? "items-end text-right" : "items-start text-left")}>
      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron">{label}</Label>
      <div className={cn("h-14 w-full rounded-lg relative overflow-hidden shadow-lg", colorClass)}>
        {/* Plus / Minus Buttons */}
        <div className={cn("absolute top-0 bottom-0 flex items-center justify-center w-[65%]", align === "right" ? "right-0" : "left-0")}>
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex-1 h-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-90 transition-all text-3xl md:text-4xl pb-1 font-black font-orbitron cursor-pointer select-none"
          >
            -
          </button>
          <div className="w-px h-5 bg-white/20" />
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex-1 h-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-90 transition-all text-3xl md:text-4xl pb-1 font-black font-orbitron cursor-pointer select-none"
          >
            +
          </button>
        </div>
        <div
          className={cn(
            "absolute top-0 bottom-0 bg-white w-[45%] flex items-center justify-center",
            align === "right" ? "left-0 shadow-[4px_0_10px_rgba(0,0,0,0.1)]" : "right-0 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]"
          )}
          style={{
            clipPath: align === "right"
              ? 'polygon(0 0, 100% 0, 75% 100%, 0% 100%)'
              : 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)'
          }}
        >
          <input
            type="text"
            value={value === 0 ? "0" : value}
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/\D/g, ""), 10);
              onChange(isNaN(val) ? 0 : val);
            }}
            className={cn(
              "h-full w-full bg-transparent border-none text-[#111111] font-black font-orbitron text-[22px] sm:text-2xl focus:outline-none focus:ring-0 text-center",
              align === "right" ? "pr-3 sm:pr-6" : "pl-3 sm:pl-6"
            )}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20" />
      </div>
    </div>
  );
};

export interface PitchLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Default initial stats mapping all 36 keys with legacy fallbacks
export const DEFAULT_FORM_STATS: Record<string, number> = {
  goal: 2,
  assist: 1,
  shotOnTarget: 4,
  shotOffTarget: 1,
  bigChanceCreated: 2,
  bigChanceMissed: 0,
  successfulDribble: 3,
  failedDribble: 1,
  penaltyWon: 1,
  penaltyMissed: 0,

  completedPass: 28,
  incompletePass: 4,
  keyPass: 3,
  throughBallCompleted: 2,
  longPassCompleted: 3,
  crossCompleted: 2,
  crossFailed: 1,

  ballRetention: 5,
  turnover: 2,
  freeKickWon: 3,
  successfulCarry: 4,

  tackleWon: 3,
  tackleLost: 1,
  interception: 2,
  clearance: 1,
  block: 1,
  aerialDuelWon: 2,
  aerialDuelLost: 1,
  groundDuelWon: 4,
  groundDuelLost: 2,
  recovery: 3,
  defensiveError: 0,
  errorLeadingToGoal: 0,

  foulCommitted: 1,
  yellowCard: 0,
  redCard: 0,

  // Goalkeeper Specific stats
  save: 10,
  bigSave: 2,
  goalConceded: 1,
  cleanSheet: 0,
  crossClaimed: 5,
  crossMissed: 1,
  oneOnOneSave: 3,
  distributionCompleted: 15,
  distributionFailed: 3,

  // Legacy aliases
  shotsOnGoal: 4,
  goalScored: 2,
  assists: 1,
  passAccurate: 28,
  wrongPass: 4,
  penaltiesTaken: 1,
  standTackle: 3,
  slidingTackle: 3,
  fault: 1,
  appearances: 15,
  savesAccurate: 10,
  freeKick: 3,
  cornerKick: 4,
  goalUnsave: 1,
  penaltiesSaves: 1,
  punching: 5,
  handling: 10,
  reflex: 1,
  aerialAbility: 5,
  throwing: 8,
  reactions: 1,
};

// Outfield slides (3 slides, 12 stats each = 36 stats)
export const OUTFIELD_SLIDES = [
  // Slide 1 (12 items)
  [
    { label: "Shot on Target", key: "shotOnTarget", color: "bg-[#00D1FF]" },
    { label: "Shot off Target", key: "shotOffTarget", color: "bg-[#C084FC]" },
    { label: "Big Chance Created", key: "bigChanceCreated", color: "bg-[#2DD4BF]" },
    { label: "Big Chance Missed", key: "bigChanceMissed", color: "bg-[#EF4444]" },
    { label: "Successful Dribble", key: "successfulDribble", color: "bg-[#F59E0B]" },
    { label: "Completed Pass", key: "completedPass", color: "bg-[#00D1FF]" },
    { label: "Incomplete Pass", key: "incompletePass", color: "bg-[#C084FC]" },
    { label: "Key Pass", key: "keyPass", color: "bg-[#8B5CF6]" },
    { label: "Interception", key: "interception", color: "bg-[#F59E0B]" },
    { label: "Block", key: "block", color: "bg-[#00D1FF]" },
    { label: "Ground Duel Won", key: "groundDuelWon", color: "bg-[#2DD4BF]" },
    { label: "Ground Duel Lost", key: "groundDuelLost", color: "bg-[#EF4444]" },
  ],
  // Slide 2 (12 items)
  [
    { label: "Goal", key: "goal", color: "bg-[#8B5CF6]" },
    { label: "Assist", key: "assist", color: "bg-[#2DD4BF]" },
    { label: "Failed Dribble", key: "failedDribble", color: "bg-[#EF4444]" },
    { label: "Penalty Won", key: "penaltyWon", color: "bg-[#4ADE80]" },
    { label: "Through Ball Completed", key: "throughBallCompleted", color: "bg-[#00D1FF]" },
    { label: "Long Pass Completed", key: "longPassCompleted", color: "bg-[#F59E0B]" },
    { label: "Cross Completed", key: "crossCompleted", color: "bg-[#4ADE80]" },
    { label: "Cross Failed", key: "crossFailed", color: "bg-[#EF4444]" },
    { label: "Ball Retention Under Pressure", key: "ballRetention", color: "bg-[#B48A14]" },
    { label: "Successful Carry", key: "successfulCarry", color: "bg-[#2DD4BF]" },
    { label: "Tackle Won", key: "tackleWon", color: "bg-[#4ADE80]" },
    { label: "Tackle Lost", key: "tackleLost", color: "bg-[#EF4444]" },
  ],
  // Slide 3 (12 items)
  [
    { label: "Penalty Missed", key: "penaltyMissed", color: "bg-[#EF4444]" },
    { label: "Turnover / Possession Lost", key: "turnover", color: "bg-[#EF4444]" },
    { label: "Fouled / Free Kick Won", key: "freeKickWon", color: "bg-[#B48A14]" },
    { label: "Clearance", key: "clearance", color: "bg-[#4ADE80]" },
    { label: "Aerial Duel Won", key: "aerialDuelWon", color: "bg-[#8B5CF6]" },
    { label: "Aerial Duel Lost", key: "aerialDuelLost", color: "bg-[#C084FC]" },
    { label: "Recovery", key: "recovery", color: "bg-[#F59E0B]" },
    { label: "Defensive Error", key: "defensiveError", color: "bg-[#EF4444]" },
    { label: "Error Leading to Goal", key: "errorLeadingToGoal", color: "bg-[#EF4444]" },
    { label: "Foul Committed", key: "foulCommitted", color: "bg-[#EF4444]" },
    { label: "Yellow Card", key: "yellowCard", color: "bg-[#F59E0B]" },
    { label: "Red Card", key: "redCard", color: "bg-[#EF4444]" },
  ],
];

// Goalkeeper Specific Slide 1 (12 GK items - image 1)
export const GK_SLIDE_1 = [
  { label: "Save", key: "save", color: "bg-[#00D1FF]" },
  { label: "Big Save", key: "bigSave", color: "bg-[#4ADE80]" },
  { label: "Goal Conceded", key: "goalConceded", color: "bg-[#EF4444]" },
  { label: "Clean Sheet", key: "cleanSheet", color: "bg-[#2DD4BF]" },
  { label: "Cross Claimed", key: "crossClaimed", color: "bg-[#8B5CF6]" },
  { label: "Cross Missed", key: "crossMissed", color: "bg-[#EF4444]" },
  { label: "1v1 Save", key: "oneOnOneSave", color: "bg-[#4ADE80]" },
  { label: "Distribution Completed", key: "distributionCompleted", color: "bg-[#00D1FF]" },
  { label: "Distribution Failed", key: "distributionFailed", color: "bg-[#EF4444]" },
  { label: "Foul Committed", key: "foulCommitted", color: "bg-[#EF4444]" },
  { label: "Yellow Card", key: "yellowCard", color: "bg-[#F59E0B]" },
  { label: "Red Card", key: "redCard", color: "bg-[#EF4444]" },
];

// Goalkeeper Specific Slide 4 (9 items: Slide 3 items except Foul Committed, Yellow Card, Red Card which are on Slide 1)
export const GK_SLIDE_4 = [
  { label: "Penalty Missed", key: "penaltyMissed", color: "bg-[#EF4444]" },
  { label: "Turnover / Possession Lost", key: "turnover", color: "bg-[#EF4444]" },
  { label: "Fouled / Free Kick Won", key: "freeKickWon", color: "bg-[#B48A14]" },
  { label: "Clearance", key: "clearance", color: "bg-[#4ADE80]" },
  { label: "Aerial Duel Won", key: "aerialDuelWon", color: "bg-[#8B5CF6]" },
  { label: "Aerial Duel Lost", key: "aerialDuelLost", color: "bg-[#C084FC]" },
  { label: "Recovery", key: "recovery", color: "bg-[#F59E0B]" },
  { label: "Defensive Error", key: "defensiveError", color: "bg-[#EF4444]" },
  { label: "Error Leading to Goal", key: "errorLeadingToGoal", color: "bg-[#EF4444]" },
];

interface MatchStatisticsFormProps {
  position: string;
  minutesPlayed: string;
  setMinutesPlayed: (val: string) => void;
  stats: Record<string, number>;
  setStats: (stats: Record<string, number>) => void;
  goalMarkers: { x: number; y: number }[];
  setGoalMarkers: (markers: { x: number; y: number }[]) => void;
  pitchMarkers: PitchLine[];
  setPitchMarkers: (markers: PitchLine[]) => void;
  coachFeedback?: string;
  setCoachFeedback?: (val: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const MatchStatisticsForm = ({
  position,
  minutesPlayed,
  setMinutesPlayed,
  stats,
  setStats,
  goalMarkers,
  setGoalMarkers,
  pitchMarkers,
  setPitchMarkers,
  coachFeedback,
  setCoachFeedback,
  onCancel,
  onSubmit
}: MatchStatisticsFormProps) => {
  const searchParams = useSearchParams();
  const urlPosition = searchParams?.get("position");
  const effectivePosition = (urlPosition || position || "").trim().toUpperCase();
  const isGK = effectivePosition === "GOALKEEPER" || effectivePosition === "GK";
  const activeSlides = React.useMemo(
    () => (isGK ? [GK_SLIDE_1, OUTFIELD_SLIDES[0], OUTFIELD_SLIDES[1], GK_SLIDE_4] : OUTFIELD_SLIDES),
    [isGK]
  );
  const maxPages = activeSlides.length;

  const [mobilePage, setMobilePage] = React.useState(0);

  // If position switches, ensure mobilePage does not exceed maxPages
  React.useEffect(() => {
    if (mobilePage >= maxPages) {
      setMobilePage(Math.max(0, maxPages - 1));
    }
  }, [maxPages, mobilePage]);
  const parseTimeToSeconds = (val: string): number => {
    if (!val) return 0;
    if (typeof val === "string" && val.includes(":")) {
      const parts = val.split(":");
      const m = parseInt(parts[0], 10) || 0;
      const s = parseInt(parts[1], 10) || 0;
      const total = m * 60 + s;
      return total >= 0 ? total : 0;
    }
    const mins = parseInt(val, 10);
    return isNaN(mins) || mins < 0 ? 0 : mins * 60;
  };

  const formatTime = (totalSeconds: number) => {
    const safeSecs = isNaN(totalSeconds) || totalSeconds < 0 ? 0 : totalSeconds;
    const m = Math.floor(safeSecs / 60).toString().padStart(2, '0');
    const s = (safeSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [secondsElapsed, setSecondsElapsed] = React.useState(() => parseTimeToSeconds(minutesPlayed));
  const secondsRef = React.useRef(secondsElapsed);
  secondsRef.current = secondsElapsed;
  const [rawInput, setRawInput] = React.useState<string>(() => formatTime(secondsElapsed));
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    const hasSeen = localStorage.getItem("k10_game_report_onboarding");
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("k10_game_report_onboarding", "true");
  };

  React.useEffect(() => {
    if (!isTimerRunning) {
      const secs = parseTimeToSeconds(minutesPlayed);
      setSecondsElapsed(secs);
      secondsRef.current = secs;
      setRawInput(formatTime(secs));
    }
  }, [minutesPlayed, isTimerRunning]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const nextSecs = prev + 1;
          secondsRef.current = nextSecs;
          setRawInput(formatTime(nextSecs));
          return nextSecs;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const touchStartX = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      setMobilePage(prev => Math.min(maxPages - 1, prev + 1));
    } else if (diff < -40) {
      setMobilePage(prev => Math.max(0, prev - 1));
    }
    touchStartX.current = null;
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      const formatted = formatTime(secondsRef.current);
      setRawInput(formatted);
      setMinutesPlayed(formatted);
    }
    setIsTimerRunning(prev => !prev);
  };

  const sanitizeTimeInput = (val: string): { display: string; totalSeconds: number } => {
    // Keep only digits and colon
    let cleaned = val.replace(/[^\d:]/g, "");

    // Only allow at most one colon
    const colonCount = (cleaned.match(/:/g) || []).length;
    if (colonCount > 1) {
      const firstColon = cleaned.indexOf(":");
      cleaned = cleaned.slice(0, firstColon + 1) + cleaned.slice(firstColon + 1).replace(/:/g, "");
    }

    if (cleaned.includes(":")) {
      let [mStr, sStr] = cleaned.split(":");
      // Minutes: max 3 digits (up to 130 minutes)
      mStr = mStr.slice(0, 3);
      let m = parseInt(mStr, 10);
      if (!isNaN(m) && m > 130) {
        m = 130;
        mStr = "130";
      }

      // Seconds: strictly max 2 digits (up to 59 seconds)
      sStr = sStr.slice(0, 2);
      let s = parseInt(sStr, 10);
      if (!isNaN(s) && s > 59) {
        s = 59;
        sStr = "59";
      }

      const display = `${mStr}:${sStr}`;
      const totalSeconds = (isNaN(m) ? 0 : m) * 60 + (isNaN(s) ? 0 : s);
      return { display, totalSeconds };
    }

    // No colon typed yet
    // If user types 4 digits e.g. "0900" -> auto format to "09:00"
    if (cleaned.length >= 4) {
      let mStr = cleaned.slice(0, cleaned.length - 2).slice(0, 3);
      let sStr = cleaned.slice(-2);
      let m = parseInt(mStr, 10) || 0;
      if (m > 130) {
        m = 130;
        mStr = "130";
      }
      let s = parseInt(sStr, 10) || 0;
      if (s > 59) {
        s = 59;
        sStr = "59";
      }
      const display = `${mStr}:${sStr}`;
      return { display, totalSeconds: m * 60 + s };
    }

    // 1 to 3 digits without colon
    let mStr = cleaned.slice(0, 3);
    let m = parseInt(mStr, 10);
    if (!isNaN(m) && m > 130) {
      m = 130;
      mStr = "130";
    }
    const totalSeconds = isNaN(m) ? 0 : m * 60;
    return { display: mStr, totalSeconds };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }
    const { display, totalSeconds } = sanitizeTimeInput(e.target.value);
    setRawInput(display);
    setSecondsElapsed(totalSeconds);
    secondsRef.current = totalSeconds;
    setMinutesPlayed(formatTime(totalSeconds));
  };

  const handleInputBlur = () => {
    const formatted = formatTime(secondsRef.current);
    setRawInput(formatted);
    setMinutesPlayed(formatted);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  const statsLeft = activeSlides.flatMap(slide => slide.filter((_, idx) => idx % 2 === 0));
  const statsRight = activeSlides.flatMap(slide => slide.filter((_, idx) => idx % 2 !== 0));

  // Load default stats if empty
  useEffect(() => {
    if (Object.keys(stats).length === 0) {
      setStats(DEFAULT_FORM_STATS);
      setGoalMarkers([{ x: 15.2, y: 28.4 }, { x: 84.6, y: 22.1 }]);
      setPitchMarkers([{ x1: 45.0, y1: 70.0, x2: 50.0, y2: 55.0 }]);
    }
  }, [stats, setStats, setGoalMarkers, setPitchMarkers]);

  const handleStatChange = (key: string, val: number) => {
    const updated = { ...stats, [key]: val };
    // Synchronize legacy aliases
    if (key === "goal") updated.goalScored = val;
    if (key === "assist") updated.assists = val;
    if (key === "shotOnTarget") updated.shotsOnGoal = val;
    if (key === "completedPass") updated.passAccurate = val;
    if (key === "incompletePass") updated.wrongPass = val;
    if (key === "foulCommitted") updated.fault = val;
    if (key === "tackleWon") updated.standTackle = val;
    if (key === "freeKickWon") updated.freeKick = val;
    if (key === "save") updated.savesAccurate = val;
    if (key === "goalConceded") updated.goalUnsave = val;
    setStats(updated);
  };

  const handleGoalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // Add marker, max 10 markers
    if (goalMarkers.length < 10) {
      setGoalMarkers([...goalMarkers, { x, y }]);
    }
  };

  const removeGoalMarker = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGoalMarkers(goalMarkers.filter((_, idx) => idx !== index));
  };

  const [isDrawing, setIsDrawing] = React.useState(false);
  const [currentLine, setCurrentLine] = React.useState<PitchLine | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDrawing(true);
    setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentLine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setCurrentLine({ ...currentLine, x2: x, y2: y });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentLine) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDrawing(false);

    let finalLine = { ...currentLine };
    const dx = finalLine.x2 - finalLine.x1;
    const dy = finalLine.y2 - finalLine.y1;
    if (Math.sqrt(dx * dx + dy * dy) < 2) {
      // It was just a single click/tap, create a clear forward assist pass arrow
      finalLine.x2 = Math.min(92, Math.max(8, finalLine.x1 + 6));
      finalLine.y2 = Math.max(8, finalLine.y1 - 16);
    }

    if (pitchMarkers.length < 15) {
      setPitchMarkers([...pitchMarkers, finalLine]);
    } else {
      toast.error("You can add a maximum of 15 markers.");
    }
    setCurrentLine(null);
  };

  const removePitchMarker = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setPitchMarkers(pitchMarkers.filter((_, idx) => idx !== index));
  };

  const renderLeftStats = (align: "left" | "right" = "left") => statsLeft.map(s => (
    <StatInput key={s.key} label={s.label} value={stats[s.key] || 0} onChange={(val) => handleStatChange(s.key, val)} colorClass={s.color} align={align} />
  ));

  const renderRightStats = (align: "left" | "right" = "right") => statsRight.map(s => (
    <StatInput key={s.key} label={s.label} value={stats[s.key] || 0} onChange={(val) => handleStatChange(s.key, val)} colorClass={s.color} align={align} />
  ));

  const renderGoalDiagram = () => (
    <div className="bg-[#121212]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="bg-white/5 py-3.5 px-6 text-center border-b border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-orbitron">
          {isGK ? "Accurate Save" : "Accurate Shots"}
        </span>
        <button
          onClick={() => setGoalMarkers([])}
          className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors font-orbitron cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div
        onClick={handleGoalClick}
        className="relative cursor-crosshair overflow-hidden group select-none bg-black w-full"
      >
        <Image
          src="/goal-bar.png"
          alt="Goal"
          draggable={false}
          className="w-full h-auto transition-opacity pointer-events-none select-none block scale-[1.25] origin-[50%_90%]"
          width={500}
          height={500}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
          <span className="text-white text-xs font-semibold uppercase tracking-widest font-orbitron">Click Goal to Place Marker</span>
        </div>
        {goalMarkers.map((marker, idx) => (
          <div
            key={idx}
            onClick={(e) => removeGoalMarker(idx, e)}
            className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center hover:scale-125 transition-all cursor-pointer animate-in zoom-in duration-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            title="Click to remove"
          >
            <span className="text-2xl select-none leading-none">{isGK ? "🧤" : "⚽"}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPitchDiagram = (idPrefix = "main") => (
    <div className="bg-[#121212]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="bg-white/5 py-3.5 px-6 text-center border-b border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-orbitron">
          {isGK ? "Accurate Saves" : "Accurate Assist"}
        </span>
        <button
          onClick={() => setPitchMarkers([])}
          className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors font-orbitron cursor-pointer"
        >
          Clear
        </button>
      </div>
      <div className="w-full relative">
        {showOnboarding && (
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 bg-[#8B5CF6] rounded-xl p-4 shadow-2xl z-50 animate-in fade-in zoom-in border border-white/20">
            <div className="flex justify-between items-start gap-2 mb-2">
              <h4 className="text-white font-bold font-orbitron text-sm uppercase tracking-wider">How to use Pitch</h4>
              <button onClick={dismissOnboarding} className="text-white/70 hover:text-white p-1 -m-1 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p className="text-white/90 text-xs leading-relaxed font-medium">
              Press and slide down on the pitch to draw movement arrows. Tap once to place a simple marker!
            </p>
          </div>
        )}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative cursor-crosshair overflow-hidden group select-none w-full h-auto mx-auto max-w-125"
          style={{ touchAction: 'none', aspectRatio: '500/700' }}
        >
          {/* Pitch for all devices (Vertical to match PDF exactly) */}
          <Image
            src="/field.png"
            alt="Football Pitch"
            draggable={false}
            className="w-full h-full object-cover transition-opacity pointer-events-none select-none block"
            width={500}
            height={700}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
            <span className="text-white text-xs font-semibold uppercase tracking-widest font-orbitron">Drag on Pitch to draw an arrow</span>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <marker id={`arrowhead-${idPrefix}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <polygon points="0 0, 5 2.5, 0 5" fill="black" />
              </marker>
              <filter id={`shadow-${idPrefix}`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="rgba(255,255,255,0.7)" />
              </filter>
            </defs>
            {pitchMarkers.map((line, idx) => {
              const dx = line.x2 - line.x1;
              const dy = line.y2 - line.y1;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 1) return null;
              return (
                <line
                  key={idx}
                  x1={`${line.x1}%`}
                  y1={`${line.y1}%`}
                  x2={`${line.x2}%`}
                  y2={`${line.y2}%`}
                  stroke="black"
                  strokeWidth="3.5"
                  markerEnd={`url(#arrowhead-${idPrefix})`}
                  strokeLinecap="round"
                  filter={`url(#shadow-${idPrefix})`}
                />
              );
            })}
            {currentLine && Math.sqrt(Math.pow(currentLine.x2 - currentLine.x1, 2) + Math.pow(currentLine.y2 - currentLine.y1, 2)) > 1 && (
              <line
                x1={`${currentLine.x1}%`}
                y1={`${currentLine.y1}%`}
                x2={`${currentLine.x2}%`}
                y2={`${currentLine.y2}%`}
                stroke="black"
                strokeWidth="3.5"
                markerEnd={`url(#arrowhead-${idPrefix})`}
                strokeLinecap="round"
                filter={`url(#shadow-${idPrefix})`}
                opacity="0.8"
              />
            )}
          </svg>

          {pitchMarkers.map((line, idx) => (
            <div
              key={idx}
              onPointerDown={(e) => { e.stopPropagation(); removePitchMarker(idx, e as any); }}
              className="absolute -ml-3.5 -mt-3.5 w-7 h-7 flex items-center justify-center hover:scale-125 transition-all cursor-pointer animate-in zoom-in duration-200 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ left: `${line.x1}%`, top: `${line.y1}%` }}
              title="Click to remove"
            >
              <span className="text-xl select-none leading-none pointer-events-none">⚽</span>
            </div>
          ))}

          {currentLine && (
            <div
              className="absolute -ml-3.5 -mt-3.5 w-7 h-7 flex items-center justify-center z-30 opacity-70 pointer-events-none"
              style={{ left: `${currentLine.x1}%`, top: `${currentLine.y1}%` }}
            >
              <span className="text-xl select-none leading-none">⚽</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col px-0 gap-8 pb-10 animate-in fade-in duration-500">
      <div className="relative">
        <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">Create Game Reports</h1>
        <div className="relative w-fit">
          <p className="text-white/60 font-medium mt-2 text-sm sm:text-base md:text-lg">
            Create Professional Football Player Game Reports
          </p>
          
          {showOnboarding && (
            <div className="absolute top-full left-0 mt-3 w-72 bg-[#8B5CF6] rounded-xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 border border-white/20">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="text-white font-bold font-orbitron text-sm uppercase tracking-wider">Getting Started</h4>
                <button onClick={dismissOnboarding} className="text-white/70 hover:text-white p-1 -m-1 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <p className="text-white/90 text-xs leading-relaxed font-medium">
                Welcome! Add stats using the + and - buttons, run the timer during the game, and use the interactive diagrams below to record actions.
              </p>
              <div className="absolute -top-2 left-6 w-4 h-4 bg-[#8B5CF6] rotate-45 border-l border-t border-white/20" />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0A0A0A] py-4 sm:px-8 sm:py-8 md:px-12 flex flex-col gap-10 relative overflow-hidden shadow-2xl">
        <div className="relative w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="bg-linear-to-r from-[#00A3FF] to-[#0066FF] font-orbitron text-white w-full py-4 px-2 sm:px-4 rounded-xl font-black uppercase tracking-widest sm:tracking-[0.4em] shadow-[0_0_40px_rgba(0,163,255,0.3)] text-center border border-white/20 text-sm sm:text-lg italic flex-1">
            Match Statistics
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 border border-white/10 shrink-0 shadow-lg">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-orbitron">
                Minutes Played
              </span>
              <input
                type="text"
                value={rawInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                maxLength={6}
                className="text-xl sm:text-3xl font-black text-white font-orbitron w-28 sm:w-36 text-center italic tracking-wider bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-[#00FF62] rounded px-1 transition-colors hover:bg-white/5 cursor-text"
                placeholder="00:00"
                title="Enter minutes:seconds (mm:ss) or start timer"
              />
            </div>
            <button
              type="button"
              onClick={toggleTimer}
              title={isTimerRunning ? "Pause timer" : "Start timer"}
              className={cn(
                "flex items-center justify-center size-10 sm:size-12 rounded-full text-black transition-all hover:scale-105 active:scale-95 shrink-0",
                isTimerRunning
                  ? "bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "bg-[#00FF62] hover:bg-[#00D150] shadow-[0_0_20px_rgba(0,255,98,0.3)]"
              )}
            >
              {isTimerRunning ? <IconPlayerStop size={22} fill="currentColor" /> : <IconPlayerPlay size={22} fill="currentColor" />}
            </button>
          </div>
        </div>

        {/* ---------------- MOBILE LAYOUT: STACKED ---------------- */}
        <div className="lg:hidden flex flex-col gap-10 w-full pt-4">
          <div
            className="grid grid-cols-2 landscape:grid-cols-3 gap-3 sm:gap-4 touch-pan-y select-none transition-all duration-300"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {activeSlides[mobilePage]?.map((s) => (
              <StatInput
                key={s.key}
                label={s.label}
                value={stats[s.key] || 0}
                onChange={(val) => handleStatChange(s.key, val)}
                colorClass={s.color}
                align="left"
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 bg-white/5 rounded-full p-2 mx-auto -mt-4">
            <button
              onClick={() => setMobilePage(Math.max(0, mobilePage - 1))}
              disabled={mobilePage === 0}
              className={cn("p-2 rounded-full transition-all text-white", mobilePage === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 active:scale-95 cursor-pointer")}
              title="Previous Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="flex items-center gap-2.5">
              {activeSlides.map((_, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setMobilePage(pIdx)}
                  title={`Slide ${pIdx + 1}`}
                  className={cn(
                    "size-2 rounded-full transition-all cursor-pointer",
                    mobilePage === pIdx
                      ? "bg-[#00FF62] scale-125 shadow-[0_0_10px_#00FF62]"
                      : "bg-white/30 hover:bg-white/50"
                  )}
                />
              ))}
            </div>
            <button
              onClick={() => setMobilePage(Math.min(maxPages - 1, mobilePage + 1))}
              disabled={mobilePage >= maxPages - 1}
              className={cn("p-2 rounded-full transition-all text-white", mobilePage >= maxPages - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 active:scale-95 cursor-pointer")}
              title="Next Page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="flex flex-col gap-8 w-full">
            {renderGoalDiagram()}
            {renderPitchDiagram("mobile")}
          </div>
        </div>
        {/* -------------------------------------------------------- */}

        {/* ---------------- DESKTOP LAYOUT ------------------------ */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-175">
            <div className="lg:col-span-3 flex flex-col gap-4 z-20">
              {renderLeftStats()}
            </div>

            <div className="hidden lg:flex lg:col-span-6 justify-center items-center h-full relative min-h-125 sticky top-28 self-start">
              {isGK ? (
                <Image
                  src="/mini__GP15525.webp"
                  alt="Goalkeeper"
                  className="h-130 object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                  width={500}
                  height={500}
                  onError={(e) => {
                    e.currentTarget.src = "/pngegg.png";
                  }}
                />
              ) : (
                <Image
                  src="/sergio-ramos.png"
                  alt="Sergio Ramos"
                  className="h-130 object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                  width={500}
                  height={500}
                  onError={(e) => {
                    e.currentTarget.src = "/ronaldo.png";
                  }}
                />
              )}
            </div>

            <div className="lg:col-span-3 flex flex-col gap-4 z-20 items-end">
              {renderRightStats()}
            </div>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {renderGoalDiagram()}
              {renderPitchDiagram("desktop")}
            </div>
          </div>

          {/* Coach Tactical Feedback Section */}
          <div className="flex flex-col gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <Label className="text-xs font-black text-white uppercase tracking-wider font-orbitron">
                Coach Tactical Feedback & Analysis Notes
              </Label>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Professional evaluation visible in report
              </span>
            </div>
            <textarea
              rows={4}
              value={coachFeedback ?? ""}
              onChange={(e) => setCoachFeedback?.(e.target.value)}
              placeholder="Enter your tactical evaluation, player positioning feedback, and match assessment..."
              className="w-full rounded-xl bg-black/50 border border-white/10 p-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF62]/60 transition-all resize-y"
            />
          </div>
        </div>
        {/* -------------------------------------------------------- */}
      </div>

      <div className="flex gap-3 sm:gap-6 mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-transparent hover:bg-white/5 text-white border border-white/10 h-14 sm:h-16 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all font-orbitron italic"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            const finalSecs = secondsRef.current >= 0 ? secondsRef.current : (secondsElapsed >= 0 ? secondsElapsed : 0);
            setMinutesPlayed(formatTime(finalSecs));
            onSubmit();
          }}
          className="flex-1 bg-[#00FF62] hover:bg-[#00D150] text-black h-14 sm:h-16 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(0,255,98,0.2)] font-orbitron italic"
        >
          Submit Report
        </Button>
      </div>
    </div>
  );
};

export default MatchStatisticsForm;

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect } from "react";
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
  onCancel,
  onSubmit
}: MatchStatisticsFormProps) => {
  const isGK = position === "GOALKEEPER";
  const [mobilePage, setMobilePage] = React.useState(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [secondsElapsed, setSecondsElapsed] = React.useState(Number(minutesPlayed || 0) * 60);
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
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => {
          const newSecs = prev + 1;
          setMinutesPlayed(Math.floor(newSecs / 60).toString());
          return newSecs;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, setMinutesPlayed]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const statsLeft = [
    { label: "Shots on Goal", key: "shotsOnGoal", color: "bg-[#00D1FF]" },
    { label: "Goal Scored", key: "goalScored", color: "bg-[#8B5CF6]" },
    { label: "Assists", key: "assists", color: "bg-[#2DD4BF]" },
    { label: "Pass Accurate", key: "passAccurate", color: "bg-[#F59E0B]" },
    { label: "Wrong Pass", key: "wrongPass", color: "bg-[#C084FC]" },
    { label: "Penalties Taken", key: "penaltiesTaken", color: "bg-[#EF4444]" },
    { label: "Stand Tackle", key: "standTackle", color: "bg-[#B48A14]" },
    { label: "Sliding Tackle", key: "slidingTackle", color: "bg-[#8B5CF6]" },
    { label: "Interception", key: "interception", color: "bg-[#F59E0B]" },
    { label: "Saves Accurate", key: "savesAccurate", color: "bg-[#4ADE80]" },
    { label: "Free Kick", key: "freeKick", color: "bg-[#F59E0B]" },
    { label: "Corner Kick", key: "cornerKick", color: "bg-[#00D1FF]" },
  ];

  const statsRight = [
    { label: "Goal Unsave", key: "goalUnsave", color: "bg-[#8B5CF6]" },
    { label: "Penalties Saves", key: "penaltiesSaves", color: "bg-[#F59E0B]" },
    { label: "Appearances", key: "appearances", color: "bg-[#00D1FF]" },
    { label: "Fault", key: "fault", color: "bg-[#4ADE80]" },
    { label: "Red Card", key: "redCard", color: "bg-[#EF4444]" },
    { label: "Yellow Card", key: "yellowCard", color: "bg-[#F59E0B]" },
    { label: "Punching", key: "punching", color: "bg-[#00D1FF]" },
    { label: "Handling", key: "handling", color: "bg-[#B48A14]" },
    { label: "Reflex", key: "reflex", color: "bg-[#8B5CF6]" },
    { label: "Arial Ability", key: "aerialAbility", color: "bg-[#2DD4BF]" },
    { label: "Throwing", key: "throwing", color: "bg-[#F59E0B]" },
    { label: "Reactions", key: "reactions", color: "bg-[#00D1FF]" },
  ];

  // Load default stats if empty
  useEffect(() => {
    if (Object.keys(stats).length === 0) {
      if (isGK) {
        setStats({
          shotsOnGoal: 0, goalScored: 0, assists: 1, passAccurate: 12, wrongPass: 2, penaltiesTaken: 0,
          standTackle: 0, slidingTackle: 0, interception: 0, savesAccurate: 10, freeKick: 0, cornerKick: 0,
          goalUnsave: 1, penaltiesSaves: 1, appearances: 15, fault: 1, redCard: 0, yellowCard: 1,
          punching: 5, handling: 10, reflex: 1, aerialAbility: 5, throwing: 8, reactions: 1
        });
        setGoalMarkers([{ x: 15, y: 25 }, { x: 85, y: 25 }, { x: 50, y: 50 }]);
        setPitchMarkers([{ x1: 35, y1: 50, x2: 35, y2: 50 }]);
      } else {
        setStats({
          shotsOnGoal: 8, goalScored: 3, assists: 6, passAccurate: 12, wrongPass: 2, penaltiesTaken: 4,
          standTackle: 12, slidingTackle: 12, interception: 2, savesAccurate: 10, freeKick: 12, cornerKick: 4,
          goalUnsave: 1, penaltiesSaves: 1, appearances: 15, fault: 1, redCard: 0, yellowCard: 1,
          punching: 5, handling: 10, reflex: 1, aerialAbility: 5, throwing: 8, reactions: 1
        });
        setGoalMarkers([{ x: 15, y: 25 }, { x: 85, y: 25 }, { x: 50, y: 50 }]);
        setPitchMarkers([{ x1: 50, y1: 50, x2: 50, y2: 50 }]);
      }
    }
  }, [isGK, stats, setStats, setGoalMarkers, setPitchMarkers]);

  const handleStatChange = (key: string, val: number) => {
    setStats({ ...stats, [key]: val });
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
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setIsDrawing(true);
    setCurrentLine({ x1: x, y1: y, x2: x, y2: y });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentLine) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setCurrentLine({ ...currentLine, x2: x, y2: y });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !currentLine) return;
    setIsDrawing(false);

    let finalLine = { ...currentLine };
    const dx = finalLine.x2 - finalLine.x1;
    const dy = finalLine.y2 - finalLine.y1;
    if (Math.sqrt(dx * dx + dy * dy) < 1) {
      // It was just a click, create a default small arrow pointing up-left
      finalLine.x2 = finalLine.x1 - 3;
      finalLine.y2 = finalLine.y1 - 4;
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
          className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors font-orbitron"
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

  const renderPitchDiagram = () => (
    <div className="bg-[#121212]/90 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="bg-white/5 py-3.5 px-6 text-center border-b border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-orbitron">
          {isGK ? "Accurate Saves" : "Accurate Assist"}
        </span>
        <button
          onClick={() => setPitchMarkers([])}
          className="text-[9px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors font-orbitron"
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
          className="relative cursor-crosshair overflow-hidden group select-none bg-[#092b15] w-full h-auto mx-auto max-w-[500px]"
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
          {/* Horizontal pitch for desktop */}
          {/* <Image
            src="/FootballPitch.png"
            alt="Football Pitch Horizontal"
            draggable={false}
            className="w-full h-auto transition-opacity pointer-events-none select-none hidden md:block"
            width={800}
            height={531}
          /> */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
            <span className="text-white text-xs font-semibold uppercase tracking-widest font-orbitron">Drag on Pitch to draw an arrow</span>
          </div>

          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <polygon points="0 0, 5 2.5, 0 5" fill="black" />
              </marker>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="1" floodColor="rgba(255,255,255,0.5)" />
              </filter>
            </defs>
            {pitchMarkers.map((line, idx) => {
              const dx = line.x2 - line.x1;
              const dy = line.y2 - line.y1;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 1) return null;
              return (
                <line key={idx} x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" strokeLinecap="round" filter="url(#shadow)" />
              );
            })}
            {currentLine && Math.sqrt(Math.pow(currentLine.x2 - currentLine.x1, 2) + Math.pow(currentLine.y2 - currentLine.y1, 2)) > 1 && (
              <line x1={`${currentLine.x1}%`} y1={`${currentLine.y1}%`} x2={`${currentLine.x2}%`} y2={`${currentLine.y2}%`} stroke="black" strokeWidth="4" markerEnd="url(#arrowhead)" strokeLinecap="round" filter="url(#shadow)" opacity="0.7" />
            )}
          </svg>

          {pitchMarkers.map((line, idx) => (
            <div
              key={idx}
              onPointerDown={(e) => { e.stopPropagation(); removePitchMarker(idx, e as any); }}
              className="absolute -ml-3 -mt-3 flex items-center justify-center hover:scale-125 transition-all cursor-pointer animate-in zoom-in duration-200 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ left: `${line.x1}%`, top: `${line.y1}%` }}
              title="Click to remove"
            >
              <span className="text-xl select-none leading-none pointer-events-none">⚽</span>
            </div>
          ))}

          {currentLine && (
            <div
              className="absolute -ml-3 -mt-3 flex items-center justify-center z-30 opacity-70 pointer-events-none"
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
        <p className="text-white/60 font-medium mt-2 text-sm sm:text-base md:text-lg w-fit relative">
          Create Professional Football Player Game Reports
          
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
        </p>
      </div>

      <div className="bg-[#0A0A0A] py-4 sm:px-8 sm:py-8 md:px-12 flex flex-col gap-10 relative overflow-hidden shadow-2xl">
        <div className="relative w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="bg-linear-to-r from-[#00A3FF] to-[#0066FF] font-orbitron text-white w-full py-4 px-2 sm:px-4 rounded-xl font-black uppercase tracking-widest sm:tracking-[0.4em] shadow-[0_0_40px_rgba(0,163,255,0.3)] text-center border border-white/20 text-sm sm:text-lg italic flex-1">
            Match Statistics
          </div>
          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-6 py-3 border border-white/10 shrink-0 shadow-lg">
            <span className="text-xl sm:text-3xl font-black text-white font-orbitron min-w-20 sm:min-w-28 text-center italic tracking-widest">
              {formatTime(secondsElapsed)}
            </span>
            <button
              type="button"
              onClick={toggleTimer}
              className={cn(
                "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-black transition-all hover:scale-105 active:scale-95 shrink-0",
                isTimerRunning ? "bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-[#00FF62] hover:bg-[#00D150] shadow-[0_0_20px_rgba(0,255,98,0.3)]"
              )}
            >
              {isTimerRunning ? <IconPlayerStop size={24} fill="currentColor" /> : <IconPlayerPlay size={24} fill="currentColor" />}
            </button>
          </div>
        </div>

        {/* ---------------- MOBILE LAYOUT: STACKED ---------------- */}
        <div className="lg:hidden flex flex-col gap-10 w-full pt-4">
          <div className="grid grid-cols-2 landscape:grid-cols-3 gap-3 sm:gap-4">
            {statsLeft.slice(mobilePage * 6, (mobilePage + 1) * 6).map((s, idx) => {
              const actualIdx = mobilePage * 6 + idx;
              return (
                <React.Fragment key={s.key}>
                  <StatInput label={s.label} value={stats[s.key] || 0} onChange={(val) => handleStatChange(s.key, val)} colorClass={s.color} align="left" />
                  {statsRight[actualIdx] && (
                    <StatInput label={statsRight[actualIdx].label} value={stats[statsRight[actualIdx].key] || 0} onChange={(val) => handleStatChange(statsRight[actualIdx].key, val)} colorClass={statsRight[actualIdx].color} align="left" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-4 bg-white/5 rounded-full p-2 mx-auto -mt-4">
            <button
              onClick={() => setMobilePage(Math.max(0, mobilePage - 1))}
              disabled={mobilePage === 0}
              className={cn("p-2 rounded-full transition-all text-white", mobilePage === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 active:scale-95 cursor-pointer")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <div className="flex gap-2">
              <div className={cn("w-2 h-2 rounded-full transition-all", mobilePage === 0 ? "bg-[#00FF62] scale-125 shadow-[0_0_10px_#00FF62]" : "bg-white/30")} />
              <div className={cn("w-2 h-2 rounded-full transition-all", mobilePage === 1 ? "bg-[#00FF62] scale-125 shadow-[0_0_10px_#00FF62]" : "bg-white/30")} />
            </div>
            <button
              onClick={() => setMobilePage(Math.min(1, mobilePage + 1))}
              disabled={mobilePage === 1}
              className={cn("p-2 rounded-full transition-all text-white", mobilePage === 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10 active:scale-95 cursor-pointer")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>

          <div className="flex flex-col gap-8 w-full">
            {renderGoalDiagram()}
            {renderPitchDiagram()}
          </div>
        </div>
        {/* -------------------------------------------------------- */}

        {/* ---------------- DESKTOP LAYOUT ------------------------ */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-175">
            <div className="lg:col-span-3 flex flex-col gap-4 z-20">
              {renderLeftStats()}
            </div>

            <div className="hidden lg:flex lg:col-span-6 justify-center items-end h-full relative min-h-125">
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
              {renderPitchDiagram()}
            </div>
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
          onClick={onSubmit}
          className="flex-1 bg-[#00FF62] hover:bg-[#00D150] text-black h-14 sm:h-16 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(0,255,98,0.2)] font-orbitron italic"
        >
          Submit Report
        </Button>
      </div>
    </div>
  );
};

export default MatchStatisticsForm;

"use client";
import Image from "next/image";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { IconArrowUpRight } from "@tabler/icons-react";
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
      <div className={cn("h-11 w-full rounded-lg relative overflow-hidden shadow-lg", colorClass)}>
        {/* Plus / Minus Buttons */}
        <div className={cn("absolute top-0 bottom-0 flex items-center justify-center w-[50%]", align === "right" ? "right-0" : "left-0")}>
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="flex-1 h-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-90 transition-all text-xl font-black font-orbitron cursor-pointer select-none"
          >
            -
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex-1 h-full flex items-center justify-center text-white/85 hover:text-white hover:bg-white/10 active:scale-90 transition-all text-xl font-black font-orbitron cursor-pointer select-none"
          >
            +
          </button>
        </div>
        <div 
          className={cn(
            "absolute top-0 bottom-0 bg-white w-[50%] flex items-center justify-center", 
            align === "right" ? "left-0 shadow-[4px_0_10px_rgba(0,0,0,0.1)]" : "right-0 shadow-[-4px_0_10px_rgba(0,0,0,0.1)]"
          )} 
          style={{ 
            clipPath: align === "right" 
              ? 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' 
              : 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' 
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
              "h-full w-full bg-transparent border-none text-[#111111] font-black font-orbitron text-xl focus:outline-none focus:ring-0 text-center",
              align === "right" ? "pr-4" : "pl-4"
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
  const handlePitchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    if (pitchMarkers.length < 15) {
      setPitchMarkers([...pitchMarkers, { x1: x, y1: y, x2: x, y2: y }]);
    } else {
      toast.error("You can add a maximum of 15 markers.");
    }
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
          className="aspect-4/3 landscape:aspect-21/9 lg:aspect-video relative cursor-crosshair overflow-hidden group select-none bg-black"
        >
          <Image
            src="/goal-bar.png" 
            alt="Goal" 
            draggable={false}
            className="w-full h-full object-cover transition-opacity pointer-events-none select-none" 
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
        <div 
          onClick={handlePitchClick}
          className="aspect-4/3 landscape:aspect-21/9 lg:aspect-video relative cursor-crosshair overflow-hidden group select-none bg-[#092b15]"
        >
          <Image
            src="/FootballPitch.png" 
            alt="Football Pitch" 
            draggable={false}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none select-none" 
            width={500}
            height={500}
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
            <span className="text-white text-xs font-semibold uppercase tracking-widest font-orbitron">Click Pitch to Place Marker</span>
          </div>
          <div 
            className={cn(
              "absolute -translate-y-1/2 w-16 h-16 bg-white/10 border border-white/40 rounded-full flex items-center justify-center backdrop-blur-sm pointer-events-none select-none shadow-xl",
              isGK ? "left-[12%] -translate-x-1/2 top-1/2" : "left-1/2 -translate-x-1/2 top-1/2"
            )}
          >
            <span className="text-[7px] font-black text-white text-center leading-none uppercase font-orbitron whitespace-pre-wrap">
              {isGK ? "Accurate\nSaves" : "Accurate\nAssist"}
            </span>
          </div>
          {pitchMarkers.map((line, idx) => (
            <div 
              key={idx} 
              onClick={(e) => removePitchMarker(idx, e)}
              className="absolute w-8 h-8 -ml-4 -mt-4 flex items-center justify-center hover:scale-125 transition-all cursor-pointer animate-in zoom-in duration-200 z-30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ left: `${line.x1}%`, top: `${line.y1}%` }}
              title="Click to remove"
            >
              <span className="text-2xl select-none leading-none">⚽</span>
            </div>
          ))}
        </div>
      </div>
  );
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">Create Game Reports</h1>
        <p className="text-white/60 font-medium mt-2 text-base md:text-lg">Create Professional Football Player Game Reports</p>
      </div>
      <div className="bg-[#0A0A0A] rounded-[40px] border border-white/10 p-8 md:p-12 flex flex-col gap-10 relative overflow-hidden shadow-2xl">
        <div className="relative w-full">
          <div className="bg-linear-to-r from-[#00A3FF] to-[#0066FF] font-orbitron text-white w-full py-4 rounded-xl font-black uppercase tracking-[0.4em] shadow-[0_0_40px_rgba(0,163,255,0.3)] text-center border border-white/20 text-lg italic">
            Match Statistics
          </div>
        </div>
        {/* ---------------- MOBILE LAYOUT: SWIPER ---------------- */}
        <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory w-auto -mx-8 px-8 scroll-smooth hide-scrollbar pb-6 gap-6">
          {/* Page 1: First 12 */}
          <div className="min-w-[85vw] snap-center shrink-0">
            <h3 className="text-white/40 text-center font-orbitron text-xs font-bold uppercase tracking-widest mb-4">Page 1 (Swipe ⬅️)</h3>
            <div className="grid grid-cols-2 landscape:grid-cols-6 gap-2 sm:gap-4">
              {renderLeftStats("left")}
            </div>
          </div>
          {/* Page 2: Next 12 */}
          <div className="min-w-[85vw] snap-center shrink-0">
             <h3 className="text-white/40 text-center font-orbitron text-xs font-bold uppercase tracking-widest mb-4">Page 2 (Swipe ⬅️)</h3>
            <div className="grid grid-cols-2 landscape:grid-cols-6 gap-2 sm:gap-4">
              {renderRightStats("left")}
            </div>
          </div>
          {/* Page 3: Goalpost Diagram */}
          <div className="min-w-[85vw] landscape:min-w-[95vw] lg:min-w-0 snap-center shrink-0">
             <h3 className="text-white/40 text-center font-orbitron text-xs font-bold uppercase tracking-widest mb-4">Page 3 (Swipe ⬅️)</h3>
             {renderGoalDiagram()}
          </div>
          {/* Page 4: Pitch Diagram */}
          <div className="min-w-[85vw] landscape:min-w-[95vw] lg:min-w-0 snap-center shrink-0 pr-4">
             <h3 className="text-white/40 text-center font-orbitron text-xs font-bold uppercase tracking-widest mb-4">Page 4</h3>
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

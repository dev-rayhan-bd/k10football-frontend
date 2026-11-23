/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { 
  IconChevronDown, 
  IconCalendar, 
  IconX,
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconLoader2
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";

/** Normalises stored dates (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, ISO) to YYYY-MM-DD for <input type="date">. */
const toDateInputValue = (raw?: string): string => {
  if (!raw) return "";
  const s = String(raw).trim();
  const ymd = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymd) return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  const dmy = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  return "";
};

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Native date picker styled like the other inputs; clicking anywhere opens the calendar. */
const DateField = ({
  value,
  onChange,
  max,
}: {
  value?: string;
  onChange: (val: string) => void;
  max?: string;
}) => (
  <div className="relative">
    <Input
      type="date"
      max={max}
      value={toDateInputValue(value)}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => {
        try {
          e.currentTarget.showPicker?.();
        } catch {
          // showPicker can throw if not triggered by a user gesture; the native control still works
        }
      }}
      className="bg-[#161616] border-white/10 text-white h-12 pr-12 cursor-pointer [color-scheme:dark] focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-12 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
    />
    <IconCalendar className="pointer-events-none absolute right-4 top-3.5 text-gray-500" size={18} />
  </div>
);

interface ReportDetailsFormProps {
  formData: any;
  setFormData: (data: any) => void;
  characteristics: string[];
  setCharacteristics: (tags: string[]) => void;
  onCancel: () => void;
  onContinue: () => void;
  reportCompletedBy?: "parent" | "coach";
  setReportCompletedBy?: (val: "parent" | "coach") => void;
  selectedCoachEmail?: string;
  setSelectedCoachEmail?: (val: string) => void;
  selectedCoachId?: string;
  setSelectedCoachId?: (val: string) => void;
  coachRequestMode?: "dropdown" | "custom";
  setCoachRequestMode?: (val: "dropdown" | "custom") => void;
  customCoachName?: string;
  setCustomCoachName?: (val: string) => void;
  customCoachEmail?: string;
  setCustomCoachEmail?: (val: string) => void;
  isSubmitting?: boolean;
}

const ReportDetailsForm = ({
  formData,
  setFormData,
  characteristics,
  setCharacteristics,
  onCancel,
  onContinue,
  reportCompletedBy = "parent",
  setReportCompletedBy,
  selectedCoachEmail = "",
  setSelectedCoachEmail,
  selectedCoachId = "",
  setSelectedCoachId,
  coachRequestMode = "dropdown",
  setCoachRequestMode,
  customCoachName = "",
  setCustomCoachName,
  customCoachEmail = "",
  setCustomCoachEmail,
  isSubmitting = false,
}: ReportDetailsFormProps) => {
  const { data: coachesResponse, isLoading: isLoadingCoaches } = useGetAllCoachesQuery({ limit: 100 });
  const coaches = coachesResponse?.data || [];

  const [newTag, setNewTag] = useState("");
  const handleChange = (field: string, val: any) => {
    setFormData({ ...formData, [field]: val });
  };

  const addTag = () => {
    const trimmed = newTag.trim().toUpperCase();
    if (trimmed && !characteristics.includes(trimmed)) {
      setCharacteristics([...characteristics, trimmed]);
      setNewTag("");
    }
  };

  const removeCharacteristic = (tag: string) => {
    setCharacteristics(characteristics.filter(c => c !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const isFormValid = () => {
    const isCoachSelected = coachRequestMode === "custom"
      ? Boolean(customCoachName?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customCoachEmail?.trim() || ""))
      : Boolean(selectedCoachId?.trim() || selectedCoachEmail?.trim());
    return (
      Boolean(formData.playerName?.trim()) &&
      Boolean(formData.dob?.trim()) &&
      Boolean(formData.clubName?.trim()) &&
      Boolean(formData.position?.trim()) &&
      Boolean(formData.foot?.trim()) &&
      Boolean(formData.weight?.trim()) &&
      Boolean(formData.height?.trim()) &&
      Boolean(formData.scoutName?.trim()) &&
      Boolean(formData.gameType?.trim()) &&
      Boolean(formData.gameDate?.trim()) &&
      Boolean(formData.gameLocation?.trim()) &&
      Boolean(formData.ownTeam?.trim()) &&
      Boolean(formData.opponentTeam?.trim()) &&
      Boolean(formData.weather?.trim()) &&
      String(formData.temperature ?? "").trim() !== "" &&
      (reportCompletedBy === "parent" || (reportCompletedBy === "coach" && isCoachSelected))
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic font-orbitron">Create Game Reports</h1>
        <p className="text-gray-500 text-sm italic">Create Professional Football Player Game Reports</p>
      </div>

      {/* Fee Section */}
      <div className="p-6 rounded-2xl bg-[#161616] border border-white/10 flex justify-between items-center shadow-2xl">
        <div className="space-y-1">
          <div className="text-gray-400 text-sm font-medium">Report Fee</div>
          <div className="text-gray-500 text-xs italic">Professional analysis delivered within 48 hours</div>
        </div>
        <div className="text-3xl sm:text-4xl font-black text-[#E31B23] tracking-tighter italic font-orbitron">
          $3.99
        </div>
      </div>

      <div className="space-y-8">
        {/* Player Information */}
        <div className="p-8 rounded-3xl border border-white/10 bg-[#0D0D0D] space-y-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00FF62]/10 border border-[#00FF62] flex items-center justify-center">
              <IconCheck size={18} className="text-[#00FF62]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight font-orbitron">Player Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Player Name:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.playerName}
                onChange={(e) => handleChange("playerName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date of Birth:</Label>
              <DateField
                value={formData.dob}
                max={todayISO()}
                onChange={(val) => handleChange("dob", val)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Club Name:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.clubName}
                onChange={(e) => handleChange("clubName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Position:</Label>
              <div className="relative">
                <select 
                  className="w-full bg-[#161616] border border-white/10 text-white h-12 rounded-lg px-4 uppercase font-bold appearance-none focus:outline-none focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                >
                  <option value="STRIKER">STRIKER</option>
                  <option value="MIDFIELDER">MIDFIELDER</option>
                  <option value="WINGER">WINGER</option>
                  <option value="DEFENDER">DEFENDER</option>
                  <option value="GOALKEEPER">GOALKEEPER</option>
                </select>
                <IconChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Foot:</Label>
              <div className="relative">
                <select 
                  className="w-full bg-[#161616] border border-white/10 text-white h-12 rounded-lg px-4 uppercase font-bold appearance-none focus:outline-none focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                  value={formData.foot}
                  onChange={(e) => handleChange("foot", e.target.value)}
                >
                  <option value="RIGHT">RIGHT</option>
                  <option value="LEFT">LEFT</option>
                  <option value="BOTH">BOTH</option>
                </select>
                <IconChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Characteristic:</Label>
              <div className="bg-[#161616] border border-white/10 rounded-lg min-h-12 px-4 py-2 flex flex-wrap gap-2 items-center">
                {characteristics.map(tag => (
                  <div key={tag} className="flex items-center gap-1 text-[10px] font-black text-white bg-[#0D0D0D] border border-white/10 px-3 py-1 rounded-full group cursor-pointer hover:border-red-500 transition-all font-orbitron">
                    {tag}
                    <IconX size={10} className="text-red-500 cursor-pointer" onClick={() => removeCharacteristic(tag)} />
                  </div>
                ))}
                <input 
                  type="text" 
                  placeholder={characteristics.length === 0 ? "Type & press Enter..." : "+ Add"}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent border-none text-xs font-bold text-white focus:outline-none flex-1 min-w-20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weight:</Label>
              <div className="relative">
                <Input 
                  className="bg-[#161616] border-white/10 text-white h-12 font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                />
                <span className="absolute right-4 top-3.5 text-gray-500 text-xs font-bold font-orbitron">KG</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Height:</Label>
              <div className="relative">
                <Input 
                  className="bg-[#161616] border-white/10 text-white h-12 font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                />
                <span className="absolute right-4 top-3.5 text-gray-500 text-xs font-bold font-orbitron">{parseFloat(formData.height) > 3 ? "CM" : "M"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Match Information */}
        <div className="p-8 rounded-3xl border border-white/10 bg-[#0D0D0D] space-y-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00FF62]/10 border border-[#00FF62] flex items-center justify-center">
              <IconCheck size={18} className="text-[#00FF62]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight font-orbitron">Match Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scout Name:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.scoutName}
                onChange={(e) => handleChange("scoutName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Game Type:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.gameType}
                onChange={(e) => handleChange("gameType", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Game Date:</Label>
              <DateField
                value={formData.gameDate}
                max={todayISO()}
                onChange={(val) => handleChange("gameDate", val)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Game Location:</Label>
              <Input
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                value={formData.gameLocation || ""}
                placeholder="e.g. Stadium / City"
                onChange={(e) => handleChange("gameLocation", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Own Team:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.ownTeam || ""}
                placeholder="e.g. My Club / Team"
                onChange={(e) => handleChange("ownTeam", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opponent Team:</Label>
              <Input 
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                value={formData.opponentTeam || ""}
                placeholder="e.g. Opponent Club / Team"
                onChange={(e) => handleChange("opponentTeam", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scores (Home / Away):</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <Input 
                    type="number"
                    className="bg-[#161616] border-white/10 text-white h-12 font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                    value={formData.homeScore ?? 0}
                    placeholder="Home"
                    onChange={(e) => handleChange("homeScore", parseInt(e.target.value, 10) || 0)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 text-[10px] font-bold uppercase font-orbitron">Home</span>
                </div>
                <div className="relative">
                  <Input 
                    type="number"
                    className="bg-[#161616] border-white/10 text-white h-12 font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]" 
                    value={formData.awayScore ?? 0}
                    placeholder="Away"
                    onChange={(e) => handleChange("awayScore", parseInt(e.target.value, 10) || 0)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 text-[10px] font-bold uppercase font-orbitron">Away</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Weather / Temperature:</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    className="w-full bg-[#161616] border border-white/10 text-white h-12 rounded-lg px-4 pr-10 uppercase font-bold appearance-none focus:outline-none focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                    value={formData.weather || ""}
                    onChange={(e) => handleChange("weather", e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="SUNNY">SUNNY</option>
                    <option value="CLOUDY">CLOUDY</option>
                    <option value="RAINY">RAINY</option>
                    <option value="WINDY">WINDY</option>
                    <option value="SNOWY">SNOWY</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={18} />
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="numeric"
                    className="bg-[#161616] border-white/10 text-white h-12 pr-10 font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                    value={formData.temperature ?? ""}
                    placeholder="Temp"
                    onChange={(e) => handleChange("temperature", e.target.value)}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-500 text-xs font-bold font-orbitron">°C</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Match Result:</Label>
              <Input
                className="bg-[#161616] border-white/10 text-white h-12 uppercase font-bold focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62]"
                value={formData.matchResult || ""}
                placeholder={
                  formData.ownTeam && formData.opponentTeam
                    ? `${formData.ownTeam} ${formData.homeScore ?? 0} X ${formData.awayScore ?? 0} ${formData.opponentTeam}`.toUpperCase()
                    : "e.g. MY TEAM 2 X 1 OPPONENT"
                }
                onChange={(e) => handleChange("matchResult", e.target.value)}
              />
              <p className="text-[10px] text-gray-500">
                Leave empty to use the teams and score above.
              </p>
            </div>
          </div>
        </div>
        {/* Report Completion Selection */}
        {setReportCompletedBy && (
          <div className="p-8 rounded-3xl border border-white/10 bg-[#0D0D0D] flex flex-col gap-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center">
                <IconCheck size={18} className="text-blue-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight font-orbitron">Report Completion</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <label className={cn("flex-1 p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 items-center justify-center text-center", reportCompletedBy === "parent" ? "bg-[#00FF62]/10 border-[#00FF62]" : "bg-[#161616] border-white/10 hover:border-white/30")}>
                <input 
                  type="radio" 
                  name="reportCompletedBy" 
                  value="parent" 
                  checked={reportCompletedBy === "parent"} 
                  onChange={() => setReportCompletedBy("parent")} 
                  className="hidden" 
                />
                <span className="text-sm font-bold text-white uppercase tracking-wider">I will complete it</span>
                <span className="text-xs text-gray-500 italic">Continue to match statistics</span>
              </label>
              <label className={cn("flex-1 p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 items-center justify-center text-center", reportCompletedBy === "coach" ? "bg-[#00FF62]/10 border-[#00FF62]" : "bg-[#161616] border-white/10 hover:border-white/30")}>
                <input 
                  type="radio" 
                  name="reportCompletedBy" 
                  value="coach" 
                  checked={reportCompletedBy === "coach"} 
                  onChange={() => setReportCompletedBy("coach")} 
                  className="hidden" 
                />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Request from Coach</span>
                <span className="text-xs text-gray-500 italic">Send form to coach via email</span>
              </label>
            </div>

            {reportCompletedBy === "coach" && (
              <div className="flex flex-col gap-4 mt-6 p-5 rounded-2xl bg-[#161616]/70 border border-white/10 animate-in fade-in slide-in-from-top-2">
                {/* Method selector tabs */}
                <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-black/50 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setCoachRequestMode?.("dropdown")}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider font-orbitron transition-all cursor-pointer text-center",
                      coachRequestMode === "dropdown"
                        ? "bg-[#00FF62] text-black shadow-md shadow-[#00FF62]/20 font-black"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    1. Select From Coaches Dropdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setCoachRequestMode?.("custom")}
                    className={cn(
                      "flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider font-orbitron transition-all cursor-pointer text-center",
                      coachRequestMode === "custom"
                        ? "bg-[#00FF62] text-black shadow-md shadow-[#00FF62]/20 font-black"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    2. Custom Coach (Name & Email)
                  </button>
                </div>

                {coachRequestMode === "dropdown" ? (
                  <div className="flex flex-col gap-2">
                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron flex items-center gap-1">
                      Select Coach <span className="text-destructive">*</span>:
                    </Label>
                    <div className="relative">
                      <select 
                        className="w-full bg-[#161616] border border-white/10 text-white h-12 rounded-lg px-4 font-bold appearance-none focus:outline-none focus:border-[#00FF62] focus:ring-1 focus:ring-[#00FF62] cursor-pointer"
                        value={selectedCoachId}
                        onChange={(e) => {
                          const selId = e.target.value;
                          setSelectedCoachId?.(selId);
                          const matchedCoach = coaches.find((c: any) => {
                            const cUserId = typeof c.userId === "object" ? c.userId?._id : (c.userId || c._id);
                            return cUserId === selId || c._id === selId;
                          });
                          if (matchedCoach) {
                            const email = typeof matchedCoach.userId === "object" ? matchedCoach.userId?.email : "";
                            const coachName = matchedCoach.fullName || (typeof matchedCoach.userId === "object" ? matchedCoach.userId?.name : "") || "Coach";
                            if (email) setSelectedCoachEmail?.(email);
                            setFormData({
                              ...formData,
                              scoutName: coachName,
                            });
                          }
                        }}
                      >
                        <option value="">
                          {isLoadingCoaches ? "-- LOADING COACHES... --" : "-- SELECT A COACH --"}
                        </option>
                        {coaches.map((coach: any) => {
                          const coachUserId = typeof coach.userId === "object" ? coach.userId?._id : (coach.userId || coach._id);
                          const name = coach.fullName || (typeof coach.userId === "object" ? coach.userId?.name : "") || "Coach";
                          const roleOrClub = coach.title || coach.currentClub || coach.speciality || (typeof coach.userId === "object" ? coach.userId?.email : "") || "";
                          return (
                            <option key={coach._id} value={coachUserId}>
                              {name} {roleOrClub ? `(${roleOrClub})` : ""}
                            </option>
                          );
                        })}
                      </select>
                      <IconChevronDown className="absolute right-4 top-3.5 text-gray-500 pointer-events-none" size={18} />
                    </div>
                    {selectedCoachEmail && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Selected coach email: <span className="text-[#00FF62]">{selectedCoachEmail}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron flex items-center gap-1">
                        Coach Name <span className="text-destructive">*</span>:
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. Pep Guardiola"
                        value={customCoachName}
                        onChange={(e) => setCustomCoachName?.(e.target.value)}
                        className="bg-[#161616] border-white/10 text-white h-12 rounded-lg px-4 font-bold focus:border-[#00FF62]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-orbitron flex items-center gap-1">
                        Coach Email <span className="text-destructive">*</span>:
                      </Label>
                      <Input
                        type="email"
                        placeholder="e.g. rayhanshorker98@gmail.com"
                        value={customCoachEmail}
                        onChange={(e) => setCustomCoachEmail?.(e.target.value)}
                        className="bg-[#161616] border-white/10 text-white h-12 rounded-lg px-4 font-bold focus:border-[#00FF62]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-8">
        <Button 
          variant="outline" 
          className="flex-1 h-14 rounded-xl border-white/10 bg-transparent text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all italic font-orbitron min-w-0"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          className="flex-1 h-14 rounded-xl bg-[#00FF62] hover:bg-[#00D150] text-black font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,98,0.2)] italic font-orbitron disabled:opacity-50 disabled:cursor-not-allowed min-w-0 flex items-center justify-center gap-2"
          onClick={onContinue}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="size-5 animate-spin text-black" />
              <span>Processing...</span>
            </>
          ) : reportCompletedBy === "coach" ? (
            "Request Coach"
          ) : (
            "Continue"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ReportDetailsForm;

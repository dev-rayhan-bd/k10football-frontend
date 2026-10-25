"use client";
import Image from "next/image";

import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { saveEvaluation, EvaluationData } from "@/redux/features/evaluation/evaluationSlice";
import { useGetCoachPlayerEvaluationsQuery } from "@/redux/features/coach/coachApi";
import { ICoachPlayerEvaluationItem } from "@/types/coach.type";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Check,
  Search,
  ArrowLeft,
  Download,
  CheckCircle,
  ClipboardCheck,
  Info,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "@/assets/logo.png";

const DEFAULT_EVALUATION = {
  // Techniques
  dribbling: 2,
  ballMastery: 2,
  runningWithBall: 2,
  rangePassing: 2,
  strikingFinishing: 2,
  defending: 2,
  firstTouch: 2,
  nonDominantFoot: 2,
  // Characteristics
  gameAwareness: 2,
  gamesUnderstanding: 2,
  decisionMaking: 2,
  concentration: 2,
  leadership: 2,
  desire: 2,
  maturity: 2,
  // Physical
  speedAcceleration: 2,
  movement: 2,
  balance: 2,
  power: 2,
  strength: 2,
  agility: 2,
  coordination: 2,
};

export interface EvaluationPlayer {
  id: string;
  _id: string;
  fullName: string;
  name: string;
  position: string;
  rating: number;
  academyName?: string;
  academy?: string;
  playerImage?: string;
  avatar?: string;
  age?: number | string;
  evaluationDate?: string;
  lastEvaluated?: string;
  status?: string;
  raw?: ICoachPlayerEvaluationItem;
}

const PlayerEvaluationPage = () => {
  const dispatch = useAppDispatch();
  // Read persisted evaluation records from the evaluation slice
  const evaluationRecords = useAppSelector((state) => state.evaluation.records);

  const [activeTab, setActiveTab] = useState<"pending" | "evaluated">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<EvaluationPlayer | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationData>(DEFAULT_EVALUATION as EvaluationData);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: evaluationsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetCoachPlayerEvaluationsQuery({
    status: activeTab === "pending" ? "PENDING" : "EVALUATED",
    searchTerm: debouncedSearch.trim() || undefined,
  });

  const summary = evaluationsResponse?.data?.summary;
  const apiPlayers = useMemo(() => evaluationsResponse?.data?.players || [], [evaluationsResponse]);

  const filteredPlayers = useMemo(() => {
    return apiPlayers.filter((player) => {
      // If backend returns players with other status, match active tab
      if (player.status) {
        const expectedStatus = activeTab === "pending" ? "PENDING" : "EVALUATED";
        if (player.status.toUpperCase() !== expectedStatus) {
          return false;
        }
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const nameMatch = player.name?.toLowerCase().includes(term);
      const posMatch = player.position?.toLowerCase().includes(term);
      const academyMatch = player.academy?.toLowerCase().includes(term);
      return Boolean(nameMatch || posMatch || academyMatch);
    });
  }, [apiPlayers, activeTab, searchTerm]);

  const pendingCount = summary?.pendingCount ?? (activeTab === "pending" ? apiPlayers.length : 0);
  const evaluatedCount = summary?.evaluatedCount ?? (activeTab === "evaluated" ? apiPlayers.length : 0);

  const startEvaluation = (player: ICoachPlayerEvaluationItem) => {
    const playerId = player._id || player.id || "";
    const normalizedPlayer: EvaluationPlayer = {
      id: playerId,
      _id: playerId,
      fullName: player.name || "Unknown Player",
      name: player.name || "Unknown Player",
      position: player.position || "N/A",
      rating: player.rating || 0,
      academyName: player.academy || "N/A",
      academy: player.academy || "N/A",
      playerImage: player.avatar || "/placeholder_img.jpg",
      avatar: player.avatar || "/placeholder_img.jpg",
      age: player.age || 18,
      evaluationDate:
        player.lastEvaluated && player.lastEvaluated !== "Pending Review"
          ? player.lastEvaluated
          : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastEvaluated: player.lastEvaluated,
      status: player.status,
      raw: player,
    };

    setSelectedPlayer(normalizedPlayer);
    const saved = evaluationRecords[playerId];
    setEvaluation(saved?.evaluation ?? (DEFAULT_EVALUATION as EvaluationData));
  };

  const handleRatingChange = (key: keyof EvaluationData, value: number) => {
    setEvaluation((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!selectedPlayer) return;

    dispatch(
      saveEvaluation({
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.fullName,
        evaluation,
        date: new Date().toISOString().split("T")[0],
      })
    );

    toast.success(`Evaluation for ${selectedPlayer.fullName} saved successfully!`);
    setSelectedPlayer(null);
    setEvaluation(DEFAULT_EVALUATION as EvaluationData);
  };

  const handleDownloadPDF = async () => {
    const page1 = document.getElementById("evaluation-report-page-1");
    const page2 = document.getElementById("evaluation-report-page-2");
    if (!selectedPlayer || !page1 || !page2) {
      toast.error("Evaluation elements not found in DOM.");
      return;
    }

    const toastId = toast.loading("Generating PDF report... Please wait.");

    // Save original getComputedStyle and create dummy div to convert modern colors (oklch, lab, etc.)
    const originalGetComputedStyle = window.getComputedStyle;
    const dummy = document.createElement("div");
    dummy.style.display = "none";
    document.body.appendChild(dummy);

    const convertModernColor = (value: string) => {
      if (typeof value !== "string") return value;
      if (!value.includes("oklch") && !value.includes("lab") && !value.includes("oklab") && !value.includes("lch")) {
        return value;
      }
      return value.replace(/(oklch|oklab|lab|lch)\([^)]+\)/g, (match) => {
        try {
          dummy.style.color = match;
          const resolved = originalGetComputedStyle(dummy).color;
          if (resolved && (resolved.startsWith("rgb") || resolved.startsWith("#"))) {
            return resolved;
          }
          return "rgb(0, 0, 0)";
        } catch {
          return "rgb(0, 0, 0)";
        }
      });
    };

    // Apply computed style proxy shim
    window.getComputedStyle = function (el, pseudoEl) {
      const style = originalGetComputedStyle(el, pseudoEl);
      return new Proxy(style, {
        get(target, prop) {
          if (prop === "getPropertyValue") {
            return (propertyName: string) => {
              const val = target.getPropertyValue(propertyName);
              return convertModernColor(val);
            };
          }
          if (typeof prop === "string") {
            const targetRecord = target as unknown as Record<string, unknown>;
            const val = targetRecord[prop];
            if (typeof val === "string") {
              return convertModernColor(val);
            }
            if (typeof val === "function") {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
              return (val as Function).bind(target);
            }
            return val;
          }
          const targetRecord = target as unknown as Record<string | symbol, unknown>;
          return targetRecord[prop];
        },
      });
    };

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = 210; // A4 landscape height in mm

      // Capture Page 1
      toast.loading("Rendering Page 1...", { id: toastId });
      let canvas1;
      try {
        canvas1 = await html2canvas(page1, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });
      } catch (err) {
        throw new Error(`Page 1 render failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Capture Page 2
      toast.loading("Rendering Page 2...", { id: toastId });
      let canvas2;
      try {
        canvas2 = await html2canvas(page2, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: "#ffffff",
        });
      } catch (err) {
        throw new Error(`Page 2 render failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      toast.loading("Assembling PDF document...", { id: toastId });
      let imgData1;
      try {
        imgData1 = canvas1.toDataURL("image/png");
      } catch (err) {
        throw new Error(`Page 1 export failed (likely CORS/Taint issue): ${err instanceof Error ? err.message : String(err)}`);
      }

      pdf.addImage(imgData1, "PNG", 0, 0, imgWidth, imgHeight);

      // Add Page 2
      pdf.addPage();
      let imgData2;
      try {
        imgData2 = canvas2.toDataURL("image/png");
      } catch (err) {
        throw new Error(`Page 2 export failed (likely CORS/Taint issue): ${err instanceof Error ? err.message : String(err)}`);
      }
      pdf.addImage(imgData2, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save(`Evaluation_Report_${selectedPlayer.fullName.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("PDF generation failed:", error);
      toast.error(`Failed to generate PDF: ${msg}`, { id: toastId });
    } finally {
      // Restore original getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;
      if (dummy.parentNode) {
        dummy.parentNode.removeChild(dummy);
      }
    }
  };

  // Helper renderer for evaluation radio check dots
  const renderRatingCircle = (
    key: keyof EvaluationData,
    targetVal: number
  ) => {
    const isSelected = evaluation[key] === targetVal;
    let bgColor = "#ffffff";
    if (isSelected) {
      if (targetVal === 1) bgColor = "#2563EB";      // Blue
      else if (targetVal === 2) bgColor = "#EAB308"; // Yellow
      else if (targetVal === 3) bgColor = "#16A34A"; // Green
    } else {
      if (targetVal === 1) bgColor = "#DBEAFE";      // Faded Blue
      else if (targetVal === 2) bgColor = "#FEF9C3"; // Faded Yellow
      else if (targetVal === 3) bgColor = "#DCFCE7"; // Faded Green
    }

    return (
      <div className="w-14 flex justify-center">
        <button
          type="button"
          onClick={() => handleRatingChange(key, targetVal)}
          className={cn(
            "w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer border border-transparent"
          )}
          style={{ backgroundColor: bgColor }}
        >
          {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
        </button>
      </div>
    );
  };

  // Evaluation Details Screen
  if (selectedPlayer) {
    const playerImgSrc = selectedPlayer.playerImage || selectedPlayer.avatar || "/ronaldo.png";

    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSelectedPlayer(null);
              setEvaluation(DEFAULT_EVALUATION);
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 text-xs uppercase font-black tracking-widest cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        {/* Outer container holding report sheets */}
        <div className="flex flex-col items-center w-full gap-8 pb-4">
          {/* Printable Page 1 */}
          <div
            id="evaluation-report-page-1"
            className="w-full max-w-282.5 min-h-150 lg:h-200 bg-white text-black p-6 sm:p-12 rounded-2xl border border-gray-200 relative overflow-hidden flex flex-col justify-between select-none"
          >
            {/* Header Banner Section */}
            <div className="flex justify-between items-center w-full relative z-10">
              {/* Logo Badge */}
              <div className="flex items-center">
                <Image src={logo.src} alt="K10 Football Logo" className="h-10 object-contain" width={100} height={100}/>
              </div>
              {/* Date */}
              <div className="text-gray-500 text-xs font-bold font-mono">
                Date: {selectedPlayer.evaluationDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Page 1 Body */}
            <div className="flex flex-col flex-1 justify-center py-6 relative z-10 min-w-0">
              {/* Title Block */}
              <div className="space-y-2 text-center sm:text-left relative z-20">
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tighter leading-none font-heading uppercase">
                  PLAYER <span className="text-[#E31B23]">DEVELOPMENT</span> PROGRAMME
                </h1>
                <p className="text-[10px] sm:text-[11px] text-gray-400 uppercase tracking-[0.25em] font-black">
                  TIER 1 PLAYER PROGRESS REPORT
                </p>
              </div>

              {/* Player Info Row */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 py-4 border-t border-b border-gray-100 text-gray-800 mt-6 max-w-125 mx-auto sm:mx-0 text-center sm:text-left relative z-20">
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Player Name</span>
                  <span className="text-base font-extrabold text-[#E31B23]">{selectedPlayer.fullName}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Age</span>
                  <span className="text-base font-extrabold text-gray-900">{selectedPlayer.age}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 uppercase font-black block tracking-wider">Centre</span>
                  <span className="text-base font-extrabold text-[#E31B23]">{selectedPlayer.academyName || "Manchester Centre"}</span>
                </div>
              </div>

              {/* Legend/Key list on the left */}
              <div className="mt-8 space-y-3 relative z-20">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest text-center sm:text-left">Key:</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: "#2563EB" }} />
                    <span className="text-gray-700 text-sm font-extrabold">Area For Improvement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: "#EAB308" }} />
                    <span className="text-gray-700 text-sm font-extrabold">Good</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: "#16A34A" }} />
                    <span className="text-gray-700 text-sm font-extrabold">Excellent</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side Player Cut-out Image */}
            <div className="relative sm:absolute right-0 bottom-0 mt-8 sm:mt-0 h-96 sm:h-[80%] w-full sm:w-[50%] flex items-end justify-center sm:justify-end pointer-events-none z-0 opacity-100">
              <Image src={playerImgSrc}
                alt={selectedPlayer.fullName}
                className="h-full object-contain object-bottom relative z-10"
                width={500}
                height={500}
              />
            </div>
          </div>

          {/* Printable Page 2 */}
          <div
            id="evaluation-report-page-2"
            className="w-full max-w-282.5 lg:min-h-200 bg-white text-black p-4 sm:p-8 rounded-2xl border border-gray-200 relative overflow-hidden flex flex-col justify-between select-none space-y-6"
          >
            {/* Header Banner Section */}
            <div className="flex justify-between items-center w-full relative z-10">
              {/* Logo Badge */}
              <div className="flex items-center">
                <Image src={logo.src} alt="K10 Football Logo" className="h-10 object-contain" width={500} height={500}/>
              </div>
              {/* Date */}
              <div className="text-gray-500 text-xs font-bold font-mono">
                Date: {selectedPlayer.evaluationDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Categories container */}
            <div className="flex-1 flex flex-col justify-between py-2 space-y-3 min-w-0">
              {/* Category: Techniques */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2">
                <h3 className="text-sm font-black text-gray-900 border-b pb-1 uppercase tracking-wide">Techniques</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 lg:gap-y-0">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Dribbling", key: "dribbling" },
                      { label: "Ball Mastery", key: "ballMastery" },
                      { label: "Running with the Ball", key: "runningWithBall" },
                      { label: "Range of Passing", key: "rangePassing" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Striking / Finishing", key: "strikingFinishing" },
                      { label: "Defending", key: "defending" },
                      { label: "First Touch", key: "firstTouch" },
                      { label: "Non Dominant Foot", key: "nonDominantFoot" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category: Characteristics */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2">
                <h3 className="text-sm font-black text-gray-900 border-b pb-1 uppercase tracking-wide">Characteristics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 lg:gap-y-0">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Game Awareness", key: "gameAwareness" },
                      { label: "Games Understanding", key: "gamesUnderstanding" },
                      { label: "Decision Making", key: "decisionMaking" },
                      { label: "Concentration", key: "concentration" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Leadership", key: "leadership" },
                      { label: "Desire", key: "desire" },
                      { label: "Maturity", key: "maturity" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                    <div className="py-0.5 opacity-0 pointer-events-none select-none text-[10px] font-bold">Spacer</div>
                  </div>
                </div>
              </div>

              {/* Category: Physical */}
              <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2">
                <h3 className="text-sm font-black text-gray-900 border-b pb-1 uppercase tracking-wide">Physical</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4 lg:gap-y-0">
                  {/* Left Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Speed + Acceleration", key: "speedAcceleration" },
                      { label: "Movement", key: "movement" },
                      { label: "Balance", key: "balance" },
                      { label: "Power", key: "power" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                      <span>Skill</span>
                      <div className="flex gap-2 w-45 justify-between text-center">
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Improvement</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Good</span>
                        <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">Excellent</span>
                      </div>
                    </div>
                    {[
                      { label: "Strength", key: "strength" },
                      { label: "Agility", key: "agility" },
                      { label: "Co-ordination", key: "coordination" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2)}
                          {renderRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3)}
                        </div>
                      </div>
                    ))}
                    <div className="py-0.5 opacity-0 pointer-events-none select-none text-[10px] font-bold">Spacer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-212.5 mx-auto pt-6 border-t border-white/5 px-4 sm:px-0">
          <button
            onClick={() => {
              setSelectedPlayer(null);
              setEvaluation(DEFAULT_EVALUATION);
            }}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-3 rounded-xl border border-[#E31B23]/30 text-white hover:text-white bg-[#E31B23]/5 hover:bg-[#E31B23]/10 text-xs font-black uppercase tracking-widest transition-all gap-2 cursor-pointer"
          >
            <Download size={16} /> Download as PDF
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-3 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-black uppercase tracking-widest transition-all gap-2 cursor-pointer shadow-[0_0_20px_rgba(227,27,35,0.3)]"
          >
            <CheckCircle size={16} /> Save Evaluation
          </button>
        </div>
      </div>
    );
  }

  // Dashboard List Screen
  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Player Evaluation</h1>
          <p className="text-gray-500 text-sm mt-2">Manage, rate, and track periodical progress of players</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer",
            activeTab === "pending" ? "text-white" : "text-white/40 hover:text-white/60"
          )}
        >
          Pending Evaluation ({pendingCount})
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E31B23]" />}
        </button>
        <button
          onClick={() => setActiveTab("evaluated")}
          className={cn(
            "pb-4 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer",
            activeTab === "evaluated" ? "text-white" : "text-white/40 hover:text-white/60"
          )}
        >
          Evaluated ({evaluatedCount})
          {activeTab === "evaluated" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#E31B23]" />}
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by player name or position..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 bg-white/2 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all placeholder:text-gray-600"
        />
      </div>

      {/* Table grid layout */}
      <div className="p-8 rounded-3xl border border-white/20 bg-[#0D0D0D]">
        {isLoading ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-4">Academy / Centre</th>
                  <th className="py-4 px-4">Last Evaluated</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/10 shrink-0" />
                        <div className="flex flex-col gap-1.5">
                          <div className="h-4 w-32 bg-white/10 rounded" />
                          <div className="h-3 w-16 bg-white/5 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-4 w-8 bg-white/10 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-36 bg-white/10 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-8 w-28 bg-white/10 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-white font-bold text-base mb-1">Failed to Load Evaluations</h3>
            <p className="text-gray-500 text-xs mb-4">Something went wrong while fetching evaluations data.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-white/5 text-gray-600 mb-4">
              <ClipboardCheck size={40} />
            </div>
            <h3 className="text-white font-bold text-base mb-1">No Players Found</h3>
            <p className="text-gray-500 text-xs">
              {searchTerm ? "No player evaluations found matching your search query." : "All players have been processed or none available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-[10px] text-gray-500 uppercase tracking-widest font-black">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-4">Academy / Centre</th>
                  <th className="py-4 px-4">Last Evaluated</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {filteredPlayers.map((player) => {
                  const playerId = player._id || player.id || "";
                  const localSaved = evaluationRecords[playerId];
                  const isEvaluated = Boolean(
                    localSaved?.date ||
                      (player.status && player.status.toUpperCase() === "EVALUATED") ||
                      (player.lastEvaluated && player.lastEvaluated !== "Pending Review")
                  );
                  const evalDateText =
                    localSaved?.date ||
                    (player.lastEvaluated && player.lastEvaluated !== "Pending Review" ? player.lastEvaluated : "");

                  return (
                    <tr
                      key={playerId}
                      onClick={() => startEvaluation(player)}
                      className="group hover:bg-white/2 transition-all cursor-pointer"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 rounded-full overflow-hidden bg-gray-900 border border-white/10 shrink-0">
                            <Image
                              src={player.avatar || "/placeholder_img.jpg"}
                              className="size-full object-cover"
                              alt={player.name || "Player"}
                              width={40}
                              height={40}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.srcset = "";
                                target.src = "/placeholder_img.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white group-hover:text-red-500 transition-colors">
                              {player.name}
                            </div>
                            <div className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                              {player.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-black text-red-600 italic">
                          {player.rating ?? "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300 font-semibold">
                        {player.academy || "N/A"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {isEvaluated ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-500">
                            <CheckCircle size={14} /> Evaluated {evalDateText ? `(${evalDateText})` : ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Info size={14} /> {player.lastEvaluated || "Pending Review"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEvaluation(player);
                          }}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border",
                            activeTab === "pending"
                              ? "bg-[#E31B23] hover:bg-[#ff2d35] text-white border-[#E31B23]"
                              : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
                          )}
                        >
                          {activeTab === "pending" ? "EVALUATE PLAYER" : "RE-EVALUATE"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export default PlayerEvaluationPage;

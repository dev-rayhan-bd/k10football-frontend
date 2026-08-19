/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconStar,
  IconUsers,
  IconFileText,
  IconTrendingUp,
} from "@tabler/icons-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { useAppSelector } from "@/lib/hooks/reduxHooks";
import { EvaluationData } from "@/lib/features/evaluation/evaluationSlice";

import { 
  DEFAULT_EVALUATION, 
  technicalKeys, 
  physicalKeys, 
  mentalKeys, 
  getPlayerTag, 
  mockCards 
} from "./player-evaluation/utils";
import { SummaryCard } from "./player-evaluation/SummaryCard";
import { EvaluationCard } from "./player-evaluation/EvaluationCard";
import { PlayerEvaluationSidebar } from "./player-evaluation/PlayerEvaluationSidebar";
import { EvaluationReportModal } from "./player-evaluation/EvaluationReportModal";

const PlayerEvaluation = () => {
  const players = useAppSelector((state) => state.player.players);
  const evaluationRecords = useAppSelector((state) => state.evaluation.records);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const evaluatedItems = Object.values(evaluationRecords);
  
  const evaluatedCards = evaluatedItems.map((record) => {
    const player = players.find(p => p.id === record.playerId);
    
    // Calculate tech, phys, ment scores
    const evaluation = record.evaluation;
    const techVal = technicalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    const physVal = physicalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    const mentVal = mentalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    
    const totalSum = techVal + physVal + mentVal;
    // rating maps sum of 22 items (max score 66) to 10 scale
    const rating = Number(((totalSum / 66) * 10).toFixed(1));
    
    let btnColor = "text-red-500 bg-red-500";
    if (rating >= 8.5) btnColor = "text-emerald-500 bg-emerald-500";
    else if (rating >= 7.5) btnColor = "text-yellow-500 bg-yellow-500";

    // Format date: "YYYY-MM-DD" -> "MMM DD, YYYY"
    let formattedDate = record.date;
    try {
      const d = new Date(record.date);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {}

    return {
      id: record.playerId,
      name: record.playerName,
      date: formattedDate,
      coach: player?.coachName || "Coach N/A",
      rating,
      tech: techVal,
      phys: physVal,
      ment: mentVal,
      pos: player?.position || "Player",
      tag: player ? getPlayerTag(player) : "U-15",
      tier: player?.validationStatus === "verified" ? "TIER 1" : "TIER 2",
      btnColor,
    };
  });

  // Filter out mock cards if there is an active evaluated card with the same player name
  const activeEvaluatedNames = new Set(evaluatedCards.map(c => c.name.toLowerCase()));
  const filteredMockCards = mockCards.filter(mc => !activeEvaluatedNames.has(mc.name.toLowerCase()));
  
  const cardsToRender = [...evaluatedCards, ...filteredMockCards];
  
  const filteredCards = cardsToRender.filter(card => 
    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.coach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic Summary Stats
  const totalEvalsCount = cardsToRender.length;
  const avgRatingVal = totalEvalsCount > 0 
    ? (cardsToRender.reduce((sum, c) => sum + Number(c.rating), 0) / totalEvalsCount).toFixed(1)
    : "0.0";
  const improvingCountVal = cardsToRender.filter(c => Number(c.rating) >= 8.0).length;
  
  // Count evaluations saved this month
  const thisMonthCount = 28 + evaluatedCards.filter(c => {
    try {
      const evalDate = new Date(c.date);
      const now = new Date();
      return evalDate.getMonth() === now.getMonth() && evalDate.getFullYear() === now.getFullYear();
    } catch(e) {
      return false;
    }
  }).length;

  // Retrieve evaluation data object for selected card (seeded or real Redux data)
  const getEvaluationData = (card: any) => {
    if (!card) return DEFAULT_EVALUATION as EvaluationData;
    const record = evaluationRecords[card.id];
    if (record?.evaluation) {
      return record.evaluation;
    }
    
    // Distribute mock scores based on aggregate tech/phys/ment values
    const mockEval = { ...DEFAULT_EVALUATION } as EvaluationData;
    
    // Distribute tech
    let techLeft = card.tech || 16;
    technicalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(techLeft / 6)));
      mockEval[key] = val;
      techLeft -= val;
    });

    // Distribute phys
    let physLeft = card.phys || 14;
    physicalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(physLeft / 6)));
      mockEval[key] = val;
      physLeft -= val;
    });

    // Distribute ment
    let mentLeft = card.ment || 15;
    mentalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(mentLeft / 6)));
      mockEval[key] = val;
      mentLeft -= val;
    });

    return mockEval;
  };

  // Download PDF Report
  const handleDownloadPDF = async () => {
    const page1 = document.getElementById("report-page-1");
    const page2 = document.getElementById("report-page-2");
    
    if (!selectedCard || !page1 || !page2) {
      toast.error("Evaluation elements not found in DOM.");
      return;
    }

    const toastId = toast.loading("Generating PDF report... Please wait.");
    setIsGeneratingPdf(true);

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
      const imgWidth = 297;
      const imgHeight = 210;
      
      // Capture Page 1
      toast.loading("Rendering Page 1...", { id: toastId });
      const canvas1 = await html2canvas(page1, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      // Capture Page 2
      toast.loading("Rendering Page 2...", { id: toastId });
      const canvas2 = await html2canvas(page2, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      toast.loading("Assembling PDF document...", { id: toastId });

      const imgData1 = canvas1.toDataURL("image/png");
      pdf.addImage(imgData1, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.addPage();
      const imgData2 = canvas2.toDataURL("image/png");
      pdf.addImage(imgData2, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save(`Evaluation_Report_${selectedCard.name.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
      
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      window.getComputedStyle = originalGetComputedStyle;
      if (dummy.parentNode) {
        dummy.parentNode.removeChild(dummy);
      }
      setIsGeneratingPdf(false);
    }
  };

  const activeEvaluationData = selectedCard ? getEvaluationData(selectedCard) : (DEFAULT_EVALUATION as EvaluationData);

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">Player Evaluation</h1>
          <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">Create and manage player development progress reports</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard label="Avg. Overall Rating" value={avgRatingVal} icon={IconStar} bgColor="bg-red-500" textColor="text-red-500" />
        <SummaryCard label="Improving Players" value={improvingCountVal} icon={IconTrendingUp} bgColor="bg-emerald-500" textColor="text-emerald-500" />
        <SummaryCard label="Evaluated this Month" value={thisMonthCount} icon={IconFileText} bgColor="bg-blue-500" textColor="text-blue-500" />
        <SummaryCard label="Total Evaluations" value={totalEvalsCount} icon={IconUsers} bgColor="bg-yellow-500" textColor="text-yellow-500" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 xl:gap-8 min-w-0">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 min-w-0">
              <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <Input 
                placeholder="Search players by name, team, or position..." 
                className="bg-[#111111] border-white/10 h-12 rounded-xl pl-12 text-white/60 font-medium" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Evaluation Grid */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Evaluations</h2>
              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-[1px]">
                    <div className="w-full h-full bg-emerald-400 rounded-full" />
                  </div>
                  Technical
                </div>
                <div className="flex items-center gap-2 text-yellow-400 text-[10px] font-bold uppercase">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-[1px]">
                    <div className="w-full h-full bg-yellow-400 rounded-full" />
                  </div>
                  Physical
                </div>
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-red-400 flex items-center justify-center p-[1px]">
                    <div className="w-full h-full bg-red-400 rounded-full" />
                  </div>
                  Mental
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredCards.map((card, idx) => (
                <EvaluationCard 
                  key={card.id ? `${card.id}-${idx}` : `mock-${idx}`}
                  {...card} 
                  onClick={() => setSelectedCard(card)} 
                />
              ))}
            </div>
            
            {filteredCards.length === 0 && (
              <div className="text-center py-20 bg-[#111111] rounded-3xl border border-white/10">
                <IconFileText size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 font-bold">No evaluation records found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <PlayerEvaluationSidebar />
      </div>

      {/* Evaluation Report Sheet Dialog Modal */}
      <EvaluationReportModal 
        selectedCard={selectedCard}
        setSelectedCard={setSelectedCard}
        handleDownloadPDF={handleDownloadPDF}
        isGeneratingPdf={isGeneratingPdf}
        activeEvaluationData={activeEvaluationData}
      />
    </div>
  );
};

export default PlayerEvaluation;

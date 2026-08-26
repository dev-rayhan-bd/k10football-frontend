"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import {
  IconLoader2,
  IconDownload,
  IconX,
  IconCheck,
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import logo from "@/assets/sort_logo.png";
import RadarChart from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/RadarChart";

import {
  ReportView,
  RadarStat,
  ReportStats,
  Player,
} from "./GameReportTypes";
import {
  getStatsFromReport,
  mapStat,
  normalizeRating,
  safeString,
} from "./GameReportHelpers";

interface GameReportPdfModalProps {
  selectedCard: ReportView | null;
  players: Player[];
  onClose: () => void;
}

const GameReportPdfModal: React.FC<GameReportPdfModalProps> = ({
  selectedCard,
  players,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(1500);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ResizeObserver to handle scaling
  useEffect(() => {
    const handleResize = () => {
      const availableWidth = window.innerWidth - 40;
      if (availableWidth < 794) {
        setScale(availableWidth / 794);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!previewRef.current) return;
    const observer = new ResizeObserver(() => {
      if (previewRef.current) {
        setContentHeight(previewRef.current.scrollHeight);
      }
    });
    observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, [selectedCard]);

  // Derived Stats
  const activeStats = useMemo<ReportStats | null>(() => {
    if (!selectedCard) return null;
    return getStatsFromReport(selectedCard);
  }, [selectedCard]);

  const isGK =
    safeString(selectedCard?.playerPosition).toUpperCase() === "GOALKEEPER";

  const radarStats = useMemo<RadarStat[]>(() => {
    if (!selectedCard || !activeStats) {
      return [];
    }

    const characteristics = selectedCard.characteristics ?? [];

    if (isGK) {
      return [
        {
          label: "DIV",
          value: mapStat(activeStats.savesAccurate + activeStats.punching * 2, 25),
        },
        {
          label: "HAN",
          value: mapStat(activeStats.handling + activeStats.aerialAbility, 25),
        },
        {
          label: "KIC",
          value: mapStat(activeStats.throwing + activeStats.passAccurate, 25),
        },
        {
          label: "REF",
          value: mapStat(activeStats.reflex + activeStats.penaltiesSaves * 5, 20),
        },
        {
          label: "SPD",
          value: mapStat(activeStats.reactions + activeStats.appearances, 25),
        },
        {
          label: "POS",
          value: mapStat(activeStats.aerialAbility + activeStats.savesAccurate, 25),
        },
      ];
    }

    return [
      {
        label: "PAC",
        value: mapStat(activeStats.reactions + (characteristics.includes("FAST") ? 8 : 4), 20),
      },
      {
        label: "SHO",
        value: mapStat(activeStats.goalScored * 5 + activeStats.shotsOnGoal * 2 + (characteristics.includes("FINISHER") ? 10 : 0), 20),
      },
      {
        label: "PAS",
        value: mapStat(activeStats.passAccurate + activeStats.assists * 5, 80),
      },
      {
        label: "DRI",
        value: mapStat(activeStats.reactions + (characteristics.includes("SKILLFUL") ? 10 : 5), 20),
      },
      {
        label: "DEF",
        value: mapStat(activeStats.standTackle + activeStats.slidingTackle + activeStats.interception, 20),
      },
      {
        label: "PHY",
        value: mapStat(activeStats.appearances * 5 + (characteristics.includes("STRONG") ? 10 : 5), 20),
      },
    ];
  }, [selectedCard, activeStats, isGK]);

  const overallPercent =
    radarStats.length > 0
      ? Math.round(
        radarStats.reduce((acc, curr) => acc + curr.value, 0) / radarStats.length
      )
      : 0;

  const handleDownloadPDF = async () => {
    if (!selectedCard) {
      toast.error("No report selected.");
      return;
    }

    const page = document.getElementById("report-page-1");

    if (!page) {
      toast.error("Report elements not found in the DOM.");
      return;
    }

    const toastId = toast.loading("Generating PDF report... Please wait.");
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", [210, Math.max(297, imgHeight)]);

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

      const playerName = safeString(selectedCard.playerName).trim();
      const safeFileName = (playerName || "Player")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .replace(/^_+|_+$/g, "");

      pdf.save(`Game_Report_${safeFileName || "Player"}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const matchingPlayer = selectedCard
    ? players.find((player) => player.id === selectedCard.playerId)
    : null;

  let playerImgSrc = "/dummy-player.png";
  if (matchingPlayer?.playerImage) {
    if (typeof matchingPlayer.playerImage === "string") {
      playerImgSrc = matchingPlayer.playerImage;
    } else if (matchingPlayer.playerImage.src) {
      playerImgSrc = matchingPlayer.playerImage.src;
    }
  }

  const pitchMarkers = [
    {
      x1: 50,
      y1: 72,
      x2: 68,
      y2: 52,
    },
  ];

  const goalMarkers = [
    { x: 20, y: 35 },
    { x: 50, y: 55 },
    { x: 80, y: 35 },
  ];

  if (!selectedCard) return null;

  return (
    <Dialog
      open={Boolean(selectedCard)}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-screen! h-screen! max-w-none! max-h-none! top-0! left-0! translate-x-0! translate-y-0! rounded-none! border-none! bg-black/98 text-white p-4 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {/* Modal Header */}
        <DialogHeader className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4 shrink-0 pb-4 border-b border-white/10 mb-4 md:mb-6">
          <div className="text-center md:text-left">
            <DialogTitle className="text-xl md:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Player Game Report
            </DialogTitle>

            <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
              Scouted Match Performance Profile
              {selectedCard?.playerName ? ` for ${selectedCard.playerName}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center flex-1 md:flex-none gap-2 bg-sky-600 hover:bg-sky-500 border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-4 md:px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)] cursor-pointer disabled:opacity-50 font-orbitron whitespace-nowrap"
            >
              {isGeneratingPdf ? (
                <>
                  <IconLoader2 className="animate-spin" size={16} />
                  Generating...
                </>
              ) : (
                <>
                  <IconDownload size={16} />
                  Download PDF
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center flex-1 md:flex-none gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white px-4 md:px-6 py-2.5 rounded-xl transition-all cursor-pointer font-orbitron whitespace-nowrap"
            >
              <IconX size={16} />
              Close
            </button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto h-[95dvh]">
          {activeStats && (
            <div
              ref={containerRef}
              className="w-full flex justify-center border border-white/10 rounded-3xl shadow-2xl bg-white mb-6 overflow-hidden"
              style={{
                height: scale < 1 ? `${(contentHeight * scale) + 24}px` : 'auto',
                padding: scale < 1 ? '12px 0' : '1.5rem'
              }}
            >
              <div
                className="origin-top flex justify-center"
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
              >
                <div
                  ref={previewRef}
                  id="report-page-1"
                  className="bg-white text-slate-800 px-8 py-6 font-sans relative overflow-hidden select-none flex flex-col"
                  style={{
                    width: "794px",
                    minHeight: "1123px"
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                    <Image
                      src="/pdf_logo.jpg"
                      alt="Logo Watermark"
                      className="w-24 h-24 object-contain"
                      width={500}
                      height={500}
                    />
                  </div>

                  {/* Report Header */}
                  <div className="relative z-10 flex items-center justify-between border-b-4 border-slate-900 pb-2 mb-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/pdf_logo.jpg"
                        alt="K10 Logo"
                        className="w-24 h-24 object-contain"
                        width={80}
                        height={80}
                      />
                      <div>
                        <div className="text-xs font-black tracking-widest text-slate-900 font-orbitron">
                          K10 FOOTBALL
                        </div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">
                          ANALYSIS CV
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-3xl font-black text-[#E31B23] font-orbitron uppercase tracking-tighter italic">
                        PLAYER ANALYSIS PROFILE
                      </h2>
                      <div className="text-[10px] text-slate-900 font-black uppercase tracking-widest mt-1">
                        POSITION : {selectedCard.playerPosition} ⚽
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-black tracking-widest text-slate-900 font-orbitron">
                          K10 FOOTBALL
                        </div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">
                          ANALYSIS CV
                        </div>
                      </div>
                      <Image
                        src={logo.src}
                        alt="K10 Logo"
                        className="w-12 h-12 object-contain"
                        width={100}
                        height={100}
                      />
                    </div>
                  </div>

                  {/* Player Details */}
                  <div className="relative z-10 grid grid-cols-12 gap-4 mb-3 shrink-0">
                    <div className="col-span-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-medium text-slate-600">
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">PLAYER NAME:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{selectedCard.playerName}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">CLUB NAME:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{selectedCard.team1}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">DOB:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">{matchingPlayer?.dob || "27-03-2014"}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">MATCHES PLAYED:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">{matchingPlayer?.seasonStats?.matches || "1"}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">WEIGHT:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">{selectedCard.weight || "45 KG"}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">MINUTES PLAYED:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">{selectedCard.timePlayedMinutes || "90"} MIN</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">HEIGHT:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">{selectedCard.height || "1.20 M"}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">MAN OF THE MATCH:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5">1</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 uppercase font-orbitron">FOOT:</span>
                        <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{selectedCard.foot || "RIGHT"}</p>
                      </div>
                    </div>

                    <div className="col-span-4 flex justify-end">
                      <div className="bg-sky-50 border-2 border-sky-200 rounded-xl p-2 w-40 relative shadow-sm">
                        <div className="absolute top-2 left-2 text-sky-600 font-black text-xl italic font-orbitron leading-none">
                          {normalizeRating(selectedCard.rating).toFixed(0)}
                        </div>
                        <div className="absolute top-7 left-2 text-slate-400 text-[8px] font-black font-orbitron">
                          {safeString(selectedCard.playerPosition).substring(0, 3).toUpperCase() || "MID"}
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                          <Image src="/Brazil.png" alt="Brazil" className="w-4 h-3 object-cover rounded-[2px]" width={16} height={12} />
                          <Image src={logo.src} alt="K10" className="w-4 h-4 object-contain opacity-50" width={16} height={16} />
                        </div>
                        <div className="mt-3 flex justify-center">
                          <Image src={playerImgSrc} alt="Player" className="h-28 object-contain object-bottom drop-shadow-md" width={100} height={100} />
                        </div>
                        <div className="text-center bg-sky-500 text-white text-[9px] font-black uppercase tracking-wider py-1 rounded mt-1 font-orbitron">
                          {safeString(selectedCard.playerName).split(" ")[0] || "PLAYER"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="relative z-10 mb-3">
                    <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      PLAYER CHARACTERISTIC:
                    </div>
                    <div className="flex gap-4 pl-2">
                      {(selectedCard.characteristics || ["FAST", "SKILLFUL", "FINISHER"]).map((characteristic, index) => (
                        <div key={`${characteristic}-${index}`} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          <IconCheck size={12} className="text-sky-500" />
                          {characteristic}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Match Information */}
                  <div className="relative z-10 mb-3">
                    <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      MATCH INFORMATION
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[10px] pl-2">
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">SCOUT NAME:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">{selectedCard.scoutName || "MARIO LOPEZ"}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">GAME DATE:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">{selectedCard.date || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">MATCH RESULT:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {safeString(selectedCard.playerName).split(" ")[0] || "PLAYER"} {selectedCard.score || "N/A"} {selectedCard.team2 || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">GAME LOCATION:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">{selectedCard.stadium || "LONDON"}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">WEATHER/TEMPERATURE:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">
                          {selectedCard.weather || "RAINY"} {selectedCard.temperature ?? "19"}C
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-950 font-orbitron">GAME TYPE:</span>
                        <span className="ml-2 text-slate-700 font-bold uppercase">{selectedCard.gameType || "CHAMPIONSHIP MATCH"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Statistics */}
                  <div className="relative z-10 mb-3">
                    <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1 rounded text-[10px] font-black uppercase tracking-wider mb-2 shadow">
                      MATCH STATISTICS
                    </div>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-1 text-[10px] pl-2">
                      {[
                        { label: "Shots on Goal:", val: activeStats.shotsOnGoal },
                        { label: "Stand Tackle:", val: activeStats.standTackle },
                        { label: "Appearances:", val: activeStats.appearances },
                        { label: "Goals Scored:", val: activeStats.goalScored },
                        { label: "Sliding Tackle:", val: activeStats.slidingTackle },
                        { label: "Fault:", val: activeStats.fault },
                        { label: "Assists:", val: activeStats.assists },
                        { label: "Interception:", val: activeStats.interception },
                        { label: "Punching:", val: activeStats.punching },
                        { label: "Pass Accurate:", val: activeStats.passAccurate },
                        { label: "Saves Accurate:", val: activeStats.savesAccurate },
                        { label: "Handling:", val: activeStats.handling },
                        { label: "Wrong Pass:", val: activeStats.wrongPass },
                        { label: "Goals Unsave:", val: activeStats.goalUnsave },
                        { label: "Reflex:", val: activeStats.reflex },
                        { label: "Free Kick:", val: activeStats.freeKick },
                        { label: "Penalties Save:", val: activeStats.penaltiesSaves },
                        { label: "Aerial Ability:", val: activeStats.aerialAbility },
                        { label: "Corner Kick:", val: activeStats.cornerKick },
                        { label: "Red Card:", val: activeStats.redCard },
                        { label: "Throwing:", val: activeStats.throwing },
                        { label: "Penalties Taken:", val: activeStats.penaltiesTaken },
                        { label: "Yellow Card:", val: activeStats.yellowCard },
                        { label: "Reactions:", val: activeStats.reactions },
                      ].map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex justify-between border-b border-slate-100 py-0.5 pr-2">
                          <span className="text-slate-500 font-bold uppercase font-orbitron">{item.label}</span>
                          <span className="text-slate-800 font-black font-orbitron">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Section */}
                  <div className="relative z-10 flex items-center justify-between border-t-2 border-slate-200 pt-3 mt-auto mb-3 shrink-0">
                    <div className="flex-none" style={{ width: 140 }}>
                      <RadarChart stats={radarStats} size={140} color="#0284c7" fillColor="rgba(2, 132, 199, 0.25)" textColor="#475569" gridColor="rgba(0, 0, 0, 0.1)" />
                    </div>
                    <div className="text-center flex-1 min-w-0">
                      <div className="text-4xl font-black text-emerald-600 font-orbitron tracking-tighter italic">
                        OVERALL = {overallPercent}%
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-none" style={{ width: 140 }}>
                      <Image src="/pdf_logo.jpg" alt="K10 Logo" className="w-24 h-24 object-contain" width={96} height={96} />
                      <div className="text-center leading-none">
                        <div className="text-[10px] font-black tracking-widest text-slate-900 font-orbitron">K10 FOOTBALL</div>
                        <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">ANALYSIS CV</div>
                      </div>
                    </div>
                  </div>
                  {/* Diagrams Section */}
                  <div className="relative z-10 grid grid-cols-2 gap-8 mt-4 mb-4 shrink-0">
                    {/* Goal Diagram */}
                    <div className="bg-slat-200 border border-slate-200 rounded-3xl overflow-hidden flex flex-col items-center w-full">
                      <div className="bg-slate-100 py-2 px-4 text-center border-b border-slate-200 w-full">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-orbitron">
                          {isGK ? "Accurate Save" : "Accurate Shots"}
                        </span>
                      </div>
                      <div className="relative overflow-hidden w-full bg-white" style={{ aspectRatio: "800/500" }}>
                        <Image src="/goal-bar.png" alt="Goal" className="w-full h-auto block scale-[1.4] origin-[50%_90%]" width={800} height={500} />
                        {goalMarkers?.map((marker: any, idx: number) => (
                          <div key={idx} className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center drop-shadow-lg" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
                            <span className="text-lg leading-none">{isGK ? "🧤" : "⚽"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pitch Diagram */}
                    <div className="bg-[#121212]/90 border border-slate-200 rounded-3xl overflow-hidden shadow-xl flex flex-col items-center w-full">
                      <div className="bg-slate-100 py-2 px-4 text-center border-b border-slate-200 w-full">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-orbitron">
                          {isGK ? "Accurate Saves" : "Accurate Assist"}
                        </span>
                      </div>
                      <div className="relative w-full bg-[#092b15]" style={{ aspectRatio: "500/700" }}>
                        <Image src="/field.png" alt="Pitch" className="w-full h-full object-cover" width={500} height={700} />
                        {pitchMarkers?.map((line: any, idx: number) => (
                          <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md overflow-visible">
                            <defs>
                              <marker id={`arrowhead-pdf2-${idx}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="black" />
                              </marker>
                            </defs>
                            <line x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="black" strokeWidth="3" markerEnd={`url(#arrowhead-pdf2-${idx})`} />
                            <foreignObject x={`calc(${line.x1}% - 8px)`} y={`calc(${line.y1}% - 8px)`} width="16" height="16">
                              <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                                <span className="text-[10px] leading-none drop-shadow-md">⚽</span>
                              </div>
                            </foreignObject>
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameReportPdfModal;

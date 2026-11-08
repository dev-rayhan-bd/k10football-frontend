/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import RadarChart from "./RadarChart";
import { IconDownload, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
interface ReportPdfPreviewProps {
  formData: any;
  characteristics: string[];
  stats: Record<string, number>;
  goalMarkers: { x: number; y: number }[];
  pitchMarkers: any[];
  onSave: (overallRating: number) => void;
  onBack: () => void;
  viewOnly?: boolean;
  isPlayer?: boolean;
  coachFeedback?: string;
  isSubmitting?: boolean;
}
const ReportPdfPreview = ({
  formData,
  characteristics,
  stats,
  goalMarkers,
  pitchMarkers,
  onSave,
  onBack,
  viewOnly,
  isPlayer,
  coachFeedback,
  isSubmitting
}: ReportPdfPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);
  const isGK = formData.position === "GOALKEEPER";

  const [contentHeight, setContentHeight] = useState(1500);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // 794 is the exact width of the PDF content. Add a small padding margin.
        const containerWidth = containerRef.current.clientWidth;
        if (containerWidth < 820) {
          setScale((containerWidth - 20) / 794);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
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
  }, []);

  // Helper to scale/normalize stats to a rating between 50 and 99
  const mapStat = (val: number, maxVal = 15) => {
    return Math.min(99, Math.max(50, Math.round(50 + (val / maxVal) * 49)));
  };
  // Compute attributes for the radar chart
  const radarStats = isGK
    ? [
      { label: "DIV", value: mapStat((stats.reflex || 0) + (stats.savesAccurate || 0), 25) },
      { label: "HAN", value: mapStat((stats.handling || 0) + (stats.punching || 0), 25) },
      { label: "KIC", value: mapStat((stats.throwing || 0) + (stats.passAccurate || 0), 25) },
      { label: "REF", value: mapStat((stats.reflex || 0) + (stats.penaltiesSaves || 0) * 5, 20) },
      { label: "SPD", value: mapStat((stats.reactions || 0) + (stats.appearances || 0), 25) },
      { label: "POS", value: mapStat((stats.aerialAbility || 0) + (stats.savesAccurate || 0), 25) }
    ]
    : [
      { label: "PAC", value: mapStat((stats.reactions || 0) + (characteristics.includes("FAST") ? 8 : 4), 20) },
      { label: "SHO", value: mapStat((stats.goalScored || 0) * 3 + (stats.shotsOnGoal || 0) + (stats.penaltiesTaken || 0), 25) },
      { label: "PAS", value: mapStat((stats.assists || 0) * 2 + (stats.passAccurate || 0), 25) },
      { label: "DRI", value: mapStat((stats.passAccurate || 0) + (characteristics.includes("SKILLFUL") ? 8 : 4), 20) },
      { label: "DEF", value: mapStat((stats.standTackle || 0) + (stats.slidingTackle || 0) + (stats.interception || 0), 30) },
      { label: "PHY", value: mapStat((stats.appearances || 0) + (stats.savesAccurate || 0), 30) }
    ];
  const overallRating = Math.round(
    radarStats.reduce((sum, s) => sum + s.value, 0) / radarStats.length
  );
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating PDF report... Please wait.");

    // Save original getComputedStyle and create dummy div to convert modern colors (oklch, lab, etc.)
    const originalGetComputedStyle = window.getComputedStyle;
    const dummy = document.createElement("div");
    dummy.style.display = "none";
    document.body.appendChild(dummy);

    const convertModernColor = (value: string) => {
      if (typeof value !== "string") return value;
      if (
        !value.includes("oklch") &&
        !value.includes("lab") &&
        !value.includes("oklab") &&
        !value.includes("lch")
      ) {
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
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("pdf-report-content");
          if (clonedElement && clonedElement.parentElement) {
            clonedElement.parentElement.style.transform = "none";
          }
        },
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF("p", "mm", [210, Math.max(297, imgHeight)]);
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      const safeName = (formData?.playerName || "Player").replace(/\s+/g, "_");
      pdf.save(`Player_Analysis_Profile_${safeName}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Failed to generate PDF:", err);
      toast.error(`Failed to generate PDF: ${msg}`, { id: toastId });
    } finally {
      // Restore original getComputedStyle
      window.getComputedStyle = originalGetComputedStyle;
      if (dummy.parentNode) {
        dummy.parentNode.removeChild(dummy);
      }
      setDownloading(false);
    }
  };
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic font-orbitron">Report Generated</h1>
        <p className="text-gray-400 text-sm">Preview the generated Player Analysis Profile PDF and save it.</p>
      </div>
      {/* PDF Container */}
      <div
        ref={containerRef}
        className="w-full flex justify-center border border-white/10 rounded-3xl shadow-2xl bg-white mb-6"
        style={{ height: scale < 1 ? `${(contentHeight * scale) + 24}px` : 'auto', padding: scale < 1 ? '12px 0' : '1.5rem' }}
      >
        <div
          className="origin-top flex justify-center"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          <div
            ref={previewRef}
            id="pdf-report-content"
            className="bg-white text-slate-800 px-10 py-8 font-sans relative select-none shrink-0 flex flex-col"
            style={{ width: "794px" }}
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
              <Image src="/pdf_logo.jpg" alt="Logo Watermark" className="w-24 h-24 object-contain" width={500} height={500} />
            </div>
            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b-4 border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-4">
                <Image src="/pdf_logo.jpg" alt="K10 Logo" className="w-28 h-28 object-contain" width={80} height={80} />
                <div>
                  <div className="text-sm font-black tracking-widest text-slate-900 font-orbitron">K10 FOOTBALL</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-orbitron mt-0.5">ANALYSIS CV</div>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#E31B23] font-orbitron uppercase tracking-tighter italic">
                  PLAYER ANALYSIS PROFILE
                </h2>
                <div className="text-[10px] text-slate-900 font-black uppercase tracking-widest mt-1">
                  POSITION : {formData.position} ⚽
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-black tracking-widest text-slate-900 font-orbitron">K10 FOOTBALL</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-orbitron mt-0.5">ANALYSIS CV</div>
                </div>
                <Image src="/pdf_logo.jpg" alt="K10 Logo" className="w-28 h-28 object-contain" width={80} height={80} />
              </div>
            </div>
            {/* Body Content */}
            <div className="relative z-10 grid grid-cols-12 gap-6 mb-4">
              {/* Player details */}
              <div className="col-span-8 grid grid-cols-2 gap-x-6 gap-y-2.5 text-[11px] font-medium text-slate-600">
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">PLAYER NAME:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{formData.playerName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">CLUB NAME:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{formData.clubName}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">DOB:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.dob}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">MATCHES PLAYED:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.matchesPlayed}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">WEIGHT:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.weight} KG</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">MINUTES PLAYED:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.minutesPlayed} MIN</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">HEIGHT:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.height} M</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">MAN OF THE MATCH:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5">{formData.manOfTheMatch}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-900 uppercase font-orbitron">FOOT:</span>
                  <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase">{formData.foot}</p>
                </div>
              </div>
              {/* FUT player card photo preview */}
              <div className="col-span-4 flex justify-end">
                <div className="w-36 h-48 border-2 border-sky-400 bg-sky-50 rounded-2xl p-2 relative shadow-md flex flex-col items-center justify-between">
                  {/* FUT card header */}
                  <div className="flex justify-between w-full items-start">
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-black text-sky-600 font-orbitron italic leading-none">{overallRating}</div>
                      <div className="text-[8px] font-bold text-sky-500 uppercase font-orbitron leading-none mt-0.5">{formData.position.slice(0, 3)}</div>
                    </div>
                    <Image src="/logo.png" alt="Club Logo" className="w-5 h-5 object-contain" width={50} height={50} />
                  </div>
                  {/* Player image in FUT Card */}
                  <div className="w-24 h-28 overflow-hidden relative mt-1 flex items-end justify-center">
                    <Image
                      src={isGK ? "/mini__GP15525.webp" : "/sergio-ramos.png"}
                      alt="Player Card Image"
                      className="h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = isGK ? "/pngegg.png" : "/ronaldo.png";
                      }}
                      width={50}
                      height={50}
                    />
                  </div>
                  {/* FUT card footer */}
                  <div className="w-full text-center bg-sky-500/10 py-0.5 rounded border border-sky-400/20 mt-1">
                    <div className="text-[10px] font-black text-sky-600 truncate uppercase font-orbitron leading-none">{formData.playerName.split(" ")[0]}</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Player Characteristic Section */}
            <div className="relative z-10 mb-4">
              <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider mb-2.5 shadow">
                PLAYER CHARACTERISTIC:
              </div>
              <div className="flex flex-wrap gap-4 pl-2">
                {characteristics.map(tag => (
                  <div key={tag} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
                    <span className="text-sky-500">⚽</span>
                    <span className="font-orbitron">{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Match Information Section */}
            <div className="relative z-10 mb-4">
              <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                MATCH INFORMATION
              </div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-[11px] font-medium text-slate-600 pl-2">
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">SCOUT NAME:</span>
                  <span className="ml-2 text-slate-700 font-bold uppercase">{formData.scoutName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">GAME DATE:</span>
                  <span className="ml-2 text-slate-700 font-bold">{formData.gameDate}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">MATCH RESULT:</span>
                  <span className="ml-2 text-slate-700 font-bold uppercase">{formData.matchResult}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">GAME LOCATION:</span>
                  <span className="ml-2 text-slate-700 font-bold uppercase">{formData.gameLocation}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">WEATHER/TEMPERATURE:</span>
                  <span className="ml-2 text-slate-700 font-bold uppercase">{formData.weather} {formData.temperature}C</span>
                </div>
                <div>
                  <span className="font-bold text-slate-950 font-orbitron">GAME TYPE:</span>
                  <span className="ml-2 text-slate-700 font-bold uppercase">{formData.gameType}</span>
                </div>
              </div>
            </div>
            {/* Match Statistics Section */}
            <div className="relative z-10 mb-4">
              <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                MATCH STATISTICS
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-[10px] pl-2">
                {[
                  { label: "Shots on Goal:", val: stats.shotsOnGoal || 0 },
                  { label: "Stand Tackle:", val: stats.standTackle || 0 },
                  { label: "Appearances:", val: stats.appearances || 0 },
                  { label: "Goals Scored:", val: stats.goalsScored || 0 },
                  { label: "Sliding Tackle:", val: stats.slidingTackle || 0 },
                  { label: "Fault:", val: stats.fault || 0 },
                  { label: "Assists:", val: stats.assists || 0 },
                  { label: "Interception:", val: stats.interception || 0 },
                  { label: "Punching:", val: stats.punching || 0 },
                  { label: "Pass Accurate:", val: stats.passAccurate || 0 },
                  { label: "Saves Accurate:", val: stats.savesAccurate || 0 },
                  { label: "Handling:", val: stats.handling || 0 },
                  { label: "Wrong Pass:", val: stats.wrongPass || 0 },
                  { label: "Goals Unsave:", val: stats.goalUnsave || 0 },
                  { label: "Reflex:", val: stats.reflex || 0 },
                  { label: "Free Kick:", val: stats.freeKick || 0 },
                  { label: "Penalties Save:", val: stats.penaltiesSaves || 0 },
                  { label: "Aerial Ability:", val: stats.aerialAbility || 0 },
                  { label: "Corner Kick:", val: stats.cornerKick || 0 },
                  { label: "Red Card:", val: stats.redCard || 0 },
                  { label: "Throwing:", val: stats.throwing || 0 },
                  { label: "Penalties Taken:", val: stats.penaltiesTaken || 0 },
                  { label: "Yellow Card:", val: stats.yellowCard || 0 },
                  { label: "Reactions:", val: stats.reactions || 0 }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-slate-100 py-1 pr-2">
                    <span className="text-slate-500 font-bold uppercase font-orbitron">{item.label}</span>
                    <span className="text-slate-800 font-black font-orbitron">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom section (Radar, Overall, Logos) */}
            <div className="relative z-10 flex items-center justify-between border-t-2 border-slate-200 pt-4 mb-4">
              {/* Radar Chart */}
              <div className="w-45">
                <RadarChart
                  stats={radarStats}
                  size={140}
                  color="#0284c7"
                  fillColor="rgba(2, 132, 199, 0.25)"
                />
              </div>
              {/* Overall score */}
              <div className="text-center flex-1 min-w-0">
                <div className="text-4xl font-black text-emerald-600 font-orbitron tracking-tighter italic">
                  OVERALL = {overallRating}%
                </div>
              </div>
              {/* Logo and tag */}
              <div className="flex flex-col items-center gap-1.5 w-45">
                <Image src="/pdf_logo.jpg" alt="K10 Logo" className="w-24 h-24 object-contain" width={10} height={10} />
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
                  {pitchMarkers?.map((line: any, idx: number) => {
                    const dx = line.x2 - line.x1;
                    const dy = line.y2 - line.y1;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    return (
                      <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md overflow-visible">
                        <defs>
                          <marker id={`arrowhead-pdf2-${idx}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                            <polygon points="0 0, 6 3, 0 6" fill="black" />
                          </marker>
                        </defs>
                        {dist >= 1 && (
                          <line x1={`${line.x1}%`} y1={`${line.y1}%`} x2={`${line.x2}%`} y2={`${line.y2}%`} stroke="black" strokeWidth="3" markerEnd={`url(#arrowhead-pdf2-${idx})`} />
                        )}
                        <foreignObject x={`calc(${line.x1}% - 8px)`} y={`calc(${line.y1}% - 8px)`} width="16" height="16">
                          <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
                            <span className="text-[10px] leading-none drop-shadow-md">⚽</span>
                          </div>
                        </foreignObject>
                      </svg>
                    );
                  })}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={downloading}
          className="flex-1 border-white/10 bg-transparent text-white h-14 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-colors font-orbitron min-w-0"
        >
          Back
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="flex-1 bg-sky-500 hover:bg-sky-400 text-white h-14 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(14,165,233,0.2)] flex items-center justify-center gap-2 font-orbitron min-w-0"
        >
          {downloading ? (
            <>
              <IconLoader2 className="animate-spin" size={18} />
              Generating PDF...
            </>
          ) : (
            <>
              <IconDownload size={18} />
              Download PDF
            </>
          )}
        </Button>
        {viewOnly ? (
          <Button
            variant="outline"
            disabled
            className="flex-1 border-white/20 bg-white/5 text-gray-400 h-14 rounded-xl text-sm font-bold uppercase tracking-widest font-orbitron"
          >
            Report Completed
          </Button>
        ) : (
          <Button
            onClick={() => onSave(overallRating)}
            disabled={downloading || isSubmitting}
            className="flex-1 bg-[#00FF62] hover:bg-[#00D150] text-black h-14 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,255,98,0.2)] flex items-center justify-center gap-2 font-orbitron min-w-0"
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="animate-spin" size={18} />
                {isPlayer ? "Processing..." : "Completing Report..."}
              </>
            ) : (
              <>
                <IconCheck size={18} />
                {isPlayer ? "Save Report" : "Save & Complete"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
export default ReportPdfPreview;

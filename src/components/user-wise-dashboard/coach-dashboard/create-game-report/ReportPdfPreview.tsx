/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import RadarChart from "./RadarChart";
import { IconDownload, IconCheck, IconLoader2, IconInfoCircle } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GK_SLIDE_1, OUTFIELD_SLIDES, GK_SLIDE_4 } from "./MatchStatisticsForm";
import { formatPlayedTimeHMS } from "./reportHelpers";

const NA = "N/A";

const isRemoteUrl = (src: string) =>
  /^https?:\/\//i.test(src) && (typeof window === "undefined" || !src.startsWith(window.location.origin));

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const inlinedImageCache = new Map<string, string>();

/** Loads a remote image as a data URL via same-origin routes; null if every route fails. */
const inlineImage = async (src: string): Promise<string | null> => {
  const cached = inlinedImageCache.get(src);
  if (cached) return cached;
  const candidates = [
    `/api/image-proxy?url=${encodeURIComponent(src)}`,
    `/_next/image?url=${encodeURIComponent(src)}&w=384&q=90`,
    src,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) continue;
      const data = await blobToDataUrl(blob);
      inlinedImageCache.set(src, data);
      return data;
    } catch {
      // try the next candidate
    }
  }
  return null;
};

const formatHeight = (val: any) => {
  if (!val) return NA;
  const num = parseFloat(String(val).replace(/[^\d.]/g, ""));
  if (isNaN(num)) return String(val);
  if (num > 3) {
    return `${num} CM`;
  }
  return `${num.toFixed(2)} M`;
};

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
  /** Generate and download the PDF as soon as the report has rendered (used for off-screen export). */
  autoDownload?: boolean;
  /** Called after an auto-download finishes (successfully or not). */
  onAutoDownloadDone?: () => void;
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
  isSubmitting,
  autoDownload,
  onAutoDownloadDone,
}: ReportPdfPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(1);

  const searchParams = useSearchParams();
  const urlPosition = searchParams?.get("position");
  const effectivePosition = (urlPosition || formData?.position || "").trim().toUpperCase();
  const isGK = effectivePosition === "GOALKEEPER" || effectivePosition === "GK";

  const statItems = isGK
    ? [...GK_SLIDE_1, ...OUTFIELD_SLIDES[0], ...OUTFIELD_SLIDES[1], ...GK_SLIDE_4]
    : [...OUTFIELD_SLIDES[0], ...OUTFIELD_SLIDES[1], ...OUTFIELD_SLIDES[2]];

  const getStatValue = (key: string): number => {
    if (stats[key] !== undefined && stats[key] !== null) return Number(stats[key]);
    switch (key) {
      case "goal": return Number(stats.goalScored ?? stats.goalsScored ?? 0);
      case "assist": return Number(stats.assists ?? 0);
      case "shotOnTarget": return Number(stats.shotsOnGoal ?? 0);
      case "completedPass": return Number(stats.passAccurate ?? 0);
      case "incompletePass": return Number(stats.wrongPass ?? 0);
      case "tackleWon": return Number(stats.standTackle ?? stats.slidingTackle ?? 0);
      case "freeKickWon": return Number(stats.freeKick ?? 0);
      case "penaltyWon": return Number(stats.penaltiesTaken ?? 0);
      case "foulCommitted": return Number(stats.fault ?? 0);
      case "save": return Number(stats.savesAccurate ?? 0);
      case "goalConceded": return Number(stats.goalUnsave ?? 0);
      case "oneOnOneSave": return Number(stats.save1v1 ?? 0);
      case "save1v1": return Number(stats.oneOnOneSave ?? 0);
      default: return 0;
    }
  };

  // A saved report that hasn't been completed yet has no stats in the database.
  const hasSavedStats = Object.keys(stats || {}).length > 0;

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

  // Ratings are calculated by the backend when the report is submitted
  // (`categoryRatings`, `scoutRating`/`rating` from GET /players/me/game-reports/:id).
  // Nothing is calculated here: before submit they are simply not available yet.
  const radarStats = Object.entries((formData?.categoryRatings ?? {}) as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(([name, v]) => ({
      label: name.slice(0, 3).toUpperCase(),
      fullLabel: name,
      value: Number(v),
    }));
  const hasCategoryRatings = radarStats.length >= 3;

  const rawOverall = formData?.scoutRating ?? formData?.rating;
  const overallRating: number | null =
    rawOverall !== undefined && rawOverall !== null && !isNaN(Number(rawOverall)) ? Number(rawOverall) : null;
  const overallText = overallRating === null ? "—" : String(overallRating);
  const AFTER_SUBMIT_HINT = "Calculated by K10 from your match statistics after the report is submitted.";

  // Every value shown in the PDF comes straight from formData, which is
  // populated from the database record. Missing values render as "N/A" —
  // nothing is substituted or invented here.
  const show = (val: any): string => {
    if (val === undefined || val === null) return NA;
    const str = String(val).trim();
    return str ? str : NA;
  };

  const displayPosition = (effectivePosition || formData?.position || "").trim().toUpperCase();

  // Fields rendered in the PDF. Kept as data so the layout stays uniform.
  const playerDetails = [
    { label: "PLAYER NAME", value: show(formData.playerName) },
    { label: "CLUB NAME", value: show(formData.clubName) },
    { label: "DOB", value: show(formData.dob) },
    { label: "MATCHES PLAYED", value: show(formData.matchesPlayed) },
    { label: "WEIGHT", value: formData.weight ? `${formData.weight} KG` : NA },
    { label: "MINUTES PLAYED", value: formData.minutesPlayed ? `${formatPlayedTimeHMS(formData.minutesPlayed)} MIN` : NA },
    { label: "HEIGHT", value: formatHeight(formData.height) },
    { label: "FOOT", value: show(formData.foot) },
  ];

  const scoreText = (v: unknown) =>
    v === undefined || v === null || String(v).trim() === "" ? NA : String(v);

  const matchResultText = (() => {
    const raw = String(formData?.matchResult ?? "").trim();
    if (raw) return raw;
    // A saved report shows only what is stored — no derived value.
    if (viewOnly) return NA;
    const own = String(formData?.ownTeam ?? "").trim();
    const opp = String(formData?.opponentTeam ?? "").trim();
    return own && opp
      ? `${own} ${formData.homeScore ?? 0} X ${formData.awayScore ?? 0} ${opp}`
      : NA;
  })();

  const weatherText = (() => {
    const weather = String(formData?.weather ?? "").trim();
    const temp = String(formData?.temperature ?? "").trim();
    const parts = [weather, temp ? `${temp}°C` : ""].filter(Boolean);
    return parts.length ? parts.join(" / ") : NA;
  })();

  // 3-column grid: rows of 3, last row = weather + match result (spans 2).
  const matchDetails: Array<{ label: string; value: string; wide?: boolean }> = [
    { label: "SCOUT NAME", value: show(formData.scoutName) },
    { label: "GAME DATE", value: show(formData.gameDate) },
    { label: "GAME TYPE", value: show(formData.gameType) },
    { label: "GAME LOCATION", value: show(formData.gameLocation) },
    { label: "HOME SCORE", value: scoreText(formData.homeScore) },
    { label: "AWAY SCORE", value: scoreText(formData.awayScore) },
    { label: "WEATHER / TEMPERATURE", value: weatherText },
    { label: "MATCH RESULT", value: matchResultText, wide: true },
  ];
  const playerImageSrc = formData?.playerImage || "/profile_placeholder.png";

  // html2canvas drops cross-origin images that lack CORS headers (e.g. S3 photos),
  // leaving an empty card in the PDF. Remote photos are converted to data URLs
  // through same-origin routes so the exported PDF always contains the photo.
  const [inlinedImage, setInlinedImage] = useState<{ src: string; data: string } | null>(null);
  useEffect(() => {
    const src = playerImageSrc;
    if (!isRemoteUrl(src)) return;
    let cancelled = false;
    inlineImage(src).then((data) => {
      if (!cancelled && data) setInlinedImage({ src, data });
    });
    return () => {
      cancelled = true;
    };
  }, [playerImageSrc]);

  const cardImageSrc =
    inlinedImage && inlinedImage.src === playerImageSrc ? inlinedImage.data : playerImageSrc;
  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    const toastId = toast.loading("Generating PDF report... Please wait.");

    // html2canvas can't parse modern colour functions (oklch/lab…) that Tailwind v4 uses.
    // Convert them to rgba by painting a 1×1 canvas pixel and reading it back — this works
    // even where getComputedStyle returns the oklch() string unchanged (newer Chrome),
    // which previously made every such colour fall back to black.
    const originalGetComputedStyle = window.getComputedStyle;
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    const colorCtx = colorCanvas.getContext("2d", { willReadFrequently: true });
    const colorCache = new Map<string, string>();

    const toRgba = (color: string): string => {
      const cached = colorCache.get(color);
      if (cached) return cached;
      let result = "rgba(0, 0, 0, 0)";
      if (colorCtx) {
        colorCtx.clearRect(0, 0, 1, 1);
        colorCtx.fillStyle = "rgba(0, 0, 0, 0)";
        colorCtx.fillStyle = color;
        colorCtx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = colorCtx.getImageData(0, 0, 1, 1).data;
        result = `rgba(${r}, ${g}, ${b}, ${Number((a / 255).toFixed(3))})`;
      }
      colorCache.set(color, result);
      return result;
    };

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
          return toRgba(match);
        } catch {
          return "rgba(0, 0, 0, 0)";
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

      // Make sure every remote image is embedded before rendering, so the
      // player photo can't be dropped (CORS) or still be loading.
      const remoteSrcs = Array.from(element.querySelectorAll("img"))
        .map((img) => img.getAttribute("src") || "")
        .filter(isRemoteUrl);
      const inlined = new Map<string, string>();
      await Promise.all(
        [...new Set(remoteSrcs)].map(async (src) => {
          const data = await inlineImage(src);
          if (data) inlined.set(src, data);
        })
      );

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
          clonedDoc.querySelectorAll("img").forEach((img) => {
            const data = inlined.get(img.getAttribute("src") || "");
            if (data) {
              img.removeAttribute("srcset");
              img.src = data;
            }
          });
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
      setDownloading(false);
      if (autoDownload) onAutoDownloadDone?.();
    }
  };

  // Off-screen export: download once, after fonts are ready and the layout has settled.
  const downloadRef = useRef(handleDownloadPdf);
  useEffect(() => {
    downloadRef.current = handleDownloadPdf;
  });
  const autoDownloadStarted = useRef(false);
  useEffect(() => {
    if (!autoDownload || autoDownloadStarted.current) return;
    autoDownloadStarted.current = true;
    (async () => {
      try {
        await document.fonts?.ready;
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 300));
      downloadRef.current();
    })();
  }, [autoDownload]);
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
              <Image src="/pdf_logo.jpg" alt="Logo Watermark" className="size-24 object-contain" width={886} height={640} unoptimized />
            </div>
            {/* Header */}
            {/* Brand block (fixed width, never shrinks) + title filling the remaining width */}
            <div className="relative z-10 flex items-center gap-4 border-b-4 border-slate-900 pb-3 mb-4">
              <div className="flex shrink-0 items-center gap-3">
                <Image src="/pdf_logo.jpg" alt="K10 Logo" className="size-20 object-contain" width={886} height={640} unoptimized />
                <div className="whitespace-nowrap">
                  <div className="text-sm font-black tracking-widest text-slate-900 font-orbitron">K10 FOOTBALL</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-orbitron mt-0.5">ANALYSIS CV</div>
                </div>
              </div>
              <div className="min-w-0 flex-1 text-center">
                <h2 className="text-2xl leading-tight font-black text-[#E31B23] font-orbitron uppercase tracking-tighter italic">
                  PLAYER ANALYSIS PROFILE
                </h2>
                <div className="text-[10px] text-slate-900 font-black uppercase tracking-widest mt-1">
                  POSITION : {show(displayPosition)} ⚽
                </div>
              </div>
            </div>
            {/* Body Content */}
            <div className="relative z-10 grid grid-cols-12 gap-6 mb-4">
              {/* Player details */}
              <div className="col-span-8 grid min-w-0 grid-cols-2 content-start gap-x-6 gap-y-2.5 text-[11px] font-medium text-slate-600">
                {playerDetails.map((field) => (
                  <div key={field.label} className="min-w-0">
                    <span className="font-bold text-slate-900 uppercase font-orbitron">{field.label}:</span>
                    <p className="text-slate-700 text-xs font-bold mt-0.5 uppercase break-words">{field.value}</p>
                  </div>
                ))}
              </div>
              {/* FUT player card photo preview */}
              <div className="col-span-4 flex justify-end">
                <div className="w-36 h-48 border-2 border-sky-400 bg-sky-50 rounded-2xl p-2 relative shadow-md flex flex-col items-center justify-between">
                  {/* FUT card header */}
                  <div className="flex justify-between w-full items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className="text-2xl font-black text-sky-600 font-orbitron italic leading-none"
                        title={overallRating === null ? AFTER_SUBMIT_HINT : "Overall rating"}
                      >
                        {overallText}
                      </div>
                      <div className="text-[8px] font-bold text-sky-500 uppercase font-orbitron leading-none mt-0.5">{isGK ? "GK" : displayPosition.slice(0, 3)}</div>
                    </div>
                    <Image src="/logo.png" alt="Club Logo" className="w-5 h-5 object-contain" width={50} height={50} />
                  </div>
                  {/* Player image in FUT Card */}
                  <div className="w-24 h-28 overflow-hidden relative mt-1 flex items-end justify-center">
                    <Image
                      src={cardImageSrc}
                      alt="Player Card Image"
                      className="h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/profile_placeholder.png";
                      }}
                      width={96}
                      height={112}
                      unoptimized
                    />
                  </div>
                  {/* FUT card footer */}
                  <div className="w-full text-center bg-sky-500/10 py-0.5 rounded border border-sky-400/20 mt-1">
                    <div className="text-[10px] font-black text-sky-600 truncate uppercase font-orbitron leading-none">{(formData.playerName || "").trim().split(" ")[0] || NA}</div>
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
                {characteristics && characteristics.length > 0 ? (
                  characteristics.map(tag => (
                    <div key={tag} className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-800">
                      <span className="text-sky-500">⚽</span>
                      <span className="font-orbitron uppercase break-words">{tag}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500 text-xs italic pl-2">No player characteristics listed</span>
                )}
              </div>
            </div>
            {/* Match Information Section */}
            <div className="relative z-10 mb-4">
              <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                MATCH INFORMATION
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-2.5 text-[11px] font-medium text-slate-600 pl-2">
                {matchDetails.map((field) => (
                  <div key={field.label} className={cn("min-w-0", field.wide && "col-span-2")}>
                    <span className="font-bold text-slate-950 font-orbitron">{field.label}:</span>
                    <p className="mt-0.5 text-slate-700 font-bold uppercase break-words">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Match Statistics Section */}
            <div className="relative z-10 mb-4">
              <div className="bg-[#E31B23] text-white font-orbitron px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider mb-3 shadow">
                MATCH STATISTICS
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-[10px] pl-2">
                {statItems.map((item, idx) => (
                  <div key={idx} className="flex min-w-0 items-start justify-between gap-2 border-b border-slate-100 py-1 pr-2">
                    <span className="min-w-0 break-words text-slate-500 font-bold uppercase font-orbitron">{item.label}:</span>
                    <span className="shrink-0 tabular-nums text-slate-800 font-black font-orbitron">
                      {viewOnly && !hasSavedStats ? NA : getStatValue(item.key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* Bottom section (Radar, Overall, Logos) */}
            <div className="relative z-10 flex items-center justify-between border-t-2 border-slate-200 pt-4 mb-4">
              {/* Radar Chart */}
              <div className="flex w-45 justify-center">
                {hasCategoryRatings ? (
                  <RadarChart
                    stats={radarStats}
                    size={140}
                    color="#0284c7"
                    fillColor="rgba(2, 132, 199, 0.25)"
                  />
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex size-35 cursor-help flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-slate-300 p-4 text-center">
                        <IconInfoCircle size={18} className="text-slate-400" />
                        <span className="text-[9px] font-bold uppercase text-slate-500 font-orbitron">
                          {overallRating === null ? "Category ratings available after submit" : "Category ratings not available"}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {overallRating === null ? AFTER_SUBMIT_HINT : "This report has no category ratings."}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              {/* Overall score — from the backend only */}
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1 text-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help text-4xl font-black text-emerald-600 font-orbitron tracking-tighter italic">
                      OVERALL = {overallText}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {overallRating === null ? AFTER_SUBMIT_HINT : "Overall rating calculated by K10 for this report."}
                  </TooltipContent>
                </Tooltip>
                {overallRating === null && (
                  <span className="text-[9px] font-bold uppercase text-slate-500 font-orbitron">
                    Available after submit
                  </span>
                )}
              </div>
              {/* Logo and tag */}
              <div className="flex flex-col items-center gap-1.5 w-45">
                <Image src="/pdf_logo.jpg" alt="K10 Logo" className="size-24 object-contain" width={886} height={640} unoptimized />
                <div className="text-center leading-none">
                  <div className="text-[10px] font-black tracking-widest text-slate-900 font-orbitron">K10 FOOTBALL</div>
                  <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest font-orbitron">ANALYSIS CV</div>
                </div>
              </div>
            </div>
            {/* Diagrams Section */}
            <div className="relative z-10 grid grid-cols-2 items-start gap-8 mt-4 mb-4 shrink-0">
              {/* Goal Diagram */}
              <div className="bg-slat-200 border border-slate-200 rounded-3xl overflow-hidden flex flex-col items-center w-full">
                <div className="bg-slate-100 py-2 px-4 text-center border-b border-slate-200 w-full">
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-orbitron">
                    {isGK ? "Accurate Save" : "Accurate Shots"}
                  </span>
                </div>
                <div className="relative overflow-hidden w-full bg-white" style={{ aspectRatio: "800/500" }}>
                  <Image src="/goal-bar.png" alt="Goal" className="w-full h-auto block scale-[1.4] origin-[50%_90%]" width={800} height={500} />
                  {(!goalMarkers || goalMarkers.length === 0) && (
                    <div className="absolute inset-x-0 bottom-3 flex justify-center">
                      <span className="rounded bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-700 font-orbitron">
                        {isGK ? "No saves recorded" : "No shots recorded"}
                      </span>
                    </div>
                  )}
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
                  {(!pitchMarkers || pitchMarkers.length === 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded bg-white/85 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-slate-700 font-orbitron">
                        {isGK ? "No saves recorded" : "No assists recorded"}
                      </span>
                    </div>
                  )}
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
            onClick={() => onSave(overallRating ?? 0)}
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

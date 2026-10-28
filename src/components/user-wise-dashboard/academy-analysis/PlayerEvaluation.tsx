/* eslint-disable @typescript-eslint/no-unsafe-function-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconStar,
  IconUsers,
  IconFileText,
  IconTrendingUp,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { useAppSelector } from "@/hooks/reduxHooks";
import { EvaluationData } from "@/redux/features/evaluation/evaluationSlice";
import { useGetAcademyPlayerEvaluationsQuery } from "@/redux/features/academy/academyApi";
import { IAcademyEvaluationItem } from "@/types/academy.type";

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
  const router = useRouter();
  const pathname = usePathname();
  const players = useAppSelector((state) => state.player.players);
  const evaluationRecords = useAppSelector((state) => state.evaluation.records);

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal State
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Debounce search input for API query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // RTK Query hook to fetch evaluations dashboard data
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAcademyPlayerEvaluationsQuery({
    searchTerm: debouncedSearch.trim() || undefined,
    page,
    limit,
  });

  const dashboardData = apiResponse?.data;
  const metrics = dashboardData?.metrics;
  const apiEvaluations: IAcademyEvaluationItem[] = dashboardData?.evaluations || [];
  const topPerformers = dashboardData?.topPerformers || [];
  const mostImproved = dashboardData?.mostImproved || [];
  const meta = dashboardData?.meta;

  // Fallback Redux cards (if API is loading or not configured)
  const evaluatedItems = Object.values(evaluationRecords);
  const evaluatedCards = evaluatedItems.map((record) => {
    const player = players.find((p) => p.id === record.playerId);
    const evaluation = record.evaluation;
    const techVal = technicalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    const physVal = physicalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    const mentVal = mentalKeys.reduce((sum, key) => sum + (evaluation[key] ?? 2), 0);
    const totalSum = techVal + physVal + mentVal;
    const rating = Number(((totalSum / 66) * 10).toFixed(1));

    let btnColor = "text-red-500 bg-red-500";
    if (rating >= 8.5) btnColor = "text-emerald-500 bg-emerald-500";
    else if (rating >= 7.5) btnColor = "text-yellow-500 bg-yellow-500";

    let formattedDate = record.date;
    try {
      const d = new Date(record.date);
      formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {}

    return {
      id: record.playerId,
      evaluationId: String(record.playerId),
      name: record.playerName,
      date: formattedDate,
      coach: player?.coachName || "Coach N/A",
      rating,
      overallRatingFormatted: `(${rating}/10)`,
      tech: techVal,
      phys: physVal,
      ment: mentVal,
      pos: player?.position || "Player",
      tag: player ? getPlayerTag(player) : "U-15",
      tier: player?.validationStatus === "verified" ? "TIER 1" : "TIER 2",
      tierBadge: undefined,
      avatar: undefined,
      btnColor,
    };
  });

  const activeEvaluatedNames = new Set(evaluatedCards.map((c) => c.name.toLowerCase()));
  const filteredMockCards = mockCards
    .filter((mc) => !activeEvaluatedNames.has(mc.name.toLowerCase()))
    .map((mc) => ({
      ...mc,
      evaluationId: String(mc.id),
      overallRatingFormatted: `(${mc.rating}/10)`,
      tierBadge: undefined as string | undefined,
      avatar: undefined as string | undefined,
      rawItem: undefined,
    }));
  const fallbackAllCards = [...evaluatedCards, ...filteredMockCards];
  const fallbackFilteredCards = fallbackAllCards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.pos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.coach.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map API evaluations to card format
  const apiCards = apiEvaluations.map((item) => {
    const rawRating = typeof item.overallRating === "number" ? item.overallRating : Number(item.overallRating) || 0;
    const displayRating = rawRating > 10 ? Number((rawRating / 10).toFixed(1)) : rawRating;

    let btnColor = "text-red-500 bg-red-500";
    if (displayRating >= 8.5) btnColor = "text-emerald-500 bg-emerald-500";
    else if (displayRating >= 7.5) btnColor = "text-yellow-500 bg-yellow-500";

    return {
      id: item.evaluationId || item._id,
      evaluationId: item.evaluationId || item._id,
      name: item.player?.name || "Player",
      date: item.formattedDate || (item.evaluationDate ? new Date(item.evaluationDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""),
      coach: item.coach?.name || "Coach N/A",
      rating: displayRating,
      overallRatingFormatted: item.overallRatingFormatted || `(${displayRating}/10)`,
      tech: item.scores?.technical ?? 16,
      phys: item.scores?.physical ?? 16,
      ment: item.scores?.mental ?? 16,
      pos: item.player?.position || "Player",
      tag: item.ageGroup || "U-18",
      tier: item.player?.tier || "TIER 1",
      tierBadge: item.player?.tierBadge,
      avatar: item.player?.avatar,
      btnColor,
      rawItem: item,
    };
  });

  // Decide whether to use API data or fallback
  const isUsingApi = Boolean(apiResponse?.success !== undefined);
  const cardsToRender = isUsingApi ? apiCards : fallbackFilteredCards;

  // Metric Stats
  const avgRatingVal = metrics?.avgOverallRating !== undefined
    ? Number(metrics.avgOverallRating).toFixed(1)
    : fallbackAllCards.length > 0
    ? (fallbackAllCards.reduce((sum, c) => sum + Number(c.rating), 0) / fallbackAllCards.length).toFixed(1)
    : "0.0";

  const improvingCountVal = metrics?.improvingPlayers !== undefined
    ? metrics.improvingPlayers
    : fallbackAllCards.filter((c) => Number(c.rating) >= 8.0).length;

  const thisMonthCount = metrics?.evaluatedThisMonth !== undefined
    ? metrics.evaluatedThisMonth
    : 28;

  const totalEvalsCount = metrics?.totalEvaluations !== undefined
    ? metrics.totalEvaluations
    : fallbackAllCards.length;

  // Retrieve evaluation data object for selected card
  const getEvaluationData = (card: any) => {
    if (!card) return DEFAULT_EVALUATION as EvaluationData;
    const record = evaluationRecords[card.id];
    if (record?.evaluation) {
      return record.evaluation;
    }

    const mockEval = { ...DEFAULT_EVALUATION } as EvaluationData;
    let techLeft = card.tech || 16;
    technicalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(techLeft / 6)));
      mockEval[key] = val;
      techLeft -= val;
    });

    let physLeft = card.phys || 14;
    physicalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(physLeft / 6)));
      mockEval[key] = val;
      physLeft -= val;
    });

    let mentLeft = card.ment || 15;
    mentalKeys.forEach((key) => {
      const val = Math.min(3, Math.max(1, Math.ceil(mentLeft / 6)));
      mockEval[key] = val;
      mentLeft -= val;
    });

    return mockEval;
  };

  // Handle Card Click - Redirect to Details Page
  const handleCardClick = (card: any) => {
    const evalId = card.evaluationId || card.id;
    if (evalId) {
      const basePath = (pathname || "/dashboard/academy/management/player-evaluation").replace(/\/$/, "");
      router.push(`${basePath}/${evalId}`);
    }
  };

  // Handle PDF Preview Click (opens PDF sheet modal directly)
  const handlePdfClick = (card: any) => {
    setSelectedCard(card);
    setSelectedEvaluationId(card.evaluationId || card.id || null);
  };

  // Download PDF Report using html2canvas & jsPDF as fallback
  const handleDownloadPDF = async (): Promise<void> => {
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
    } catch (err) {
      console.error("PDF generation failed:", err);
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
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Player Evaluation
          </h1>
          <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">
            Create and manage player development progress reports
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <SummaryCard
          label="Avg. Overall Rating"
          value={avgRatingVal}
          icon={IconStar}
          bgColor="bg-red-500"
          textColor="text-red-500"
        />
        <SummaryCard
          label="Improving Players"
          value={improvingCountVal}
          icon={IconTrendingUp}
          bgColor="bg-emerald-500"
          textColor="text-emerald-500"
        />
        <SummaryCard
          label="Evaluated this Month"
          value={thisMonthCount}
          icon={IconFileText}
          bgColor="bg-blue-500"
          textColor="text-blue-500"
        />
        <SummaryCard
          label="Total Evaluations"
          value={totalEvalsCount}
          icon={IconUsers}
          bgColor="bg-yellow-500"
          textColor="text-yellow-500"
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6 xl:gap-8 min-w-0">
          {/* Search Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1 min-w-0">
              <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search players by name, team, or position..."
                className="bg-[#111111] border-white/10 h-12 rounded-xl pl-12 text-white font-medium placeholder:text-white/40"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isFetching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconLoader2 size={16} className="text-white/40 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Evaluations Section */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                  Evaluations
                </h2>
                {meta?.total !== undefined && (
                  <span className="text-xs font-bold text-white/40 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                    {meta.total}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 md:gap-6">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase">
                  <div className="size-2.5 rounded-full border-2 border-emerald-400 flex items-center justify-center p-[1px]">
                    <div className="size-full bg-emerald-400 rounded-full" />
                  </div>
                  Technical
                </div>
                <div className="flex items-center gap-2 text-yellow-400 text-[10px] font-bold uppercase">
                  <div className="size-2.5 rounded-full border-2 border-yellow-400 flex items-center justify-center p-[1px]">
                    <div className="size-full bg-yellow-400 rounded-full" />
                  </div>
                  Physical
                </div>
                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase">
                  <div className="size-2.5 rounded-full border-2 border-red-400 flex items-center justify-center p-[1px]">
                    <div className="size-full bg-red-400 rounded-full" />
                  </div>
                  Mental
                </div>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#111111] border border-white/10 rounded-3xl p-6 flex flex-col gap-5 shimmer"
                  >
                    <div className="w-16 h-5 bg-white/10 rounded-full" />
                    <div className="flex flex-col gap-2">
                      <div className="w-24 h-3 bg-white/5 rounded-sm" />
                      <div className="w-40 h-6 bg-white/10 rounded-sm" />
                      <div className="w-32 h-3 bg-white/5 rounded-sm" />
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="w-20 h-4 bg-white/10 rounded-sm" />
                      <div className="w-16 h-4 bg-white/5 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {cardsToRender.map((card, idx) => (
                  <EvaluationCard
                    key={card.evaluationId ? `${card.evaluationId}-${idx}` : `card-${idx}`}
                    {...card}
                    onClick={() => handleCardClick(card)}
                    onPdfClick={() => handlePdfClick(card)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && cardsToRender.length === 0 && (
              <div className="text-center py-20 bg-[#111111] rounded-3xl border border-white/10">
                <IconFileText size={48} className="mx-auto text-white/20 mb-4" />
                <p className="text-white/60 font-bold">
                  No evaluation records found matching your criteria.
                </p>
                {debouncedSearch && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mt-4 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-wider"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {meta?.totalPage !== undefined && meta.totalPage > 1 && (
              <div className="flex justify-between items-center pt-4 border-t border-white/10 text-white/60 text-xs font-bold">
                <p>
                  Page {meta.page} of {meta.totalPage} ({meta.total} Total)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 bg-[#111111] border border-white/10 rounded-lg hover:border-white/30 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <IconChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={page >= meta.totalPage || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-2 bg-[#111111] border border-white/10 rounded-lg hover:border-white/30 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <IconChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <PlayerEvaluationSidebar
          mostImproved={mostImproved}
          topPerformers={topPerformers}
          isLoading={isLoading}
        />
      </div>

      {/* Evaluation Report Sheet Dialog Modal */}
      <EvaluationReportModal
        selectedCard={selectedCard}
        selectedEvaluationId={selectedEvaluationId}
        setSelectedCard={setSelectedCard}
        handleDownloadPDF={handleDownloadPDF}
        isGeneratingPdf={isGeneratingPdf}
        activeEvaluationData={activeEvaluationData}
      />
    </div>
  );
};

export default PlayerEvaluation;

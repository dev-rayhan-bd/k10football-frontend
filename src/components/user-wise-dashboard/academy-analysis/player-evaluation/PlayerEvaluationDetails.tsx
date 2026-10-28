"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  IconArrowLeft,
  IconDownload,
  IconFileText,
  IconCalendar,
  IconClock,
  IconBuilding,
  IconTarget,
  IconActivity,
  IconFlame,
  IconTrophy,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

import { useGetPlayerEvaluationDetailsQuery } from "@/redux/features/academy/academyApi";
import { EvaluationReportModal } from "./EvaluationReportModal";
import { DEFAULT_EVALUATION } from "./utils";
import { EvaluationData } from "@/redux/features/evaluation/evaluationSlice";

export const PlayerEvaluationDetails = () => {
  const router = useRouter();
  const params = useParams();
  const evaluationId = (params?.id as string) || "";

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch single player evaluation details from API
  const {
    data: detailsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetPlayerEvaluationDetailsQuery(evaluationId, {
    skip: !evaluationId,
  });

  const evaluationData = detailsResponse?.data;
  const player = evaluationData?.player;
  const evaluation = evaluationData?.evaluation;

  // Format dates
  const formattedDate = evaluation?.date
    ? new Date(evaluation.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const formattedDueDate = evaluation?.nextEvaluationDue
    ? new Date(evaluation.nextEvaluationDue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Overall rating display (handle 10-scale and 100-scale)
  const rawOverall = evaluation?.overallRating ?? player?.rating ?? 79;
  const displayRating10 = rawOverall > 10 ? (rawOverall / 10).toFixed(1) : Number(rawOverall).toFixed(1);
  const ratingPercent = Math.min(100, Math.max(0, rawOverall > 10 ? rawOverall : rawOverall * 10));

  // Rating badge styling
  const getRatingBadge = (val?: string) => {
    if (!val) return null;
    const upper = val.toUpperCase();
    if (upper.includes("IMPROVE")) {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
          Improvement
        </span>
      );
    }
    if (upper.includes("EXCELLENT")) {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          Excellent
        </span>
      );
    }
    return (
      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
        Good
      </span>
    );
  };

  // Convert technique/characteristic/physical strings into numeric 1, 2, 3 for EvaluationReportModal
  const buildModalEvaluationData = (): EvaluationData => {
    const data = { ...DEFAULT_EVALUATION };
    const mapVal = (v?: string): number => {
      if (!v) return 2;
      const u = v.toUpperCase();
      if (u.includes("IMPROVE")) return 1;
      if (u.includes("EXCELLENT")) return 3;
      return 2;
    };

    if (evaluation?.techniques) {
      const t = evaluation.techniques;
      data.dribbling = mapVal(t.dribbling);
      data.ballMastery = mapVal(t.ballMastery);
      data.runningWithBall = mapVal(t.runningWithBall);
      data.rangePassing = mapVal(t.rangeOfPassing || t.rangePassing);
      data.strikingFinishing = mapVal(t.strikingFinishing);
      data.defending = mapVal(t.defending);
      data.firstTouch = mapVal(t.firstTouch);
      data.nonDominantFoot = mapVal(t.nonDominantFoot);
    }

    if (evaluation?.characteristics) {
      const c = evaluation.characteristics;
      data.gameAwareness = mapVal(c.gameAwareness);
      data.gamesUnderstanding = mapVal(c.gamesUnderstanding);
      data.decisionMaking = mapVal(c.decisionMaking);
      data.concentration = mapVal(c.concentration);
      data.leadership = mapVal(c.leadership);
      data.desire = mapVal(c.desire);
      data.maturity = mapVal(c.maturity);
    }

    if (evaluation?.physical) {
      const p = evaluation.physical;
      data.speedAcceleration = mapVal(p.speedAcceleration);
      data.movement = mapVal(p.movement);
      data.balance = mapVal(p.balance);
      data.power = mapVal(p.power);
      data.strength = mapVal(p.strength);
      data.agility = mapVal(p.agility);
      data.coordination = mapVal(p.coordination);
    }

    return data;
  };

  const modalActiveEvaluationData = buildModalEvaluationData();

  // Synthetic card for EvaluationReportModal
  const modalSelectedCard = player
    ? {
        id: evaluation?._id || evaluationId,
        evaluationId: evaluation?._id || evaluationId,
        name: player.name,
        date: formattedDate,
        coach: "Academy Coach",
        rating: displayRating10,
        pos: player.position,
        tag: `U-${player.age || 18}`,
        tier: "TIER 1",
        avatar: player.avatar,
      }
    : null;

  // Fallback PDF generation
  const handleDownloadPDF = async (): Promise<void> => {
    const page1 = document.getElementById("report-page-1");
    const page2 = document.getElementById("report-page-2");

    if (!page1 || !page2) {
      toast.error("Evaluation report elements not found. Please open the PDF preview sheet first.");
      return;
    }

    const toastId = toast.loading("Generating PDF report... Please wait.");
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF("l", "mm", "a4");
      const imgWidth = 297;
      const imgHeight = 210;

      const canvas1 = await html2canvas(page1, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const canvas2 = await html2canvas(page2, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });

      const imgData1 = canvas1.toDataURL("image/png");
      pdf.addImage(imgData1, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.addPage();
      const imgData2 = canvas2.toDataURL("image/png");
      pdf.addImage(imgData2, "PNG", 0, 0, imgWidth, imgHeight);

      pdf.save(`Evaluation_Report_${(player?.name || "Player").replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF report downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.", { id: toastId });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <IconLoader2 size={40} className="text-red-500 animate-spin" />
        <p className="text-white/60 font-medium font-orbitron text-sm uppercase tracking-wider">
          Loading player evaluation details...
        </p>
      </div>
    );
  }

  if (isError || !player || !evaluation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <IconAlertCircle size={32} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white font-orbitron uppercase">
            Evaluation Not Found
          </h2>
          <p className="text-white/60 text-sm mt-2">
            The requested player evaluation details could not be retrieved.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <IconArrowLeft size={16} /> Go Back
          </button>
          <button
            type="button"
            onClick={() => refetch()}
            className="bg-[#E31B23] hover:bg-[#ff2d35] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider"
        >
          <IconArrowLeft size={16} /> Back to Evaluations
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#111111] hover:bg-white/5 border border-white/20 hover:border-white/40 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <IconFileText size={16} /> View PDF Sheet
          </button>
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-black uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(227,27,35,0.3)] cursor-pointer"
          >
            <IconDownload size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Hero Banner: Player Profile & Evaluation Overview */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 min-w-0">
          {/* Avatar */}
          <div className="relative size-24 md:size-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-white/5 shrink-0">
            <Image
              src={player.avatar || "/placeholder_img.jpg"}
              alt={player.name}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder_img.jpg";
              }}
            />
          </div>

          {/* Player Info */}
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {evaluation.status || "EVALUATED"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                U-{player.age || 18}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                {player.position}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white font-orbitron uppercase tracking-tight truncate">
              {player.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60 font-medium">
              <div className="flex items-center gap-1.5">
                <IconBuilding size={14} className="text-white/40" />
                <span>{player.centre || "Manchester City Academy"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IconCalendar size={14} className="text-white/40" />
                <span>Evaluated: {formattedDate}</span>
              </div>
              {formattedDueDate && (
                <div className="flex items-center gap-1.5 text-yellow-400/90 font-bold">
                  <IconClock size={14} />
                  <span>Next Due: {formattedDueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall Rating Box */}
        <div className="flex flex-col items-start lg:items-end w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
            Overall Rating
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black font-orbitron text-white">
              {displayRating10}
            </span>
            <span className="text-white/40 text-sm font-bold">/ 10</span>
          </div>
          <div className="w-full lg:w-48 h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${ratingPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {/* Technical */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <IconTarget size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Technical</p>
              <h3 className="text-2xl font-black text-white font-orbitron mt-0.5">
                {evaluation.technicalScore ?? 78}
                <span className="text-xs text-white/40 font-normal"> / 100</span>
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
            Score
          </span>
        </div>

        {/* Physical */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <IconFlame size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Physical</p>
              <h3 className="text-2xl font-black text-white font-orbitron mt-0.5">
                {evaluation.physicalScore ?? 78}
                <span className="text-xs text-white/40 font-normal"> / 100</span>
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
            Score
          </span>
        </div>

        {/* Mental */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <IconActivity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Mental</p>
              <h3 className="text-2xl font-black text-white font-orbitron mt-0.5">
                {evaluation.mentalScore ?? 82}
                <span className="text-xs text-white/40 font-normal"> / 100</span>
              </h3>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">
            Score
          </span>
        </div>
      </div>

      {/* Detailed Skill Breakdowns (3 Sections) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technical Skills */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
              <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <IconTarget size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-orbitron uppercase">
                  Technical
                </h3>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  8 Core Techniques
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Dribbling", val: evaluation.techniques?.dribbling },
                { label: "Ball Mastery", val: evaluation.techniques?.ballMastery },
                { label: "Running With Ball", val: evaluation.techniques?.runningWithBall },
                { label: "Range of Passing", val: evaluation.techniques?.rangeOfPassing || evaluation.techniques?.rangePassing },
                { label: "Striking / Finishing", val: evaluation.techniques?.strikingFinishing },
                { label: "Defending", val: evaluation.techniques?.defending },
                { label: "First Touch", val: evaluation.techniques?.firstTouch },
                { label: "Non-dominant Foot", val: evaluation.techniques?.nonDominantFoot },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-xs font-semibold text-white/80">{item.label}</span>
                  {getRatingBadge(item.val)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mental Characteristics */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
              <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <IconActivity size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-orbitron uppercase">
                  Characteristics
                </h3>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  7 Mental Attributes
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Game Awareness", val: evaluation.characteristics?.gameAwareness },
                { label: "Games Understanding", val: evaluation.characteristics?.gamesUnderstanding },
                { label: "Decision Making", val: evaluation.characteristics?.decisionMaking },
                { label: "Concentration", val: evaluation.characteristics?.concentration },
                { label: "Leadership", val: evaluation.characteristics?.leadership },
                { label: "Desire", val: evaluation.characteristics?.desire },
                { label: "Maturity", val: evaluation.characteristics?.maturity },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-xs font-semibold text-white/80">{item.label}</span>
                  {getRatingBadge(item.val)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Physical Assessment */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 md:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-white/10">
              <div className="size-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <IconFlame size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-orbitron uppercase">
                  Physical Core
                </h3>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                  7 Physical Factors
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { label: "Speed + Acceleration", val: evaluation.physical?.speedAcceleration },
                { label: "Movement", val: evaluation.physical?.movement },
                { label: "Balance", val: evaluation.physical?.balance },
                { label: "Power", val: evaluation.physical?.power },
                { label: "Strength", val: evaluation.physical?.strength },
                { label: "Agility", val: evaluation.physical?.agility },
                { label: "Co-ordination", val: evaluation.physical?.coordination },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-xs font-semibold text-white/80">{item.label}</span>
                  {getRatingBadge(item.val)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluator Notes / Feedback Box */}
      {evaluation.notes && (
        <div className="bg-[#111111] border border-white/20 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="size-10 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center">
              <IconTrophy size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-orbitron uppercase">
                Coach Assessment & Notes
              </h3>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">
                Evaluator Remarks
              </p>
            </div>
          </div>

          <blockquote className="text-white/80 text-sm md:text-base leading-relaxed italic bg-white/5 p-5 rounded-2xl border border-white/10">
            &ldquo;{evaluation.notes}&rdquo;
          </blockquote>

          {formattedDueDate && (
            <div className="flex items-center justify-between text-xs text-white/40 font-medium pt-2">
              <span>Next cycle evaluation milestone:</span>
              <span className="text-white font-bold">{formattedDueDate}</span>
            </div>
          )}
        </div>
      )}

      {/* Printable Evaluation Report Modal for PDF Preview & Download */}
      <EvaluationReportModal
        selectedCard={isPdfModalOpen ? modalSelectedCard : null}
        selectedEvaluationId={evaluation?._id || evaluationId}
        setSelectedCard={() => setIsPdfModalOpen(false)}
        handleDownloadPDF={handleDownloadPDF}
        isGeneratingPdf={isGeneratingPdf}
        activeEvaluationData={modalActiveEvaluationData}
      />
    </div>
  );
};

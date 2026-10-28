/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconDownload, IconTrophy, IconFlame, IconTarget, IconActivity } from "@tabler/icons-react";
import { toast } from "sonner";
import { EvaluationData } from "@/redux/features/evaluation/evaluationSlice";
import { useGetAcademyPlayerEvaluationPdfQuery } from "@/redux/features/academy/academyApi";
import { BASE_URL } from "@/constants/global.constant";
import { getToken } from "@/helpers/SessionHelper";
import { DEFAULT_EVALUATION } from "./utils";

interface EvaluationReportModalProps {
  selectedCard: any | null;
  selectedEvaluationId: string | null;
  setSelectedCard: (card: any | null) => void;
  handleDownloadPDF: () => Promise<void>;
  isGeneratingPdf: boolean;
  activeEvaluationData: EvaluationData;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({
  selectedCard,
  selectedEvaluationId,
  setSelectedCard,
  handleDownloadPDF,
  isGeneratingPdf,
  activeEvaluationData,
}) => {
  const [scale, setScale] = React.useState(1);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Fetch dynamic PDF report data from API
  const { data: pdfResponse, isLoading: isPdfLoading } = useGetAcademyPlayerEvaluationPdfQuery(
    selectedEvaluationId || "",
    { skip: !selectedEvaluationId }
  );

  const pdfData = pdfResponse?.data;

  React.useEffect(() => {
    const handleResize = () => {
      // 1130px is the width of the PDF page, plus padding
      const padding = window.innerWidth < 768 ? 32 : 64;
      const availableWidth = window.innerWidth - padding;

      if (availableWidth < 1130) {
        setScale(availableWidth / 1130);
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRatingLabel = (val: number) => {
    if (val === 1) return "Improvement";
    if (val === 2) return "Good";
    if (val === 3) return "Excellent";
    return "";
  };

  const getRatingColor = (val: number) => {
    if (val === 1) return "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]";
    if (val === 2) return "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]";
    if (val === 3) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    return "bg-transparent border border-gray-200";
  };

  const getSkillValue = (
    section: "techniques" | "characteristics" | "physical",
    key: string
  ): number => {
    if (pdfData?.breakdown?.[section]) {
      const breakdownSection = pdfData.breakdown[section] as Record<string, string | undefined>;
      let rawVal = breakdownSection[key];
      // Special check for key variants like rangeOfPassing vs rangePassing
      if (!rawVal && key === "rangePassing") {
        rawVal = breakdownSection["rangeOfPassing"];
      } else if (!rawVal && key === "rangeOfPassing") {
        rawVal = breakdownSection["rangePassing"];
      }

      if (rawVal) {
        const upper = String(rawVal).toUpperCase();
        if (upper.includes("IMPROVE")) return 1;
        if (upper.includes("EXCELLENT")) return 3;
        if (upper.includes("GOOD")) return 2;
      }
    }

    const fallbackVal = (activeEvaluationData as any)?.[key];
    if (typeof fallbackVal === "number") return fallbackVal;
    return 2;
  };

  const renderReadOnlyRatingCircle = (
    section: "techniques" | "characteristics" | "physical",
    skillKey: string,
    targetValue: number
  ) => {
    const currentValue = getSkillValue(section, skillKey);
    const isSelected = currentValue === targetValue;

    return (
      <div className="flex flex-col items-center gap-1 w-14">
        <div
          className={`size-3.5 rounded-full ${isSelected ? getRatingColor(targetValue) : "bg-transparent border border-gray-200"}`}
        />
        <span className={`text-[8px] font-bold ${isSelected ? "text-gray-800" : "text-gray-400"}`}>
          {isSelected ? getRatingLabel(targetValue) : ""}
        </span>
      </div>
    );
  };

  // Download PDF Handler with API downloadUrl first, then client-side fallback
  const handleDownload = async () => {
    if (isDownloading || isGeneratingPdf) return;
    setIsDownloading(true);

    const playerName = pdfData?.player?.name || selectedCard?.name || "Player";
    const downloadFileName = `Evaluation_Report_${playerName.replace(/\s+/g, "_")}.pdf`;

    if (pdfData?.downloadUrl) {
      try {
        const token = getToken();
        const baseOrigin = BASE_URL.replace(/\/api\/v1\/?$/, "");
        const targetUrl = pdfData.downloadUrl.startsWith("http")
          ? pdfData.downloadUrl
          : `${baseOrigin}${pdfData.downloadUrl.startsWith("/") ? "" : "/"}${pdfData.downloadUrl}`;

        const res = await fetch(targetUrl, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
          },
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("pdf") || contentType.includes("octet-stream")) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("PDF report downloaded successfully!");
            setIsDownloading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend PDF download fallback to client rendering:", err);
      }
    }

    try {
      await handleDownloadPDF();
    } finally {
      setIsDownloading(false);
    }
  };

  const playerName = pdfData?.player?.name || selectedCard?.name || "Player";
  const displayRating = pdfData?.overallRating
    ? (pdfData.overallRating > 10 ? (pdfData.overallRating / 10).toFixed(1) : Number(pdfData.overallRating).toFixed(1))
    : (selectedCard?.rating ? Number(selectedCard.rating).toFixed(1) : "7.9");

  return (
    <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
      <DialogContent
        showCloseButton={false}
        className="w-screen! h-screen! max-w-none! max-h-none! top-0! left-0! translate-x-0! translate-y-0! rounded-none! border-none! bg-black/98 text-white p-4 md:p-8 overflow-hidden flex flex-col"
      >
        <DialogHeader className="flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 pb-4 border-b border-white/10 mb-6 gap-4 md:gap-0">
          <div>
            <DialogTitle className="text-xl md:text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Player Evaluation Report
            </DialogTitle>
            <p className="text-[10px] md:text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
              Development Report Sheet Overlay for {playerName}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            {isPdfLoading && (
              <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                Loading details...
              </span>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isGeneratingPdf}
              className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.2)] cursor-pointer disabled:opacity-50"
            >
              <IconDownload size={16} />{" "}
              {isDownloading || isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="text-white/40 hover:text-white px-4 py-2.5 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              Close Overlay
            </button>
          </div>
        </DialogHeader>

        {selectedCard && (
          <div className="w-full overflow-x-hidden overflow-y-auto custom-scrollbar pb-10 flex-1 flex flex-col items-center">
            {/* Mobile Scroll Hint */}
            <div className="md:hidden flex flex-col items-center justify-center text-white/50 mb-4 animate-pulse">
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Scroll down to view full report
              </span>
            </div>

            <div
              className="relative transition-transform duration-200 ease-out"
              style={{
                width: `${1130 * scale}px`,
                height: `${(1600 * 2 + 32) * scale}px`,
              }}
            >
              <div
                className="flex flex-col gap-8 absolute top-0 left-0"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  width: "1130px",
                }}
              >
                {/* Page 1 */}
                <div
                  id="report-page-1"
                  className="w-282.5 h-[1600px] bg-white text-black p-16 shadow-2xl relative overflow-hidden shrink-0"
                >
                  <div className="absolute top-0 right-0 size-150 bg-gray-50 rounded-bl-[100%] -z-10" />
                  <div className="absolute bottom-0 left-0 w-200 h-100 bg-red-50/50 rounded-tr-[100%] -z-10" />

                  {/* Header */}
                  <div className="flex justify-between items-start border-b-4 border-red-600 pb-10 mb-10 relative">
                    <div>
                      <h1 className="text-6xl font-black font-orbitron text-gray-900 tracking-tighter uppercase mb-2">
                        Evaluation
                        <br />
                        Report
                      </h1>
                      <p className="text-red-600 font-black tracking-widest uppercase text-sm">
                        {pdfData?.academy?.name || "Professional Development Academy"}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {pdfData?.academy?.logo ? (
                        <div className="relative size-24 rounded-2xl overflow-hidden mb-4 shadow-xl border border-gray-100 bg-white">
                          <Image
                            src={pdfData.academy.logo}
                            alt={pdfData.academy.name || "Academy"}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="size-24 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 ml-auto shadow-xl">
                          <span className="text-white font-orbitron font-black text-3xl">K10</span>
                        </div>
                      )}
                      <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                        {pdfData?.cycle || "Season 25/26"}
                      </p>
                      <p className="text-gray-400 font-medium text-xs mt-1">
                        Generated: {pdfData?.formattedDate || selectedCard.date}
                      </p>
                    </div>
                  </div>

                  {/* Player Summary Card */}
                  <div className="flex gap-10 mb-12">
                    <div className="w-1/3">
                      <div className="relative w-full aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                        <Image
                          src={
                            pdfData?.player?.avatar ||
                            selectedCard.avatar ||
                            selectedCard.img ||
                            "/placeholder_img.jpg"
                          }
                          alt={playerName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder_img.jpg";
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                          <p className="text-red-500 font-black text-sm tracking-widest uppercase mb-1">
                            {selectedCard.tierBadge || selectedCard.tier || "TIER 1"}
                          </p>
                          <h2 className="text-white text-3xl font-black font-orbitron truncate">
                            {playerName}
                          </h2>
                          {(pdfData?.player?.currentClub || pdfData?.player?.academy) && (
                            <p className="text-white/70 text-xs font-semibold truncate mt-0.5">
                              {pdfData.player.currentClub || pdfData.player.academy}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-2/3 flex flex-col justify-center gap-8">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 size-16 bg-red-50 rounded-bl-full" />
                          <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">
                            Position
                          </p>
                          <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10 truncate">
                            {pdfData?.player?.position || selectedCard.pos}
                          </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 size-16 bg-red-50 rounded-bl-full" />
                          <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">
                            Coach
                          </p>
                          <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10 truncate">
                            {pdfData?.coach?.name || selectedCard.coach}
                          </p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                          <div className="absolute top-0 right-0 size-16 bg-red-50 rounded-bl-full" />
                          <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">
                            Category
                          </p>
                          <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10">
                            {selectedCard.tag || (pdfData?.player?.age ? `U-${pdfData.player.age}` : "U-18")}
                          </p>
                        </div>
                        <div className="bg-gray-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 size-16 bg-red-600 rounded-bl-full opacity-20" />
                          <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-1 relative z-10">
                            Overall Rating
                          </p>
                          <div className="flex items-baseline gap-2 relative z-10">
                            <p className="text-white text-4xl font-black font-orbitron">{displayRating}</p>
                            <p className="text-white/40 text-sm font-bold">/ 10</p>
                            {pdfData?.grade && (
                              <span className="ml-auto text-emerald-400 text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-400/20">
                                {pdfData.grade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Technical & Mental Breakdown */}
                  <div className="grid grid-cols-2 gap-10">
                    {/* Technical */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                        <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <IconTarget size={24} />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">
                            Technical
                          </h3>
                          {pdfData?.categoryScores?.technical !== undefined && (
                            <span className="text-xs font-black font-orbitron text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                              Score: {pdfData.categoryScores.technical}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                          <span>Skill</span>
                          <div className="flex gap-2 w-45 justify-between text-center">
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Improvement
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Good
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Excellent
                            </span>
                          </div>
                        </div>
                        {[
                          { label: "Dribbling", key: "dribbling" },
                          { label: "Ball Mastery", key: "ballMastery" },
                          { label: "Running with Ball", key: "runningWithBall" },
                          { label: "Range of Passing", key: "rangeOfPassing" },
                          { label: "Striking / Finishing", key: "strikingFinishing" },
                          { label: "Defending", key: "defending" },
                          { label: "First Touch", key: "firstTouch" },
                          { label: "Non-dominant foot", key: "nonDominantFoot" },
                        ].map((skill) => (
                          <div
                            key={skill.key}
                            className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                            <div className="flex gap-2 w-45 justify-between">
                              {renderReadOnlyRatingCircle("techniques", skill.key, 1)}
                              {renderReadOnlyRatingCircle("techniques", skill.key, 2)}
                              {renderReadOnlyRatingCircle("techniques", skill.key, 3)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mental */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                        <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <IconActivity size={24} />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">
                            Mental
                          </h3>
                          {pdfData?.categoryScores?.mental !== undefined && (
                            <span className="text-xs font-black font-orbitron text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                              Score: {pdfData.categoryScores.mental}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                          <span>Skill</span>
                          <div className="flex gap-2 w-45 justify-between text-center">
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Improvement
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Good
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Excellent
                            </span>
                          </div>
                        </div>
                        {[
                          { label: "Game Awareness", key: "gameAwareness" },
                          { label: "Games Understanding", key: "gamesUnderstanding" },
                          { label: "Decision Making", key: "decisionMaking" },
                          { label: "Concentration", key: "concentration" },
                          { label: "Leadership", key: "leadership" },
                          { label: "Desire", key: "desire" },
                          { label: "Maturity", key: "maturity" },
                        ].map((skill) => (
                          <div
                            key={skill.key}
                            className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                            <div className="flex gap-2 w-45 justify-between">
                              {renderReadOnlyRatingCircle("characteristics", skill.key, 1)}
                              {renderReadOnlyRatingCircle("characteristics", skill.key, 2)}
                              {renderReadOnlyRatingCircle("characteristics", skill.key, 3)}
                            </div>
                          </div>
                        ))}
                        <div className="py-0.5 opacity-0 pointer-events-none select-none text-[10px] font-bold">
                          Spacer
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Page 1 of 2</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 font-black text-4xl font-orbitron tracking-tighter opacity-50">
                        K10-FOOTBALL
                      </p>
                    </div>
                  </div>
                </div>

                {/* Page 2 */}
                <div
                  id="report-page-2"
                  className="w-282.5 h-[1600px] bg-white text-black p-16 shadow-2xl relative overflow-hidden shrink-0"
                >
                  <div className="absolute top-0 left-0 w-full h-75 bg-gray-50 -z-10" />

                  {/* Header */}
                  <div className="flex justify-between items-start border-b-4 border-gray-200 pb-8 mb-12 relative">
                    <div>
                      <h2 className="text-4xl font-black font-orbitron text-gray-900 tracking-tighter uppercase mb-1">
                        Physical Assessment
                      </h2>
                      <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                        {playerName} • {selectedCard.tag || (pdfData?.player?.age ? `U-${pdfData.player.age}` : "U-18")}
                      </p>
                    </div>
                    <div className="size-16 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-orbitron font-black text-xl">K10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    {/* Physical Core */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                      <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                        <div className="size-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                          <IconFlame size={24} />
                        </div>
                        <div className="flex items-center justify-between flex-1">
                          <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">
                            Physical Core
                          </h3>
                          {pdfData?.categoryScores?.physical !== undefined && (
                            <span className="text-xs font-black font-orbitron text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                              Score: {pdfData.categoryScores.physical}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                          <span>Skill</span>
                          <div className="flex gap-2 w-45 justify-between text-center">
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Improvement
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Good
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Excellent
                            </span>
                          </div>
                        </div>
                        {[
                          { label: "Speed + Acceleration", key: "speedAcceleration" },
                          { label: "Movement", key: "movement" },
                          { label: "Balance", key: "balance" },
                          { label: "Power", key: "power" },
                        ].map((skill) => (
                          <div
                            key={skill.key}
                            className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                            <div className="flex gap-2 w-45 justify-between">
                              {renderReadOnlyRatingCircle("physical", skill.key, 1)}
                              {renderReadOnlyRatingCircle("physical", skill.key, 2)}
                              {renderReadOnlyRatingCircle("physical", skill.key, 3)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 mt-6 pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-center text-[7px] font-black uppercase text-gray-400 tracking-wider pb-1">
                          <span>Skill</span>
                          <div className="flex gap-2 w-45 justify-between text-center">
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Improvement
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Good
                            </span>
                            <span className="w-14 text-[8px] font-black uppercase text-gray-400 tracking-wider">
                              Excellent
                            </span>
                          </div>
                        </div>
                        {[
                          { label: "Strength", key: "strength" },
                          { label: "Agility", key: "agility" },
                          { label: "Co-ordination", key: "coordination" },
                        ].map((skill) => (
                          <div
                            key={skill.key}
                            className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                            <div className="flex gap-2 w-45 justify-between">
                              {renderReadOnlyRatingCircle("physical", skill.key, 1)}
                              {renderReadOnlyRatingCircle("physical", skill.key, 2)}
                              {renderReadOnlyRatingCircle("physical", skill.key, 3)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dynamic Coach Feedback & Assessment Notes */}
                    <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-4 mb-6 pb-4 border-b-2 border-gray-200">
                          <div className="size-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                            <IconTrophy size={24} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">
                              Coach Feedback
                            </h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                              By {pdfData?.coach?.name || selectedCard.coach}{" "}
                              {pdfData?.coach?.license ? `(${pdfData.coach.license})` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">
                              Evaluator Feedback & Recommendations
                            </p>
                            <p className="text-gray-800 text-sm leading-relaxed font-medium">
                              {pdfData?.coachFeedback ||
                                pdfData?.notes ||
                                "Excellent tactical discipline and maturity. Needs to develop non-dominant foot passing and core physical strength."}
                            </p>
                          </div>

                          {pdfData?.categoryScores && (
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400">Technical</p>
                                <p className="text-xl font-black font-orbitron text-gray-900 mt-1">
                                  {pdfData.categoryScores.technical}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400">Physical</p>
                                <p className="text-xl font-black font-orbitron text-gray-900 mt-1">
                                  {pdfData.categoryScores.physical}
                                </p>
                              </div>
                              <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                <p className="text-[9px] font-black uppercase text-gray-400">Mental</p>
                                <p className="text-xl font-black font-orbitron text-gray-900 mt-1">
                                  {pdfData.categoryScores.mental}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-200 mt-6 flex justify-between items-center text-xs text-gray-500 font-semibold">
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">
                            Next Evaluation Due
                          </span>
                          <span className="text-gray-800 font-bold">
                            {pdfData?.nextEvaluationDue || "TBD"}
                          </span>
                        </div>
                        {pdfData?.grade && (
                          <div className="text-right">
                            <span className="text-gray-400 font-bold uppercase text-[10px] block">
                              Overall Grade
                            </span>
                            <span className="text-emerald-600 font-black font-orbitron">
                              {pdfData.grade}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Page 2 of 2</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 font-black text-4xl font-orbitron tracking-tighter opacity-50">
                        K10-FOOTBALL
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

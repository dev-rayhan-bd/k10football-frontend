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
import { EvaluationData } from "@/lib/features/evaluation/evaluationSlice";
import {
  DEFAULT_EVALUATION
} from "./utils";

interface EvaluationReportModalProps {
  selectedCard: any | null;
  setSelectedCard: (card: any | null) => void;
  handleDownloadPDF: () => void;
  isGeneratingPdf: boolean;
  activeEvaluationData: EvaluationData;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({
  selectedCard,
  setSelectedCard,
  handleDownloadPDF,
  isGeneratingPdf,
  activeEvaluationData
}) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const handleResize = () => {
      // 1130px is the width of the PDF page, plus some padding
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

  const renderReadOnlyRatingCircle = (skillKey: keyof EvaluationData, targetValue: number, evalData: EvaluationData) => {
    const isSelected = evalData[skillKey] === targetValue;
    return (
      <div className="flex flex-col items-center gap-1 w-14">
        <div
          className={`w-3.5 h-3.5 rounded-full ${isSelected ? getRatingColor(targetValue) : 'bg-transparent border border-gray-200'}`}
        />
        <span className={`text-[8px] font-bold ${isSelected ? 'text-gray-800' : 'text-gray-400'}`}>
          {isSelected ? getRatingLabel(targetValue) : ''}
        </span>
      </div>
    );
  };

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
              Development Report Sheet Overlay for {selectedCard?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:gap-4 items-center">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#ff2d35] border border-transparent text-[10px] font-black uppercase tracking-widest text-white px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(227,27,35,0.2)] cursor-pointer disabled:opacity-50"
            >
              <IconDownload size={16} /> {isGeneratingPdf ? "Generating..." : "Download PDF"}
            </button>
            <button
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
              <span className="text-[10px] font-bold uppercase tracking-widest">Scroll down to view full report</span>
            </div>

            <div 
              className="relative transition-transform duration-200 ease-out" 
              style={{ 
                width: `${1130 * scale}px`, 
                height: `${(1600 * 2 + 32) * scale}px` 
              }}
            >
              <div 
                className="flex flex-col gap-8 absolute top-0 left-0"
                style={{ 
                  transform: `scale(${scale})`, 
                  transformOrigin: 'top left',
                  width: '1130px'
                }}
              >
                <div id="report-page-1" className="w-282.5 h-[1600px] bg-white text-black p-16 shadow-2xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 right-0 w-150 h-150 bg-gray-50 rounded-bl-[100%] -z-10" />
              <div className="absolute bottom-0 left-0 w-200 h-100 bg-red-50/50 rounded-tr-[100%] -z-10" />
              <div className="flex justify-between items-start border-b-4 border-red-600 pb-10 mb-10 relative">
                <div>
                  <h1 className="text-6xl font-black font-orbitron text-gray-900 tracking-tighter uppercase mb-2">Evaluation<br />Report</h1>
                  <p className="text-red-600 font-black tracking-widest uppercase text-sm">Professional Development Academy</p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 ml-auto shadow-xl">
                    <span className="text-white font-orbitron font-black text-3xl">K10</span>
                  </div>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Season 25/26</p>
                  <p className="text-gray-400 font-medium text-xs mt-1">Generated: {selectedCard.date}</p>
                </div>
              </div>

              <div className="flex gap-10 mb-12">
                <div className="w-1/3">
                  <div className="relative w-full aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                    <Image
                      src={selectedCard.img || "/placeholder_img.jpg"}
                      alt={selectedCard.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder_img.jpg";
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 pt-20">
                      <p className="text-red-500 font-black text-sm tracking-widest uppercase mb-1">{selectedCard.tier}</p>
                      <h2 className="text-white text-3xl font-black font-orbitron truncate">{selectedCard.name}</h2>
                    </div>
                  </div>
                </div>
                <div className="w-2/3 flex flex-col justify-center gap-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full" />
                      <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">Position</p>
                      <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10">{selectedCard.pos}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full" />
                      <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">Coach</p>
                      <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10">{selectedCard.coach}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full" />
                      <p className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1 relative z-10">Category</p>
                      <p className="text-gray-900 text-2xl font-black font-orbitron relative z-10">{selectedCard.tag}</p>
                    </div>
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-red-600 rounded-bl-full opacity-20" />
                      <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-1 relative z-10">Overall Rating</p>
                      <div className="flex items-baseline gap-2 relative z-10">
                        <p className="text-white text-4xl font-black font-orbitron">{selectedCard.rating}</p>
                        <p className="text-white/40 text-sm font-bold">/ 10</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <IconTarget size={24} />
                    </div>
                    <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">Technical</h3>
                  </div>
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
                      { label: "Running with Ball", key: "runningWithBall" },
                      { label: "Range of Passing", key: "rangePassing" },
                      { label: "Striking / Finishing", key: "strikingFinishing" },
                      { label: "Defending", key: "defending" },
                      { label: "First Touch", key: "firstTouch" },
                      { label: "Non-dominant foot", key: "nonDominantFoot" }
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3, activeEvaluationData)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <IconActivity size={24} />
                    </div>
                    <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">Mental</h3>
                  </div>
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
                      { label: "Leadership", key: "leadership" },
                      { label: "Desire", key: "desire" },
                      { label: "Maturity", key: "maturity" },
                    ].map((skill) => (
                      <div key={skill.key} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                        <span className="text-xs font-bold text-gray-700">{skill.label}</span>
                        <div className="flex gap-2 w-45 justify-between">
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3, activeEvaluationData)}
                        </div>
                      </div>
                    ))}
                    <div className="py-0.5 opacity-0 pointer-events-none select-none text-[10px] font-bold">Spacer</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Page 1 of 2</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 font-black text-4xl font-orbitron tracking-tighter opacity-50">K10-FOOTBALL</p>
                </div>
              </div>
            </div>

            <div id="report-page-2" className="w-282.5 h-[1600px] bg-white text-black p-16 shadow-2xl relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-full h-75 bg-gray-50 -z-10" />

              <div className="flex justify-between items-start border-b-4 border-gray-200 pb-8 mb-12 relative">
                <div>
                  <h2 className="text-4xl font-black font-orbitron text-gray-900 tracking-tighter uppercase mb-1">Physical Assessment</h2>
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">{selectedCard.name} • {selectedCard.tag}</p>
                </div>
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-orbitron font-black text-xl">K10</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <IconFlame size={24} />
                    </div>
                    <h3 className="text-2xl font-black font-orbitron text-gray-900 uppercase">Physical Core</h3>
                  </div>
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
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3, activeEvaluationData)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1 mt-6 pt-6 border-t border-gray-100">
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
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 1, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 2, activeEvaluationData)}
                          {renderReadOnlyRatingCircle(skill.key as keyof typeof DEFAULT_EVALUATION, 3, activeEvaluationData)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional space for coach notes or other metrics can go here */}
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <IconTrophy size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-black font-orbitron text-gray-800 uppercase mb-2">Coach Notes</h3>
                  <p className="text-gray-500 text-sm italic w-3/4">Detailed physical assessment and specialized training regimen notes will be attached to this section in the next cycle.</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Page 2 of 2</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 font-black text-4xl font-orbitron tracking-tighter opacity-50">K10-FOOTBALL</p>
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

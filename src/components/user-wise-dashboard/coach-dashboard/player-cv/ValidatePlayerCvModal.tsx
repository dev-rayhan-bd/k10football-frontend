/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  IconCheck,
  IconLoader2,
  IconBallFootball,
  IconBolt,
  IconBrain,
  IconFileCertificate,
  IconRefresh,
} from "@tabler/icons-react";
import { useValidatePlayerCvMutation } from "@/redux/features/coach/coachApi";
import { cn } from "@/lib/utils";

interface ValidatePlayerCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName?: string;
  initialData?: any;
  onSuccess?: () => void;
}

interface TechnicalMetrics {
  ballControl: number;
  dribbling: number;
  shortPassing: number;
  longPassing: number;
  crossing: number;
  shooting: number;
  finishing: number;
  longShots: number;
}

interface PhysicalMetrics {
  acceleration: number;
  sprintSpeed: number;
  stamina: number;
  strength: number;
  balance: number;
  agility: number;
  reactions: number;
  jumping: number;
}

interface BehavioralMetrics {
  creativity: number;
  leadership: number;
  confidence: number;
  composure: number;
  motivation: number;
  focus: number;
  determination: number;
  workRate: number;
  teamwork: number;
  consistency: number;
  decisionMaking: number;
}

const DEFAULT_TECHNICAL: TechnicalMetrics = {
  ballControl: 74,
  dribbling: 74,
  shortPassing: 74,
  longPassing: 74,
  crossing: 74,
  shooting: 74,
  finishing: 74,
  longShots: 74,
};

const DEFAULT_PHYSICAL: PhysicalMetrics = {
  acceleration: 74,
  sprintSpeed: 74,
  stamina: 74,
  strength: 74,
  balance: 74,
  agility: 74,
  reactions: 74,
  jumping: 74,
};

const DEFAULT_BEHAVIORAL: BehavioralMetrics = {
  creativity: 85,
  leadership: 80,
  confidence: 84,
  composure: 82,
  motivation: 88,
  focus: 86,
  determination: 85,
  workRate: 87,
  teamwork: 88,
  consistency: 82,
  decisionMaking: 84,
};

const DEFAULT_FEEDBACK =
  "Strong ball control, clean technique and very reliable physical acceleration.";

const getScoreColor = (val: number) => {
  if (val >= 80) return "text-green-400 border-green-500/40 bg-green-500/10";
  if (val >= 60) return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
  return "text-red-400 border-red-500/40 bg-red-500/10";
};

const formatKeyLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

export const ValidatePlayerCvModal = ({
  isOpen,
  onClose,
  playerId,
  playerName = "Player",
  initialData,
  onSuccess,
}: ValidatePlayerCvModalProps) => {
  const [activeTab, setActiveTab] = useState<"technical" | "physical" | "behavioral" | "feedback">(
    "technical"
  );

  const [technical, setTechnical] = useState<TechnicalMetrics>(DEFAULT_TECHNICAL);
  const [physical, setPhysical] = useState<PhysicalMetrics>(DEFAULT_PHYSICAL);
  const [behavioral, setBehavioral] = useState<BehavioralMetrics>(DEFAULT_BEHAVIORAL);
  const [coachFeedback, setCoachFeedback] = useState<string>(DEFAULT_FEEDBACK);

  const [validatePlayerCv, { isLoading }] = useValidatePlayerCvMutation();

  // Populate initial values when initialData changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    const cats = initialData?.attributes?.categories || {};

    // Technical
    const initTechnical: TechnicalMetrics = {
      ballControl: Number(cats.technical?.ballControl ?? initialData?.technical?.ballControl ?? DEFAULT_TECHNICAL.ballControl),
      dribbling: Number(cats.technical?.dribbling ?? initialData?.technical?.dribbling ?? DEFAULT_TECHNICAL.dribbling),
      shortPassing: Number(cats.technical?.shortPassing ?? initialData?.technical?.shortPassing ?? DEFAULT_TECHNICAL.shortPassing),
      longPassing: Number(cats.technical?.longPassing ?? initialData?.technical?.longPassing ?? DEFAULT_TECHNICAL.longPassing),
      crossing: Number(cats.technical?.crossing ?? initialData?.technical?.crossing ?? DEFAULT_TECHNICAL.crossing),
      shooting: Number(cats.technical?.shooting ?? initialData?.technical?.shooting ?? DEFAULT_TECHNICAL.shooting),
      finishing: Number(cats.technical?.finishing ?? initialData?.technical?.finishing ?? DEFAULT_TECHNICAL.finishing),
      longShots: Number(cats.technical?.longShots ?? initialData?.technical?.longShots ?? DEFAULT_TECHNICAL.longShots),
    };
    setTechnical(initTechnical);

    // Physical
    const initPhysical: PhysicalMetrics = {
      acceleration: Number(cats.physical?.acceleration ?? initialData?.physical?.acceleration ?? DEFAULT_PHYSICAL.acceleration),
      sprintSpeed: Number(cats.physical?.sprintSpeed ?? initialData?.physical?.sprintSpeed ?? DEFAULT_PHYSICAL.sprintSpeed),
      stamina: Number(cats.physical?.stamina ?? initialData?.physical?.stamina ?? DEFAULT_PHYSICAL.stamina),
      strength: Number(cats.physical?.strength ?? initialData?.physical?.strength ?? DEFAULT_PHYSICAL.strength),
      balance: Number(cats.physical?.balance ?? initialData?.physical?.balance ?? DEFAULT_PHYSICAL.balance),
      agility: Number(cats.physical?.agility ?? initialData?.physical?.agility ?? DEFAULT_PHYSICAL.agility),
      reactions: Number(cats.physical?.reactions ?? initialData?.physical?.reactions ?? DEFAULT_PHYSICAL.reactions),
      jumping: Number(cats.physical?.jumping ?? initialData?.physical?.jumping ?? DEFAULT_PHYSICAL.jumping),
    };
    setPhysical(initPhysical);

    // Behavioral
    const initBehavioral: BehavioralMetrics = {
      creativity: Number(cats.behavioral?.creativity ?? cats.mental?.creativity ?? initialData?.behavioral?.creativity ?? DEFAULT_BEHAVIORAL.creativity),
      leadership: Number(cats.behavioral?.leadership ?? cats.mental?.leadership ?? initialData?.behavioral?.leadership ?? DEFAULT_BEHAVIORAL.leadership),
      confidence: Number(cats.behavioral?.confidence ?? cats.mental?.confidence ?? initialData?.behavioral?.confidence ?? DEFAULT_BEHAVIORAL.confidence),
      composure: Number(cats.behavioral?.composure ?? cats.mental?.composure ?? initialData?.behavioral?.composure ?? DEFAULT_BEHAVIORAL.composure),
      motivation: Number(cats.behavioral?.motivation ?? cats.mental?.motivation ?? initialData?.behavioral?.motivation ?? DEFAULT_BEHAVIORAL.motivation),
      focus: Number(cats.behavioral?.focus ?? cats.mental?.focus ?? initialData?.behavioral?.focus ?? DEFAULT_BEHAVIORAL.focus),
      determination: Number(cats.behavioral?.determination ?? cats.mental?.determination ?? initialData?.behavioral?.determination ?? DEFAULT_BEHAVIORAL.determination),
      workRate: Number(cats.behavioral?.workRate ?? cats.mental?.workRate ?? initialData?.behavioral?.workRate ?? DEFAULT_BEHAVIORAL.workRate),
      teamwork: Number(cats.behavioral?.teamwork ?? cats.mental?.teamwork ?? initialData?.behavioral?.teamwork ?? DEFAULT_BEHAVIORAL.teamwork),
      consistency: Number(cats.behavioral?.consistency ?? cats.mental?.consistency ?? initialData?.behavioral?.consistency ?? DEFAULT_BEHAVIORAL.consistency),
      decisionMaking: Number(cats.behavioral?.decisionMaking ?? cats.mental?.decisionMaking ?? initialData?.behavioral?.decisionMaking ?? DEFAULT_BEHAVIORAL.decisionMaking),
    };
    setBehavioral(initBehavioral);

    // Feedback
    const initFeedback =
      initialData?.coachFeedback ||
      initialData?.coachVerification?.coachFeedback ||
      initialData?.additionalNotes ||
      DEFAULT_FEEDBACK;
    setCoachFeedback(initFeedback);
  }, [isOpen, initialData]);

  // Averages calculation
  const technicalAvg = useMemo(() => {
    const vals = Object.values(technical);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [technical]);

  const physicalAvg = useMemo(() => {
    const vals = Object.values(physical);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [physical]);

  const behavioralAvg = useMemo(() => {
    const vals = Object.values(behavioral);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [behavioral]);

  const overallAvg = useMemo(() => {
    return Math.round((technicalAvg + physicalAvg + behavioralAvg) / 3);
  }, [technicalAvg, physicalAvg, behavioralAvg]);

  const handleMetricChange = (
    category: "technical" | "physical" | "behavioral",
    key: string,
    value: number
  ) => {
    const clamped = Math.max(1, Math.min(99, isNaN(value) ? 50 : value));
    if (category === "technical") {
      setTechnical((prev) => ({ ...prev, [key]: clamped }));
    } else if (category === "physical") {
      setPhysical((prev) => ({ ...prev, [key]: clamped }));
    } else {
      setBehavioral((prev) => ({ ...prev, [key]: clamped }));
    }
  };

  const handleResetCategory = (category: "technical" | "physical" | "behavioral") => {
    if (category === "technical") setTechnical(DEFAULT_TECHNICAL);
    if (category === "physical") setPhysical(DEFAULT_PHYSICAL);
    if (category === "behavioral") setBehavioral(DEFAULT_BEHAVIORAL);
  };

  const handleSubmit = async () => {
    if (!playerId) return;

    try {
      const res = await validatePlayerCv({
        playerId,
        technical,
        physical,
        behavioral,
        coachFeedback: coachFeedback.trim() || DEFAULT_FEEDBACK,
      }).unwrap();

      if (res?.success || res?.statusCode === 200) {
        onSuccess?.();
        onClose();
      }
    } catch {
      // Toast is already handled in coachApi onQueryStarted
    }
  };

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Validate Player CV"
      subtitle={`Official Assessment & Ratings for ${playerName}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Overall Score:</span>
            <Badge variant="outline" className={cn("font-bold text-sm", getScoreColor(overallAvg))}>
              {overallAvg} / 99
            </Badge>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-white/10 hover:bg-white/5 text-xs uppercase"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-6"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <IconCheck className="size-4" />
                  Confirm & Validate CV
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab("technical")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "technical"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <IconBallFootball className="size-4 shrink-0" />
            <span className="truncate">Technical</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">
              {technicalAvg}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("physical")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "physical"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <IconBolt className="size-4 shrink-0" />
            <span className="truncate">Physical</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">
              {physicalAvg}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("behavioral")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "behavioral"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <IconBrain className="size-4 shrink-0" />
            <span className="truncate">Behavioral</span>
            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 ml-1">
              {behavioralAvg}
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("feedback")}
            className={cn(
              "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeTab === "feedback"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <IconFileCertificate className="size-4 shrink-0" />
            <span className="truncate">Feedback</span>
          </button>
        </div>

        {/* Tab 1: Technical */}
        {activeTab === "technical" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Technical Attributes
                </h3>
                <p className="text-xs text-muted-foreground">
                  Score ball mastery, passing accuracy, shooting, and technique (1 - 99).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetCategory("technical")}
                  className="gap-1.5 text-[11px] h-8 border-white/10 text-muted-foreground hover:text-white"
                >
                  <IconRefresh className="size-3.5" />
                  Reset
                </Button>
                <Badge variant="outline" className={cn("text-xs font-bold py-1 px-2.5", getScoreColor(technicalAvg))}>
                  AVG {technicalAvg}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(technical).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-black/30 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-200">{formatKeyLabel(key)}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-xs px-2 py-0.5 rounded border", getScoreColor(val))}>
                        {val}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={val}
                        onChange={(e) => handleMetricChange("technical", key, parseInt(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded bg-white/5 border border-white/15 text-center text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={val}
                    onChange={(e) => handleMetricChange("technical", key, parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Physical */}
        {activeTab === "physical" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Physical & Athletic Attributes
                </h3>
                <p className="text-xs text-muted-foreground">
                  Score speed, acceleration, endurance, agility, balance, and power (1 - 99).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetCategory("physical")}
                  className="gap-1.5 text-[11px] h-8 border-white/10 text-muted-foreground hover:text-white"
                >
                  <IconRefresh className="size-3.5" />
                  Reset
                </Button>
                <Badge variant="outline" className={cn("text-xs font-bold py-1 px-2.5", getScoreColor(physicalAvg))}>
                  AVG {physicalAvg}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(physical).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-black/30 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-200">{formatKeyLabel(key)}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-xs px-2 py-0.5 rounded border", getScoreColor(val))}>
                        {val}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={val}
                        onChange={(e) => handleMetricChange("physical", key, parseInt(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded bg-white/5 border border-white/15 text-center text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={val}
                    onChange={(e) => handleMetricChange("physical", key, parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Behavioral */}
        {activeTab === "behavioral" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Behavioral & Mental Attributes
                </h3>
                <p className="text-xs text-muted-foreground">
                  Score decision making, leadership, composure, focus, teamwork, and mentality (1 - 99).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetCategory("behavioral")}
                  className="gap-1.5 text-[11px] h-8 border-white/10 text-muted-foreground hover:text-white"
                >
                  <IconRefresh className="size-3.5" />
                  Reset
                </Button>
                <Badge variant="outline" className={cn("text-xs font-bold py-1 px-2.5", getScoreColor(behavioralAvg))}>
                  AVG {behavioralAvg}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(behavioral).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-black/30 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-200">{formatKeyLabel(key)}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold text-xs px-2 py-0.5 rounded border", getScoreColor(val))}>
                        {val}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={val}
                        onChange={(e) => handleMetricChange("behavioral", key, parseInt(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded bg-white/5 border border-white/15 text-center text-xs text-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={99}
                    value={val}
                    onChange={(e) => handleMetricChange("behavioral", key, parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-white/10 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Feedback & Summary */}
        {activeTab === "feedback" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Coach Assessment & Evaluation Notes
              </h3>
              <p className="text-xs text-muted-foreground">
                Provide comprehensive notes, tactical feedback, and developmental guidance for this player.
              </p>
            </div>

            {/* Score Summary Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">Technical Avg</span>
                <span className="text-2xl font-black text-white mt-1">{technicalAvg}</span>
                <Badge variant="outline" className={cn("text-[10px] mt-2", getScoreColor(technicalAvg))}>
                  8 Attributes
                </Badge>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">Physical Avg</span>
                <span className="text-2xl font-black text-white mt-1">{physicalAvg}</span>
                <Badge variant="outline" className={cn("text-[10px] mt-2", getScoreColor(physicalAvg))}>
                  8 Attributes
                </Badge>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">Behavioral Avg</span>
                <span className="text-2xl font-black text-white mt-1">{behavioralAvg}</span>
                <Badge variant="outline" className={cn("text-[10px] mt-2", getScoreColor(behavioralAvg))}>
                  11 Attributes
                </Badge>
              </div>
            </div>

            {/* Feedback Textarea */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Coach Feedback
                </label>
                <span className="text-[10px] text-muted-foreground">
                  {coachFeedback.length} characters
                </span>
              </div>
              <Textarea
                rows={5}
                value={coachFeedback}
                onChange={(e) => setCoachFeedback(e.target.value)}
                placeholder="Write your professional evaluation notes and scouting assessment here..."
                className="bg-black/40 border-white/15 text-white placeholder:text-muted-foreground focus-visible:ring-primary text-sm leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </DashboardModal>
  );
};

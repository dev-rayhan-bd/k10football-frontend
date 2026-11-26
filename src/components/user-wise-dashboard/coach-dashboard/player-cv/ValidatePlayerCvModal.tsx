"use client";

import { useMemo, useState } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconBallFootball, IconBolt, IconBrain, IconCheck, IconLoader2, IconX } from "@tabler/icons-react";
import { useValidatePlayerCvMutation } from "@/redux/features/coach/coachApi";
import { ICoachValidatePlayerCvPayload } from "@/types/coach.type";
import { cn } from "@/lib/utils";

interface ValidatePlayerCvModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName?: string;
  onSuccess?: () => void;
}

type GroupKey = "technical" | "physical" | "mental";

// POST /coaches/players/:playerId/validate-cv accepts technical / physical / mental score maps (0-100, all optional).
const GROUPS: { key: GroupKey; label: string; icon: typeof IconBolt; fields: { key: string; label: string }[] }[] = [
  {
    key: "technical",
    label: "Technical",
    icon: IconBallFootball,
    fields: [
      { key: "ballControl", label: "Ball Control" },
      { key: "dribbling", label: "Dribbling" },
      { key: "shortPassing", label: "Short Passing" },
      { key: "shooting", label: "Shooting" },
      { key: "finishing", label: "Finishing" },
    ],
  },
  {
    key: "physical",
    label: "Physical",
    icon: IconBolt,
    fields: [
      { key: "pace", label: "Pace" },
      { key: "acceleration", label: "Acceleration" },
      { key: "stamina", label: "Stamina" },
      { key: "strength", label: "Strength" },
      { key: "agility", label: "Agility" },
    ],
  },
  {
    key: "mental",
    label: "Mental",
    icon: IconBrain,
    fields: [
      { key: "composure", label: "Composure" },
      { key: "confidence", label: "Confidence" },
      { key: "focus", label: "Focus" },
      { key: "decisions", label: "Decisions" },
      { key: "leadership", label: "Leadership" },
      { key: "teamwork", label: "Teamwork" },
      { key: "workRate", label: "Work Rate" },
    ],
  },
];

type Scores = Record<GroupKey, Record<string, number>>;
const EMPTY_SCORES: Scores = { technical: {}, physical: {}, mental: {} };

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

/** Coach skills form. Only fields the coach actually sets are sent (untouched fields are omitted). */
export const ValidatePlayerCvModal = ({
  isOpen,
  onClose,
  playerId,
  playerName = "Player",
  onSuccess,
}: ValidatePlayerCvModalProps) => {
  const [activeGroup, setActiveGroup] = useState<GroupKey>("technical");
  const [scores, setScores] = useState<Scores>(EMPTY_SCORES);
  const [coachFeedback, setCoachFeedback] = useState("");
  const [validatePlayerCv, { isLoading }] = useValidatePlayerCvMutation();

  // Fresh form for the next player: reset whenever the modal closes.
  const handleClose = () => {
    setScores(EMPTY_SCORES);
    setCoachFeedback("");
    setActiveGroup("technical");
    onClose();
  };

  const setScore = (group: GroupKey, field: string, raw: string) => {
    setScores((prev) => {
      const next = { ...prev[group] };
      if (raw === "") delete next[field];
      else if (!Number.isNaN(Number(raw))) next[field] = clampScore(Number(raw));
      return { ...prev, [group]: next };
    });
  };

  const clearScore = (group: GroupKey, field: string) => setScore(group, field, "");

  const touchedCount = useMemo(
    () => Object.values(scores).reduce((sum, group) => sum + Object.keys(group).length, 0),
    [scores]
  );
  // Scores are optional: the coach can validate the CV without changing any skill.
  const canSubmit = true;

  const handleSubmit = async () => {
    if (!playerId || !canSubmit) return;
    const payload: ICoachValidatePlayerCvPayload = { playerId };
    (Object.keys(scores) as GroupKey[]).forEach((group) => {
      if (Object.keys(scores[group]).length > 0) payload[group] = { ...scores[group] };
    });
    if (coachFeedback.trim()) payload.coachFeedback = coachFeedback.trim();

    try {
      const res = await validatePlayerCv(payload).unwrap();
      if (res?.success) {
        onSuccess?.();
        handleClose();
      }
    } catch {
      // The error toast (402 / 403 / 409 / 400 message) is shown by coachApi.
    }
  };

  const group = GROUPS.find((g) => g.key === activeGroup) ?? GROUPS[0];

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Validate Player CV"
      subtitle={`Skills assessment for ${playerName}`}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
          <span className="text-xs text-muted-foreground">
            {touchedCount} skill{touchedCount === 1 ? "" : "s"} rated · untouched skills are not sent
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isLoading || !canSubmit} className="gap-2">
              {isLoading ? <IconLoader2 className="size-4 animate-spin" /> : <IconCheck className="size-4" />}
              {isLoading ? "Validating..." : "Confirm & Validate"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-black/40 border border-white/10 rounded-2xl">
          {GROUPS.map((g) => {
            const count = Object.keys(scores[g.key]).length;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setActiveGroup(g.key)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  activeGroup === g.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <g.icon className="size-4 shrink-0" />
                <span className="truncate">{g.label}</span>
                {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.fields.map((field) => {
            const value = scores[group.key][field.key];
            const isSet = value !== undefined;
            return (
              <div key={field.key} className="bg-black/30 border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-gray-200">{field.label}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={isSet ? value : ""}
                      placeholder="—"
                      onChange={(e) => setScore(group.key, field.key, e.target.value)}
                      className="w-16 px-2 py-0.5 rounded bg-white/5 border border-white/15 text-center text-xs text-white focus:outline-none focus:border-primary"
                    />
                    {isSet && (
                      <button
                        type="button"
                        onClick={() => clearScore(group.key, field.key)}
                        className="text-muted-foreground hover:text-white cursor-pointer"
                        aria-label={`Clear ${field.label}`}
                      >
                        <IconX className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isSet ? value : 0}
                  onChange={(e) => setScore(group.key, field.key, e.target.value)}
                  className={cn("w-full accent-primary h-1.5 cursor-pointer", !isSet && "opacity-30")}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300">Coach Feedback</label>
          <Textarea
            rows={4}
            value={coachFeedback}
            onChange={(e) => setCoachFeedback(e.target.value)}
            placeholder="Write your assessment for this player..."
            className="bg-black/40 border-white/15 text-white text-sm"
          />
        </div>
      </div>
    </DashboardModal>
  );
};

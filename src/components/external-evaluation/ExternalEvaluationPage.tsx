"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClockX,
  IconExternalLink,
  IconFileText,
  IconLinkOff,
  IconLoader2,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MatchStatisticsForm, {
  PitchLine,
} from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/MatchStatisticsForm";
import ReportPdfPreview from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/ReportPdfPreview";
import {
  formatMinutesPlayed,
  getStatKeysForPosition,
} from "@/components/user-wise-dashboard/coach-dashboard/create-game-report/reportHelpers";
import {
  AccessLinkError,
  getAccessLinkReport,
  respondToAccessLink,
  submitAccessLinkEvaluation,
} from "@/services/externalEvaluation.service";
import type { IAccessLinkReport, IAccessLinkSubmitResult } from "@/types/externalEvaluation.type";

type View =
  | { kind: "loading" }
  | { kind: "error"; title: string; message: string; icon: "invalid" | "expired" | "warning" }
  | { kind: "completed"; pdfUrl?: string | null }
  | { kind: "rejected"; byMe: boolean }
  | { kind: "respond" }
  | { kind: "form" }
  | { kind: "success"; result: IAccessLinkSubmitResult }
  | { kind: "preview"; result: IAccessLinkSubmitResult };

const NA = "N/A";
const text = (v: unknown) => (v === undefined || v === null || String(v).trim() === "" ? NA : String(v));

const errorView = (status: number, message: string): View => {
  switch (status) {
    case 404:
      return { kind: "error", icon: "invalid", title: "Invalid link", message: "This evaluation link is not valid. Please use the link from your most recent email." };
    case 402:
      return { kind: "error", icon: "warning", title: "Report not paid", message: "This evaluation can't be started until the player completes payment." };
    case 403:
      return { kind: "rejected", byMe: false };
    case 400:
      return { kind: "error", icon: "expired", title: "Can't submit this evaluation", message };
    default:
      return { kind: "error", icon: "warning", title: "Something went wrong", message };
  }
};

const ExternalEvaluationPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const queryPosition = (searchParams.get("position") || "").trim().toUpperCase();

  const [loadedView, setView] = useState<View>({ kind: "loading" });
  const view: View = token ? loadedView : errorView(404, "");
  const [report, setReport] = useState<IAccessLinkReport | null>(null);

  // Evaluator identity (required for accept + submit).
  const [evaluatorName, setEvaluatorName] = useState("");
  const [evaluatorRole, setEvaluatorRole] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Match statistics form state — starts empty, nothing pre-filled.
  const [minutesPlayed, setMinutesPlayedState] = useState("00:00");
  const minutesRef = useRef("00:00");
  const setMinutesPlayed = useCallback((val: string) => {
    minutesRef.current = val;
    setMinutesPlayedState(val);
  }, []);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [goalMarkers, setGoalMarkers] = useState<{ x: number; y: number }[]>([]);
  const [pitchMarkers, setPitchMarkers] = useState<PitchLine[]>([]);
  const [coachFeedback, setCoachFeedback] = useState("");

  const position = (report?.athlete?.position || queryPosition).trim().toUpperCase();
  const isGK = position === "GK" || position === "GOALKEEPER";

  // Load the report for this token. Missing token is handled at render time.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getAccessLinkReport(token)
      .then((data) => {
        if (cancelled) return;
        setReport(data);
        setEvaluatorName((prev) => prev || data.assignedEvaluator?.name || "");
        setEvaluatorRole((prev) => prev || data.assignedEvaluator?.role || "");

        const status = String(data.status || "").toUpperCase();
        if (data.isExpired) {
          setView({ kind: "error", icon: "expired", title: "Link expired", message: "This evaluation link has expired. Ask the player to send a new request." });
        } else if (data.isCompleted || status === "COMPLETED") {
          setView({ kind: "completed", pdfUrl: data.reportPdfUrl });
        } else if (status === "REJECTED") {
          setView({ kind: "rejected", byMe: false });
        } else if (!data.canSubmit) {
          setView({ kind: "error", icon: "warning", title: "Evaluation not available", message: "This evaluation can't be submitted right now. It may be awaiting payment." });
        } else if (status === "PENDING") {
          setView({ kind: "respond" });
        } else {
          setView({ kind: "form" });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const e = err instanceof AccessLinkError ? err : new AccessLinkError(0, "Failed to load evaluation.");
        setView(errorView(e.status, e.message));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!evaluatorName.trim() || !evaluatorRole.trim()) {
      toast.error("Please enter your name and role");
      return;
    }
    setIsResponding(true);
    try {
      await respondToAccessLink(token, {
        action: "ACCEPT",
        evaluatorName: evaluatorName.trim(),
        evaluatorRole: evaluatorRole.trim(),
      });
      setView({ kind: "form" });
    } catch (err) {
      const e = err instanceof AccessLinkError ? err : new AccessLinkError(0, "Failed to accept.");
      toast.error(e.message);
      if (e.status && e.status !== 400) setView(errorView(e.status, e.message));
    } finally {
      setIsResponding(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please give a reason for declining");
      return;
    }
    setIsResponding(true);
    try {
      await respondToAccessLink(token, { action: "REJECT", rejectionReason: rejectionReason.trim() });
      setView({ kind: "rejected", byMe: true });
    } catch (err) {
      const e = err instanceof AccessLinkError ? err : new AccessLinkError(0, "Failed to decline.");
      toast.error(e.message);
    } finally {
      setIsResponding(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    const minutes = formatMinutesPlayed(minutesRef.current);
    const feedback = coachFeedback.trim();
    const missing: string[] = [];
    if (minutes === "00:00") missing.push("Minutes played");
    if (!feedback) missing.push("Coach feedback");
    if (!evaluatorName.trim()) missing.push("Your name");
    if (!evaluatorRole.trim()) missing.push("Your role");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    const statsPayload: Record<string, number> = {};
    for (const key of getStatKeysForPosition(isGK)) statsPayload[key] = Number(stats[key]) || 0;

    setIsSubmitting(true);
    try {
      const result = await submitAccessLinkEvaluation(token, {
        minutesPlayed: minutes,
        stats: statsPayload,
        accurateShots: goalMarkers.map((m) => ({
          x: Number(Number(m.x).toFixed(1)),
          y: Number(Number(m.y).toFixed(1)),
          target: "goal" as const,
        })),
        accurateAssists: pitchMarkers.map((m) => ({
          fromX: Number(Number(m.x1).toFixed(1)),
          fromY: Number(Number(m.y1).toFixed(1)),
          toX: Number(Number(m.x2).toFixed(1)),
          toY: Number(Number(m.y2).toFixed(1)),
          assistType: "ground" as const,
        })),
        coachFeedback: feedback,
        evaluatorName: evaluatorName.trim(),
        evaluatorRole: evaluatorRole.trim(),
      });
      toast.success("Evaluation submitted");
      setView({ kind: "success", result });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const e = err instanceof AccessLinkError ? err : new AccessLinkError(0, "Failed to submit evaluation.");
      toast.error(e.message);
      // Already submitted / expired / declined / unpaid / invalid → leave the form.
      if ([400, 402, 403, 404].includes(e.status)) setView(errorView(e.status, e.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <Image src="/logo.png" alt="K10 Football" width={64} height={64} className="size-16 object-contain" />
          <p className="font-orbitron text-xs font-bold uppercase tracking-[0.3em] text-[#00FF62]">
            Coach Evaluation
          </p>
        </header>

        {view.kind === "loading" && (
          <div className="flex flex-col items-center gap-3 py-24 text-gray-400">
            <IconLoader2 className="size-8 animate-spin" />
            <span>Loading evaluation…</span>
          </div>
        )}

        {view.kind === "error" && (
          <StatusCard
            icon={
              view.icon === "invalid" ? <IconLinkOff className="size-10" /> :
              view.icon === "expired" ? <IconClockX className="size-10" /> :
              <IconAlertTriangle className="size-10" />
            }
            title={view.title}
            message={view.message}
          />
        )}

        {view.kind === "rejected" && (
          <StatusCard
            icon={<IconX className="size-10" />}
            title="You declined this request"
            message={
              view.byMe
                ? "The player has been notified and can reassign the evaluation to another coach. Thank you for letting them know."
                : "This evaluation request was declined, so it can no longer be submitted."
            }
          />
        )}

        {view.kind === "completed" && (
          <StatusCard
            icon={<IconCircleCheck className="size-10 text-[#00FF62]" />}
            title="Already submitted"
            message="This evaluation has already been completed."
            action={view.pdfUrl ? <PdfLink href={view.pdfUrl} label="View report PDF" /> : null}
          />
        )}

        {view.kind === "success" && (
          <StatusCard
            icon={<IconCircleCheck className="size-10 text-[#00FF62]" />}
            title="Evaluation submitted"
            message={
              view.result.author
                ? `Thank you, ${view.result.author}. The player has been notified.`
                : "Thank you. The player has been notified."
            }
            action={
              <div className="flex flex-col items-center gap-4">
                {view.result.overallRating !== undefined && view.result.overallRating !== null && (
                  <div className="flex flex-col items-center">
                    <span className="text-xs uppercase tracking-widest text-gray-400">Overall rating</span>
                    <span className="font-orbitron text-5xl font-black italic text-[#00FF62]">
                      {view.result.overallRating}
                    </span>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setView({ kind: "preview", result: view.result });
                    window.scrollTo({ top: 0 });
                  }}
                  className="bg-[#00FF62] text-black hover:bg-[#00D150]"
                >
                  <IconFileText />
                  View report
                </Button>
              </div>
            }
          />
        )}

        {view.kind === "preview" && report && (
          <ReportPdfPreview
            viewOnly
            formData={buildReportFormData(report, position, {
              minutesPlayed: formatMinutesPlayed(minutesPlayed),
              evaluatorName: evaluatorName.trim(),
              overallRating: view.result.overallRating,
            })}
            characteristics={[]}
            stats={stats}
            goalMarkers={goalMarkers}
            pitchMarkers={pitchMarkers}
            coachFeedback={coachFeedback}
            onSave={() => {}}
            onBack={() => setView({ kind: "success", result: view.result })}
          />
        )}

        {(view.kind === "respond" || view.kind === "form") && report && (
          <>
            <MatchSummary report={report} position={position} />

            <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="font-orbitron text-sm font-bold uppercase tracking-widest">Your details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="evaluatorName">Your name</Label>
                  <Input
                    id="evaluatorName"
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    placeholder="e.g. Pep Guardiola"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="evaluatorRole">Your role</Label>
                  <Input
                    id="evaluatorRole"
                    value={evaluatorRole}
                    onChange={(e) => setEvaluatorRole(e.target.value)}
                    placeholder="e.g. Head Coach"
                  />
                </div>
              </div>

              {view.kind === "respond" && (
                <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
                  <p className="text-sm text-gray-400">
                    Accept the request to start the evaluation, or decline it so the player can choose another coach.
                  </p>
                  {isDeclining ? (
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="rejectionReason">Reason for declining</Label>
                      <Textarea
                        id="rejectionReason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Not available"
                      />
                      <div className="flex flex-wrap gap-3">
                        <Button variant="destructive" onClick={handleReject} disabled={isResponding}>
                          {isResponding && <IconLoader2 className="animate-spin" />}
                          Confirm decline
                        </Button>
                        <Button variant="outline" onClick={() => setIsDeclining(false)} disabled={isResponding}>
                          Back
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleAccept}
                        disabled={isResponding}
                        className="bg-[#00FF62] text-black hover:bg-[#00D150]"
                      >
                        {isResponding && <IconLoader2 className="animate-spin" />}
                        Accept & start evaluation
                      </Button>
                      <Button variant="outline" onClick={() => setIsDeclining(true)} disabled={isResponding}>
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {view.kind === "form" && (
              <div className={isSubmitting ? "pointer-events-none opacity-60" : undefined}>
                <MatchStatisticsForm
                  position={position}
                  minutesPlayed={minutesPlayed}
                  setMinutesPlayed={setMinutesPlayed}
                  stats={stats}
                  setStats={setStats}
                  goalMarkers={goalMarkers}
                  setGoalMarkers={setGoalMarkers}
                  pitchMarkers={pitchMarkers}
                  setPitchMarkers={setPitchMarkers}
                  coachFeedback={coachFeedback}
                  setCoachFeedback={setCoachFeedback}
                  playerImage={report.athlete?.profileImage || undefined}
                  playerName={report.athlete?.name}
                  onCancel={() => {
                    setStats({});
                    setGoalMarkers([]);
                    setPitchMarkers([]);
                    setCoachFeedback("");
                    setMinutesPlayed("00:00");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

/**
 * Maps this report's data for the report preview: match + athlete from the
 * access-link response, plus what the coach just submitted. Fields the
 * access link doesn't return (DOB, weight, height, foot, characteristics,
 * matches played) are left empty and render as N/A — nothing is invented.
 */
const buildReportFormData = (
  report: IAccessLinkReport,
  position: string,
  submitted: { minutesPlayed: string; evaluatorName: string; overallRating?: number }
) => {
  const m = report.matchDetails || {};
  const a = report.athlete || {};
  const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
  return {
    playerName: str(a.name),
    clubName: str(a.club),
    position,
    playerImage: str(a.profileImage),
    dob: "",
    weight: "",
    height: "",
    foot: "",
    matchesPlayed: "",
    minutesPlayed: submitted.minutesPlayed,
    scoutName: submitted.evaluatorName,
    gameDate: str(m.matchDate).slice(0, 10),
    gameType: str(m.leagueType).toUpperCase(),
    gameLocation: str(m.location).toUpperCase(),
    weather: str(m.weather).toUpperCase(),
    temperature: str(m.temperature),
    matchResult: str(m.result),
    ownTeam: str(m.homeTeam),
    opponentTeam: str(m.awayTeam),
    homeScore: typeof m.homeScore === "number" ? m.homeScore : undefined,
    awayScore: typeof m.awayScore === "number" ? m.awayScore : undefined,
    scoutRating: typeof submitted.overallRating === "number" ? submitted.overallRating : undefined,
    rating: typeof submitted.overallRating === "number" ? submitted.overallRating : undefined,
  };
};

const MatchSummary = ({ report, position }: { report: IAccessLinkReport; position: string }) => {
  const m = report.matchDetails || {};
  const a = report.athlete || {};
  const score =
    typeof m.homeScore === "number" && typeof m.awayScore === "number" ? `${m.homeScore} - ${m.awayScore}` : NA;
  const weather = [m.weather, m.temperature !== undefined && m.temperature !== null && m.temperature !== "" ? `${m.temperature}°C` : ""]
    .filter(Boolean)
    .join(" / ");
  const fields = [
    { label: "Match date", value: text(m.matchDate ? String(m.matchDate).slice(0, 10) : "") },
    { label: "Game type", value: text(m.leagueType) },
    { label: "Location", value: text(m.location) },
    { label: "Weather", value: text(weather) },
    { label: "Score", value: score },
    { label: "Result", value: text(m.result) },
  ];

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Image
          src={a.profileImage || "/profile_placeholder.png"}
          alt={a.name || "Player"}
          width={64}
          height={64}
          unoptimized
          className="size-16 shrink-0 rounded-full border border-white/10 object-cover"
        />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-orbitron text-lg font-bold uppercase">{text(a.name)}</span>
          <span className="truncate text-sm text-gray-400">
            {text(position)} · {text(a.club)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-widest text-gray-400">Match</span>
        <span className="font-orbitron text-base font-bold uppercase">
          {text(m.homeTeam)} vs {text(m.awayTeam)}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map((f) => (
          <div key={f.label} className="flex min-w-0 flex-col gap-0.5">
            <dt className="text-xs uppercase tracking-widest text-gray-400">{f.label}</dt>
            <dd className="break-words text-sm font-semibold uppercase">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const StatusCard = ({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) => (
  <section className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
    <div className="text-gray-300">{icon}</div>
    <h1 className="font-orbitron text-2xl font-black uppercase">{title}</h1>
    <p className="text-sm text-gray-400">{message}</p>
    {action}
    <Link href="/" className="text-xs text-gray-500 underline underline-offset-4">
      Go to K10 Football
    </Link>
  </section>
);

const PdfLink = ({ href, label }: { href: string; label: string }) => (
  <Button asChild className="bg-[#00FF62] text-black hover:bg-[#00D150]">
    <a href={href} target="_blank" rel="noopener noreferrer">
      <IconExternalLink />
      {label}
    </a>
  </Button>
);

export default ExternalEvaluationPage;

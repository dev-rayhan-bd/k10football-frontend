/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { addReport, completeReportRequest, addReportRequest, updateReport } from "@/lib/constants/reports";
import ReportDetailsForm from "./ReportDetailsForm";
import StripePaymentModal from "./StripePaymentModal";
import MatchStatisticsForm, {
  PitchLine,
  DEFAULT_FORM_STATS,
  OUTFIELD_SLIDES,
  GK_SLIDE_1,
  GK_SLIDE_4,
} from "./MatchStatisticsForm";
import ReportPdfPreview from "./ReportPdfPreview";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addGameReport, updateGameReport, completeGameReportRequest, addGameReportRequest } from "@/redux/features/reports/reportsSlice";
import {
  useCreateSelfGameReportMutation,
  useCompleteSelfGameReportMutation,
  useRequestCoachGameReportMutation,
  useGetMyPlayerProfileQuery,
  useGetMyGameReportByIdQuery,
} from "@/redux/features/player/playerApi";
import {
  useCompleteCoachGameReportMutation,
  useGetCoachGameReportsQuery,
} from "@/redux/features/coach/coachApi";
import { useGetSingleGameReportQuery } from "@/redux/features/academy/academyApi";
import {
  ICreateSelfGameReportPayload,
  ICompleteSelfGameReportPayload,
  IRequestCoachGameReportPayload,
} from "@/types/player.type";
import { IconCircleCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const formatDateToYMD = (dateStr: string): string => {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const yyyymmdd = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return trimmed;
};

const formatMinutesPlayed = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return "00:00";
  const str = String(val).trim();
  if (!str) return "00:00";

  let m = 0;
  let s = 0;

  if (str.includes(":")) {
    const parts = str.split(":");
    m = parseInt(parts[0], 10);
    s = parseInt(parts[1], 10);
  } else {
    m = parseInt(str.replace(/[^\d]/g, ""), 10);
    s = 0;
  }

  if (isNaN(m)) m = 0;
  if (isNaN(s)) s = 0;

  if (s >= 60) {
    m += Math.floor(s / 60);
    s = s % 60;
  }
  if (s < 0) s = 0;
  if (m < 0) m = 0;
  if (m > 130) m = 130;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Stat keys collected by the Match Statistics form for a position (same order as the form). */
const getStatKeysForPosition = (isGK: boolean): string[] => {
  const slides = isGK
    ? [GK_SLIDE_1, OUTFIELD_SLIDES[0], OUTFIELD_SLIDES[1], GK_SLIDE_4]
    : OUTFIELD_SLIDES;
  return Array.from(new Set(slides.flat().map((item) => item.key)));
};

/** Older drafts / records may use legacy key names — read those as a fallback. */
const LEGACY_STAT_ALIASES: Record<string, string[]> = {
  goal: ["goalScored"],
  assist: ["assists"],
  shotOnTarget: ["shotsOnGoal"],
  penaltyWon: ["penaltiesTaken"],
  completedPass: ["passAccurate"],
  incompletePass: ["wrongPass"],
  freeKickWon: ["freeKick"],
  tackleWon: ["standTackle"],
  foulCommitted: ["fault"],
  save: ["savesAccurate"],
  save1v1: ["oneOnOneSave"],
  goalConceded: ["goalUnsave"],
};

/** The entered value for a stat (0 when nothing was entered). */
const readStat = (stats: Record<string, number>, key: string): number => {
  for (const k of [key, ...(LEGACY_STAT_ALIASES[key] || [])]) {
    const v = stats[k];
    if (v !== undefined && v !== null && !isNaN(Number(v))) return Number(v);
  }
  return 0;
};

interface CreateGameReportWizardProps {
  onCancel: () => void;
  onContinue?: (data: any) => void;
}

const STEP_NAME_TO_NUMBER: Record<string, number> = {
  details: 1,
  "match-details": 1,
  "1": 1,
  statistics: 2,
  stats: 2,
  "2": 2,
  preview: 3,
  "pdf-preview": 3,
  "3": 3,
  payment: 4,
  "4": 4,
  success: 5,
  "5": 5,
};

const STEP_NUMBER_TO_NAME: Record<number, string> = {
  1: "details",
  2: "statistics",
  3: "preview",
  4: "payment",
  5: "success",
};

export const CreateGameReportWizard = ({
  onCancel,
  onContinue
}: CreateGameReportWizardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { players } = usePlayer();

  const authUser = useAppSelector(state => state.auth?.user);
  const reports = useAppSelector(state => state.reports.reports);
  const requests = useAppSelector(state => state.reports.requests);

  const [userRole, setUserRole] = useState<string>("player");
  const isCoach = !pathname?.includes("/player") && (pathname?.includes("/coach") || authUser?.role === "coach" || userRole === "coach");

  const [createSelfGameReport, { isLoading: isCreatingSelfReport }] = useCreateSelfGameReportMutation();
  const [completeSelfGameReport, { isLoading: isCompletingSelfReport }] = useCompleteSelfGameReportMutation();
  const [requestCoachGameReport, { isLoading: isRequestingCoachReport }] = useRequestCoachGameReportMutation();
  const [completeCoachGameReport, { isLoading: isCompletingCoachReport }] = useCompleteCoachGameReportMutation();
  const { data: coachGameReportsResponse } = useGetCoachGameReportsQuery(undefined, {
    skip: !isCoach,
  });
  const { data: myProfileResponse } = useGetMyPlayerProfileQuery(undefined, {
    skip: isCoach,
  });

  const playerId = searchParams.get("playerId");
  const requestId = searchParams.get("requestId");
  const reportId = searchParams.get("reportId") || requestId;
  const viewOnly = searchParams.get("viewOnly") === "true";
  const urlPosition = searchParams.get("position");

  const { data: myGameReportResponse } = useGetMyGameReportByIdQuery(reportId || "", {
    skip: !reportId,
  });
  const { data: singleGameReportResponse } = useGetSingleGameReportQuery(reportId || "", {
    skip: !reportId,
  });

  const stepParam = searchParams.get("step");
  const initialStep =
    stepParam && STEP_NAME_TO_NUMBER[stepParam.toLowerCase()]
      ? STEP_NAME_TO_NUMBER[stepParam.toLowerCase()]
      : viewOnly
      ? 3
      : pathname?.includes("/coach")
      ? 2
      : 1;

  const [step, setStep] = useState<number>(initialStep);

  // Synchronize step if URL searchParams changes (e.g. Stripe redirect, browser back/forward)
  useEffect(() => {
    const sParam = searchParams.get("step");
    if (sParam && STEP_NAME_TO_NUMBER[sParam.toLowerCase()]) {
      const targetStep = STEP_NAME_TO_NUMBER[sParam.toLowerCase()];
      if (targetStep !== step) {
        setStep(targetStep);
      }
    }
  }, [searchParams, step]);

  const hasShownPaymentSuccessToast = React.useRef(false);
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && !hasShownPaymentSuccessToast.current) {
      hasShownPaymentSuccessToast.current = true;
      toast.success("Payment successful! Please review and complete match statistics.");
    }
  }, [searchParams]);

  const navigateToStep = (newStep: number, replace = false) => {
    setStep(newStep);
    const stepName = STEP_NUMBER_TO_NAME[newStep] || "details";
    const currentParams = new URLSearchParams(searchParams.toString());

    if (currentParams.get("step") !== stepName) {
      currentParams.set("step", stepName);
    }
    const currentPos = searchParams.get("position") || formData.position;
    if (currentPos && !currentParams.get("position")) {
      currentParams.set("position", currentPos.trim().toUpperCase());
    }
    const newUrl = `${pathname}?${currentParams.toString()}`;
    if (replace) {
      router.replace(newUrl, { scroll: false });
    } else {
      router.push(newUrl, { scroll: false });
    }
  };

  // All values start empty: they are filled from the player profile (step 1)
  // or from the saved game report in the database (preview / view-only).
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [coachFeedback, setCoachFeedback] = useState<string>("");
  const [formData, setFormData] = useState({
    playerName: "",
    dob: "",
    clubName: "",
    position: searchParams.get("position")?.trim().toUpperCase() || "",
    foot: "",
    weight: "",
    height: "",
    // A game report always describes exactly one match.
    matchesPlayed: "1",
    minutesPlayed: "00:00",
    manOfTheMatch: "",
    scoutName: "",
    gameType: "",
    gameDate: "",
    gameLocation: "",
    matchResult: "",
    weather: "",
    temperature: "",
    opponentTeam: "",
    ownTeam: "",
    homeScore: 0,
    awayScore: 0,
    playerImage: "",
    scoutRating: undefined as number | undefined,
    categoryRatings: undefined as Record<string, number> | undefined,
    rating: undefined as number | undefined,
  });

  const [stats, setStats] = useState<Record<string, number>>(DEFAULT_FORM_STATS);
  const [goalMarkers, setGoalMarkers] = useState<{ x: number; y: number }[]>([]);
  const [pitchMarkers, setPitchMarkers] = useState<PitchLine[]>([]);
  const [reportCompletedBy, setReportCompletedBy] = useState<"parent" | "coach">("parent");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [selectedCoachEmail, setSelectedCoachEmail] = useState("");
  const [coachRequestMode, setCoachRequestMode] = useState<"dropdown" | "custom">("dropdown");
  const [customCoachName, setCustomCoachName] = useState("");
  const [customCoachEmail, setCustomCoachEmail] = useState("");
  const [tempRating, setTempRating] = useState<number>(0);

  const handleSetMinutesPlayed = React.useCallback((val: string) => {
    setFormData((prev) => ({ ...prev, minutesPlayed: val }));
  }, []);

  const DRAFT_STORAGE_KEY = `k10_game_report_draft_${playerId || "self"}`;

  const clearDraft = () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        sessionStorage.removeItem("k10_game_report_draft_self");
        sessionStorage.removeItem("k10_last_self_report_id");
      }
    } catch {
      // ignore
    }
  };

  const isRestoredFromDraft = React.useRef(false);

  // Restore draft on initial load if available
  useEffect(() => {
    if (viewOnly || requestId || isRestoredFromDraft.current) return;
    try {
      if (typeof window !== "undefined") {
        const saved =
          sessionStorage.getItem(DRAFT_STORAGE_KEY) ||
          sessionStorage.getItem("k10_game_report_draft_self");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.formData) {
            if (parsed.formData.minutesPlayed === "42:00") {
              parsed.formData.minutesPlayed = "00:00";
            }
            const urlPos = searchParams.get("position");
            if (urlPos) {
              parsed.formData.position = urlPos.trim().toUpperCase();
            }
            setFormData(parsed.formData);
          }
          if (parsed.characteristics && Array.isArray(parsed.characteristics)) {
            setCharacteristics(parsed.characteristics);
          }
          if (parsed.stats && Object.keys(parsed.stats).length > 0) {
            setStats({ ...DEFAULT_FORM_STATS, ...parsed.stats });
          }
          if (parsed.goalMarkers && Array.isArray(parsed.goalMarkers)) {
            setGoalMarkers(parsed.goalMarkers);
          }
          if (parsed.pitchMarkers && Array.isArray(parsed.pitchMarkers)) {
            setPitchMarkers(parsed.pitchMarkers);
          }
          if (parsed.coachFeedback) setCoachFeedback(parsed.coachFeedback);
          if (parsed.reportCompletedBy) setReportCompletedBy(parsed.reportCompletedBy);
          if (parsed.selectedCoachId) setSelectedCoachId(parsed.selectedCoachId);
          if (parsed.selectedCoachEmail) setSelectedCoachEmail(parsed.selectedCoachEmail);
          if (parsed.coachRequestMode) setCoachRequestMode(parsed.coachRequestMode);
          if (parsed.customCoachName) setCustomCoachName(parsed.customCoachName);
          if (parsed.customCoachEmail) setCustomCoachEmail(parsed.customCoachEmail);
          isRestoredFromDraft.current = true;
        }
      }
    } catch (e) {
      console.error("Failed to restore draft from sessionStorage", e);
    }
  }, [viewOnly, requestId, DRAFT_STORAGE_KEY]);

  // Auto-save draft changes to sessionStorage
  useEffect(() => {
    if (viewOnly || requestId) return;
    try {
      if (typeof window !== "undefined") {
        const draftData = {
          formData,
          characteristics,
          stats,
          goalMarkers,
          pitchMarkers,
          coachFeedback,
          reportCompletedBy,
          selectedCoachId,
          selectedCoachEmail,
          coachRequestMode,
          customCoachName,
          customCoachEmail,
        };
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      }
    } catch {
      // Ignore quota errors
    }
  }, [
    formData,
    characteristics,
    stats,
    goalMarkers,
    pitchMarkers,
    coachFeedback,
    reportCompletedBy,
    selectedCoachId,
    selectedCoachEmail,
    coachRequestMode,
    customCoachName,
    customCoachEmail,
    viewOnly,
    requestId,
    DRAFT_STORAGE_KEY,
  ]);

  // Keep position synced with URL query param if present
  useEffect(() => {
    const pos = searchParams.get("position");
    if (pos) {
      const normalizedPos = pos.trim().toUpperCase();
      setFormData(prev => {
        if (prev.position?.toUpperCase() !== normalizedPos) {
          return { ...prev, position: normalizedPos };
        }
        return prev;
      });
    }
  }, [searchParams]);

  // Scroll to top whenever the wizard step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, main');
    scrollContainers.forEach((container) => {
      container.scrollTo(0, 0);
    });
  }, [step]);

  // Sync step state when browser back/forward buttons are clicked
  useEffect(() => {
    const currentStepParam = searchParams.get("step");
    if (currentStepParam && STEP_NAME_TO_NUMBER[currentStepParam.toLowerCase()]) {
      const targetStep = STEP_NAME_TO_NUMBER[currentStepParam.toLowerCase()];
      if (targetStep !== step) {
        setStep(targetStep);
      }
    } else if (!currentStepParam) {
      const defaultStep = viewOnly ? 3 : isCoach ? 2 : 1;
      if (step !== defaultStep) {
        setStep(defaultStep);
      }
    }
  }, [searchParams, isCoach, viewOnly]);

  // Ensure step param is populated in URL on first mount
  useEffect(() => {
    const currentStepParam = searchParams.get("step");
    if (!currentStepParam) {
      const defaultStep = viewOnly ? 3 : isCoach ? 2 : 1;
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set("step", STEP_NUMBER_TO_NAME[defaultStep]);
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    }
  }, [searchParams, pathname, isCoach, viewOnly, router]);

  // Detect user role & sync initial step if not in URL
  useEffect(() => {
    const role = localStorage.getItem("userRole") || (pathname?.includes("/coach") ? "coach" : "player");
    setUserRole(role);
    if (!searchParams.get("step")) {
      if (role === "coach" || pathname?.includes("/coach")) {
        navigateToStep(viewOnly ? 3 : 2, true);
      } else if (viewOnly) {
        navigateToStep(3, true);
      } else {
        navigateToStep(1, true);
      }
    }
  }, [pathname, viewOnly]);

  // The saved game report from the database (if any). When present it is the
  // single source of truth for everything rendered in the preview / PDF.
  const apiReport: any =
    myGameReportResponse?.data?.report ||
    myGameReportResponse?.data ||
    singleGameReportResponse?.data ||
    null;
  const hasApiReport = Boolean(apiReport);

  // Sync dynamic game report from API whenever reportId is present (e.g. after Stripe redirect or direct link).
  // Runs once per report version so refetches don't wipe what the user is entering.
  const syncedReportKey = React.useRef<string | null>(null);
  useEffect(() => {
    if (!apiReport) return;
    const reportKey = `${apiReport._id ?? reportId}:${apiReport.updatedAt ?? ""}:${myProfileResponse ? 1 : 0}`;
    if (syncedReportKey.current === reportKey) return;
    syncedReportKey.current = reportKey;

    const pInfo = apiReport.playerInfo || {};
    const pObj = apiReport.player || {};
    const profile: any = myProfileResponse?.data || {};

    // First non-empty value from the database record (falls back to the
    // player's own profile record only for bio fields the report lacks).
    const pick = (...vals: any[]): string => {
      for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
      }
      return "";
    };

    const rating = apiReport.scoutRating ?? apiReport.rating;

    // Priority per field: saved report → what the user already entered (draft) → player profile.
    // The details endpoint may omit some fields, so a missing value never wipes entered data.
    setFormData(prev => {
      const own = pick(apiReport.ownTeam, apiReport.team1, prev.ownTeam);
      const opp = pick(apiReport.opponentTeam, apiReport.team2, prev.opponentTeam);
      const homeScore = typeof apiReport.homeScore === "number" ? apiReport.homeScore : prev.homeScore;
      const awayScore = typeof apiReport.awayScore === "number" ? apiReport.awayScore : prev.awayScore;
      const dob = pick(pInfo.dateOfBirth, pObj.dateOfBirth, pObj.dob, prev.dob, profile.dateOfBirth);
      const storedMinutes = formatMinutesPlayed(pick(apiReport.minutesPlayed, apiReport.timePlayedMinutes));

      return {
        ...prev,
        playerName: pick(pInfo.playerName, apiReport.playerName, pObj.fullName, pObj.name, prev.playerName, profile.fullName),
        dob: dob ? formatDateToYMD(dob) : "",
        clubName: pick(pInfo.clubName, pObj.currentClub, prev.clubName, profile.currentClub),
        position: pick(pInfo.position, apiReport.position, apiReport.playerPosition, pObj.position, urlPosition, prev.position, profile.position).toUpperCase(),
        foot: pick(pInfo.foot, apiReport.foot, pObj.preferredFoot, prev.foot, profile.preferredFoot).toUpperCase(),
        weight: pick(pInfo.weight, apiReport.weight, pObj.weight, prev.weight, profile.weight),
        height: pick(pInfo.height, apiReport.height, pObj.height, prev.height, profile.height),
        playerImage: pick(
          pObj.cardImage, pObj.profileImage, pObj.profileImg, pObj.avatar, apiReport.playerAvatar,
          prev.playerImage, profile.cardImage, profile.cardPhoto, profile.profileImage, profile.profileImg
        ),
        matchesPlayed: pick(apiReport.matchesPlayed, "1"),
        // A report is created (before payment) with no minutes yet, so a stored
        // "00:00"/0 must not overwrite the minutes the user entered in step 2.
        minutesPlayed: storedMinutes !== "00:00" ? storedMinutes : prev.minutesPlayed,
        manOfTheMatch: pick(apiReport.manOfTheMatch, prev.manOfTheMatch),
        scoutName: pick(apiReport.scoutName, prev.scoutName, apiReport.evaluatorName, apiReport.evaluator?.name, apiReport.authorName),
        gameDate: formatDateToYMD(pick(apiReport.gameDate, apiReport.date, prev.gameDate)),
        gameType: pick(apiReport.gameType, apiReport.league, prev.gameType).toUpperCase(),
        gameLocation: pick(apiReport.gameLocation, apiReport.stadium, apiReport.location, prev.gameLocation).toUpperCase(),
        matchResult: pick(
          apiReport.matchResult,
          prev.matchResult,
          own && opp ? `${own} ${homeScore ?? 0} X ${awayScore ?? 0} ${opp}`.toUpperCase() : ""
        ),
        weather: pick(apiReport.weather, prev.weather).toUpperCase(),
        temperature: pick(apiReport.temperature, prev.temperature),
        opponentTeam: opp,
        ownTeam: own,
        homeScore,
        awayScore,
        scoutRating: typeof rating === "number" ? rating : undefined,
        rating: typeof rating === "number" ? rating : undefined,
        // Calculated by the backend once the report is completed — never computed here.
        categoryRatings:
          apiReport.categoryRatings && typeof apiReport.categoryRatings === "object"
            ? (apiReport.categoryRatings as Record<string, number>)
            : undefined,
      };
    });

    // Report's own characteristics first; the details endpoint may omit playerInfo,
    // so fall back to the player's profile styles.
    const chars = [pInfo.characteristics, apiReport.characteristics, pObj.playerStyles, profile.playerStyles].find(
      (c) => Array.isArray(c) && c.length > 0
    );
    if (Array.isArray(chars)) {
      setCharacteristics(chars.map((c: any) => String(c).toUpperCase()));
    }

    // Stats: only override the in-progress form when the report actually has
    // stats saved (i.e. it was completed). Otherwise keep what the user entered.
    if (apiReport.stats && Object.keys(apiReport.stats).length > 0) {
      setStats({ ...DEFAULT_FORM_STATS, ...apiReport.stats });
    }

    if (Array.isArray(apiReport.accurateShots) && apiReport.accurateShots.length > 0) {
      setGoalMarkers(apiReport.accurateShots.map((s: any) => ({ x: s.x, y: s.y })));
    }

    if (Array.isArray(apiReport.accurateAssists) && apiReport.accurateAssists.length > 0) {
      setPitchMarkers(apiReport.accurateAssists.map((a: any) => ({
        x1: a.fromX,
        y1: a.fromY,
        x2: a.toX,
        y2: a.toY,
      })));
    }

    const feedback = pick(apiReport.coachFeedback, apiReport.scoutAnalysis);
    if (feedback) setCoachFeedback(feedback);
  }, [apiReport, reportId, urlPosition, myProfileResponse]);

  // Pre-fill from Redux player list and request data
  useEffect(() => {
    // A saved report from the database always wins over local/mock data.
    if (hasApiReport) return;

    // check if viewOnly
    const viewOnly = searchParams.get("viewOnly") === "true";
    const savedReport = viewOnly && !reportId ? reports.find(r => r.playerId === Number(playerId)) : null;

    if (savedReport) {
      let foundDob = "";
      if (playerId) {
        const player = players.find(p => String(p.id) === String(playerId) || (p as any)._id === playerId);
        if (player) {
          foundDob = player.dob || "";
        }
      }

      setFormData(prev => ({
        ...prev,
        playerName: savedReport.playerName || prev.playerName,
        dob: foundDob || savedReport.date || prev.dob,
        clubName: savedReport.team1 || prev.clubName,
        position: savedReport.playerPosition ? savedReport.playerPosition.toUpperCase() : prev.position,
        foot: savedReport.foot ? savedReport.foot.toUpperCase() : prev.foot,
        weight: savedReport.weight ? savedReport.weight.replace("kg", "") : prev.weight,
        height: savedReport.height ? savedReport.height.replace("m", "") : prev.height,
        matchesPlayed: "1",
        minutesPlayed: formatMinutesPlayed(savedReport.timePlayedMinutes || prev.minutesPlayed),
        manOfTheMatch: "1",
        scoutName: savedReport.scoutName || prev.scoutName,
        gameType: savedReport.league || prev.gameType || "COMPETITIVE MATCH",
        gameDate: savedReport.date || prev.gameDate,
        gameLocation: savedReport.stadium || prev.gameLocation,
        matchResult: savedReport.team1 && savedReport.team2 ? `${savedReport.team1} ${savedReport.score || ""} ${savedReport.team2}` : prev.matchResult,
        weather: savedReport.weather ? savedReport.weather.toUpperCase() : prev.weather,
        temperature: savedReport.temperature || prev.temperature,
        opponentTeam: savedReport.team2 || prev.opponentTeam,
        ownTeam: savedReport.team1 || prev.ownTeam,
        homeScore: typeof (savedReport as any)?.homeScore === "number" ? (savedReport as any).homeScore : prev.homeScore,
        awayScore: typeof (savedReport as any)?.awayScore === "number" ? (savedReport as any).awayScore : prev.awayScore,
      }));
      if (savedReport.characteristics) {
        setCharacteristics(savedReport.characteristics.map(c => c.toUpperCase()));
      }
      
      if (savedReport.goalMarkers && savedReport.goalMarkers.length > 0) {
        setGoalMarkers(savedReport.goalMarkers);
      }
      if (savedReport.pitchMarkers && savedReport.pitchMarkers.length > 0) {
        setPitchMarkers(savedReport.pitchMarkers);
      }
      return;
    }

    if (playerId) {
      const player = players.find(p => String(p.id) === String(playerId) || (p as any)._id === playerId);
      if (player) {
        const posUpper = (player.position || "").toUpperCase();
        let pPos = "STRIKER";
        if (posUpper.includes("GOALKEEPER")) pPos = "GOALKEEPER";
        else if (posUpper.includes("MIDFIELDER")) pPos = "MIDFIELDER";
        else if (posUpper.includes("WINGER")) pPos = "WINGER";
        else if (posUpper.includes("DEFENDER") || posUpper.includes("BACK")) pPos = "DEFENDER";

        setFormData(prev => ({
          ...prev,
          playerName: player.fullName || prev.playerName,
          dob: player.dob || prev.dob,
          clubName: (player.academyName && player.academyName !== "N/A") ? player.academyName : prev.clubName,
          position: pPos,
          foot: player.rightLegUsage > player.leftLegUsage ? "RIGHT" : (player.leftLegUsage > player.rightLegUsage ? "LEFT" : prev.foot),
          weight: player.weight || prev.weight,
          height: player.height || prev.height,
          matchesPlayed: player.seasonStats?.matches ? player.seasonStats.matches.toString() : prev.matchesPlayed,
          minutesPlayed: player.seasonStats?.matches ? `${player.seasonStats.matches * 90}:00` : prev.minutesPlayed,
          scoutName: (player.coachName && player.coachName !== "N/A") ? player.coachName : prev.scoutName,
          playerImage: (player as any).profileImg || (player as any).avatar || prev.playerImage,
        }));

        if (player.selectedStyleIds && player.selectedStyleIds.length > 0) {
          setCharacteristics(player.selectedStyleIds.map(s => s.toUpperCase()));
        }
      }
    }

    // Check coach game reports list for coach report requests
    if (requestId) {
      const coachReport = coachGameReportsResponse?.data?.reports?.find(
        (r) =>
          r._id === requestId ||
          (playerId && (r.player?._id === playerId || (r.player as any)?.id === playerId))
      );

      if (coachReport) {
        setFormData(prev => ({
          ...prev,
          playerName: coachReport.player?.name || prev.playerName,
          position: coachReport.player?.position ? coachReport.player.position.toUpperCase() : prev.position,
          matchResult: coachReport.matches || prev.matchResult,
          gameDate: coachReport.date ? formatDateToYMD(coachReport.date) : prev.gameDate,
        }));
      }

      const request = requests.find(r => r.id === Number(requestId));
      if (request) {
        if (request.formData) {
          setFormData(request.formData);
          if (request.statsData) setStats(request.statsData);
          if (request.goalMarkers) setGoalMarkers(request.goalMarkers);
          if (request.pitchMarkers) setPitchMarkers(request.pitchMarkers);
          if (request.characteristics) setCharacteristics(request.characteristics);
        } else {
          setFormData(prev => ({
            ...prev,
            gameDate: request.date ? formatDateToYMD(request.date) : prev.gameDate,
            gameLocation: request.location || prev.gameLocation,
            gameType: request.league || prev.gameType,
            matchResult: request.opponent ? `${prev.playerName} vs ${request.opponent}` : prev.matchResult,
            weather: request.weather || prev.weather,
            temperature: request.temperature || prev.temperature,
            opponentTeam: request.opponent || prev.opponentTeam,
          }));
        }
      }
    }
  }, [playerId, requestId, reportId, players, searchParams, requests, coachGameReportsResponse, hasApiReport]);

 



  /**
   * Builds the player + match info that is persisted with the report.
   * Every value comes from what the user entered (pre-filled from their
   * profile). Nothing is invented: if a required field is missing we show an
   * error and return null instead of saving placeholder data.
   */
  const buildPayload = (scoutNameOverride?: string): ICreateSelfGameReportPayload | null => {
    const toInt = (v: unknown) => {
      const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
      return isNaN(n) ? 0 : n;
    };
    const toNum = (v: unknown) => {
      const n = parseFloat(String(v ?? "").replace(/[^\d.-]/g, ""));
      return isNaN(n) ? NaN : n;
    };

    const hScore = toInt(formData.homeScore);
    const aScore = toInt(formData.awayScore);
    const pName = formData.playerName?.trim() || "";
    const pClub = formData.clubName?.trim() || "";
    const pDob = formatDateToYMD(formData.dob || "");
    const pPos = (urlPosition || formData.position || "").trim().toUpperCase();
    const pFoot = (formData.foot || "").trim().toUpperCase();
    const pWeight = toNum(formData.weight);
    const pHeight = toNum(formData.height);
    const own = formData.ownTeam?.trim() || pClub;
    const opp = formData.opponentTeam?.trim() || "";
    const gDate = formatDateToYMD(formData.gameDate || "");
    const gType = (formData.gameType || "").trim().toUpperCase();
    const gLocation = (formData.gameLocation || "").trim().toUpperCase();
    const weather = (formData.weather || "").trim().toUpperCase();
    const temperature = toNum(formData.temperature);
    const matchResult =
      (formData.matchResult || "").trim().toUpperCase() ||
      `${own} ${hScore} X ${aScore} ${opp}`.toUpperCase();
    const scoutName =
      scoutNameOverride !== undefined
        ? scoutNameOverride.trim()
        : (formData.scoutName || "").trim() || (isCoach ? authUser?.name || "" : "SELF");

    const missing: string[] = [];
    if (!pName) missing.push("Player name");
    if (!pDob) missing.push("Date of birth");
    if (!pClub) missing.push("Club name");
    if (!pPos) missing.push("Position");
    if (!pFoot) missing.push("Foot");
    if (!(pWeight > 0)) missing.push("Weight");
    if (!(pHeight > 0)) missing.push("Height");
    if (!scoutName) missing.push("Scout name");
    if (!gType) missing.push("Game type");
    if (!gDate) missing.push("Game date");
    if (!gLocation) missing.push("Game location");
    if (!own) missing.push("Own team");
    if (!opp) missing.push("Opponent team");
    if (!weather) missing.push("Weather");
    if (isNaN(temperature)) missing.push("Temperature");

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      navigateToStep(1);
      return null;
    }

    return {
      playerInfo: {
        playerName: pName,
        dateOfBirth: pDob,
        clubName: pClub,
        position: pPos,
        foot: pFoot,
        characteristics: characteristics || [],
        weight: pWeight,
        height: pHeight,
      },
      scoutName,
      gameType: gType,
      gameDate: gDate,
      gameLocation: gLocation,
      matchResult,
      weather,
      temperature,
      opponentTeam: opp,
      ownTeam: own,
      homeScore: hScore,
      awayScore: aScore,
    };
  };

  const isGKPosition = () => {
    const pos = (urlPosition || formData.position || "").trim().toUpperCase();
    return pos === "GOALKEEPER" || pos === "GK";
  };

  /**
   * Builds the "complete game report" payload from exactly what was entered
   * in the Match Statistics step. The stat keys are taken from the same slide
   * definitions the form and the PDF use, so form ⇄ payload ⇄ PDF always match.
   * Returns null (with an error toast) when required input is missing.
   */
  const buildCompletePayload = (): ICompleteSelfGameReportPayload | null => {
    const isGK = isGKPosition();
    const keys = getStatKeysForPosition(isGK);

    const statsPayload: Record<string, number> = {};
    for (const key of keys) statsPayload[key] = readStat(stats, key);

    const minutesPlayed = formatMinutesPlayed(formData.minutesPlayed);
    const feedback = coachFeedback?.trim() || "";

    const missing: string[] = [];
    if (minutesPlayed === "00:00") missing.push("Minutes played");
    if (!feedback) missing.push("Coach tactical feedback");
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      navigateToStep(2);
      return null;
    }

    const accurateShots = (goalMarkers || []).map((m) => ({
      x: Number(Number(m.x).toFixed(1)),
      y: Number(Number(m.y).toFixed(1)),
    }));
    const accurateAssists = (pitchMarkers || []).map((m) => ({
      fromX: Number(Number(m.x1).toFixed(1)),
      fromY: Number(Number(m.y1).toFixed(1)),
      toX: Number(Number(m.x2).toFixed(1)),
      toY: Number(Number(m.y2).toFixed(1)),
    }));

    return {
      minutesPlayed,
      stats: statsPayload,
      accurateShots,
      accurateAssists,
      coachFeedback: feedback,
    };
  };

  /** Summary kept in the local reports list — derived only from entered data. */
  const buildLocalReportSummary = (overallRating: number) => {
    const home = Number(formData.homeScore) || 0;
    const away = Number(formData.awayScore) || 0;
    const [mins, secs] = formatMinutesPlayed(formData.minutesPlayed).split(":").map(Number);
    const completed = readStat(stats, "completedPass");
    const incomplete = readStat(stats, "incompletePass");
    const attempted = completed + incomplete;
    const unit = (val: string, suffix: string) => (val ? `${val}${suffix}` : "");

    return {
      date: formData.gameDate,
      league: formData.gameType,
      team1: formData.ownTeam || formData.clubName,
      team2: formData.opponentTeam,
      score: `${home}-${away}`,
      result: (home > away ? "W" : home < away ? "L" : "D") as "W" | "D" | "L",
      stadium: formData.gameLocation,
      goals: readStat(stats, "goal"),
      assists: readStat(stats, "assist"),
      passes: completed,
      timePlayedMinutes: mins + (secs >= 30 ? 1 : 0),
      yellowCards: readStat(stats, "yellowCard"),
      redCards: readStat(stats, "redCard"),
      passAccuracy: attempted > 0 ? Math.round((completed / attempted) * 100) : 0,
      rating: overallRating / 10,
      scoutName: formData.scoutName,
      gameType: formData.gameType,
      weather: formData.weather,
      temperature: formData.temperature,
      playerPosition: formData.position,
      foot: formData.foot,
      characteristics,
      weight: unit(formData.weight, "kg"),
      height: unit(formData.height, parseFloat(formData.height) > 3 ? "cm" : "m"),
      playerId: playerId ? Number(playerId) : undefined,
      playerName: formData.playerName,
      pitchMarkers,
      goalMarkers,
    };
  };

  const handleSelfReportSubmit = async () => {
    // 1. Build payload from the entered details (aborts if anything is missing)
    const payload = buildPayload();
    if (!payload) return;

    // 2. Persist current draft in sessionStorage so after Stripe redirect, all details are restored
    try {
      if (typeof window !== "undefined") {
        const draftData = {
          formData,
          characteristics,
          stats,
          goalMarkers,
          pitchMarkers,
          coachFeedback,
          reportCompletedBy,
          selectedCoachId,
          selectedCoachEmail,
          coachRequestMode,
          customCoachName,
          customCoachEmail,
        };
        sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
        sessionStorage.setItem("k10_game_report_draft_self", JSON.stringify(draftData));
      }
    } catch {
      // ignore
    }

    try {
      const res = await createSelfGameReport(payload).unwrap();
      const newReportId =
        res?.data?.report?._id ||
        res?.data?._id ||
        res?.data?.id ||
        (res?.data as any)?.reportId ||
        (res as any)?._id ||
        (res as any)?.id;
      if (newReportId && typeof window !== "undefined") {
        sessionStorage.setItem("k10_last_self_report_id", String(newReportId));
      }

      const checkoutUrl =
        res?.data?.checkoutUrl ||
        res?.checkoutUrl ||
        (res?.data as any)?.url ||
        (res as any)?.url;

      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      } else {
        toast.error("Checkout URL not received from server");
      }
    } catch (err: any) {
      console.error("Failed to create self game report via API:", err);
      const msg = err?.data?.message || err?.message || "Failed to create game report. Active subscription may be required.";
      toast.error(msg);
    }
  };

  const handleSave = async (overallRating: number) => {
    const viewOnly = searchParams.get("viewOnly") === "true";
    const existingReport = viewOnly ? reports.find(r => r.playerId === Number(playerId)) : null;

    const currentReportId = reportId || (existingReport ? existingReport.id : Math.floor(Math.random() * 10000));
    const currentSessionId = searchParams.get("session_id") || undefined;

    // Only attempt creating self game report if user has NOT already created and paid via Stripe
    if (!reportId && !currentSessionId && !existingReport) {
      const payload = buildPayload();
      if (!payload) return;
      try {
        const res = await createSelfGameReport(payload).unwrap();
        const checkoutUrl =
          res?.data?.checkoutUrl ||
          res?.checkoutUrl ||
          (res?.data as any)?.url ||
          (res as any)?.url;

        if (checkoutUrl) {
          clearDraft();
          window.location.assign(checkoutUrl);
          return;
        }
      } catch (err: any) {
        console.error("Failed to create self game report via API:", err);
        const msg = err?.data?.message || err?.message || "Failed to create game report. Active subscription may be required.";
        toast.error(msg);
        return;
      }
    }

    const numericId =
      typeof currentReportId === "number"
        ? currentReportId
        : parseInt(String(currentReportId).replace(/\D/g, "").slice(0, 8), 10) ||
          Math.floor(Math.random() * 10000);

    const completePayload = buildCompletePayload();
    if (!completePayload) return;

    const targetReportId = reportId || (typeof window !== "undefined" ? sessionStorage.getItem("k10_last_self_report_id") : null);

    let isCompleteApiSuccess = false;
    if (targetReportId) {
      try {
        await completeSelfGameReport({
          reportId: targetReportId,
          payload: completePayload,
        }).unwrap();
        isCompleteApiSuccess = true;
      } catch (err: any) {
        // Do not pretend the report was saved — the database is the source of truth.
        toast.error(err?.data?.message || err?.message || "Failed to save game report. Please try again.");
        return;
      }
    }

    const finalReport = {
      ...buildLocalReportSummary(overallRating),
      id: numericId,
      reportId: reportId || undefined,
      sessionId: currentSessionId,
      status: "Paid" as const,
      amount: "$ 3.99",
      stats,
    };

    if (existingReport) {
      dispatch(updateGameReport(finalReport));
      updateReport(finalReport);
    } else {
      dispatch(addGameReport(finalReport));
      addReport(finalReport);
    }

    if (requestId) {
      dispatch(completeGameReportRequest(Number(requestId)));
      completeReportRequest(Number(requestId));
    }

    clearDraft();
    toast.success("Game Report saved successfully!");

    if (isCompleteApiSuccess) {
      router.push("/dashboard/player/game-reports");
      return;
    }

    if (onContinue) {
      onContinue(finalReport);
    } else {
      navigateToStep(5);
    }
  };

  // Complete game report for coach (no payment!)
  const handleCoachComplete = async (overallRating: number) => {
    const targetReportId = requestId || reportId || "";
    if (!targetReportId) {
      toast.error("Game report ID not found");
      return;
    }

    // Same body as the self-report completion (same keys, same validation).
    const base = buildCompletePayload();
    if (!base) return;

    const payload = {
      reportId: targetReportId,
      ...base,
      coachFeedback: base.coachFeedback || "",
    };

    try {
      await completeCoachGameReport(payload).unwrap();

      // Sync local redux request if applicable
      if (requestId) {
        dispatch(completeGameReportRequest(Number(requestId)));
        completeReportRequest(Number(requestId));
      }

      const finalReport = {
        ...buildLocalReportSummary(overallRating),
        id: Math.floor(Math.random() * 10000),
        status: "Completed" as const,
        amount: "$ 6.99",
      };

      dispatch(addGameReport(finalReport));
      addReport(finalReport);
      clearDraft();

      if (onContinue) {
        onContinue(finalReport);
      } else {
        navigateToStep(5);
      }
    } catch (err: any) {
      console.error("Failed to complete coach game report:", err);
      toast.error(err?.data?.message || err?.message || "Failed to complete game report. Please try again.");
    }
  };

  // Pre-fill from player profile query if available
  useEffect(() => {
    // Only pre-fill from the profile for a brand-new report; an existing report
    // is loaded from the database by the effect above.
    // Don't overwrite a restored draft (e.g. returning from Stripe) with profile defaults.
    if (myProfileResponse?.data && !playerId && !requestId && !hasApiReport && !isRestoredFromDraft.current) {
      const p = myProfileResponse.data;
      const urlPos = searchParams.get("position");
      setFormData(prev => ({
        ...prev,
        playerName: p.fullName || prev.playerName,
        dob: p.dateOfBirth ? formatDateToYMD(p.dateOfBirth) : prev.dob,
        clubName: p.currentClub || prev.clubName,
        position: urlPos ? urlPos.trim().toUpperCase() : (p.position ? p.position.toUpperCase() : prev.position),
        foot: p.preferredFoot ? p.preferredFoot.toUpperCase() : prev.foot,
        weight: p.weight ? String(p.weight) : prev.weight,
        height: p.height ? String(p.height) : prev.height,
        playerImage: p.cardImage || p.cardPhoto || p.profileImage || prev.playerImage,
      }));
      if (p.playerStyles && p.playerStyles.length > 0) {
        setCharacteristics(p.playerStyles.map(s => String(s).toUpperCase()));
      }
    }
  }, [myProfileResponse, playerId, requestId, searchParams, hasApiReport]);

  const handlePlayerSubmit = async () => {
    if (coachRequestMode === "custom") {
      if (!customCoachName?.trim()) {
        toast.error("Please enter coach name");
        navigateToStep(1);
        return;
      }
      if (!customCoachEmail?.trim()) {
        toast.error("Please enter coach email");
        navigateToStep(1);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customCoachEmail.trim())) {
        toast.error("Please enter a valid coach email address");
        navigateToStep(1);
        return;
      }
    } else {
      if (!selectedCoachId) {
        toast.error("Please select a coach first");
        navigateToStep(1);
        return;
      }
    }

    // The scout is the coach who will complete the report.
    // Scout name is what the user entered; fall back to the requested coach's name.
    const coachScoutName =
      formData.scoutName?.trim() ||
      (coachRequestMode === "custom"
        ? customCoachName.trim()
        : selectedCoachEmail
        ? selectedCoachEmail.split("@")[0]
        : "");

    const basePayload = buildPayload(coachScoutName);
    if (!basePayload) return;

    const payload: IRequestCoachGameReportPayload = {
      ...(coachRequestMode === "custom"
        ? {
            coachEmail: customCoachEmail.trim(),
            coachName: customCoachName.trim(),
          }
        : {
            coachId: selectedCoachId,
          }),
      ...basePayload,
    };

    try {
      const res = await requestCoachGameReport(payload).unwrap();
      const checkoutUrl =
        res?.data?.checkoutUrl ||
        (res as any)?.checkoutUrl ||
        res?.data?.url ||
        (res as any)?.url;

      if (checkoutUrl) {
        clearDraft();
        window.location.assign(checkoutUrl);
        return;
      }
    } catch (err: any) {
      console.error("Failed to request coach game report via API:", err);
      const msg = err?.data?.message || err?.message || "Failed to request coach game report. Active subscription may be required.";
      toast.error(msg);
      return;
    }

    // Add request to REPORT_REQUESTS_DATA for local state sync
    const newReq = addReportRequest({
      playerName: formData.playerName,
      playerPosition: formData.position,
      date: formData.gameDate,
      status: "Pending",
      coachName: formData.scoutName || "Coach",
      playerId: playerId ? Number(playerId) : (players[0]?.id || 1),
      opponent: formData.opponentTeam || formData.clubName,
      location: formData.gameLocation,
      league: formData.gameType,
      weather: formData.weather,
      temperature: formData.temperature,
      message: "Please review my game report.",
      statsData: stats,
      pitchMarkers: pitchMarkers,
      goalMarkers: goalMarkers,
      characteristics: characteristics,
      formData: formData
    });

    clearDraft();
    dispatch(addGameReportRequest(newReq));
    navigateToStep(5);
  };

  return (
    <div className="w-full">
      {step === 1 && (
        <ReportDetailsForm 
          formData={formData} 
          setFormData={setFormData}
          characteristics={characteristics}
          setCharacteristics={setCharacteristics}
          reportCompletedBy={reportCompletedBy}
          setReportCompletedBy={setReportCompletedBy}
          selectedCoachId={selectedCoachId}
          setSelectedCoachId={setSelectedCoachId}
          selectedCoachEmail={selectedCoachEmail}
          setSelectedCoachEmail={setSelectedCoachEmail}
          coachRequestMode={coachRequestMode}
          setCoachRequestMode={setCoachRequestMode}
          customCoachName={customCoachName}
          setCustomCoachName={setCustomCoachName}
          customCoachEmail={customCoachEmail}
          setCustomCoachEmail={setCustomCoachEmail}
          isSubmitting={isRequestingCoachReport || isCreatingSelfReport}
          onCancel={() => {
            clearDraft();
            onCancel();
          }}
          onContinue={async () => {
            if (isCoach) {
              navigateToStep(2);
            } else if (reportCompletedBy === "coach" && userRole !== "coach") {
              // Direct request to coach API and redirect to Stripe checkout
              await handlePlayerSubmit();
            } else if (reportId || searchParams.get("session_id")) {
              // Already paid, proceed to statistics
              navigateToStep(2);
            } else {
              // Self report: Call POST /players/me/game-reports/self and redirect to Stripe checkout
              await handleSelfReportSubmit();
            }
          }} 
        />
      )}
      
      {step === 2 && (
        <MatchStatisticsForm 
          position={urlPosition || formData.position}
          minutesPlayed={formData.minutesPlayed}
          setMinutesPlayed={handleSetMinutesPlayed}
          stats={stats}
          setStats={setStats}
          goalMarkers={goalMarkers}
          setGoalMarkers={setGoalMarkers}
          pitchMarkers={pitchMarkers}
          setPitchMarkers={setPitchMarkers}
          coachFeedback={coachFeedback}
          setCoachFeedback={setCoachFeedback}
          playerImage={formData.playerImage}
          playerName={formData.playerName}
          onCancel={() => {
            if (isCoach) {
              clearDraft();
              router.push("/dashboard/coach/game-reports");
            } else {
              navigateToStep(1);
            }
          }}
          onSubmit={() => navigateToStep(3)}
        />
      )}

      {step === 3 && (
        <ReportPdfPreview 
          formData={{ ...formData, position: urlPosition || formData.position }}
          characteristics={characteristics}
          stats={stats}
          goalMarkers={goalMarkers}
          pitchMarkers={pitchMarkers}
          coachFeedback={coachFeedback}
          isSubmitting={isCompletingCoachReport || isCreatingSelfReport || isCompletingSelfReport}
          viewOnly={viewOnly}
          onSave={async (overallRating) => {
            if (isCoach) {
              await handleCoachComplete(overallRating);
            } else {
              setTempRating(overallRating);
              // Direct save & redirect to Stripe checkout!
              await handleSave(overallRating);
            }
          }}
          onBack={() => (viewOnly ? onCancel() : navigateToStep(2))}
          isPlayer={!isCoach}
        />
      )}

      {step === 4 && (
        isCoach ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Button
              onClick={() => handleCoachComplete(tempRating)}
              disabled={isCompletingCoachReport}
              className="bg-[#00FF62] hover:bg-[#00D150] text-black font-bold uppercase tracking-widest px-8 py-4 rounded-xl font-orbitron"
            >
              {isCompletingCoachReport ? "Completing Report..." : "Complete Game Report"}
            </Button>
          </div>
        ) : (
          <StripePaymentModal 
            buttonText="Pay $6.99 & Save Report"
            isSubmitting={isCreatingSelfReport}
            onPay={async () => {
              await handleSave(tempRating);
            }}
            onBack={() => {
              navigateToStep(3);
            }}
          />
        )
      )}

      {step === 5 && (
        <div className="space-y-8 max-w-lg mx-auto text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6 text-green-500">
            <IconCircleCheck size={48} stroke={1.5} />
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-orbitron">
            {isCoach
              ? "Report Completed"
              : reportCompletedBy === "coach" && userRole !== "coach"
              ? "Request Submitted"
              : "Report Saved"}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isCoach
              ? "The game report has been successfully finalized and verified. The player's performance analysis and stats have been updated."
              : reportCompletedBy === "coach" && userRole !== "coach"
              ? "Your payment of **$3.99** was processed successfully. We have notified your coach of your analysis request. Once complete, the verified report will appear on your CV."
              : "Your payment of **$3.99** was processed successfully. Your game report has been saved successfully and added to your profile."}
          </p>

          <Button 
            onClick={() => {
              clearDraft();
              if (isCoach) {
                router.push("/dashboard/coach/game-reports");
              } else {
                router.push("/dashboard/player/game-reports");
              }
            }}
            className="w-full h-14 rounded-xl bg-[#00FF62] hover:bg-[#00D150] text-black font-bold uppercase tracking-widest transition-all font-orbitron"
          >
            Back to Game Reports
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateGameReportWizard;

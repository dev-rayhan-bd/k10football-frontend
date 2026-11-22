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
import MatchStatisticsForm, { PitchLine, DEFAULT_FORM_STATS } from "./MatchStatisticsForm";
import ReportPdfPreview from "./ReportPdfPreview";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addGameReport, updateGameReport, completeGameReportRequest, addGameReportRequest } from "@/redux/features/reports/reportsSlice";
import {
  useCreateSelfGameReportMutation,
  useCompleteSelfGameReportMutation,
  useRequestCoachGameReportMutation,
  useGetMyPlayerProfileQuery,
} from "@/redux/features/player/playerApi";
import {
  useCompleteCoachGameReportMutation,
  useGetCoachGameReportsQuery,
} from "@/redux/features/coach/coachApi";
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

  const [characteristics, setCharacteristics] = useState<string[]>(["FAST", "SKILLFUL", "FINISHER"]);
  const [coachFeedback, setCoachFeedback] = useState<string>("");
  const [formData, setFormData] = useState({
    playerName: "EDEGELSON RICCI",
    dob: "2014-03-27",
    clubName: "INTER MIAMI",
    position: searchParams.get("position")?.trim().toUpperCase() || "STRIKER",
    foot: "RIGHT",
    weight: "45",
    height: "1.20",
    matchesPlayed: "1",
    minutesPlayed: "00:00",
    manOfTheMatch: "1",
    scoutName: "MARIO LOPEZ",
    gameType: "FRIENDLY CHAMPIONSHIP CATARINESE",
    gameDate: "2021-02-22",
    gameLocation: "LONDON",
    matchResult: "EDEGELSON RICCI 2 X 0 OPPONENT",
    weather: "RAINY",
    temperature: "19",
    opponentTeam: "Chelsea U19",
    ownTeam: "FC Barcelona",
    homeScore: 2,
    awayScore: 1
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

  // Pre-fill from Redux player list and request data
  useEffect(() => {
    let pName = "EDEGELSON RICCI";
    let pDob = "27-03-2014";
    let pClub = "INTER MIAMI";
    let pPos = "STRIKER";
    let pFoot = "RIGHT";
    let pWeight = "45";
    let pHeight = "1.20";
    let pMatches = "1";
    let pMinutes = "00:00";
    let pScout = "MARIO LOPEZ";

    // check if viewOnly
    const viewOnly = searchParams.get("viewOnly") === "true";
    const savedReport = viewOnly ? reports.find(r => r.playerId === Number(playerId)) : null;

    if (savedReport) {
      // Find player dob from player list if available
      let foundDob = pDob;
      if (playerId) {
        const player = players.find(p => String(p.id) === String(playerId) || (p as any)._id === playerId);
        if (player) {
          foundDob = player.dob || "15-03-1996";
        }
      }

      setFormData({
        playerName: savedReport.playerName || pName,
        dob: foundDob,
        clubName: savedReport.team1 || pClub,
        position: savedReport.playerPosition.toUpperCase() || pPos,
        foot: savedReport.foot.toUpperCase() || pFoot,
        weight: savedReport.weight.replace("kg", "") || pWeight,
        height: savedReport.height.replace("m", "") || pHeight,
        matchesPlayed: "1",
        minutesPlayed: formatMinutesPlayed(savedReport.timePlayedMinutes || pMinutes),
        manOfTheMatch: "1",
        scoutName: savedReport.scoutName || pScout,
        gameType: savedReport.league || "COMPETITIVE MATCH",
        gameDate: savedReport.date || "2021-02-22",
        gameLocation: savedReport.stadium || "LONDON",
        matchResult: `${savedReport.team1} ${savedReport.score} ${savedReport.team2}`,
        weather: savedReport.weather.toUpperCase() || "SUNNY",
        temperature: savedReport.temperature || "22",
        opponentTeam: savedReport.team2 || "Chelsea U19",
        ownTeam: savedReport.team1 || "FC Barcelona",
        homeScore: 2,
        awayScore: 1
      });
      if (savedReport.characteristics) {
        setCharacteristics(savedReport.characteristics.map(c => c.toUpperCase()));
      }
      
      // Load saved markers if available, otherwise fallback to defaults
      if (savedReport.goalMarkers && savedReport.goalMarkers.length > 0) {
        setGoalMarkers(savedReport.goalMarkers);
      } else {
        setGoalMarkers([{ x: 15, y: 25 }, { x: 85, y: 25 }, { x: 50, y: 50 }]);
      }

      if (savedReport.pitchMarkers && savedReport.pitchMarkers.length > 0) {
        setPitchMarkers(savedReport.pitchMarkers);
      } else {
        const isGK = savedReport.playerPosition.toUpperCase() === "GOALKEEPER";
        if (isGK) {
          setPitchMarkers([{ x1: 45, y1: 65, x2: 56, y2: 40 }]);
        } else {
          setPitchMarkers([{ x1: 48, y1: 62, x2: 56, y2: 46 }]);
        }
      }

      // Default mock 24 stats for viewOnly
      const isGK = savedReport.playerPosition.toUpperCase() === "GOALKEEPER";
      if (isGK) {
        setStats({
          shotsOnGoal: 0, goalScored: savedReport.goals, assists: savedReport.assists, passAccurate: savedReport.passes, wrongPass: 2, penaltiesTaken: 0,
          standTackle: 0, slidingTackle: 0, interception: 0, savesAccurate: 10, freeKick: 0, cornerKick: 0,
          goalUnsave: 1, penaltiesSaves: 1, appearances: savedReport.timePlayedMinutes ? 1 : 15, fault: 1, redCard: savedReport.redCards, yellowCard: savedReport.yellowCards,
          punching: 5, handling: 10, reflex: 1, aerialAbility: 5, throwing: 8, reactions: 1
        });
      } else {
        setStats({
          shotsOnGoal: 8, goalScored: savedReport.goals, assists: savedReport.assists, passAccurate: savedReport.passes, wrongPass: 2, penaltiesTaken: 4,
          standTackle: 12, slidingTackle: 12, interception: 2, savesAccurate: 10, freeKick: 12, cornerKick: 4,
          goalUnsave: 1, penaltiesSaves: 1, appearances: savedReport.timePlayedMinutes ? 1 : 15, fault: 1, redCard: savedReport.redCards, yellowCard: savedReport.yellowCards,
          punching: 5, handling: 10, reflex: 1, aerialAbility: 5, throwing: 8, reactions: 1
        });
      }
    } else {
      // 1. Fill player details
      if (playerId) {
        const player = players.find(p => String(p.id) === String(playerId) || (p as any)._id === playerId);
        if (player) {
          pName = player.fullName;
          pDob = player.dob || "15-03-1996";
          pClub = player.academyName && player.academyName !== "N/A" ? player.academyName : "INTER MIAMI";
          pFoot = player.rightLegUsage > player.leftLegUsage ? "RIGHT" : "LEFT";
          pWeight = player.weight || "45";
          pHeight = player.height || "1.20";
          pMatches = player.seasonStats?.matches ? player.seasonStats.matches.toString() : "1";
          pMinutes = player.seasonStats?.matches ? `${player.seasonStats.matches * 90}:00` : "00:00";
          pScout = player.coachName && player.coachName !== "N/A" ? player.coachName : "MARIO LOPEZ";

          const posUpper = player.position.toUpperCase();
          if (posUpper.includes("GOALKEEPER")) pPos = "GOALKEEPER";
          else if (posUpper.includes("MIDFIELDER")) pPos = "MIDFIELDER";
          else if (posUpper.includes("WINGER")) pPos = "WINGER";
          else if (posUpper.includes("DEFENDER") || posUpper.includes("BACK")) pPos = "DEFENDER";

          if (player.selectedStyleIds && player.selectedStyleIds.length > 0) {
            setCharacteristics(player.selectedStyleIds.map(s => s.toUpperCase()));
          } else {
            setCharacteristics(["FAST", "SKILLFUL"]);
          }
        }
      }

      // 2. Fill request match details
      let mDate = "2021-02-22";
      let mLocation = "LONDON";
      let mType = "FRIENDLY CHAMPIONSHIP CATARINESE";
      let mResult = `${pName.toUpperCase()} 2 x 0 OPPONENT`;
      let mWeather = "RAINY";
      let mTemp = "19";

      // Check coach game reports list for coach report requests
      const coachReport = coachGameReportsResponse?.data?.reports?.find(
        (r) =>
          r._id === requestId ||
          (playerId && (r.player?._id === playerId || (r.player as any)?.id === playerId))
      );

      if (coachReport) {
        if (coachReport.player?.name) pName = coachReport.player.name;
        if (coachReport.player?.position) pPos = coachReport.player.position.toUpperCase();
        if (coachReport.matches) mResult = coachReport.matches;
        if (coachReport.date) mDate = coachReport.date;
      }

      if (requestId) {
        const request = requests.find(r => r.id === Number(requestId));
        if (request) {
          mDate = request.date;
          mLocation = request.location || "LONDON";
          mType = request.league || "COMPETITIVE MATCH";
          mResult = `${pName.toUpperCase()} vs ${request.opponent || "OPPONENT"}`;
          mWeather = request.weather || "SUNNY";
          mTemp = request.temperature || "22";

          // If the player filled the full form, load their data
          if (request.formData) {
            setFormData(request.formData);
            if (request.statsData) setStats(request.statsData);
            if (request.goalMarkers) setGoalMarkers(request.goalMarkers);
            if (request.pitchMarkers) setPitchMarkers(request.pitchMarkers);
            if (request.characteristics) setCharacteristics(request.characteristics);
            return; // Skip setting default formData below
          }
        }
      }

      setFormData({
        playerName: pName,
        dob: pDob,
        clubName: pClub,
        position: pPos,
        foot: pFoot,
        weight: pWeight,
        height: pHeight,
        matchesPlayed: pMatches,
        minutesPlayed: formatMinutesPlayed(pMinutes),
        manOfTheMatch: "1",
        scoutName: pScout,
        gameType: mType,
        gameDate: mDate,
        gameLocation: mLocation,
        matchResult: mResult,
        weather: mWeather,
        temperature: mTemp,
        opponentTeam: "Chelsea U19",
        ownTeam: "FC Barcelona",
        homeScore: 2,
        awayScore: 1
      });
    }
  }, [playerId, requestId, players, searchParams, requests, coachGameReportsResponse]);

 



  const buildPayload = (): ICreateSelfGameReportPayload => {
    let hScore = typeof formData.homeScore === "number" ? formData.homeScore : parseInt(String(formData.homeScore ?? "2"), 10);
    let aScore = typeof formData.awayScore === "number" ? formData.awayScore : parseInt(String(formData.awayScore ?? "1"), 10);
    if (isNaN(hScore)) hScore = 2;
    if (isNaN(aScore)) aScore = 1;

    const payload: ICreateSelfGameReportPayload = {
      playerInfo: {
        playerName: formData.playerName?.trim() || "EDEGELSON RICCI",
        dateOfBirth: formatDateToYMD(formData.dob) || "2014-03-27",
        clubName: formData.clubName?.trim() || "INTER MIAMI",
        position: (urlPosition || formData.position)?.trim().toUpperCase() || "STRIKER",
        foot: formData.foot?.trim().toUpperCase() || "RIGHT",
        characteristics: characteristics && characteristics.length > 0 ? characteristics : ["FAST", "SKILLFUL", "FINISHER"],
        weight: Number(String(formData.weight).replace(/[^\d.]/g, "")) || 45,
        height: Number(String(formData.height).replace(/[^\d.]/g, "")) || 1.20,
      },
      scoutName: formData.scoutName?.trim() || "MARIO LOPEZ",
      gameType: formData.gameType?.trim().toUpperCase() || "FRIENDLY CHAMPIONSHIP CATARINESE",
      gameDate: formatDateToYMD(formData.gameDate) || "2021-02-22",
      gameLocation: formData.gameLocation?.trim().toUpperCase() || "LONDON",
      matchResult: formData.matchResult?.trim() || "EDEGELSON RICCI 2 X 0 OPPONENT",
      weather: formData.weather?.trim().toUpperCase() || "RAINY",
      temperature: Number(String(formData.temperature).replace(/[^\d.-]/g, "")) || 19,
      opponentTeam: formData.opponentTeam?.trim() || "Chelsea U19",
      ownTeam: formData.ownTeam?.trim() || "FC Barcelona",
      homeScore: hScore,
      awayScore: aScore,
    };

    console.log("🚀 CREATE SELF GAME REPORT PAYLOAD:", payload);
    console.log("📦 PAYLOAD JSON:\n", JSON.stringify(payload, null, 2));

    return payload;
  };

  const handleSelfReportSubmit = async () => {
    // 1. Build payload from current details and defaults
    const payload = buildPayload();

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

    const isGK =
      (urlPosition || formData.position)?.trim().toUpperCase() === "GOALKEEPER" ||
      (urlPosition || formData.position)?.trim().toUpperCase() === "GK";

    const commonStats = {
      goal: Number(stats.goal ?? stats.goalScored ?? 2),
      assist: Number(stats.assist ?? stats.assists ?? 1),
      shotOnTarget: Number(stats.shotOnTarget ?? stats.shotsOnGoal ?? 4),
      shotOffTarget: Number(stats.shotOffTarget ?? 1),
      bigChanceCreated: Number(stats.bigChanceCreated ?? 2),
      bigChanceMissed: Number(stats.bigChanceMissed ?? 0),
      successfulDribble: Number(stats.successfulDribble ?? 3),
      failedDribble: Number(stats.failedDribble ?? 1),
      penaltyWon: Number(stats.penaltyWon ?? stats.penaltiesTaken ?? 1),
      penaltyMissed: Number(stats.penaltyMissed ?? 0),

      completedPass: Number(stats.completedPass ?? stats.passAccurate ?? (isGK ? 43 : 28)),
      incompletePass: Number(stats.incompletePass ?? stats.wrongPass ?? (isGK ? 7 : 4)),
      keyPass: Number(stats.keyPass ?? 3),
      throughBallCompleted: Number(stats.throughBallCompleted ?? 2),
      longPassCompleted: Number(stats.longPassCompleted ?? (isGK ? 10 : 3)),
      crossCompleted: Number(stats.crossCompleted ?? 2),
      crossFailed: Number(stats.crossFailed ?? 1),

      ballRetention: Number(stats.ballRetention ?? 5),
      turnover: Number(stats.turnover ?? 2),
      freeKickWon: Number(stats.freeKickWon ?? stats.freeKick ?? 3),
      successfulCarry: Number(stats.successfulCarry ?? 4),

      tackleWon: Number(stats.tackleWon ?? stats.standTackle ?? 3),
      tackleLost: Number(stats.tackleLost ?? 1),
      interception: Number(stats.interception ?? (isGK ? 3 : 2)),
      clearance: Number(stats.clearance ?? (isGK ? 4 : 1)),
      block: Number(stats.block ?? 1),
      aerialDuelWon: Number(stats.aerialDuelWon ?? (isGK ? 4 : 2)),
      aerialDuelLost: Number(stats.aerialDuelLost ?? (isGK ? 2 : 1)),
      groundDuelWon: Number(stats.groundDuelWon ?? 4),
      groundDuelLost: Number(stats.groundDuelLost ?? 2),
      recovery: Number(stats.recovery ?? (isGK ? 7 : 3)),
      defensiveError: Number(stats.defensiveError ?? 0),
      errorLeadingToGoal: Number(stats.errorLeadingToGoal ?? 0),

      foulCommitted: Number(stats.foulCommitted ?? stats.fault ?? 1),
      yellowCard: Number(stats.yellowCard ?? 0),
      redCard: Number(stats.redCard ?? 0),
    };

    const gkStats = {
      ...commonStats,
      save: Number(stats.save ?? stats.savesAccurate ?? 6),
      bigSave: Number(stats.bigSave ?? 2),
      save1v1: Number(stats.save1v1 ?? stats.oneOnOneSave ?? 1),
      goalConceded: Number(stats.goalConceded ?? stats.goalUnsave ?? 1),
      cleanSheet: Number(stats.cleanSheet ?? 0),
      crossClaimed: Number(stats.crossClaimed ?? 4),
      crossMissed: Number(stats.crossMissed ?? 0),
      distributionCompleted: Number(stats.distributionCompleted ?? 18),
      distributionFailed: Number(stats.distributionFailed ?? 2),
    };

    const finalStatsPayload = isGK ? gkStats : commonStats;

    const accurateShots = (goalMarkers && goalMarkers.length > 0
      ? goalMarkers
      : [{ x: 15.2, y: 28.4 }, { x: 84.6, y: 22.1 }]
    ).map((m) => ({
      x: Number(Number(m.x).toFixed(1)),
      y: Number(Number(m.y).toFixed(1)),
    }));

    const accurateAssists = (pitchMarkers && pitchMarkers.length > 0
      ? pitchMarkers
      : [{ x1: 45.0, y1: 70.0, x2: 50.0, y2: 55.0 }]
    ).map((m) => ({
      fromX: Number(Number(m.x1).toFixed(1)),
      fromY: Number(Number(m.y1).toFixed(1)),
      toX: Number(Number(m.x2).toFixed(1)),
      toY: Number(Number(m.y2).toFixed(1)),
    }));

    const rawMins = formData.minutesPlayed;
    const formattedMins = formatMinutesPlayed(rawMins);
    const finalMinutes = (formattedMins && formattedMins !== "00:00")
      ? formattedMins
      : (isGK ? "98:08" : "08:08");

    const completePayload: ICompleteSelfGameReportPayload = {
      minutesPlayed: finalMinutes,
      stats: finalStatsPayload,
      accurateShots,
      accurateAssists,
      coachFeedback: coachFeedback?.trim() || "",
    };

    console.log("🚀 COMPLETE SELF GAME REPORT PAYLOAD (Dynamic):", completePayload);
    console.log("📦 COMPLETE SELF PAYLOAD JSON:\n", JSON.stringify(completePayload, null, 2));

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
        console.warn("Could not complete self game report via API:", err?.data?.message || err?.message || err);
      }
    }

    const finalReport = {
      id: numericId,
      reportId: reportId || undefined,
      sessionId: currentSessionId,
      date: formData.gameDate,
      league: formData.gameType,
      team1: formData.clubName,
      team2: formData.matchResult.includes(" vs ") ? formData.matchResult.split(" vs ")[1] : (formData.matchResult.split(" x ")[1] || "OPPONENT"),
      score: formData.matchResult.includes(" x ") ? formData.matchResult.split(" ").slice(-3).join(" ") : "2-1",
      result: "W" as const,
      stadium: formData.gameLocation,
      goals: stats.goal ?? stats.goalScored ?? 0,
      assists: stats.assist ?? stats.assists ?? 0,
      passes: stats.completedPass ?? stats.passAccurate ?? 50,
      timePlayedMinutes: Number(formData.minutesPlayed.replace(/[^\d]/g, "")) || 90,
      yellowCards: stats.yellowCard ?? 0,
      redCards: stats.redCard ?? 0,
      passAccuracy: Math.round(((stats.completedPass || stats.passAccurate || 1) / ((stats.completedPass || stats.passAccurate || 1) + (stats.incompletePass || stats.wrongPass || 0))) * 100) || 85,
      rating: overallRating / 10,
      scoutName: formData.scoutName,
      gameType: formData.gameType,
      weather: formData.weather,
      temperature: formData.temperature,
      playerPosition: formData.position,
      foot: formData.foot,
      characteristics,
      weight: `${formData.weight}kg`,
      height: `${formData.height}m`,
      status: "Paid" as const,
      amount: "$ 3.99",
      playerId: playerId ? Number(playerId) : undefined,
      playerName: formData.playerName,
      pitchMarkers,
      goalMarkers,
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

    const statsPayload = {
      ...DEFAULT_FORM_STATS,
      ...stats,
      shotsOnGoal: Number(stats.shotsOnGoal ?? stats.shotOnTarget ?? 4),
      goalScored: Number(stats.goalScored ?? stats.goal ?? 2),
      assists: Number(stats.assists ?? stats.assist ?? 1),
      passAccurate: Number(stats.passAccurate ?? stats.completedPass ?? 28),
      wrongPass: Number(stats.wrongPass ?? stats.incompletePass ?? 4),
      penaltiesTaken: Number(stats.penaltiesTaken ?? stats.penaltyWon ?? 1),
      standTackle: Number(stats.standTackle ?? stats.tackleWon ?? 3),
      slidingTackle: Number(stats.slidingTackle ?? stats.tackleWon ?? 3),
      interception: Number(stats.interception ?? 2),
      appearances: Number(stats.appearances ?? 15),
      fault: Number(stats.fault ?? stats.foulCommitted ?? 1),
      redCard: Number(stats.redCard ?? 0),
      yellowCard: Number(stats.yellowCard ?? 0),
      punching: Number(stats.punching ?? 5),
      handling: Number(stats.handling ?? 10),
      reflex: Number(stats.reflex ?? 1),
      aerialAbility: Number(stats.aerialAbility ?? 5),
      throwing: Number(stats.throwing ?? 8),
      reactions: Number(stats.reactions ?? 1),
      savesAccurate: Number(stats.savesAccurate ?? 10),
      freeKick: Number(stats.freeKick ?? stats.freeKickWon ?? 3),
      cornerKick: Number(stats.cornerKick ?? 4),
      goalUnsave: Number(stats.goalUnsave ?? 1),
      penaltiesSaves: Number(stats.penaltiesSaves ?? 1),
    };

    const accurateShots = (goalMarkers && goalMarkers.length > 0
      ? goalMarkers
      : [{ x: 15.2, y: 28.4 }, { x: 84.6, y: 22.1 }]
    ).map((m) => ({
      x: Number(Number(m.x).toFixed(1)),
      y: Number(Number(m.y).toFixed(1)),
    }));

    const accurateAssists = (pitchMarkers && pitchMarkers.length > 0
      ? pitchMarkers
      : [{ x1: 45.0, y1: 70.0, x2: 50.0, y2: 55.0 }]
    ).map((m) => ({
      fromX: Number(Number(m.x1).toFixed(1)),
      fromY: Number(Number(m.y1).toFixed(1)),
      toX: Number(Number(m.x2).toFixed(1)),
      toY: Number(Number(m.y2).toFixed(1)),
    }));

    const payload = {
      reportId: targetReportId,
      minutesPlayed: formatMinutesPlayed(formData.minutesPlayed) || "00:00",
      stats: statsPayload,
      accurateShots,
      accurateAssists,
      coachFeedback:
        coachFeedback?.trim() ||
        "Impressive tactical positioning, clinical shooting and accurate ball distribution throughout the game.",
    };

    try {
      await completeCoachGameReport(payload).unwrap();

      // Sync local redux request if applicable
      if (requestId) {
        dispatch(completeGameReportRequest(Number(requestId)));
        completeReportRequest(Number(requestId));
      }

      const finalReport = {
        id: Math.floor(Math.random() * 10000),
        date: formData.gameDate,
        league: formData.gameType,
        team1: formData.clubName,
        team2: formData.matchResult.includes(" vs ")
          ? formData.matchResult.split(" vs ")[1]
          : formData.matchResult.split(" x ")[1] || "OPPONENT",
        score: formData.matchResult.includes(" x ")
          ? formData.matchResult.split(" ").slice(-3).join(" ")
          : "2-1",
        result: "W" as const,
        stadium: formData.gameLocation,
        goals: stats.goalScored || 0,
        assists: stats.assists || 0,
        passes: stats.passAccurate || 50,
        timePlayedMinutes:
          Number(formData.minutesPlayed.replace(/[^\d]/g, "")) || 90,
        yellowCards: stats.yellowCard || 0,
        redCards: stats.redCard || 0,
        passAccuracy:
          Math.round(
            ((stats.passAccurate || 1) /
              ((stats.passAccurate || 1) + (stats.wrongPass || 0))) *
              100
          ) || 85,
        rating: overallRating / 10,
        scoutName: formData.scoutName,
        gameType: formData.gameType,
        weather: formData.weather,
        temperature: formData.temperature,
        playerPosition: formData.position,
        foot: formData.foot,
        characteristics,
        weight: `${formData.weight}kg`,
        height: `${formData.height}m`,
        status: "Completed" as const,
        amount: "$ 6.99",
        playerId: playerId ? Number(playerId) : undefined,
        playerName: formData.playerName,
        pitchMarkers,
        goalMarkers,
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
    }
  };

  // Pre-fill from player profile query if available
  useEffect(() => {
    if (myProfileResponse?.data && !playerId && !requestId) {
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
      }));
      if (p.playerStyles && p.playerStyles.length > 0) {
        setCharacteristics(p.playerStyles.map(s => String(s).toUpperCase()));
      }
    }
  }, [myProfileResponse, playerId, requestId, searchParams]);

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

    let hScore = typeof formData.homeScore === "number" ? formData.homeScore : parseInt(String(formData.homeScore ?? "2"), 10);
    let aScore = typeof formData.awayScore === "number" ? formData.awayScore : parseInt(String(formData.awayScore ?? "1"), 10);
    if (isNaN(hScore)) hScore = 2;
    if (isNaN(aScore)) aScore = 1;

    const payload: IRequestCoachGameReportPayload = {
      ...(coachRequestMode === "custom"
        ? {
            coachEmail: customCoachEmail.trim(),
            coachName: customCoachName.trim(),
          }
        : {
            coachId: selectedCoachId,
          }),
      playerInfo: {
        playerName: formData.playerName?.trim() || "EDEGELSON RICCI",
        dateOfBirth: formatDateToYMD(formData.dob) || "2014-03-27",
        clubName: formData.clubName?.trim() || "INTER MIAMI",
        position: (urlPosition || formData.position)?.trim().toUpperCase() || "STRIKER",
        foot: formData.foot?.trim().toUpperCase() || "RIGHT",
        characteristics: characteristics && characteristics.length > 0 ? characteristics : ["FAST", "SKILLFUL", "FINISHER"],
        weight: Number(String(formData.weight).replace(/[^\d.]/g, "")) || 45,
        height: Number(String(formData.height).replace(/[^\d.]/g, "")) || 1.20,
      },
      scoutName: formData.scoutName?.trim() || "MARIO LOPEZ",
      gameType: formData.gameType?.trim().toUpperCase() || "FRIENDLY CHAMPIONSHIP CATARINESE",
      gameDate: formatDateToYMD(formData.gameDate) || "2021-02-22",
      gameLocation: formData.gameLocation?.trim().toUpperCase() || "LONDON",
      matchResult: formData.matchResult?.trim() || `${formData.playerName} ${hScore} X ${aScore} OPPONENT`,
      weather: formData.weather?.trim().toUpperCase() || "RAINY",
      temperature: Number(String(formData.temperature).replace(/[^\d.-]/g, "")) || 19,
      ownTeam: formData.ownTeam?.trim() || formData.clubName?.trim() || "FC Barcelona",
      opponentTeam: formData.opponentTeam?.trim() || "Chelsea U19",
      homeScore: hScore,
      awayScore: aScore,
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
          onBack={() => navigateToStep(2)}
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

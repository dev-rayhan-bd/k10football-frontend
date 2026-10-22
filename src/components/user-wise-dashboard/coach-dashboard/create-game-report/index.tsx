/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { addReport, completeReportRequest, addReportRequest, updateReport } from "@/lib/constants/reports";
import ReportDetailsForm from "./ReportDetailsForm";
import StripePaymentModal from "./StripePaymentModal";
import MatchStatisticsForm, { PitchLine } from "./MatchStatisticsForm";
import ReportPdfPreview from "./ReportPdfPreview";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { addGameReport, updateGameReport, completeGameReportRequest, addGameReportRequest } from "@/redux/features/reports/reportsSlice";
import { useCreateSelfGameReportMutation, useRequestCoachGameReportMutation, useGetMyPlayerProfileQuery } from "@/redux/features/player/playerApi";
import { ICreateSelfGameReportPayload, IRequestCoachGameReportPayload } from "@/types/player.type";
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

const formatMinutesPlayed = (val: string): string => {
  if (!val) return "00:00";
  const trimmed = String(val).trim();
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":");
    return `${(m || "0").padStart(2, "0")}:${(s || "00").padStart(2, "0")}`;
  }
  const num = parseInt(trimmed, 10);
  if (isNaN(num)) return "00:00";
  return `${String(num).padStart(2, "0")}:00`;
};

interface CreateGameReportWizardProps {
  onCancel: () => void;
  onContinue?: (data: any) => void;
}

export const CreateGameReportWizard = ({
  onCancel,
  onContinue
}: CreateGameReportWizardProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { players } = usePlayer();
  const [createSelfGameReport, { isLoading: isCreatingSelfReport }] = useCreateSelfGameReportMutation();
  const [requestCoachGameReport, { isLoading: isRequestingCoachReport }] = useRequestCoachGameReportMutation();
  const { data: myProfileResponse } = useGetMyPlayerProfileQuery();

  const reports = useAppSelector(state => state.reports.reports);
  const requests = useAppSelector(state => state.reports.requests);

  const playerId = searchParams.get("playerId");
  const requestId = searchParams.get("requestId");

  const [userRole, setUserRole] = useState<string>("player");
  const [step, setStep] = useState(1);
  const [characteristics, setCharacteristics] = useState<string[]>(["FAST", "SKILLFUL", "FINISHER"]);
  const [formData, setFormData] = useState({
    playerName: "EDEGELSON RICCI",
    dob: "2014-03-27",
    clubName: "INTER MIAMI",
    position: "STRIKER",
    foot: "RIGHT",
    weight: "45",
    height: "1.20",
    matchesPlayed: "1",
    minutesPlayed: "08:08",
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

  const [stats, setStats] = useState<Record<string, number>>({});
  const [goalMarkers, setGoalMarkers] = useState<{ x: number; y: number }[]>([]);
  const [pitchMarkers, setPitchMarkers] = useState<PitchLine[]>([]);
  const [reportCompletedBy, setReportCompletedBy] = useState<"parent" | "coach">("parent");
  const [selectedCoachId, setSelectedCoachId] = useState("");
  const [selectedCoachEmail, setSelectedCoachEmail] = useState("");
  const [tempRating, setTempRating] = useState<number>(0);

  // Scroll to top whenever the wizard step changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const scrollContainers = document.querySelectorAll('.overflow-y-auto, .overflow-auto, main');
    scrollContainers.forEach((container) => {
      container.scrollTo(0, 0);
    });
  }, [step]);

  // Detect user role
  useEffect(() => {
    const role = localStorage.getItem("userRole") || "player";
    setUserRole(role);
    if (role === "coach") {
      setStep(2); // Coach skips payment
    }
  }, []);

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
    let pMinutes = "0";
    let pScout = "MARIO LOPEZ";

    // check if viewOnly
    const viewOnly = searchParams.get("viewOnly") === "true";
    const savedReport = viewOnly ? reports.find(r => r.playerId === Number(playerId)) : null;

    if (savedReport) {
      // Find player dob from player list if available
      let foundDob = pDob;
      if (playerId) {
        const player = players.find(p => p.id === Number(playerId));
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
        minutesPlayed: savedReport.timePlayedMinutes.toString() || pMinutes,
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
        const player = players.find(p => p.id === Number(playerId));
        if (player) {
          pName = player.fullName;
          pDob = player.dob || "15-03-1996";
          pClub = player.academyName && player.academyName !== "N/A" ? player.academyName : "INTER MIAMI";
          pFoot = player.rightLegUsage > player.leftLegUsage ? "RIGHT" : "LEFT";
          pWeight = player.weight || "45";
          pHeight = player.height || "1.20";
          pMatches = player.seasonStats?.matches ? player.seasonStats.matches.toString() : "1";
          pMinutes = player.seasonStats?.matches ? (player.seasonStats.matches * 90).toString() : "90";
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
        minutesPlayed: pMinutes,
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
  }, [playerId, requestId, players, searchParams, requests]);

 



  const buildPayload = (): ICreateSelfGameReportPayload => {
    const statsPayload = {
      shotsOnGoal: Number(stats.shotsOnGoal ?? 8),
      goalScored: Number(stats.goalScored ?? 3),
      assists: Number(stats.assists ?? 6),
      passAccurate: Number(stats.passAccurate ?? 12),
      wrongPass: Number(stats.wrongPass ?? 2),
      penaltiesTaken: Number(stats.penaltiesTaken ?? 4),
      standTackle: Number(stats.standTackle ?? 12),
      slidingTackle: Number(stats.slidingTackle ?? 12),
      interception: Number(stats.interception ?? 2),
      appearances: Number(stats.appearances ?? 15),
      fault: Number(stats.fault ?? 1),
      redCard: Number(stats.redCard ?? 0),
      yellowCard: Number(stats.yellowCard ?? 1),
      punching: Number(stats.punching ?? 5),
      handling: Number(stats.handling ?? 10),
      reflex: Number(stats.reflex ?? 1),
      aerialAbility: Number(stats.aerialAbility ?? 5),
      throwing: Number(stats.throwing ?? 8),
      reactions: Number(stats.reactions ?? 1),
      savesAccurate: Number(stats.savesAccurate ?? 10),
      freeKick: Number(stats.freeKick ?? 12),
      cornerKick: Number(stats.cornerKick ?? 4),
      goalUnsave: Number(stats.goalUnsave ?? 1),
      penaltiesSaves: Number(stats.penaltiesSaves ?? 1),
    };

    const accurateShots = (goalMarkers && goalMarkers.length > 0 ? goalMarkers : [{ x: 15.2, y: 28.4 }, { x: 84.6, y: 22.1 }]).map((m) => ({
      x: Number(Number(m.x).toFixed(1)),
      y: Number(Number(m.y).toFixed(1)),
    }));

    const accurateAssists = (pitchMarkers && pitchMarkers.length > 0 ? pitchMarkers : [{ x1: 45.0, y1: 70.0, x2: 50.0, y2: 55.0 }]).map((m) => ({
      fromX: Number(Number(m.x1).toFixed(1)),
      fromY: Number(Number(m.y1).toFixed(1)),
      toX: Number(Number(m.x2).toFixed(1)),
      toY: Number(Number(m.y2).toFixed(1)),
    }));

    let hScore = typeof formData.homeScore === "number" ? formData.homeScore : parseInt(String(formData.homeScore ?? "2"), 10);
    let aScore = typeof formData.awayScore === "number" ? formData.awayScore : parseInt(String(formData.awayScore ?? "1"), 10);
    if (isNaN(hScore)) hScore = 2;
    if (isNaN(aScore)) aScore = 1;

    return {
      playerInfo: {
        playerName: formData.playerName?.trim() || "EDEGELSON RICCI",
        dateOfBirth: formatDateToYMD(formData.dob) || "2014-03-27",
        clubName: formData.clubName?.trim() || "INTER MIAMI",
        position: formData.position?.trim().toUpperCase() || "STRIKER",
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
      minutesPlayed: formatMinutesPlayed(formData.minutesPlayed) || "08:08",
      stats: statsPayload,
      accurateShots,
      accurateAssists,
    };
  };

  const handleSave = async (overallRating: number) => {
    const viewOnly = searchParams.get("viewOnly") === "true";
    const existingReport = viewOnly ? reports.find(r => r.playerId === Number(playerId)) : null;

    const payload = buildPayload();

    try {
      await createSelfGameReport(payload).unwrap();
    } catch (err: any) {
      console.error("Failed to create self game report via API:", err);
    }

    const finalReport = {
      id: existingReport ? existingReport.id : Math.floor(Math.random() * 10000),
      date: formData.gameDate,
      league: formData.gameType,
      team1: formData.clubName,
      team2: formData.matchResult.includes(" vs ") ? formData.matchResult.split(" vs ")[1] : (formData.matchResult.split(" x ")[1] || "OPPONENT"),
      score: formData.matchResult.includes(" x ") ? formData.matchResult.split(" ").slice(-3).join(" ") : "2-1",
      result: "W" as const,
      stadium: formData.gameLocation,
      goals: stats.goalScored || 0,
      assists: stats.assists || 0,
      passes: stats.passAccurate || 50,
      timePlayedMinutes: Number(formData.minutesPlayed.replace(/[^\d]/g, "")) || 90,
      yellowCards: stats.yellowCard || 0,
      redCards: stats.redCard || 0,
      passAccuracy: Math.round(((stats.passAccurate || 1) / ((stats.passAccurate || 1) + (stats.wrongPass || 0))) * 100) || 85,
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
      amount: "$ 6.99",
      playerId: playerId ? Number(playerId) : undefined,
      playerName: formData.playerName,
      pitchMarkers,
      goalMarkers
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

    toast.success("Game Report saved successfully!");

    if (onContinue) {
      onContinue(finalReport);
    } else {
      setStep(5);
    }
  };

  // Pre-fill from player profile query if available
  useEffect(() => {
    if (myProfileResponse?.data && !playerId && !requestId) {
      const p = myProfileResponse.data;
      setFormData(prev => ({
        ...prev,
        playerName: p.fullName || prev.playerName,
        dob: p.dateOfBirth ? formatDateToYMD(p.dateOfBirth) : prev.dob,
        clubName: p.currentClub || prev.clubName,
        position: p.position ? p.position.toUpperCase() : prev.position,
        foot: p.preferredFoot ? p.preferredFoot.toUpperCase() : prev.foot,
        weight: p.weight ? String(p.weight) : prev.weight,
        height: p.height ? String(p.height) : prev.height,
      }));
      if (p.playerStyles && p.playerStyles.length > 0) {
        setCharacteristics(p.playerStyles.map(s => String(s).toUpperCase()));
      }
    }
  }, [myProfileResponse, playerId, requestId]);

  const handlePlayerSubmit = async () => {
    if (!selectedCoachId) {
      toast.error("Please select a coach first");
      setStep(1);
      return;
    }

    let hScore = typeof formData.homeScore === "number" ? formData.homeScore : parseInt(String(formData.homeScore ?? "2"), 10);
    let aScore = typeof formData.awayScore === "number" ? formData.awayScore : parseInt(String(formData.awayScore ?? "1"), 10);
    if (isNaN(hScore)) hScore = 2;
    if (isNaN(aScore)) aScore = 1;

    const payload: IRequestCoachGameReportPayload = {
      coachId: selectedCoachId,
      playerInfo: {
        playerName: formData.playerName?.trim() || "EDEGELSON RICCI",
        dateOfBirth: formatDateToYMD(formData.dob) || "2014-03-27",
        clubName: formData.clubName?.trim() || "INTER MIAMI",
        position: formData.position?.trim().toUpperCase() || "STRIKER",
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
      await requestCoachGameReport(payload).unwrap();
    } catch (err: any) {
      console.error("Failed to request coach game report via API:", err);
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

    dispatch(addGameReportRequest(newReq));
    setStep(5);
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
          onCancel={onCancel}
          onContinue={() => {
            if (reportCompletedBy === "coach" && userRole !== "coach") {
              // Skip to payment before sending request to coach
              setStep(4);
            } else {
              setStep(2);
            }
          }} 
        />
      )}
      
      {step === 2 && (
        <MatchStatisticsForm 
          position={formData.position}
          minutesPlayed={formData.minutesPlayed}
          setMinutesPlayed={(val) => setFormData({ ...formData, minutesPlayed: val })}
          stats={stats}
          setStats={setStats}
          goalMarkers={goalMarkers}
          setGoalMarkers={setGoalMarkers}
          pitchMarkers={pitchMarkers}
          setPitchMarkers={setPitchMarkers}
          onCancel={() => setStep(1)}
          onSubmit={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <ReportPdfPreview 
          formData={formData}
          characteristics={characteristics}
          stats={stats}
          goalMarkers={goalMarkers}
          pitchMarkers={pitchMarkers}
          onSave={(overallRating) => {
            setTempRating(overallRating);
            // Go to payment step before final save
            setStep(4);
          }}
          onBack={() => setStep(2)}
          isPlayer={userRole !== "coach"}
        />
      )}

      {step === 4 && (
        <StripePaymentModal 
          buttonText={reportCompletedBy === "coach" && userRole !== "coach" ? "Pay $6.99 & Submit Request" : "Pay $6.99 & Save Report"}
          isSubmitting={isCreatingSelfReport || isRequestingCoachReport}
          onPay={async () => {
            if (reportCompletedBy === "coach" && userRole !== "coach") {
              await handlePlayerSubmit();
            } else {
              await handleSave(tempRating);
            }
          }}
          onBack={() => {
            if (reportCompletedBy === "coach" && userRole !== "coach") {
              setStep(1);
            } else {
              setStep(3);
            }
          }}
        />
      )}

      {step === 5 && (
        <div className="space-y-8 max-w-lg mx-auto text-center py-12 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6 text-green-500">
            <IconCircleCheck size={48} stroke={1.5} />
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter font-orbitron">
            {reportCompletedBy === "coach" && userRole !== "coach" ? "Request Submitted" : "Report Saved"}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Your payment of **$6.99** was processed successfully. 
            {reportCompletedBy === "coach" && userRole !== "coach" 
              ? " We have notified your coach of your analysis request. Once complete, the verified report will appear on your CV." 
              : " Your game report has been saved successfully and added to your profile."}
          </p>

          <Button 
            onClick={() => {
              if (userRole === "coach") {
                router.push("/dashboard/coach/game-reports");
              } else {
                router.push("/dashboard/player/game-reports");
              }
            }}
            className="w-full h-14 rounded-xl bg-[#00FF62] hover:bg-[#00D150] text-black font-bold uppercase tracking-widest transition-all font-orbitron"
          >
            Back to Reports
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreateGameReportWizard;

import { GK_SLIDE_1, GK_SLIDE_4, OUTFIELD_SLIDES } from "./MatchStatisticsForm";

/** Normalises a date string (DD-MM-YYYY, YYYY-MM-DD, ISO) to YYYY-MM-DD. */
export const formatDateToYMD = (dateStr: string): string => {
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

/** Normalises minutes played to "MM:SS" (max 130 minutes). */
export const formatMinutesPlayed = (val: string | number | undefined | null): string => {
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
export const getStatKeysForPosition = (isGK: boolean): string[] => {
  const slides = isGK
    ? [GK_SLIDE_1, OUTFIELD_SLIDES[0], OUTFIELD_SLIDES[1], GK_SLIDE_4]
    : OUTFIELD_SLIDES;
  return Array.from(new Set(slides.flat().map((item) => item.key)));
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Maps a saved game report (GET /players/me/game-reports/:reportId `data`) to
 * what the report preview / PDF renders. Only values stored on the report are
 * used — missing fields stay empty and render as N/A. The one exception is the
 * player photo, which reports don't store, so it comes from the player's profile.
 * Ratings are only included once the report is completed.
 */
export const mapSavedReportForPreview = (apiReport: any, profile: any = {}) => {
  const pInfo = apiReport?.playerInfo || {};
  const pObj = apiReport?.player || {};
  const dbOnly = (v: any) => (v === undefined || v === null ? "" : String(v).trim());
  const firstNonEmpty = (...vals: any[]) => vals.map(dbOnly).find(Boolean) || "";

  const evaluation = dbOnly(apiReport?.evaluationStatus).toUpperCase();
  const hasSavedStats = Boolean(apiReport?.stats && Object.keys(apiReport.stats).length > 0);
  const isCompleted = evaluation ? evaluation === "COMPLETED" : hasSavedStats;
  const rawRating = apiReport?.scoutRating ?? apiReport?.rating;
  const rating = isCompleted && typeof rawRating === "number" ? rawRating : undefined;
  const categoryRatings =
    isCompleted && apiReport?.categoryRatings && typeof apiReport.categoryRatings === "object"
      ? (apiReport.categoryRatings as Record<string, number>)
      : undefined;

  const minutesRaw = dbOnly(apiReport?.minutesPlayed ?? apiReport?.timePlayedMinutes);
  const dbDob = dbOnly(pInfo.dateOfBirth ?? apiReport?.dateOfBirth);
  const dbDate = dbOnly(apiReport?.gameDate ?? apiReport?.date);
  const chars = [pInfo.characteristics, apiReport?.characteristics].find((c) => Array.isArray(c) && c.length > 0);

  return {
    formData: {
      playerName: dbOnly(pInfo.playerName ?? apiReport?.playerName),
      dob: dbDob ? formatDateToYMD(dbDob) : "",
      clubName: dbOnly(pInfo.clubName ?? apiReport?.clubName),
      position: dbOnly(pInfo.position ?? apiReport?.position).toUpperCase(),
      foot: dbOnly(pInfo.foot ?? apiReport?.foot).toUpperCase(),
      weight: dbOnly(pInfo.weight ?? apiReport?.weight),
      height: dbOnly(pInfo.height ?? apiReport?.height),
      playerImage: firstNonEmpty(
        pObj.cardImage, pObj.profileImage, pObj.profileImg, pObj.avatar, apiReport?.playerAvatar,
        profile?.cardImage, profile?.cardPhoto, profile?.profileImage, profile?.profileImg
      ),
      matchesPlayed: dbOnly(apiReport?.matchesPlayed),
      minutesPlayed: minutesRaw ? formatMinutesPlayed(minutesRaw) : "",
      manOfTheMatch: dbOnly(apiReport?.manOfTheMatch),
      scoutName: dbOnly(apiReport?.scoutName),
      gameDate: dbDate ? formatDateToYMD(dbDate) : "",
      gameType: dbOnly(apiReport?.gameType ?? apiReport?.league).toUpperCase(),
      gameLocation: dbOnly(apiReport?.gameLocation).toUpperCase(),
      matchResult: dbOnly(apiReport?.matchResult),
      weather: dbOnly(apiReport?.weather).toUpperCase(),
      temperature: dbOnly(apiReport?.temperature),
      ownTeam: dbOnly(apiReport?.ownTeam ?? apiReport?.homeTeam),
      opponentTeam: dbOnly(apiReport?.opponentTeam ?? apiReport?.awayTeam),
      homeScore: typeof apiReport?.homeScore === "number" ? (apiReport.homeScore as number) : undefined,
      awayScore: typeof apiReport?.awayScore === "number" ? (apiReport.awayScore as number) : undefined,
      scoutRating: rating,
      rating,
      categoryRatings,
    },
    characteristics: Array.isArray(chars) ? chars.map((c: any) => String(c).toUpperCase()) : [],
    stats: hasSavedStats ? ({ ...apiReport.stats } as Record<string, number>) : {},
    goalMarkers: Array.isArray(apiReport?.accurateShots)
      ? apiReport.accurateShots.map((m: any) => ({ x: Number(m.x), y: Number(m.y) }))
      : [],
    pitchMarkers: Array.isArray(apiReport?.accurateAssists)
      ? apiReport.accurateAssists.map((a: any) => ({ x1: Number(a.fromX), y1: Number(a.fromY), x2: Number(a.toX), y2: Number(a.toY) }))
      : [],
    coachFeedback: firstNonEmpty(apiReport?.coachFeedback, apiReport?.scoutAnalysis),
  };
};

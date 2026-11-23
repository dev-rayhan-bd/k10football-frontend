import { GK_SLIDE_1, GK_SLIDE_4, OUTFIELD_SLIDES } from "./MatchStatisticsForm";

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

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getShortForm = (position: string): string => {
  if (!position) return "";
  const pos = position.trim();
  const clean = pos.toUpperCase();

  // 1. Direct standard acronyms
  const standardAcronyms = [
    "ST", "CF", "SS", "RW", "LW", "CAM", "CM", "CDM", "CB", "LB", "RB",
    "LWB", "RWB", "LM", "RM", "GK", "FWD", "MID", "DEF"
  ];
  if (standardAcronyms.includes(clean)) {
    return clean;
  }

  // 2. Extract content from parentheses if present, e.g. "Goalkeeper (GK)" or "Fixo (Defender / CB)"
  const parenMatch = pos.match(/\(([^)]+)\)[^()]*$/);
  if (parenMatch && parenMatch[1]) {
    const parts = parenMatch[1].split(/[\/,]/);
    const lastPart = parts[parts.length - 1].trim().toUpperCase();
    if (standardAcronyms.includes(lastPart)) {
      return lastPart;
    }
  }

  // 3. Normalized keyword checks
  if (clean.includes("ATTACKING MID") || clean.includes("CAM")) return "CAM";
  if (clean.includes("DEFENSIVE MID") || clean.includes("CDM")) return "CDM";
  if (clean.includes("CENTRAL MID") || clean.includes("CM")) return "CM";
  if (clean.includes("CENTER BACK") || clean.includes("CENTRE BACK") || clean.includes("CB")) return "CB";
  if (clean.includes("LEFT WING BACK") || clean.includes("LWB")) return "LWB";
  if (clean.includes("RIGHT WING BACK") || clean.includes("RWB")) return "RWB";
  if (clean.includes("LEFT BACK") || clean.includes("LB")) return "LB";
  if (clean.includes("RIGHT BACK") || clean.includes("RB")) return "RB";
  if (clean.includes("LEFT WINGER") || clean.includes("LW")) return "LW";
  if (clean.includes("RIGHT WINGER") || clean.includes("RW")) return "RW";
  if (clean.includes("LEFT MID") || clean.includes("LM")) return "LM";
  if (clean.includes("RIGHT MID") || clean.includes("RM")) return "RM";
  if (clean.includes("SECOND STRIKER") || clean.includes("SS")) return "SS";
  if (clean.includes("CENTER FORWARD") || clean.includes("CENTRE FORWARD") || clean.includes("CF")) return "CF";
  if (clean.includes("STRIKER") || clean.includes("ST")) return "ST";
  if (clean.includes("GOALKEEPER") || clean.includes("GK") || clean.includes("GOAL")) return "GK";
  if (clean.includes("FORWARD") || clean.includes("FWD")) return "FWD";
  if (clean.includes("DEFENDER") || clean.includes("DEF")) return "DEF";
  if (clean.includes("MIDFIELDER") || clean.includes("MID")) return "MID";
  if (clean.includes("PIVOT")) return "Pivot";
  if (clean.includes("FIXO")) return "Fixo";
  if (clean.includes("ALA")) return "Alas";

  return pos.slice(0, 4).toUpperCase();
};

export const getFullWithShortForm = (position: string): string => {
  if (!position) return "";
  const pos = position.trim();
  const short = getShortForm(pos);
  if (
    !short ||
    short === pos ||
    pos.includes(`(${short})`) ||
    new RegExp(`\\([^)]*\\b${short}\\b[^)]*\\)`, "i").test(pos)
  ) {
    return pos;
  }
  return `${pos} (${short})`;
};

export const getVeryShortPosition = (position: string): string => {
  if (!position) return "";
  const pos = position.trim();
  if (pos.includes("(") && pos.includes(")")) {
    const mainName = pos.split("(")[0].trim();
    const matches = pos.match(/\(([^)]+)\)[^()]*$/);
    if (matches && matches[1]) {
      const content = matches[1];
      if (content.includes("/")) {
        const parts = content.split("/");
        const shortForm = parts[parts.length - 1].trim();
        return `${mainName} (${shortForm})`;
      }
      return `${mainName} (${content})`;
    }
  }
  return pos;
};

export const formatDate = (val: string | number | Date | null | undefined): string => {
  if (!val) return "N/A";
  const strVal = String(val).trim();
  if (!strVal || strVal === "N/A" || strVal === "undefined" || strVal === "null") return "N/A";

  // If it's already a clean string like "June, 2026" or "June 2026"
  if (/^[A-Za-z]+,?\s*\d{4}$/.test(strVal)) {
    return strVal;
  }

  // Handle ISO format YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = strVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthIndex = parseInt(month, 10) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${parseInt(day, 10)} ${monthNames[monthIndex]} ${year}`;
    }
  }

  try {
    const d = new Date(strVal);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {
    // fallback
  }

  return strVal;
};

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getShortForm = (position: string): string => {
  if (!position) return "";
  const pos = position.trim();
  switch (pos) {
    case "Goalkeeper": return "GK";
    case "Center Back": return "CB";
    case "Right Back": return "RB";
    case "Left Back": return "LB";
    case "Midfielder": return "MID";
    case "Defender": return "DEF";
    case "Forward": return "FWD";
    case "Wing Back": return "LWB/RWB";
    case "Left Wing Back": return "LWB";
    case "Right Wing Back": return "RWB";
    case "Defensive Midfielder": return "CDM";
    case "Central Midfielder": return "CM";
    case "Attacking Midfielder": return "CAM";
    case "Left Midfielder": return "LM";
    case "Right Midfielder": return "RM";
    case "Striker": return "ST";
    case "Center Forward": return "CF";
    case "Second Striker": return "SS";
    case "Left Forward": return "LF";
    case "Right Forward": return "RF";
    case "Left Winger": return "LW";
    case "Right Winger": return "RW";
    // Futsal positions
    case "Fixo (Defender)": return "Fixo";
    case "Alas (Right Wing)": return "Alas (R)";
    case "Alas (Left Wing)": return "Alas (L)";
    case "Pivot (Forward)": return "Pivot";
    default:
      // Check if it already has a parenthesis with a short form
      if (pos.includes("(") && pos.includes(")")) {
        // Extract content inside last parentheses (e.g. "Fixo (Defender / CB)" -> "Defender / CB")
        const matches = pos.match(/\(([^)]+)\)[^()]*$/);
        if (matches && matches[1]) {
          const parts = matches[1].split("/");
          return parts[parts.length - 1].trim(); // Returns last part (e.g. "CB")
        }
      }
      return pos;
  }
};

export const getFullWithShortForm = (position: string): string => {
  if (!position) return "";
  const pos = position.trim();
  const short = getShortForm(pos);
  if (!short || short === pos || pos.includes(`(${short})`)) return pos;
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

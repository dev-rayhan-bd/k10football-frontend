/* eslint-disable @typescript-eslint/no-explicit-any */
import technicalIcon from "@/assets/cvs/id/player-styles-icons/technical.png";
import finesseShotIcon from "@/assets/cvs/id/player-styles-icons/finesse shot.png";
import incisivePassIcon from "@/assets/cvs/id/player-styles-icons/incisiver pass.png";
import longBallIcon from "@/assets/cvs/id/player-styles-icons/long ball specialist.png";
import speedsterIcon from "@/assets/cvs/id/player-styles-icons/speedster.png";
import powerHeaderIcon from "@/assets/cvs/id/player-styles-icons/power header.png";
import interceptorIcon from "@/assets/cvs/id/player-styles-icons/interceptor.png";
import blockIcon from "@/assets/cvs/id/player-styles-icons/block specialist.png";
import clinicalFinisherIcon from "@/assets/cvs/id/player-styles-icons/clinical finisher.png";
import dribblingIcon from "@/assets/cvs/id/player-styles-icons/dribbling wizard.png";
import setPieceIcon from "@/assets/cvs/id/player-styles-icons/set piece specialist.png";
import playmakerIcon from "@/assets/cvs/id/player-styles-icons/playmark.png";
import acrobaticIcon from "@/assets/cvs/id/player-styles-icons/acrobatic.png";
import deadballIcon from "@/assets/cvs/id/player-styles-icons/dead ball specialist.png";
import relentlessIcon from "@/assets/cvs/id/player-styles-icons/relentless.png";
import quickStepIcon from "@/assets/cvs/id/player-styles-icons/quick step.png";
import tricksterIcon from "@/assets/cvs/id/player-styles-icons/trickster.png";
import whippedCrossIcon from "@/assets/cvs/id/player-styles-icons/whipped cross.png";

export const STYLE_ICONS: Record<string, any> = {
  "technical": technicalIcon,
  "finesse-shot": finesseShotIcon,
  "incisive-pass": incisivePassIcon,
  "long-ball": longBallIcon,
  "speedster": speedsterIcon,
  "power-header": powerHeaderIcon,
  "interceptor": interceptorIcon,
  "block": blockIcon,
  "clinical-finisher": clinicalFinisherIcon,
  "dribbling": dribblingIcon,
  "set-piece": setPieceIcon,
  "playmaker": playmakerIcon,
  "acrobatic": acrobaticIcon,
  "deadball": deadballIcon,
  "relentless": relentlessIcon,
  "quick-step": quickStepIcon,
  "trickster": tricksterIcon,
  "whipped-cross": whippedCrossIcon,
};

export const STRENGTH_KEYS = [
  { key: "pace", label: "PACE" },
  { key: "shooting", label: "SHOOTING" },
  { key: "passing", label: "PASSING" },
  { key: "dribbling", label: "DRIBBLING" },
  { key: "defending", label: "DEFENDING" },
  { key: "physical", label: "PHYSICAL" },
  { key: "heading", label: "HEADING" },
];

export const ALL_STYLES = [
  { id: "technical", label: "Technical" },
  { id: "finesse-shot", label: "Finesse Shot" },
  { id: "incisive-pass", label: "Incisive Pass" },
  { id: "long-ball", label: "Long Ball Specialist" },
  { id: "speedster", label: "Speedster" },
  { id: "power-header", label: "Power Header" },
  { id: "interceptor", label: "Interceptor" },
  { id: "block", label: "Block Specialist" },
  { id: "clinical-finisher", label: "Clinical Finisher" },
  { id: "dribbling", label: "Dribbling Wizard" },
  { id: "set-piece", label: "Set Piece Specialist" },
  { id: "playmaker", label: "Playmaker" },
  { id: "acrobatic", label: "Acrobatic" },
  { id: "deadball", label: "Dead Ball Specialist" },
  { id: "relentless", label: "Relentless" },
  { id: "quick-step", label: "Quick Step" },
  { id: "trickster", label: "Trickster" },
  { id: "whipped-cross", label: "Whipped Cross" },
];

const normalizeStyle = (s: unknown) => String(s ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");

/**
 * Accepts a style id ("finesse-shot") or the backend enum label ("Finesse Shot")
 * and returns the frontend id, or "" if unknown.
 */
export const toStyleId = (style: unknown): string => {
  const n = normalizeStyle(style);
  const match = ALL_STYLES.find((s) => s.id === n || normalizeStyle(s.label) === n);
  return match?.id ?? "";
};

/** Frontend id → backend PLAYER_STYLES enum label (e.g. "finesse-shot" → "Finesse Shot"). */
export const toStyleLabel = (style: unknown): string => {
  const id = toStyleId(style);
  return ALL_STYLES.find((s) => s.id === id)?.label ?? "";
};

/** Backend `playerStyles` → unique frontend ids. */
export const stylesFromApi = (styles: unknown): string[] =>
  Array.isArray(styles) ? Array.from(new Set(styles.map(toStyleId).filter(Boolean))) : [];

/** Frontend ids → backend `playerStyles` (enum labels only). */
export const stylesToApi = (styles: unknown): string[] =>
  (Array.isArray(styles) ? styles : [styles]).map(toStyleLabel).filter(Boolean);

export const COUNTRY_CODES: Record<string, string> = {
  "afghanistan": "af", "albania": "al", "algeria": "dz", "andorra": "ad", "angola": "ao",
  "antigua and barbuda": "ag", "argentina": "ar", "armenia": "am", "australia": "au",
  "austria": "at", "azerbaijan": "az", "bahamas": "bs", "bahrain": "bh", "bangladesh": "bd",
  "barbados": "bb", "belarus": "by", "belgium": "be", "belize": "bz", "benin": "bj",
  "bhutan": "bt", "bolivia": "bo", "bosnia and herzegovina": "ba", "botswana": "bw",
  "brazil": "br", "brunei": "bn", "bulgaria": "bg", "burkina faso": "bf", "burundi": "bi",
  "cambodia": "kh", "cameroon": "cm", "canada": "ca", "cape verde": "cv",
  "central african republic": "cf", "chad": "td", "chile": "cl", "china": "cn",
  "colombia": "co", "comoros": "km", "congo": "cg", "costa rica": "cr", "croatia": "hr",
  "cuba": "cu", "cyprus": "cy", "czech republic": "cz", "denmark": "dk", "djibouti": "dj",
  "dominica": "dm", "dominican republic": "do", "ecuador": "ec", "egypt": "eg",
  "el salvador": "sv", "equatorial guinea": "gq", "eritrea": "er", "estonia": "ee",
  "ethiopia": "et", "fiji": "fj", "finland": "fi", "france": "fr", "gabon": "ga",
  "gambia": "gm", "georgia": "ge", "germany": "de", "ghana": "gh", "greece": "gr",
  "grenada": "gd", "guatemala": "gt", "guinea": "gn", "guinea-bissau": "gw",
  "guyana": "gy", "haiti": "ht", "honduras": "hn", "hungary": "hu", "iceland": "is",
  "india": "in", "indonesia": "id", "iran": "ir", "iraq": "iq", "ireland": "ie",
  "israel": "il", "italy": "it", "jamaica": "jm", "japan": "jp", "jordan": "jo",
  "kazakhstan": "kz", "kenya": "ke", "kiribati": "ki", "korea, north": "kp",
  "korea, south": "kr", "kuwait": "kw", "kyrgyzstan": "kg", "laos": "la", "latvia": "lv",
  "lebanon": "lb", "lesotho": "ls", "liberia": "lr", "libya": "ly", "liechtenstein": "li",
  "lithuania": "lt", "luxembourg": "lu", "macedonia": "mk", "madagascar": "mg",
  "malawi": "mw", "malaysia": "my", "maldives": "mv", "mali": "ml", "malta": "mt",
  "marshall islands": "mh", "mauritania": "mr", "mauritius": "mu", "mexico": "mx",
  "micronesia": "fm", "moldova": "md", "monaco": "mc", "mongolia": "mn", "montenegro": "me",
  "morocco": "ma", "mozambique": "mz", "myanmar": "mm", "namibia": "na", "nauru": "nr",
  "nepal": "np", "netherlands": "nl", "new zealand": "nz", "nicaragua": "ni",
  "niger": "ne", "nigeria": "ng", "norway": "no", "oman": "om", "pakistan": "pk",
  "palau": "pw", "panama": "pa", "papua new guinea": "pg", "paraguay": "py", "peru": "pe",
  "philippines": "ph", "poland": "pl", "portugal": "pt", "qatar": "qa", "romania": "ro",
  "russia": "ru", "rwanda": "rw", "saint kitts and nevis": "kn", "saint lucia": "lc",
  "saint vincent and the grenadines": "vc", "samoa": "ws", "san marino": "sm",
  "sao tome and principe": "st", "saudi arabia": "sa", "senegal": "sn", "serbia": "rs",
  "seychelles": "sc", "sierra leone": "sl", "singapore": "sg", "slovakia": "sk",
  "slovenia": "si", "solomon islands": "sb", "somalia": "so", "south africa": "za",
  "spain": "es", "sri lanka": "lk", "sudan": "sd", "suriname": "sr", "swaziland": "sz",
  "sweden": "se", "switzerland": "ch", "syria": "sy", "taiwan": "tw", "tajikistan": "tj",
  "tanzania": "tz", "thailand": "th", "timor-leste": "tl", "togo": "tg", "tonga": "to",
  "trinidad and tobago": "tt", "tunisia": "tn", "turkey": "tr", "turkmenistan": "tm",
  "tuvalu": "tv", "uganda": "ug", "ukraine": "ua", "united arab emirates": "ae",
  "united kingdom": "gb", "united states": "us", "uruguay": "uy", "uzbekistan": "uz",
  "vanuatu": "vu", "vatican city": "va", "venezuela": "ve", "vietnam": "vn", "yemen": "ye",
  "zambia": "zm", "zimbabwe": "zw"
};

export const ALL_COUNTRIES = Object.keys(COUNTRY_CODES).map(c =>
  c.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
).sort();

export const getFlagUrl = (countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  if (!code) return "";
  return `https://flagcdn.com/w160/${code}.png`;
};

export const calculateAge = (dobString: string) => {
  if (!dobString) return "";
  let birthDate: Date;
  if (dobString.includes("/")) {
    const [day, month, year] = dobString.split("/");
    birthDate = new Date(`${year}-${month}-${day}`);
  } else {
    birthDate = new Date(dobString);
  }
  if (isNaN(birthDate.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getIndicatorColor = (val: number) => {
  if (val >= 80) return "bg-green-500";
  if (val >= 60) return "bg-yellow-500";
  return "bg-red-500";
};

export const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};

const _getMarkersForPosition = (position: string, isFutsal: boolean) => {
  const pos = position?.trim() || "";
  const cleanPos = pos.toLowerCase();
  if (isFutsal) {
    if (cleanPos.includes("goalkeeper") || cleanPos.includes("gk")) {
      return [
        { id: "gk-1", name: "Goalkeeper", x: 50, y: 90 },
        { id: "gk-2", name: "Sweeper Keeper", x: 50, y: 80 },
        { id: "gk-3", name: "Shot Stopper", x: 42, y: 88 }
      ];
    }
    if (cleanPos.includes("fixo")) {
      return [
        { id: "fixo-1", name: "Fixo (Defender)", x: 50, y: 75 },
        { id: "fixo-2", name: "Center Back", x: 50, y: 82 },
        { id: "fixo-3", name: "Defensive Midfielder", x: 50, y: 62 }
      ];
    }
    if (cleanPos.includes("alas") && (cleanPos.includes("right") || cleanPos.includes("rw") || cleanPos.includes("(r)"))) {
      return [
        { id: "alasr-1", name: "Alas (Right Wing)", x: 80, y: 45 },
        { id: "alasr-2", name: "Right Winger", x: 82, y: 25 },
        { id: "alasr-3", name: "Right Midfielder", x: 75, y: 58 }
      ];
    }
    if (cleanPos.includes("alas") && (cleanPos.includes("left") || cleanPos.includes("lw") || cleanPos.includes("(l)"))) {
      return [
        { id: "alasl-1", name: "Alas (Left Wing)", x: 20, y: 45 },
        { id: "alasl-2", name: "Left Winger", x: 18, y: 25 },
        { id: "alasl-3", name: "Left Midfielder", x: 25, y: 58 }
      ];
    }
    if (cleanPos.includes("pivot")) {
      return [
        { id: "pivot-1", name: "Pivot (Forward)", x: 50, y: 20 },
        { id: "pivot-2", name: "Striker", x: 50, y: 12 },
        { id: "pivot-3", name: "Center Forward", x: 50, y: 32 }
      ];
    }
    return [
      { id: "f-1", name: pos || "Futsal Player", x: 50, y: 50 },
      { id: "f-2", name: "Fixo", x: 50, y: 75 },
      { id: "f-3", name: "Pivot", x: 50, y: 25 }
    ];
  } else {
    const basePos = pos.split("(")[0].trim();
    switch (basePos) {
      case "Goalkeeper":
        return [
          { id: "gk-1", name: "Goalkeeper", x: 50, y: 92 },
          { id: "gk-2", name: "Sweeper Keeper", x: 50, y: 82 },
          { id: "gk-3", name: "Shot Stopper", x: 42, y: 90 }
        ];
      case "Center Back":
        return [
          { id: "cb-1", name: "Center Back", x: 50, y: 78 },
          { id: "cb-2", name: "Sweeper", x: 50, y: 88 },
          { id: "cb-3", name: "Defensive Midfielder", x: 50, y: 62 }
        ];
      case "Right Back":
        return [
          { id: "rb-1", name: "Right Back", x: 80, y: 78 },
          { id: "rb-2", name: "Right Wing-Back", x: 85, y: 65 },
          { id: "rb-3", name: "Center Back", x: 50, y: 78 }
        ];
      case "Left Back":
        return [
          { id: "lb-1", name: "Left Back", x: 20, y: 78 },
          { id: "lb-2", name: "Left Wing-Back", x: 15, y: 65 },
          { id: "lb-3", name: "Center Back", x: 50, y: 78 }
        ];
      case "Wing Back":
      case "Left Wing Back":
      case "Right Wing Back":
        return [
          { id: "wb-1", name: basePos, x: 82, y: 65 },
          { id: "wb-2", name: "Full-Back", x: 80, y: 78 },
          { id: "wb-3", name: "Side Midfielder", x: 80, y: 50 }
        ];
      case "Defensive Midfielder":
        return [
          { id: "dm-1", name: "Defensive Midfielder", x: 50, y: 62 },
          { id: "dm-2", name: "Central Midfielder", x: 50, y: 50 },
          { id: "dm-3", name: "Center Back", x: 50, y: 78 }
        ];
      case "Central Midfielder":
        return [
          { id: "cm-1", name: "Central Midfielder", x: 50, y: 50 },
          { id: "cm-2", name: "Attacking Midfielder", x: 50, y: 35 },
          { id: "cm-3", name: "Defensive Midfielder", x: 50, y: 62 }
        ];
      case "Attacking Midfielder":
        return [
          { id: "am-1", name: "Attacking Midfielder", x: 50, y: 35 },
          { id: "am-2", name: "Central Midfielder", x: 50, y: 50 },
          { id: "am-3", name: "Second Striker", x: 50, y: 25 }
        ];
      case "Left Midfielder":
        return [
          { id: "lm-1", name: "Left Midfielder", x: 20, y: 50 },
          { id: "lm-2", name: "Left Winger", x: 18, y: 25 },
          { id: "lm-3", name: "Central Midfielder", x: 50, y: 50 }
        ];
      case "Right Midfielder":
        return [
          { id: "rm-1", name: "Right Midfielder", x: 80, y: 50 },
          { id: "rm-2", name: "Right Winger", x: 82, y: 25 },
          { id: "rm-3", name: "Central Midfielder", x: 50, y: 50 }
        ];
      case "Striker":
        return [
          { id: "st-1", name: "Striker", x: 50, y: 15 },
          { id: "st-2", name: "Center Forward", x: 50, y: 25 },
          { id: "st-3", name: "Second Striker", x: 50, y: 32 }
        ];
      case "Center Forward":
        return [
          { id: "cf-1", name: "Center Forward", x: 50, y: 25 },
          { id: "cf-2", name: "Striker", x: 50, y: 15 },
          { id: "cf-3", name: "Attacking Midfielder", x: 50, y: 38 }
        ];
      case "Second Striker":
      case "Left Forward":
      case "Right Forward":
        return [
          { id: "ss-1", name: basePos, x: 50, y: 28 },
          { id: "ss-2", name: "Center Forward", x: 50, y: 20 },
          { id: "ss-3", name: "Attacking Midfielder", x: 50, y: 38 }
        ];
      case "Left Winger":
        return [
          { id: "lw-1", name: "Left Winger", x: 18, y: 25 },
          { id: "lw-2", name: "Left Midfielder", x: 20, y: 50 },
          { id: "lw-3", name: "Forward", x: 50, y: 20 }
        ];
      case "Right Winger":
        return [
          { id: "rw-1", name: "Right Winger", x: 82, y: 25 },
          { id: "rw-2", name: "Right Midfielder", x: 80, y: 50 },
          { id: "rw-3", name: "Forward", x: 50, y: 20 }
        ];
      default:
        return [
          { id: "def-1", name: basePos || "Player", x: 50, y: 50 },
          { id: "def-2", name: "Central Defender", x: 50, y: 75 },
          { id: "def-3", name: "Central Midfielder", x: 50, y: 50 }
        ];
    }
  }
};

export const getMarkersForPosition = (position: string, isFutsal: boolean) => {
  const markers = _getMarkersForPosition(position, isFutsal);
  return markers.map((m, idx) => ({
    ...m,
    name: `position${idx + 1}`
  }));
};

/* ------------------------------------------------------------------ */
/* Pitch map: 6 markers — 3 attacking + 3 defending                    */
/* ------------------------------------------------------------------ */

export type PitchPhase = "attacking" | "defending";

export interface PitchMarker {
  id: string;
  phase: PitchPhase;
  /** 1–3 within its phase */
  index: number;
  x: number;
  y: number;
}

export const PITCH_MARKERS_PER_PHASE = 3;

/** "Attacking 1" … "Defending 3" — stored in the backend `slot` field. */
export const pitchSlotLabel = (phase: PitchPhase, index: number) =>
  `${phase === "attacking" ? "Attacking" : "Defending"} ${index}`;

const clampPct = (n: number) => Math.max(6, Math.min(94, n));

/**
 * Default layout around the player's natural lateral position: three
 * markers in the attacking half (top of the pitch image) and three in the
 * defending half (bottom).
 */
const defaultPitchMarkers = (position: string, isFutsal: boolean): PitchMarker[] => {
  const baseX = _getMarkersForPosition(position, isFutsal)[0]?.x ?? 50;
  const x = Math.max(22, Math.min(78, baseX));
  const make = (phase: PitchPhase, index: number, px: number, py: number): PitchMarker => ({
    id: `${phase}-${index}`,
    phase,
    index,
    x: clampPct(px),
    y: clampPct(py),
  });
  return [
    make("attacking", 1, x, 18),
    make("attacking", 2, x - 16, 30),
    make("attacking", 3, x + 16, 30),
    make("defending", 1, x, 82),
    make("defending", 2, x - 16, 70),
    make("defending", 3, x + 16, 70),
  ];
};

/** Reads the phase/index from a saved marker's `slot` / `role` (e.g. "Attacking 2"). */
const parseSavedPhase = (m: any): { phase?: PitchPhase; index?: number } => {
  const text = `${m?.slot ?? ""} ${m?.role ?? ""}`.toLowerCase();
  const phase: PitchPhase | undefined = text.includes("attack")
    ? "attacking"
    : text.includes("defen")
      ? "defending"
      : undefined;
  const num = Number(String(m?.slot ?? "").match(/(\d+)/)?.[1]);
  return { phase, index: num >= 1 && num <= PITCH_MARKERS_PER_PHASE ? num : undefined };
};

/**
 * Always returns exactly 6 markers (3 attacking + 3 defending). Saved markers
 * keep their coordinates; legacy markers without a phase are placed by pitch
 * half (top = attacking); any missing slot gets a default spot.
 */
export const buildPitchMarkers = (saved: any[] | undefined, position: string, isFutsal: boolean): PitchMarker[] => {
  const result = defaultPitchMarkers(position, isFutsal);
  const filled = new Set<string>();
  const place = (phase: PitchPhase, index: number | undefined, m: any) => {
    const target =
      (index && !filled.has(`${phase}-${index}`) && result.find((r) => r.phase === phase && r.index === index)) ||
      result.find((r) => r.phase === phase && !filled.has(r.id));
    if (!target) return;
    target.x = clampPct(Number(m.x));
    target.y = clampPct(Number(m.y));
    filled.add(target.id);
  };

  const valid = (Array.isArray(saved) ? saved : []).filter(
    (m) => m && Number.isFinite(Number(m.x)) && Number.isFinite(Number(m.y))
  );
  // Markers with an explicit phase first, then legacy ones by pitch half.
  valid.forEach((m) => {
    const { phase, index } = parseSavedPhase(m);
    if (phase) place(phase, index, m);
  });
  valid.forEach((m) => {
    if (parseSavedPhase(m).phase) return;
    place(Number(m.y) < 50 ? "attacking" : "defending", undefined, m);
  });
  return result;
};

/** Backend payload for positionMap / futsalMap. */
export const toPitchMapPayload = (markers: PitchMarker[], playerPosition: string) =>
  markers.map((m) => ({
    slot: pitchSlotLabel(m.phase, m.index),
    position: playerPosition || "",
    role: m.phase === "attacking" ? "Attacking" : "Defending",
    x: Math.round(m.x),
    y: Math.round(m.y),
  }));

import type {
  ExtraEventOption,
  IAcademyEventListItem,
  IEventBracket,
  IEventFixture,
  IRegisteredClub,
  IStandingRow,
} from "@/types/extraEvent.type";
import { CLUB_PRESET_LOGOS } from "@/components/user-wise-dashboard/academy-management/extra-events/extra-events.constants";

// Defensive parsing helpers for Extra Events. Response shapes for fixtures / standings / bracket /
// allocations are not fully fixed, so everything here tolerates several field spellings.

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : typeof v === "number" ? String(v) : undefined;
const num = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return undefined;
};

// ───────── Meta options ─────────
export const optionValue = (o: ExtraEventOption) => (typeof o === "string" ? o : o.value);
export const optionLabel = (o: ExtraEventOption) => (typeof o === "string" ? o : o.label || o.value);
export const toOptions = (list: unknown, fallback: string[] = []): { value: string; label: string }[] => {
  const arr = Array.isArray(list) && list.length ? list : fallback;
  return arr
    .map((o) => {
      if (typeof o === "string") return { value: o, label: o };
      if (isObj(o)) {
        const value = str(o.value) ?? str(o._id) ?? str(o.key);
        const label = str(o.label) ?? str(o.name) ?? str(o.teamName) ?? value;
        return value ? { value, label: label || value } : null;
      }
      return null;
    })
    .filter((o): o is { value: string; label: string } => !!o);
};

export const humanize = (s?: string | null) =>
  (s || "").replace(/_/g, " ").replace(/\s+/g, " ").trim();

// ───────── Event helpers ─────────
export const isClubEvent = (e?: Partial<IAcademyEventListItem> | null) =>
  !!e &&
  (e.registrationMode === "CLUB" || e.isTournament === true || /tournament/i.test(String(e.eventType || "")));

export const getStatusLabel = (e: Partial<IAcademyEventListItem> & { statusBadge?: unknown }) => {
  const badge = e.statusBadge as unknown;
  if (isObj(badge) && str(badge.label)) return String(badge.label);
  return str(badge) || e.status || "OPEN";
};

export const statusTone = (label: string) => {
  const s = label.toUpperCase();
  if (s.includes("COMPLETED")) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (s.includes("CLOSED")) return "bg-white/5 text-white/40 border-white/10";
  if (s.includes("CLOSING")) return "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20";
  if (s.includes("OPEN")) return "bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20";
  return "bg-white/10 text-white/50 border-white/10";
};

export const paymentTone = (status?: string) => {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20";
  if (s === "FREE") return "bg-[#0077FF]/10 text-[#4DA3FF] border-[#0077FF]/20";
  if (s === "PENDING") return "bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/20";
  return "bg-white/10 text-white/50 border-white/10";
};

export const formatDate = (value?: string | null, withYear = true) => {
  if (!value) return "TBA";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const toDateInput = (value?: string | null) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

export const formatMoney = (amount?: number | null, currency?: string) => {
  if (amount === undefined || amount === null) return "—";
  const c = currency || "$";
  return /^[A-Z]{3}$/.test(c) ? `${amount} ${c}` : `${c}${amount}`;
};

// ───────── Clubs ─────────
export const clubIdOf = (c: unknown): string => {
  if (typeof c === "string") return c;
  if (!isObj(c)) return "";
  return str(c._id) ?? str(c.clubId) ?? str(c.id) ?? (isObj(c.club) ? clubIdOf(c.club) : "") ?? "";
};

export const clubNameOf = (c: unknown): string => {
  if (typeof c === "string") return c;
  if (!isObj(c)) return "";
  return (
    str(c.clubName) ??
    str(c.teamName) ??
    str(c.name) ??
    (isObj(c.club) ? clubNameOf(c.club) : undefined) ??
    ""
  );
};

/** Logo URL or a preset SVG string for a club-like object. */
export const clubLogoOf = (c: unknown): { url?: string; svg?: string } => {
  if (!isObj(c)) return {};
  const url = str(c.logo) ?? str(c.logoUrl) ?? str(c.badgeUrl);
  if (url && /^(https?:|data:|\/)/.test(url)) return { url };
  const preset = str(c.badgePreset) ?? str(c.logoId) ?? url;
  const found = preset ? CLUB_PRESET_LOGOS.find((l) => l.id === preset) : undefined;
  if (found) return { svg: found.svg };
  if (isObj(c.club)) return clubLogoOf(c.club);
  return {};
};

export const normalizeGroup = (g: unknown): "GROUP A" | "GROUP B" | "" => {
  const s = String(g || "").toUpperCase().replace(/[_-]/g, " ").trim();
  if (s === "A" || s === "GROUP A" || s === "GROUPA") return "GROUP A";
  if (s === "B" || s === "GROUP B" || s === "GROUPB") return "GROUP B";
  return "";
};

export interface AllocationClub {
  id: string;
  name: string;
  paymentStatus?: string;
  group: "GROUP A" | "GROUP B" | "";
  raw: IRegisteredClub | Obj;
}

/** Merge registered clubs + GET allocate-groups payload into one list with a current group. */
export const buildAllocationClubs = (clubs: IRegisteredClub[], allocation: unknown): AllocationClub[] => {
  const map = new Map<string, AllocationClub>();
  const put = (c: unknown, group?: unknown) => {
    const id = clubIdOf(c);
    if (!id) return;
    const prev = map.get(id);
    const o = (isObj(c) ? c : {}) as Obj;
    const g = normalizeGroup(group ?? o.group ?? o.groupName) || prev?.group || "";
    map.set(id, {
      id,
      name: clubNameOf(c) || prev?.name || "Unnamed club",
      paymentStatus: str(o.paymentStatus) ?? prev?.paymentStatus,
      group: g,
      raw: prev?.raw ?? o,
    });
  };
  clubs.forEach((c) => put(c));
  if (isObj(allocation)) {
    const a = allocation as Obj;
    (Array.isArray(a.clubs) ? a.clubs : []).forEach((c) => put(c));
    (Array.isArray(a.unallocated) ? a.unallocated : []).forEach((c) => put(c));
    (Array.isArray(a.groupA) ? a.groupA : []).forEach((c) => put(c, "GROUP A"));
    (Array.isArray(a.groupB) ? a.groupB : []).forEach((c) => put(c, "GROUP B"));
    (Array.isArray(a.allocations) ? a.allocations : []).forEach((c) => put(c, isObj(c) ? c.group : undefined));
  } else if (Array.isArray(allocation)) {
    allocation.forEach((c) => put(c));
  }
  return Array.from(map.values());
};

// ───────── Fixtures ─────────
export interface ParsedFixture {
  id: string;
  stage: string;
  group: string;
  home: string;
  away: string;
  homeLogo: { url?: string; svg?: string };
  awayLogo: { url?: string; svg?: string };
  homeScore: number | null;
  awayScore: number | null;
  kickoffTime: string;
  matchDate: string;
  pitch: string;
  status: string;
  winner: string;
}

const teamOf = (f: Obj, side: "home" | "away") => {
  const n = side === "home" ? "1" : "2";
  const candidates = [
    f[`${side}Team`],
    f[`${side}ClubId`],
    f[`${side}Club`],
    f[`${side}`],
    f[`team${n}`],
    f[`club${n}`],
  ];
  const nameField = str(f[`${side}TeamName`]) ?? str(f[`${side}ClubName`]) ?? str(f[`team${n}Name`]);
  for (const c of candidates) {
    const name = typeof c === "string" ? (/^[a-f0-9]{24}$/i.test(c) ? "" : c) : clubNameOf(c);
    if (name) return { name: nameField ?? name, logo: clubLogoOf(c) };
  }
  return { name: nameField ?? "TBD", logo: {} };
};

export const parseFixture = (raw: IEventFixture | Obj): ParsedFixture => {
  const f = raw as Obj;
  const home = teamOf(f, "home");
  const away = teamOf(f, "away");
  const winnerRaw = f.winner ?? f.winnerName ?? f.winnerId;
  const winner =
    typeof winnerRaw === "string"
      ? winnerRaw === clubIdOf(f.homeClubId ?? f.homeTeam)
        ? home.name
        : winnerRaw === clubIdOf(f.awayClubId ?? f.awayTeam)
        ? away.name
        : /^[a-f0-9]{24}$/i.test(winnerRaw)
        ? ""
        : winnerRaw
      : clubNameOf(winnerRaw);
  return {
    id: str(f._id) ?? str(f.matchId) ?? str(f.id) ?? "",
    stage: str(f.stage) ?? str(f.round) ?? "",
    group: normalizeGroup(f.group) || str(f.group) || "",
    home: home.name,
    away: away.name,
    homeLogo: home.logo,
    awayLogo: away.logo,
    homeScore: num(f.homeScore) ?? num(f.score1) ?? null,
    awayScore: num(f.awayScore) ?? num(f.score2) ?? null,
    kickoffTime: str(f.kickoffTime) ?? str(f.time) ?? "",
    matchDate: str(f.matchDate) ?? str(f.date) ?? "",
    pitch: str(f.pitch) ?? "",
    status: (str(f.status) ?? "SCHEDULED").toUpperCase(),
    winner,
  };
};

export const stageLabel = (stage: string) => {
  const s = stage.toUpperCase();
  if (s.includes("SEMI")) return "Semifinal";
  if (s.includes("FINAL")) return "Grand Final";
  if (s.includes("GROUP")) return "Group Stage";
  return humanize(stage) || "Match";
};

// ───────── Standings ─────────
export interface ParsedStanding {
  id: string;
  name: string;
  logo: { url?: string; svg?: string };
  p: number;
  w: number;
  d: number;
  l: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export const parseStandingRow = (raw: IStandingRow | Obj): ParsedStanding => {
  const r = raw as Obj;
  const gf = num(r.goalsFor) ?? num(r.gf) ?? num(r.GF) ?? 0;
  const ga = num(r.goalsAgainst) ?? num(r.ga) ?? num(r.GA) ?? 0;
  return {
    id: clubIdOf(r.clubId ?? r) || clubNameOf(r),
    name: clubNameOf(r) || (isObj(r.clubId) ? clubNameOf(r.clubId) : "") || "Unknown",
    logo: clubLogoOf(isObj(r.clubId) ? { ...r.clubId, ...r } : r),
    p: num(r.played) ?? num(r.p) ?? num(r.P) ?? 0,
    w: num(r.won) ?? num(r.wins) ?? num(r.w) ?? num(r.W) ?? 0,
    d: num(r.drawn) ?? num(r.draws) ?? num(r.d) ?? num(r.D) ?? 0,
    l: num(r.lost) ?? num(r.losses) ?? num(r.l) ?? num(r.L) ?? 0,
    gf,
    ga,
    gd: num(r.goalDifference) ?? num(r.gd) ?? num(r.GD) ?? gf - ga,
    pts: num(r.points) ?? num(r.pts) ?? num(r.PTS) ?? 0,
  };
};

export const getStandingGroups = (standings: unknown): { label: string; rows: ParsedStanding[] }[] => {
  if (!isObj(standings)) return [];
  const s = standings as Obj;
  const pick = (...keys: string[]) => {
    for (const k of keys) if (Array.isArray(s[k])) return s[k] as Obj[];
    return null;
  };
  const a = pick("groupA", "GROUP A", "A", "group_a");
  const b = pick("groupB", "GROUP B", "B", "group_b");
  const out: { label: string; rows: ParsedStanding[] }[] = [];
  if (a) out.push({ label: "Group A", rows: a.map(parseStandingRow) });
  if (b) out.push({ label: "Group B", rows: b.map(parseStandingRow) });
  return out;
};

// ───────── Bracket ─────────
export interface ParsedBracket {
  semis: ParsedFixture[];
  final: ParsedFixture | null;
  champion: string;
}

const asMatchList = (v: unknown): Obj[] =>
  Array.isArray(v) ? (v.filter(isObj) as Obj[]) : isObj(v) ? [v] : [];

export const parseBracket = (bracket: IEventBracket | undefined, fixtures: ParsedFixture[]): ParsedBracket => {
  let semis: ParsedFixture[] = [];
  let final: ParsedFixture | null = null;
  let champion = "";

  if (Array.isArray(bracket)) {
    const parsed = (bracket.filter(isObj) as Obj[]).map(parseFixture);
    semis = parsed.filter((m) => /SEMI/i.test(m.stage));
    final = parsed.find((m) => /FINAL/i.test(m.stage) && !/SEMI/i.test(m.stage)) ?? null;
  } else if (isObj(bracket)) {
    const b = bracket as Obj;
    const semiRaw = b.semifinals ?? b.semiFinals ?? b.semis ?? b.SEMIFINALS ?? b.semiFinal;
    const finalRaw = b.final ?? b.grandFinal ?? b.GRAND_FINAL ?? b.finals;
    semis = asMatchList(semiRaw).map(parseFixture);
    final = asMatchList(finalRaw).map(parseFixture)[0] ?? null;
    champion = clubNameOf(b.champion) || clubNameOf(b.winner) || str(b.championName) || "";
  }

  if (!semis.length) semis = fixtures.filter((m) => /SEMI/i.test(m.stage));
  if (!final) final = fixtures.find((m) => /FINAL/i.test(m.stage) && !/SEMI/i.test(m.stage)) ?? null;
  if (!champion && final && final.status === "COMPLETED") {
    champion =
      final.winner ||
      (final.homeScore !== null && final.awayScore !== null && final.homeScore !== final.awayScore
        ? final.homeScore > final.awayScore
          ? final.home
          : final.away
        : "");
  }
  return { semis, final, champion };
};

export const TOURNAMENT_STAGES = ["REGISTRATION", "GROUP_STAGE", "SEMIFINALS", "GRAND_FINAL", "COMPLETED"] as const;

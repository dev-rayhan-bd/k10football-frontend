// Defensive normalizers for the public tournament view (GET /extra-events/:id/public-portal & /fixtures).
// The backend may send team refs as plain names, ObjectId strings or populated club objects, scores as
// null before kickoff, and the bracket as either an object ({ semifinals, final, champion }) or an array.
import type { IBadgePreset, IEventFixture, IEventStandings } from "@/types/extraEvent.type";
import { CLUB_PRESET_LOGOS } from "@/components/user-wise-dashboard/academy-management/extra-events/extra-events.constants";

type Rec = Record<string, unknown>;

export type StageKind = "group" | "semi" | "final" | "other";

export interface TournamentTeam {
  id?: string;
  name: string;
  logo?: string;
  badgePreset?: string;
  /** True when no real team is known yet (placeholder like "Winner Group A" or "TBD"). */
  isTbd: boolean;
}

export interface TournamentMatch {
  key: string;
  kind: StageKind;
  stageLabel: string;
  group?: string;
  home: TournamentTeam;
  away: TournamentTeam;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  isLive: boolean;
  isCompleted: boolean;
  kickoff?: string;
  date?: string;
  pitch?: string;
  winner: "home" | "away" | null;
}

export interface TournamentStandingRow {
  key: string;
  team: TournamentTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  qualified?: boolean;
}

export interface TournamentBracket {
  semis: TournamentMatch[];
  final: TournamentMatch | null;
  champion: TournamentTeam | null;
}

export type TeamLookup = Map<string, Omit<TournamentTeam, "isTbd">>;

// ───────── primitives ─────────
const isRec = (v: unknown): v is Rec => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
};
const isObjectId = (v: string) => /^[a-f\d]{24}$/i.test(v);
const idOf = (v: unknown): string | undefined =>
  str(v) ?? (isRec(v) ? str(v._id) ?? str(v.id) : undefined);

export const humanize = (value?: string) =>
  (value || "")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

export const TOURNAMENT_STAGE_LABELS: Record<string, string> = {
  REGISTRATION: "Registration",
  GROUP_STAGE: "Group Stage",
  SEMIFINALS: "Semi-finals",
  GRAND_FINAL: "Grand Final",
  COMPLETED: "Completed",
};

export const stageLabel = (status?: string) =>
  status ? TOURNAMENT_STAGE_LABELS[status.toUpperCase()] ?? humanize(status) : "—";

/** "GROUP A" / "Group A" / "A" / "groupA" → "Group A". */
export const groupLabel = (value?: string | null) => {
  const s = str(value);
  if (!s) return undefined;
  const m = s.match(/^(?:group)?[\s_-]*([a-z0-9])$/i);
  return m ? `Group ${m[1].toUpperCase()}` : humanize(s);
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

export const formatDate = (value?: string | null) => {
  const s = str(value);
  if (!s) return undefined;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

/** Kickoff may be "14:30" or an ISO datetime. */
export const formatKickoff = (value?: string | null) => {
  const s = str(value);
  if (!s) return undefined;
  if (s.includes("T")) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return s;
};

// ───────── teams ─────────
const teamFromRef = (ref: unknown, acc: Partial<TournamentTeam>) => {
  if (typeof ref === "string") {
    const s = ref.trim();
    if (!s) return;
    if (isObjectId(s)) acc.id ??= s;
    else acc.name ??= s;
  } else if (isRec(ref)) {
    acc.id ??= str(ref._id) ?? str(ref.id) ?? idOf(ref.clubId);
    acc.name ??= str(ref.clubName) ?? str(ref.name) ?? str(ref.teamName);
    acc.logo ??= str(ref.logo) ?? str(ref.logoUrl);
    acc.badgePreset ??= str(ref.badgePreset);
  }
};

const finishTeam = (acc: Partial<TournamentTeam>, lookup: TeamLookup, placeholder?: string): TournamentTeam => {
  const known = (acc.id && lookup.get(acc.id)) || (acc.name && lookup.get(`name:${acc.name.toLowerCase()}`));
  const name = acc.name ?? (known ? known.name : undefined);
  return {
    id: acc.id ?? (known ? known.id : undefined),
    name: name ?? placeholder ?? "TBD",
    logo: acc.logo ?? (known ? known.logo : undefined),
    badgePreset: acc.badgePreset ?? (known ? known.badgePreset : undefined),
    isTbd: !name,
  };
};

export const teamFromAny = (ref: unknown, lookup: TeamLookup): TournamentTeam | null => {
  const acc: Partial<TournamentTeam> = {};
  teamFromRef(ref, acc);
  if (!acc.id && !acc.name) return null;
  return finishTeam(acc, lookup);
};

const sideTeam = (f: Rec, side: "home" | "away", lookup: TeamLookup): TournamentTeam => {
  const n = side === "home" ? "1" : "2";
  const acc: Partial<TournamentTeam> = {};
  for (const ref of [f[`${side}ClubId`], f[`${side}Club`], f[`${side}Team`], f[`team${n}`], f[`team${n}Id`]]) {
    teamFromRef(ref, acc);
  }
  acc.name ??= str(f[`${side}TeamName`]) ?? str(f[`${side}ClubName`]) ?? str(f[`team${n}Name`]);
  acc.logo ??= str(f[`${side}Logo`]) ?? str(f[`team${n}Logo`]);
  acc.badgePreset ??= str(f[`${side}BadgePreset`]) ?? str(f[`team${n}BadgePreset`]);
  const placeholder = str(f[`${side}Placeholder`]) ?? str(f[`team${n}Placeholder`]);
  return finishTeam(acc, lookup, placeholder);
};

// ───────── fixtures ─────────
const classify = (f: Rec): StageKind => {
  const text = `${str(f.stage) ?? ""} ${str(f.round) ?? ""}`;
  if (/semi/i.test(text)) return "semi";
  if (/final/i.test(text)) return "final";
  if (/group/i.test(text) || str(f.group)) return "group";
  return "other";
};

export const normalizeMatch = (
  raw: unknown,
  lookup: TeamLookup,
  index: number,
  forcedKind?: StageKind
): TournamentMatch | null => {
  if (!isRec(raw)) return null;
  const f = raw as Rec & Partial<IEventFixture>;
  const kind = forcedKind ?? classify(f);
  const home = sideTeam(f, "home", lookup);
  const away = sideTeam(f, "away", lookup);
  const homeScore = num(f.homeScore ?? f.score1 ?? f.goal1 ?? f.homeGoals);
  const awayScore = num(f.awayScore ?? f.score2 ?? f.goal2 ?? f.awayGoals);
  const status = (str(f.status) ?? (homeScore !== null && awayScore !== null ? "COMPLETED" : "SCHEDULED")).toUpperCase();
  const isLive = status === "LIVE" || status === "IN_PROGRESS";
  const isCompleted = ["COMPLETED", "FINISHED", "FULL_TIME", "FT", "PLAYED"].includes(status);

  let winner: TournamentMatch["winner"] = null;
  const winnerId = idOf(f.winnerId ?? f.winner);
  if (winnerId && home.id && winnerId === home.id) winner = "home";
  else if (winnerId && away.id && winnerId === away.id) winner = "away";
  else if (winnerId && winnerId === home.name) winner = "home";
  else if (winnerId && winnerId === away.name) winner = "away";
  else if (isCompleted && homeScore !== null && awayScore !== null && homeScore !== awayScore) {
    winner = homeScore > awayScore ? "home" : "away";
  }

  const group = groupLabel(str(f.group));
  const label =
    kind === "semi"
      ? "Semi-final"
      : kind === "final"
        ? "Grand Final"
        : kind === "group"
          ? group ?? "Group Stage"
          : humanize(str(f.stage) ?? str(f.round)) || "Match";

  return {
    key: str(f._id) ?? str(f.matchId) ?? `${kind}-${index}`,
    kind,
    stageLabel: label,
    group,
    home,
    away,
    homeScore,
    awayScore,
    status,
    isLive,
    isCompleted,
    kickoff: formatKickoff(str(f.kickoffTime) ?? str(f.time) ?? str(f.startTime)),
    date: formatDate(str(f.matchDate) ?? str(f.date)),
    pitch: str(f.pitch),
    winner,
  };
};

export const normalizeMatches = (list: unknown[], lookup: TeamLookup): TournamentMatch[] =>
  list.map((f, i) => normalizeMatch(f, lookup, i)).filter((m): m is TournamentMatch => !!m);

// ───────── standings ─────────
const pickGroupRows = (standings: unknown, letter: "A" | "B"): unknown[] => {
  if (Array.isArray(standings)) {
    const entry = standings.find(
      (s) => isRec(s) && groupLabel(str(s.group) ?? str(s.name)) === `Group ${letter}`
    ) as Rec | undefined;
    if (!entry) return [];
    const rows = entry.rows ?? entry.table ?? entry.standings ?? entry.teams;
    return Array.isArray(rows) ? rows : [];
  }
  if (!isRec(standings)) return [];
  for (const key of [`group${letter}`, `GROUP ${letter}`, `Group ${letter}`, `GROUP_${letter}`, letter]) {
    const v = standings[key];
    if (Array.isArray(v)) return v;
  }
  return [];
};

const normalizeRow = (raw: unknown, index: number, lookup: TeamLookup): TournamentStandingRow | null => {
  if (!isRec(raw)) return null;
  const acc: Partial<TournamentTeam> = {};
  for (const ref of [raw.clubId, raw.club, raw.team]) teamFromRef(ref, acc);
  acc.name ??= str(raw.clubName) ?? str(raw.teamName) ?? str(raw.name);
  acc.logo ??= str(raw.logo);
  acc.badgePreset ??= str(raw.badgePreset);
  const team = finishTeam(acc, lookup);
  const n = (...keys: string[]) => {
    for (const k of keys) {
      const v = num(raw[k]);
      if (v !== null) return v;
    }
    return 0;
  };
  const goalsFor = n("goalsFor", "gf");
  const goalsAgainst = n("goalsAgainst", "ga");
  const gd = num(raw.goalDifference ?? raw.gd);
  return {
    key: team.id ?? `${team.name}-${index}`,
    team,
    played: n("played", "p", "matchesPlayed"),
    won: n("won", "w", "wins"),
    drawn: n("drawn", "d", "draws"),
    lost: n("lost", "l", "losses"),
    goalsFor,
    goalsAgainst,
    goalDifference: gd ?? goalsFor - goalsAgainst,
    points: n("points", "pts"),
    qualified: typeof raw.qualified === "boolean" ? raw.qualified : undefined,
  };
};

export const normalizeStandings = (
  standings: IEventStandings | unknown,
  lookup: TeamLookup
): { groupA: TournamentStandingRow[]; groupB: TournamentStandingRow[] } => {
  const build = (letter: "A" | "B") => {
    const rows = pickGroupRows(standings, letter);
    const withPos = rows.map((r, i) => ({ r, pos: isRec(r) ? num(r.position ?? r.rank) : null, i }));
    if (withPos.some((x) => x.pos !== null)) withPos.sort((a, b) => (a.pos ?? 99) - (b.pos ?? 99));
    return withPos
      .map(({ r, i }) => normalizeRow(r, i, lookup))
      .filter((x): x is TournamentStandingRow => !!x);
  };
  return { groupA: build("A"), groupB: build("B") };
};

/** id / name → team info, collected from standings rows and populated fixture refs. */
export const buildTeamLookup = (standings: unknown, fixtures: unknown[]): TeamLookup => {
  const lookup: TeamLookup = new Map();
  const add = (acc: Partial<TournamentTeam>) => {
    if (!acc.name) return;
    const entry = { id: acc.id, name: acc.name, logo: acc.logo, badgePreset: acc.badgePreset };
    if (acc.id && !lookup.has(acc.id)) lookup.set(acc.id, entry);
    const nameKey = `name:${acc.name.toLowerCase()}`;
    if (!lookup.has(nameKey)) lookup.set(nameKey, entry);
  };
  for (const letter of ["A", "B"] as const) {
    for (const row of pickGroupRows(standings, letter)) {
      if (!isRec(row)) continue;
      const acc: Partial<TournamentTeam> = {};
      for (const ref of [row.clubId, row.club, row.team]) teamFromRef(ref, acc);
      acc.name ??= str(row.clubName) ?? str(row.teamName) ?? str(row.name);
      acc.logo ??= str(row.logo);
      acc.badgePreset ??= str(row.badgePreset);
      add(acc);
    }
  }
  for (const f of fixtures) {
    if (!isRec(f)) continue;
    for (const ref of [f.homeClubId, f.awayClubId, f.homeTeam, f.awayTeam]) {
      if (!isRec(ref)) continue;
      const acc: Partial<TournamentTeam> = {};
      teamFromRef(ref, acc);
      add(acc);
    }
  }
  return lookup;
};

// ───────── bracket ─────────
const asList = (v: unknown): unknown[] => {
  if (Array.isArray(v)) return v;
  if (isRec(v)) {
    // a single match vs. a keyed map of matches ({ sf1: {...}, sf2: {...} })
    const looksLikeMatch = ["homeClubId", "homeTeam", "awayTeam", "team1", "homeScore", "_id", "matchId"].some(
      (k) => k in v
    );
    return looksLikeMatch ? [v] : Object.values(v).filter(isRec);
  }
  return [];
};

export const normalizeBracket = (
  raw: unknown,
  lookup: TeamLookup,
  fixtures: TournamentMatch[]
): TournamentBracket => {
  let semis: TournamentMatch[] = [];
  let final: TournamentMatch | null = null;
  let championRaw: unknown;

  if (Array.isArray(raw)) {
    const flat: Rec[] = [];
    raw.forEach((item) => {
      if (!isRec(item)) return;
      if (Array.isArray(item.matches)) {
        const roundName = str(item.round) ?? str(item.stage) ?? str(item.name);
        item.matches.forEach((m) => isRec(m) && flat.push({ stage: roundName, ...m }));
      } else flat.push(item);
    });
    const matches = normalizeMatches(flat, lookup);
    semis = matches.filter((m) => m.kind === "semi");
    final = matches.find((m) => m.kind === "final") ?? null;
  } else if (isRec(raw)) {
    const semisRaw = raw.semifinals ?? raw.semiFinals ?? raw.semis ?? raw.semiFinal ?? raw.SEMIFINALS;
    const finalRaw = raw.final ?? raw.grandFinal ?? raw.finalMatch ?? raw.GRAND_FINAL;
    semis = asList(semisRaw)
      .map((m, i) => normalizeMatch(m, lookup, i, "semi"))
      .filter((m): m is TournamentMatch => !!m);
    final = asList(finalRaw)
      .map((m, i) => normalizeMatch(m, lookup, i, "final"))
      .find((m): m is TournamentMatch => !!m) ?? null;
    championRaw = raw.champion ?? raw.winner;
  }

  // Fall back to knockout fixtures when the bracket object is missing or empty.
  if (semis.length === 0) semis = fixtures.filter((m) => m.kind === "semi");
  if (!final) final = fixtures.find((m) => m.kind === "final") ?? null;

  let champion = championRaw !== undefined ? teamFromAny(championRaw, lookup) : null;
  if (!champion && final?.winner) champion = final.winner === "home" ? final.home : final.away;

  return { semis, final, champion };
};

// ───────── badge presets ─────────
const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** Image src for a team badge: logo url → API badge preset → bundled svg preset. */
export const resolveBadgeSrc = (team: TournamentTeam, presets: IBadgePreset[]): string | undefined => {
  if (team.logo) return team.logo;
  const key = team.badgePreset;
  if (!key) return undefined;
  const preset = presets.find((p) => [p.id, p._id, p.key, p.name].some((v) => typeof v === "string" && v === key));
  if (preset) {
    const url = str(preset.imageUrl) ?? str(preset.url);
    if (url) return url;
    if (str(preset.svg)) return svgDataUri(preset.svg as string);
  }
  const local = CLUB_PRESET_LOGOS.find((l) => l.id === key || l.name === key);
  return local ? svgDataUri(local.svg) : undefined;
};

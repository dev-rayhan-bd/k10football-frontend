// Tolerant parsers for GET /academies/coaches and GET /academies/players.
// Both may return the list directly or wrapped, with the person populated or flattened.

type AnyRecord = Record<string, unknown>;

export const INACTIVE_COACH_STATUSES = ["REMOVED", "REJECTED"];

const asRecord = (value: unknown): AnyRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as AnyRecord) : null;

const str = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
};

export const extractList = (data: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(data)) return data;
  const record = asRecord(data);
  if (!record) return [];
  for (const key of [...keys, "data", "result", "items"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
    const nested = asRecord(record[key]);
    if (nested) {
      const inner = extractList(nested, keys);
      if (inner.length) return inner;
    }
  }
  return [];
};

export interface AcademyCoachRow {
  /** Sent to DELETE /academies/coaches/:id (affiliation _id, else CoachProfile _id). */
  removeId: string;
  /** CoachProfile _id — what evaluation requests expect as coachId. */
  coachProfileId: string;
  name: string;
  email: string;
  avatar: string;
  license: string;
  role: string;
  teams: string[];
  teamsCount: number | null;
  status: string;
  joinedAt: string;
}

const toCoachRow = (raw: unknown): AcademyCoachRow | null => {
  const item = asRecord(raw);
  if (!item) return null;
  // The coach may be populated under coachId / coach / coachProfile, or flattened onto the row.
  const populated = asRecord(item.coachId) ?? asRecord(item.coach) ?? asRecord(item.coachProfile);
  const coach = populated ?? item;
  const user = asRecord(coach.userId) ?? asRecord(item.userId) ?? asRecord(coach.user);

  const coachIdString = typeof item.coachId === "string" ? item.coachId : "";
  const removeId = str(item._id, item.affiliationId, coachIdString, coach._id);
  if (!removeId) return null;
  const coachProfileId = str(populated?._id, coachIdString, item.coachProfileId, item._id);

  const rawTeams = Array.isArray(item.teams) ? item.teams : Array.isArray(coach.teams) ? coach.teams : null;
  const teams = (rawTeams ?? [])
    .map((team) => (typeof team === "string" ? team : str(asRecord(team)?.teamName, asRecord(team)?.name)))
    .filter(Boolean);
  const teamsCountValue = item.teamsCount ?? coach.teamsCount;

  return {
    removeId,
    coachProfileId,
    name: str(item.coachName, item.name, item.fullName, coach.fullName, coach.name, user?.name) || "Coach",
    email: str(item.email, coach.email, user?.email),
    avatar: str(item.avatar, item.profileImage, coach.profileImage, coach.avatar, user?.avatar, user?.profileImage),
    license: str(item.licenseNumber, coach.licenseNumber, item.licenseStatus, coach.licenseStatus, coach.licence),
    role: str(item.role, item.coachRole, item.title, coach.title, coach.role),
    teams,
    teamsCount: typeof teamsCountValue === "number" ? teamsCountValue : rawTeams ? teams.length : null,
    status: str(item.status, item.affiliationStatus, coach.status).toUpperCase(),
    joinedAt: str(item.joinedAt, item.approvedAt, item.createdAt),
  };
};

export const toAcademyCoachRows = (data: unknown): AcademyCoachRow[] =>
  extractList(data, ["coaches", "affiliations"])
    .map(toCoachRow)
    .filter((row): row is AcademyCoachRow => row !== null);

export interface AcademyPlayerOption {
  id: string;
  name: string;
  position: string;
}

export const toAcademyPlayerOptions = (data: unknown): AcademyPlayerOption[] =>
  extractList(data, ["players"])
    .map((raw) => {
      const item = asRecord(raw);
      if (!item) return null;
      const player = asRecord(item.playerId) ?? asRecord(item.player) ?? item;
      const user = asRecord(player.userId);
      const id = str(player._id, typeof item.playerId === "string" ? item.playerId : "", item._id, item.id);
      if (!id) return null;
      return {
        id,
        name: str(player.fullName, player.name, item.playerName, user?.name) || "Player",
        position: str(player.position, item.position),
      };
    })
    .filter((option): option is AcademyPlayerOption => option !== null);

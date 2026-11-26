// Academy Extra Events & Tournaments. Base /api/v1/academies.
// Registration modes: INDIVIDUAL (a person registers) | CLUB (a team registers with a roster).
// Paid registrations are confirmed ONLY by the Stripe webhook.

export interface IApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: { page: number; limit: number; total: number; totalPage?: number; totalPages?: number };
  data: T;
}

export type ExtraEventStatus = "OPEN" | "CLOSING SOON" | "CLOSED" | string;
export type RegistrationMode = "INDIVIDUAL" | "CLUB";
export type EventPaymentStatus = "PAID" | "PENDING" | "FREE" | string;
export type TournamentStatus = "REGISTRATION" | "GROUP_STAGE" | "SEMIFINALS" | "GRAND_FINAL" | "COMPLETED" | string;
export type TournamentStageStep = "GROUP_STAGE" | "SEMIFINALS" | "GRAND_FINAL";
export type FixtureStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | string;
export type TournamentGroup = "GROUP A" | "GROUP B";

/** `{ value, label }` options, or plain strings on older payloads. */
export type ExtraEventOption = string | { value: string; label: string };

// GET /extra-events/meta
export interface IExtraEventMeta {
  eventTypes?: ExtraEventOption[];
  groups?: ExtraEventOption[];
  ageGroups?: ExtraEventOption[];
  targetAttendees?: ExtraEventOption[];
  statusOptions?: ExtraEventOption[];
  dateFilters?: ExtraEventOption[];
  teams?: Array<{ _id: string; teamName?: string; name?: string } | ExtraEventOption>;
}

// GET /extra-events (academy / coach)
export interface IAcademyEventListParams {
  searchTerm?: string;
  eventType?: string;
  status?: string;
  group?: string;
  ageGroup?: string;
  targetAttendees?: string;
  date?: "today" | "this_week" | "this_month" | "upcoming" | "past" | string;
  page?: number;
  limit?: number;
}

export interface IAcademyEventListItem {
  _id: string;
  eventName: string;
  eventType?: string;
  isTournament?: boolean;
  registrationMode?: RegistrationMode;
  group?: string;
  ageGroup?: string;
  targetAttendees?: string;
  status?: ExtraEventStatus;
  closedReason?: string | null;
  statusBadge?: string;
  eventDate?: string;
  eventEndDate?: string | null;
  formattedDate?: string;
  formattedDateRange?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  venueName?: string;
  venueAddress?: string;
  registrationFee?: number;
  currency?: string;
  feeFormatted?: string;
  currentAttendees?: number;
  maxCapacity?: number | null;
  capacityRatio?: string | number;
  bannerImage?: string;
  canRegister?: boolean;
  tournamentStatus?: TournamentStatus;
  isLiveMode?: boolean;
}

export interface IAcademyEventListData {
  events: IAcademyEventListItem[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface IEventParticipant {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  teamName?: string;
  paymentStatus?: EventPaymentStatus;
  paidAmount?: number;
  registeredAt?: string;
}

export interface IRosterPlayer {
  _id?: string;
  fullName: string;
  dateOfBirth?: string;
  shirtNo?: number | string;
}

export interface IRegisteredClub {
  _id: string;
  clubName: string;
  coachName?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  category?: string;
  logo?: string;
  badgePreset?: string;
  group?: TournamentGroup | string | null;
  paymentStatus?: EventPaymentStatus;
  paymentMethod?: string;
  rosterCount?: number;
  roster?: IRosterPlayer[];
  registeredAt?: string;
  [key: string]: unknown;
}

/** Fixture / match. Team refs may be populated objects or ids; names are usually flattened too. */
export interface IEventFixture {
  _id: string;
  matchId?: string;
  stage?: string;
  group?: string | null;
  round?: string;
  homeClubId?: string | { _id: string; clubName?: string; logo?: string; badgePreset?: string };
  awayClubId?: string | { _id: string; clubName?: string; logo?: string; badgePreset?: string };
  homeTeam?: string | { _id?: string; clubName?: string; name?: string; logo?: string };
  awayTeam?: string | { _id?: string; clubName?: string; name?: string; logo?: string };
  homeScore?: number | null;
  awayScore?: number | null;
  kickoffTime?: string;
  matchDate?: string;
  pitch?: string;
  status?: FixtureStatus;
  winnerId?: string | null;
  [key: string]: unknown;
}

export interface IStandingRow {
  clubId?: string;
  clubName?: string;
  logo?: string;
  badgePreset?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  [key: string]: unknown;
}

export interface IEventStandings {
  groupA?: IStandingRow[];
  groupB?: IStandingRow[];
  [key: string]: unknown;
}

/** Semifinal → final bracket; the exact shape varies, so consumers read it defensively. */
export type IEventBracket = Record<string, unknown> | unknown[] | null;

// GET /extra-events/:id (academy / coach)
export interface IAcademyEventDetail extends IAcademyEventListItem {
  description?: string;
  requirements?: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  participants?: IEventParticipant[];
  registeredClubs?: IRegisteredClub[];
  fixtures?: IEventFixture[];
  standings?: IEventStandings;
  bracket?: IEventBracket;
  simulationStep?: string | null;
  [key: string]: unknown;
}

export interface IGroupAllocationData {
  groupA?: IRegisteredClub[];
  groupB?: IRegisteredClub[];
  unallocated?: IRegisteredClub[];
  clubs?: IRegisteredClub[];
  [key: string]: unknown;
}

export interface IUpdateFixturePayload {
  homeScore?: number;
  awayScore?: number;
  kickoffTime?: string;
  pitch?: string;
  matchDate?: string;
  status?: FixtureStatus;
}

// ── Public / player / parent ──
export interface IMyEventRegistration {
  type: "INDIVIDUAL" | "CLUB";
  participantId?: string;
  clubId?: string;
  paymentStatus: EventPaymentStatus;
  registeredAt?: string;
}

export interface IPublicEventListParams {
  academyId?: string;
  eventType?: string;
  ageGroup?: string;
  targetAttendees?: string;
  searchTerm?: string;
  when?: "upcoming" | "past" | "all";
  openOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface IPublicEvent {
  _id: string;
  eventName: string;
  eventType?: string;
  isTournament?: boolean;
  registrationMode?: RegistrationMode;
  ageGroup?: string;
  targetAttendees?: string;
  academy?: { _id: string; name?: string; logo?: string; city?: string; country?: string } | null;
  eventDate?: string;
  eventEndDate?: string | null;
  formattedDate?: string;
  startTime?: string;
  endTime?: string;
  registrationDeadline?: string;
  venueName?: string;
  venueAddress?: string;
  bannerImage?: string;
  registrationFee?: number;
  currency?: string;
  feeFormatted?: string;
  maxCapacity?: number | null;
  confirmedCount?: number;
  spotsLeft?: number | null;
  status?: ExtraEventStatus;
  closedReason?: string | null;
  canRegister?: boolean;
  tournamentStatus?: TournamentStatus;
  isLiveMode?: boolean;
  myRegistration?: IMyEventRegistration | null;
  // Detail-only
  description?: string;
  requirements?: string;
  latitude?: number | null;
  longitude?: number | null;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface IRegisterForEventPayload {
  name: string;
  email?: string;
  phone?: string;
  teamName?: string;
}

export interface IRegisterForEventData {
  paymentStatus: EventPaymentStatus;
  requiresPayment: boolean;
  checkoutUrl?: string | null;
  message?: string;
  participantId?: string;
}

export interface IRegisterClubData {
  clubId?: string;
  paymentStatus?: EventPaymentStatus;
  requiresPayment?: boolean;
  checkoutUrl?: string | null;
  message?: string;
  [key: string]: unknown;
}

export interface IBadgePreset {
  id?: string;
  _id?: string;
  key?: string;
  name?: string;
  label?: string;
  svg?: string;
  imageUrl?: string;
  url?: string;
  isTaken?: boolean;
  [key: string]: unknown;
}

// GET /extra-events/:id/public-portal
export interface IEventPublicPortal {
  eventInfo?: IPublicEvent & Record<string, unknown>;
  arena?: { standings?: IEventStandings; fixtures?: IEventFixture[]; bracket?: IEventBracket };
  bracket?: IEventBracket;
  [key: string]: unknown;
}

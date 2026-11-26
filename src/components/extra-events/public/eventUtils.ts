import type { ComponentProps } from "react";
import type { Badge } from "@/components/ui/badge";
import type { EventPaymentStatus, IPublicEvent } from "@/types/extraEvent.type";
import { getToken, getUserInfo, isTokenExpired } from "@/helpers/SessionHelper";

type BadgeVariant = ComponentProps<typeof Badge>["variant"];

/** Client-only (AuthGuard renders children after mount): the current session, if any. */
export const readSession = () => {
  const token = getToken();
  const loggedIn = Boolean(token) && !isTokenExpired(token);
  const info = loggedIn ? getUserInfo() : null;
  return {
    loggedIn,
    role: info?.role || "",
    fullName: info?.fullName || "",
    email: info?.email || "",
  };
};

export const isClubEvent = (event: Pick<IPublicEvent, "registrationMode" | "isTournament">) =>
  event.registrationMode ? event.registrationMode === "CLUB" : Boolean(event.isTournament);

export const isClosed = (event: Pick<IPublicEvent, "status" | "canRegister">) =>
  String(event.status || "").toUpperCase() === "CLOSED" || event.canRegister === false;

/** Tournament past registration (groups / knock-outs / done) or flagged live → public live view. */
export const isTournamentStarted = (event: IPublicEvent) =>
  Boolean(event.isTournament) &&
  (Boolean(event.isLiveMode) ||
    (!!event.tournamentStatus && String(event.tournamentStatus).toUpperCase() !== "REGISTRATION"));

export const formatFee = (event: Pick<IPublicEvent, "feeFormatted" | "registrationFee" | "currency">) => {
  if (event.feeFormatted) return event.feeFormatted;
  if (!event.registrationFee) return "Free";
  return `${event.currency ? `${event.currency.toUpperCase()} ` : ""}${event.registrationFee}`;
};

const formatDay = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

export const formatEventDate = (event: IPublicEvent) => {
  if (event.formattedDate) return event.formattedDate;
  const start = formatDay(event.eventDate);
  const end = event.eventEndDate ? formatDay(event.eventEndDate) : "";
  return end && end !== start ? `${start} – ${end}` : start || "Date to be confirmed";
};

export const formatEventTime = (event: IPublicEvent) =>
  [event.startTime, event.endTime].filter(Boolean).join(" – ");

export const formatDeadline = (value?: string | null) => formatDay(value);

export const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const spotsLabel = (event: IPublicEvent) => {
  if (typeof event.spotsLeft === "number") {
    if (event.spotsLeft <= 0) return "Fully booked";
    return `${event.spotsLeft} ${event.spotsLeft === 1 ? "spot" : "spots"} left`;
  }
  return event.maxCapacity ? `${event.confirmedCount ?? 0}/${event.maxCapacity} registered` : "";
};

export const statusBadgeVariant = (status?: string | null): BadgeVariant => {
  const s = String(status || "").toUpperCase();
  if (s === "CLOSED") return "destructive";
  if (s === "OPEN") return "default";
  return "outline";
};

export const paymentStatusLabel = (status?: EventPaymentStatus | null) => {
  const s = String(status || "").toUpperCase();
  if (s === "PAID") return "Paid";
  if (s === "PENDING") return "Payment pending";
  if (s === "FREE") return "Free";
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : "";
};

export const paymentBadgeVariant = (status?: EventPaymentStatus | null): BadgeVariant => {
  const s = String(status || "").toUpperCase();
  if (s === "PAID" || s === "FREE") return "default";
  if (s === "PENDING") return "outline";
  return "destructive";
};

export const mapUrl = (event: IPublicEvent) => {
  if (typeof event.latitude === "number" && typeof event.longitude === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
  }
  const address = [event.venueName, event.venueAddress].filter(Boolean).join(", ");
  return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null;
};

/** Distinct, non-empty values (comma-separated values are split, e.g. ageGroup "U-10, U-12"). */
export const distinctValues = (events: IPublicEvent[], key: "eventType" | "ageGroup" | "targetAttendees") => {
  const set = new Set<string>();
  events.forEach((event) => {
    String(event[key] || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v) => set.add(v));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

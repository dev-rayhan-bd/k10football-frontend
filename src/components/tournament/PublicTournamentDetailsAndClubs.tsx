"use client";

import Image from "next/image";
import {
  IconCalendarEvent,
  IconFileText,
  IconListCheck,
  IconMapPin,
  IconShield,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import type { IBadgePreset, IPublicEvent, IRegisteredClub } from "@/types/extraEvent.type";
import { formatDate } from "./tournament.utils";

interface PublicTournamentDetailsAndClubsProps {
  event: IPublicEvent & Record<string, unknown>;
  clubs: IRegisteredClub[];
  presets: IBadgePreset[];
  isLoadingClubs?: boolean;
}

const resolveClubLogo = (club: IRegisteredClub, presets: IBadgePreset[]) => {
  if (club.logo) return club.logo;
  if (club.badgePreset) {
    if (club.badgePreset.startsWith("http")) return club.badgePreset;
    const match = presets.find(
      (p) => p.key === club.badgePreset || p.id === club.badgePreset || p._id === club.badgePreset
    );
    if (match?.imageUrl || match?.url) return match.imageUrl || match.url;
  }
  return null;
};

const PublicTournamentDetailsAndClubs = ({
  event,
  clubs,
  presets,
  isLoadingClubs = false,
}: PublicTournamentDetailsAndClubsProps) => {
  const categories = (event.ageGroup || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const deadline = formatDate(event.registrationDeadline);
  const requirementsList = event.requirements
    ? event.requirements
        .split(/\r?\n|•/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const registeredTotal =
    clubs.length > 0 ? clubs.length : typeof event.confirmedCount === "number" ? event.confirmedCount : 0;

  const mapsQuery = encodeURIComponent(event.venueAddress || event.venueName || "");
  const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null;

  const hasEventDetails =
    categories.length > 0 ||
    Boolean(event.targetAttendees) ||
    Boolean(event.group) ||
    Boolean(deadline) ||
    Boolean(event.description) ||
    requirementsList.length > 0 ||
    Boolean(mapsUrl);

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Event Info */}
      {hasEventDetails && (
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron flex items-center gap-2">
              <IconFileText size={18} className="text-amber-400" />
              Event Details
            </h2>

            <div className="flex flex-wrap gap-2">
              {event.targetAttendees && (
                <span className="bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                  {event.targetAttendees}
                </span>
              )}
              {typeof event.group === "string" && event.group && (
                <span className="bg-white/5 border border-white/10 text-[#00FF62] px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider font-orbitron">
                  {event.group}
                </span>
              )}
              {deadline && (
                <span className="bg-white/5 border border-white/10 text-amber-400 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <IconCalendarEvent size={12} />
                  Deadline: {deadline}
                </span>
              )}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-orbitron flex items-center gap-1.5">
                <IconStar size={13} className="text-amber-400" /> Categories / Age Groups
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-black/60 border border-white/10 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-orbitron">
                About This Event
              </span>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{event.description}</p>
            </div>
          )}

          {requirementsList.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 font-orbitron flex items-center gap-1.5">
                <IconListCheck size={14} className="text-amber-400" /> Rules &amp; Requirements
              </span>
              <ul className="text-sm text-white/70 space-y-1.5 list-disc pl-5">
                {requirementsList.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {mapsUrl && (
            <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-4 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <IconMapPin size={15} className="text-amber-400 shrink-0" />
                <span>{[event.venueName, event.venueAddress].filter(Boolean).join(" — ")}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 border border-amber-500/30 bg-amber-500/10 px-4 py-2 rounded-xl font-orbitron"
              >
                View on Map
              </a>
            </div>
          )}
        </div>
      )}

      {/* Registered Teams / Clubs */}
      <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron flex items-center gap-2">
              <IconUsers size={18} className="text-[#00FF62]" />
              Registered Teams &amp; Clubs
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
              Confirmed squads participating in this event
            </p>
          </div>
          <span className="bg-[#00FF62]/10 border border-[#00FF62]/20 text-[#00FF62] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest font-orbitron">
            {registeredTotal}
            {typeof event.maxCapacity === "number" ? ` / ${event.maxCapacity}` : ""} Registered
          </span>
        </div>

        {isLoadingClubs ? (
          <div className="py-8 text-center text-xs font-bold uppercase tracking-widest text-white/40">
            Loading registered teams...
          </div>
        ) : clubs.length === 0 ? (
          <div className="py-10 text-center bg-black/40 border border-white/5 rounded-2xl">
            <IconShield size={28} className="mx-auto text-white/20 mb-2" />
            <p className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
              No teams registered yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club) => {
              const logoUrl = resolveClubLogo(club, presets);
              const playerCount = club.rosterCount ?? club.roster?.length;
              return (
                <div
                  key={club._id}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5"
                >
                  <div className="size-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={club.clubName}
                        width={48}
                        height={48}
                        unoptimized
                        className="size-full object-cover"
                      />
                    ) : (
                      <IconShield size={20} className="text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase text-white truncate">{club.clubName}</p>
                    {(club.coachName || typeof playerCount === "number") && (
                      <p className="text-[10px] text-white/50 truncate mt-0.5">
                        {[
                          club.coachName ? `Coach: ${club.coachName}` : null,
                          typeof playerCount === "number" ? `${playerCount} Players` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {club.category && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-white/70 border border-white/10">
                          {club.category}
                        </span>
                      )}
                      {club.group && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/20">
                          {club.group}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTournamentDetailsAndClubs;

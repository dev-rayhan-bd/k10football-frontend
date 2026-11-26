"use client";

import React from "react";
import Image from "next/image";
import {
  IconCalendarEvent,
  IconCheck,
  IconCopy,
  IconCurrencyDollar,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPlus,
  IconShield,
  IconStar,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import type { IAcademyEventDetail } from "@/types/extraEvent.type";

interface TournamentHeroAndSidebarProps {
  event: IAcademyEventDetail;
  registeredCount: number;
  maxTeams: number | string;
  isRegistrationOpen: boolean;
  isLiveMode: boolean;
  onOpenRegisterModal: () => void;
  onCopyInviteLink: () => void;
  copiedInvite: boolean;
}

export const TournamentHeroAndSidebar: React.FC<TournamentHeroAndSidebarProps> = ({
  event,
  registeredCount,
  maxTeams,
  isRegistrationOpen,
  isLiveMode,
  onOpenRegisterModal,
  onCopyInviteLink,
  copiedInvite,
}) => {
  const categories = (event.ageGroup || "Open")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const feeDisplay =
    event.feeFormatted ||
    (event.registrationFee && Number(event.registrationFee) > 0
      ? `$${Number(event.registrationFee).toFixed(2)}`
      : "Free");

  const statusLabel = isLiveMode
    ? "LIVE GAME"
    : isRegistrationOpen
      ? "REGISTRATION OPEN"
      : String(event.tournamentStatus || event.status || "CLOSED").replace(/_/g, " ");

  const requirementsList = event.requirements
    ? event.requirements
        .split(/\r?\n|•/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [
        "Squad roster lists must be locked prior to registration deadline.",
        "Players are required to play in matching team uniforms (kits) with visible shirt numbers.",
        "Shinguards are strictly mandatory for all age categories.",
        "Teams must present birth certificates or credentials upon check-in if requested by tournament organizers.",
        "Parental consent forms must be completed for all underage youth players.",
      ];

  const mapsQuery = encodeURIComponent(event.venueAddress || event.venueName || "");
  const mapsUrl = mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Main Flyer Box */}
      <div className="lg:col-span-2 bg-linear-to-b from-[#111111] to-[#050505] rounded-4xl border border-white/10 overflow-hidden shadow-2xl relative min-w-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-[#E31B23]/10 to-transparent pointer-events-none" />

        {/* Header Banner */}
        <div className="p-8 md:p-12 border-b border-white/10 flex flex-col md:flex-row gap-8 items-center bg-black/40">
          {/* Shield/Logo */}
          <div className="size-32 md:size-36 shrink-0 bg-[#161616] rounded-3xl border border-white/10 p-4 flex items-center justify-center shadow-lg relative">
            {event.bannerImage ? (
              <Image
                width={120}
                height={120}
                src={event.bannerImage}
                alt={event.eventName}
                className="size-full object-contain rounded-2xl"
              />
            ) : (
              <IconShield size={56} className="text-[#E31B23]/80" />
            )}
            <div className="absolute -bottom-3 bg-[#E31B23] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-black">
              INVITATION
            </div>
          </div>

          {/* Title Info */}
          <div className="text-center md:text-left space-y-4 min-w-0">
            <span className="inline-block bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
              {statusLabel}
            </span>

            <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none mt-2 break-words">
              {event.eventName}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="bg-white/5 border border-white/10 text-white/60 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                {event.targetAttendees || "ACADEMY PLAYERS ONLY"}
              </span>
              <span className="bg-white/5 border border-white/10 text-[#00FF62] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide font-orbitron">
                {(event.group as string) || "11-A-SIDE FORMAT"}
              </span>
            </div>
          </div>
        </div>

        {/* Flyer Details Grid */}
        <div className="p-8 md:p-12 space-y-10">
          {/* Three Stat Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconCalendarEvent size={18} className="text-[#E31B23]" /> DATE OF EVENT
              </span>
              <span className="text-base font-black text-white uppercase mt-1">
                {event.formattedDateRange || event.formattedDate || event.eventDate || "TBA"}
              </span>
            </div>
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconCurrencyDollar size={18} className="text-[#E31B23]" /> REGISTRATION FEE
              </span>
              <span className="text-base font-black text-[#00FF62] uppercase mt-1">{feeDisplay}</span>
            </div>
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconUsers size={18} className="text-[#E31B23]" /> REGISTERED CLUBS
              </span>
              <span className="text-base font-black text-white uppercase mt-1">
                {registeredCount} / {maxTeams}
              </span>
            </div>
          </div>

          {/* Age Categories */}
          <div className="space-y-4 bg-[#141414]/60 border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase text-white/40 tracking-widest font-orbitron flex items-center gap-2">
              <IconStar size={16} className="text-[#E31B23]" /> TARGET CATEGORIES / AGE GROUPS
            </h3>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="bg-black/60 border border-white/10 text-white font-black text-xs px-4 py-2 rounded-xl"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Tournament Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">TOURNAMENT DETAILS</h3>
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
              {event.description ||
                `Welcome to ${event.eventName}. This tournament gathers top squads for a competitive matchday experience in a Group Stage + Knockout structure.`}
            </p>
          </div>

          {/* Rules & What to Bring */}
          <div className="space-y-4 border-t border-white/5 pt-8">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">RULES &amp; WHAT TO BRING</h3>
            <ul className="text-sm text-white/60 space-y-3 list-disc pl-5">
              {requirementsList.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Join Tournament Card */}
        <div className="bg-[#1C1C1C] border border-[#E31B23]/35 rounded-4xl p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#E31B23]/10 to-transparent pointer-events-none" />
          <h4 className="text-lg font-black uppercase tracking-wider text-white font-orbitron">
            JOIN THIS TOURNAMENT
          </h4>
          <p className="text-xs text-white/50 leading-relaxed">
            Register your club squad, pick your badge preset, upload player photos &amp; birth dates, and complete entry payment.
          </p>

          {isRegistrationOpen ? (
            <button
              type="button"
              onClick={onOpenRegisterModal}
              className="w-full flex items-center justify-center gap-3 bg-[#E31B23] hover:bg-[#C2181F] text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-[#E31B23]/20 font-orbitron cursor-pointer"
            >
              <IconPlus size={18} />
              REGISTER YOUR CLUB
            </button>
          ) : (
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <p className="text-[11px] font-black uppercase text-white/50 font-orbitron">
                Registration Closed
              </p>
            </div>
          )}
        </div>

        {/* Venue Location */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron flex items-center gap-2">
            <IconMapPin size={16} className="text-[#E31B23]" /> VENUE LOCATION
          </h4>
          <div className="space-y-1">
            <p className="text-sm font-black text-white">{event.venueName || "Venue TBA"}</p>
            {event.venueAddress && <p className="text-xs text-white/50">{event.venueAddress}</p>}
          </div>
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-white/10 bg-black/50 p-4 text-center text-[10px] font-black uppercase tracking-widest text-[#00FF62] hover:bg-white/5 transition-all font-orbitron"
            >
              Open Map Preview
            </a>
          )}
        </div>

        {/* Tournament Organizer */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
            TOURNAMENT ORGANIZER
          </h4>
          <div className="space-y-3 text-xs text-white/70">
            <div className="flex items-center gap-2.5">
              <IconUser size={15} className="text-[#E31B23] shrink-0" />
              <span className="font-bold text-white truncate">{event.contactPerson || "Tournament Coordinator"}</span>
            </div>
            {event.contactPhone && (
              <div className="flex items-center gap-2.5">
                <IconPhone size={15} className="text-[#E31B23] shrink-0" />
                <span>{event.contactPhone}</span>
              </div>
            )}
            {event.contactEmail && (
              <div className="flex items-center gap-2.5">
                <IconMail size={15} className="text-[#E31B23] shrink-0" />
                <span className="truncate">{event.contactEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invitation Link */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-white/50 font-orbitron">
            INVITATION LINK
          </h4>
          <button
            type="button"
            onClick={onCopyInviteLink}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-wider text-[10px] py-3.5 px-4 rounded-xl transition-all font-orbitron cursor-pointer"
          >
            {copiedInvite ? (
              <>
                <IconCheck size={14} className="text-[#00FF62]" />
                INVITE LINK COPIED
              </>
            ) : (
              <>
                <IconCopy size={14} />
                COPY INVITE LINK
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

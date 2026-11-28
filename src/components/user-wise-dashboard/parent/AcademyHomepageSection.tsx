"use client";

import Image from "next/image";
import React from "react";
import {
  IconAlertCircle,
  IconBuildingCommunity,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconMicroscope,
  IconShieldCheck,
  IconStar,
  IconTarget,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetChildAcademyHomepageQuery } from "@/redux/features/parent/parentApi";

const fmtDate = (d?: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return d.split("T")[0];
  }
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 font-orbitron mb-3">
    {children}
  </h3>
);

const AcademyHomepageSection = () => {
  const { data, isLoading, isError } = useGetChildAcademyHomepageQuery();
  const hp = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-48 rounded-3xl bg-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-56 rounded-3xl bg-white/5" />
          <Skeleton className="h-56 rounded-3xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (isError || !hp) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-destructive justify-center border border-white/5 rounded-2xl bg-white/1">
        <IconAlertCircle className="size-4 shrink-0" />
        Could not load academy information.
      </div>
    );
  }

  const info = hp.academyInfo;
  const intro = hp.academyIntroduction;
  const coaches = hp.coachingStaff ?? hp.coaches ?? [];
  const sessions = (hp.trainingSessions ?? []).slice(0, 3);
  const matches = (hp.matches ?? []).slice(0, 3);
  const events = (hp.extraEvents ?? []).filter((e) => e.status === "OPEN" || e.status === "CLOSING SOON").slice(0, 3);
  const news = (hp.news ?? []).filter((n) => n.status === "PUBLISHED").slice(0, 2);
  const successStories = (hp.successStories ?? []).slice(0, 2);
  const teams = hp.teams ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Academy Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0D0D0D]/60 shadow-xl">
        {info?.coverPhoto && (
          <div className="absolute inset-0 opacity-15">
            <Image src={info.coverPhoto} alt="Academy cover" fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="relative z-10 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="shrink-0">
            {info?.logo ? (
              <Image
                src={info.logo}
                alt={info.name || "Academy"}
                width={80}
                height={80}
                unoptimized
                className="rounded-2xl border border-white/20 object-contain bg-black/60 p-1 size-20"
              />
            ) : (
              <div className="size-20 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center">
                <IconBuildingCommunity size={36} className="text-white/30" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron truncate">
              {info?.name || "Academy"}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 font-medium">
              {info?.location && (
                <span className="flex items-center gap-1.5">
                  <IconMapPin size={13} /> {info.location}
                </span>
              )}
              {info?.category && (
                <span className="flex items-center gap-1.5">
                  <IconShieldCheck size={13} /> {info.category}
                </span>
              )}
              {info?.league && (
                <span className="flex items-center gap-1.5">
                  <IconTrophy size={13} /> {info.league}
                </span>
              )}
            </div>
            {info?.description && (
              <p className="text-xs text-white/40 leading-relaxed line-clamp-2 max-w-2xl">
                {info.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 pt-1">
              {hp.meta?.teamsCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-white font-orbitron">{hp.meta.teamsCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Teams</span>
                </div>
              )}
              {hp.meta?.coachesCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-white font-orbitron">{hp.meta.coachesCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Coaches</span>
                </div>
              )}
              {hp.meta?.eventsCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-white font-orbitron">{hp.meta.eventsCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Events</span>
                </div>
              )}
              {hp.meta?.successStoriesCount != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-lg font-black text-white font-orbitron">{hp.meta.successStoriesCount}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Stories</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mission & Philosophy */}
        {(intro?.mission || intro?.philosophy) && (
          <div className="relative z-10 border-t border-white/5 px-6 md:px-8 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {intro?.mission && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <IconTarget size={12} /> Mission
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{intro.mission}</p>
              </div>
            )}
            {intro?.philosophy && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                  <IconMicroscope size={12} /> Philosophy
                </div>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-3">{intro.philosophy}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Teams + Coaching Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams */}
        {teams.length > 0 && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
            <SectionHeading>Teams ({teams.length})</SectionHeading>
            <div className="flex flex-col gap-2">
              {teams.slice(0, 6).map((team) => (
                <div key={team._id} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="flex items-center gap-2 min-w-0">
                    <IconUsers size={14} className="text-white/40 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{team.teamName}</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase">{team.ageGroup}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-[10px] text-white/50 font-bold">
                    <span>{team.playersCount}P</span>
                    <span>{team.coachesCount}C</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase ${team.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                      {team.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching Staff */}
        {coaches.length > 0 && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
            <SectionHeading>Coaching Staff</SectionHeading>
            <div className="flex flex-col gap-3">
              {coaches.map((coach) => (
                <div key={coach._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  {coach.profileImage ? (
                    <Image
                      src={coach.profileImage}
                      alt={coach.name}
                      width={40}
                      height={40}
                      unoptimized
                      className="size-10 rounded-full object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-white/10 border border-white/10 shrink-0 flex items-center justify-center">
                      <IconUser size={18} className="text-white/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{coach.name}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider truncate">{coach.title || coach.role}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-0.5">
                    {coach.licenseStatus && (
                      <span className="text-[9px] font-bold text-blue-400 truncate max-w-[100px]">{coach.licenseStatus}</span>
                    )}
                    {coach.yearsExperience != null && (
                      <span className="text-[9px] text-white/30 font-bold">{coach.yearsExperience}y exp</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Training Sessions + Upcoming Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Sessions */}
        {sessions.length > 0 && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
            <SectionHeading>Training Schedule</SectionHeading>
            <div className="flex flex-col gap-3">
              {sessions.map((s) => (
                <div key={s._id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-white leading-tight">{s.sessionTitle || s.sessionName}</p>
                    <span className="text-[9px] font-bold text-white/30 shrink-0">{fmtDate(s.sessionDate)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-white/40 font-bold">
                    {s.startTime && (
                      <span className="flex items-center gap-1">
                        <IconClock size={11} /> {s.startTime}{s.endTime ? ` – ${s.endTime}` : ""}
                      </span>
                    )}
                    {s.trainingLocation && (
                      <span className="flex items-center gap-1">
                        <IconMapPin size={11} /> {s.trainingLocation}
                      </span>
                    )}
                    {s.teamName && (
                      <span className="flex items-center gap-1">
                        <IconUsers size={11} /> {s.teamName}
                      </span>
                    )}
                  </div>
                  {s.focusArea && (
                    <span className="text-[9px] font-bold text-blue-400/80">Focus: {s.focusArea}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {matches.length > 0 && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
            <SectionHeading>Upcoming Matches</SectionHeading>
            <div className="flex flex-col gap-3">
              {matches.map((m) => (
                <div key={m._id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-white leading-tight truncate">{m.matchTitle}</p>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                      m.status === "LIVE" ? "bg-red-500/20 text-red-400" : "bg-white/5 text-white/40"
                    }`}>{m.status}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white/70 truncate">{m.ourTeamName}</span>
                    <span className="text-white/30 font-black shrink-0">vs</span>
                    <span className="font-bold text-white/70 truncate">{m.opponentTeam}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-white/40 font-bold">
                    <span className="flex items-center gap-1">
                      <IconCalendar size={11} /> {fmtDate(m.matchDate)}
                    </span>
                    {m.kickOffTime && <span className="flex items-center gap-1"><IconClock size={11} /> {m.kickOffTime}</span>}
                    {m.venueName && <span className="flex items-center gap-1"><IconMapPin size={11} /> {m.venueName}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Events + Success Stories */}
      {(events.length > 0 || successStories.length > 0 || news.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Events */}
          {events.length > 0 && (
            <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
              <SectionHeading>Open Events</SectionHeading>
              <div className="flex flex-col gap-3">
                {events.map((ev) => (
                  <div key={ev._id} className="p-3.5 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2 overflow-hidden relative">
                    {ev.bannerImage && (
                      <div className="absolute inset-0 opacity-10">
                        <Image src={ev.bannerImage} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="relative flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-white leading-tight">{ev.title || ev.eventName}</p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                        ev.status === "OPEN" ? "bg-emerald-500/20 text-emerald-400"
                        : ev.status === "CLOSING SOON" ? "bg-amber-500/20 text-amber-400"
                        : "bg-white/5 text-white/40"
                      }`}>{ev.status}</span>
                    </div>
                    <div className="relative flex flex-wrap gap-3 text-[10px] text-white/40 font-bold">
                      {ev.formattedDateRange && <span className="flex items-center gap-1"><IconCalendar size={11} /> {ev.formattedDateRange}</span>}
                      {ev.registrationFee != null && (
                        <span className="text-emerald-400 font-black">{ev.currency}{ev.registrationFee}</span>
                      )}
                      {ev.maxCapacity != null && (
                        <span>{ev.currentAttendees}/{ev.maxCapacity} registered</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest News / Success Stories */}
          <div className="flex flex-col gap-4">
            {news.length > 0 && (
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                <SectionHeading>Academy News</SectionHeading>
                <div className="flex flex-col gap-3">
                  {news.map((n) => (
                    <div key={n._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      {n.featuredImage ? (
                        <Image src={n.featuredImage} alt={n.title || n.articleTitle || ""} width={48} height={48} unoptimized
                          className="size-12 rounded-xl object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <IconStar size={18} className="text-white/20" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white leading-tight line-clamp-2">{n.title || n.articleTitle}</p>
                        <p className="text-[10px] text-white/40 font-bold mt-0.5">{n.formattedPublishDate || fmtDate(n.publishDate || n.date)}</p>
                        {n.excerpt && <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mt-0.5">{n.excerpt}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {successStories.length > 0 && (
              <div className="bg-[#0D0D0D]/60 border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col gap-4">
                <SectionHeading>Success Stories</SectionHeading>
                <div className="flex flex-col gap-3">
                  {successStories.map((s) => (
                    <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                      {s.photo ? (
                        <Image src={s.photo} alt={s.playerName} width={40} height={40} unoptimized
                          className="size-10 rounded-full object-cover border border-white/10 shrink-0" />
                      ) : (
                        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <IconTrophy size={16} className="text-amber-400/60" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{s.storyTitle}</p>
                        <p className="text-[10px] text-white/40 font-bold">{s.playerName} · {s.position}</p>
                      </div>
                      {s.category && (
                        <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full shrink-0 max-w-[80px] truncate">
                          {s.category}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademyHomepageSection;

"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  IconBuildingCommunity,
  IconCalendarEvent,
  IconMapPin,
  IconPhone,
  IconMail,
  IconBallFootball,
  IconClock,
  IconTrophy,
  IconNews,
  IconUsers,
  IconChevronRight,
  IconSparkles,
} from "@tabler/icons-react";
import { useGetMyAcademyHomepageQuery } from "@/redux/features/academy/academyApi";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const PlayerAcademySection = () => {
  const { data: homepageResponse, isLoading, isError, error } =
    useGetMyAcademyHomepageQuery();

  const [activeTab, setActiveTab] = useState<
    "overview" | "sessions" | "matches" | "events" | "staff" | "news"
  >("overview");

  // Handle 404 or missing academy profile gracefully
  const isNotFound =
    isError &&
    ((error as any)?.status === 404 ||
      (error as any)?.data?.statusCode === 404 ||
      (error as any)?.data?.message?.toLowerCase()?.includes("not found"));

  if (isNotFound) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="py-4 w-full">
        <div className="border border-white/10 rounded-2xl p-6 bg-black/40 animate-pulse flex flex-col gap-6">
          <div className="h-40 rounded-xl bg-white/5" />
          <div className="flex gap-3">
            <div className="h-8 w-24 rounded-lg bg-white/5" />
            <div className="h-8 w-24 rounded-lg bg-white/5" />
            <div className="h-8 w-24 rounded-lg bg-white/5" />
          </div>
          <div className="h-32 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  const homepageData = homepageResponse?.data;
  const academyInfo = homepageData?.academyInfo;

  if (!academyInfo) {
    return null;
  }

  const coverPhotoSrc = academyInfo.coverPhoto || "/placeholder_img.jpg";
  const logoSrc = academyInfo.logo || "/image 47.png";
  const trainingSessions =
    homepageData?.trainingSessions ||
    homepageData?.trainingInformation?.trainingSchedule ||
    [];
  const matches =
    homepageData?.matches ||
    homepageData?.trainingInformation?.matchSchedule ||
    [];
  const events = homepageData?.extraEvents || [];
  const coaches = homepageData?.coachingStaff || homepageData?.coaches || [];
  const newsList = homepageData?.news || [];
  const teams =
    homepageData?.teams ||
    homepageData?.trainingInformation?.ageGroups ||
    [];
  const introduction = homepageData?.academyIntroduction;

  return (
    <div className="py-4 w-full">
      <div className="border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xs shadow-xl flex flex-col gap-6">
        {/* Header Title with Academy Name */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <IconBuildingCommunity className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
                  {academyInfo.name || "My Academy"}
                </h2>
                <Badge variant="secondary" className="font-orbitron text-[10px]">
                  Affiliated Academy
                </Badge>
              </div>
              <p className="text-white/60 text-xs mt-0.5">
                Official presentation & active academy program
              </p>
            </div>
          </div>
          {academyInfo.league && (
            <Badge className="bg-primary text-black font-bold text-xs uppercase font-orbitron">
              {academyInfo.league}
            </Badge>
          )}
        </div>

        {/* Hero Card */}
        <div className="relative rounded-2xl overflow-hidden min-h-[220px] sm:min-h-[260px] border border-white/10 group flex flex-col justify-end p-4 sm:p-6">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${coverPhotoSrc}')` }}
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/75 to-black/30" />
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
            <div className="flex items-start sm:items-center gap-4">
              <div className="size-16 sm:size-20 rounded-2xl bg-black/60 border border-white/20 p-2 backdrop-blur-md shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                  src={logoSrc}
                  alt={academyInfo.name || "Academy Logo"}
                  width={80}
                  height={80}
                  className="size-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = "/placeholder_img.jpg";
                  }}
                />
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-xl sm:text-3xl font-black text-white font-orbitron uppercase tracking-tight truncate">
                  {academyInfo.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/70">
                  {academyInfo.category && (
                    <span className="text-primary font-bold">
                      {academyInfo.category}
                    </span>
                  )}
                  {academyInfo.location && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1">
                        <IconMapPin className="size-3.5 text-primary" />
                        {academyInfo.location}
                      </span>
                    </>
                  )}
                  {academyInfo.establishedDate && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1">
                        <IconCalendarEvent className="size-3.5 text-white/50" />
                        Est. {new Date(academyInfo.establishedDate).getFullYear()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div className="flex flex-col gap-1.5 text-xs text-white/80 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 shrink-0">
              {academyInfo.contactPhone && (
                <div className="flex items-center gap-2">
                  <IconPhone className="size-3.5 text-primary" />
                  <span className="font-mono text-[11px]">{academyInfo.contactPhone}</span>
                </div>
              )}
              {academyInfo.contactEmail && (
                <div className="flex items-center gap-2">
                  <IconMail className="size-3.5 text-primary" />
                  <span className="font-mono text-[11px] truncate max-w-[200px]">
                    {academyInfo.contactEmail}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer",
              activeTab === "overview"
                ? "bg-primary text-black"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            Overview
          </button>
          {trainingSessions.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "sessions"
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <IconClock className="size-3.5" />
              Training ({trainingSessions.length})
            </button>
          )}
          {matches.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("matches")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "matches"
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <IconBallFootball className="size-3.5" />
              Matches ({matches.length})
            </button>
          )}
          {events.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "events"
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <IconTrophy className="size-3.5" />
              Events ({events.length})
            </button>
          )}
          {coaches.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "staff"
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <IconUsers className="size-3.5" />
              Staff ({coaches.length})
            </button>
          )}
          {newsList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider font-orbitron transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                activeTab === "news"
                  ? "bg-primary text-black"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <IconNews className="size-3.5" />
              News ({newsList.length})
            </button>
          )}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-6">
            {/* Description */}
            {academyInfo.description && (
              <div className="bg-white/2 border border-white/5 p-4 sm:p-5 rounded-2xl">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {academyInfo.description}
                </p>
              </div>
            )}

            {/* Mission & Philosophy */}
            {introduction && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {introduction.mission && (
                  <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-orbitron flex items-center gap-1">
                      <IconSparkles className="size-3" /> Mission
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {introduction.mission}
                    </p>
                  </div>
                )}
                {introduction.philosophy && (
                  <div className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest font-orbitron flex items-center gap-1">
                      <IconSparkles className="size-3" /> Philosophy
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {introduction.philosophy}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <p className="text-lg sm:text-2xl font-black text-primary font-orbitron">
                  {teams.length}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Squads / Teams
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <p className="text-lg sm:text-2xl font-black text-white font-orbitron">
                  {coaches.length}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Coaches
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <p className="text-lg sm:text-2xl font-black text-primary font-orbitron">
                  {trainingSessions.length}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Weekly Drills
                </p>
              </div>
              <div className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-center">
                <p className="text-lg sm:text-2xl font-black text-white font-orbitron">
                  {matches.length}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  Scheduled Matches
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Training Sessions */}
        {activeTab === "sessions" && (
          <div className="flex flex-col gap-3">
            {trainingSessions.map((session, i) => (
              <div
                key={session._id || `sess-${i}`}
                className="bg-white/2 hover:bg-white/4 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <IconClock className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {session.sessionName || session.sessionTitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{session.trainingLocation || session.locationField || "Academy Field"}</span>
                      {session.sessionType && (
                        <>
                          <span>•</span>
                          <span className="text-primary">{session.sessionType}</span>
                        </>
                      )}
                      {session.teamName && (
                        <>
                          <span>•</span>
                          <span>{session.teamName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white font-orbitron">
                      {session.startTime} - {session.endTime}
                    </p>
                    {session.sessionDate && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(session.sessionDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Matches */}
        {activeTab === "matches" && (
          <div className="flex flex-col gap-3">
            {matches.map((match, i) => (
              <div
                key={match._id || `match-${i}`}
                className="bg-white/2 hover:bg-white/4 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                    <IconBallFootball className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {match.matchTitle || `${match.ourTeamName} vs ${match.opponentTeam}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{match.competitionName || "Tournament Match"}</span>
                      {match.venueName && (
                        <>
                          <span>•</span>
                          <span>{match.venueName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-xs font-bold text-white font-orbitron">
                      {match.kickOffTime || "Kickoff TBA"}
                    </p>
                    {match.matchDate && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(match.matchDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                    {match.homeOrAway || "SCHEDULED"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Events */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {events.map((event, i) => (
              <div
                key={event._id || `event-${i}`}
                className="bg-white/2 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all flex flex-col"
              >
                <div className="relative h-28 w-full bg-black/60">
                  <Image
                    src={event.bannerImage || "/placeholder_img.jpg"}
                    alt={event.eventName || event.title || "Event"}
                    fill
                    unoptimized
                    className="object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/70 text-primary border-primary/30 text-[10px] font-orbitron">
                      {event.currency || "$"}
                      {event.registrationFee ?? "Free"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">
                      {event.eventName || event.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                      {event.description || event.eventType}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/5">
                    <span>{event.formattedDateRange || "Upcoming"}</span>
                    <span>{event.venueName || event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Staff */}
        {activeTab === "staff" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {coaches.map((coach, i) => (
              <div
                key={coach._id || `coach-${i}`}
                className="bg-white/2 border border-white/5 p-3.5 rounded-xl flex items-center gap-3"
              >
                <div className="size-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden shrink-0">
                  <Image
                    src={coach.profileImage || "/placeholder_img.jpg"}
                    alt={coach.name}
                    width={48}
                    height={48}
                    className="size-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{coach.name}</p>
                  <p className="text-[10px] text-primary uppercase font-semibold truncate">
                    {coach.title || coach.role || "Coach"}
                  </p>
                  {coach.licenseStatus && (
                    <p className="text-[9px] text-gray-400 truncate">
                      {coach.licenseStatus}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 6: News */}
        {activeTab === "news" && (
          <div className="flex flex-col gap-3">
            {newsList.map((item, i) => (
              <div
                key={item._id || `news-${i}`}
                className="bg-white/2 hover:bg-white/4 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {item.articleTitle || item.title}
                  </h4>
                  <Badge variant="secondary" className="text-[9px]">
                    {item.category || "News"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2">
                  {item.fullArticle || item.excerpt || item.content}
                </p>
                <p className="text-[10px] text-gray-500 font-mono mt-1">
                  {item.formattedPublishDate || "Recent update"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


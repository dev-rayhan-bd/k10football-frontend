"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconAlertTriangle, IconRefresh, IconTrophy } from "@tabler/icons-react";

import {
  extraEventApi,
  getExtraEventApiError,
  unwrapList,
  useGetEventBadgePresetsQuery,
  useGetEventFixturesQuery,
  useGetEventPublicPortalQuery,
  useGetEventRegisteredClubsQuery,
} from "@/redux/features/extraEvent/extraEventApi";
import type { IBadgePreset, IEventFixture, IRegisteredClub } from "@/types/extraEvent.type";

import PublicTournamentHeader from "@/components/tournament/PublicTournamentHeader";
import PublicTournamentHero from "@/components/tournament/PublicTournamentHero";
import PublicTournamentInfoCards from "@/components/tournament/PublicTournamentInfoCards";
import PublicTournamentDetailsAndClubs from "@/components/tournament/PublicTournamentDetailsAndClubs";
import PublicTournamentArena from "@/components/tournament/PublicTournamentArena";
import PublicTournamentFooter from "@/components/tournament/PublicTournamentFooter";
import {
  buildTeamLookup,
  normalizeBracket,
  normalizeMatches,
  normalizeStandings,
} from "@/components/tournament/tournament.utils";

const LIVE_POLL_MS = 30_000;

const PublicTournamentLivePage = () => {
  const params = useParams<{ id: string | string[] }>();
  const eventId = (Array.isArray(params?.id) ? params.id[0] : params?.id) ?? "";

  // Read the cached portal first so polling only runs while the last response says isLiveMode.
  const { data: cachedPortal } = extraEventApi.endpoints.getEventPublicPortal.useQueryState(eventId, {
    skip: !eventId,
  });
  const pollWhileLive = cachedPortal?.data?.eventInfo?.isLiveMode === true;

  const portalQuery = useGetEventPublicPortalQuery(eventId, {
    skip: !eventId,
    pollingInterval: pollWhileLive ? LIVE_POLL_MS : 0,
  });
  const { data, error, isLoading, isFetching, refetch, fulfilledTimeStamp } = portalQuery;

  const portal = data?.data;
  const event = portal?.eventInfo;
  const portalFixtures = useMemo(() => unwrapList<IEventFixture>(portal?.arena?.fixtures, ["fixtures"]), [portal]);

  // Fallback: the dedicated fixtures endpoint when the portal's arena has none.
  const needFixtureFallback = !!event && portalFixtures.length === 0 && event.tournamentStatus !== "REGISTRATION";
  const { data: fixturesRes } = useGetEventFixturesQuery(eventId, {
    skip: !eventId || !needFixtureFallback,
    pollingInterval: pollWhileLive ? LIVE_POLL_MS : 0,
  });
  const { data: presetsRes } = useGetEventBadgePresetsQuery(eventId, { skip: !eventId || !event });

  const portalClubs = useMemo(
    () =>
      unwrapList<IRegisteredClub>(
        portal?.registeredClubs ?? (portal as Record<string, unknown> | undefined)?.clubs ?? event?.registeredClubs,
        ["clubs", "registeredClubs"]
      ),
    [portal, event]
  );
  const { data: clubsRes, isLoading: isClubsLoading } = useGetEventRegisteredClubsQuery(eventId, {
    skip: !eventId || !event || portalClubs.length > 0,
  });
  const registeredClubs = useMemo(
    () => (portalClubs.length > 0 ? portalClubs : unwrapList<IRegisteredClub>(clubsRes?.data, ["clubs", "registeredClubs"])),
    [portalClubs, clubsRes]
  );

  const rawFixtures = useMemo(
    () =>
      portalFixtures.length > 0
        ? portalFixtures
        : needFixtureFallback
          ? unwrapList<IEventFixture>(fixturesRes?.data, ["fixtures", "matches"])
          : [],
    [portalFixtures, needFixtureFallback, fixturesRes]
  );
  const presets = useMemo(() => unwrapList<IBadgePreset>(presetsRes?.data, ["presets", "badges"]), [presetsRes]);

  const view = useMemo(() => {
    const standingsRaw = portal?.arena?.standings;
    const lookup = buildTeamLookup(standingsRaw, rawFixtures);
    const matches = normalizeMatches(rawFixtures, lookup);
    const standings = normalizeStandings(standingsRaw, lookup);
    const bracket = normalizeBracket(portal?.arena?.bracket ?? portal?.bracket ?? null, lookup, matches);
    return { matches, standings, bracket };
  }, [portal, rawFixtures]);

  const [copied, setCopied] = useState(false);
  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context / permissions); leave the button as is.
    }
  };

  // Loading
  if (eventId && (isLoading || (!data && !error))) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col">
        <PublicTournamentHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center flex flex-col items-center gap-4">
            <div className="size-12 border-4 border-t-[#E31B23] border-white/10 rounded-full animate-spin" />
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading Tournament...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error / not found
  if (!event) {
    const { status, message } = getExtraEventApiError(error, "This tournament could not be loaded.");
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-white flex flex-col">
        <PublicTournamentHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center gap-4">
            <IconAlertTriangle size={40} className="text-[#E31B23]" />
            <h1 className="text-xl font-black uppercase font-orbitron">
              {status === 404 || (!error && !event) ? "Tournament Not Found" : "Something Went Wrong"}
            </h1>
            <p className="text-sm text-white/50">{error ? message : "This tournament does not exist or is no longer public."}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {status !== 404 && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#E31B23]/90 text-white font-black uppercase tracking-wider text-[10px] py-3 px-5 rounded-xl font-orbitron cursor-pointer"
                >
                  <IconRefresh size={14} /> Try Again
                </button>
              )}
              <Link
                href="/"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold uppercase tracking-wider text-[10px] py-3 px-5 rounded-xl"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRegistration = (event.tournamentStatus || "REGISTRATION").toUpperCase() === "REGISTRATION";
  const hasArenaData =
    view.matches.length > 0 ||
    view.standings.groupA.length > 0 ||
    view.standings.groupB.length > 0 ||
    view.bracket.semis.length > 0 ||
    !!view.bracket.final;
  const lastUpdated = fulfilledTimeStamp
    ? new Date(fulfilledTimeStamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : undefined;

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white">
      <PublicTournamentHeader tournamentStatus={event.tournamentStatus} isLive={event.isLiveMode} />

      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-8">
        <PublicTournamentHero
          event={event}
          copied={copied}
          onCopyLink={handleCopyLink}
          onRefresh={() => refetch()}
          refreshing={isFetching}
          lastUpdated={lastUpdated}
        />

        <PublicTournamentInfoCards event={event} />

        <PublicTournamentDetailsAndClubs
          event={event}
          clubs={registeredClubs}
          presets={presets}
          isLoadingClubs={isClubsLoading && portalClubs.length === 0}
        />

        {isRegistration && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center flex flex-col items-center gap-3">
            <IconTrophy size={40} className="text-amber-400" />
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Registration Open</h3>
            <p className="text-sm text-white/50 max-w-md">
              Teams can still sign up. Live scores, standings and the knockout bracket will appear here once the
              tournament begins.
            </p>
            {event.canRegister !== false && (
              <Link
                href={`/events/${eventId}`}
                className="mt-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-6 rounded-xl font-orbitron shadow-lg shadow-amber-500/20"
              >
                Register a Team
              </Link>
            )}
          </div>
        )}

        {(!isRegistration || hasArenaData) && (
          <PublicTournamentArena
            tournamentStatus={event.tournamentStatus}
            isLive={event.isLiveMode}
            standings={view.standings}
            matches={view.matches}
            bracket={view.bracket}
            presets={presets}
          />
        )}

        <PublicTournamentFooter event={event} />
      </div>
    </div>
  );
};

export default PublicTournamentLivePage;

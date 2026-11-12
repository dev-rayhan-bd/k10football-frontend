/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  getStoredEvents, 
  saveStoredEvents,
  TOURNAMENT_PRESET_LOGOS, 
  CLUB_PRESET_LOGOS 
} from "@/components/user-wise-dashboard/academy-management/ExtraEvents";
import { 
  useGetExtraEventsQuery,
  useGetSingleExtraEventQuery,
  useGetRegisteredClubsForExtraEventQuery,
  useGetClubPlayerRosterQuery,
  useRegisterClubForExtraEventMutation,
  useAllocateTournamentGroupsMutation,
  useStartTournamentMutation,
  useGetTournamentArenaQuery,
} from "@/redux/features/academy/academyApi";
import { 
  IconCurrencyDollar, 
  IconUsers, 
  IconMapPin, 
  IconArrowLeft, 
  IconCopy, 
  IconCheck, 
  IconPhone, 
  IconMail, 
  IconUser,
  IconStar,
  IconPlus,
  IconTrash,
  IconBallFootball,
  IconCreditCard,
  IconTrophy,
  IconDeviceGamepad,
  IconShield,
  IconUpload,
  IconChevronDown,
  IconCalendarEvent,
  IconEye,
  IconTable,
  IconCrown,
  IconSearch,
  IconSparkles,
  IconActivity,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "sonner";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { Skeleton } from "@/components/ui/skeleton";

const EventDetailPageSkeleton = () => (
  <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 animate-pulse">
    {/* DEMO ROLE SWITCHER BAR SKELETON */}
    <div className="bg-[#161618] border border-white/10 rounded-3xl p-5 flex flex-col lg:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3.5 w-full lg:w-auto">
        <Skeleton className="size-10 rounded-2xl bg-white/10 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-4 w-48 bg-white/10 rounded" />
          <Skeleton className="h-3 w-64 bg-white/5 rounded" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-9 w-32 bg-white/10 rounded-xl" />
        <Skeleton className="h-9 w-40 bg-white/5 rounded-xl" />
        <Skeleton className="h-9 w-44 bg-white/5 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-32 bg-white/10 rounded-xl shrink-0" />
    </div>

    {/* Back navigation skeleton */}
    <Skeleton className="h-4 w-28 bg-white/10 rounded" />

    {/* Main Grid: Flyer + Sidebar */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Main Flyer Box Skeleton */}
      <div className="lg:col-span-2 bg-[#111] rounded-4xl border border-white/10 overflow-hidden flex flex-col p-8 md:p-12 gap-8">
        <div className="flex flex-col md:flex-row gap-8 items-center border-b border-white/5 pb-8">
          <Skeleton className="size-32 md:size-36 rounded-3xl bg-white/10 shrink-0" />
          <div className="flex flex-col gap-3 w-full">
            <Skeleton className="h-6 w-32 rounded-xl bg-white/10" />
            <Skeleton className="h-10 w-3/4 rounded-xl bg-white/15" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-32 rounded-xl bg-white/10" />
              <Skeleton className="h-7 w-28 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-24 rounded-3xl bg-white/5" />
          <Skeleton className="h-24 rounded-3xl bg-white/5" />
          <Skeleton className="h-24 rounded-3xl bg-white/5" />
        </div>

        <div className="flex flex-col gap-3 bg-white/5 p-6 rounded-3xl">
          <Skeleton className="h-4 w-48 bg-white/10 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 bg-white/10 rounded-xl" />
            <Skeleton className="h-8 w-16 bg-white/10 rounded-xl" />
            <Skeleton className="h-8 w-16 bg-white/10 rounded-xl" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-44 bg-white/10 rounded" />
          <Skeleton className="h-4 w-full bg-white/5 rounded" />
          <Skeleton className="h-4 w-5/6 bg-white/5 rounded" />
          <Skeleton className="h-4 w-4/6 bg-white/5 rounded" />
        </div>
      </div>

      {/* Sidebar Info Card Skeleton */}
      <div className="flex flex-col gap-6">
        <div className="bg-[#1C1C1C] border border-white/10 rounded-4xl p-8 flex flex-col gap-4">
          <Skeleton className="h-6 w-44 bg-white/10 rounded" />
          <Skeleton className="h-3 w-full bg-white/5 rounded" />
          <Skeleton className="h-3 w-4/5 bg-white/5 rounded" />
          <Skeleton className="h-12 w-full bg-white/10 rounded-2xl mt-2" />
        </div>

        <div className="bg-[#111] border border-white/10 rounded-4xl p-6 flex flex-col gap-3">
          <Skeleton className="h-4 w-32 bg-white/10 rounded" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-2xl" />
        </div>

        <div className="bg-[#111] border border-white/10 rounded-4xl p-6 flex flex-col gap-3">
          <Skeleton className="h-4 w-36 bg-white/10 rounded" />
          <Skeleton className="h-4 w-48 bg-white/5 rounded" />
          <Skeleton className="h-4 w-40 bg-white/5 rounded" />
        </div>
      </div>

      {/* Participating Clubs Section Skeleton */}
      <div className="lg:col-span-3 w-full bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-6 rounded-full bg-white/10" />
            <Skeleton className="h-6 w-56 bg-white/10 rounded" />
            <Skeleton className="h-5 w-24 bg-white/10 rounded-full" />
          </div>
          <Skeleton className="h-9 w-36 bg-white/10 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-3xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full bg-white/10 shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-white/10 rounded" />
                  <Skeleton className="h-3 w-1/2 bg-white/5 rounded" />
                </div>
              </div>
              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                <Skeleton className="h-5 w-24 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const EventDetailPage = () => {
  const params = useParams();
  const rawId = String(params?.id || "");
  const eventId = rawId;

  // RTK Query: Fetch real event from API (single event or events list)
  const { data: singleEventResponse, isLoading: isSingleLoading } = useGetSingleExtraEventQuery(rawId, {
    skip: !rawId,
  });
  const { data: eventsResponse, isLoading: isEventsLoading } = useGetExtraEventsQuery();

  // RTK Query: Fetch registered clubs for this event
  const { data: registeredClubsResponse, isLoading: isRegisteredClubsLoading } = useGetRegisteredClubsForExtraEventQuery(rawId, {
    skip: !rawId,
  });

  // States
  const [event, setEvent] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [previewRole, setPreviewRole] = useState<"invited_club" | "owner_admin" | "spectator_parent">("invited_club");

  // Tournament State (Dynamically loaded from API/storage)
  const [teams, setTeams] = useState<any[]>([]);
  const [status, setStatus] = useState<"registration" | "live" | "completed">("registration");
  const [groupA, setGroupA] = useState<string[]>([]);
  const [groupB, setGroupB] = useState<string[]>([]);

  const registeredClubsData = registeredClubsResponse?.data;
  const totalRegisteredClubs = registeredClubsData?.totalRegistered ?? teams.length;
  const maxClubsCapacity = registeredClubsData?.maxCapacity || event?.maxCapacity || 8;

  // Fixtures and Bracket
const [groupFixtures, setGroupFixtures] = useState<any[]>([]);
const [semis, setSemis] = useState<any[]>([]);
const [final, setFinal] = useState<any>(null);

// Form 2 (Club Registration Modal) State
const [showRegModal, setShowRegModal] = useState(false);
const [regClubName, setRegClubName] = useState("");
const [regClubLogo, setRegClubLogo] = useState(CLUB_PRESET_LOGOS[0].id);
const [regCustomLogo, setRegCustomLogo] = useState("");
const [regContactName, setRegContactName] = useState("");
const [regContactPhone, setRegContactPhone] = useState("");
const [regContactEmail, setRegContactEmail] = useState("");
const [regCoachName, setRegCoachName] = useState("");
const [regCategory, setRegCategory] = useState("");
const [regPlayers, setRegPlayers] = useState<Array<{ name: string; dob: string; shirt: string }>>([
{ name: "", dob: "", shirt: "" },
{ name: "", dob: "", shirt: "" },
{ name: "", dob: "", shirt: "" }
]);

// Registration & Payment state
const [regCustomLogoFile, setRegCustomLogoFile] = useState<File | null>(null);
const [registerClub, { isLoading: isRegisteringClub }] = useRegisterClubForExtraEventMutation();
const [allocateTournamentGroups, { isLoading: isAllocatingGroups }] = useAllocateTournamentGroupsMutation();
const [startTournament, { isLoading: isStartingTournament }] = useStartTournamentMutation();
const [isSuccess, setIsSuccess] = useState(false);

// Unallocated teams
const unallocatedTeams = teams.filter((t) => !groupA.includes(t.id) && !groupB.includes(t.id));

// Roster View sub-modal
const [selectedRosterTeam, setSelectedRosterTeam] = useState<any>(null);

const selectedClubId = String(
  selectedRosterTeam?.clubId || selectedRosterTeam?.id || selectedRosterTeam?._id || ""
);

// RTK Query: Fetch club player roster for the selected club
const { 
  data: clubRosterResponse, 
  isLoading: isRosterLoading,
  isFetching: isRosterFetching
} = useGetClubPlayerRosterQuery(
  { eventId: rawId, clubId: selectedClubId },
  { skip: !rawId || !selectedClubId || !selectedRosterTeam }
);

const clubRosterData = clubRosterResponse?.data;
const activeClub = clubRosterData?.club || (clubRosterData && !Array.isArray(clubRosterData) ? clubRosterData : null) || selectedRosterTeam;
const activeRosterList: any[] = 
  clubRosterData?.roster || 
  clubRosterData?.players || 
  (Array.isArray(clubRosterData) ? clubRosterData : null) || 
  selectedRosterTeam?.players || 
  selectedRosterTeam?.roster || 
  [];

// Dynamic API event resolution
const apiEvent = 
  singleEventResponse?.data?.event ||
  singleEventResponse?.data ||
  eventsResponse?.data?.events?.find(
    (e: any) => String(e._id) === rawId || String(e.id) === rawId
  );

// Load dynamic event details & registered teams
useEffect(() => {
  if (!rawId) return;

  if (apiEvent) {
    const rawFee = apiEvent.registrationFee;
    const currencySymbol = apiEvent.currency || "$";
    const feeDisplay = apiEvent.feeFormatted || 
      (rawFee !== undefined && rawFee !== null
        ? (Number(rawFee) === 0 ? "Free" : `${currencySymbol} ${rawFee}`)
        : "Free");

    setEvent({
      ...apiEvent,
      id: apiEvent._id || rawId,
      title: apiEvent.eventName || "Extra Event",
      date: apiEvent.formattedDate || (apiEvent.eventDate ? new Date(apiEvent.eventDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "TBA"),
      fee: feeDisplay,
      registrationFee: rawFee ?? 0,
      currency: currencySymbol,
      enrolled: apiEvent.capacityRatio || (apiEvent.maxCapacity ? `${apiEvent.currentAttendees || 0}/${apiEvent.maxCapacity}` : `${apiEvent.currentAttendees || 0} Registered`),
      status: apiEvent.statusBadge?.label || apiEvent.status || "Open",
      group: apiEvent.group || "",
      ageGroup: apiEvent.ageGroup || "",
      targetGroup: apiEvent.targetAttendees || "Academy Players Only",
      eventType: apiEvent.eventType || "tournament",
      venueName: apiEvent.venueName || "",
      address: apiEvent.venueAddress || "",
      description: apiEvent.description || "",
      requirements: apiEvent.requirements || "",
      contactName: apiEvent.contactPerson || "",
      contactPhone: apiEvent.contactPhone || "",
      contactEmail: apiEvent.contactEmail || "",
      bannerImage: apiEvent.bannerImage || "",
    });

    // Populate registered teams directly from API if present
    const apiClubs = apiEvent.clubs || apiEvent.registeredClubs || apiEvent.teams;
    if (Array.isArray(apiClubs) && apiClubs.length > 0) {
      const dynamicTeams = apiClubs.map((c: any) => ({
        id: c._id || c.clubId || c.id,
        name: c.clubName || c.name,
        logoId: c.badgePreset || c.logoId || "club-badge-1",
        customLogo: c.logoUrl || c.customLogo || "",
        coachName: c.coachName || "",
        contactName: c.contactPerson || c.contactName || "",
        contactEmail: c.contactEmail || "",
        contactPhone: c.contactPhone || "",
        category: c.category || "",
        players: (c.roster || []).map((p: any) => ({
          name: p.fullName || p.name,
          dob: p.dateOfBirth || "",
          shirt: String(p.shirtNo || p.shirt || "")
        }))
      }));
      setTeams(dynamicTeams);
    }
  }

  // Load registered teams from storage (cleaning out legacy mock teams)
  const storedTeams = localStorage.getItem(`k10_tournament_teams_${rawId}`);
  if (storedTeams) {
    try {
      const parsed = JSON.parse(storedTeams);
      const realTeams = parsed.filter((t: any) => 
        !t.id?.startsWith("team-santos") && 
        !t.id?.startsWith("team-flamengo") && 
        !t.id?.startsWith("team-palmeiras") && 
        !t.id?.startsWith("team-saopaulo") && 
        !t.id?.startsWith("team-corinthians") && 
        !t.id?.startsWith("team-fluminense") && 
        !t.id?.startsWith("team-vasco") && 
        !t.id?.startsWith("team-chelsea")
      );
      if (realTeams.length > 0) {
        setTeams(realTeams);
      }
    } catch {
      // ignore
    }
  }

  // Load status
  const storedStatus = localStorage.getItem(`k10_tournament_status_${rawId}`);
  if (storedStatus) {
    setStatus(storedStatus as any);
  } else {
    setStatus("registration");
  }

  // Load groups
  const storedGroupA = localStorage.getItem(`k10_tournament_group_a_${rawId}`);
  const storedGroupB = localStorage.getItem(`k10_tournament_group_b_${rawId}`);
  if (storedGroupA && storedGroupB) {
    try {
      setGroupA(JSON.parse(storedGroupA));
      setGroupB(JSON.parse(storedGroupB));
    } catch {
      setGroupA([]);
      setGroupB([]);
    }
  }

  // Load fixtures/standings
  const storedFixtures = localStorage.getItem(`k10_tournament_fixtures_${rawId}`);
  const storedSemis = localStorage.getItem(`k10_tournament_semis_${rawId}`);
  const storedFinal = localStorage.getItem(`k10_tournament_final_${rawId}`);
  if (storedFixtures) {
    try { setGroupFixtures(JSON.parse(storedFixtures)); } catch {}
  }
  if (storedSemis) {
    try { setSemis(JSON.parse(storedSemis)); } catch {}
  }
  if (storedFinal) {
    try { setFinal(JSON.parse(storedFinal)); } catch {}
  }
}, [rawId, apiEvent]);

// Synchronize registered clubs from tournament clubs API
useEffect(() => {
  const candidateClubs: any[] = [
    ...(registeredClubsResponse?.data?.clubs || []),
    ...(registeredClubsResponse?.data?.groupA || []),
    ...(registeredClubsResponse?.data?.groupB || []),
    ...(registeredClubsResponse?.data?.unallocated || []),
    ...(Array.isArray(registeredClubsResponse?.data) ? registeredClubsResponse.data : [])
  ];

  if (candidateClubs.length > 0) {
    const seenIds = new Set<string>();
    const uniqueClubs: any[] = [];

    candidateClubs.forEach((c: any) => {
      const cid = String(c._id || c.clubId || c.id || "");
      if (cid && !seenIds.has(cid)) {
        seenIds.add(cid);
        uniqueClubs.push(c);
      }
    });

    const mapped = uniqueClubs.map((c: any) => ({
      id: String(c._id || c.clubId || c.id),
      clubId: String(c.clubId || c._id || c.id),
      _id: String(c._id || c.clubId || c.id),
      name: c.clubName || c.name || "Unnamed Club",
      category: c.category || "U-16",
      badgePreset: c.badgePreset,
      badgeName: c.badgeName,
      logoUrl: c.logoUrl,
      customLogo: c.logoUrl,
      logoId: c.badgePreset || "club-badge-1",
      coachName: c.coachName || "",
      contactName: c.contactPerson || c.contactName || c.coachName || "N/A",
      contactPerson: c.contactPerson || c.contactName || c.coachName || "N/A",
      contactPhone: c.contactPhone || "",
      contactEmail: c.contactEmail || "",
      paymentStatus: c.paymentStatus || "PENDING",
      paidAmount: c.paidAmount ?? 0,
      allocatedGroup: c.allocatedGroup || null,
      registeredAt: c.registeredAt || null,
      players: (c.roster || []).map((p: any) => ({
        name: p.fullName || p.name || "",
        dob: p.dateOfBirth || "",
        shirt: String(p.shirtNo ?? p.shirt ?? "")
      })),
      roster: c.roster || []
    }));

    setTeams(mapped);

    const apiGroupA = (registeredClubsResponse?.data?.groupA || []).map((c: any) => String(c._id || c.clubId || c.id));
    const apiGroupB = (registeredClubsResponse?.data?.groupB || []).map((c: any) => String(c._id || c.clubId || c.id));

    uniqueClubs.forEach((c: any) => {
      const cid = String(c._id || c.clubId || c.id);
      const grp = String(c.allocatedGroup || "").toUpperCase();
      if ((grp === "GROUP A" || grp === "A") && !apiGroupA.includes(cid)) {
        apiGroupA.push(cid);
      } else if ((grp === "GROUP B" || grp === "B") && !apiGroupB.includes(cid)) {
        apiGroupB.push(cid);
      }
    });

    if (apiGroupA.length > 0) {
      setGroupA(apiGroupA);
    }
    if (apiGroupB.length > 0) {
      setGroupB(apiGroupB);
    }
  }
}, [registeredClubsResponse]);

const handleCopyLink = () => {
  if (typeof window !== "undefined") {
    const url = `${window.location.origin}/tournament/live/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Public tournament link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }
};

// Move team to group A
const handleAssignToGroupA = (teamId: string) => {
  if (groupA.length >= 4) {
    toast.error("Group A already has the maximum 4 clubs.");
    return;
  }
  const nextA = [...groupA.filter((id) => id !== teamId), teamId];
  const nextB = groupB.filter((id) => id !== teamId);
  setGroupA(nextA);
  setGroupB(nextB);
  localStorage.setItem(`k10_tournament_group_a_${rawId}`, JSON.stringify(nextA));
  localStorage.setItem(`k10_tournament_group_b_${rawId}`, JSON.stringify(nextB));
};

// Move team to group B
const handleAssignToGroupB = (teamId: string) => {
  if (groupB.length >= 4) {
    toast.error("Group B already has the maximum 4 clubs.");
    return;
  }
  const nextB = [...groupB.filter((id) => id !== teamId), teamId];
  const nextA = groupA.filter((id) => id !== teamId);
  setGroupA(nextA);
  setGroupB(nextB);
  localStorage.setItem(`k10_tournament_group_a_${rawId}`, JSON.stringify(nextA));
  localStorage.setItem(`k10_tournament_group_b_${rawId}`, JSON.stringify(nextB));
};

// Unallocate team
const handleUnallocateTeam = (teamId: string) => {
  const nextA = groupA.filter((id) => id !== teamId);
  const nextB = groupB.filter((id) => id !== teamId);
  setGroupA(nextA);
  setGroupB(nextB);
  localStorage.setItem(`k10_tournament_group_a_${rawId}`, JSON.stringify(nextA));
  localStorage.setItem(`k10_tournament_group_b_${rawId}`, JSON.stringify(nextB));
};

// Auto-allocate unallocated teams
const handleAutoAllocate = () => {
  const currentA = [...groupA];
  const currentB = [...groupB];
  const unallocated = teams.filter((t) => !currentA.includes(t.id) && !currentB.includes(t.id));

  if (unallocated.length === 0) {
    toast.info("All registered clubs are already allocated.");
    return;
  }

  unallocated.forEach((team) => {
    if (currentA.length < 4) {
      currentA.push(team.id);
    } else if (currentB.length < 4) {
      currentB.push(team.id);
    }
  });

  setGroupA(currentA);
  setGroupB(currentB);
  localStorage.setItem(`k10_tournament_group_a_${rawId}`, JSON.stringify(currentA));
  localStorage.setItem(`k10_tournament_group_b_${rawId}`, JSON.stringify(currentB));
  toast.success("Clubs automatically allocated between Group A and Group B. Remember to save allocations!");
};

// Save allocations to API
const handleSaveAllocations = async () => {
  if (groupA.length === 0 && groupB.length === 0) {
    toast.error("Please allocate at least one club to Group A or Group B.");
    return;
  }

  try {
    const allocations = [
      ...groupA.map((id) => ({ _id: id, group: "GROUP A" })),
      ...groupB.map((id) => ({ _id: id, group: "GROUP B" })),
    ];

    await allocateTournamentGroups({
      eventId: rawId,
      allocations,
    }).unwrap();
  } catch {
    // Error handled in onQueryStarted
  }
};

const handleGoLive = async () => {
if (groupA.length !== 4 || groupB.length !== 4) {
  toast.error("Please allocate exactly 4 teams to Group A and 4 teams to Group B before starting.");
  return;
}

try {
  // 1. Persist group allocations to backend
  const allocations = [
    ...groupA.map((id) => ({ _id: id, group: "GROUP A" })),
    ...groupB.map((id) => ({ _id: id, group: "GROUP B" })),
  ];
  await allocateTournamentGroups({
    eventId: rawId,
    allocations,
  }).unwrap();

  // 2. Call Start Tournament & Generate Fixtures API
  const startRes = await startTournament(rawId).unwrap();
  const serverFixtures = 
    startRes?.data?.fixtures || 
    startRes?.data?.tournament?.fixtures || 
    startRes?.data?.groupFixtures || 
    startRes?.fixtures;

  if (Array.isArray(serverFixtures) && serverFixtures.length > 0) {
    setGroupFixtures(serverFixtures);
    localStorage.setItem(`k10_tournament_fixtures_${eventId}`, JSON.stringify(serverFixtures));
  }
} catch {
  // handled in onQueryStarted
}

const newFixtures: any[] = [];
let matchId = 1;

// Group A round-robin
for (let i = 0; i < groupA.length; i++) {
  for (let j = i + 1; j < groupA.length; j++) {
    newFixtures.push({
      id: matchId++,
      team1Id: groupA[i],
      team2Id: groupA[j],
      score1: null,
      score2: null,
      group: "Group A",
      round: "Group Stage",
      status: "Scheduled",
      pitch: `Pitch ${String.fromCharCode(65 + ((matchId - 1) % (event?.numberOfPitches || 6)))}`,
      date: event?.date || "Day 1",
      time: `${10 + ((matchId - 1) % 4)}:${(matchId % 2 === 0) ? '00' : '30'}`
    });
  }
}

// Group B round-robin
for (let i = 0; i < groupB.length; i++) {
  for (let j = i + 1; j < groupB.length; j++) {
    newFixtures.push({
      id: matchId++,
      team1Id: groupB[i],
      team2Id: groupB[j],
      score1: null,
      score2: null,
      group: "Group B",
      round: "Group Stage",
      status: "Scheduled",
      pitch: `Pitch ${String.fromCharCode(65 + ((matchId - 1) % (event?.numberOfPitches || 6)))}`,
      date: event?.date || "Day 1",
      time: `${10 + ((matchId - 1) % 4)}:${(matchId % 2 === 0) ? '30' : '00'}`
    });
  }
}

// Semifinals
const initialSemis = [
  {
    id: matchId++,
    team1Id: "winner-a",
    team2Id: "runner-b",
    team1Placeholder: "Winner Group A",
    team2Placeholder: "Runner-up Group B",
    score1: null,
    score2: null,
    round: "Semifinal 1",
    status: "Scheduled",
    pitch: "Pitch A",
    date: event?.date || "Day 2",
    time: "14:00"
  },
  {
    id: matchId++,
    team1Id: "winner-b",
    team2Id: "runner-a",
    team1Placeholder: "Winner Group B",
    team2Placeholder: "Runner-up Group A",
    score1: null,
    score2: null,
    round: "Semifinal 2",
    status: "Scheduled",
    pitch: "Pitch B",
    date: event?.date || "Day 2",
    time: "15:30"
  }
];

const initialFinal = {
  id: matchId++,
  team1Id: "semi-1",
  team2Id: "semi-2",
  team1Placeholder: "Winner Semifinal 1",
  team2Placeholder: "Winner Semifinal 2",
  score1: null,
  score2: null,
  round: "Grand Final",
  status: "Scheduled",
  pitch: "Pitch A",
  date: event?.date || "Day 3",
  time: "16:00"
};

setStatus("live");
localStorage.setItem(`k10_tournament_status_${eventId}`, "live");

setGroupFixtures((prev) => (prev && prev.length > 0 ? prev : newFixtures));
localStorage.setItem(`k10_tournament_fixtures_${eventId}`, JSON.stringify(newFixtures));

setSemis(initialSemis);
localStorage.setItem(`k10_tournament_semis_${eventId}`, JSON.stringify(initialSemis));

setFinal(initialFinal);
localStorage.setItem(`k10_tournament_final_${eventId}`, JSON.stringify(initialFinal));

toast.success("Tournament is now Live! Group stage fixtures generated.");
};

const handleResetTournament = () => {
setStatus("registration");
localStorage.removeItem(`k10_tournament_status_${eventId}`);
localStorage.removeItem(`k10_tournament_fixtures_${eventId}`);
localStorage.removeItem(`k10_tournament_semis_${eventId}`);
localStorage.removeItem(`k10_tournament_final_${eventId}`);
setGroupFixtures([]);
setSemis([]);
setFinal(null);
toast.info("Tournament reset to registration phase.");
};

// Standings computer
const calculateStandingsForList = (fixturesList: any[], grpName: string) => {
const grpTeams = grpName === "Group A" ? groupA : groupB;
const stats: { [key: string]: any } = {};

grpTeams.forEach((tId) => {
  stats[tId] = { id: tId, pts: 0, gd: 0, gf: 0, ga: 0 };
});

fixturesList.filter((f) => f.group === grpName).forEach((f) => {
  if (f.score1 === null || f.score2 === null) return;
  const s1 = Number(f.score1);
  const s2 = Number(f.score2);

  if (stats[f.team1Id]) {
    stats[f.team1Id].gf += s1;
    stats[f.team1Id].ga += s2;
    stats[f.team1Id].gd += (s1 - s2);
  }
  if (stats[f.team2Id]) {
    stats[f.team2Id].gf += s2;
    stats[f.team2Id].ga += s1;
    stats[f.team2Id].gd += (s2 - s1);
  }

  if (s1 > s2) {
    if (stats[f.team1Id]) stats[f.team1Id].pts += 3;
  } else if (s2 > s1) {
    if (stats[f.team2Id]) stats[f.team2Id].pts += 3;
  } else {
    if (stats[f.team1Id]) stats[f.team1Id].pts += 1;
    if (stats[f.team2Id]) stats[f.team2Id].pts += 1;
  }
});

return Object.values(stats).sort((a: any, b: any) => {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  return b.gf - a.gf;
});
};

// Wrapper that the TournamentSection component uses — returns full row shape
const calculateStandings = (grpName: string) => {
const grpTeams = grpName === "Group A" ? groupA : groupB;
const stats: { [key: string]: any } = {};

grpTeams.forEach((tId) => {
  stats[tId] = { id: tId, name: getTeamName(tId), p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
});

groupFixtures.filter((f: any) => f.group === grpName).forEach((f: any) => {
  if (f.score1 === null || f.score2 === null) return;
  const s1 = Number(f.score1);
  const s2 = Number(f.score2);

  if (stats[f.team1Id]) {
    stats[f.team1Id].p += 1;
    stats[f.team1Id].gf += s1;
    stats[f.team1Id].ga += s2;
    stats[f.team1Id].gd += (s1 - s2);
    if (s1 > s2) { stats[f.team1Id].w += 1; stats[f.team1Id].pts += 3; }
    else if (s1 === s2) { stats[f.team1Id].d += 1; stats[f.team1Id].pts += 1; }
    else { stats[f.team1Id].l += 1; }
  }
  if (stats[f.team2Id]) {
    stats[f.team2Id].p += 1;
    stats[f.team2Id].gf += s2;
    stats[f.team2Id].ga += s1;
    stats[f.team2Id].gd += (s2 - s1);
    if (s2 > s1) { stats[f.team2Id].w += 1; stats[f.team2Id].pts += 3; }
    else if (s1 === s2) { stats[f.team2Id].d += 1; stats[f.team2Id].pts += 1; }
    else { stats[f.team2Id].l += 1; }
  }
});

return Object.values(stats).sort((a: any, b: any) => {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.gd !== a.gd) return b.gd - a.gd;
  return b.gf - a.gf;
});
};

const handleSimulateGroupStage = () => {
if (groupFixtures.length === 0) {
  toast.error("Generate fixtures first!");
  return;
}
const updatedFixtures = groupFixtures.map((f) => {
  const score1 = Math.floor(Math.random() * 5);
  const score2 = Math.floor(Math.random() * 5);
  return {
    ...f,
    score1,
    score2,
    status: "Completed"
  };
});

setGroupFixtures(updatedFixtures);
localStorage.setItem(`k10_tournament_fixtures_${eventId}`, JSON.stringify(updatedFixtures));

const statsA = calculateStandingsForList(updatedFixtures, "Group A");
const statsB = calculateStandingsForList(updatedFixtures, "Group B");

if (statsA.length >= 2 && statsB.length >= 2) {
  const winnerA = statsA[0].id;
  const runnerA = statsA[1].id;
  const winnerB = statsB[0].id;
  const runnerB = statsB[1].id;

  const updatedSemis = semis.map((semi, idx) => {
    if (idx === 0) {
      return {
        ...semi,
        team1Id: winnerA,
        team2Id: runnerB,
        team1Placeholder: "",
        team2Placeholder: ""
      };
    } else {
      return {
        ...semi,
        team1Id: winnerB,
        team2Id: runnerA,
        team1Placeholder: "",
        team2Placeholder: ""
      };
    }
  });

  setSemis(updatedSemis);
  localStorage.setItem(`k10_tournament_semis_${eventId}`, JSON.stringify(updatedSemis));
  toast.success("Group stage simulated! Semifinal match-ups determined.");
}
};

const handleSimulateKnockouts = () => {
if (semis.some(s => s.team1Id.startsWith("winner") || s.team1Id.startsWith("runner"))) {
  toast.error("Please simulate or play the Group Stage first!");
  return;
}

const updatedSemis = semis.map((s) => {
  let score1 = Math.floor(Math.random() * 4);
  let score2 = Math.floor(Math.random() * 4);
  while (score1 === score2) {
    score1 = Math.floor(Math.random() * 4);
    score2 = Math.floor(Math.random() * 4);
  }
  const winner = score1 > score2 ? s.team1Id : s.team2Id;
  return {
    ...s,
    score1,
    score2,
    winnerId: winner,
    status: "Completed"
  };
});

setSemis(updatedSemis);
localStorage.setItem(`k10_tournament_semis_${eventId}`, JSON.stringify(updatedSemis));

const w1 = updatedSemis[0].winnerId;
const w2 = updatedSemis[1].winnerId;

const updatedFinal = {
  ...final,
  team1Id: w1,
  team2Id: w2,
  team1Placeholder: "",
  team2Placeholder: ""
};

setFinal(updatedFinal);
localStorage.setItem(`k10_tournament_final_${eventId}`, JSON.stringify(updatedFinal));
toast.success("Semifinals simulated! Finalists determined.");
};

const handleSimulateFinal = () => {
if (!final || final.team1Id.startsWith("semi")) {
  toast.error("Please simulate the Semifinals first!");
  return;
}

let score1 = Math.floor(Math.random() * 4);
let score2 = Math.floor(Math.random() * 4);
while (score1 === score2) {
  score1 = Math.floor(Math.random() * 4);
  score2 = Math.floor(Math.random() * 4);
}

const winner = score1 > score2 ? final.team1Id : final.team2Id;
const winnerName = teams.find((t) => t.id === winner)?.name || "Unknown Team";

const updatedFinal = {
  ...final,
  score1,
  score2,
  winnerId: winner,
  status: "Completed"
};

setFinal(updatedFinal);
localStorage.setItem(`k10_tournament_final_${eventId}`, JSON.stringify(updatedFinal));
setStatus("completed");
localStorage.setItem(`k10_tournament_status_${eventId}`, "completed");

toast.success(`Grand Final simulated! ${winnerName} is the Champion! 🏆`);
};

// Club Form 2 Submit with Stripe Checkout API
const handleRegisterSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!regClubName.trim()) {
    toast.error("Please enter your club name");
    return;
  }
  if (!regCoachName.trim()) {
    toast.error("Please enter coach / manager name");
    return;
  }
  if (!regContactEmail.trim()) {
    toast.error("Please enter contact email");
    return;
  }

  const validPlayers = regPlayers.filter((p) => p.name.trim());
  if (validPlayers.length === 0) {
    toast.error("Please add at least 1 player to the roster");
    return;
  }

  const formatDobForApi = (dobStr: string) => {
    if (!dobStr) return "01/01/2010";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dobStr)) {
      const [year, month, day] = dobStr.split("-");
      return `${month}/${day}/${year}`;
    }
    return dobStr;
  };

  const roster = validPlayers.map((p) => ({
    fullName: p.name.trim(),
    dateOfBirth: formatDobForApi(p.dob),
    shirtNo: parseInt(p.shirt, 10) || 1,
  }));

  let badgeName = regClubName.trim() ? `${regClubName.trim()} Crest` : "Club Crest";
  if (regClubLogo !== "custom") {
    const preset = CLUB_PRESET_LOGOS.find((b) => b.id === regClubLogo);
    if (preset) badgeName = preset.name;
  }

  const payload = {
    clubName: regClubName.trim(),
    category: regCategory || event?.ageGroup?.split(",")?.[0]?.trim() || "U-16",
    badgeName,
    coachName: regCoachName.trim(),
    contactPerson: regContactName.trim() || regCoachName.trim(),
    contactPhone: regContactPhone.trim(),
    contactEmail: regContactEmail.trim(),
    roster,
    paymentMethod: "STRIPE",
  };

  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));
    if (regCustomLogoFile) {
      formData.append("logo", regCustomLogoFile);
    }

    const res = await registerClub({
      eventId: rawId,
      body: formData,
    }).unwrap();

    const checkoutUrl = res?.data?.checkoutUrl || res?.checkoutUrl;

    if (checkoutUrl) {
      toast.success(res?.message || "Club registration initiated! Redirecting to Stripe payment...");
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 700);
      return;
    }

    setIsSuccess(true);
    toast.success("Club registered successfully!");
  } catch (error: any) {
    toast.error(error?.data?.message || error?.message || "Failed to initiate club registration");
  }
};

// Helper render logo
const renderTeamLogo = (teamId: string, sizeClass = "w-6 h-6") => {
  const team = teams.find((t) => t.id === teamId || t.clubId === teamId || String(t._id) === teamId);
  if (!team) {
    if (teamId === "winner-a") return <IconShield className={`${sizeClass} text-yellow-400/50`} />;
    if (teamId === "winner-b") return <IconShield className={`${sizeClass} text-yellow-400/50`} />;
    if (teamId === "runner-a") return <IconShield className={`${sizeClass} text-white/20`} />;
    if (teamId === "runner-b") return <IconShield className={`${sizeClass} text-white/20`} />;
    return <IconShield className={`${sizeClass} text-white/20`} />;
  }
  const logo = team.logoUrl || team.customLogo;
  if (logo) {
    return <Image width={40} height={40} src={logo} alt={team.name} className={`${sizeClass} object-contain rounded-full`} />;
  }
  const preset = CLUB_PRESET_LOGOS.find(
    (l) => l.id === team.logoId || 
           l.name?.toLowerCase() === team.badgePreset?.toLowerCase() || 
           l.name?.toLowerCase() === team.badgeName?.toLowerCase()
  );
  if (preset) {
    return (
      <div className={sizeClass} dangerouslySetInnerHTML={{ __html: preset.svg }} />
    );
  }
  return <IconShield className={`${sizeClass} text-white/30`} />;
};

const getTeamName = (teamId: string, placeholder = "TBD") => {
const team = teams.find((t) => t.id === teamId);
return team ? team.name : placeholder;
};

  if (isSingleLoading || isEventsLoading || !event) {
    return <EventDetailPageSkeleton />;
  }

const isTournament = event.eventType === "tournament" || event.title.toLowerCase().includes("tournament");

return (
<div className="max-w-6xl mx-auto py-8 px-4 flex flex-col gap-6 animate-in fade-in duration-300">

  {/* DEMO ROLE SWITCHER BAR */}
  <div className="bg-[#161618] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-4 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-r from-transparent via-[#E31B23]/10 to-[#00FF62]/10 pointer-events-none" />
    <div className="flex items-center gap-3.5 z-10">
      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF62] shadow-inner">
        <IconDeviceGamepad className="animate-pulse" size={22} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-xs font-black uppercase text-white font-orbitron tracking-wider">Interactive Role & View Switcher</p>
          <span className="bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62] text-[8px] font-black uppercase px-2 py-0.5 rounded-full font-orbitron">CLIENT DEMO</span>
        </div>
        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">Switch view roles to preview how clubs, parents, and admins see live results</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 z-10 bg-black/60 p-1.5 rounded-2xl border border-white/10">
      <button
        onClick={() => setPreviewRole("invited_club")}
        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
          previewRole === "invited_club"
            ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
            : "text-white/50 hover:text-white hover:bg-white/5"
        }`}
      >
        <IconShield size={14} />
        Invited Club Flow
      </button>

      <button
        onClick={() => setPreviewRole("spectator_parent")}
        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
          previewRole === "spectator_parent"
            ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30 border border-amber-400"
            : "text-white/50 hover:text-white hover:bg-white/5"
        }`}
      >
        <IconEye size={14} />
        Parents & Spectators View
      </button>

      <button
        onClick={() => setPreviewRole("owner_admin")}
        className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
          previewRole === "owner_admin"
            ? "bg-[#00FF62] text-black font-black shadow-lg shadow-[#00FF62]/30 border border-[#00FF62]"
            : "text-white/50 hover:text-white hover:bg-white/5"
        }`}
      >
        <IconCrown size={14} />
        Tournament Owner (Admin)
      </button>
    </div>

    {/* Quick Simulator Toggles */}
    <div className="flex items-center gap-2 z-10 shrink-0">
      <button
        onClick={status === "registration" ? handleGoLive : handleResetTournament}
        disabled={isStartingTournament}
        className={`px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer font-orbitron flex items-center gap-1.5 ${
          status === "live" || status === "completed"
            ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
            : "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62] hover:bg-[#00FF62]/20"
        } ${isStartingTournament ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isStartingTournament ? (
          <div className="size-3 border-2 border-t-white border-white/20 rounded-full animate-spin" />
        ) : (
          <IconActivity size={13} className="animate-pulse" />
        )}
        {isStartingTournament ? "Starting..." : status === "live" ? "Live Mode Active" : "Toggle Live Mode"}
      </button>
    </div>
  </div>

  {/* Back Navigation */}
  <Link 
    href="/dashboard/academy/management/extra-events" 
    className="flex items-center gap-2 text-white/60 hover:text-white transition-all text-xs font-black uppercase tracking-widest w-fit font-orbitron"
  >
    <IconArrowLeft size={16} />
    Back to Events
  </Link>

  {/* ROLE STATE VIEW: 1. INVITED CLUB FLYER VIEW */}
  {previewRole === "invited_club" && (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

      {/* Main Flyer Box */}
      <div className="lg:col-span-2 bg-linear-to-b from-[#111111] to-[#050505] rounded-4xl border border-white/10 overflow-hidden shadow-2xl relative min-w-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient from-[#E31B23]/10 to-transparent pointer-events-none" />

        {/* Header Banner */}
        <div className="p-8 md:p-12 border-b border-white/10 flex flex-col md:flex-row gap-8 items-center bg-black/40">

          {/* Shield/Logo */}
          <div className="w-32 h-32 md:w-36 md:h-36 shrink-0 bg-[#161616] rounded-3xl border border-white/10 p-6 flex items-center justify-center shadow-lg relative group">
            {event.customLogo ? (
              <Image width={100} height={100} src={event.customLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div dangerouslySetInnerHTML={{ 
                __html: TOURNAMENT_PRESET_LOGOS.find(l => l.id === event.logoId)?.svg || TOURNAMENT_PRESET_LOGOS[0].svg 
              }} />
            )}
            <div className="absolute -bottom-3 bg-[#E31B23] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-black">
              INVITATION
            </div>
          </div>

          {/* Title Info */}
          <div className="text-center md:text-left space-y-4">
            <span className="bg-[#E31B23]/10 border border-[#E31B23]/20 text-[#E31B23] px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">
              {status === "registration" ? "Registration Open" : status === "live" ? "Tournament Live" : "Completed"}
            </span>

            <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none mt-2">
              {event.title}
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
              <span className="bg-white/5 border border-white/10 text-white/60 px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                {event.targetGroup || "Academy Players Only"}
              </span>
              <span className="bg-white/5 border border-white/10 text-[#00FF62] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide font-orbitron">
                {event.matchFormation || "11-a-side"} Format
              </span>
            </div>
          </div>
        </div>

        {/* Flyer Details Grid */}
        <div className="p-8 md:p-12 space-y-10">

          {/* Three Stat Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconCalendarEvent size={18} className="text-[#E31B23]" /> Date of Event
              </span>
              <span className="text-base font-black text-white uppercase mt-1">{event.date}</span>
            </div>
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconCurrencyDollar size={18} className="text-[#E31B23]" /> Registration Fee
              </span>
              <span className="text-base font-black text-[#00FF62] uppercase mt-1">{event.fee || "Free"}</span>
            </div>
            <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 flex flex-col gap-2 relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 font-orbitron">
                <IconUsers size={18} className="text-[#E31B23]" /> Registered Clubs
              </span>
              <span className="text-base font-black text-white uppercase mt-1">
                {totalRegisteredClubs} / {maxClubsCapacity} Teams
              </span>
            </div>
          </div>

          {/* Age Categories */}
          <div className="space-y-4 bg-[#141414]/60 border border-white/5 rounded-3xl p-6">
            <h3 className="text-xs font-black uppercase text-white/40 tracking-widest font-orbitron flex items-center gap-2">
              <IconStar size={16} className="text-[#E31B23]" /> Target Categories / Age Groups
            </h3>
            <div className="flex flex-wrap gap-2.5 mt-2">
              {(event.ageGroup || "U-8").split(",").map((cat: string) => (
                <span key={cat} className="bg-black/60 border border-white/10 text-white font-black text-xs px-4 py-2 rounded-xl">
                  {cat.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Flyer Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Tournament Details</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {event.description || `Welcome to the ${event.title}. This prestigious football tournament gathers the top squads for a competitive matchday experience. The tournament operates in a Group Stage + Knockout structure to guarantee multiple matches for each squad. Referees are certified, and championship awards are presented to Winners and Runners-up.`}
            </p>
          </div>

          {/* Flyer Requirements */}
          <div className="space-y-4 border-t border-white/5 pt-8">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Rules & What to Bring</h3>
            <ul className="text-sm text-white/60 space-y-3 list-disc pl-5">
              <li>Squad roster lists must be locked prior to registration deadline.</li>
              <li>Players are required to play in matching team uniforms (kits) with visible shirt numbers.</li>
              <li>Shinguards are strictly mandatory for all age categories.</li>
              <li>Teams must present birth certificates or credentials upon check-in if requested by tournament organizers.</li>
              <li>Parental consent forms must be completed for all underage youth players.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sidebar Info Card */}
      <div className="space-y-6">

        {/* Join Tournament Call to Action Box */}
        <div className="bg-[#1C1C1C] border border-[#E31B23]/35 rounded-4xl p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial-gradient from-[#E31B23]/10 to-transparent pointer-events-none" />
          <h4 className="text-lg font-black uppercase tracking-wider text-white font-orbitron">Join This Tournament</h4>
          <p className="text-xs text-white/50 leading-relaxed">
            Click below to pay the entry fee and register your club roster. Please have player photos and birth dates ready.
          </p>

          {status === "registration" ? (
            <button
              onClick={() => {
                setIsSuccess(false);
                setShowRegModal(true);
              }}
              className="w-full flex items-center justify-center gap-3 bg-[#E31B23] hover:bg-[#C2181F] text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl transition-all shadow-lg shadow-[#E31B23]/20 font-orbitron cursor-pointer"
            >
              <IconPlus size={18} />
              Register Your Club
            </button>
          ) : (
            <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
              <p className="text-[10px] font-black uppercase text-[#E31B23] tracking-widest">Registration Closed</p>
              <p className="text-[9px] text-white/30 font-bold uppercase mt-1">Tournament is currently Live or Finished</p>
            </div>
          )}
        </div>

        {/* Location Box */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Venue Location</h4>
          <div className="flex items-start gap-3">
            <IconMapPin size={20} className="text-[#E31B23] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-white uppercase">{event.venueName || "Sports Center Complex"}</p>
              <p className="text-xs text-white/50 mt-1">{event.address || "123 Field Lane, London"}</p>
            </div>
          </div>

          {/* Mock Google Map Visual */}
          <div className="w-full h-32 bg-[#1b1b1b] rounded-2xl border border-white/5 overflow-hidden relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-size-[16px_16px]" />
            <div className="absolute w-8 h-8 rounded-full bg-[#E31B23]/25 animate-ping" />
            <IconMapPin size={28} className="text-[#E31B23] relative z-10" />
            <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white/60 tracking-widest border border-white/5">
              MAP PREVIEW
            </span>
          </div>
        </div>

        {/* Organizer Contact Box */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Tournament Organizer</h4>
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-xs text-white/70">
              <IconUser size={16} className="text-white/40 shrink-0" />
              <span className="font-bold text-white">{event.contactName || "Mario Lopez"}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <IconPhone size={16} className="text-white/40 shrink-0" />
              <span>{event.contactPhone || "+44 7123 456789"}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <IconMail size={16} className="text-white/40 shrink-0" />
              <span className="truncate">{event.contactEmail || "tournament@k10football.com"}</span>
            </div>
          </div>
        </div>

        {/* Copy Share Link Box */}
        <div className="bg-[#111111] border border-white/10 rounded-4xl p-6 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-white/40 font-orbitron">Invitation Link</h4>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold uppercase tracking-widest text-[9px] py-3 rounded-xl transition-all border border-white/10 font-orbitron cursor-pointer"
          >
            {copied ? (
              <>
                <IconCheck size={14} className="text-[#00FF62]" />
                Copied link!
              </>
            ) : (
              <>
                <IconCopy size={14} />
                Copy Invite Link
              </>
            )}
          </button>
        </div>

      </div>

      {/* Participating Tournament Clubs Section */}
      <div className="lg:col-span-3 w-full bg-[#111111] border border-white/10 rounded-4xl p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <IconShield className="text-[#00FF62] shrink-0" size={20} />
              <h3 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate">
                Registered Tournament Clubs
              </h3>
              <span className="text-[10px] font-black uppercase bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62] px-2.5 py-0.5 rounded-full font-orbitron shrink-0">
                {totalRegisteredClubs} Enrolled
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Clubs registered and verified for {event?.title}. Click any club to inspect their player roster.
            </p>
          </div>

          {status === "registration" && (
            <button
              type="button"
              onClick={() => {
                setIsSuccess(false);
                setShowRegModal(true);
              }}
              className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all font-orbitron cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto"
            >
              <IconPlus size={14} /> Register Your Club
            </button>
          )}
        </div>

        {isRegisteredClubsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-3xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="size-12 rounded-full bg-white/10 shrink-0" />
                  <div className="min-w-0 flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-14 bg-white/5 rounded" />
                      <Skeleton className="h-3.5 w-16 bg-white/5 rounded" />
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                  <Skeleton className="h-3 w-20 bg-white/5 rounded" />
                  <Skeleton className="h-5 w-24 bg-white/10 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : teams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedRosterTeam(t)}
                className="bg-black/40 hover:bg-black/70 border border-white/5 hover:border-white/20 p-5 rounded-3xl transition-all cursor-pointer group flex flex-col justify-between gap-4 min-w-0"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {renderTeamLogo(t.id, "size-12 shrink-0")}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black uppercase text-white truncate font-orbitron group-hover:text-[#00FF62] transition-colors">
                      {t.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[9px] font-black uppercase bg-white/5 border border-white/10 text-white/70 px-2 py-0.5 rounded shrink-0">
                        {t.category || "General"}
                      </span>
                      {t.paymentStatus && (
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                            t.paymentStatus === "PAID"
                              ? "bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62]"
                              : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                          }`}
                        >
                          {t.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex items-center justify-between gap-2 text-xs text-white/50">
                  <div className="truncate text-[10px]">
                    {t.coachName ? `Coach: ${t.coachName}` : t.contactName ? `Contact: ${t.contactName}` : "Official Club"}
                  </div>
                  <span className="text-[9px] font-black uppercase text-[#E31B23] bg-[#E31B23]/10 border border-[#E31B23]/25 px-2.5 py-1 rounded-lg group-hover:scale-105 transition-all shrink-0 whitespace-nowrap">
                    {t.players?.length || 0} Players Roster
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-3xl p-6">
            <p className="text-xs font-black uppercase text-white/40 tracking-wider font-orbitron">
              No clubs registered yet.
            </p>
            <p className="text-[11px] text-white/30 mt-1">
              Be the first club to register your squad for this tournament!
            </p>
          </div>
        )}
      </div>

    </div>
  )}

  {/* ROLE STATE VIEW: 2. PARENTS & SPECTATORS PUBLIC VIEW */}
  {previewRole === "spectator_parent" && (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-linear-to-r from-amber-500/10 via-[#161618] to-black rounded-4xl border border-amber-500/30 p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest font-orbitron">
              <IconEye size={14} />
              Public Fan & Parent Live Portal
            </div>
            <h2 className="text-2xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-tight">
              {event.title}
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Live scores, group standings, match fixtures, and championship knockout brackets visible for parents, clubs, and supporters.
            </p>
          </div>

          {/* Share Box */}
          <div className="bg-black/60 border border-white/10 rounded-3xl p-5 space-y-3 shrink-0 w-full md:w-auto min-w-65">
            <span className="text-[9px] font-black uppercase tracking-wider text-white/50 font-orbitron block">Public Spectator Link</span>
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-wider text-[10px] py-3 px-4 rounded-xl transition-all font-orbitron cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {copied ? (
                <>
                  <IconCheck size={14} />
                  Spectator Link Copied!
                </>
              ) : (
                <>
                  <IconCopy size={14} />
                  Share Public Result Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ROLE STATE VIEW: 3. TOURNAMENT OWNER VIEW (ADMIN MANAGER) */}
  {previewRole === "owner_admin" && (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Tournament Status</span>
          <p className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
            {status === "registration" ? "REGISTRATION" : status === "live" ? "LIVE GAME" : "COMPLETED"}
          </p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Registered Teams</span>
          <p className="text-2xl font-black text-[#00FF62] font-orbitron tracking-tight">
            {totalRegisteredClubs} / {maxClubsCapacity} Teams
          </p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Categories</span>
          <p className="text-2xl font-black text-white font-orbitron tracking-tight truncate">
            {event.ageGroup || "U-8"}
          </p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-2 flex flex-col justify-center">
          {status === "registration" && teams.length < 8 && (
            <div className="text-[10px] text-white/50 font-black uppercase text-center border border-white/10 bg-white/5 py-3 px-4 rounded-xl font-orbitron">
              {totalRegisteredClubs} / {maxClubsCapacity} Clubs Enrolled
            </div>
          )}
          {(status === "live" || status === "completed") && (
            <button
              onClick={handleResetTournament}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all cursor-pointer text-center w-full font-orbitron"
            >
              Reset Tournament Flow
            </button>
          )}
          {status === "registration" && teams.length >= 8 && (
            <div className="text-[9px] text-[#00FF62] font-black uppercase text-center border border-[#00FF62]/20 bg-[#00FF62]/5 p-2 rounded-xl">
              Squads Cap Reached!
            </div>
          )}
        </div>
      </div>

      {/* Group Allocation and Squad Rosters Manager */}
      {status === "registration" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Registered Teams (Roster Viewer) */}
          <div className="lg:col-span-1 bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-6 min-w-0">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <h3 className="text-xl font-black uppercase text-white font-orbitron">Registered Clubs</h3>
                <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-widest mt-0.5">
                  {teams.length} clubs enrolled
                </p>
              </div>
              {isRegisteredClubsLoading && (
                <div className="size-4 border-2 border-t-[#00FF62] border-white/10 rounded-full animate-spin" />
              )}
            </div>

            <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {isRegisteredClubsLoading ? (
                <div className="flex flex-col gap-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Skeleton className="size-10 rounded-full bg-white/10 shrink-0" />
                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                          <Skeleton className="h-3.5 w-28 bg-white/10 rounded" />
                          <Skeleton className="h-2.5 w-36 bg-white/5 rounded" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-14 bg-white/10 rounded-lg shrink-0" />
                    </div>
                  ))}
                </div>
              ) : teams.length > 0 ? (
                teams.map((t) => (
                  <div 
                    key={t.id}
                    onClick={() => setSelectedRosterTeam(t)}
                    className="bg-black/40 hover:bg-black border border-white/5 hover:border-white/15 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderTeamLogo(t.id, "size-10 shrink-0")}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-black text-white truncate uppercase">{t.name}</p>
                          {t.paymentStatus && (
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                              t.paymentStatus === "PAID" 
                                ? "bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62]" 
                                : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                            }`}>
                              {t.paymentStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">
                          {t.players?.length || 0} Players • {t.category || "General"}
                        </p>
                        {t.coachName && (
                          <p className="text-[9px] text-white/50 truncate mt-0.5">
                            Coach: {t.coachName}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[8px] font-black uppercase text-[#E31B23] bg-[#E31B23]/10 border border-[#E31B23]/25 px-2.5 py-1.5 rounded-lg group-hover:scale-105 transition-all shrink-0">
                      Roster
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-xs text-white/30 uppercase font-black font-orbitron border border-dashed border-white/10 rounded-2xl p-6">
                  No clubs registered yet
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Group Allocation Board */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 flex flex-col gap-6 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-black uppercase text-white font-orbitron">Group Stage Builder</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                  Allocate clubs to Group A or Group B (Exactly 4 clubs per group required)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {unallocatedTeams.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoAllocate}
                    className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-3.5 rounded-xl transition-all font-orbitron cursor-pointer"
                  >
                    <IconSparkles size={14} className="text-[#00FF62]" />
                    Auto Balance
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveAllocations}
                  disabled={isAllocatingGroups || (groupA.length === 0 && groupB.length === 0)}
                  className="flex items-center gap-2 bg-[#E31B23] hover:bg-[#C2181F] text-white text-[10px] font-black uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all font-orbitron cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#E31B23]/20"
                >
                  {isAllocatingGroups ? (
                    <>
                      <div className="size-3.5 border-2 border-t-white border-white/20 rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <IconCheck size={14} />
                      Save Allocations
                    </>
                  )}
                </button>

                <button
                  onClick={handleGoLive}
                  disabled={groupA.length !== 4 || groupB.length !== 4 || isAllocatingGroups || isStartingTournament}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-orbitron cursor-pointer flex items-center gap-2 ${
                    groupA.length === 4 && groupB.length === 4 && !isStartingTournament
                      ? "bg-[#00FF62] text-black shadow-lg shadow-[#00FF62]/20 hover:scale-[1.02]"
                      : "bg-white/5 border border-white/10 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {isStartingTournament ? (
                    <>
                      <div className="size-3.5 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                      Starting Tournament...
                    </>
                  ) : (
                    <>
                      <IconActivity size={14} />
                      Start Tournament & Generate Fixtures
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Unallocated Clubs Pool (if any exist) */}
            {unallocatedTeams.length > 0 && (
              <div className="bg-black/60 border border-yellow-500/20 rounded-3xl p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-yellow-400 animate-ping" />
                    <span className="text-xs font-black uppercase text-yellow-400 font-orbitron">
                      Unallocated Clubs ({unallocatedTeams.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                    Assign each club to Group A or Group B
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {unallocatedTeams.map((t) => (
                    <div
                      key={t.id}
                      className="bg-[#141414] border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {renderTeamLogo(t.id, "size-8 shrink-0")}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{t.name}</p>
                          <p className="text-[9px] text-white/40 uppercase font-black">{t.category || "General"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAssignToGroupA(t.id)}
                          disabled={groupA.length >= 4}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 hover:bg-[#00FF62]/20 text-white/80 hover:text-[#00FF62] border border-white/10 hover:border-[#00FF62]/40 transition-all font-orbitron cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          + Group A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignToGroupB(t.id)}
                          disabled={groupB.length >= 4}
                          className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 hover:bg-[#00FF62]/20 text-white/80 hover:text-[#00FF62] border border-white/10 hover:border-[#00FF62]/40 transition-all font-orbitron cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          + Group B
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group A & B Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">

              {/* Group A Column */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-black uppercase text-white font-orbitron">Group A</span>
                  <span className={`text-[10px] font-black font-orbitron ${groupA.length === 4 ? "text-[#00FF62]" : "text-white/40"}`}>
                    {groupA.length} / 4 Slots
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 min-h-[25vh]">
                  {teams.filter(t => groupA.includes(t.id)).map((t) => (
                    <div key={t.id} className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {renderTeamLogo(t.id, "size-6 shrink-0")}
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value="A"
                          onChange={(e) => {
                            if (e.target.value === "B") {
                              handleAssignToGroupB(t.id);
                            } else if (e.target.value === "UNALLOCATED") {
                              handleUnallocateTeam(t.id);
                            }
                          }}
                          className="bg-black text-[9px] border border-white/10 text-white font-black uppercase tracking-wider rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="A">Group A</option>
                          <option value="B" disabled={groupB.length >= 4}>Move to Group B</option>
                          <option value="UNALLOCATED">Unallocate</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {groupA.length === 0 && (
                    <div className="text-center py-12 text-xs text-white/25 uppercase font-black font-orbitron border border-dashed border-white/5 rounded-xl">
                      No clubs allocated
                    </div>
                  )}
                </div>
              </div>

              {/* Group B Column */}
              <div className="bg-black/40 border border-white/5 rounded-3xl p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-black uppercase text-white font-orbitron">Group B</span>
                  <span className={`text-[10px] font-black font-orbitron ${groupB.length === 4 ? "text-[#00FF62]" : "text-white/40"}`}>
                    {groupB.length} / 4 Slots
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 min-h-[25vh]">
                  {teams.filter(t => groupB.includes(t.id)).map((t) => (
                    <div key={t.id} className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {renderTeamLogo(t.id, "size-6 shrink-0")}
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value="B"
                          onChange={(e) => {
                            if (e.target.value === "A") {
                              handleAssignToGroupA(t.id);
                            } else if (e.target.value === "UNALLOCATED") {
                              handleUnallocateTeam(t.id);
                            }
                          }}
                          className="bg-black text-[9px] border border-white/10 text-white font-black uppercase tracking-wider rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="B">Group B</option>
                          <option value="A" disabled={groupA.length >= 4}>Move to Group A</option>
                          <option value="UNALLOCATED">Unallocate</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  {groupB.length === 0 && (
                    <div className="text-center py-12 text-xs text-white/25 uppercase font-black font-orbitron border border-dashed border-white/5 rounded-xl">
                      No clubs allocated
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (

        // Tournament is Live / Active - Show match sim control center
        <div className="bg-[#111] border border-white/10 rounded-4xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#00FF62] animate-pulse" />
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Simulation Center</h3>
          </div>
          <p className="text-[11px] text-white/40 uppercase tracking-widest font-bold max-w-2xl leading-relaxed">
            Step-by-step simulator to execute matches in Group Stages, Semifinals, and Grand Finals, automatically updating standings tables and bracket trees.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <button
              onClick={handleSimulateGroupStage}
              disabled={status !== "live"}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                status === "live"
                  ? "bg-[#00FF62]/5 border-[#00FF62]/30 hover:bg-[#00FF62]/10"
                  : "bg-[#161616]/40 border-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Step 1</span>
              <h4 className="text-sm font-black uppercase text-white font-orbitron mt-2">Simulate Group Stages</h4>
              <p className="text-[10px] text-white/50 mt-1 leading-normal">
                Generate random results for all round-robin games and lock top squads for knockouts.
              </p>
            </button>

            <button
              onClick={handleSimulateKnockouts}
              disabled={status !== "live" || semis.some(s => s.team1Id.startsWith("winner"))}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                status === "live" && !semis.some(s => s.team1Id.startsWith("winner"))
                  ? "bg-[#00FF62]/5 border-[#00FF62]/30 hover:bg-[#00FF62]/10"
                  : "bg-[#161616]/40 border-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Step 2</span>
              <h4 className="text-sm font-black uppercase text-white font-orbitron mt-2">Simulate Semifinals</h4>
              <p className="text-[10px] text-white/50 mt-1 leading-normal">
                Generate knockout results for Semis 1 and 2 to populate the Championship Grand Final match.
              </p>
            </button>

            <button
              onClick={handleSimulateFinal}
              disabled={status !== "live" || !final || final.team1Id.startsWith("semi") || final.status === "Completed"}
              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer ${
                status === "live" && final && !final.team1Id.startsWith("semi") && final.status !== "Completed"
                  ? "bg-[#E31B23]/5 border-[#E31B23]/30 hover:bg-[#E31B23]/10"
                  : "bg-[#161616]/40 border-white/5 text-white/20 cursor-not-allowed"
              }`}
            >
              <span className="text-[9px] font-black uppercase text-white/40 tracking-wider">Step 3</span>
              <h4 className="text-sm font-black uppercase text-white font-orbitron mt-2">Simulate Grand Final</h4>
              <p className="text-[10px] text-white/50 mt-1 leading-normal">
                Generate the final match score, determine the tournament Champion, and lock results.
              </p>
            </button>
          </div>
        </div>
      )}

    </div>
  )}

  {/* DYNAMIC TOURNAMENT STANDINGS & BRACKET AREA (Displayed across preview roles) */}
  <TournamentSection 
    eventId={eventId}
    ageGroup={event.ageGroup} 
    status={status}
    groupFixtures={groupFixtures}
    semis={semis}
    final={final}
    groupA={groupA}
    groupB={groupB}
    teams={teams}
    renderTeamLogo={renderTeamLogo}
    getTeamName={getTeamName}
    calculateStandings={calculateStandings}
    onStartLive={handleGoLive}
    onSimulate={handleSimulateGroupStage}
  />

  {/* FORM 2 MODAL: CLUB REGISTRATION & PAYMENT */}
  <DashboardModal
    isOpen={showRegModal}
    onClose={() => setShowRegModal(false)}
    title="Club Registration Form"
    subtitle={`Fill in details to secure your spot in ${event.title}`}
    showBackButton
    onBack={() => setShowRegModal(false)}
  >
    {isSuccess ? (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[#00FF62]/10 border border-[#00FF62]/30 flex items-center justify-center text-[#00FF62]">
          <IconCheck size={48} className="animate-bounce" />
        </div>
        <div className="space-y-2 max-w-md">
          <h3 className="text-2xl font-black uppercase text-white font-orbitron">Registration Successful!</h3>
          <p className="text-sm text-white/60">
            Your payment was authorized. <strong>{regClubName}</strong> has been enrolled in the tournament. A confirmation receipt has been sent to <strong>{regContactEmail}</strong>.
          </p>
        </div>
        <button
          onClick={() => setShowRegModal(false)}
          className="px-8 py-3.5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/90 transition-all font-orbitron cursor-pointer"
        >
          Done & Return
        </button>
      </div>
    ) : (
      <form onSubmit={handleRegisterSubmit} className="space-y-10">
        {/* Club Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron border-b border-white/5 pb-2">Club Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Club / Team Name <span className="text-[#E31B23]">*</span></label>
              <input
                type="text"
                required
                value={regClubName}
                onChange={(e) => setRegClubName(e.target.value)}
                placeholder="e.g., Chelsea Youth FC"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Choose Category <span className="text-[#E31B23]">*</span></label>
              <div className="relative">
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/25 transition-all cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {(event.ageGroup || "U-8").split(",").map((cat: string) => (
                    <option key={cat} value={cat.trim()}>{cat.trim()}</option>
                  ))}
                </select>
                <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              </div>
            </div>

            {/* Club Logo Picker */}
            <div className="space-y-3 md:col-span-2 bg-white/1 border border-white/5 rounded-3xl p-6">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Club Logo Badge <span className="text-[#E31B23]">*</span></label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
                {CLUB_PRESET_LOGOS.map((badge) => (
                  <button
                    key={badge.id}
                    type="button"
                    onClick={() => {
                      setRegClubLogo(badge.id);
                      setRegCustomLogo("");
                    }}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer ${
                      regClubLogo === badge.id && !regCustomLogo
                        ? "border-[#E31B23] bg-[#E31B23]/5"
                        : "border-white/10 bg-[#111] hover:border-white/20"
                    }`}
                  >
                    <div className="w-10 h-10">
                      <div dangerouslySetInnerHTML={{ __html: badge.svg }} />
                    </div>
                    <span className="text-[9px] font-black uppercase text-white/40 text-center leading-tight truncate w-full">
                      {badge.name}
                    </span>
                  </button>
                ))}
                {/* Custom Logo Upload */}
                <label
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 justify-center cursor-pointer relative ${
                    regCustomLogo
                      ? "border-[#E31B23] bg-[#E31B23]/5"
                      : "border-white/10 bg-[#111] hover:border-white/20"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setRegCustomLogoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setRegCustomLogo(reader.result as string);
                          setRegClubLogo("custom");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {regCustomLogo ? (
                    <Image width={20} height={20} src={regCustomLogo} alt="Custom Logo" className="w-10 h-10 object-contain rounded-full" />
                  ) : (
                    <IconUpload size={20} className="text-white/40" />
                  )}
                  <span className="text-[9px] font-black uppercase text-white/40 text-center leading-tight truncate w-full">
                    {regCustomLogo ? "Custom" : "Upload Logo"}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Coach / Manager & Contact Information */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron border-b border-white/5 pb-2">Coach / Manager & Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Coach / Manager Name <span className="text-[#E31B23]">*</span></label>
              <input
                type="text"
                required
                value={regCoachName}
                onChange={(e) => setRegCoachName(e.target.value)}
                placeholder="e.g., Coach Michael Edwards"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Contact Person / Responsible</label>
              <input
                type="text"
                value={regContactName}
                onChange={(e) => setRegContactName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Contact Phone</label>
              <input
                type="text"
                value={regContactPhone}
                onChange={(e) => setRegContactPhone(e.target.value)}
                placeholder="+44 7123 456789"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Contact Email <span className="text-[#E31B23]">*</span></label>
              <input
                type="email"
                required
                value={regContactEmail}
                onChange={(e) => setRegContactEmail(e.target.value)}
                placeholder="contact@club.com"
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-white/25 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Players Roster Builder */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Players Roster</h3>
            <button
              type="button"
              onClick={() => setRegPlayers([...regPlayers, { name: "", dob: "", shirt: "" }])}
              className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-1.5 transition-all border border-white/10 cursor-pointer"
            >
              <IconPlus size={14} /> Add Player Row
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 w-12 text-center">#</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40">Player Full Name</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 min-w-[170px]">Date of Birth</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-28">Shirt No.</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {regPlayers.map((player, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/1">
                    <td className="p-4 text-center text-xs font-black text-white/40 font-orbitron">{idx + 1}</td>
                    <td className="p-3">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={player.name}
                        onChange={(e) => {
                          const updated = [...regPlayers];
                          updated[idx].name = e.target.value;
                          setRegPlayers(updated);
                        }}
                        className="w-full bg-[#111111] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
                      />
                    </td>
                    <td className="p-3 min-w-[170px]">
                      <input
                        type="date"
                        value={player.dob}
                        onChange={(e) => {
                          const updated = [...regPlayers];
                          updated[idx].dob = e.target.value;
                          setRegPlayers(updated);
                        }}
                        onClick={(e) => {
                          try {
                            e.currentTarget.showPicker?.();
                          } catch {}
                        }}
                        style={{ colorScheme: "dark" }}
                        className="w-full bg-[#111111] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 transition-all"
                      />
                    </td>
                    <td className="p-3 w-28">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={3}
                        placeholder="10"
                        value={player.shirt}
                        onChange={(e) => {
                          const numericVal = e.target.value.replace(/\D/g, "");
                          const updated = [...regPlayers];
                          updated[idx].shirt = numericVal;
                          setRegPlayers(updated);
                        }}
                        className="w-full bg-[#111111] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-center text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 font-orbitron font-bold transition-all"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (regPlayers.length > 1) {
                            setRegPlayers(regPlayers.filter((_, i) => i !== idx));
                          } else {
                            toast.error("Must have at least 1 player");
                          }
                        }}
                        className="text-white/30 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      >
                        <IconTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment checkout with Stripe */}
        <div className="flex flex-col gap-6 bg-[#161616]/40 border border-white/10 rounded-4xl p-6 md:p-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <IconCreditCard size={24} className="text-[#E31B23]" />
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Secure Registration Fee Payment</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2 items-center">
            <div className="flex flex-col gap-4 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Summary</span>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Club Registration Fee</span>
                  <span className="text-white font-bold">{event?.fee || "Free"}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                  <span className="text-white/60">Service Taxes & Referee fee</span>
                  <span className="text-[#00FF62] font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center text-base border-t border-white/5 pt-3 font-black font-orbitron">
                  <span className="text-white">Amount Due</span>
                  <span className="text-[#00FF62]">{event?.fee || "Free"}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-black/40 border border-white/10">
              <div className="flex items-center gap-2 text-white">
                <IconShield className="size-5 text-[#00FF62]" />
                <span className="text-xs font-black uppercase tracking-wider font-orbitron">Stripe Secure Checkout</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                You will be redirected to the official Stripe payment gateway to securely complete your payment. Upon successful transaction, your club registration will be verified automatically.
              </p>
              <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-white/40">
                <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">Visa</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">Mastercard</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">Apple Pay</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-white/70">Google Pay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
          <button
            type="button"
            onClick={() => setShowRegModal(false)}
            className="px-8 py-3.5 border border-white/20 text-white hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all font-orbitron cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isRegisteringClub}
            className="px-10 py-3.5 bg-[#00FF62] text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-[#00E559] hover:scale-[1.01] transition-all flex items-center gap-2 font-orbitron cursor-pointer disabled:opacity-50"
          >
            {isRegisteringClub ? (
              <>
                <div className="size-3.5 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                Processing Stripe Checkout...
              </>
            ) : (
              <>
                <IconCreditCard size={16} />
                Pay & Complete Registration
              </>
            )}
          </button>
        </div>

      </form>
    )}
  </DashboardModal>

  {/* SQUAD ROSTER VIEWER SUB-MODAL */}
  <DashboardModal
    isOpen={selectedRosterTeam !== null}
    onClose={() => setSelectedRosterTeam(null)}
    title={activeClub?.clubName || activeClub?.name || selectedRosterTeam?.name || "Roster Details"}
    subtitle={`Squad age group: ${activeClub?.category || selectedRosterTeam?.category || "U-16"} • Contact Person: ${activeClub?.contactPerson || activeClub?.contactName || selectedRosterTeam?.contactPerson || selectedRosterTeam?.contactName || "N/A"}`}
    showBackButton
    onBack={() => setSelectedRosterTeam(null)}
  >
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111] p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4 min-w-0">
          {(activeClub?.logoUrl || activeClub?.customLogo || selectedRosterTeam?.logoUrl || selectedRosterTeam?.customLogo) ? (
            <Image
              width={64}
              height={64}
              src={activeClub?.logoUrl || activeClub?.customLogo || selectedRosterTeam?.logoUrl || selectedRosterTeam?.customLogo}
              alt={activeClub?.clubName || activeClub?.name || selectedRosterTeam?.name || "Club Logo"}
              className="size-16 shrink-0 object-contain rounded-2xl bg-white/5 p-1 border border-white/10"
            />
          ) : (
            selectedRosterTeam && renderTeamLogo(selectedClubId, "size-16 shrink-0")
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xl font-black uppercase text-white font-orbitron truncate">
                {activeClub?.clubName || activeClub?.name || selectedRosterTeam?.name}
              </h4>
              {(activeClub?.paymentStatus || selectedRosterTeam?.paymentStatus) && (
                <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded ${
                  (activeClub?.paymentStatus || selectedRosterTeam?.paymentStatus) === "PAID"
                    ? "bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62]"
                    : "bg-yellow-400/10 border border-yellow-400/30 text-yellow-400"
                }`}>
                  Payment: {activeClub?.paymentStatus || selectedRosterTeam?.paymentStatus}
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 mt-1">
              {activeClub?.contactEmail || selectedRosterTeam?.contactEmail || "No email"} • {activeClub?.contactPhone || selectedRosterTeam?.contactPhone || "No phone"}
            </p>
            {(activeClub?.coachName || selectedRosterTeam?.coachName) && (
              <p className="text-xs text-white/70 font-bold mt-0.5">
                Coach: {activeClub?.coachName || selectedRosterTeam?.coachName}
              </p>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Assigned Group</span>
          <span className="text-lg font-black text-[#00FF62] font-orbitron uppercase mt-1 block">
            {groupA.includes(selectedClubId) ? "Group A" : groupB.includes(selectedClubId) ? "Group B" : (activeClub?.allocatedGroup || selectedRosterTeam?.allocatedGroup || "Unallocated")}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase text-white/40 tracking-widest font-orbitron">
            Registered Player Roster ({activeRosterList.length})
          </h4>
          {(isRosterLoading || isRosterFetching) && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <div className="size-3.5 border-2 border-t-[#00FF62] border-white/20 rounded-full animate-spin" />
              <span className="text-[11px] font-medium">Syncing roster...</span>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-12">#</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40">Player Name</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40">Date of Birth</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-24">Shirt No.</th>
              </tr>
            </thead>
            <tbody>
              {isRosterLoading && activeRosterList.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5 animate-pulse">
                    <td className="p-4 text-center">
                      <Skeleton className="h-4 w-4 bg-white/10 mx-auto rounded" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-32 bg-white/10 rounded" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-4 w-24 bg-white/5 rounded" />
                    </td>
                    <td className="p-4 text-center">
                      <Skeleton className="h-4 w-8 bg-white/10 mx-auto rounded" />
                    </td>
                  </tr>
                ))
              ) : activeRosterList.length > 0 ? (
                activeRosterList.map((player: any, idx: number) => {
                  const playerName = player.fullName || player.name || "Unnamed Player";
                  const playerDob = player.dateOfBirth || player.dob || "—";
                  const playerShirt = player.shirtNo !== undefined && player.shirtNo !== null 
                    ? player.shirtNo 
                    : (player.shirt || "—");

                  return (
                    <tr key={player._id || player.playerId || idx} className="border-b border-white/5 hover:bg-white/1">
                      <td className="p-4 text-center font-black text-xs text-white/40 font-orbitron">{idx + 1}</td>
                      <td className="p-4 text-sm font-bold text-white uppercase">{playerName}</td>
                      <td className="p-4 text-sm text-white/60">{playerDob}</td>
                      <td className="p-4 text-center font-black text-sm text-[#00FF62] font-orbitron">{playerShirt}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-xs text-white/30 uppercase font-black font-orbitron">
                    No players registered on this roster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardModal>

</div>
);
}
export default EventDetailPage;

interface TournamentSectionProps {
  eventId?: string;
  ageGroup: string;
  status: "registration" | "live" | "completed";
  groupFixtures: any[];
  semis: any[];
  final: any;
  groupA: string[];
  groupB: string[];
  teams: any[];
  renderTeamLogo: (id: string, size?: string) => React.ReactNode;
  getTeamName: (id: string, def?: string) => string;
  calculateStandings: (grp: string) => any[];
  onStartLive?: () => void;
  onSimulate?: () => void;
}

const TournamentSection = ({
  eventId,
  ageGroup,
  status,
  groupFixtures,
  semis,
  final,
  groupA,
  groupB,
  teams,
  renderTeamLogo,
  getTeamName,
  calculateStandings,
  onStartLive,
  onSimulate
}: TournamentSectionProps) => {
  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "bracket">("standings");
  const [selectedGroup, setSelectedGroup] = useState<"Group A" | "Group B">("Group A");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // RTK Query: Fetch arena tab data (standings, fixtures, bracket)
  const { 
    data: arenaResponse, 
    isLoading: isArenaLoading, 
    isFetching: isArenaFetching 
  } = useGetTournamentArenaQuery(
    { eventId: eventId || "", tab: activeTab },
    { skip: !eventId }
  );

  const arenaData = arenaResponse?.data;

  // Resolve API Fixtures
  const apiFixtures = 
    arenaData?.fixtures || 
    arenaData?.matches || 
    arenaData?.groupFixtures || 
    (activeTab === "fixtures" && Array.isArray(arenaData) ? arenaData : null);

  const resolvedFixtures: any[] = (Array.isArray(apiFixtures) && apiFixtures.length > 0)
    ? apiFixtures.map((f: any, idx: number) => ({
        id: f.id || f._id || `fixture-${idx}`,
        round: f.round || f.stage || "Group Stage",
        group: f.group || f.groupName || (f.round === "Group Stage" ? "Group A" : "Playoffs"),
        status: f.status || (f.isCompleted ? "Completed" : "Scheduled"),
        team1Id: f.team1Id || f.homeTeamId || f.team1?._id || f.team1?.id || f.teamAId || "",
        team2Id: f.team2Id || f.awayTeamId || f.team2?._id || f.team2?.id || f.teamBId || "",
        team1Name: f.team1Name || f.homeTeamName || f.team1?.name || f.teamA?.name || "",
        team2Name: f.team2Name || f.awayTeamName || f.team2?.name || f.teamB?.name || "",
        score1: f.score1 ?? f.homeScore ?? f.scoreA ?? (typeof f.homeGoals === "number" ? f.homeGoals : null),
        score2: f.score2 ?? f.awayScore ?? f.scoreB ?? (typeof f.awayGoals === "number" ? f.awayGoals : null),
        date: f.date || f.matchDate || "Day 1",
        pitch: f.pitch || f.venue || "Pitch A",
        time: f.time || f.matchTime || "10:00"
      }))
    : groupFixtures;

  // Resolve API Standings based on selected group or full standings
  const isGroupA = selectedGroup === "Group A";
  const apiStandings = 
    (isGroupA ? (arenaData?.groupA || arenaData?.groupAStandings || arenaData?.standings?.groupA) : (arenaData?.groupB || arenaData?.groupBStandings || arenaData?.standings?.groupB)) ||
    (Array.isArray(arenaData?.standings) 
      ? arenaData.standings.filter((row: any) => !row.group || row.group === selectedGroup || row.groupName === selectedGroup)
      : null) ||
    arenaData?.tables?.[isGroupA ? "groupA" : "groupB"] ||
    (Array.isArray(arenaData?.tables) ? arenaData.tables : null) ||
    (activeTab === "standings" && Array.isArray(arenaData) ? arenaData : null);

  const resolvedStandings: any[] = (Array.isArray(apiStandings) && apiStandings.length > 0)
    ? apiStandings.map((row: any, idx: number) => ({
        id: row.id || row.clubId || row._id || `team-${idx}`,
        name: row.name || row.clubName || row.teamName || getTeamName(row.id || row.clubId || row._id),
        p: row.p ?? row.played ?? row.matchesPlayed ?? 0,
        w: row.w ?? row.won ?? row.wins ?? 0,
        d: row.d ?? row.draws ?? 0,
        l: row.l ?? row.lost ?? row.losses ?? 0,
        gf: row.gf ?? row.goalsFor ?? 0,
        ga: row.ga ?? row.goalsAgainst ?? 0,
        gd: row.gd ?? row.goalDifference ?? ((row.gf || 0) - (row.ga || 0)),
        pts: row.pts ?? row.points ?? 0
      }))
    : calculateStandings(selectedGroup);

  const categories = Array.from(
    new Set((ageGroup || "U-8, U-10").split(",").map((c) => c.trim()))
  );

  const mockRoundOf16 = Array.from({ length: 8 }, (_, i) => ({
    id: `r16-${i + 1}`,
    round: "Round of 16",
    date: "Day 2",
    team1Id: `r16-t${i * 2 + 1}`,
    team2Id: `r16-t${i * 2 + 2}`,
    team1Placeholder: `Group ${String.fromCharCode(65 + i)} Winner`,
    team2Placeholder: `Group ${String.fromCharCode(66 + i)} Runner-up`,
    score1: null,
    score2: null,
    winnerId: null,
  }));

  const mockQuarters = Array.from({ length: 4 }, (_, i) => ({
    id: `qf-${i + 1}`,
    round: "Quarter-Final",
    date: "Day 3",
    team1Id: `qf-t${i * 2 + 1}`,
    team2Id: `qf-t${i * 2 + 2}`,
    team1Placeholder: `Winner R16 ${i * 2 + 1}`,
    team2Placeholder: `Winner R16 ${i * 2 + 2}`,
    score1: null,
    score2: null,
    winnerId: null,
  }));

  const apiBracket = arenaData?.bracket || arenaData;
  const rawR16 = apiBracket?.roundOf16 || apiBracket?.r16;
  const resolvedR16 = (Array.isArray(rawR16) && rawR16.length > 0)
    ? rawR16.map((m: any, idx: number) => ({
        id: m.id || m._id || `r16-${idx + 1}`,
        round: m.round || "Round of 16",
        date: m.date || m.matchDate || "Day 2",
        team1Id: m.team1Id || m.team1?._id || m.homeTeamId || `r16-t${idx * 2 + 1}`,
        team2Id: m.team2Id || m.team2?._id || m.awayTeamId || `r16-t${idx * 2 + 2}`,
        team1Name: m.team1Name || m.homeTeamName || m.team1?.name || "",
        team2Name: m.team2Name || m.awayTeamName || m.team2?.name || "",
        team1Placeholder: m.team1Placeholder || `Group ${String.fromCharCode(65 + idx)} Winner`,
        team2Placeholder: m.team2Placeholder || `Group ${String.fromCharCode(66 + idx)} Runner-up`,
        score1: m.score1 ?? m.homeScore ?? null,
        score2: m.score2 ?? m.awayScore ?? null,
        winnerId: m.winnerId || m.winner || null,
      }))
    : mockRoundOf16;

  const rawQuarters = apiBracket?.quarterFinals || apiBracket?.quarters || apiBracket?.qf;
  const resolvedQuarters = (Array.isArray(rawQuarters) && rawQuarters.length > 0)
    ? rawQuarters.map((m: any, idx: number) => ({
        id: m.id || m._id || `qf-${idx + 1}`,
        round: m.round || "Quarter-Final",
        date: m.date || m.matchDate || "Day 3",
        team1Id: m.team1Id || m.team1?._id || m.homeTeamId || `qf-t${idx * 2 + 1}`,
        team2Id: m.team2Id || m.team2?._id || m.awayTeamId || `qf-t${idx * 2 + 2}`,
        team1Name: m.team1Name || m.homeTeamName || m.team1?.name || "",
        team2Name: m.team2Name || m.awayTeamName || m.team2?.name || "",
        team1Placeholder: m.team1Placeholder || `Winner R16 ${idx * 2 + 1}`,
        team2Placeholder: m.team2Placeholder || `Winner R16 ${idx * 2 + 2}`,
        score1: m.score1 ?? m.homeScore ?? null,
        score2: m.score2 ?? m.awayScore ?? null,
        winnerId: m.winnerId || m.winner || null,
      }))
    : mockQuarters;

  const rawSemis = apiBracket?.semiFinals || apiBracket?.semis || apiBracket?.sf;
  const resolvedSemis = (Array.isArray(rawSemis) && rawSemis.length > 0)
    ? rawSemis.map((m: any, idx: number) => ({
        id: m.id || m._id || `sf-${idx + 1}`,
        round: m.round || "Semi-Final",
        date: m.date || m.matchDate || "Day 4",
        team1Id: m.team1Id || m.team1?._id || m.homeTeamId || "",
        team2Id: m.team2Id || m.team2?._id || m.awayTeamId || "",
        team1Name: m.team1Name || m.homeTeamName || m.team1?.name || "",
        team2Name: m.team2Name || m.awayTeamName || m.team2?.name || "",
        team1Placeholder: m.team1Placeholder || `Semi-Finalist ${idx * 2 + 1}`,
        team2Placeholder: m.team2Placeholder || `Semi-Finalist ${idx * 2 + 2}`,
        score1: m.score1 ?? m.homeScore ?? null,
        score2: m.score2 ?? m.awayScore ?? null,
        winnerId: m.winnerId || m.winner || null,
      }))
    : semis;

  const rawFinal = apiBracket?.final || apiBracket?.championship;
  const resolvedFinal = rawFinal
    ? {
        id: rawFinal.id || rawFinal._id || "final-1",
        round: rawFinal.round || "Grand Final",
        date: rawFinal.date || rawFinal.matchDate || "Final Day",
        time: rawFinal.time || rawFinal.matchTime || "18:00",
        team1Id: rawFinal.team1Id || rawFinal.team1?._id || rawFinal.homeTeamId || "",
        team2Id: rawFinal.team2Id || rawFinal.team2?._id || rawFinal.awayTeamId || "",
        team1Name: rawFinal.team1Name || rawFinal.homeTeamName || rawFinal.team1?.name || "",
        team2Name: rawFinal.team2Name || rawFinal.awayTeamName || rawFinal.team2?.name || "",
        team1Placeholder: rawFinal.team1Placeholder || "Grand Finalist 1",
        team2Placeholder: rawFinal.team2Placeholder || "Grand Finalist 2",
        score1: rawFinal.score1 ?? rawFinal.homeScore ?? null,
        score2: rawFinal.score2 ?? rawFinal.awayScore ?? null,
        winnerId: rawFinal.winnerId || rawFinal.winner || null,
        winnerName: rawFinal.winnerName || rawFinal.winner?.name || null,
      }
    : final;

  const filteredFixtures = resolvedFixtures.filter((f) => {
    const t1 = (f.team1Name || getTeamName(f.team1Id)).toLowerCase();
    const t2 = (f.team2Name || getTeamName(f.team2Id)).toLowerCase();
    const q = searchQuery.toLowerCase();
    return t1.includes(q) || t2.includes(q);
  });

  return (
    <div className="bg-linear-to-b from-[#141417] via-[#0E0E10] to-[#0A0A0C] rounded-4xl border border-white/15 p-6 md:p-10 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-radial from-[#00FF62]/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-radial from-[#E31B23]/5 to-transparent pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/30 flex items-center justify-center text-[#E31B23] shadow-lg shadow-[#E31B23]/10">
              <IconTrophy size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
                  TOURNAMENT ARENA
                </h2>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1.5 border ${
                  status === "live" 
                    ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-sm shadow-red-500/20" 
                    : status === "completed"
                    ? "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62]"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                }`}>
                  <span className={`size-2 rounded-full ${status === "live" ? "bg-red-500 animate-ping" : status === "completed" ? "bg-[#00FF62]" : "bg-amber-400"}`} />
                  {status === "live" ? "🔴 LIVE MATCHES IN PROGRESS" : status === "completed" ? "🏆 TOURNAMENT FINISHED" : "📅 REGISTRATION & PREVIEW"}
                </span>

                {(isArenaLoading || isArenaFetching) && (
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest font-orbitron bg-white/5 border border-white/10 text-white/70 flex items-center gap-1.5 animate-pulse">
                    <IconRefresh size={11} className="animate-spin text-[#00FF62]" />
                    Syncing Arena...
                  </span>
                )}
              </div>
              <p className="text-white/50 font-bold uppercase tracking-widest text-[9px] mt-1">
                Official Live Standings, Match Schedules and Knockout Brackets
              </p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-black/70 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("standings")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${
              activeTab === "standings"
                ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <IconTable size={15} />
            Standings
          </button>
          <button
            onClick={() => setActiveTab("fixtures")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${
              activeTab === "fixtures"
                ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <IconCalendarEvent size={15} />
            Fixtures
          </button>
          <button
            onClick={() => setActiveTab("bracket")}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer font-orbitron ${
              activeTab === "bracket"
                ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <IconTrophy size={15} />
            Bracket
          </button>
        </div>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 relative z-10 bg-white/2 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 font-orbitron mr-1 shrink-0">Category:</span>
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-white text-black border-white shadow-md font-orbitron"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative shrink-0 w-full sm:w-64">
          <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team or squad..."
            className="w-full bg-black/60 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
          />
        </div>
      </div>

      {/* Registration Mode Preview Banner */}
      {status === "registration" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-amber-300">
          <div className="flex items-center gap-2.5">
            <IconSparkles size={18} className="shrink-0 text-amber-400 animate-pulse" />
            <span className="text-xs font-medium">
              Showing live tournament structure. Click <strong>Generate Results</strong> to simulate live scores and populate standings tables instantly.
            </span>
          </div>
          {onSimulate && (
            <button
              onClick={onSimulate}
              className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[9px] py-2 px-4 rounded-xl transition-all font-orbitron cursor-pointer shrink-0 shadow-md"
            >
              Simulate Live Scores
            </button>
          )}
        </div>
      )}

      {/* TAB 1: STANDINGS */}
      {activeTab === "standings" && (
        <div className="flex flex-col gap-6 relative z-10">
          {/* Group Selector */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex bg-black/50 p-1 rounded-xl border border-white/10">
              {["Group A", "Group B"].map((grp) => (
                <button
                  key={grp}
                  onClick={() => setSelectedGroup(grp as any)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer font-orbitron ${
                    selectedGroup === grp
                      ? "bg-[#E31B23] text-white shadow-md shadow-[#E31B23]/20"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <span className="size-2.5 rounded-sm bg-[#00FF62]" /> Top 2 teams qualify for Championship Semi-Finals
            </div>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto rounded-3xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-md">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center w-14 font-orbitron">POS</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron">SQUAD / CLUB</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">P</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">W</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">D</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">L</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GF</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GA</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-white/40 text-center font-orbitron">GD</th>
                  <th className="p-4 text-[9px] font-black uppercase tracking-wider text-[#00FF62] text-center font-orbitron">PTS</th>
                </tr>
              </thead>
              <tbody>
                {isArenaLoading && resolvedStandings.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={`standings-skel-${i}`} className="border-b border-white/5">
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="size-7 rounded-full bg-white/10" />
                          <Skeleton className="h-4 w-32 bg-white/10" />
                        </div>
                      </td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-4 w-6 mx-auto bg-white/10" /></td>
                      <td className="p-4 text-center"><Skeleton className="h-5 w-8 mx-auto bg-[#00FF62]/20" /></td>
                    </tr>
                  ))
                ) : (
                  resolvedStandings
                    .filter((row: any) => (row.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((row: any, idx: number) => {
                      const isQualified = idx < 2;
                      return (
                        <tr 
                          key={row.id || idx} 
                          className={`border-b border-white/5 transition-all hover:bg-white/5 ${
                            isQualified ? "bg-[#00FF62]/5 border-l-4 border-l-[#00FF62]" : ""
                          }`}
                        >
                          <td className="p-4 text-center font-black text-xs font-orbitron">
                            <div className="flex items-center justify-center gap-1">
                              <span className={isQualified ? "text-[#00FF62]" : "text-white/60"}>{idx + 1}</span>
                              {isQualified && (
                                <span className="bg-[#00FF62]/20 text-[#00FF62] text-[8px] font-black px-1.5 py-0.2 rounded font-orbitron">Q</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => {
                                setActiveTab("fixtures");
                                setSearchQuery(row.name);
                              }}
                              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-full text-left"
                            >
                              {renderTeamLogo(row.id, "size-7")}
                              <span className="text-sm font-bold text-white uppercase tracking-tight">{row.name}</span>
                            </button>
                          </td>
                          <td className="p-4 text-center font-bold text-sm text-white">{row.p}</td>
                          <td className="p-4 text-center text-sm font-bold text-[#00FF62]">{row.w}</td>
                          <td className="p-4 text-center text-sm font-bold text-white/40">{row.d}</td>
                          <td className="p-4 text-center text-sm font-bold text-red-400">{row.l}</td>
                          <td className="p-4 text-center text-sm text-white/60">{row.gf}</td>
                          <td className="p-4 text-center text-sm text-white/60">{row.ga}</td>
                          <td className={`p-4 text-center text-sm font-bold ${row.gd > 0 ? 'text-[#00FF62]' : row.gd < 0 ? 'text-red-400' : 'text-white/60'}`}>
                            {row.gd > 0 ? `+${row.gd}` : row.gd}
                          </td>
                          <td className="p-4 text-center font-black text-base text-[#00FF62] font-orbitron">{row.pts}</td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FIXTURES */}
      {activeTab === "fixtures" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {isArenaLoading && resolvedFixtures.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`fixture-skel-${i}`} className="bg-black/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-xl">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-28 bg-white/10 rounded" />
                  <Skeleton className="h-4 w-20 bg-white/10 rounded-full" />
                </div>
                <div className="flex items-center justify-between gap-3 my-2 bg-white/2 p-4 rounded-2xl border border-white/5">
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="size-10 rounded-full bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                  <Skeleton className="h-10 w-20 bg-white/10 rounded-2xl shrink-0" />
                  <div className="flex-1 flex flex-col items-center gap-2">
                    <Skeleton className="size-10 rounded-full bg-white/10" />
                    <Skeleton className="h-3 w-20 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <Skeleton className="h-3 w-16 bg-white/5 rounded" />
                  <Skeleton className="h-4 w-16 bg-white/10 rounded-lg" />
                  <Skeleton className="h-3 w-16 bg-white/5 rounded" />
                </div>
              </div>
            ))
          ) : (
            (filteredFixtures.length > 0 ? filteredFixtures : resolvedFixtures).map((f) => (
              <div key={f.id} className="bg-black/60 border border-white/10 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-xl hover:border-white/20 transition-all">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-white/40 font-orbitron">
                    {f.round} ({f.group})
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-orbitron flex items-center gap-1 ${
                    f.status === 'Completed' 
                      ? 'bg-[#00FF62]/10 text-[#00FF62] border border-[#00FF62]/30' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {f.status === 'Completed' ? 'FULL TIME' : '🔴 LIVE MATCH'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 my-2 bg-white/2 p-4 rounded-2xl border border-white/5">
                  <div className="flex-1 text-center flex flex-col items-center gap-2 min-w-0">
                    {renderTeamLogo(f.team1Id, "size-10")}
                    <div className="text-xs font-bold text-white uppercase truncate max-w-28">
                      {f.team1Name || getTeamName(f.team1Id)}
                    </div>
                  </div>

                  <div className="bg-black border border-white/15 px-5 py-3 rounded-2xl shrink-0 font-black text-lg font-orbitron text-white text-center shadow-inner">
                    {f.status === 'Completed' ? `${f.score1} - ${f.score2}` : f.score1 !== null ? `${f.score1} - ${f.score2}` : 'VS'}
                  </div>

                  <div className="flex-1 text-center flex flex-col items-center gap-2 min-w-0">
                    {renderTeamLogo(f.team2Id, "size-10")}
                    <div className="text-xs font-bold text-white uppercase truncate max-w-28">
                      {f.team2Name || getTeamName(f.team2Id)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-white/40 font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                  <span>{f.date}</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-[#00FF62] font-orbitron">{f.pitch || "Pitch A"}</span>
                  <span>KO {f.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: BRACKET */}
      {activeTab === "bracket" && (
        <div className="flex flex-row items-center justify-start gap-10 py-6 relative z-10 overflow-x-auto pb-10 w-full">

          {/* Round of 16 */}
          <div className="flex flex-col gap-6 w-full min-w-70 max-w-sm shrink-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-[#E31B23]" />
              Round of 16
            </h4>
            {resolvedR16.map((match: any) => (
              <div key={match.id} className="bg-black/60 border border-white/15 rounded-3xl p-5 flex flex-col gap-4 relative shadow-2xl hover:border-white/25 transition-all">
                <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Match #{String(match.id).replace('r16-', '')} ({match.round})</span>
                  <span>{match.date}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-2 rounded-xl transition-all">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team1Id, "size-6")}
                      <span className="text-xs text-white/60">
                        {match.team1Name || getTeamName(match.team1Id, match.team1Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score1 !== null ? match.score1 : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl transition-all">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team2Id, "size-6")}
                      <span className="text-xs text-white/60">
                        {match.team2Name || getTeamName(match.team2Id, match.team2Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score2 !== null ? match.score2 : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block w-8 h-0.5 bg-white/10 shrink-0 self-center" />

          {/* Quarter-Finals */}
          <div className="flex flex-col gap-6 w-full min-w-70 max-w-sm shrink-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-[#E31B23]" />
              Quarter-Finals
            </h4>
            {resolvedQuarters.map((match: any) => (
              <div key={match.id} className="bg-black/60 border border-white/15 rounded-3xl p-5 flex flex-col gap-4 relative shadow-2xl hover:border-white/25 transition-all">
                <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Match #{String(match.id).replace('qf-', '')} ({match.round})</span>
                  <span>{match.date}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-2 rounded-xl transition-all">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team1Id, "size-6")}
                      <span className="text-xs text-white/60">
                        {match.team1Name || getTeamName(match.team1Id, match.team1Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score1 !== null ? match.score1 : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl transition-all">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team2Id, "size-6")}
                      <span className="text-xs text-white/60">
                        {match.team2Name || getTeamName(match.team2Id, match.team2Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score2 !== null ? match.score2 : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block w-8 h-0.5 bg-white/10 shrink-0 self-center" />

          {/* Semifinals */}
          <div className="flex flex-col gap-6 w-full min-w-70 max-w-sm shrink-0">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 text-center font-orbitron flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-[#E31B23]" />
              Semi-Final Knockouts
            </h4>
            {resolvedSemis.map((match: any) => (
              <div key={match.id} className="bg-black/60 border border-white/15 rounded-3xl p-5 flex flex-col gap-4 relative shadow-2xl hover:border-white/25 transition-all">
                <div className="flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
                  <span>Match #{match.id} ({match.round})</span>
                  <span>{match.date}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all ${match.winnerId && match.winnerId === match.team1Id ? 'bg-[#00FF62]/10 border border-[#00FF62]/30' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team1Id, "size-6")}
                      <span className={`text-xs ${match.winnerId && match.winnerId === match.team1Id ? 'font-black text-white' : 'text-white/60'}`}>
                        {match.team1Name || getTeamName(match.team1Id, match.team1Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score1 !== null ? match.score1 : "-"}
                    </span>
                  </div>

                  <div className={`flex justify-between items-center p-2 rounded-xl transition-all ${match.winnerId && match.winnerId === match.team2Id ? 'bg-[#00FF62]/10 border border-[#00FF62]/30' : ''}`}>
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(match.team2Id, "size-6")}
                      <span className={`text-xs ${match.winnerId && match.winnerId === match.team2Id ? 'font-black text-white' : 'text-white/60'}`}>
                        {match.team2Name || getTeamName(match.team2Id, match.team2Placeholder)}
                      </span>
                    </div>
                    <span className="text-xs font-black text-white font-orbitron bg-black/60 px-2.5 py-1 rounded-lg border border-white/10">
                      {match.score2 !== null ? match.score2 : "-"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block w-12 h-0.5 bg-linear-to-r from-white/10 via-[#E31B23] to-amber-500 shrink-0" />

          {/* Grand Final */}
          {resolvedFinal && (
            <div className="w-full max-w-sm flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 text-center font-orbitron animate-pulse flex items-center justify-center gap-2">
                <IconCrown size={14} />
                Championship Grand Final
              </h4>
              <div className="bg-linear-to-b from-[#E31B23]/10 via-black to-black border-2 border-amber-500/40 rounded-4xl p-6 flex flex-col gap-4 relative shadow-2xl">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-amber-400 border-b border-amber-500/20 pb-2">
                  <span>Grand Final Championship</span>
                  <span>{resolvedFinal.date} - {resolvedFinal.time}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-2 rounded-xl border border-white/5 bg-white/2">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(resolvedFinal.team1Id, "size-7")}
                      <span className={`text-sm ${resolvedFinal.winnerId && resolvedFinal.winnerId === resolvedFinal.team1Id ? 'font-black text-white' : 'text-white/80'}`}>
                        {resolvedFinal.team1Name || getTeamName(resolvedFinal.team1Id, resolvedFinal.team1Placeholder)}
                      </span>
                    </div>
                    <span className="text-base font-black text-amber-400 font-orbitron">
                      {resolvedFinal.score1 !== null ? resolvedFinal.score1 : "TBD"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-xl border border-white/5 bg-white/2">
                    <div className="flex items-center gap-2.5">
                      {renderTeamLogo(resolvedFinal.team2Id, "size-7")}
                      <span className={`text-sm ${resolvedFinal.winnerId && resolvedFinal.winnerId === resolvedFinal.team2Id ? 'font-black text-white' : 'text-white/80'}`}>
                        {resolvedFinal.team2Name || getTeamName(resolvedFinal.team2Id, resolvedFinal.team2Placeholder)}
                      </span>
                    </div>
                    <span className="text-base font-black text-amber-400 font-orbitron">
                      {resolvedFinal.score2 !== null ? resolvedFinal.score2 : "TBD"}
                    </span>
                  </div>
                </div>

                {resolvedFinal.winnerId && (
                  <div className="mt-4 pt-4 border-t border-amber-500/30 flex flex-col items-center justify-center gap-1.5 bg-amber-500/10 rounded-2xl p-4">
                    <IconTrophy className="text-amber-400 animate-bounce" size={36} />
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">TOURNAMENT CHAMPION</p>
                    <p className="text-lg font-black text-amber-400 uppercase font-orbitron tracking-tight text-center">
                      {resolvedFinal.winnerName || getTeamName(resolvedFinal.winnerId)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

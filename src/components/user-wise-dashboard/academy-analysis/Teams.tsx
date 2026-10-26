/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconTrophy,
  IconBallFootball,
  IconPlus,
  IconAlertCircle,
  IconRefresh,
  IconLoader2,
  IconTrash,
  IconUserPlus,
  IconSearch,
  IconCheck,
  IconShirt,
} from "@tabler/icons-react";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  useGetAcademyCoachAndPlayersQuery,
  useCreateAcademyTeamMutation,
  useUpdateAcademyTeamMutation,
  useDeleteAcademyTeamMutation,
  useAssignCoachToTeamMutation,
  useAssignPlayerToTeamMutation,
  useRemoveCoachFromTeamMutation,
  useRemovePlayerFromTeamMutation,
} from "@/redux/features/academy/academyApi";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";
import { useGetPlayersQuery } from "@/redux/features/player/playerApi";
import {
  IAcademyTeamItem,
  ICreateAcademyTeamPayload,
  IUpdateAcademyTeamPayload,
} from "@/types/academy.type";
import { ICoachListItem } from "@/types/coach.type";
import { cn } from "@/lib/utils";

const AGE_GROUP_OPTIONS = [
  { value: "u15", label: "Under 15 (U15)" },
  { value: "u16", label: "Under 16 (U16)" },
  { value: "u17", label: "Under 17 (U17)" },
  { value: "u18", label: "Under 18 (U18)" },
  { value: "u19", label: "Under 19 (U19)" },
  { value: "u21", label: "Under 21 (U21)" },
  { value: "u23", label: "Under 23 (U23)" },
];

const formatAgeGroup = (ageGroup?: string) => {
  if (!ageGroup) return "N/A";
  const normalized = ageGroup.trim();
  if (normalized.toLowerCase().startsWith("u") && !isNaN(Number(normalized.slice(1)))) {
    return `Under ${normalized.slice(1)}`;
  }
  return ageGroup;
};

const Teams = () => {
  const router = useRouter();

  // Queries & Mutations
  const { data: response, isLoading, isError, refetch } = useGetAcademyCoachAndPlayersQuery();
  const { data: coachesData, isLoading: isLoadingCoaches } = useGetAllCoachesQuery();
  const { data: playersResponse, isLoading: isLoadingPlayers } = useGetPlayersQuery({});
  
  const [createTeam, { isLoading: isCreating }] = useCreateAcademyTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateAcademyTeamMutation();
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteAcademyTeamMutation();
  const [assignCoach, { isLoading: isAssigningCoach }] = useAssignCoachToTeamMutation();
  const [assignPlayer, { isLoading: isAssigningPlayer }] = useAssignPlayerToTeamMutation();
  const [removeCoach, { isLoading: isRemovingCoach }] = useRemoveCoachFromTeamMutation();
  const [removePlayer, { isLoading: isRemovingPlayer }] = useRemovePlayerFromTeamMutation();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<IAcademyTeamItem | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<IAcademyTeamItem | null>(null);
  const [assigningCoachTeam, setAssigningCoachTeam] = useState<IAcademyTeamItem | null>(null);
  const [assigningPlayerTeam, setAssigningPlayerTeam] = useState<IAcademyTeamItem | null>(null);
  const [coachToRemove, setCoachToRemove] = useState<{ teamId: string; coachId: string; name: string } | null>(null);
  const [playerToRemove, setPlayerToRemove] = useState<{ teamId: string; playerId: string; name: string } | null>(null);

  // Assign Coach state
  const [selectedCoachId, setSelectedCoachId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ASSISTANT COACH");
  const [coachSearch, setCoachSearch] = useState<string>("");

  // Assign Player state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [playerSearch, setPlayerSearch] = useState<string>("");

  // Add Form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm<ICreateAcademyTeamPayload>({
    defaultValues: {
      teamName: "",
      ageGroup: "u19",
      status: "ACTIVE",
    },
  });

  // Edit Form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<IUpdateAcademyTeamPayload>();

  const dashboardData = response?.data;
  const summary = dashboardData?.summary;
  const teams: IAcademyTeamItem[] = dashboardData?.teams || [];
  const coachesList: ICoachListItem[] = coachesData?.data || [];
  const playersList: any[] = playersResponse?.data || [];

  const handleOpenAdd = () => {
    resetAdd({
      teamName: "",
      ageGroup: "u19",
      status: "ACTIVE",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (team: IAcademyTeamItem) => {
    setEditingTeam(team);
    resetEdit({
      teamName: team.teamName,
      ageGroup: team.ageGroup?.toLowerCase() || "u19",
      status: (team.status || "ACTIVE").toUpperCase(),
    });
  };

  const handleOpenAssignCoach = (team: IAcademyTeamItem) => {
    setAssigningCoachTeam(team);
    setSelectedCoachId("");
    setSelectedRole("ASSISTANT COACH");
    setCoachSearch("");
  };

  const handleOpenAssignPlayer = (team: IAcademyTeamItem) => {
    setAssigningPlayerTeam(team);
    setSelectedPlayerId("");
    setPlayerSearch("");
  };

  const onAddSubmit = async (data: ICreateAcademyTeamPayload) => {
    try {
      await createTeam({
        teamName: data.teamName.trim(),
        ageGroup: data.ageGroup,
        status: data.status,
      }).unwrap();
      setIsAddOpen(false);
      resetAdd();
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const onEditSubmit = async (data: IUpdateAcademyTeamPayload) => {
    if (!editingTeam) return;
    try {
      await updateTeam({
        teamId: editingTeam._id,
        data: {
          teamName: data.teamName?.trim(),
          ageGroup: data.ageGroup,
          status: data.status,
        },
      }).unwrap();
      setEditingTeam(null);
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingTeam) return;
    try {
      await deleteTeam(deletingTeam._id).unwrap();
      setDeletingTeam(null);
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const onAssignCoachSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningCoachTeam || !selectedCoachId) return;

    try {
      await assignCoach({
        teamId: assigningCoachTeam._id,
        data: {
          coachId: selectedCoachId,
          role: selectedRole,
        },
      }).unwrap();
      setAssigningCoachTeam(null);
      setSelectedCoachId("");
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const onAssignPlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningPlayerTeam || !selectedPlayerId) return;

    try {
      await assignPlayer({
        teamId: assigningPlayerTeam._id,
        data: {
          playerId: selectedPlayerId,
        },
      }).unwrap();
      setAssigningPlayerTeam(null);
      setSelectedPlayerId("");
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const handleConfirmRemoveCoach = async () => {
    if (!coachToRemove) return;
    try {
      await removeCoach({
        teamId: coachToRemove.teamId,
        coachId: coachToRemove.coachId,
      }).unwrap();
      setCoachToRemove(null);
      refetch();
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  const handleConfirmRemovePlayer = async () => {
    if (!playerToRemove) return;
    try {
      await removePlayer({
        teamId: playerToRemove.teamId,
        playerId: playerToRemove.playerId,
      }).unwrap();
      setPlayerToRemove(null);
      refetch();
    } catch {
      // Handled in onQueryStarted toast
    }
  };

  // Filtered coaches
  const filteredCoaches = coachesList.filter((coach) => {
    const coachName = coach.fullName || (typeof coach.userId === "object" ? coach.userId?.name : "") || "";
    const coachEmail = (typeof coach.userId === "object" ? coach.userId?.email : "") || "";
    const coachTitle = coach.title || "";
    const search = coachSearch.toLowerCase();
    return (
      coachName.toLowerCase().includes(search) ||
      coachEmail.toLowerCase().includes(search) ||
      coachTitle.toLowerCase().includes(search)
    );
  });

  // Filtered players
  const filteredPlayers = playersList.filter((player) => {
    const playerName = player.fullName || (typeof player.userId === "object" ? player.userId?.name : "") || "";
    const playerEmail = (typeof player.userId === "object" ? player.userId?.email : "") || "";
    const position = player.position || "";
    const search = playerSearch.toLowerCase();
    return (
      playerName.toLowerCase().includes(search) ||
      playerEmail.toLowerCase().includes(search) ||
      position.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl sm:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
          Teams
        </h1>
        <p className="text-white/60 font-medium mt-2 text-base sm:text-lg">
          Manage your Coach and Players
        </p>
      </div>

      {/* Stats Section */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#111111] p-6 rounded-3xl border border-white/10 animate-pulse flex flex-col gap-4">
              <div className="size-12 rounded-2xl bg-white/5" />
              <div className="h-8 w-20 bg-white/10 rounded" />
              <div className="h-3 w-28 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-red-500">
            <IconAlertCircle className="size-6" />
            <span className="text-sm font-semibold">Failed to load coach and players data.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            <IconRefresh className="size-4" />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <DashboardStatCard 
            icon={<IconBallFootball size={24} />} 
            label="Teams" 
            value={String(summary?.totalTeams ?? teams.length ?? 0)} 
          />
          <DashboardStatCard 
            icon={<IconTrophy size={24} />} 
            label="Total Coach" 
            value={String(summary?.totalCoaches ?? 0)} 
          />
          <DashboardStatCard 
            icon={<IconUsers size={24} />} 
            label="Total Players" 
            value={String(summary?.totalPlayers ?? 0)} 
          />
        </div>
      )}

      {/* Teams Table Section */}
      <div className="bg-[#111111] rounded-3xl border border-white/20 p-6 md:p-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto min-w-0">
            <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate">
              My Teams
            </h2>
            <p className="text-white/60 font-medium text-xs uppercase tracking-widest mt-1 truncate">
              Coaches and Players
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            <IconPlus size={16} />
            Add Team
          </button>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 bg-white/2">
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20">
                  Team Name
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">
                  Age Group
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">
                  Coach
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">
                  Players
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">
                  Status
                </th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(3)].map((_, idx) => (
                  <tr key={idx} className="border-b border-white/10 animate-pulse">
                    <td className="py-6 px-6 border-r border-white/10">
                      <div className="h-4 w-32 bg-white/10 rounded" />
                    </td>
                    <td className="py-6 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-20 bg-white/10 rounded mx-auto" />
                    </td>
                    <td className="py-6 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-8 bg-white/10 rounded mx-auto" />
                    </td>
                    <td className="py-6 px-6 border-r border-white/10 text-center">
                      <div className="h-4 w-8 bg-white/10 rounded mx-auto" />
                    </td>
                    <td className="py-6 px-6 border-r border-white/10 text-center">
                      <div className="h-6 w-16 bg-white/10 rounded-full mx-auto" />
                    </td>
                    <td className="py-6 px-6 text-center">
                      <div className="h-8 w-28 bg-white/10 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-white/40 text-sm font-medium">
                    No teams found. Click &quot;Add Team&quot; to create your first team.
                  </td>
                </tr>
              ) : (
                teams.map((team, index) => {
                  const isActive = (team.status || "").toUpperCase() === "ACTIVE";
                  const coachCount = team.coachesCount ?? team.coachIds?.length ?? 0;
                  const playerCount = team.playersCount ?? team.playerIds?.length ?? 0;

                  return (
                    <tr 
                      key={team._id || index} 
                      className={cn(
                        "group hover:bg-white/2 transition-colors",
                        index !== teams.length - 1 ? "border-b border-white/20" : ""
                      )}
                    >
                      <td className="py-6 px-6 border-r border-white/20">
                        <span className="text-sm font-bold text-white group-hover:text-[#00FF85] transition-colors">
                          {team.teamName}
                        </span>
                      </td>
                      <td className="py-6 px-6 border-r border-white/20 text-center text-sm font-medium text-white/60">
                        {formatAgeGroup(team.ageGroup)}
                      </td>
                      <td className="py-6 px-6 border-r border-white/20 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-sm font-black text-white font-orbitron">
                            {coachCount}
                          </span>
                          <button
                            onClick={() => handleOpenAssignCoach(team)}
                            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/50 hover:text-[#00FF85] bg-white/5 hover:bg-[#00FF85]/10 border border-white/10 hover:border-[#00FF85]/30 px-2 py-1 rounded-lg transition-all cursor-pointer"
                            title="Assign Coach"
                          >
                            <IconUserPlus size={12} />
                            <span>Assign</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-6 px-6 border-r border-white/20 text-center">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <span className="text-sm font-black text-white font-orbitron">
                            {playerCount}
                          </span>
                          <button
                            onClick={() => handleOpenAssignPlayer(team)}
                            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/50 hover:text-[#00FF85] bg-white/5 hover:bg-[#00FF85]/10 border border-white/10 hover:border-[#00FF85]/30 px-2 py-1 rounded-lg transition-all cursor-pointer"
                            title="Assign Player"
                          >
                            <IconShirt size={12} />
                            <span>Assign</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-6 px-6 border-r border-white/20 text-center">
                        <span 
                          className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block",
                            isActive 
                              ? "bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20 shadow-[0_0_15px_rgba(0,255,133,0.1)]"
                              : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
                          )}
                        >
                          {team.status?.toUpperCase() || (isActive ? "ACTIVE" : "INACTIVE")}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenAssignCoach(team)}
                            className="size-9 sm:size-10 flex items-center justify-center rounded-xl border border-white/10 hover:border-[#00FF85]/40 bg-white/5 hover:bg-[#00FF85]/10 text-white/40 hover:text-[#00FF85] transition-all hover:scale-105 cursor-pointer"
                            title="Assign Coach to Team"
                          >
                            <IconUserPlus size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenAssignPlayer(team)}
                            className="size-9 sm:size-10 flex items-center justify-center rounded-xl border border-white/10 hover:border-[#00FF85]/40 bg-white/5 hover:bg-[#00FF85]/10 text-white/40 hover:text-[#00FF85] transition-all hover:scale-105 cursor-pointer"
                            title="Assign Player to Team"
                          >
                            <IconShirt size={18} />
                          </button>
                          <TableActionButtons
                            onView={() => router.push(`/dashboard/academy/analysis/teams/${team._id}`)}
                            onEdit={() => handleOpenEdit(team)}
                            onDelete={() => setDeletingTeam(team)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Coach Modal Dialog */}
      <Dialog open={!!assigningCoachTeam} onOpenChange={(open) => !open && setAssigningCoachTeam(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-3">
              <IconUserPlus className="text-[#00FF85] size-6" />
              <span>Assign Coach to {assigningCoachTeam?.teamName}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onAssignCoachSubmit} className="flex flex-col gap-5 mt-2">
            {/* Search Input */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                value={coachSearch}
                onChange={(e) => setCoachSearch(e.target.value)}
                placeholder="Search coaches by name or email..."
                className="w-full h-11 bg-white/2 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
              />
            </div>

            {/* Coach Selection List */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Select Coach {coachesList.length > 0 ? `(${coachesList.length} Available)` : ""}
              </label>

              {isLoadingCoaches ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40">
                  <IconLoader2 className="animate-spin size-6" />
                  <span className="text-xs">Loading coaches...</span>
                </div>
              ) : filteredCoaches.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs border border-white/5 rounded-xl bg-white/2">
                  No coaches found matching &quot;{coachSearch}&quot;
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2">
                  {filteredCoaches.map((coach) => {
                    const isSelected = selectedCoachId === coach._id;
                    const coachName = coach.fullName || (typeof coach.userId === "object" ? coach.userId?.name : "") || "Coach";
                    const avatarUrl = coach.profileImage || (typeof coach.userId === "object" ? coach.userId?.avatar : "");
                    
                    // Check if already assigned to this team
                    const isAlreadyAssigned = assigningCoachTeam?.coachIds?.some((c: any) => 
                      typeof c === "string" ? c === coach._id : (c?._id === coach._id || c?.coachId === coach._id)
                    );

                    return (
                      <div
                        key={coach._id}
                        onClick={() => {
                          if (!isAlreadyAssigned) {
                            setSelectedCoachId(coach._id);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                          isAlreadyAssigned
                            ? "opacity-50 border-white/5 bg-white/2 cursor-not-allowed"
                            : isSelected
                            ? "border-[#00FF85] bg-[#00FF85]/10 shadow-[0_0_15px_rgba(0,255,133,0.1)] cursor-pointer"
                            : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <Image 
                                src={avatarUrl} 
                                alt={coachName} 
                                width={40} 
                                height={40} 
                                className="size-full object-cover" 
                              />
                            ) : (
                              <IconUsers className="size-5 text-white/40" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                              {coachName}
                            </span>
                            <span className="text-[11px] text-white/50 truncate">
                              {coach.title || "Coach"} {coach.licenseStatus ? `• ${coach.licenseStatus}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyAssigned ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                                Assigned
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (assigningCoachTeam) {
                                    setCoachToRemove({
                                      teamId: assigningCoachTeam._id,
                                      coachId: coach._id,
                                      name: coachName,
                                    });
                                  }
                                }}
                                className="size-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                title="Remove coach from this team"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : isSelected ? (
                            <div className="size-6 rounded-full bg-[#00FF85] text-black flex items-center justify-center">
                              <IconCheck size={14} stroke={3} />
                            </div>
                          ) : (
                            <div className="size-6 rounded-full border border-white/20" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Assign Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("HEAD COACH")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    selectedRole === "HEAD COACH"
                      ? "border-[#00FF85] bg-[#00FF85]/15 text-[#00FF85]"
                      : "border-white/10 bg-white/2 text-white/60 hover:border-white/20"
                  )}
                >
                  Head Coach
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("ASSISTANT COACH")}
                  className={cn(
                    "p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    selectedRole === "ASSISTANT COACH"
                      ? "border-[#00FF85] bg-[#00FF85]/15 text-[#00FF85]"
                      : "border-white/10 bg-white/2 text-white/60 hover:border-white/20"
                  )}
                >
                  Assistant Coach
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setAssigningCoachTeam(null)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedCoachId || isAssigningCoach}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00e676] disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,133,0.3)]"
              >
                {isAssigningCoach && <IconLoader2 className="animate-spin size-4 text-black" />}
                <span>Assign Coach</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Player Modal Dialog */}
      <Dialog open={!!assigningPlayerTeam} onOpenChange={(open) => !open && setAssigningPlayerTeam(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-3">
              <IconShirt className="text-[#00FF85] size-6" />
              <span>Assign Player to {assigningPlayerTeam?.teamName}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onAssignPlayerSubmit} className="flex flex-col gap-5 mt-2">
            {/* Search Input */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                placeholder="Search players by name, position or country..."
                className="w-full h-11 bg-white/2 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FF85]/50 transition-all"
              />
            </div>

            {/* Player Selection List */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest">
                Select Player {playersList.length > 0 ? `(${playersList.length} Available)` : ""}
              </label>

              {isLoadingPlayers ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40">
                  <IconLoader2 className="animate-spin size-6" />
                  <span className="text-xs">Loading players...</span>
                </div>
              ) : filteredPlayers.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs border border-white/5 rounded-xl bg-white/2">
                  No players found matching &quot;{playerSearch}&quot;
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto pr-1 flex flex-col gap-2">
                  {filteredPlayers.map((player) => {
                    const isSelected = selectedPlayerId === player._id;
                    const playerName = player.fullName || (typeof player.userId === "object" ? player.userId?.name : "") || "Player";
                    const avatarUrl = player.profileImage || (typeof player.userId === "object" ? player.userId?.avatar : "");
                    
                    // Check if already assigned to this team
                    const isAlreadyAssigned = assigningPlayerTeam?.playerIds?.some((p: any) => 
                      typeof p === "string" ? p === player._id : (p?._id === player._id || p?.playerId === player._id)
                    );

                    return (
                      <div
                        key={player._id}
                        onClick={() => {
                          if (!isAlreadyAssigned) {
                            setSelectedPlayerId(player._id);
                          }
                        }}
                        className={cn(
                          "p-3 rounded-xl border transition-all flex items-center justify-between gap-3",
                          isAlreadyAssigned
                            ? "opacity-50 border-white/5 bg-white/2 cursor-not-allowed"
                            : isSelected
                            ? "border-[#00FF85] bg-[#00FF85]/10 shadow-[0_0_15px_rgba(0,255,133,0.1)] cursor-pointer"
                            : "border-white/10 bg-white/2 hover:border-white/20 hover:bg-white/5 cursor-pointer"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {avatarUrl ? (
                              <Image 
                                src={avatarUrl} 
                                alt={playerName} 
                                width={40} 
                                height={40} 
                                className="size-full object-cover" 
                              />
                            ) : (
                              <IconUsers className="size-5 text-white/40" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white truncate">
                                {playerName}
                              </span>
                              {player.overallRating ? (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 text-[#00FF85] font-orbitron">
                                  {player.overallRating}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-white/50 truncate">
                              {player.position || "Player"} {player.age ? `• ${player.age} yrs` : ""} {player.country ? `• ${player.country}` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isAlreadyAssigned ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md border border-amber-400/20">
                                Assigned
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (assigningPlayerTeam) {
                                    setPlayerToRemove({
                                      teamId: assigningPlayerTeam._id,
                                      playerId: player._id,
                                      name: playerName,
                                    });
                                  }
                                }}
                                className="size-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 text-destructive hover:text-destructive flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                                title="Remove player from this team"
                              >
                                <IconTrash size={13} />
                              </button>
                            </div>
                          ) : isSelected ? (
                            <div className="size-6 rounded-full bg-[#00FF85] text-black flex items-center justify-center">
                              <IconCheck size={14} stroke={3} />
                            </div>
                          ) : (
                            <div className="size-6 rounded-full border border-white/20" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setAssigningPlayerTeam(null)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedPlayerId || isAssigningPlayer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00FF85] hover:bg-[#00e676] disabled:opacity-50 text-black text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,133,0.3)]"
              >
                {isAssigningPlayer && <IconLoader2 className="animate-spin size-4 text-black" />}
                <span>Assign Player</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add New Team Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Add New Team
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd(onAddSubmit)} className="flex flex-col gap-6 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Team Name</label>
              <input
                type="text"
                placeholder="e.g. Santos"
                className="w-full h-12 bg-white/2 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all placeholder:text-gray-600"
                {...registerAdd("teamName", { required: "Team Name is required" })}
              />
              {addErrors.teamName && (
                <p className="text-xs text-red-500 font-bold">{addErrors.teamName.message}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Age Group</label>
              <select
                className="w-full h-12 bg-[#111111] border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all cursor-pointer"
                {...registerAdd("ageGroup", { required: "Age Group is required" })}
              >
                {AGE_GROUP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {addErrors.ageGroup && (
                <p className="text-xs text-red-500 font-bold">{addErrors.ageGroup.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input
                    type="radio"
                    value="ACTIVE"
                    className="accent-[#E31B23] size-4 cursor-pointer"
                    {...registerAdd("status")}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input
                    type="radio"
                    value="INACTIVE"
                    className="accent-[#E31B23] size-4 cursor-pointer"
                    {...registerAdd("status")}
                  />
                  Inactive
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.3)]"
              >
                {isCreating && <IconLoader2 className="animate-spin size-4" />}
                <span>Add Team</span>
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Edit Team
            </DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="flex flex-col gap-6 mt-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Santos"
                  className="w-full h-12 bg-white/2 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all placeholder:text-gray-600"
                  {...registerEdit("teamName", { required: "Team Name is required" })}
                />
                {editErrors.teamName && (
                  <p className="text-xs text-red-500 font-bold">{editErrors.teamName.message}</p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Age Group</label>
                <select
                  className="w-full h-12 bg-[#111111] border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all cursor-pointer"
                  {...registerEdit("ageGroup", { required: "Age Group is required" })}
                >
                  {AGE_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {editErrors.ageGroup && (
                  <p className="text-xs text-red-500 font-bold">{editErrors.ageGroup.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input
                      type="radio"
                      value="ACTIVE"
                      className="accent-[#E31B23] size-4 cursor-pointer"
                      {...registerEdit("status")}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                    <input
                      type="radio"
                      value="INACTIVE"
                      className="accent-[#E31B23] size-4 cursor-pointer"
                      {...registerEdit("status")}
                    />
                    Inactive
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.3)]"
                >
                  {isUpdating && <IconLoader2 className="animate-spin size-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <DialogContent className="bg-[#111111] border border-red-500/20 text-white rounded-3xl max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight flex items-center gap-3">
              <IconTrash className="text-red-500 size-6" />
              <span>Delete Team</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-sm text-white/70">
              Are you sure you want to delete <span className="font-bold text-white">&quot;{deletingTeam?.teamName}&quot;</span>? This action cannot be undone.
            </p>
            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setDeletingTeam(null)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                {isDeleting && <IconLoader2 className="animate-spin size-4" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Remove Coach Confirmation Dialog */}
      <Dialog open={Boolean(coachToRemove)} onOpenChange={(open) => !open && setCoachToRemove(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <IconTrash size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                  Remove Coach
                </DialogTitle>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  Remove from team roster
                </p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-white/70 mt-2">
            Are you sure you want to remove{" "}
            <span className="font-bold text-white uppercase">{coachToRemove?.name}</span> from this team?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <button
              type="button"
              onClick={() => setCoachToRemove(null)}
              disabled={isRemovingCoach}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemoveCoach}
              disabled={isRemovingCoach}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isRemovingCoach ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={14} className="animate-spin" /> Removing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <IconTrash size={14} /> Remove Coach
                </span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Player Confirmation Dialog */}
      <Dialog open={Boolean(playerToRemove)} onOpenChange={(open) => !open && setPlayerToRemove(null)}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-md p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
                <IconTrash size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase text-white font-orbitron tracking-tight">
                  Remove Player
                </DialogTitle>
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-0.5">
                  Remove from team roster
                </p>
              </div>
            </div>
          </DialogHeader>

          <p className="text-sm text-white/70 mt-2">
            Are you sure you want to remove{" "}
            <span className="font-bold text-white uppercase">{playerToRemove?.name}</span> from this team?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <button
              type="button"
              onClick={() => setPlayerToRemove(null)}
              disabled={isRemovingPlayer}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmRemovePlayer}
              disabled={isRemovingPlayer}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
            >
              {isRemovingPlayer ? (
                <span className="flex items-center gap-2">
                  <IconLoader2 size={14} className="animate-spin" /> Removing...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <IconTrash size={14} /> Remove Player
                </span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;

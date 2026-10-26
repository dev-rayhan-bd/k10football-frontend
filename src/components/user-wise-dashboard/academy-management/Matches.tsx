/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import { 
  IconSearch, 
  IconPlus, 
  IconCalendar,
  IconClock,
  IconChevronDown,
  IconEye,
  IconTrash,
  IconMapPin,
  IconTrophy,
  IconShieldCheck,
  IconAlertCircle,
  IconLoader2,
  IconRefresh,
  IconUsers,
  IconCoin,
  IconBus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { 
  useGetAcademyMatchesQuery,
  useCreateAcademyMatchMutation,
  useDeleteAcademyMatchMutation,
  useGetAcademyCoachAndPlayersQuery,
} from "@/redux/features/academy/academyApi";
import { IAcademyMatchItem } from "@/types/academy.type";
import { cn } from "@/lib/utils";

export const MatchesManagement = () => {
  // Queries
  const { data: matchesResponse, isLoading, isFetching, refetch } = useGetAcademyMatchesQuery();
  const { data: teamsResponse } = useGetAcademyCoachAndPlayersQuery();
  const [createMatch, { isLoading: isCreating }] = useCreateAcademyMatchMutation();
  const [deleteMatch, { isLoading: isDeleting }] = useDeleteAcademyMatchMutation();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterTeamId, setFilterTeamId] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMatchForView, setSelectedMatchForView] = useState<IAcademyMatchItem | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<IAcademyMatchItem | null>(null);

  // Form State
  const initialFormState = {
    matchTitle: "",
    ourTeamId: "",
    opponentTeam: "",
    matchType: "Friendly",
    competitionName: "",
    homeOrAway: "HOME GROUND" as "HOME GROUND" | "AWAY",
    venueName: "",
    venueAddress: "",
    matchDate: "",
    kickOffTime: "",
    referees: "",
    travelRequired: false,
    transportCost: "",
    groundCost: "",
    mealsCost: "",
    otherCosts: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Available teams from API
  const teamsList = teamsResponse?.data?.teams || [];

  // Match items from API
  const apiMatches: IAcademyMatchItem[] = matchesResponse?.data?.matches || [];

  // Filter & Search logic
  const filteredMatches = useMemo(() => {
    return apiMatches.filter((match) => {
      const matchTitle = (match.matchTitle || match.title || "").toLowerCase();
      const opponent = (match.opponentTeam || "").toLowerCase();
      const comp = (match.competitionName || "").toLowerCase();
      const venue = (match.venueName || match.venue?.name || "").toLowerCase();
      const ourTeamName = (match.ourTeam?.name || "").toLowerCase();

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query || 
        matchTitle.includes(query) || 
        opponent.includes(query) || 
        comp.includes(query) || 
        venue.includes(query) || 
        ourTeamName.includes(query);

      const matchesType = filterType === "ALL" || match.matchType?.toLowerCase() === filterType.toLowerCase();
      const matchesTeam = filterTeamId === "ALL" || match.ourTeamId === filterTeamId || match.ourTeam?._id === filterTeamId;
      const matchesStatus = filterStatus === "ALL" || match.status?.toUpperCase() === filterStatus.toUpperCase();

      return matchesSearch && matchesType && matchesTeam && matchesStatus;
    }).sort((a, b) => {
      const dateA = new Date(a.matchDate || a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.matchDate || b.date || b.createdAt || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [apiMatches, searchTerm, filterType, filterTeamId, filterStatus, sortOrder]);

  // Handle Form Input Changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Auto-generate title helper when ourTeam or opponent changes
  const handleOurTeamSelect = (teamId: string) => {
    const selectedTeam = teamsList.find((t) => t._id === teamId);
    handleInputChange("ourTeamId", teamId);
    if (selectedTeam && formData.opponentTeam) {
      if (!formData.matchTitle || formData.matchTitle.includes("vs")) {
        handleInputChange("matchTitle", `${selectedTeam.teamName} vs ${formData.opponentTeam}`);
      }
    }
  };

  const handleOpponentChange = (opponent: string) => {
    handleInputChange("opponentTeam", opponent);
    const selectedTeam = teamsList.find((t) => t._id === formData.ourTeamId);
    if (selectedTeam && opponent) {
      if (!formData.matchTitle || formData.matchTitle.includes("vs")) {
        handleInputChange("matchTitle", `${selectedTeam.teamName} vs ${opponent}`);
      }
    }
  };

  // Estimated Total Cost auto-calculation
  const calculatedTotal = useMemo(() => {
    const transport = parseFloat(formData.transportCost) || 0;
    const ground = parseFloat(formData.groundCost) || 0;
    const meals = parseFloat(formData.mealsCost) || 0;
    const other = parseFloat(formData.otherCosts) || 0;
    return transport + ground + meals + other;
  }, [formData.transportCost, formData.groundCost, formData.mealsCost, formData.otherCosts]);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.matchTitle.trim()) {
      errors.matchTitle = "Match title is required";
    }
    if (!formData.ourTeamId) {
      errors.ourTeamId = "Please select our academy team";
    }
    if (!formData.opponentTeam.trim()) {
      errors.opponentTeam = "Opponent team name is required";
    }
    if (!formData.matchType) {
      errors.matchType = "Match type is required";
    }
    if (!formData.venueName.trim()) {
      errors.venueName = "Venue name is required";
    }
    if (!formData.venueAddress.trim()) {
      errors.venueAddress = "Venue address is required";
    }
    if (!formData.matchDate) {
      errors.matchDate = "Match date is required";
    }
    if (!formData.kickOffTime) {
      errors.kickOffTime = "Kick-off time is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleScheduleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createMatch({
        matchTitle: formData.matchTitle.trim(),
        title: formData.matchTitle.trim(),
        ourTeamId: formData.ourTeamId,
        opponentTeam: formData.opponentTeam.trim(),
        matchType: formData.matchType,
        competitionName: formData.competitionName.trim() || undefined,
        homeOrAway: formData.homeOrAway,
        venueName: formData.venueName.trim(),
        venueAddress: formData.venueAddress.trim(),
        matchDate: formData.matchDate,
        kickOffTime: formData.kickOffTime,
        referees: formData.referees.trim() || undefined,
        travelRequired: formData.travelRequired,
        transportCost: parseFloat(formData.transportCost) || 0,
        groundCost: parseFloat(formData.groundCost) || 0,
        mealsCost: parseFloat(formData.mealsCost) || 0,
        otherCosts: parseFloat(formData.otherCosts) || 0,
        estimatedTotalCost: calculatedTotal,
        notes: formData.notes.trim() || undefined,
      }).unwrap();

      setShowScheduleModal(false);
      setFormData(initialFormState);
      setFormErrors({});
    } catch {
      // Toast notifications handled by onQueryStarted in RTK slice
    }
  };

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!matchToDelete?._id && !matchToDelete?.id) return;
    const matchId = matchToDelete._id || matchToDelete.id || "";
    try {
      await deleteMatch(matchId).unwrap();
      setMatchToDelete(null);
    } catch {
      // Toast notifications handled by onQueryStarted
    }
  };

  const hasActiveFilters = searchTerm !== "" || filterType !== "ALL" || filterTeamId !== "ALL" || filterStatus !== "ALL";

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("ALL");
    setFilterTeamId("ALL");
    setFilterStatus("ALL");
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Matches
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Schedule and track match costs
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Matches"
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white transition-all disabled:opacity-50 shrink-0"
          >
            <IconRefresh size={18} className={cn(isFetching && "animate-spin text-[#E31B23]")} />
          </button>
          <button 
            onClick={() => {
              setFormData(initialFormState);
              setFormErrors({});
              setShowScheduleModal(true);
            }}
            className="flex-1 md:flex-initial justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 active:scale-95"
          >
            <IconPlus size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Schedule Match</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-4 flex flex-col xl:flex-row gap-4 shadow-xl w-full max-w-full">
        {/* Search input */}
        <div className="relative flex-1 min-w-0 w-full">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search matches by team or competition..."
            className="w-full bg-white/5 border border-white/15 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 xl:pb-0 w-full xl:w-auto min-w-0 items-center">
          {/* Match Type Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-white/5 hover:bg-white/10 border border-white/15 px-4 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 focus:outline-none focus:border-white/30 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-[#111111] text-white">All Matches</option>
              <option value="Friendly" className="bg-[#111111] text-white">Friendly</option>
              <option value="League" className="bg-[#111111] text-white">League</option>
              <option value="Tournament" className="bg-[#111111] text-white">Tournament</option>
              <option value="Cup" className="bg-[#111111] text-white">Cup</option>
            </select>
            <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Teams Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterTeamId}
              onChange={(e) => setFilterTeamId(e.target.value)}
              className="appearance-none bg-white/5 hover:bg-white/10 border border-white/15 px-4 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 focus:outline-none focus:border-white/30 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-[#111111] text-white">All Teams</option>
              {teamsList.map((team) => (
                <option key={team._id} value={team._id} className="bg-[#111111] text-white">
                  {team.teamName} ({team.ageGroup})
                </option>
              ))}
            </select>
            <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="relative shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white/5 hover:bg-white/10 border border-white/15 px-4 pr-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 focus:outline-none focus:border-white/30 cursor-pointer transition-all"
            >
              <option value="ALL" className="bg-[#111111] text-white">All Status</option>
              <option value="SCHEDULED" className="bg-[#111111] text-white">Scheduled</option>
              <option value="COMPLETED" className="bg-[#111111] text-white">Completed</option>
              <option value="CANCELLED" className="bg-[#111111] text-white">Cancelled</option>
            </select>
            <IconChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="bg-white/5 hover:bg-white/10 border border-white/15 px-4 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold text-white/80 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <span>Date: {sortOrder === "desc" ? "Newest" : "Oldest"}</span>
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2.5 text-[10px] sm:text-[11px] font-bold text-[#E31B23] hover:text-[#C2181F] underline transition-all shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Match Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#111111] rounded-4xl border border-white/10 p-6 md:p-8 flex flex-col gap-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-white/10 rounded-xl" />
                  <div className="h-6 w-24 bg-white/10 rounded-xl" />
                </div>
              </div>
              <div className="h-8 w-3/4 bg-white/10 rounded-xl" />
              <div className="flex gap-4">
                <div className="h-4 w-28 bg-white/10 rounded-lg" />
                <div className="h-4 w-20 bg-white/10 rounded-lg" />
              </div>
              <div className="pt-6 border-t border-white/5 grid grid-cols-4 gap-4">
                <div className="h-8 bg-white/10 rounded-lg" />
                <div className="h-8 bg-white/10 rounded-lg" />
                <div className="h-8 bg-white/10 rounded-lg" />
                <div className="h-8 bg-white/10 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-12 md:p-16 flex flex-col items-center justify-center text-center gap-4 shadow-xl">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
            <IconCalendar size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">No Matches Found</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest max-w-md">
              {hasActiveFilters 
                ? "No scheduled matches match your search or filter criteria. Try adjusting your filters." 
                : "You don't have any scheduled matches right now. Create your first match to start tracking schedule and expenses."}
            </p>
          </div>
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="mt-2 px-5 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => {
                setFormData(initialFormState);
                setFormErrors({});
                setShowScheduleModal(true);
              }}
              className="mt-2 px-6 py-3 rounded-2xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-widest text-white flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20"
            >
              <IconPlus size={16} />
              Schedule First Match
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          {filteredMatches.map((match) => {
            const matchId = match._id || match.id || "";
            const title = match.matchTitle || match.title || `${match.ourTeam?.name || "Our Team"} vs ${match.opponentTeam}`;
            const dateStr = match.formattedDate || match.date || (match.matchDate ? new Date(match.matchDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A");
            const timeStr = match.kickOffTime || match.time || "TBD";
            const isHome = match.homeOrAway === "HOME GROUND" || match.venue?.homeOrAway === "HOME GROUND";
            const venueName = match.venueName || match.venue?.name;

            // Costs format fallback
            const transportVal = match.costs?.transportFormatted ?? (match.transportCost !== undefined ? `$${match.transportCost}` : "$0");
            const groundVal = match.costs?.groundCostFormatted ?? (match.groundCost !== undefined ? `$${match.groundCost}` : "$0");
            const otherVal = match.costs?.otherCostsFormatted ?? (match.otherCosts !== undefined ? `$${match.otherCosts}` : "$0");
            const totalVal = match.costs?.totalCostFormatted ?? (match.totalCost !== undefined ? `$${match.totalCost}` : (match.estimatedTotalCost !== undefined ? `$${match.estimatedTotalCost}` : "$0"));

            // Status Badge Colors
            const isScheduled = (match.status || "SCHEDULED").toUpperCase() === "SCHEDULED";
            const isCompleted = (match.status || "").toUpperCase() === "COMPLETED";

            return (
              <div 
                key={matchId} 
                className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 md:gap-8 hover:border-white/30 transition-all shadow-2xl group min-w-0 relative"
              >
                {/* Badges & Actions */}
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div className="flex gap-2 md:gap-3 flex-wrap items-center">
                    <span className={cn(
                      "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0 border",
                      isScheduled && "bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80]",
                      isCompleted && "bg-[#60A5FA]/10 border-[#60A5FA]/20 text-[#60A5FA]",
                      !isScheduled && !isCompleted && "bg-white/10 border-white/20 text-white/80"
                    )}>
                      {match.status || "SCHEDULED"}
                    </span>
                    <span className={cn(
                      "px-3 md:px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shrink-0 border",
                      isHome ? "bg-white/5 border-white/15 text-white/70" : "bg-amber-400/10 border-amber-400/20 text-amber-400"
                    )}>
                      {match.homeOrAway || (isHome ? "HOME GROUND" : "AWAY")}
                    </span>
                    {match.matchType && (
                      <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white/50 uppercase tracking-wider">
                        {match.matchType}
                      </span>
                    )}
                  </div>

                  {/* Actions: View Details & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedMatchForView(match)}
                      title="View Details"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
                    >
                      <IconEye size={17} />
                    </button>
                    <button
                      onClick={() => setMatchToDelete(match)}
                      title="Delete Match"
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <IconTrash size={17} />
                    </button>
                  </div>
                </div>

                {/* Match Title & Info */}
                <div className="space-y-3 min-w-0">
                  <h3 
                    onClick={() => setSelectedMatchForView(match)}
                    className="text-xl md:text-2xl font-black uppercase text-white font-orbitron leading-tight wrap-break-word cursor-pointer hover:text-white/80 transition-colors"
                  >
                    {title}
                  </h3>

                  {match.competitionName && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
                      <IconTrophy size={14} className="text-yellow-500/80 shrink-0" />
                      <span className="truncate">{match.competitionName}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-[10px] md:text-[11px] font-bold text-white/50 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <IconCalendar size={16} className="shrink-0 text-white/40" />
                      <span className="truncate">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconClock size={16} className="shrink-0 text-white/40" />
                      <span className="truncate">{timeStr}</span>
                    </div>
                    {venueName && (
                      <div className="flex items-center gap-1.5">
                        <IconMapPin size={15} className="shrink-0 text-white/40" />
                        <span className="truncate max-w-[180px]">{venueName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Costs Breakdown */}
                <div className="pt-6 md:pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Transport</p>
                    <p className="text-base font-black text-white truncate">{transportVal}</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Ground Cost</p>
                    <p className="text-base font-black text-white truncate">{groundVal}</p>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Other Costs</p>
                    <p className="text-base font-black text-white truncate">{otherVal}</p>
                  </div>
                  <div className="space-y-1 sm:text-right min-w-0">
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">Total Cost</p>
                    <p className="text-base font-black text-[#E31B23] truncate">{totalVal}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Match Details Modal */}
      <DashboardModal
        isOpen={!!selectedMatchForView}
        onClose={() => setSelectedMatchForView(null)}
        title="Match Details"
        subtitle="Full match specifications and expense tracking"
        maxWidth="max-w-4xl"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setSelectedMatchForView(null)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black uppercase tracking-widest text-white transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedMatchForView && (
          <div className="flex flex-col gap-8 text-white">
            {/* Header Card */}
            <div className="bg-[#161616] border border-white/15 rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3.5 py-1 rounded-xl text-[10px] font-black text-[#4ADE80] uppercase tracking-widest">
                    {selectedMatchForView.status || "SCHEDULED"}
                  </span>
                  <span className="bg-white/5 border border-white/10 px-3.5 py-1 rounded-xl text-[10px] font-black text-white/70 uppercase tracking-widest">
                    {selectedMatchForView.homeOrAway || "HOME GROUND"}
                  </span>
                  {selectedMatchForView.matchType && (
                    <span className="bg-[#E31B23]/10 border border-[#E31B23]/30 px-3.5 py-1 rounded-xl text-[10px] font-black text-[#E31B23] uppercase tracking-widest">
                      {selectedMatchForView.matchType}
                    </span>
                  )}
                </div>
                {selectedMatchForView.competitionName && (
                  <span className="text-xs font-bold text-white/60 flex items-center gap-1.5">
                    <IconTrophy size={16} className="text-yellow-500" />
                    {selectedMatchForView.competitionName}
                  </span>
                )}
              </div>

              <h2 className="text-2xl md:text-3xl font-black uppercase font-orbitron">
                {selectedMatchForView.matchTitle || selectedMatchForView.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2.5 text-xs">
                  <IconCalendar size={18} className="text-[#E31B23] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Match Date</p>
                    <p className="font-bold text-white/90">
                      {selectedMatchForView.formattedDate || selectedMatchForView.date || (selectedMatchForView.matchDate ? new Date(selectedMatchForView.matchDate).toLocaleDateString() : "N/A")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <IconClock size={18} className="text-[#E31B23] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Kick-off Time</p>
                    <p className="font-bold text-white/90">
                      {selectedMatchForView.kickOffTime || selectedMatchForView.time || "TBD"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <IconBus size={18} className="text-[#E31B23] shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Travel Required</p>
                    <p className="font-bold text-white/90">
                      {selectedMatchForView.travelRequired ? "Yes (Away Travel)" : "No"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teams Matchup Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-wider">
                  <IconShieldCheck size={16} className="text-[#4ADE80]" />
                  <span>Our Academy Team</span>
                </div>
                <h4 className="text-lg font-black text-white uppercase font-orbitron">
                  {selectedMatchForView.ourTeam?.name || "Our Team"}
                </h4>
                {selectedMatchForView.ourTeam?.ageGroup && (
                  <span className="text-xs text-white/60 font-semibold">
                    Age Group: {selectedMatchForView.ourTeam.ageGroup}
                  </span>
                )}
              </div>

              <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-wider">
                  <IconUsers size={16} className="text-[#E31B23]" />
                  <span>Opponent Team</span>
                </div>
                <h4 className="text-lg font-black text-white uppercase font-orbitron">
                  {selectedMatchForView.opponentTeam}
                </h4>
                <span className="text-xs text-white/60 font-semibold">
                  Competitor Club
                </span>
              </div>
            </div>

            {/* Venue & Officials Details */}
            <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80 font-orbitron flex items-center gap-2">
                <IconMapPin size={18} className="text-[#E31B23]" />
                Venue & Officials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Venue Name</p>
                  <p className="text-sm font-bold text-white">
                    {selectedMatchForView.venueName || selectedMatchForView.venue?.name || "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Venue Address</p>
                  <p className="text-sm font-bold text-white">
                    {selectedMatchForView.venueAddress || selectedMatchForView.venue?.address || "Not specified"}
                  </p>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Referees / Officials</p>
                  <p className="text-sm font-bold text-white">
                    {selectedMatchForView.referees || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Costs Breakdown Detailed Table */}
            <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/80 font-orbitron flex items-center gap-2">
                <IconCoin size={18} className="text-yellow-400" />
                Cost Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#111111] p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Transport</p>
                  <p className="text-lg font-black text-white">
                    {selectedMatchForView.costs?.transportFormatted ?? `$${selectedMatchForView.transportCost || 0}`}
                  </p>
                </div>
                <div className="bg-[#111111] p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Ground Cost</p>
                  <p className="text-lg font-black text-white">
                    {selectedMatchForView.costs?.groundCostFormatted ?? `$${selectedMatchForView.groundCost || 0}`}
                  </p>
                </div>
                <div className="bg-[#111111] p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Meals</p>
                  <p className="text-lg font-black text-white">
                    {selectedMatchForView.costs?.mealsCostFormatted ?? `$${selectedMatchForView.mealsCost || 0}`}
                  </p>
                </div>
                <div className="bg-[#111111] p-4 rounded-xl border border-white/10 space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Other Costs</p>
                  <p className="text-lg font-black text-white">
                    {selectedMatchForView.costs?.otherCostsFormatted ?? `$${selectedMatchForView.otherCosts || 0}`}
                  </p>
                </div>
              </div>
              <div className="bg-[#111111] p-4 rounded-xl border border-[#E31B23]/30 flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-widest text-white/80">Total Match Cost</span>
                <span className="text-xl font-black text-[#E31B23]">
                  {selectedMatchForView.costs?.totalCostFormatted ?? `$${selectedMatchForView.totalCost || selectedMatchForView.estimatedTotalCost || 0}`}
                </span>
              </div>
            </div>

            {/* Additional Notes */}
            {selectedMatchForView.notes && (
              <div className="bg-[#161616] border border-white/15 rounded-2xl p-5 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Special Instructions & Notes</p>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                  {selectedMatchForView.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </DashboardModal>

      {/* Schedule Match Modal */}
      <DashboardModal
        isOpen={showScheduleModal}
        onClose={() => {
          if (!isCreating) {
            setShowScheduleModal(false);
          }
        }}
        title="Schedule Match"
        subtitle="Schedule a new match and track associated costs"
        showBackButton
        onBack={() => setShowScheduleModal(false)}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button 
              type="button"
              disabled={isCreating}
              onClick={() => setShowScheduleModal(false)}
              className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleScheduleSubmit}
              disabled={isCreating}
              className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {isCreating ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  <span>Create Match</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-10">
          {/* Match Information */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Match Title */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Title <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.matchTitle}
                  onChange={(e) => handleInputChange("matchTitle", e.target.value)}
                  placeholder="e.g., Santos FC U-15 vs Manchester City U-15" 
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.matchTitle 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.matchTitle && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.matchTitle}
                  </p>
                )}
              </div>

              {/* Our Team */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Our Team <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.ourTeamId}
                    onChange={(e) => handleOurTeamSelect(e.target.value)}
                    className={cn(
                      "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm appearance-none focus:outline-none transition-all cursor-pointer",
                      formData.ourTeamId ? "text-white" : "text-white/40",
                      formErrors.ourTeamId 
                        ? "border-red-500 focus:border-red-500" 
                        : "border-white/15 focus:border-white/30"
                    )}
                  >
                    <option value="" className="bg-[#111111] text-white/40">Select an academy team</option>
                    {teamsList.map((team) => (
                      <option key={team._id} value={team._id} className="bg-[#111111] text-white">
                        {team.teamName} ({team.ageGroup})
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                </div>
                {formErrors.ourTeamId && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.ourTeamId}
                  </p>
                )}
              </div>

              {/* Opponent Team */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Opponent Team <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.opponentTeam}
                  onChange={(e) => handleOpponentChange(e.target.value)}
                  placeholder="Enter opponent name (e.g. Manchester City U-15)" 
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.opponentTeam 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.opponentTeam && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.opponentTeam}
                  </p>
                )}
              </div>

              {/* Match Type */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Type <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.matchType}
                    onChange={(e) => handleInputChange("matchType", e.target.value)}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/30 transition-all cursor-pointer"
                  >
                    <option value="Friendly" className="bg-[#111111] text-white">Friendly</option>
                    <option value="League" className="bg-[#111111] text-white">League</option>
                    <option value="Tournament" className="bg-[#111111] text-white">Tournament</option>
                    <option value="Cup" className="bg-[#111111] text-white">Cup</option>
                    <option value="Training Match" className="bg-[#111111] text-white">Training Match</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Competition Name */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Competition Name</label>
                <input 
                  type="text" 
                  value={formData.competitionName}
                  onChange={(e) => handleInputChange("competitionName", e.target.value)}
                  placeholder="e.g., Regional Youth League / National Cup" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Venue Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home / Away */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Home / Away <span className="text-[#E31B23]">*</span>
                </label>
                <div className="relative">
                  <select 
                    value={formData.homeOrAway}
                    onChange={(e) => {
                      const val = e.target.value as "HOME GROUND" | "AWAY";
                      handleInputChange("homeOrAway", val);
                      if (val === "AWAY") {
                        handleInputChange("travelRequired", true);
                      }
                    }}
                    className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white appearance-none focus:outline-none focus:border-white/30 transition-all cursor-pointer"
                  >
                    <option value="HOME GROUND" className="bg-[#111111] text-white">Home Ground</option>
                    <option value="AWAY" className="bg-[#111111] text-white">Away Ground</option>
                  </select>
                  <IconChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Venue Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Venue Name <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.venueName}
                  onChange={(e) => handleInputChange("venueName", e.target.value)}
                  placeholder="Stadium or field name (e.g. Santos Home Stadium)" 
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.venueName 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.venueName && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.venueName}
                  </p>
                )}
              </div>

              {/* Venue Address */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Venue Address <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.venueAddress}
                  onChange={(e) => handleInputChange("venueAddress", e.target.value)}
                  placeholder="Full physical address" 
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all",
                    formErrors.venueAddress 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.venueAddress && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.venueAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Date & Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Match Date <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="date" 
                  value={formData.matchDate}
                  onChange={(e) => handleInputChange("matchDate", e.target.value)}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all",
                    formErrors.matchDate 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.matchDate && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.matchDate}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                  Kick-off Time <span className="text-[#E31B23]">*</span>
                </label>
                <input 
                  type="time" 
                  value={formData.kickOffTime}
                  onChange={(e) => handleInputChange("kickOffTime", e.target.value)}
                  className={cn(
                    "w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all",
                    formErrors.kickOffTime 
                      ? "border-red-500 focus:border-red-500" 
                      : "border-white/15 focus:border-white/30"
                  )}
                />
                {formErrors.kickOffTime && (
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1 mt-1">
                    <IconAlertCircle size={14} className="shrink-0" />
                    {formErrors.kickOffTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Match Officials */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Officials</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Referee(s)</label>
              <input 
                type="text" 
                value={formData.referees}
                onChange={(e) => handleInputChange("referees", e.target.value)}
                placeholder="Enter referee names or assignment details (e.g. John Doe, Alex Smith)" 
                className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
              />
            </div>
          </div>

          {/* Match Costs */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Match Costs</h3>
            
            {/* Travel Required Toggle */}
            <div 
              onClick={() => handleInputChange("travelRequired", !formData.travelRequired)}
              className="bg-[#111111] border border-white/15 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-white/25 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-11 h-6 rounded-full relative p-0.5 transition-colors",
                  formData.travelRequired ? "bg-[#E31B23]" : "bg-white/20"
                )}>
                  <div className={cn(
                    "size-5 bg-white rounded-full transition-transform",
                    formData.travelRequired ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
                <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                  Travel Required (Away Match)
                </span>
              </div>
              <span className="text-xs font-semibold text-white/50">
                {formData.travelRequired ? "Enabled" : "Disabled"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  Transport Cost ($)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.transportCost}
                  onChange={(e) => handleInputChange("transportCost", e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  Ground Cost ($)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.groundCost}
                  onChange={(e) => handleInputChange("groundCost", e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  Meals Cost ($)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.mealsCost}
                  onChange={(e) => handleInputChange("mealsCost", e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                  Other Costs ($)
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.otherCosts}
                  onChange={(e) => handleInputChange("otherCosts", e.target.value)}
                  placeholder="0.00" 
                  className="w-full bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-4 bg-[#161616] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-white/60">
                    Estimated Total Cost
                  </span>
                  <span className="text-2xl font-black text-[#E31B23] font-orbitron">
                    ${calculatedTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                  Sum of transport, ground, meals, and other incidentals
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-black uppercase text-white font-orbitron">Additional Notes</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Notes</label>
              <textarea 
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Special instructions: arrival time, jersey colors, warm-up routine, etc." 
                className="w-full h-32 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </DashboardModal>

      {/* Delete Confirmation Modal */}
      <DashboardModal
        isOpen={!!matchToDelete}
        onClose={() => {
          if (!isDeleting) {
            setMatchToDelete(null);
          }
        }}
        title="Delete Match"
        subtitle="This action cannot be undone"
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              disabled={isDeleting}
              onClick={() => setMatchToDelete(null)}
              className="px-5 py-2.5 rounded-xl border border-white/20 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <IconTrash size={16} />
                  <span>Confirm Delete</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 py-2 text-white">
          <p className="text-sm text-white/80">
            Are you sure you want to delete this scheduled match?
          </p>
          {matchToDelete && (
            <div className="bg-[#161616] border border-white/10 rounded-xl p-3 text-xs">
              <p className="font-bold text-white uppercase font-orbitron">
                {matchToDelete.matchTitle || matchToDelete.title}
              </p>
              <p className="text-white/50 text-[11px] mt-1">
                {matchToDelete.formattedDate || matchToDelete.date} • {matchToDelete.kickOffTime || matchToDelete.time}
              </p>
            </div>
          )}
        </div>
      </DashboardModal>
    </div>
  );
};

export default MatchesManagement;

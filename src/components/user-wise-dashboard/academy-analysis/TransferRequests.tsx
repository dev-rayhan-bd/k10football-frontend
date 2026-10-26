/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconDownload,
  IconUpload,
  IconCheck,
  IconClock,
  IconCircleX,
  IconEye,
  IconPlus,
  IconX,
  IconSearch,
  IconChevronDown,
  IconLoader2,
  IconAlertCircle,
  IconBuilding,
  IconFileText,
  IconArrowRight,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useGetTransferRequestsQuery,
  useGetTargetAcademiesQuery,
  useGetMyPlayersForTransferQuery,
  useCreateTransferRequestMutation,
  useApproveTransferRequestMutation,
  useRejectTransferRequestMutation,
} from "@/redux/features/academy/academyApi";
import {
  ITransferRequestItem,
  ICreateTransferRequestPayload,
  ITargetAcademyItem,
  ITransferMyPlayerItem,
} from "@/types/academy.type";

interface FormValues {
  playerId: string;
  transferType: "OUTGOING" | "INCOMING";
  targetAcademyId: string;
  reason: string;
}

interface FormErrors {
  playerId?: string;
  transferType?: string;
  targetAcademyId?: string;
  reason?: string;
}

const initialFormValues: FormValues = {
  playerId: "",
  transferType: "OUTGOING",
  targetAcademyId: "",
  reason: "",
};

export const TransferRequests = () => {
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [viewingRequest, setViewingRequest] = useState<ITransferRequestItem | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ITransferRequestItem | null>(null);
  const [rejectNote, setRejectNote] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState<FormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>("");
  const [academySearchQuery, setAcademySearchQuery] = useState<string>("");

  // Filter tab state
  const [activeTab, setActiveTab] = useState<"ALL" | "INCOMING" | "OUTGOING">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // RTK Query Hooks
  const {
    data: dashboardResponse,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    refetch: refetchDashboard,
  } = useGetTransferRequestsQuery();

  const {
    data: targetAcademiesResponse,
    isLoading: isLoadingAcademies,
  } = useGetTargetAcademiesQuery();

  const {
    data: myPlayersResponse,
    isLoading: isLoadingMyPlayers,
  } = useGetMyPlayersForTransferQuery();

  const [createTransferRequest, { isLoading: isCreating }] = useCreateTransferRequestMutation();
  const [approveTransferRequest, { isLoading: isApproving }] = useApproveTransferRequestMutation();
  const [rejectTransferRequest, { isLoading: isRejecting }] = useRejectTransferRequestMutation();

  // Extract data from responses
  const dashboardData = dashboardResponse?.data;
  const stats = dashboardData?.stats || {
    incomingCount: 0,
    outgoingCount: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  };

  const incomingRequests: ITransferRequestItem[] = dashboardData?.incoming || [];
  const outgoingRequests: ITransferRequestItem[] = dashboardData?.outgoing || [];
  const targetAcademies: ITargetAcademyItem[] = targetAcademiesResponse?.data || [];
  const myPlayers: ITransferMyPlayerItem[] = myPlayersResponse?.data || [];

  // Filtered players inside modal
  const filteredMyPlayers = useMemo(() => {
    if (!playerSearchQuery.trim()) return myPlayers;
    const q = playerSearchQuery.toLowerCase();
    return myPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q) ||
        (p.currentTeamName && p.currentTeamName.toLowerCase().includes(q))
    );
  }, [myPlayers, playerSearchQuery]);

  // Selected player object preview
  const selectedPlayer = useMemo(() => {
    return myPlayers.find((p) => (p._id || p.id) === formData.playerId);
  }, [myPlayers, formData.playerId]);

  // Filtered academies inside modal
  const filteredAcademies = useMemo(() => {
    if (!academySearchQuery.trim()) return targetAcademies;
    const q = academySearchQuery.toLowerCase();
    return targetAcademies.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.city && a.city.toLowerCase().includes(q)) ||
        (a.country && a.country.toLowerCase().includes(q))
    );
  }, [targetAcademies, academySearchQuery]);

  // Selected academy object preview
  const selectedAcademy = useMemo(() => {
    return targetAcademies.find((a) => a._id === formData.targetAcademyId);
  }, [targetAcademies, formData.targetAcademyId]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData(initialFormValues);
    setFormErrors({});
    setPlayerSearchQuery("");
    setAcademySearchQuery("");
    setIsCreateOpen(true);
  };

  // Validate Create Form
  const validateCreateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.playerId) {
      errors.playerId = "Please select an athlete to transfer";
    }

    if (!formData.targetAcademyId) {
      errors.targetAcademyId = "Please select a target academy";
    }

    if (!formData.reason.trim()) {
      errors.reason = "Please provide a reason for this transfer request";
    } else if (formData.reason.trim().length < 5) {
      errors.reason = "Reason must be at least 5 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create Transfer Request
  const handleCreateSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateCreateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const payload: ICreateTransferRequestPayload = {
        playerId: formData.playerId,
        transferType: formData.transferType,
        targetAcademyId: formData.targetAcademyId,
        reason: formData.reason.trim(),
      };

      await createTransferRequest(payload).unwrap();
      setIsCreateOpen(false);
      setFormData(initialFormValues);
      setFormErrors({});
    } catch {
      // Handled in onQueryStarted
    }
  };

  // Handle Approve Request
  const handleApprove = async (requestId: string) => {
    try {
      await approveTransferRequest(requestId).unwrap();
      if (viewingRequest && (viewingRequest._id === requestId || viewingRequest.id === requestId)) {
        setViewingRequest(null);
      }
    } catch {
      // Handled in onQueryStarted
    }
  };

  // Handle Reject Request
  const handleRejectConfirm = async () => {
    if (!rejectingRequest) return;
    const reqId = rejectingRequest._id || rejectingRequest.id;
    if (!reqId) return;

    try {
      await rejectTransferRequest({
        requestId: reqId,
        note: rejectNote.trim() || undefined,
      }).unwrap();
      setRejectingRequest(null);
      setRejectNote("");
      if (viewingRequest && (viewingRequest._id === reqId || viewingRequest.id === reqId)) {
        setViewingRequest(null);
      }
    } catch {
      // Handled in onQueryStarted
    }
  };

  // Filter requests based on status dropdown
  const filterByStatus = (items: ITransferRequestItem[]) => {
    if (statusFilter === "ALL") return items;
    return items.filter(
      (item) => (item.status || "").toUpperCase() === statusFilter.toUpperCase()
    );
  };

  const filteredIncoming = useMemo(() => filterByStatus(incomingRequests), [
    incomingRequests,
    statusFilter,
  ]);

  const filteredOutgoing = useMemo(() => filterByStatus(outgoingRequests), [
    outgoingRequests,
    statusFilter,
  ]);

  // Status Badge Component
  const renderStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "APPROVED") {
      return (
        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Approved
        </span>
      );
    }
    if (s === "PENDING") {
      return (
        <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 inline-flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Pending
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-red-400" />
        Rejected
      </span>
    );
  };

  // Reusable Table Component
  const renderTransferTable = (
    title: string,
    items: ITransferRequestItem[],
    emptyMessage: string,
    typeBadge: "INCOMING" | "OUTGOING"
  ) => (
    <div className="bg-[#111111] border border-white/15 rounded-3xl md:rounded-[40px] p-6 md:p-8 flex flex-col gap-6 w-full max-w-full shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
            {title} ({items.length})
          </h2>
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border",
              typeBadge === "INCOMING"
                ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                : "bg-purple-500/15 text-purple-400 border-purple-500/30"
            )}
          >
            {typeBadge}
          </span>
        </div>
      </div>

      <div className="border border-white/15 rounded-2xl overflow-x-auto w-full custom-scrollbar">
        <table className="w-full min-w-200 text-left border-collapse">
          <thead>
            <tr className="bg-white/2 border-b border-white/15 text-[11px] font-black text-white/80 uppercase tracking-widest">
              <th className="px-6 py-4 sm:py-5 border-r border-white/15">Name</th>
              <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Incoming</th>
              <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Outgoing</th>
              <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Requested By</th>
              <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Date</th>
              <th className="px-6 py-4 sm:py-5 border-r border-white/15 text-center">Status</th>
              <th className="px-6 py-4 sm:py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/15">
            {isDashboardLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={`skel-${title}-${idx}`} className="animate-pulse">
                  <td className="px-6 py-5 border-r border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-white/10 shrink-0 shimmer" />
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-white/10 rounded shimmer" />
                        <div className="h-3 w-16 bg-white/5 rounded shimmer" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 border-r border-white/10 text-center">
                    <div className="h-4 w-28 bg-white/10 rounded mx-auto shimmer" />
                  </td>
                  <td className="px-6 py-5 border-r border-white/10 text-center">
                    <div className="h-4 w-28 bg-white/10 rounded mx-auto shimmer" />
                  </td>
                  <td className="px-6 py-5 border-r border-white/10 text-center">
                    <div className="h-4 w-24 bg-white/10 rounded mx-auto shimmer" />
                  </td>
                  <td className="px-6 py-5 border-r border-white/10 text-center">
                    <div className="h-4 w-20 bg-white/10 rounded mx-auto shimmer" />
                  </td>
                  <td className="px-6 py-5 border-r border-white/10 text-center">
                    <div className="h-6 w-20 bg-white/10 rounded-full mx-auto shimmer" />
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="h-9 w-24 bg-white/10 rounded-xl mx-auto shimmer" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-white/40 text-xs sm:text-sm font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              items.map((row, i) => {
                const playerName = row.player?.name || row.name || "Player";
                const playerPos = row.player?.position || row.position || "N/A";
                const playerAvatar =
                  row.player?.avatar || row.avatar || "/placeholder_img.jpg";
                const isPending = (row.status || "").toUpperCase() === "PENDING";
                const canApprove = row.canApprove ?? isPending;
                const canReject = row.canReject ?? isPending;

                return (
                  <tr
                    key={row._id || row.id || i}
                    className="hover:bg-white/2 transition-colors text-center group"
                  >
                    {/* Name & Player Card */}
                    <td className="px-6 py-5 border-r border-white/15 text-left">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#1A1A1A] relative">
                          <Image
                            width={44}
                            height={44}
                            src={playerAvatar}
                            alt={playerName}
                            unoptimized
                            className="size-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.srcset = "";
                              target.src = "/placeholder_img.jpg";
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <p className="text-white text-sm font-black uppercase truncate">
                            {playerName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[#00FF62] text-[10px] font-black uppercase tracking-wider">
                              {playerPos}
                            </span>
                            {row.player?.rating && (
                              <span className="text-[10px] font-bold text-white/50">
                                • {row.player.rating} OVR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Incoming */}
                    <td className="px-6 py-5 border-r border-white/15">
                      <span className="text-white/80 text-sm font-medium">
                        {row.incoming || row.toAcademy?.name || "—"}
                      </span>
                    </td>

                    {/* Outgoing */}
                    <td className="px-6 py-5 border-r border-white/15">
                      <span className="text-white/80 text-sm font-medium">
                        {row.outgoing || row.fromAcademy?.name || "—"}
                      </span>
                    </td>

                    {/* Requested By */}
                    <td className="px-6 py-5 border-r border-white/15">
                      <span className="text-white/60 text-sm font-medium">
                        {row.requestedBy || "Academy Admin"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 border-r border-white/15">
                      <span className="text-white/60 text-xs font-medium whitespace-nowrap">
                        {row.date || "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5 border-r border-white/15">
                      {renderStatusBadge(row.status)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => setViewingRequest(row)}
                          className="size-9 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all cursor-pointer active:scale-95"
                          title="View Transfer Details"
                        >
                          <IconEye size={18} stroke={2} />
                        </button>

                        {/* Approve Request */}
                        {canApprove && (
                          <button
                            onClick={() => handleApprove(row._id || row.id || "")}
                            disabled={isApproving}
                            className="size-9 inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Approve Transfer"
                          >
                            <IconCheck size={18} stroke={2.5} />
                          </button>
                        )}

                        {/* Reject Request */}
                        {canReject && (
                          <button
                            onClick={() => {
                              setRejectingRequest(row);
                              setRejectNote("");
                            }}
                            disabled={isRejecting}
                            className="size-9 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:text-white hover:border-red-500 hover:bg-red-500 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                            title="Reject Transfer"
                          >
                            <IconX size={18} stroke={2.5} />
                          </button>
                        )}
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
  );

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">
              Transfer Requests
            </h1>
            <span className="size-2.5 rounded-full bg-[#E31B23] animate-pulse" />
          </div>
          <p className="text-white/60 font-medium mt-1 md:mt-2 text-xs md:text-base">
            Manage athlete transfers and requests across teams and academies
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => refetchDashboard()}
            title="Refresh requests"
            className="h-11 sm:h-12 px-4 rounded-xl bg-white/5 border border-white/15 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 font-bold"
          >
            <IconRefresh
              size={18}
              className={isDashboardFetching ? "animate-spin text-[#E31B23]" : ""}
            />
            <span className="text-xs uppercase tracking-wider hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="w-full md:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white h-11 sm:h-12 px-6 rounded-2xl flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-widest font-orbitron shadow-lg shadow-[#E31B23]/25 cursor-pointer active:scale-[0.98] transition-all shrink-0"
          >
            <IconPlus size={18} />
            <span>Transfer Request</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {/* Incoming Requests */}
        <div className="bg-[#111111] border border-white/15 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl transition-all">
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <IconDownload size={20} />
          </div>
          <div>
            <p className="text-white text-2xl sm:text-3xl font-black font-orbitron">
              {stats.incomingCount ?? 0}
            </p>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Incoming Requests
            </p>
          </div>
        </div>

        {/* Outgoing Requests */}
        <div className="bg-[#111111] border border-white/15 hover:border-purple-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl transition-all">
          <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <IconUpload size={20} />
          </div>
          <div>
            <p className="text-white text-2xl sm:text-3xl font-black font-orbitron">
              {stats.outgoingCount ?? 0}
            </p>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Outgoing Requests
            </p>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-[#111111] border border-white/15 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl transition-all">
          <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IconCheck size={20} />
          </div>
          <div>
            <p className="text-white text-2xl sm:text-3xl font-black font-orbitron">
              {stats.approvedCount ?? 0}
            </p>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Approved
            </p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-[#111111] border border-white/15 hover:border-yellow-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl transition-all">
          <div className="size-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
            <IconClock size={20} />
          </div>
          <div>
            <p className="text-white text-2xl sm:text-3xl font-black font-orbitron">
              {stats.pendingCount ?? 0}
            </p>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Pending
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-[#111111] border border-white/15 hover:border-red-500/40 rounded-2xl p-5 flex flex-col gap-3 shadow-xl transition-all col-span-2 sm:col-span-1">
          <div className="size-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <IconCircleX size={20} />
          </div>
          <div>
            <p className="text-white text-2xl sm:text-3xl font-black font-orbitron">
              {stats.rejectedCount ?? 0}
            </p>
            <p className="text-white/50 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-0.5">
              Rejected
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Status Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#111111] border border-white/15 rounded-2xl p-3 sm:p-4">
        {/* View Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab("ALL")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "ALL"
                ? "bg-white text-black shadow-md"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            All Requests
          </button>
          <button
            onClick={() => setActiveTab("INCOMING")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "INCOMING"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            Incoming ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("OUTGOING")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap",
              activeTab === "OUTGOING"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            Outgoing ({outgoingRequests.length})
          </button>
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 pr-9 text-xs font-bold text-white uppercase tracking-wider focus:outline-none focus:border-white/30 cursor-pointer appearance-none"
          >
            <option value="ALL" className="bg-[#111111] text-white">
              All Status
            </option>
            <option value="PENDING" className="bg-[#111111] text-white">
              Pending
            </option>
            <option value="APPROVED" className="bg-[#111111] text-white">
              Approved
            </option>
            <option value="REJECTED" className="bg-[#111111] text-white">
              Rejected
            </option>
          </select>
          <IconChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
          />
        </div>
      </div>

      {/* Tables Section */}
      <div className="flex flex-col gap-8">
        {(activeTab === "ALL" || activeTab === "INCOMING") &&
          renderTransferTable(
            "Incoming",
            filteredIncoming,
            "No incoming transfer requests found.",
            "INCOMING"
          )}

        {(activeTab === "ALL" || activeTab === "OUTGOING") &&
          renderTransferTable(
            "Outgoing",
            filteredOutgoing,
            "No outgoing transfer requests found.",
            "OUTGOING"
          )}
      </div>

      {/* Create Transfer Request Modal (Fancy Register Style) */}
      <DashboardModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (!isCreating) setIsCreateOpen(false);
        }}
        title="Create Transfer Request"
        subtitle="Initiate player transfer request to or from another academy"
        showBackButton
        maxWidth="max-w-4xl"
        footer={
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 w-full">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSubmit}
              disabled={isCreating}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/30 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isCreating ? (
                <>
                  <IconLoader2 size={18} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <IconPlus size={18} />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-8 pb-4">
          {/* SECTION 1: TRANSFER TYPE */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Transfer Direction
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transferType: "OUTGOING" })}
                className={cn(
                  "p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  formData.transferType === "OUTGOING"
                    ? "bg-[#E31B23]/15 border-[#E31B23] shadow-md shadow-[#E31B23]/10"
                    : "bg-[#161a18] border-white/15 hover:border-white/30"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0",
                    formData.transferType === "OUTGOING"
                      ? "bg-[#E31B23] text-white"
                      : "bg-white/5 text-white/50"
                  )}
                >
                  <IconUpload size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase">Outgoing Transfer</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Transfer athlete from our academy to another academy
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, transferType: "INCOMING" })}
                className={cn(
                  "p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer",
                  formData.transferType === "INCOMING"
                    ? "bg-[#E31B23]/15 border-[#E31B23] shadow-md shadow-[#E31B23]/10"
                    : "bg-[#161a18] border-white/15 hover:border-white/30"
                )}
              >
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center shrink-0",
                    formData.transferType === "INCOMING"
                      ? "bg-[#E31B23] text-white"
                      : "bg-white/5 text-white/50"
                  )}
                >
                  <IconDownload size={18} />
                </div>
                <div>
                  <p className="text-sm font-black text-white uppercase">Incoming Transfer</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Request an athlete from target academy to join us
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: SELECT ATHLETE */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Select Athlete
                </h3>
                <span className="text-[#E31B23] font-black">*</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
              Choose an athlete from our registered academy roster
            </p>

            {/* Athlete Search Bar */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search athlete by name, position or team..."
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                className="w-full bg-[#161a18] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
              />
            </div>

            {formErrors.playerId && (
              <p className="text-red-500 text-xs font-bold tracking-wide flex items-center gap-1.5 -mt-1">
                <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                <span>{formErrors.playerId}</span>
              </p>
            )}

            {/* Players Grid */}
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1 pr-2 custom-scrollbar rounded-2xl border",
                formErrors.playerId ? "border-red-500/50" : "border-white/10"
              )}
            >
              {isLoadingMyPlayers ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={`player-skel-${idx}`}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center gap-3"
                  >
                    <div className="size-11 rounded-full bg-white/10" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 w-28 bg-white/10 rounded" />
                      <div className="h-2.5 w-16 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredMyPlayers.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-white/40 font-medium">
                  {playerSearchQuery
                    ? `No athlete matches "${playerSearchQuery}"`
                    : "No academy athletes available for transfer."}
                </div>
              ) : (
                filteredMyPlayers.map((player) => {
                  const pid = player._id || player.id || "";
                  const isSelected = formData.playerId === pid;

                  return (
                    <div
                      key={pid}
                      onClick={() => {
                        setFormData({ ...formData, playerId: pid });
                        if (formErrors.playerId) {
                          setFormErrors({ ...formErrors, playerId: undefined });
                        }
                      }}
                      className={cn(
                        "rounded-xl p-3 flex items-center gap-3 border transition-all cursor-pointer group select-none",
                        isSelected
                          ? "bg-[#E31B23]/15 border-[#E31B23] shadow-md shadow-[#E31B23]/10"
                          : "bg-[#161a18] border-white/15 hover:border-white/30"
                      )}
                    >
                      <div
                        className={cn(
                          "size-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                          isSelected
                            ? "bg-[#E31B23] border-[#E31B23] text-white"
                            : "border-white/20 bg-white/5 group-hover:border-white/40"
                        )}
                      >
                        {isSelected && <IconCheck size={14} className="stroke-[3]" />}
                      </div>

                      <div className="size-11 rounded-full overflow-hidden border border-white/15 shrink-0 bg-[#111111] relative">
                        <Image
                          src={player.avatar || "/placeholder_img.jpg"}
                          alt={player.name}
                          width={44}
                          height={44}
                          unoptimized
                          className="size-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.srcset = "";
                            target.src = "/placeholder_img.jpg";
                          }}
                        />
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-white truncate">
                            {player.name}
                          </span>
                          {player.rating && (
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 text-white shrink-0">
                              {player.rating} OVR
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/50 mt-0.5">
                          <span className="font-bold text-[#00FF62] uppercase tracking-wider">
                            {player.position}
                          </span>
                          {player.currentTeamName && (
                            <>
                              <span>•</span>
                              <span className="truncate">{player.currentTeamName}</span>
                            </>
                          )}
                          {player.age && (
                            <>
                              <span>•</span>
                              <span>{player.age} yrs</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Athlete Preview Badge */}
            {selectedPlayer && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full overflow-hidden border border-white/20">
                    <Image
                      src={selectedPlayer.avatar || "/placeholder_img.jpg"}
                      alt={selectedPlayer.name}
                      width={32}
                      height={32}
                      unoptimized
                      className="size-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white">{selectedPlayer.name}</span>
                    <span className="text-[10px] font-bold text-[#00FF62] ml-2">
                      ({selectedPlayer.position})
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-[#00FF62] bg-[#00FF62]/10 border border-[#00FF62]/30 px-2 py-0.5 rounded">
                  Selected
                </span>
              </div>
            )}
          </div>

          {/* SECTION 3: TARGET ACADEMY */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Target Academy
                </h3>
                <span className="text-[#E31B23] font-black">*</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider">
              Select the academy to transfer with
            </p>

            {/* Academy Search */}
            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
              <input
                type="text"
                placeholder="Search academy by name, city or country..."
                value={academySearchQuery}
                onChange={(e) => setAcademySearchQuery(e.target.value)}
                className="w-full bg-[#161a18] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#E31B23] transition-all"
              />
            </div>

            {formErrors.targetAcademyId && (
              <p className="text-red-500 text-xs font-bold tracking-wide flex items-center gap-1.5 -mt-1">
                <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                <span>{formErrors.targetAcademyId}</span>
              </p>
            )}

            {/* Academies Grid */}
            <div
              className={cn(
                "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-52 overflow-y-auto p-1 pr-2 custom-scrollbar rounded-2xl border",
                formErrors.targetAcademyId ? "border-red-500/50" : "border-white/10"
              )}
            >
              {isLoadingAcademies ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={`acad-skel-${idx}`}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse flex items-center gap-3"
                  >
                    <div className="size-10 rounded-xl bg-white/10" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3 w-28 bg-white/10 rounded" />
                      <div className="h-2.5 w-16 bg-white/5 rounded" />
                    </div>
                  </div>
                ))
              ) : filteredAcademies.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-white/40 font-medium">
                  {academySearchQuery
                    ? `No academy matches "${academySearchQuery}"`
                    : "No target academies available."}
                </div>
              ) : (
                filteredAcademies.map((acad) => {
                  const isSelected = formData.targetAcademyId === acad._id;

                  return (
                    <div
                      key={acad._id}
                      onClick={() => {
                        setFormData({ ...formData, targetAcademyId: acad._id });
                        if (formErrors.targetAcademyId) {
                          setFormErrors({ ...formErrors, targetAcademyId: undefined });
                        }
                      }}
                      className={cn(
                        "rounded-xl p-3 flex items-center gap-3 border transition-all cursor-pointer group select-none",
                        isSelected
                          ? "bg-[#E31B23]/15 border-[#E31B23] shadow-md shadow-[#E31B23]/10"
                          : "bg-[#161a18] border-white/15 hover:border-white/30"
                      )}
                    >
                      <div
                        className={cn(
                          "size-5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                          isSelected
                            ? "bg-[#E31B23] border-[#E31B23] text-white"
                            : "border-white/20 bg-white/5 group-hover:border-white/40"
                        )}
                      >
                        {isSelected && <IconCheck size={14} className="stroke-[3]" />}
                      </div>

                      <div className="size-10 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-[#111111] flex items-center justify-center">
                        {acad.logo ? (
                          <Image
                            src={acad.logo}
                            alt={acad.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="size-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.srcset = "";
                              target.src = "/placeholder_img.jpg";
                            }}
                          />
                        ) : (
                          <IconBuilding size={20} className="text-white/40" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-black text-white truncate">{acad.name}</span>
                        {(acad.city || acad.country) && (
                          <span className="text-[10px] text-white/50 truncate">
                            {[acad.city, acad.country].filter(Boolean).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Academy Preview Badge */}
            {selectedAcademy && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/15 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg overflow-hidden border border-white/20 flex items-center justify-center bg-[#111111]">
                    {selectedAcademy.logo ? (
                      <Image
                        src={selectedAcademy.logo}
                        alt={selectedAcademy.name}
                        width={32}
                        height={32}
                        unoptimized
                        className="size-full object-contain p-1"
                      />
                    ) : (
                      <IconBuilding size={16} className="text-white/60" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-black text-white">{selectedAcademy.name}</span>
                    <span className="text-[10px] text-white/50 ml-2">
                      {[selectedAcademy.city, selectedAcademy.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase text-[#00FF62] bg-[#00FF62]/10 border border-[#00FF62]/30 px-2 py-0.5 rounded">
                  Selected
                </span>
              </div>
            )}
          </div>

          {/* SECTION 4: REASON FOR TRANSFER */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#E31B23] animate-pulse" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.18em]">
                  Reason for Transfer
                </h3>
                <span className="text-[#E31B23] font-black">*</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-[#E31B23]/40 via-white/10 to-transparent" />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="relative group">
                <IconFileText className="absolute left-3.5 top-4 size-4 text-zinc-400 group-focus-within:text-[#E31B23] transition-colors pointer-events-none" />
                <textarea
                  value={formData.reason}
                  onChange={(e) => {
                    setFormData({ ...formData, reason: e.target.value });
                    if (formErrors.reason) {
                      setFormErrors({ ...formErrors, reason: undefined });
                    }
                  }}
                  placeholder="e.g. Player relocation to another city with family, agreement between coaching directors..."
                  rows={4}
                  disabled={isCreating}
                  className={cn(
                    "w-full pl-10 pr-4 py-3.5 rounded-xl border bg-[#161a18] text-white placeholder:text-zinc-500 font-medium text-sm focus:outline-none transition-all shadow-inner resize-none custom-scrollbar",
                    formErrors.reason
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-white/20 focus:border-[#E31B23] focus:ring-2 focus:ring-[#E31B23]/20"
                  )}
                />
              </div>

              {formErrors.reason && (
                <p className="text-red-500 text-xs font-bold tracking-wide mt-1 flex items-center gap-1.5">
                  <IconAlertCircle size={14} className="shrink-0 text-red-500" />
                  <span>{formErrors.reason}</span>
                </p>
              )}
            </div>
          </div>
        </form>
      </DashboardModal>

      {/* View Transfer Request Details Modal */}
      <DashboardModal
        isOpen={Boolean(viewingRequest)}
        onClose={() => setViewingRequest(null)}
        title="Transfer Request Details"
        subtitle={`Request ID: ${viewingRequest?._id || viewingRequest?.id || ""}`}
        maxWidth="max-w-2xl"
        footer={
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              {viewingRequest && (viewingRequest.canApprove ?? ((viewingRequest.status || "").toUpperCase() === "PENDING")) && (
                <button
                  onClick={() => handleApprove(viewingRequest._id || viewingRequest.id || "")}
                  disabled={isApproving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <IconCheck size={16} />
                  <span>Approve</span>
                </button>
              )}

              {viewingRequest && (viewingRequest.canReject ?? ((viewingRequest.status || "").toUpperCase() === "PENDING")) && (
                <button
                  onClick={() => {
                    setRejectingRequest(viewingRequest);
                    setRejectNote("");
                  }}
                  disabled={isRejecting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <IconX size={16} />
                  <span>Reject</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setViewingRequest(null)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-bold text-white uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {viewingRequest && (
          <div className="flex flex-col gap-6 py-2">
            {/* Athlete Profile Header Card */}
            <div className="p-4 rounded-2xl bg-[#161a18] border border-white/15 flex items-center gap-4">
              <div className="size-16 rounded-full overflow-hidden border border-white/20 shrink-0 bg-[#111111]">
                <Image
                  src={
                    viewingRequest.player?.avatar ||
                    viewingRequest.avatar ||
                    "/placeholder_img.jpg"
                  }
                  alt={viewingRequest.player?.name || viewingRequest.name || "Athlete"}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-black text-white uppercase truncate">
                    {viewingRequest.player?.name || viewingRequest.name}
                  </h3>
                  {renderStatusBadge(viewingRequest.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-1 flex-wrap">
                  <span className="font-bold text-[#00FF62]">
                    {viewingRequest.player?.position || viewingRequest.position}
                  </span>
                  {viewingRequest.player?.rating && (
                    <>
                      <span>•</span>
                      <span>{viewingRequest.player.rating} OVR</span>
                    </>
                  )}
                  {viewingRequest.player?.age && (
                    <>
                      <span>•</span>
                      <span>{viewingRequest.player.age} yrs old</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Transfer Route Banner */}
            <div className="p-4 rounded-2xl bg-[#111111] border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  From Academy
                </span>
                <span className="text-sm font-black text-white mt-0.5">
                  {viewingRequest.outgoing || viewingRequest.fromAcademy?.name || "Current Academy"}
                </span>
              </div>

              <div className="size-8 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-white/60 shrink-0 rotate-90 sm:rotate-0">
                <IconArrowRight size={16} />
              </div>

              <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  To Academy
                </span>
                <span className="text-sm font-black text-white mt-0.5">
                  {viewingRequest.incoming || viewingRequest.toAcademy?.name || "Target Academy"}
                </span>
              </div>
            </div>

            {/* Transfer Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Requested By
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {viewingRequest.requestedBy || "Academy Admin"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Request Date
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {viewingRequest.date || "N/A"}
                </p>
              </div>
            </div>

            {/* Transfer Reason */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Transfer Reason
              </span>
              <p className="text-xs text-white/90 leading-relaxed">
                {viewingRequest.reason || "No specific reason provided."}
              </p>
            </div>

            {/* Response Note if available */}
            {viewingRequest.responseNote && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Response Note
                </span>
                <p className="text-xs text-white/90 leading-relaxed">
                  {viewingRequest.responseNote}
                </p>
              </div>
            )}
          </div>
        )}
      </DashboardModal>

      {/* Reject Confirmation Modal */}
      <DashboardModal
        isOpen={Boolean(rejectingRequest)}
        onClose={() => {
          if (!isRejecting) setRejectingRequest(null);
        }}
        title="Reject Transfer Request"
        subtitle="Provide a reason for rejecting this athlete transfer application"
        maxWidth="max-w-md"
        footer={
          <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
            <button
              onClick={() => setRejectingRequest(null)}
              disabled={isRejecting}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-white/20 text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={isRejecting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 cursor-pointer disabled:opacity-50"
            >
              {isRejecting ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <IconX size={16} />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 py-2">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
            <IconAlertCircle size={26} className="shrink-0 text-red-500" />
            <p className="text-xs font-bold text-white leading-snug">
              Are you sure you want to reject the transfer for &ldquo;
              {rejectingRequest?.player?.name || rejectingRequest?.name || "this athlete"}
              &rdquo;?
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">
              Rejection Note / Feedback (Optional)
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Provide context or explanation for why this request cannot be accepted..."
              rows={3}
              className="w-full bg-[#161a18] border border-white/15 rounded-xl p-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-red-500 transition-all resize-none"
            />
          </div>
        </div>
      </DashboardModal>
    </div>
  );
};

export default TransferRequests;

/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo } from "react";
import {
  IconEye,
  IconCheck,
  IconX,
  IconFileText,
  IconExternalLink,
  IconClock,
  IconBuildingCommunity,
  IconBriefcase,
  IconSchool,
} from "@tabler/icons-react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import {
  useGetApprovalsQuery,
  useUpdateApprovalStatusMutation,
  useGetAdminSuccessStoriesQuery,
  useUpdateSuccessStoryStatusMutation,
} from "@/redux/features/admin/adminApi";
import {
  IApprovalApplication,
  IAdminSuccessStory,
} from "@/types/admin.type";
import { cn } from "@/lib/utils";

const StatusPill = ({ status }: { status: string }) => {
  const normalized = (status || "").toUpperCase();
  const styles: Record<string, string> = {
    PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const label =
    normalized === "PENDING"
      ? "Pending"
      : normalized === "APPROVED"
      ? "Approved"
      : normalized === "REJECTED"
      ? "Rejected"
      : status;

  return (
    <span
      className={cn(
        "px-4 py-1 rounded-full text-[10px] font-black uppercase border",
        styles[normalized] || "bg-white/5 text-white/60 border-white/10"
      )}
    >
      {label}
    </span>
  );
};

type TabType = "All" | "Academies" | "Agents" | "Clubs";

const SuperAdminApprovals = () => {
  // --- APPROVALS STATE ---
  const [activeTab, setActiveTab] = useState<TabType>("All");

  const roleParam = useMemo(() => {
    if (activeTab === "Academies") return "ACADEMIES";
    if (activeTab === "Agents") return "AGENTS";
    if (activeTab === "Clubs") return "CLUBS";
    return "ALL";
  }, [activeTab]);

  const {
    data: approvalsRes,
    isLoading: isApprovalsLoading,
    isError: isApprovalsError,
    refetch: refetchApprovals,
  } = useGetApprovalsQuery({ role: roleParam });

  const [updateApprovalStatus, { isLoading: isUpdatingApproval }] =
    useUpdateApprovalStatusMutation();

  const [selectedApp, setSelectedApp] = useState<IApprovalApplication | null>(null);
  const [actionModal, setActionModal] = useState<{
    app: IApprovalApplication;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const approvals = useMemo(() => approvalsRes?.data || [], [approvalsRes?.data]);

  const filteredApprovals = useMemo(() => {
    if (activeTab === "All") return approvals;
    return approvals.filter((item) => {
      const itemRole = (item.role || "").toUpperCase();
      const itemLabel = (item.roleLabel || "").toLowerCase();

      if (activeTab === "Academies") {
        return itemRole === "ACADEMY" || itemLabel.includes("academ");
      }
      if (activeTab === "Agents") {
        return itemRole === "AGENT" || itemLabel.includes("agent");
      }
      if (activeTab === "Clubs") {
        return itemRole === "CLUB" || itemLabel.includes("club");
      }
      return true;
    });
  }, [approvals, activeTab]);

  const handleOpenActionModal = (
    app: IApprovalApplication,
    action: "APPROVE" | "REJECT"
  ) => {
    setActionModal({ app, action });
    if (action === "APPROVE") {
      setReviewNotes("Credentials and documents verified and approved.");
    } else {
      setReviewNotes("Submitted documents could not be verified.");
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    const { app, action } = actionModal;
    try {
      await updateApprovalStatus({
        id: app._id,
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewNotes: reviewNotes.trim(),
        },
      }).unwrap();
      setActionModal(null);
      if (selectedApp?._id === app._id) {
        setSelectedApp(null);
      }
    } catch {
      // Toast handled by API middleware
    }
  };

  // --- SUCCESS STORIES STATE ---
  const [activeStoryTab, setActiveStoryTab] = useState<TabType>("All");

  const storyRoleParam = useMemo(() => {
    if (activeStoryTab === "Academies") return "ACADEMIES";
    if (activeStoryTab === "Agents") return "AGENTS";
    if (activeStoryTab === "Clubs") return "CLUBS";
    return "ALL";
  }, [activeStoryTab]);

  const {
    data: storiesRes,
    isLoading: isStoriesLoading,
    isError: isStoriesError,
    refetch: refetchStories,
  } = useGetAdminSuccessStoriesQuery({ role: storyRoleParam });

  const [updateStoryStatus, { isLoading: isUpdatingStory }] =
    useUpdateSuccessStoryStatusMutation();

  const [selectedStory, setSelectedStory] = useState<IAdminSuccessStory | null>(null);
  const [storyActionModal, setStoryActionModal] = useState<{
    story: IAdminSuccessStory;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [storyReviewNotes, setStoryReviewNotes] = useState("");

  const stories = useMemo(() => storiesRes?.data || [], [storiesRes?.data]);

  const filteredStories = useMemo(() => {
    if (activeStoryTab === "All") return stories;
    return stories.filter((item) => {
      const itemRole = (item.role || "").toUpperCase();
      const itemLabel = (item.roleLabel || "").toLowerCase();

      if (activeStoryTab === "Academies") {
        return (
          itemRole === "ACADEMY" ||
          itemRole === "ACADEMIES" ||
          itemLabel.includes("academ")
        );
      }
      if (activeStoryTab === "Agents") {
        return (
          itemRole === "AGENT" ||
          itemRole === "AGENTS" ||
          itemLabel.includes("agent")
        );
      }
      if (activeStoryTab === "Clubs") {
        return (
          itemRole === "CLUB" ||
          itemRole === "CLUBS" ||
          itemLabel.includes("club")
        );
      }
      return true;
    });
  }, [stories, activeStoryTab]);

  const handleOpenStoryActionModal = (
    story: IAdminSuccessStory,
    action: "APPROVE" | "REJECT"
  ) => {
    setStoryActionModal({ story, action });
    if (action === "APPROVE") {
      setStoryReviewNotes("Story approved by Super Admin.");
    } else {
      setStoryReviewNotes("Story rejected due to incomplete details.");
    }
  };

  const handleConfirmStoryAction = async () => {
    if (!storyActionModal) return;
    const { story, action } = storyActionModal;
    const storyId = story.storyId || story._id;
    try {
      await updateStoryStatus({
        id: storyId,
        data: {
          status: action === "APPROVE" ? "APPROVED" : "REJECTED",
          reviewNotes: storyReviewNotes.trim(),
        },
      }).unwrap();
      setStoryActionModal(null);
      if (selectedStory?._id === story._id || selectedStory?.storyId === storyId) {
        setSelectedStory(null);
      }
    } catch {
      // Toast handled by API middleware
    }
  };

  // --- APPROVAL COLUMNS ---
  const approvalColumns: Column<IApprovalApplication>[] = [
    {
      header: "Name",
      key: "name",
      render: (row) => {
        const avatar = row.avatar || row.user?.avatar || row.profile?.logo;
        const subtitle =
          row.user?.agencyName ||
          row.profile?.agencyName ||
          row.user?.clubName ||
          row.profile?.name ||
          row.email;

        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 overflow-hidden border border-white/20 shrink-0 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={row.name}
                  className="size-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder_img.jpg";
                  }}
                />
              ) : (
                <span className="text-white/60 font-black text-xs">
                  {(row.name || "A").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black uppercase truncate max-w-60">
                {row.name}
              </p>
              {subtitle && (
                <p className="text-destructive text-[10px] font-bold uppercase truncate max-w-60">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      key: "role",
      align: "center",
      render: (row) => (
        <span className="text-white/60 text-sm font-medium">
          {row.roleLabel || row.role}
        </span>
      ),
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      render: (row) => (
        <span className="text-white/60 text-sm font-medium">
          {row.date || (row.user?.createdAt ? row.user.createdAt.split("T")[0] : "—")}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => {
        const isPending = (row.status || "").toUpperCase() === "PENDING";

        return (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedApp(row)}
              className="text-white/40 hover:text-white transition-all p-1"
              title="View Application Details"
            >
              <IconEye size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenActionModal(row, "APPROVE")}
              disabled={!isPending}
              className={cn(
                "transition-all p-1",
                isPending
                  ? "text-emerald-500/60 hover:text-emerald-500 hover:scale-110 cursor-pointer"
                  : "text-white/15 cursor-not-allowed"
              )}
              title={isPending ? "Approve Application" : "Already processed"}
            >
              <IconCheck size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleOpenActionModal(row, "REJECT")}
              disabled={!isPending}
              className={cn(
                "transition-all p-1",
                isPending
                  ? "text-destructive/60 hover:text-destructive hover:scale-110 cursor-pointer"
                  : "text-white/15 cursor-not-allowed"
              )}
              title={isPending ? "Reject Application" : "Already processed"}
            >
              <IconX size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  // --- SUCCESS STORY COLUMNS ---
  const storyColumns: Column<IAdminSuccessStory>[] = [
    {
      header: "Story Title",
      key: "storyTitle",
      render: (row) => {
        const img = row.image || row.coverImage || row.photo;
        const authorOrCategory = row.authorName || row.category;

        return (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-white/10 overflow-hidden border border-white/20 shrink-0 flex items-center justify-center">
              {img ? (
                <img
                  src={img}
                  alt={row.storyTitle}
                  className="size-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder_img.jpg";
                  }}
                />
              ) : (
                <span className="text-white/60 font-black text-xs">
                  {(row.storyTitle || "S").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-black uppercase max-w-72 leading-tight truncate">
                {row.storyTitle}
              </p>
              {authorOrCategory && (
                <p className="text-destructive text-[10px] font-bold uppercase truncate max-w-72">
                  {authorOrCategory}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: "Role",
      key: "role",
      align: "center",
      render: (row) => (
        <span className="text-white/60 text-sm font-medium">
          {row.roleLabel || row.role}
        </span>
      ),
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      render: (row) => (
        <span className="text-white/60 text-sm font-medium">
          {row.date || (row.createdAt ? row.createdAt.split("T")[0] : "—")}
        </span>
      ),
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      header: "Action",
      key: "actions",
      align: "center",
      render: (row) => {
        const isPending = (row.status || "").toUpperCase() === "PENDING";

        return (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedStory(row)}
              className="text-white/40 hover:text-white transition-all p-1"
              title="View Story Details"
            >
              <IconEye size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenStoryActionModal(row, "APPROVE")}
              disabled={!isPending}
              className={cn(
                "transition-all p-1",
                isPending
                  ? "text-emerald-500/60 hover:text-emerald-500 hover:scale-110 cursor-pointer"
                  : "text-white/15 cursor-not-allowed"
              )}
              title={isPending ? "Approve Story" : "Already processed"}
            >
              <IconCheck size={18} />
            </button>
            <button
              type="button"
              onClick={() => handleOpenStoryActionModal(row, "REJECT")}
              disabled={!isPending}
              className={cn(
                "transition-all p-1",
                isPending
                  ? "text-destructive/60 hover:text-destructive hover:scale-110 cursor-pointer"
                  : "text-white/15 cursor-not-allowed"
              )}
              title={isPending ? "Reject Story" : "Already processed"}
            >
              <IconX size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="shrink-0 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white font-orbitron tracking-tight uppercase wrap-break-word w-full">
          Approvals &amp; Verifications
        </h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-[11px] sm:text-sm md:text-lg">
          Review and approve pending applications
        </p>
      </div>

      {/* Approvals Section */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
              Approvals
            </h2>
            {approvalsRes?.meta?.counts && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                {approvalsRes.meta.counts.pending} Pending
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0">
            {(["All", "Academies", "Agents", "Clubs"] as const).map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant="outline"
                className={cn(
                  "border-white/10 h-9 sm:h-10 px-3 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer",
                  activeTab === tab
                    ? "bg-white/10 text-white border-white/30"
                    : "bg-black/40 text-white/60 hover:text-white"
                )}
              >
                {tab}
              </Button>
            ))}

            <button
              type="button"
              onClick={() => refetchApprovals()}
              className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors ml-1"
              title="Refresh Approvals"
            >
              <RefreshCw className={cn("size-3.5", isApprovalsLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          {isApprovalsLoading ? (
            <TableSkeleton
              rowCount={5}
              headers={["NAME", "ROLE", "DATE", "STATUS", "ACTIONS"]}
              hasAvatar={true}
              actionButtonsCount={3}
            />
          ) : isApprovalsError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load applications.
              </p>
              <Button
                onClick={() => refetchApprovals()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-white/60 text-sm font-bold">
                {activeTab === "All"
                  ? "No approval applications found."
                  : `No ${activeTab.toLowerCase()} applications found.`}
              </p>
              <p className="text-white/30 text-xs">
                Pending registration and verification requests will appear here.
              </p>
            </div>
          ) : (
            <DashboardTable columns={approvalColumns} data={filteredApprovals} />
          )}
        </div>
      </div>

      {/* Success Story Section */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight">
              Success Story
            </h2>
            {storiesRes?.meta?.counts && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                {storiesRes.meta.counts.pending} Pending
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto pb-1 sm:pb-0">
            {(["All", "Academies", "Agents", "Clubs"] as const).map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveStoryTab(tab)}
                variant="outline"
                className={cn(
                  "border-white/10 h-9 sm:h-10 px-3 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer",
                  activeStoryTab === tab
                    ? "bg-white/10 text-white border-white/30"
                    : "bg-black/40 text-white/60 hover:text-white"
                )}
              >
                {tab}
              </Button>
            ))}

            <button
              type="button"
              onClick={() => refetchStories()}
              className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors ml-1"
              title="Refresh Stories"
            >
              <RefreshCw className={cn("size-3.5", isStoriesLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          {isStoriesLoading ? (
            <TableSkeleton
              rowCount={5}
              headers={["STORY TITLE", "ROLE", "DATE", "STATUS", "ACTION"]}
              hasAvatar={true}
              actionButtonsCount={3}
            />
          ) : isStoriesError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load success stories.
              </p>
              <Button
                onClick={() => refetchStories()}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-xs rounded-xl"
              >
                <RefreshCw className="size-3.5 mr-1.5" /> Try Again
              </Button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-white/60 text-sm font-bold">
                {activeStoryTab === "All"
                  ? "No success stories found."
                  : `No ${activeStoryTab.toLowerCase()} success stories found.`}
              </p>
              <p className="text-white/30 text-xs">
                Submitted success stories from academies, agents, and clubs will appear here.
              </p>
            </div>
          ) : (
            <DashboardTable columns={storyColumns} data={filteredStories} />
          )}
        </div>
      </div>

      {/* View Application Details Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-2xl p-6 rounded-3xl w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedApp && (
            <div className="flex flex-col gap-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-white/10 overflow-hidden border border-white/20 shrink-0 flex items-center justify-center">
                      {selectedApp.avatar || selectedApp.user?.avatar ? (
                        <img
                          src={selectedApp.avatar || selectedApp.user?.avatar}
                          alt={selectedApp.name}
                          className="size-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder_img.jpg";
                          }}
                        />
                      ) : (
                        <span className="text-lg font-black text-white">
                          {(selectedApp.name || "A").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
                        {selectedApp.name}
                      </DialogTitle>
                      <p className="text-xs text-white/50 mt-0.5">
                        {selectedApp.user?.agencyName ||
                          selectedApp.user?.clubName ||
                          selectedApp.email}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={selectedApp.status} />
                </div>
              </DialogHeader>

              {/* Applicant & Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#1e1e20] border border-white/5 text-xs">
                <div>
                  <span className="text-white/40 block">Applicant Name</span>
                  <span className="text-white font-semibold">
                    {selectedApp.user?.name || selectedApp.name}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Email Address</span>
                  <span className="text-white font-semibold">{selectedApp.email}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Role</span>
                  <span className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                    {selectedApp.role === "AGENT" && <IconBriefcase size={14} className="text-orange-400" />}
                    {selectedApp.role === "CLUB" && <IconBuildingCommunity size={14} className="text-emerald-400" />}
                    {selectedApp.role === "ACADEMY" && <IconSchool size={14} className="text-yellow-400" />}
                    {selectedApp.roleLabel || selectedApp.role}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Contact Phone</span>
                  <span className="text-white font-semibold">
                    {selectedApp.user?.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Country</span>
                  <span className="text-white font-semibold">
                    {selectedApp.user?.country || selectedApp.profile?.country || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Application Date</span>
                  <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                    <IconClock size={13} className="text-white/50" />
                    {selectedApp.date ||
                      (selectedApp.user?.createdAt
                        ? selectedApp.user.createdAt.split("T")[0]
                        : "—")}
                  </span>
                </div>

                {/* FIFA / License ID */}
                {(selectedApp.user?.fifaLicenseNumber || selectedApp.profile?.licenseId) && (
                  <div>
                    <span className="text-white/40 block">License / FIFA Number</span>
                    <span className="text-white font-semibold">
                      {selectedApp.user?.fifaLicenseNumber || selectedApp.profile?.licenseId}
                    </span>
                  </div>
                )}

                {/* Official Website */}
                {(selectedApp.user?.officialWebsite || selectedApp.profile?.officialWebsite) && (
                  <div>
                    <span className="text-white/40 block">Official Website</span>
                    <a
                      href={
                        selectedApp.user?.officialWebsite ||
                        selectedApp.profile?.officialWebsite
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-semibold truncate"
                    >
                      {selectedApp.user?.officialWebsite ||
                        selectedApp.profile?.officialWebsite}
                      <IconExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* League / Job Title if club */}
                {selectedApp.profile?.league && (
                  <div>
                    <span className="text-white/40 block">League</span>
                    <span className="text-white font-semibold">
                      {selectedApp.profile.league}
                    </span>
                  </div>
                )}
                {selectedApp.profile?.clubType && (
                  <div>
                    <span className="text-white/40 block">Representative Title</span>
                    <span className="text-white font-semibold">
                      {selectedApp.profile.clubType}
                    </span>
                  </div>
                )}
              </div>

              {/* Verification Documents Section */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-bold text-white/60 uppercase tracking-wider">
                  Verification Documents
                </Label>
                <div className="flex flex-col gap-2">
                  {selectedApp.user?.identityDocument && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e20] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <IconFileText size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-white font-semibold">Identity Document (Passport/ID)</p>
                          <p className="text-white/40 text-[10px]">Government issued proof of identity</p>
                        </div>
                      </div>
                      <a
                        href={selectedApp.user.identityDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10"
                      >
                        View <IconExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  {selectedApp.user?.licenseCertificateDocument && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e20] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <IconFileText size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-white font-semibold">License Certificate Document</p>
                          <p className="text-white/40 text-[10px]">Official credentials and certificates</p>
                        </div>
                      </div>
                      <a
                        href={selectedApp.user.licenseCertificateDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10"
                      >
                        View <IconExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  {selectedApp.profile?.associationMembershipDocument && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e20] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <IconFileText size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-white font-semibold">Association Membership Document</p>
                          <p className="text-white/40 text-[10px]">Authorized membership verification</p>
                        </div>
                      </div>
                      <a
                        href={selectedApp.profile.associationMembershipDocument}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10"
                      >
                        View <IconExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  {selectedApp.profile?.verificationDocuments?.map((doc, i) => (
                    <div
                      key={doc._id || i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e20] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <IconFileText size={18} className="text-primary shrink-0" />
                        <div>
                          <p className="text-white font-semibold">
                            {doc.documentType?.replace(/_/g, " ") || "Verification Document"}
                          </p>
                          {doc.adminReviewNotes && (
                            <p className="text-white/40 text-[10px]">{doc.adminReviewNotes}</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 border border-white/10"
                      >
                        View <IconExternalLink size={13} />
                      </a>
                    </div>
                  ))}

                  {!selectedApp.user?.identityDocument &&
                    !selectedApp.user?.licenseCertificateDocument &&
                    !selectedApp.profile?.associationMembershipDocument &&
                    (!selectedApp.profile?.verificationDocuments ||
                      selectedApp.profile.verificationDocuments.length === 0) && (
                      <p className="text-xs text-white/40 italic p-3 rounded-xl bg-[#1e1e20]/60">
                        No uploaded verification documents found for this applicant.
                      </p>
                    )}
                </div>
              </div>

              {/* Review Notes (if already reviewed) */}
              {(selectedApp.reviewNotes || selectedApp.user?.adminReviewNotes) && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-white/40 block font-bold uppercase tracking-wider mb-1">
                    Review Notes
                  </span>
                  <p className="text-white/80">
                    {selectedApp.reviewNotes || selectedApp.user?.adminReviewNotes}
                  </p>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApp(null)}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Close
                </Button>

                {(selectedApp.status || "").toUpperCase() === "PENDING" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleOpenActionModal(selectedApp, "REJECT")}
                      className="rounded-xl flex items-center gap-1.5"
                    >
                      <IconX size={16} /> Reject
                    </Button>
                    <Button
                      onClick={() => handleOpenActionModal(selectedApp, "APPROVE")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5"
                    >
                      <IconCheck size={16} /> Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Success Story Details Modal */}
      <Dialog open={!!selectedStory} onOpenChange={(open) => !open && setSelectedStory(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-2xl p-6 rounded-3xl w-[92vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedStory && (
            <div className="flex flex-col gap-5">
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
                      {selectedStory.storyTitle}
                    </DialogTitle>
                    <p className="text-xs text-white/50 mt-0.5">
                      {selectedStory.authorName || selectedStory.author?.name} •{" "}
                      {selectedStory.roleLabel || selectedStory.role}
                    </p>
                  </div>
                  <StatusPill status={selectedStory.status} />
                </div>
              </DialogHeader>

              {/* Cover Image */}
              {(selectedStory.coverImage || selectedStory.image || selectedStory.photo) && (
                <div className="w-full h-52 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <img
                    src={selectedStory.coverImage || selectedStory.image || selectedStory.photo}
                    alt={selectedStory.storyTitle}
                    className="size-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder_img.jpg";
                    }}
                  />
                </div>
              )}

              {/* Story Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#1e1e20] border border-white/5 text-xs">
                {selectedStory.category && (
                  <div>
                    <span className="text-white/40 block">Category</span>
                    <span className="text-white font-semibold">{selectedStory.category}</span>
                  </div>
                )}
                <div>
                  <span className="text-white/40 block">Published Date</span>
                  <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                    <IconClock size={13} className="text-white/50" />
                    {selectedStory.date ||
                      (selectedStory.createdAt ? selectedStory.createdAt.split("T")[0] : "—")}
                  </span>
                </div>
                {selectedStory.authorName && (
                  <div>
                    <span className="text-white/40 block">Author / Entity</span>
                    <span className="text-white font-semibold">{selectedStory.authorName}</span>
                  </div>
                )}
                {selectedStory.playerName && (
                  <div>
                    <span className="text-white/40 block">Player Name</span>
                    <span className="text-white font-semibold">{selectedStory.playerName}</span>
                  </div>
                )}
                {selectedStory.position && (
                  <div>
                    <span className="text-white/40 block">Player Position</span>
                    <span className="text-white font-semibold">{selectedStory.position}</span>
                  </div>
                )}
                {(selectedStory.signedClub ||
                  selectedStory.currentAcademy ||
                  selectedStory.previousAcademy) && (
                  <div>
                    <span className="text-white/40 block">Club / Academy</span>
                    <span className="text-white font-semibold">
                      {selectedStory.signedClub ||
                        selectedStory.currentAcademy ||
                        selectedStory.previousAcademy}
                    </span>
                  </div>
                )}
              </div>

              {/* Story Content */}
              {selectedStory.storyContent && (
                <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-[#1e1e20] border border-white/5">
                  <span className="text-white/40 text-xs font-bold uppercase tracking-wider">
                    Story Description
                  </span>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {selectedStory.storyContent}
                  </p>
                </div>
              )}

              {/* Review Notes if any */}
              {selectedStory.reviewNotes && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-white/40 block font-bold uppercase tracking-wider mb-1">
                    Review Notes
                  </span>
                  <p className="text-white/80">{selectedStory.reviewNotes}</p>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedStory(null)}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Close
                </Button>

                {(selectedStory.status || "").toUpperCase() === "PENDING" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleOpenStoryActionModal(selectedStory, "REJECT")}
                      className="rounded-xl flex items-center gap-1.5"
                    >
                      <IconX size={16} /> Reject
                    </Button>
                    <Button
                      onClick={() => handleOpenStoryActionModal(selectedStory, "APPROVE")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5"
                    >
                      <IconCheck size={16} /> Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Application Approve / Reject Action Modal */}
      <Dialog open={!!actionModal} onOpenChange={(open) => !open && setActionModal(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-md p-6 rounded-3xl w-[92vw] sm:w-full">
          {actionModal && (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
                  {actionModal.action === "APPROVE" ? "Approve Application" : "Reject Application"}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs sm:text-sm text-gray-400">
                Are you sure you want to {actionModal.action.toLowerCase()}{" "}
                <span className="font-bold text-white">&quot;{actionModal.app.name}&quot;</span>?
              </p>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-white/60 font-semibold">Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter review notes or explanation..."
                  className="bg-[#1e1e20] border-[#2c2c30] text-white text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex gap-3 sm:gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActionModal(null)}
                  disabled={isUpdatingApproval}
                  className="flex-1 bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={actionModal.action === "APPROVE" ? "default" : "destructive"}
                  onClick={handleConfirmAction}
                  disabled={isUpdatingApproval}
                  className={cn(
                    "flex-1 h-10 rounded-xl font-bold flex items-center justify-center gap-2",
                    actionModal.action === "APPROVE" &&
                      "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isUpdatingApproval ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : actionModal.action === "APPROVE" ? (
                    "Confirm Approval"
                  ) : (
                    "Confirm Rejection"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Story Approve / Reject Action Modal */}
      <Dialog open={!!storyActionModal} onOpenChange={(open) => !open && setStoryActionModal(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-md p-6 rounded-3xl w-[92vw] sm:w-full">
          {storyActionModal && (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
                  {storyActionModal.action === "APPROVE"
                    ? "Approve Success Story"
                    : "Reject Success Story"}
                </DialogTitle>
              </DialogHeader>

              <p className="text-xs sm:text-sm text-gray-400">
                Are you sure you want to {storyActionModal.action.toLowerCase()}{" "}
                <span className="font-bold text-white">
                  &quot;{storyActionModal.story.storyTitle}&quot;
                </span>
                ?
              </p>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-white/60 font-semibold">Review Notes</Label>
                <Textarea
                  value={storyReviewNotes}
                  onChange={(e) => setStoryReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter review notes..."
                  className="bg-[#1e1e20] border-[#2c2c30] text-white text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-primary/40 resize-none"
                />
              </div>

              <div className="flex gap-3 sm:gap-4 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStoryActionModal(null)}
                  disabled={isUpdatingStory}
                  className="flex-1 bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={storyActionModal.action === "APPROVE" ? "default" : "destructive"}
                  onClick={handleConfirmStoryAction}
                  disabled={isUpdatingStory}
                  className={cn(
                    "flex-1 h-10 rounded-xl font-bold flex items-center justify-center gap-2",
                    storyActionModal.action === "APPROVE" &&
                      "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isUpdatingStory ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : storyActionModal.action === "APPROVE" ? (
                    "Confirm Approval"
                  ) : (
                    "Confirm Rejection"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminApprovals;

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
import {
  useGetApprovalsQuery,
  useUpdateApprovalStatusMutation,
} from "@/redux/features/admin/adminApi";
import { IApprovalApplication } from "@/types/admin.type";
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

interface StoryRow {
  title: string;
  role: string;
  date: string;
  status: "Approved" | "Pending";
}

type TabType = "All" | "Academies" | "Agents" | "Clubs";

const SuperAdminApprovals = () => {
  const [activeTab, setActiveTab] = useState<TabType>("All");

  // Derive role param for API
  const roleParam = useMemo(() => {
    if (activeTab === "Academies") return "ACADEMIES";
    if (activeTab === "Agents") return "AGENTS";
    if (activeTab === "Clubs") return "CLUBS";
    return "ALL";
  }, [activeTab]);

  const {
    data: approvalsRes,
    isLoading,
    isError,
    refetch,
  } = useGetApprovalsQuery({ role: roleParam });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateApprovalStatusMutation();

  // Dialog States
  const [selectedApp, setSelectedApp] = useState<IApprovalApplication | null>(null);
  const [actionModal, setActionModal] = useState<{
    app: IApprovalApplication;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const approvals = useMemo(() => approvalsRes?.data || [], [approvalsRes?.data]);

  // Tab Filtering (both from query and client fallback)
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
      await updateStatus({
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
            {/* View Details Eye Icon */}
            <button
              type="button"
              onClick={() => setSelectedApp(row)}
              className="text-white/40 hover:text-white transition-all p-1"
              title="View Application Details"
            >
              <IconEye size={18} />
            </button>

            {/* Approve Check Icon */}
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

            {/* Reject Cross Icon */}
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

  const storyColumns: Column<StoryRow>[] = [
    {
      header: "Story Title",
      key: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0">
            <img
              src={`https://i.pravatar.cc/150?u=${row.title}`}
              alt={row.title}
              className="size-full object-cover"
            />
          </div>
          <p className="text-white text-sm font-black uppercase max-w-62.5 leading-tight line-clamp-2">
            {row.title}
          </p>
        </div>
      ),
    },
    {
      header: "Role",
      key: "role",
      align: "center",
      cellClassName: "text-white/60 text-sm font-medium",
    },
    {
      header: "Date",
      key: "date",
      align: "center",
      cellClassName: "text-white/60 text-sm font-medium",
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
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <button className="text-white/40 hover:text-white transition-all">
            <IconEye size={18} />
          </button>
          <button className="text-emerald-500/60 hover:text-emerald-500 transition-all">
            <IconCheck size={18} />
          </button>
          <button className="text-destructive/60 hover:text-destructive transition-all">
            <IconX size={18} />
          </button>
        </div>
      ),
    },
  ];

  const storyData: StoryRow[] = [
    {
      title: "Academy Graduate Makes First Team Debut",
      role: "Academies",
      date: "2024-01-15",
      status: "Approved",
    },
    {
      title: "Agent Luis Secures Trial for Midfielder at Benfica Academy",
      role: "Agents",
      date: "2024-02-01",
      status: "Pending",
    },
    {
      title: "1-114 Winger Signed by National Talent Centre",
      role: "Clubs",
      date: "2023-12-01",
      status: "Approved",
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
              onClick={() => refetch()}
              className="size-9 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center text-white/60 hover:text-white transition-colors ml-1"
              title="Refresh"
            >
              <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 text-primary animate-spin" />
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">
                Loading approval applications...
              </p>
            </div>
          ) : isError ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <p className="text-destructive text-sm font-semibold">
                Failed to load applications.
              </p>
              <Button
                onClick={() => refetch()}
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
        <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight shrink-0">
          Success Story
        </h2>

        <div className="w-full overflow-x-auto no-scrollbar">
          <DashboardTable columns={storyColumns} data={storyData} />
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
                  {/* Identity Document */}
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

                  {/* License Certificate Document */}
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

                  {/* Association Membership Document */}
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

                  {/* Extra Documents array */}
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

      {/* Approve / Reject Action Modal */}
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

              {/* Review Notes Textarea */}
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
                  disabled={isUpdating}
                  className="flex-1 bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 rounded-xl font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={actionModal.action === "APPROVE" ? "default" : "destructive"}
                  onClick={handleConfirmAction}
                  disabled={isUpdating}
                  className={cn(
                    "flex-1 h-10 rounded-xl font-bold flex items-center justify-center gap-2",
                    actionModal.action === "APPROVE" &&
                      "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  {isUpdating ? (
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
    </div>
  );
};

export default SuperAdminApprovals;

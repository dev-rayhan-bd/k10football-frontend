/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useMemo } from "react";
import { 
  IconUser, 
  IconTrash, 
  IconAward, 
  IconSchool, 
  IconBuildingCommunity,
  IconUserCheck,
  IconClock,
  IconShieldCheck,
  IconBriefcase
} from "@tabler/icons-react";
import { Loader2, RefreshCw } from "lucide-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useGetMembershipGrantsQuery,
  useGrantMembershipMutation,
  useRevokeMembershipGrantMutation,
} from "@/redux/features/admin/adminApi";
import { IMembershipGrant } from "@/types/admin.type";
import { ErrorToast } from "@/helpers/ValidationHelper";

type CategoryKey = "PLAYER" | "COACH" | "ACADEMY" | "CLUB" | "AGENT";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "PLAYER", label: "Player" },
  { key: "COACH", label: "Coach" },
  { key: "ACADEMY", label: "Academy" },
  { key: "CLUB", label: "Club" },
  { key: "AGENT", label: "Agent" },
];

const DURATION_OPTIONS = [
  { value: "3 MONTHS", label: "3 Months" },
  { value: "6 MONTHS", label: "6 Months" },
  { value: "1 YEAR", label: "1 Year" },
];

export const SuperAdminGrantMembership = () => {
  const { data: grantsRes, isLoading, isError, refetch } = useGetMembershipGrantsQuery();
  const [grantMembership, { isLoading: isGranting }] = useGrantMembershipMutation();
  const [revokeGrant, { isLoading: isRevoking }] = useRevokeMembershipGrantMutation();

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("PLAYER");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [duration, setDuration] = useState<string>("1 YEAR");
  const [revokingGrant, setRevokingGrant] = useState<IMembershipGrant | null>(null);

  const grants = useMemo(() => grantsRes?.data || [], [grantsRes?.data]);
  const dropdownUsers = useMemo(
    () => grantsRes?.meta?.dropdownUsers || [],
    [grantsRes?.meta?.dropdownUsers]
  );

  // Filter dropdown users by currently selected category
  const activeUsers = useMemo(() => {
    return dropdownUsers.filter((u) => {
      const userCategory = (u.category || u.role || "").toUpperCase();
      return userCategory === selectedCategory;
    });
  }, [dropdownUsers, selectedCategory]);

  const selectedUser = useMemo(() => {
    return dropdownUsers.find((u) => (u.userId || u._id) === selectedUserId);
  }, [dropdownUsers, selectedUserId]);

  const handleGrantMembership = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      ErrorToast("Please select a user first.");
      return;
    }

    // Check if user already has an active grant in our list
    const alreadyActive = grants.some(
      (g) =>
        (g.userId === selectedUserId || g.email === selectedUser?.email) &&
        (g.status === "ACTIVE" || g.status === "Active")
    );
    if (alreadyActive) {
      ErrorToast(`${selectedUser?.name || "This user"} already has an active premium membership grant.`);
      return;
    }

    try {
      await grantMembership({
        category: selectedCategory,
        userId: selectedUserId,
        duration,
      }).unwrap();
      setSelectedUserId("");
    } catch {
      // Toast handled by API middleware
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokingGrant) return;
    const grantId = revokingGrant.grantId || revokingGrant._id;
    try {
      await revokeGrant(grantId).unwrap();
      setRevokingGrant(null);
    } catch {
      // Toast handled by API middleware
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    PLAYER: <IconUser size={14} className="text-sky-400 shrink-0" />,
    COACH: <IconUserCheck size={14} className="text-purple-400 shrink-0" />,
    ACADEMY: <IconSchool size={14} className="text-yellow-400 shrink-0" />,
    CLUB: <IconBuildingCommunity size={14} className="text-emerald-400 shrink-0" />,
    AGENT: <IconBriefcase size={14} className="text-orange-400 shrink-0" />,
  };

  const columns: Column<IMembershipGrant>[] = [
    {
      header: "User Details",
      key: "name",
      render: (row) => {
        const avatar = row.userDetails?.avatar;
        const initial = (row.name || "U").charAt(0).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={row.name}
                className="size-8 rounded-full object-cover border border-white/10 shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder_img.jpg";
                }}
              />
            ) : (
              <div className="size-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 text-xs font-bold shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-black uppercase truncate">{row.name}</p>
              <p className="text-white/40 text-[10px] font-bold lowercase truncate">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      key: "category",
      align: "center",
      render: (row) => {
        const catKey = (row.category || "").toUpperCase();
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-white/10 bg-white/5 text-white/80">
            {categoryIcons[catKey] || <IconUser size={14} />}
            {catKey || row.category}
          </span>
        );
      },
    },
    {
      header: "Duration",
      key: "duration",
      align: "center",
      render: (row) => (
        <span className="text-white/80 text-sm font-bold font-orbitron">
          {row.duration || (row.durationMonths ? `${row.durationMonths} Months` : "—")}
        </span>
      ),
    },
    {
      header: "Validity Period",
      key: "validityPeriod",
      align: "center",
      render: (row) => {
        if (row.validityPeriod) {
          return (
            <span className="text-[11px] font-bold text-white/60 tracking-wider">
              {row.validityPeriod}
            </span>
          );
        }
        return (
          <div className="text-[11px] font-bold text-white/60 tracking-wider">
            <span className="text-emerald-400">{row.startDate || "—"}</span>
            <span className="mx-2 text-white/20">to</span>
            <span className="text-red-400">{row.endDate || "—"}</span>
          </div>
        );
      },
    },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => {
        const isAct = (row.status || "").toUpperCase() === "ACTIVE";
        return (
          <span
            className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
              isAct
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}
          >
            {row.status}
          </span>
        );
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => {
        const isAct = (row.status || "").toUpperCase() === "ACTIVE";
        return isAct ? (
          <button
            type="button"
            onClick={() => setRevokingGrant(row)}
            className="size-9 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105 cursor-pointer"
            title="Revoke / Delete Grant"
          >
            <IconTrash size={18} />
          </button>
        ) : (
          <span className="text-[10px] font-black uppercase tracking-wider text-white/20">None</span>
        );
      },
    },
  ];

  const activeGrantsCount = useMemo(() => {
    return grants.filter((m) => (m.status || "").toUpperCase() === "ACTIVE").length;
  }, [grants]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white font-orbitron tracking-tight leading-none uppercase truncate">
          Grant Membership
        </h1>
        <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] sm:text-[11px] mt-1 sm:mt-2 truncate">
          Bestow direct premium memberships to users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start w-full min-w-0">
        {/* Grant Membership Form */}
        <div className="bg-[#111111] border border-white/15 rounded-3xl sm:rounded-4xl p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 shadow-2xl min-w-0 overflow-hidden w-full">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#E31B23]/10 border border-[#E31B23]/20 flex items-center justify-center text-[#E31B23] shrink-0">
              <IconShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black uppercase text-white font-orbitron truncate">
                Grant Premium
              </h2>
              <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest font-semibold mt-0.5 truncate">
                Activate instant premium access
              </p>
            </div>
          </div>

          <form onSubmit={handleGrantMembership} className="flex flex-col gap-4 sm:gap-5">
            {/* User Type Selection */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/60">
                User Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {CATEGORIES.map(({ key }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(key);
                      setSelectedUserId("");
                    }}
                    className={cn(
                      "py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase transition-all text-center border cursor-pointer shrink-0 truncate px-1",
                      selectedCategory === key
                        ? "bg-[#E31B23] border-[#E31B23] text-white shadow-lg shadow-[#E31B23]/25"
                        : "bg-white/2 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Select User */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Select {selectedCategory} <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-black/40 border border-white/15 rounded-xl py-3 sm:py-3.5 px-3 sm:px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-white/25 transition-all cursor-pointer appearance-none truncate pr-10 disabled:opacity-50"
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    {activeUsers.length === 0
                      ? `No ${selectedCategory.toLowerCase()} users available`
                      : "Select registered user"}
                  </option>
                  {activeUsers.map((u) => {
                    const uId = u.userId || u._id;
                    const label =
                      u.displayLabel ||
                      `${u.name} (${u.currentPlan ? `${u.currentPlan} - ` : ""}${u.email})`;
                    return (
                      <option key={uId} value={uId} className="bg-[#111111] text-white">
                        {label}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <IconClock size={16} />
                </div>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white/60">
                Membership Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {DURATION_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDuration(item.value)}
                    className={cn(
                      "py-3 sm:py-3.5 px-1 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all text-center border cursor-pointer truncate",
                      duration === item.value
                        ? "bg-white text-black border-white font-black"
                        : "bg-white/2 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGranting || !selectedUserId}
              className="w-full bg-[#E31B23] hover:bg-[#C2181F] text-white font-black uppercase tracking-widest text-[10px] sm:text-xs py-3.5 sm:py-4 rounded-xl transition-all shadow-lg shadow-[#E31B23]/10 mt-2 font-orbitron cursor-pointer flex items-center justify-center gap-2 truncate px-2 disabled:opacity-50"
            >
              {isGranting ? (
                <>
                  <Loader2 className="size-4 animate-spin shrink-0" />
                  <span>Granting Premium...</span>
                </>
              ) : (
                <>
                  <IconAward size={18} className="shrink-0" />
                  <span className="truncate">Grant Premium Access</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Active Grants Table Card */}
        <div className="bg-[#111111] border border-white/15 rounded-3xl sm:rounded-4xl p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 lg:col-span-2 shadow-2xl min-w-0 overflow-hidden w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 w-full shrink-0">
            <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron truncate w-full sm:w-auto">
              Active Grants
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest shrink-0">
                Total {grantsRes?.meta?.totalGrants ?? activeGrantsCount} Grants
              </span>
              <button
                type="button"
                onClick={() => refetch()}
                className="size-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                title="Refresh Grants"
              >
                <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar">
            {isLoading ? (
              <TableSkeleton
                rowCount={5}
                headers={["USER", "CATEGORY", "DURATION", "VALIDITY PERIOD", "STATUS", "ACTIONS"]}
                hasAvatar={true}
                actionButtonsCount={1}
              />
            ) : isError ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                <p className="text-destructive text-sm font-semibold">
                  Failed to load membership grants.
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 text-xs"
                >
                  <RefreshCw className="size-3.5 mr-1.5" /> Try Again
                </Button>
              </div>
            ) : grants.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-white/60 text-sm font-bold">No membership grants yet.</p>
                <p className="text-white/30 text-xs">
                  Select a user on the left to grant premium access.
                </p>
              </div>
            ) : (
              <DashboardTable columns={columns} data={grants} />
            )}
          </div>
        </div>
      </div>

      {/* Revoke / Delete Confirmation Modal */}
      <Dialog open={!!revokingGrant} onOpenChange={(open) => !open && setRevokingGrant(null)}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-md p-6 rounded-3xl w-[92vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white font-orbitron tracking-tight">
              Revoke Membership Grant
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-400 mt-2">
            Are you sure you want to revoke the premium membership grant for{" "}
            <span className="font-bold text-white">&quot;{revokingGrant?.name}&quot;</span>?
            This will immediately remove their granted premium access.
          </p>

          <div className="flex gap-3 sm:gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokingGrant(null)}
              disabled={isRevoking}
              className="flex-1 bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 rounded-xl font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="flex-1 h-10 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Access"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminGrantMembership;

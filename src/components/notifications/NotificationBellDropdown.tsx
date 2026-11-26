"use client";
import { getUserRole, normalizeRole } from "@/helpers/SessionHelper";
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { apiSlice } from "@/redux/features/api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock,
  CreditCard,
  FileCheck,
  ClipboardCheck,
  Newspaper,
  ShieldCheck,
  Loader2,
  Check,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import {
  getCoachReassignmentPath,
  getCvValidatedPath,
  getEvaluationReportPath,
  getPayoutReviewPath,
  getAcademyAffiliationPath,
  getExtraEventPath,
  CV_REFRESH_NOTIFICATION_TYPES,
  AFFILIATION_REFRESH_NOTIFICATION_TYPES,
  EXTRA_EVENT_NOTIFICATION_TYPES,
  INotificationItem,
} from "@/types/notification.type";
import { cn } from "@/lib/utils";

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "SUBSCRIPTION":
      return <CreditCard className="size-4 text-emerald-400" />;
    case "CV_VALIDATION_REQUEST":
      return <FileCheck className="size-4 text-sky-400" />;
    case "NEW_EVALUATION_REQUEST":
      return <ClipboardCheck className="size-4 text-amber-400" />;
    case "ACADEMY_NEWS":
      return <Newspaper className="size-4 text-purple-400" />;
    case "ACADEMY_AFFILIATION_APPROVED":
      return <ShieldCheck className="size-4 text-emerald-400" />;
    default:
      return <Bell className="size-4 text-primary" />;
  }
};

export const NotificationBellDropdown = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Unread count query (polls every 30s)
  const { data: countResponse } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });

  // 2. Notifications list query
  const {
    data: notificationsResponse,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
  } = useGetNotificationsQuery({ limit: 10 });

  const notifications = notificationsResponse?.data ?? [];

  // New PLAYER_CV_VALIDATED / PAYMENT_SUCCESS / CV_VALIDATION_REQUEST → refetch the CV (tier card state).
  const dispatch = useAppDispatch();
  const latestCvNotificationId =
    notifications.find((n) => CV_REFRESH_NOTIFICATION_TYPES.includes(n.type))?._id ?? null;
  const lastCvNotificationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!latestCvNotificationId || latestCvNotificationId === lastCvNotificationIdRef.current) return;
    const isFirstLoad = lastCvNotificationIdRef.current === null;
    lastCvNotificationIdRef.current = latestCvNotificationId;
    if (!isFirstLoad) dispatch(apiSlice.util.invalidateTags([TagTypes.PLAYERS]));
  }, [latestCvNotificationId, dispatch]);

  // New invitation / withdrawal / approval / rejection → refetch My Coaches and the coach's invitations.
  const latestAffiliationNotificationId =
    notifications.find((n) => AFFILIATION_REFRESH_NOTIFICATION_TYPES.includes(n.type))?._id ?? null;
  const lastAffiliationNotificationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!latestAffiliationNotificationId || latestAffiliationNotificationId === lastAffiliationNotificationIdRef.current)
      return;
    const isFirstLoad = lastAffiliationNotificationIdRef.current === null;
    lastAffiliationNotificationIdRef.current = latestAffiliationNotificationId;
    if (!isFirstLoad) dispatch(apiSlice.util.invalidateTags([TagTypes.COACHES, TagTypes.ACADEMY]));
  }, [latestAffiliationNotificationId, dispatch]);

  // New event registration / confirmed payment → refetch events and "My events".
  const latestExtraEventNotificationId =
    notifications.find((n) => EXTRA_EVENT_NOTIFICATION_TYPES.includes(n.type))?._id ?? null;
  const lastExtraEventNotificationIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!latestExtraEventNotificationId || latestExtraEventNotificationId === lastExtraEventNotificationIdRef.current)
      return;
    const isFirstLoad = lastExtraEventNotificationIdRef.current === null;
    lastExtraEventNotificationIdRef.current = latestExtraEventNotificationId;
    if (!isFirstLoad) dispatch(apiSlice.util.invalidateTags([TagTypes.EXTRA_EVENTS]));
  }, [latestExtraEventNotificationId, dispatch]);

  // Compute unread count reliably from count query, meta, or notifications array
  const rawCount = countResponse?.data?.unreadCount ?? (countResponse?.data as unknown as number);
  const unreadCount =
    typeof rawCount === "number"
      ? rawCount
      : typeof notificationsResponse?.meta?.unreadCount === "number"
      ? notificationsResponse.meta.unreadCount
      : notifications.filter((n) => !n.isRead).length;

  // Mutations
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllAsRead().unwrap();
    } catch {
      // Handled by onQueryStarted
    }
  };

  const handleItemClick = async (item: INotificationItem) => {
    // Mark as read if not read
    if (!item.isRead) {
      try {
        await markAsRead(item._id).unwrap();
      } catch {
        // Handled
      }
    }

    // Handle deep link if notification has actionUrl
    const deepLink =
      getPayoutReviewPath(item) ||
      getAcademyAffiliationPath(item) ||
      getExtraEventPath(item, normalizeRole(getUserRole() || "")) ||
      getCvValidatedPath(item, normalizeRole(getUserRole() || ""));
    if (deepLink) {
      setIsOpen(false);
      router.push(deepLink);
      return;
    }

    const evaluationPath = getEvaluationReportPath(item);
    if (evaluationPath) {
      setIsOpen(false);
      router.push(evaluationPath);
      return;
    }

    const reassignPath = getCoachReassignmentPath(item, normalizeRole(getUserRole() || ""));
    if (reassignPath) {
      setIsOpen(false);
      router.push(reassignPath);
      return;
    }

    const actionUrl = item.data?.actionUrl;
    if (actionUrl) {
      setIsOpen(false);
      if (actionUrl.startsWith("/coach/")) {
        router.push(`/dashboard${actionUrl}`);
      } else if (actionUrl.startsWith("/player/")) {
        router.push(`/dashboard${actionUrl}`);
      } else {
        router.push(actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`);
      }
    }
  };

  const handleSingleMarkRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch {
      // Handled
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await deleteNotification(id).unwrap();
    } catch {
      // Handled
    } finally {
      setDeletingId(null);
    }
  };

  // Determine role-aware "View all notifications" URL
  const getNotificationsUrl = () => {
    if (pathname.startsWith("/dashboard/coach")) return "/dashboard/coach/notifications";
    if (pathname.startsWith("/dashboard/club")) return "/dashboard/club/notifications";
    if (pathname.startsWith("/dashboard/academy")) return "/dashboard/academy/management/notifications";
    if (pathname.startsWith("/dashboard/player")) return "/dashboard/player/notifications";
    if (pathname.startsWith("/dashboard/parent")) return "/dashboard/parent/notifications";
    if (pathname.startsWith("/dashboard/admin")) return "/dashboard/admin/notifications";
    if (pathname.startsWith("/dashboard/agent")) return "/dashboard/agent/notifications";
    return "/dashboard/notifications";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center cursor-pointer group"
        >
          <Bell className="size-5 transition-transform group-hover:scale-105" />

          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#E31B23] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0A0A] font-orbitron leading-none shadow-md shadow-red-600/50 z-30 pointer-events-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] sm:w-96 max-w-sm sm:max-w-md bg-[#0D0D0D] border-white/15 text-foreground rounded-2xl shadow-2xl p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h3 className="font-heading uppercase tracking-wider text-sm font-semibold text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={isMarkingAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                title="Mark all as read"
              >
                {isMarkingAll ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <CheckCheck className="size-3.5 text-primary" />
                )}
                <span className="text-[11px]">Mark all read</span>
              </Button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <ScrollArea className="max-h-[360px] overflow-y-auto">
          {isLoadingList && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
              <div className="size-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                <Bell className="size-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground/60 max-w-xs">
                You will receive alerts here when events, CV requests, or updates occur.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {notifications.map((item) => {
                const isItemDeleting = deletingId === item._id;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer text-left",
                      item.isRead
                        ? "bg-transparent hover:bg-white/[0.03]"
                        : "bg-white/[0.04] hover:bg-white/[0.06]",
                      isItemDeleting && "opacity-40 pointer-events-none"
                    )}
                  >
                    {/* Unread Accent Indicator */}
                    {!item.isRead && (
                      <span className="absolute left-1 top-4 size-1.5 rounded-full bg-primary ring-2 ring-primary/30" />
                    )}

                    {/* Icon based on notification type */}
                    <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={cn(
                            "text-xs truncate",
                            item.isRead
                              ? "text-muted-foreground font-medium"
                              : "text-foreground font-bold"
                          )}
                        >
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                          <Clock className="size-2.5 opacity-60" />
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      {item.data?.actionUrl && (
                        <div className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5">
                          <span>View Details</span>
                          <ExternalLink className="size-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Action buttons (hover or mobile visible) */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleSingleMarkRead(e, item._id)}
                          title="Mark as read"
                          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item._id)}
                        disabled={isItemDeleting}
                        title="Delete notification"
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        {isItemDeleting ? (
                          <Loader2 className="size-3.5 animate-spin text-destructive" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer: View All Notifications Button */}
        <div className="p-3 bg-white/[0.02] border-t border-white/10 flex flex-col gap-2">
          <Link
            href={getNotificationsUrl()}
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm font-heading uppercase tracking-wider"
          >
            <span>View All Notifications</span>
            <ArrowRight className="size-3.5" />
          </Link>
          {isFetchingList && (
            <span className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin text-primary" /> Syncing...
            </span>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBellDropdown;

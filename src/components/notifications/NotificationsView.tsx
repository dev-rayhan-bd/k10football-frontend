"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Calendar,
  CreditCard,
  FileCheck,
  ClipboardCheck,
  Newspaper,
  ShieldCheck,
  Loader2,
  Check,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import { INotificationItem } from "@/types/notification.type";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "unread" | "read";

const formatFullDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
      return <CreditCard className="size-5 text-emerald-400" />;
    case "CV_VALIDATION_REQUEST":
      return <FileCheck className="size-5 text-sky-400" />;
    case "NEW_EVALUATION_REQUEST":
      return <ClipboardCheck className="size-5 text-amber-400" />;
    case "ACADEMY_NEWS":
      return <Newspaper className="size-5 text-purple-400" />;
    case "ACADEMY_AFFILIATION_APPROVED":
      return <ShieldCheck className="size-5 text-emerald-400" />;
    default:
      return <Bell className="size-5 text-primary" />;
  }
};

const getNotificationBadgeClass = (type: string) => {
  switch (type) {
    case "SUBSCRIPTION":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "CV_VALIDATION_REQUEST":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "NEW_EVALUATION_REQUEST":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "ACADEMY_NEWS":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "ACADEMY_AFFILIATION_APPROVED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-primary/10 text-primary border-primary/20";
  }
};

export const NotificationsView = () => {
  const router = useRouter();
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notifications API queries
  const {
    data: notificationsResponse,
    isLoading: isNotificationsLoading,
    isFetching: isFetchingNotifications,
  } = useGetNotificationsQuery();

  const { data: unreadCountResponse } = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsResponse?.data || [];
  const meta = notificationsResponse?.meta;
  const unreadCount =
    unreadCountResponse?.data?.unreadCount ??
    meta?.unreadCount ??
    notifications.filter((n) => !n.isRead).length;

  const totalCount = meta?.total ?? notifications.length;
  const readCount = Math.max(0, totalCount - unreadCount);

  // Filter items
  const filteredNotifications = useMemo(() => {
    if (filterTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (filterTab === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch {
      // Handled
    }
  };

  const handleItemClick = async (item: INotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item._id).unwrap();
      } catch {
        // Handled
      }
    }

    const actionUrl = item.data?.actionUrl;
    if (actionUrl) {
      if (actionUrl.startsWith("/coach/")) {
        router.push(`/dashboard${actionUrl}`);
      } else if (actionUrl.startsWith("/player/")) {
        router.push(`/dashboard${actionUrl}`);
      } else {
        router.push(actionUrl.startsWith("/") ? actionUrl : `/${actionUrl}`);
      }
    }
  };

  const handleSingleRead = async (e: React.MouseEvent, id: string) => {
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

  return (
    <div className="flex flex-col gap-8 pb-16 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-foreground uppercase tracking-tighter font-heading">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-md shadow-red-600/40 font-orbitron">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base font-light tracking-tight">
            All alerts, requests, affiliation updates, and announcements for your account
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              variant="outline"
              size="sm"
              className="cursor-pointer border-white/10 hover:bg-white/10"
            >
              {isMarkingAll ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <CheckCheck className="size-4 mr-2 text-primary" />
              )}
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Total Notifications
            </span>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
              <Inbox className="size-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-foreground font-orbitron">
            {totalCount}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-red-400 font-bold uppercase tracking-wider">
              Unread Alerts
            </span>
            <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <Sparkles className="size-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-red-400 font-orbitron">
            {unreadCount}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Read Alerts
            </span>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
              <Check className="size-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-foreground font-orbitron">
            {readCount}
          </span>
        </div>

        <div className="p-4 sm:p-6 rounded-2xl border border-white/5 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider">
              Current Page
            </span>
            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
              <Calendar className="size-4" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-foreground font-orbitron">
            {notifications.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Content Section */}
      <div className="p-4 sm:p-8 rounded-3xl border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl flex flex-col gap-6">
        {/* Filter Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Filter:
            </span>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "all"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                All ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("unread")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                  filterTab === "unread"
                    ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                <span>Unread</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-black">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("read")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  filterTab === "read"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-muted-foreground hover:text-white"
                )}
              >
                Read ({readCount})
              </button>
            </div>
          </div>

          {isFetchingNotifications && (
            <span className="text-xs text-primary flex items-center gap-1.5">
              <Loader2 className="size-3.5 animate-spin" /> Syncing...
            </span>
          )}
        </div>

        {/* Notifications List */}
        {isNotificationsLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Loading all notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3 text-muted-foreground">
            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center">
              <Bell className="size-8 opacity-40" />
            </div>
            <h4 className="text-lg font-bold text-foreground">
              {filterTab === "unread"
                ? "No unread notifications"
                : "No notifications found"}
            </h4>
            <p className="text-sm max-w-sm text-muted-foreground">
              {filterTab === "unread"
                ? "You are all caught up! There are no unread notifications right now."
                : "When events, validations, requests, or subscriptions occur, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((item) => {
              const isDeletingThis = deletingId === item._id;

              return (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "group relative flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/50 gap-4 cursor-pointer",
                    item.isRead
                      ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/15"
                      : "bg-white/[0.05] border-white/15 hover:bg-white/[0.08] hover:border-primary/40",
                    isDeletingThis && "opacity-40 pointer-events-none"
                  )}
                >
                  {/* Unread dot */}
                  {!item.isRead && (
                    <span className="absolute top-4 left-3 size-2 rounded-full bg-primary ring-4 ring-primary/20" />
                  )}

                  <div className="relative z-10 flex items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-0 md:pr-4">
                    <div className="size-12 sm:size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={cn(
                            "text-base sm:text-lg tracking-tight truncate",
                            item.isRead
                              ? "font-medium text-foreground/80"
                              : "font-bold text-foreground"
                          )}
                        >
                          {item.title}
                        </h4>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            getNotificationBadgeClass(item.type)
                          )}
                        >
                          {item.type.replace(/_/g, " ")}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 opacity-60" />
                          {formatFullDate(item.createdAt)}
                        </span>
                        <span className="text-[11px] opacity-60">
                          ({formatRelativeTime(item.createdAt)})
                        </span>
                        {item.data?.actionUrl && (
                          <span className="text-primary flex items-center gap-1 hover:underline font-bold">
                            View details <ExternalLink className="size-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 flex items-center gap-2 self-end md:self-center shrink-0">
                    {!item.isRead && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleSingleRead(e, item._id)}
                        className="text-xs cursor-pointer border-white/10 hover:bg-white/10"
                        title="Mark as read"
                      >
                        <Check className="size-3.5 mr-1 text-primary" /> Mark Read
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, item._id)}
                      disabled={isDeletingThis}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                      title="Delete notification"
                    >
                      {isDeletingThis ? (
                        <Loader2 className="size-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;


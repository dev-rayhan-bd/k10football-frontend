"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  IconBell, 
  IconCalendar, 
  IconMailOpened,
  IconCheck,
  IconChecklist,
  IconTrash,
  IconExternalLink,
  IconLoader2,
  IconSparkles
} from "@tabler/icons-react";
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

const PlayerNotifications = () => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Notifications API queries
  const { data: notificationsResponse, isLoading: isNotificationsLoading } = useGetNotificationsQuery();
  const { data: unreadCountResponse } = useGetUnreadNotificationCountQuery();

  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsResponse?.data || [];
  const meta = notificationsResponse?.meta;
  const unreadCount = unreadCountResponse?.data?.unreadCount ?? meta?.unreadCount ?? 0;
  const totalCount = meta?.total ?? notifications.length;
  const readCount = Math.max(0, totalCount - unreadCount);

  const stats = [
    { label: "Total Alerts", value: String(totalCount), icon: IconBell },
    { label: "Unread", value: String(unreadCount), icon: IconSparkles },
    { label: "Read", value: String(readCount), icon: IconMailOpened },
    { label: "This Page", value: String(notifications.length), icon: IconCalendar },
  ];

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
      if (actionUrl.startsWith("/player/")) {
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
    <div className="flex flex-col gap-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-foreground uppercase tracking-tighter font-heading">
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-light tracking-tight">
            Updates, scout interests, validations, and alerts for your profile
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            disabled={isMarkingAll}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto cursor-pointer"
          >
            {isMarkingAll ? (
              <IconLoader2 className="size-4 animate-spin mr-2" />
            ) : (
              <IconChecklist className="size-4 mr-2 text-primary" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="p-4 sm:p-8 rounded-[30px] sm:rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-8 rounded-[20px] sm:rounded-3xl border border-white/5 bg-[#0A0A0A]/60 group hover:border-white/10 transition-all duration-500"
            >
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-white/10 group-hover:text-foreground transition-all duration-500">
                  <stat.icon size={20} stroke={1.5} />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl sm:text-4xl font-bold text-foreground tracking-tighter font-orbitron">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div className="p-4 sm:p-10 rounded-[40px] border border-white/5 bg-[#0D0D0D]/40 backdrop-blur-xl flex flex-col gap-4">
        {isNotificationsLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <IconLoader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3 text-muted-foreground">
            <div className="size-14 rounded-full bg-white/5 flex items-center justify-center">
              <IconBell className="size-7 opacity-40" />
            </div>
            <h4 className="text-lg font-bold text-foreground">No notifications yet</h4>
            <p className="text-sm max-w-sm">When clubs, scouts, coaches, or events interact with your profile, you will see notifications here.</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isDeletingThis = deletingId === item._id;

            return (
              <div 
                key={item._id}
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md shadow-lg shadow-black/50 gap-4 sm:gap-0 relative overflow-hidden cursor-pointer",
                  item.isRead
                    ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/15"
                    : "bg-white/[0.05] border-white/15 hover:bg-white/[0.08] hover:border-primary/40",
                  isDeletingThis && "opacity-40 pointer-events-none"
                )}
              >
                {!item.isRead && (
                  <span className="absolute top-3 left-3 size-2 rounded-full bg-primary ring-4 ring-primary/20" />
                )}

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-4">
                  <div className="size-12 sm:size-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-white/10 transition-all shrink-0">
                    <IconBell size={24} stroke={1.5} className={cn(!item.isRead && "text-primary")} />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <h4 className={cn("text-base sm:text-lg tracking-tight truncate", item.isRead ? "font-medium text-foreground/80" : "font-bold text-foreground")}>
                      {item.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                      <span className="px-3 py-0.5 rounded-full bg-white/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-white/10">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium tracking-wider">
                        <IconCalendar size={14} />
                        {formatFullDate(item.createdAt)}
                      </span>
                      {item.data?.actionUrl && (
                        <span className="text-xs text-primary flex items-center gap-1 hover:underline">
                          View details <IconExternalLink size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  {!item.isRead && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSingleRead(e, item._id)}
                      className="text-xs"
                      title="Mark as read"
                    >
                      <IconCheck size={14} className="mr-1" /> Read
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(e, item._id)}
                    disabled={isDeletingThis}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Delete notification"
                  >
                    {isDeletingThis ? (
                      <IconLoader2 size={16} className="animate-spin text-destructive" />
                    ) : (
                      <IconTrash size={16} />
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerNotifications;

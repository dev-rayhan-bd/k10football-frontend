"use client";

import React, { useState } from "react";
import {
  Bell,
  SlidersHorizontal,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Sparkles,
  Info,
  RefreshCw,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
} from "@/redux/features/notification/notificationApi";
import {
  ROLE_NOTIFICATION_CONTROLS,
  RoleNotificationControlDef,
} from "@/constants/notificationControls";

interface NotificationSettingsCardProps {
  className?: string;
  showHeader?: boolean;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({
  className,
  showHeader = true,
}) => {
  const { data: response, isLoading, isFetching, refetch } = useGetNotificationSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();
  const [activePendingKey, setActivePendingKey] = useState<string | null>(null);

  const rawRole = response?.data?.role || "PLAYER";
  const normalizedRole = rawRole.toUpperCase().trim();
  const settingsDict = response?.data?.settings || {};
  const apiControls = response?.data?.controls || [];

  // Resolve controls: prioritize backend auto-detected controls, fallback to role definitions
  const resolvedControls: { key: string; title: string; description: string; value: boolean }[] =
    apiControls.length > 0
      ? apiControls.map((c) => ({
          key: c.key,
          title: c.title,
          description: c.description,
          value: settingsDict[c.key] !== undefined ? Boolean(settingsDict[c.key]) : Boolean(c.value),
        }))
      : (ROLE_NOTIFICATION_CONTROLS[normalizedRole] || ROLE_NOTIFICATION_CONTROLS.PLAYER).map(
          (def: RoleNotificationControlDef) => ({
            key: def.key,
            title: def.title,
            description: def.description,
            value:
              settingsDict[def.key] !== undefined
                ? Boolean(settingsDict[def.key])
                : def.defaultValue,
          })
        );

  const handleToggle = async (key: string, currentValue: boolean) => {
    const nextVal = !currentValue;
    try {
      setActivePendingKey(key);
      await updateSettings({ [key]: nextVal }).unwrap();
    } catch {
      // Error handled with toast in RTK Query onQueryStarted
    } finally {
      setActivePendingKey(null);
    }
  };

  const handleEnableAll = async () => {
    const patch: Record<string, boolean> = {};
    resolvedControls.forEach((c) => {
      patch[c.key] = true;
    });
    try {
      await updateSettings(patch).unwrap();
    } catch {
      // Handled
    }
  };

  const handleDisableAll = async () => {
    const patch: Record<string, boolean> = {};
    resolvedControls.forEach((c) => {
      patch[c.key] = false;
    });
    try {
      await updateSettings(patch).unwrap();
    } catch {
      // Handled
    }
  };

  const allEnabled = resolvedControls.length > 0 && resolvedControls.every((c) => c.value);
  const allDisabled = resolvedControls.length > 0 && resolvedControls.every((c) => !c.value);

  if (isLoading) {
    return (
      <div className={cn("p-6 sm:p-8 rounded-3xl border border-white/5 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-6", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-40 rounded bg-white/10 animate-pulse" />
              <div className="h-3 w-64 rounded bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between animate-pulse">
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="h-3 w-48 rounded bg-white/5" />
              </div>
              <div className="w-11 h-6 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#0D0D0D]/80 backdrop-blur-2xl shadow-2xl flex flex-col gap-6 relative overflow-hidden",
        className
      )}
    >
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner shrink-0">
              <SlidersHorizontal className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading uppercase tracking-wide">
                  Notification Controls
                </h3>
                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-primary/30 text-primary bg-primary/5">
                  {normalizedRole} PREFERENCES
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Fine-tune which alerts and emails are delivered to your account
              </p>
            </div>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={isFetching}
              className="text-xs border-white/10 hover:bg-white/5 cursor-pointer text-muted-foreground"
              title="Refresh settings"
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin text-primary")} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={allEnabled ? handleDisableAll : handleEnableAll}
              disabled={isUpdating}
              className="text-xs border-white/10 hover:bg-white/5 cursor-pointer text-muted-foreground hover:text-white"
            >
              {allEnabled ? "Mute All" : "Enable All"}
            </Button>
          </div>
        </div>
      )}

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resolvedControls.map((control) => {
          const isPending = activePendingKey === control.key;

          return (
            <div
              key={control.key}
              className={cn(
                "p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 group",
                control.value
                  ? "bg-white/[0.03] border-white/10 hover:border-primary/40 shadow-sm"
                  : "bg-white/[0.01] border-white/5 opacity-75 hover:opacity-100 hover:border-white/15"
              )}
            >
              <div className="flex flex-col gap-1 pr-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground group-hover:text-white transition-colors truncate">
                    {control.title}
                  </span>
                  {control.value && (
                    <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/80" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {control.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isPending && (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                )}
                <Switch
                  id={`notif-toggle-${control.key}`}
                  checked={control.value}
                  onCheckedChange={() => handleToggle(control.key, control.value)}
                  disabled={isUpdating}
                  aria-label={control.title}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Tip */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Info className="size-3.5 text-primary shrink-0" />
          <span>Updates take effect immediately on your active account session.</span>
        </div>
        <span className="text-[10px] font-mono opacity-60 uppercase">
          {resolvedControls.filter((c) => c.value).length}/{resolvedControls.length} Active
        </span>
      </div>
    </div>
  );
};

export default NotificationSettingsCard;

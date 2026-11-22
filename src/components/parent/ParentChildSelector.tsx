"use client";

import React from "react";
import Image from "next/image";
import {
  IconCheck,
  IconChevronDown,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useOptionalParentDashboard } from "@/providers/ParentDashboardProvider";
import { ILinkedChild } from "@/types/parent.type";
import { cn } from "@/lib/utils";

const resolveSubscriptionBadge = (child: ILinkedChild) => {
  const rawStatus = (child.subscriptionStatus || "").toUpperCase();
  if (child.hasActiveSubscription || rawStatus === "ACTIVE") {
    return {
      label: "ACTIVE",
      variant: "default" as const,
      className: "bg-primary/15 text-primary border-primary/30",
    };
  }
  if (rawStatus === "EXPIRED") {
    return {
      label: "EXPIRED",
      variant: "destructive" as const,
      className: "bg-destructive/15 text-destructive border-destructive/30",
    };
  }
  return {
    label: "FREE",
    variant: "secondary" as const,
    className: "bg-white/10 text-muted-foreground border-white/10",
  };
};

export const ParentChildSelector = () => {
  const parentDashboard = useOptionalParentDashboard();

  if (!parentDashboard) return null;

  const {
    children: linkedChildren,
    isChildrenLoading,
    selectedChild,
    selectedChildPlayerId,
    setSelectedChildPlayerId,
  } = parentDashboard;

  if (isChildrenLoading) {
    return (
      <div className="h-10 w-44 sm:w-56 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  if (linkedChildren.length === 0 || !selectedChild) {
    return null;
  }

  const activeBadge = resolveSubscriptionBadge(selectedChild);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl px-2.5 py-1.5 transition-all cursor-pointer max-w-[230px] sm:max-w-[280px] text-left focus:outline-none focus:ring-1 focus:ring-primary/50"
          aria-label="Select linked child athlete"
        >
          <div className="relative size-7 rounded-full overflow-hidden border border-white/15 bg-black/60 shrink-0 flex items-center justify-center">
            {selectedChild.profileImage ? (
              <Image
                src={selectedChild.profileImage}
                alt={selectedChild.fullName}
                fill
                sizes="28px"
                unoptimized
                className="object-contain p-0.5"
              />
            ) : (
              <IconUser className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-white truncate leading-tight">
                {selectedChild.fullName}
              </span>
              <Badge
                variant={activeBadge.variant}
                className={cn(
                  "text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider border shrink-0",
                  activeBadge.className
                )}
              >
                {activeBadge.label}
              </Badge>
            </div>
            <span className="text-[10px] text-muted-foreground truncate leading-tight">
              {selectedChild.position || "Athlete"}
            </span>
          </div>

          <IconChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-72 bg-[#111111] border border-white/15 text-white rounded-2xl p-1.5 shadow-2xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-orbitron">
          <span className="flex items-center gap-1.5">
            <IconUsers className="size-3.5 text-primary" />
            Linked Athletes
          </span>
          <span>{linkedChildren.length}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />

        <div className="flex flex-col gap-1 py-1">
          {linkedChildren.map((child) => {
            const isSelected = child.childPlayerId === selectedChildPlayerId;
            const statusBadge = resolveSubscriptionBadge(child);

            return (
              <DropdownMenuItem
                key={child.childPlayerId}
                onSelect={() => setSelectedChildPlayerId(child.childPlayerId)}
                className={cn(
                  "flex items-center gap-3 px-2.5 py-2.5 rounded-xl cursor-pointer transition-colors focus:bg-white/10 focus:text-white",
                  isSelected ? "bg-white/10 border border-primary/30" : "border border-transparent"
                )}
              >
                <div className="relative size-8 rounded-full overflow-hidden border border-white/15 bg-black/60 shrink-0 flex items-center justify-center">
                  {child.profileImage ? (
                    <Image
                      src={child.profileImage}
                      alt={child.fullName}
                      fill
                      sizes="32px"
                      unoptimized
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <IconUser className="size-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {child.fullName}
                    </span>
                    <Badge
                      variant={statusBadge.variant}
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4 font-bold uppercase tracking-wider border shrink-0",
                        statusBadge.className
                      )}
                    >
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {child.position || "Athlete"}
                    {child.currentSubscription?.planTitle
                      ? ` • ${child.currentSubscription.planTitle}`
                      : ""}
                  </span>
                </div>

                {isSelected && (
                  <IconCheck className="size-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ParentChildSelector;

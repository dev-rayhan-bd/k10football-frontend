/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  IconCheck,
  IconClock,
  IconCalendar,
  IconAlertCircle,
  IconReceipt,
  IconAward,
  IconShieldCheck,
  IconUsers,
  IconLock,
  IconArrowRight,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";
import { useParentDashboard } from "@/providers/ParentDashboardProvider";
import { formatDate, cn } from "@/lib/utils";

const PER_CHILD_UNLOCKED_FEATURES = [
  "Paid Scouting Match Reports with Interactive Pitch Event Tracking",
  "Professional Coach Evaluations & Verified 10-Scale Match Ratings",
  "Advanced Player Performance & Growth Analytics",
  "Verified Scout & Agent Radar Exposure for the Subscribed Child",
  "Academy Training Schedule & RSVP Confirmation (Always Free)",
  "Academy Fee & Invoice Direct Payment (Always Free)",
];

const getChildStatusBadge = (status?: string, isActive?: boolean) => {
  const normalized = String(status || "").toUpperCase();
  if (isActive || normalized === "ACTIVE") {
    return <Badge variant="default">ACTIVE</Badge>;
  }
  if (normalized === "EXPIRED") {
    return <Badge variant="destructive">EXPIRED</Badge>;
  }
  return <Badge variant="secondary">FREE</Badge>;
};

const ParentSubscriptionSkeleton = () => (
  <div className="flex flex-col gap-8 pb-16">
    <div className="flex flex-col gap-2">
      <div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse" />
      <div className="h-5 w-96 bg-white/5 rounded-md animate-pulse" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card
          key={i}
          className="bg-cardBg border border-border p-6 flex flex-col gap-4 rounded-2xl animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/10" />
            <div className="h-5 w-16 bg-white/10 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-7 w-28 bg-white/10 rounded-md" />
            <div className="h-4 w-36 bg-white/5 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ParentSubscription = () => {
  const {
    selectedChild,
    selectedChildPlayerId,
    setSelectedChildPlayerId,
    switchToChildAccount,
    isSwitchingProfile,
  } = useParentDashboard();

  const {
    isSelectedChildUnlocked,
    selectedChildSubscriptionStatus,
    selectedChildCurrentSubscription,
    subscribedChildrenCount,
    totalChildrenCount,
    isLoading,
    children,
    childSubscriptions,
  } = useParentSubscriptionAccess(selectedChildPlayerId);

  const [switchingChildUserId, setSwitchingChildUserId] = useState<
    string | null
  >(null);

  if (isLoading) {
    return <ParentSubscriptionSkeleton />;
  }

  const activeChildName = selectedChild?.fullName || "Selected Athlete";
  const isExpired = selectedChildSubscriptionStatus === "EXPIRED";
  const daysRemaining = selectedChildCurrentSubscription?.daysRemaining ?? 0;

  const handleSwitchChildToSubscribe = async (childUserId?: string) => {
    if (!childUserId) return;
    setSwitchingChildUserId(childUserId);
    try {
      await switchToChildAccount(
        childUserId,
        "/dashboard/player/my-subscription"
      );
    } finally {
      setSwitchingChildUserId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Athlete <span className="text-primary">Subscriptions</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Subscriptions are purchased per child on each child&apos;s Athlete account. Viewing status for{" "}
            <strong className="text-white">{activeChildName}</strong>.
          </p>
        </div>

        {!isSelectedChildUnlocked && selectedChild?.childUserId && (
          <Button
            type="button"
            disabled={isSwitchingProfile}
            onClick={() =>
              handleSwitchChildToSubscribe(selectedChild.childUserId)
            }
            className="bg-primary text-black hover:bg-[#00dd00] font-bold flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {isSwitchingProfile &&
            switchingChildUserId === selectedChild.childUserId ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconArrowRight className="size-4" />
            )}
            <span>Switch &amp; Subscribe ({activeChildName})</span>
          </Button>
        )}
      </div>

      {/* Selected Child Access Summary Card */}
      <Card className="p-6 rounded-2xl border border-white/10 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                isSelectedChildUnlocked
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {isSelectedChildUnlocked ? (
                <IconShieldCheck className="size-6" />
              ) : (
                <IconLock className="size-6" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-orbitron uppercase">
                {activeChildName}:{" "}
                <span
                  className={
                    isSelectedChildUnlocked ? "text-primary" : "text-destructive"
                  }
                >
                  {isSelectedChildUnlocked
                    ? "UNLOCKED"
                    : isExpired
                      ? "EXPIRED"
                      : "LOCKED (FREE)"}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSelectedChildUnlocked
                  ? `Active Athlete subscription (${selectedChildCurrentSubscription?.planTitle || "Active Plan"}) — Match Reports & Analytics unlocked for ${activeChildName}.`
                  : `No active Athlete subscription on ${activeChildName}'s account. Only training attendance and academy fee payments are available until subscribed.`}
              </p>
            </div>
          </div>
          {getChildStatusBadge(
            selectedChildSubscriptionStatus,
            isSelectedChildUnlocked
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
              <IconCheck className="size-4 text-primary" />
              <span>Always Free for Every Child</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Viewing training schedules, submitting RSVP confirmations, and paying academy event fees are always accessible for all linked children.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
              <IconLock className="size-4 text-destructive" />
              <span>Per-Child Subscription Rule</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Each child requires their own active Athlete subscription to unlock Match Reports, pitch stat submissions, and coach reviews. One child&apos;s plan never unlocks another child.
            </p>
          </div>
        </div>
      </Card>

      {/* Expired Alert */}
      {isExpired && selectedChild?.childUserId && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">
                {activeChildName}&apos;s Subscription Expired
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Switch to {activeChildName}&apos;s Athlete account to renew and restore Match Reports and analytics.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            disabled={isSwitchingProfile}
            onClick={() =>
              handleSwitchChildToSubscribe(selectedChild.childUserId)
            }
            className="shrink-0 font-semibold cursor-pointer"
          >
            Renew on Athlete Account
          </Button>
        </Card>
      )}

      {/* Key Metrics Grid for Selected Child */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Child Plan */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconAward className="size-5 text-primary" />
            </div>
            {getChildStatusBadge(
              selectedChildSubscriptionStatus,
              isSelectedChildUnlocked
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {activeChildName} Plan
            </span>
            <h3 className="text-2xl font-bold text-white truncate">
              {selectedChildCurrentSubscription?.planTitle ||
                (isSelectedChildUnlocked ? "Active Athlete" : "Free Athlete")}
            </h3>
            <span className="text-xs text-muted-foreground">
              {isSelectedChildUnlocked
                ? "Purchased on child Athlete account"
                : "Not subscribed yet"}
            </span>
          </div>
        </Card>

        {/* Subscribed Children Summary */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconUsers className="size-5 text-primary" />
            </div>
            <Badge
              variant={subscribedChildrenCount > 0 ? "default" : "secondary"}
            >
              {subscribedChildrenCount}/{totalChildrenCount} Active
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Family Coverage
            </span>
            <h3 className="text-2xl font-bold text-white">
              {subscribedChildrenCount} of {totalChildrenCount} Subscribed
            </h3>
            <span className="text-xs text-muted-foreground">
              Per-child Athlete subscriptions
            </span>
          </div>
        </Card>

        {/* Days Remaining */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconClock className="size-5 text-primary" />
            </div>
            <Badge variant={isSelectedChildUnlocked ? "default" : "secondary"}>
              {isSelectedChildUnlocked ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Days Remaining
            </span>
            <h3 className="text-2xl font-bold text-white">
              {isSelectedChildUnlocked ? `${daysRemaining} Days` : "0 Days"}
            </h3>
            <span className="text-xs text-muted-foreground">
              For {activeChildName}
            </span>
          </div>
        </Card>

        {/* End Date */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconCalendar className="size-5 text-primary" />
            </div>
            <Badge variant="outline">Renewal</Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Plan End Date
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">
              {selectedChildCurrentSubscription?.endDate
                ? formatDate(selectedChildCurrentSubscription.endDate)
                : isSelectedChildUnlocked
                  ? "Active Coverage"
                  : "N/A"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {isSelectedChildUnlocked
                ? "Managed on Athlete account"
                : "No active billing cycle"}
            </span>
          </div>
        </Card>
      </div>

      {/* Linked Children Per-Child Subscription Breakdown */}
      <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconUsers className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Linked Children &amp; Per-Child Subscriptions
              </h3>
              <p className="text-xs text-muted-foreground">
                Select any child to inspect status, or switch directly to an unsubscribed child&apos;s Athlete account to subscribe
              </p>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-black"
          >
            <Link href="/dashboard/parent/profiles">Manage Child Profiles</Link>
          </Button>
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child: any, idx: number) => {
              const breakdownMatch = childSubscriptions.find(
                (item) => item.childPlayerId === child.childPlayerId
              );
              const childSubActive = Boolean(
                breakdownMatch?.hasActiveSubscription ??
                  child.hasActiveSubscription
              );
              const childSubStatus =
                breakdownMatch?.subscriptionStatus ||
                child.subscriptionStatus ||
                (childSubActive ? "ACTIVE" : "FREE");
              const childPlanTitle =
                breakdownMatch?.currentSubscription?.planTitle ||
                child.currentSubscription?.planTitle;
              const isSelected = child.childPlayerId === selectedChildPlayerId;
              const isRowSwitching =
                isSwitchingProfile &&
                switchingChildUserId === child.childUserId;

              return (
                <div
                  key={child.childPlayerId || child.linkId || idx}
                  onClick={() =>
                    child.childPlayerId &&
                    setSelectedChildPlayerId(child.childPlayerId)
                  }
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                    isSelected
                      ? "bg-white/[0.05] border-primary/40"
                      : "bg-white/[0.02] border-border/60 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative size-11 rounded-full overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                      {child.profileImage ? (
                        <Image
                          src={child.profileImage}
                          alt={child.fullName}
                          fill
                          sizes="44px"
                          unoptimized
                          className="object-contain p-1"
                        />
                      ) : (
                        <IconUser className="size-5 text-primary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {child.fullName}
                        </h4>
                        {isSelected && (
                          <span className="text-[9px] font-bold uppercase text-primary font-orbitron">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {child.position || "Athlete"}
                        {childPlanTitle ? ` • ${childPlanTitle}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getChildStatusBadge(childSubStatus, childSubActive)}
                    {!childSubActive && child.childUserId && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isSwitchingProfile}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSwitchChildToSubscribe(child.childUserId);
                        }}
                        className="bg-primary hover:bg-[#00dd00] text-black font-bold text-[10px] uppercase tracking-wider h-8 cursor-pointer"
                      >
                        {isRowSwitching ? (
                          <IconLoader2 className="size-3.5 animate-spin" />
                        ) : (
                          "Switch & Subscribe"
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No linked children registered yet.
          </p>
        )}
      </Card>

      {/* Included Platform Benefits */}
      <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <IconReceipt className="size-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white">
              Features for {activeChildName}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Unlocked per child when that child&apos;s Athlete account has an active subscription
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PER_CHILD_UNLOCKED_FEATURES.map((feature, idx) => {
            const isAlwaysFree = idx >= 4;
            const featureUnlocked = isSelectedChildUnlocked || isAlwaysFree;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-border/60"
              >
                <div
                  className={cn(
                    "size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    featureUnlocked
                      ? "bg-primary/20 text-primary"
                      : "bg-white/10 text-muted-foreground"
                  )}
                >
                  {featureUnlocked ? (
                    <IconCheck className="size-3.5" />
                  ) : (
                    <IconLock className="size-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    featureUnlocked ? "text-gray-300" : "text-gray-500"
                  )}
                >
                  {feature}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default ParentSubscription;

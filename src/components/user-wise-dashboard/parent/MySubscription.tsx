/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import {
  IconCreditCard,
  IconCheck,
  IconClock,
  IconCalendar,
  IconRefresh,
  IconAlertCircle,
  IconArrowUpRight,
  IconReceipt,
  IconAward,
  IconShieldCheck,
  IconUsers,
  IconLock,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParentSubscriptionAccess } from "@/hooks/useParentSubscriptionAccess";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PARENT_UNLOCKED_FEATURES = [
  "Paid Scouting Match Reports with Pitch Event Tracking",
  "Professional Coach Evaluations and Ratings",
  "Advanced Player Performance & Growth Analytics",
  "Verified Scout & Agent Radar Exposure for Child",
  "Academy Training Schedule & RSVP Confirmation (Always Available)",
  "Academy Fee & Invoice Direct Payment (Always Available)",
];

const formatBillingCycle = (cycle?: string) => {
  if (!cycle) return "Monthly";
  const lower = cycle.toLowerCase();
  if (lower.includes("month")) return "Monthly";
  if (lower.includes("year")) return "Yearly";
  return cycle;
};

const getStatusBadge = (status?: string, isActive?: boolean, isExpired?: boolean) => {
  if (isExpired || status === "EXPIRED") {
    return <Badge variant="destructive">Expired</Badge>;
  }
  if (status === "PENDING_PAYMENT") {
    return <Badge variant="secondary">Pending Payment</Badge>;
  }
  if (isActive || status === "ACTIVE") {
    return <Badge variant="default">Active</Badge>;
  }
  if (status === "CANCELLED") {
    return <Badge variant="outline">Cancelled</Badge>;
  }
  return <Badge variant="secondary">{status || "Inactive"}</Badge>;
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
    isUnlocked,
    hasParentActiveSub,
    hasChildActiveSub,
    isLoading,
    parentSubscription,
    children,
  } = useParentSubscriptionAccess();

  const currentSub = parentSubscription?.currentSubscription;

  if (isLoading) {
    return <ParentSubscriptionSkeleton />;
  }

  const isPendingPayment = currentSub?.status === "PENDING_PAYMENT";
  const isExpired = Boolean(currentSub?.isExpired || currentSub?.status === "EXPIRED");
  const isExpiringSoon = Boolean(currentSub?.isExpiringSoon && !isExpired);

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Parent <span className="text-primary">Subscription</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Manage your Guardian membership plan, child access status, and platform benefits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="bg-primary text-black hover:bg-[#00dd00] font-bold border-0">
            <Link href="/k10plans" className="flex items-center gap-1.5">
              <span>View Membership Plans</span>
              <IconArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Access Rule Summary Card */}
      <Card className="p-6 rounded-2xl border border-white/10 bg-[#0D0D0D]/60 backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                isUnlocked ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}
            >
              {isUnlocked ? <IconShieldCheck className="size-6" /> : <IconLock className="size-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-orbitron uppercase">
                Platform Access Status:{" "}
                <span className={isUnlocked ? "text-primary" : "text-destructive"}>
                  {isUnlocked ? "UNLOCKED" : "LIMITED (FREE)"}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isUnlocked
                  ? hasParentActiveSub
                    ? "Active via Guardian Membership Plan"
                    : "Active via Linked Child's Athlete Plan"
                  : "Free Account — Only Training Schedule & Fee Payments allowed"}
              </p>
            </div>
          </div>
          <Badge variant={isUnlocked ? "default" : "secondary"} className="self-start sm:self-auto text-xs font-bold uppercase">
            {isUnlocked ? "Full Access Active" : "Subscription Required"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
              <IconCheck className="size-4 text-primary" />
              <span>Free Plan Access (Always Available)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Viewing child&apos;s training schedules, submitting RSVP confirmations, and paying academy fee invoices (<code className="text-white">/parents/fees</code>) are always accessible.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
              <IconLock className="size-4 text-destructive" />
              <span>Subscription Gated Features</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Paid scouting reports, coach evaluation requests, interactive pitch event tracking, and advanced match analytics require either a Parent subscription or a linked child subscription.
            </p>
          </div>
        </div>
      </Card>

      {/* Alert Notices */}
      {isPendingPayment && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-secondary/40 bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconClock className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">Payment Pending Confirmation</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your checkout for the plan is being processed. It may take a few moments to activate.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/k10plans">Review Plans</Link>
          </Button>
        </Card>
      )}

      {isExpiringSoon && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-secondary/40 bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">Subscription Expiring Soon</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You have {currentSub?.daysRemaining ?? 0} days remaining on your active subscription.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="shrink-0 bg-primary text-black font-semibold">
            <Link href="/k10plans">Renew Now</Link>
          </Button>
        </Card>
      )}

      {isExpired && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-destructive/30 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">Subscription Expired</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your membership subscription has expired. Subscribe to restore full scouting reports and player analytics.
              </p>
            </div>
          </div>
          <Button asChild variant="destructive" className="shrink-0 font-semibold">
            <Link href="/k10plans">Subscribe Now</Link>
          </Button>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Parent Tier */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconAward className="size-5 text-primary" />
            </div>
            {getStatusBadge(currentSub?.status, hasParentActiveSub, isExpired)}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Guardian Tier</span>
            <h3 className="text-2xl font-bold text-white truncate">
              {currentSub?.planTitle || (hasParentActiveSub ? "Parent Pro" : "Free Guardian")}
            </h3>
            <span className="text-xs text-muted-foreground">
              {hasParentActiveSub ? "Active Parent Plan" : "No active parent plan"}
            </span>
          </div>
        </Card>

        {/* Linked Child Status */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconUsers className="size-5 text-primary" />
            </div>
            <Badge variant={hasChildActiveSub ? "default" : "secondary"}>
              {hasChildActiveSub ? "Child Subscribed" : "Child Free"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Child Subscription</span>
            <h3 className="text-2xl font-bold text-white">
              {hasChildActiveSub ? "Active Child Plan" : "No Active Child Plan"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {children.length} Linked {children.length === 1 ? "Athlete" : "Athletes"}
            </span>
          </div>
        </Card>

        {/* Days Remaining */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconClock className="size-5 text-primary" />
            </div>
            <Badge variant={isUnlocked ? "default" : "secondary"}>
              {isUnlocked ? "Access Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Days Remaining</span>
            <h3 className="text-2xl font-bold text-white">
              {hasParentActiveSub ? `${currentSub?.daysRemaining ?? 0} Days` : isUnlocked ? "Child Active" : "0 Days"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {hasParentActiveSub ? "On current parent billing cycle" : isUnlocked ? "Covered by linked athlete" : "No active subscription"}
            </span>
          </div>
        </Card>

        {/* Next Billing / Plan Amount */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconCalendar className="size-5 text-primary" />
            </div>
            <Badge variant="outline">
              {currentSub?.nextBillingDate ? "Next Bill" : "Status"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Renewal / End Date</span>
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">
              {currentSub?.nextBillingDate
                ? formatDate(currentSub.nextBillingDate)
                : currentSub?.endDate
                ? formatDate(currentSub.endDate)
                : isUnlocked
                ? "Active Coverage"
                : "N/A"}
            </h3>
            <span className="text-xs text-muted-foreground">
              {currentSub?.billingCycle ? `Billed ${formatBillingCycle(currentSub.billingCycle)}` : "Free Plan"}
            </span>
          </div>
        </Card>
      </div>

      {/* Linked Children Overview */}
      <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
              <IconUsers className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Linked Children & Athletes</h3>
              <p className="text-xs text-muted-foreground">
                Active child athlete memberships unlock full player features for the guardian
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black">
            <Link href="/dashboard/parent/profiles">Manage Child Profiles</Link>
          </Button>
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children.map((child: any, idx: number) => {
              const childSubActive = Boolean(
                child.hasActiveSubscription ||
                child.isSubscribed ||
                child.subscription?.hasActiveSubscription ||
                child.subscription?.status === "ACTIVE"
              );
              return (
                <div
                  key={child.childPlayerId || child.linkId || idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-border/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {child.fullName?.[0] || "C"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{child.fullName}</h4>
                      <p className="text-xs text-muted-foreground truncate">{child.position || "Athlete"}</p>
                    </div>
                  </div>
                  <Badge variant={childSubActive ? "default" : "secondary"}>
                    {childSubActive ? "Subscribed" : "Free Athlete"}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No linked children registered yet.</p>
        )}
      </Card>

      {/* Included Platform Benefits */}
      <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <IconReceipt className="size-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white">Platform Features & Platform Access</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Features unlocked with active Guardian or Child Athlete Subscription
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PARENT_UNLOCKED_FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-border/60"
            >
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  isUnlocked ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                )}
              >
                {isUnlocked ? <IconCheck className="size-3.5" /> : <IconLock className="size-3.5" />}
              </div>
              <span className={cn("text-sm", isUnlocked ? "text-gray-300" : "text-gray-500")}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ParentSubscription;


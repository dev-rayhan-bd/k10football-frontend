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
  IconBuildingCommunity,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const DEFAULT_CLUB_FEATURES = [
  "Professional Scouting Engine (International Talent Search)",
  "Full Match Reports & 36 Verified Performance Indicators",
  "Official Player Transfer Requests to Academies",
  "Direct Trial & Signing Invitations to Athletes",
  "Full access to CVs Library and Advanced Analytics",
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

const ClubSubscriptionSkeleton = () => (
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

    <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl" />
        ))}
      </div>
    </Card>
  </div>
);

const ClubSubscription = () => {
  const { data: response, isLoading, isFetching, isError, refetch } =
    useGetMySubscriptionQuery();

  const subData = response?.data;
  const currentSub = subData?.currentSubscription;
  const hasActive = Boolean(subData?.hasActiveSubscription);

  if (isLoading) {
    return <ClubSubscriptionSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-8 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            Club <span className="text-primary">Subscription</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Manage your professional club subscription plan, billing details, and scouting privileges
          </p>
        </div>

        <Card className="p-8 sm:p-12 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center gap-4">
          <IconAlertCircle className="size-12 text-destructive" stroke={1.5} />
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-bold text-white">
              Failed to load subscription details
            </h3>
            <p className="text-sm text-muted-foreground">
              We encountered an issue fetching your club subscription information.
              Please try again.
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <IconRefresh className="size-4" />
            <span>Try Again</span>
          </Button>
        </Card>
      </div>
    );
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
            Club <span className="text-primary">Subscription</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Manage your professional club tier, scouting quota, and official invitation privileges
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 border-border hover:border-primary transition"
          >
            <IconRefresh
              className={cn("size-4", isFetching && "animate-spin text-primary")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button asChild variant="outline" className="bg-primary text-black hover:bg-[#00dd00] font-bold border-0">
            <Link href="/k10plans" className="flex items-center gap-1.5">
              <span>View Plans</span>
              <IconArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Alert Notices */}
      {isPendingPayment && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-secondary/40 bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconClock className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">
                Payment Pending Confirmation
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your payment is currently being processed. Once verified, your club scouting features will unlock automatically.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary text-black hover:bg-[#00dd00] font-bold self-start sm:self-auto shrink-0">
            <Link href="/k10plans">Complete Payment</Link>
          </Button>
        </Card>
      )}

      {isExpired && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-destructive/40 bg-destructive/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconAlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">
                Club Subscription Expired
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your club subscription has expired. Scouting Board, Match Reports, Transfer Requests, and Trial Invitations are currently locked.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="destructive" className="self-start sm:self-auto shrink-0 font-bold">
            <Link href="/k10plans">Renew Subscription</Link>
          </Button>
        </Card>
      )}

      {!hasActive && !isPendingPayment && !isExpired && (
        <Card className="p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <IconShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-semibold text-white">
                Active Club Plan Required
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You do not currently have an active club subscription. Subscribe to unlock the Scouting Portal, Full Match Reports, Player Transfer Requests, and Trial Invitations.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-primary text-black hover:bg-[#00dd00] font-bold self-start sm:self-auto shrink-0">
            <Link href="/k10plans">Subscribe Now</Link>
          </Button>
        </Card>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconAward className="size-6" />
            </div>
            {getStatusBadge(currentSub?.status, hasActive, isExpired)}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              {currentSub?.planTitle || (hasActive ? "Active Club" : "No Plan")}
            </span>
            <p className="text-xs text-muted-foreground">Current Membership Tier</p>
          </div>
        </Card>

        {/* Billing Cycle */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconCalendar className="size-6" />
            </div>
            <Badge variant="outline" className="border-border text-white">
              {formatBillingCycle(currentSub?.billingCycle)}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              {currentSub?.formattedAmount ||
                (currentSub?.amountPaid !== undefined
                  ? `${currentSub?.currency || "$"}${currentSub.amountPaid}`
                  : "$0")}
            </span>
            <p className="text-xs text-muted-foreground">
              {currentSub?.nextBillingDate
                ? `Renews on ${formatDate(currentSub.nextBillingDate)}`
                : "Billing Cycle Rate"}
            </p>
          </div>
        </Card>

        {/* Days Remaining */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconClock className="size-6" />
            </div>
            {isExpiringSoon && (
              <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/30">
                Expiring Soon
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold font-heading uppercase tracking-wide text-white">
              {currentSub?.daysRemaining !== undefined
                ? `${currentSub.daysRemaining} Days`
                : hasActive
                ? "Active"
                : "0 Days"}
            </span>
            <p className="text-xs text-muted-foreground">
              {currentSub?.endDate
                ? `Expires on ${formatDate(currentSub.endDate)}`
                : "Subscription Validity"}
            </p>
          </div>
        </Card>

        {/* Payment Details */}
        <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl hover:border-primary/40 transition">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <IconCreditCard className="size-6" />
            </div>
            <Badge variant="outline" className="border-border text-white">
              {currentSub?.isAdminGrant ? "Admin Grant" : "Stripe"}
            </Badge>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold font-heading tracking-wide text-white truncate">
              {currentSub?.paymentReference
                ? `Ref: ...${currentSub.paymentReference.slice(-8)}`
                : "Standard Access"}
            </span>
            <p className="text-xs text-muted-foreground">Payment Record</p>
          </div>
        </Card>
      </div>

      {/* Plan Features */}
      <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <IconBuildingCommunity className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading uppercase tracking-wide text-white">
                Club Scouting Privileges & Included Features
              </h2>
              <p className="text-xs text-muted-foreground">
                Features available with your current club subscription plan
              </p>
            </div>
          </div>
          {hasActive ? (
            <Badge variant="default" className="w-fit">
              All Privileges Unlocked
            </Badge>
          ) : (
            <Badge variant="outline" className="w-fit text-muted-foreground border-border">
              Subscription Required to Unlock
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(currentSub?.features && currentSub.features.length > 0
            ? currentSub.features
            : DEFAULT_CLUB_FEATURES
          ).map((feature: string, idx: number) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border transition",
                hasActive
                  ? "bg-white/2 border-white/5 hover:border-primary/30"
                  : "bg-white/[0.01] border-white/5 opacity-60"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-full shrink-0 mt-0.5",
                  hasActive
                    ? "bg-primary/10 text-primary"
                    : "bg-white/5 text-muted-foreground"
                )}
              >
                <IconCheck className="size-3.5" />
              </div>
              <p className="text-sm text-foreground/90 leading-snug">{feature}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Plan Details Card */}
      {currentSub && (
        <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <IconReceipt className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading uppercase tracking-wide text-white">
                Club Membership Details
              </h2>
              <p className="text-xs text-muted-foreground">
                Detailed record of your active or recent club subscription agreement
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Plan Name
              </span>
              <span className="text-sm font-semibold text-white">
                {currentSub.planTitle || "Professional Club Plan"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Category
              </span>
              <span className="text-sm font-semibold text-white">
                {currentSub.planCategory || "CLUB"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                Start Date
              </span>
              <span className="text-sm font-semibold text-white">
                {currentSub.startDate ? formatDate(currentSub.startDate) : "—"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                End / Expiry Date
              </span>
              <span className="text-sm font-semibold text-white">
                {currentSub.endDate ? formatDate(currentSub.endDate) : "Continuous"}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClubSubscription;


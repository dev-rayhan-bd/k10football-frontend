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
  IconFileText,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

const AgentSubscriptionSkeleton = () => (
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

const AgentSubscription = () => {
  const { data: response, isLoading, isFetching, isError, refetch } =
    useGetMySubscriptionQuery();

  const subData = response?.data;
  const currentSub = subData?.currentSubscription;
  const hasActive = Boolean(subData?.hasActiveSubscription);

  if (isLoading) {
    return <AgentSubscriptionSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-8 pb-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal text-white uppercase tracking-tighter font-heading">
            My <span className="text-primary">Subscription</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Manage your football agent membership plan and subscription details
          </p>
        </div>

        <Card className="p-8 sm:p-12 rounded-2xl border border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center text-center gap-4">
          <IconAlertCircle className="size-12 text-destructive" stroke={1.5} />
          <div className="flex flex-col gap-1 max-w-md">
            <h3 className="text-lg font-bold text-white">
              Failed to load subscription details
            </h3>
            <p className="text-sm text-muted-foreground">
              We encountered an issue fetching your agent subscription information.
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
            My <span className="text-primary">Subscription</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-light">
            Manage your football agent tier, billing details, and scouting privileges
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
                Your checkout for the{" "}
                <span className="text-white font-medium">
                  {currentSub?.planTitle || "Football Agent"}
                </span>{" "}
                plan has been initiated. If your payment was completed, it may
                take a few moments to activate.
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
              <h4 className="text-sm font-semibold text-white">
                Subscription Expiring Soon
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                You have {currentSub?.daysRemaining ?? 0} days remaining on your
                active subscription. Renew now to maintain uninterrupted agent scouting access.
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
              <h4 className="text-sm font-semibold text-white">
                Subscription Expired
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your agent subscription has expired. Subscribe or renew to restore
                full access to athlete and coach profiles, direct parent contacts, and scouting tools.
              </p>
            </div>
          </div>
          <Button asChild variant="destructive" className="shrink-0 font-semibold">
            <Link href="/k10plans">Renew / Subscribe</Link>
          </Button>
        </Card>
      )}

      {!hasActive && !currentSub && (
        <Card className="p-8 sm:p-12 rounded-2xl border border-border bg-cardBg text-center flex flex-col items-center justify-center gap-6">
          <div className="size-16 rounded-2xl bg-white/5 border border-border flex items-center justify-center">
            <IconCreditCard className="size-8 text-primary" />
          </div>
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="text-2xl font-bold text-white">
              No Active Football Agent Subscription
            </h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to a Football Agent membership plan to gain access to all
              athlete and coach profiles, detailed analysis materials, direct parent
              contacts, and event promotions.
            </p>
          </div>
          <Button asChild variant="outline" className="bg-primary text-black hover:bg-[#00dd00] font-bold rounded-full px-8">
            <Link href="/k10plans">Browse Membership Plans</Link>
          </Button>
        </Card>
      )}

      {currentSub && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Plan Card */}
            <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <IconAward className="size-5 text-primary" />
                </div>
                {getStatusBadge(currentSub.status, hasActive, isExpired)}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current Tier
                </span>
                <h3 className="text-2xl font-bold text-white truncate">
                  {currentSub.planTitle || "Football Agent"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {currentSub.planCategory || "AGENT"} Plan
                </span>
              </div>
            </Card>

            {/* Price & Billing */}
            <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <IconReceipt className="size-5 text-primary" />
                </div>
                <Badge variant="outline">
                  {formatBillingCycle(currentSub.billingCycle)}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Billed Amount
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {currentSub.formattedAmount ||
                    `${currentSub.currency || "$"}${currentSub.amountPaid ?? 0}`}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {currentSub.isAdminGrant
                    ? "Admin Granted"
                    : `Billed ${formatBillingCycle(currentSub.billingCycle)}`}
                </span>
              </div>
            </Card>

            {/* Days Remaining */}
            <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <IconClock className="size-5 text-primary" />
                </div>
                <Badge variant={hasActive ? "default" : isExpired ? "destructive" : "secondary"}>
                  {hasActive ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Days Remaining
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {hasActive ? `${currentSub.daysRemaining ?? 0} Days` : "0 Days"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {hasActive
                    ? "Until current billing cycle ends"
                    : "No active cycle"}
                </span>
              </div>
            </Card>

            {/* Next Billing / End Date */}
            <Card className="bg-cardBg border border-border p-6 flex flex-col justify-between gap-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <IconCalendar className="size-5 text-primary" />
                </div>
                <Badge variant="outline">
                  {currentSub.nextBillingDate ? "Next Bill" : "End Date"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Renewal / End Date
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                  {currentSub.nextBillingDate
                    ? formatDate(currentSub.nextBillingDate)
                    : currentSub.endDate
                    ? formatDate(currentSub.endDate)
                    : "N/A"}
                </h3>
                <span className="text-xs text-muted-foreground">
                  Started: {formatDate(currentSub.startDate)}
                </span>
              </div>
            </Card>
          </div>

          {/* Detailed Subscription Info */}
          <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <IconShieldCheck className="size-6 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-white">
                    Agent Subscription Details
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Comprehensive overview of your agency tier, privileges, and billing info
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-black font-semibold rounded-full"
              >
                <Link href="/k10plans" className="flex items-center gap-2">
                  <span>Change Plan</span>
                  <IconArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Plan Name
                </span>
                <span className="text-base font-semibold text-white">
                  {currentSub.planTitle || "Football Agent"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Target Role
                </span>
                <span className="text-base font-semibold text-white">
                  {subData?.userRole || currentSub.planCategory || "AGENT"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Billing Cycle
                </span>
                <span className="text-base font-semibold text-white">
                  {formatBillingCycle(currentSub.billingCycle)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Start Date
                </span>
                <span className="text-base font-semibold text-white">
                  {formatDate(currentSub.startDate)}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  End / Renewal Date
                </span>
                <span className="text-base font-semibold text-white">
                  {currentSub.nextBillingDate
                    ? formatDate(currentSub.nextBillingDate)
                    : currentSub.endDate
                    ? formatDate(currentSub.endDate)
                    : "N/A"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Grant Status
                </span>
                <span className="text-base font-semibold text-white">
                  {currentSub.isAdminGrant ? "Granted by Admin" : "User Subscription"}
                </span>
              </div>

              {currentSub.paymentReference && (
                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    Payment Reference
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground bg-white/5 border border-border p-3 rounded-xl break-all">
                    {currentSub.paymentReference}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Included Features Section */}
          <Card className="bg-cardBg border border-border p-6 sm:p-8 rounded-2xl flex flex-col gap-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <IconFileText className="size-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white">
                  Plan Features & Agent Privileges
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  The following scouting tools and capabilities are provided in this plan
                </p>
              </div>
            </div>

            {Array.isArray(currentSub.features) && currentSub.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSub.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-border/60"
                  >
                    <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <IconCheck className="size-3.5" />
                    </div>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No specific features listed for this tier.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AgentSubscription;


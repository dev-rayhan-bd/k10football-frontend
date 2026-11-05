"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconCopy,
  IconShieldCheck,
  IconSparkles,
  IconArrowRight,
  IconCreditCard,
  IconChecklist,
} from "@tabler/icons-react";
import { useGetSubscriptionPlansQuery } from "@/redux/features/subscription/subscriptionApi";
import {
  getUserInfo,
  getUserRole,
  getDashboardPathForRole,
  normalizeRole,
} from "@/helpers/SessionHelper";
import { toast } from "sonner";

const SubscriptionSuccessContent = () => {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const sessionId = searchParams.get("session_id") || searchParams.get("sessionId") || "";
  const planId = searchParams.get("planId") || searchParams.get("plan_id") || "";

  const { data: plansResponse, isLoading: isPlansLoading } = useGetSubscriptionPlansQuery();

  // Find matching plan if available from API
  const plan = useMemo(() => {
    if (!planId || !plansResponse?.data) return null;
    return plansResponse.data.find((p) => p._id === planId) || null;
  }, [planId, plansResponse]);

  // Determine user's dashboard path
  const dashboardPath = useMemo(() => {
    const info = getUserInfo();
    const role = normalizeRole(info.role || getUserRole() || plan?.planCategory || "");
    return getDashboardPathForRole(role);
  }, [plan]);

  const handleCopySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    toast.success("Transaction reference copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const planTitle = plan?.title || plan?.planName || "K10 Membership Plan";
  const planPriceFormatted = plan?.price
    ? `${plan.currency || "$"}${plan.price.toFixed(2)}`
    : "$19.99";
  const billingCycle = plan?.billingCycle ? `/${plan.billingCycle.toLowerCase()}` : "/month";

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-12 sm:py-20 overflow-hidden bg-black text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-36 size-96 bg-[#00ff88]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-36 size-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8 text-center">
        {/* Animated Success Badge */}
        <div className="relative flex items-center justify-center">
          <div className="size-24 sm:size-28 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/40 flex items-center justify-center text-[#00ff88] shadow-[0_0_50px_rgba(0,255,136,0.35)] animate-in zoom-in-75 duration-500">
            <IconCheck className="size-12 sm:size-14 stroke-[3]" />
          </div>
          <div className="absolute -top-2 -right-2 size-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary animate-bounce">
            <IconSparkles className="size-4" />
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight font-heading leading-tight">
            Subscription <span className="text-[#00ff88] italic">Activated!</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 font-medium max-w-lg mx-auto">
            Congratulations! Your membership payment has been confirmed. Your account is now fully upgraded with all premium privileges.
          </p>
        </div>

        {/* Plan Summary Card */}
        <Card className="w-full bg-[#0c0c0e]/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl backdrop-blur-xl text-left">
          {/* Top Row: Plan Name & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] shrink-0">
                <IconShieldCheck className="size-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Active Tier
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading truncate">
                  {isPlansLoading ? (
                    <Skeleton className="h-6 w-40 bg-white/10" />
                  ) : (
                    planTitle
                  )}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30 font-bold px-3 py-1 uppercase tracking-wider text-xs">
                Active Member
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Billing Rate
              </span>
              <div className="flex items-baseline gap-1 text-white font-black text-xl sm:text-2xl font-heading">
                <span>{planPriceFormatted}</span>
                <span className="text-xs text-gray-400 font-normal">{billingCycle}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                Payment Status
              </span>
              <div className="flex items-center gap-1.5 text-white font-semibold text-sm sm:text-base">
                <IconCreditCard className="size-4 text-[#00ff88]" />
                <span className="text-[#00ff88] font-bold">Paid via Stripe</span>
              </div>
            </div>
          </div>

          {/* Session ID if available */}
          {sessionId && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Transaction Reference
                </span>
                <span className="text-xs text-gray-300 font-mono truncate max-w-[240px] sm:max-w-md">
                  {sessionId}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopySessionId}
                className="text-gray-400 hover:text-white shrink-0 cursor-pointer"
                title="Copy Reference ID"
              >
                {copied ? <IconCheck className="size-4 text-[#00ff88]" /> : <IconCopy className="size-4" />}
              </Button>
            </div>
          )}

          {/* Features Included */}
          {plan?.features && plan.features.length > 0 && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
                <IconChecklist className="size-4 text-[#00ff88]" />
                <span>Unlocked Features</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.features.map((feat, i) => (
                  <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                    <span className="text-[#00ff88] font-black select-none">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            asChild
            className="w-full sm:w-auto h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-wider text-xs sm:text-sm font-orbitron flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            <Link href={dashboardPath}>
              <span>Go to Dashboard</span>
              <IconArrowRight className="size-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto h-12 px-8 rounded-full border-white/20 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Link href="/k10plans">View Membership Plans</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const SubscriptionSuccessSkeleton = () => (
  <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center p-4 bg-black">
    <div className="w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded-3xl p-10 flex flex-col items-center gap-6">
      <Skeleton className="size-24 rounded-full bg-white/10" />
      <Skeleton className="h-8 w-64 bg-white/10" />
      <Skeleton className="h-4 w-80 bg-white/5" />
      <Skeleton className="h-40 w-full rounded-2xl bg-white/5" />
      <Skeleton className="h-12 w-48 rounded-full bg-white/10" />
    </div>
  </div>
);

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<SubscriptionSuccessSkeleton />}>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreateGameReport from "@/components/user-wise-dashboard/coach-dashboard/CreateGameReport";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import { toast } from "sonner";

const CreateGameReportPage = () => {
  const router = useRouter();
  const { data: subData, isLoading } = useGetMySubscriptionQuery();
  const hasActiveSubscription = Boolean(subData?.data?.hasActiveSubscription);

  useEffect(() => {
    if (!isLoading && !hasActiveSubscription) {
      toast.error("Active Athlete Membership required to submit game reports or request coach reviews.");
      router.replace("/dashboard/player/my-subscription");
    }
  }, [isLoading, hasActiveSubscription, router]);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return null;
  }

  return (
    <div className="py-10">
      <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-white">Loading...</div>}>
        <CreateGameReport 
          onCancel={() => router.push("/dashboard/player/game-reports")} 
        />
      </Suspense>
    </div>
  );
};

export default CreateGameReportPage;

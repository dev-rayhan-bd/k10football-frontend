/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import {
  useGetMyChildrenQuery,
  useGetParentOverviewQuery,
} from "@/redux/features/parent/parentApi";

export const useParentSubscriptionAccess = () => {
  const { data: parentSub, isLoading: isParentSubLoading } =
    useGetMySubscriptionQuery();
  const { data: childrenData, isLoading: isChildrenLoading } =
    useGetMyChildrenQuery();
  const { data: overviewData } = useGetParentOverviewQuery();

  const hasParentActiveSub = Boolean(parentSub?.data?.hasActiveSubscription);

  // Check if any linked child has an active subscription
  const children = childrenData?.data || [];
  const overviewChildren = overviewData?.data?.children || [];
  const youthProfile = overviewData?.data?.youthProfile;

  const hasChildActiveSub = useMemo(() => {
    // 1. Check linked children from /parents/my-children
    const childHasSub = children.some((c: any) =>
      Boolean(
        c.hasActiveSubscription ||
          c.isSubscribed ||
          c.subscription?.hasActiveSubscription ||
          c.subscription?.status === "ACTIVE" ||
          c.plan?.isActive ||
          c.isPlayerSubscribed
      )
    );
    if (childHasSub) return true;

    // 2. Check overview children
    const overviewChildHasSub = overviewChildren.some((c: any) =>
      Boolean(
        c.hasActiveSubscription ||
          c.isSubscribed ||
          c.subscription?.hasActiveSubscription ||
          c.subscription?.status === "ACTIVE"
      )
    );
    if (overviewChildHasSub) return true;

    // 3. Check youthProfile
    if (
      youthProfile &&
      ((youthProfile as any).hasActiveSubscription ||
        (youthProfile as any).isSubscribed ||
        (youthProfile as any).subscription?.hasActiveSubscription)
    ) {
      return true;
    }

    return false;
  }, [children, overviewChildren, youthProfile]);

  const isUnlocked = hasParentActiveSub || hasChildActiveSub;
  const isLoading = isParentSubLoading || isChildrenLoading;

  return {
    isUnlocked,
    hasParentActiveSub,
    hasChildActiveSub,
    isLoading,
    parentSubscription: parentSub?.data,
    children,
  };
};


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useGetMySubscriptionQuery } from "@/redux/features/subscription/subscriptionApi";
import {
  useGetMyChildrenQuery,
  useGetParentOverviewQuery,
} from "@/redux/features/parent/parentApi";
import { useGetMeQuery } from "@/redux/features/user/userApi";
import { useOptionalParentDashboard } from "@/providers/ParentDashboardProvider";
import { ILinkedChild } from "@/types/parent.type";

const isChildItemSubscribed = (c: any): boolean =>
  Boolean(
    c?.hasActiveSubscription ||
      String(c?.subscriptionStatus || "").toUpperCase() === "ACTIVE" ||
      c?.isSubscribed ||
      c?.subscription?.hasActiveSubscription ||
      String(c?.subscription?.status || "").toUpperCase() === "ACTIVE" ||
      c?.currentSubscription?.status === "ACTIVE" ||
      c?.plan?.isActive ||
      c?.isPlayerSubscribed
  );

export const useParentSubscriptionAccess = (explicitChildPlayerId?: string) => {
  const parentDashboard = useOptionalParentDashboard();

  const { data: fallbackChildrenData, isLoading: isFallbackChildrenLoading } =
    useGetMyChildrenQuery(undefined, {
      skip: Boolean(parentDashboard),
    });

  const children: ILinkedChild[] = useMemo(
    () => parentDashboard?.children ?? fallbackChildrenData?.data ?? [],
    [parentDashboard?.children, fallbackChildrenData?.data]
  );

  const selectedChildPlayerId =
    explicitChildPlayerId ||
    parentDashboard?.selectedChildPlayerId ||
    children[0]?.childPlayerId ||
    "";

  const selectedChild: ILinkedChild | null = useMemo(() => {
    if (explicitChildPlayerId) {
      return (
        children.find((c) => c.childPlayerId === explicitChildPlayerId) || null
      );
    }
    return parentDashboard?.selectedChild || children[0] || null;
  }, [explicitChildPlayerId, children, parentDashboard?.selectedChild]);

  const { data: meResponse, isLoading: isMeLoading } = useGetMeQuery();

  const {
    data: subResponse,
    currentData: currentSubResponse,
    isLoading: isSubLoading,
  } = useGetMySubscriptionQuery(
    selectedChildPlayerId
      ? { childPlayerId: selectedChildPlayerId }
      : undefined
  );

  const {
    data: overviewResponse,
    currentData: currentOverviewResponse,
    isLoading: isOverviewLoading,
  } = useGetParentOverviewQuery(
    selectedChildPlayerId
      ? { childPlayerId: selectedChildPlayerId }
      : undefined
  );

  const meData = meResponse?.data;
  const subData = currentSubResponse?.data ?? subResponse?.data;
  const scopedSubData = currentSubResponse?.data;
  const overviewData = currentOverviewResponse?.data ?? overviewResponse?.data;
  const scopedOverviewData = currentOverviewResponse?.data;
  const overviewSummary = overviewData?.subscriptionSummary;
  const scopedOverviewSummary = scopedOverviewData?.subscriptionSummary;
  const scopedYouthProfile = scopedOverviewData?.youthProfile;

  // Parent-level / Sidebar-level access: true if AT LEAST 1 child is subscribed
  const {
    hasAnySubscribedChild,
    subscribedChildrenCount,
    totalChildrenCount,
  } = useMemo(() => {
    const total =
      overviewSummary?.totalChildrenCount ??
      meData?.totalChildrenCount ??
      subData?.totalChildrenCount ??
      children.length;

    const childListSubscribedCount = children.filter(isChildItemSubscribed).length;
    const subBreakdownCount = Array.isArray(subData?.childSubscriptions)
      ? subData.childSubscriptions.filter(isChildItemSubscribed).length
      : 0;
    const meBreakdownCount = Array.isArray(meData?.childSubscriptions)
      ? meData.childSubscriptions.filter(isChildItemSubscribed).length
      : 0;

    const subscribedCount =
      typeof overviewSummary?.subscribedChildrenCount === "number"
        ? overviewSummary.subscribedChildrenCount
        : typeof meData?.subscribedChildrenCount === "number"
          ? meData.subscribedChildrenCount
          : typeof subData?.subscribedChildrenCount === "number"
            ? subData.subscribedChildrenCount
            : Math.max(
                childListSubscribedCount,
                subBreakdownCount,
                meBreakdownCount
              );

    const anySubscribed = Boolean(
      overviewSummary?.hasAnySubscribedChild ||
        meData?.hasActiveSubscription ||
        subscribedCount > 0 ||
        children.some(isChildItemSubscribed) ||
        (Array.isArray(subData?.childSubscriptions) &&
          subData.childSubscriptions.some(isChildItemSubscribed))
    );

    return {
      hasAnySubscribedChild: anySubscribed,
      subscribedChildrenCount: subscribedCount,
      totalChildrenCount: total,
    };
  }, [overviewSummary, meData, subData, children]);

  // Per-Selected-Child Gating: strictly scoped to the currently selected child ONLY!
  const isSelectedChildUnlocked = useMemo(() => {
    // 1. Check scoped overview.youthProfile / subscriptionSummary (strictly currentData for selectedChildPlayerId)
    if (typeof scopedYouthProfile?.hasActiveSubscription === "boolean") {
      return scopedYouthProfile.hasActiveSubscription;
    }

    if (
      typeof scopedOverviewSummary?.activeChildHasSubscription === "boolean"
    ) {
      return scopedOverviewSummary.activeChildHasSubscription;
    }

    // 2. Check /subscriptions/my-subscription?childPlayerId=<selectedChildPlayerId>
    if (selectedChildPlayerId && Array.isArray(subData?.childSubscriptions)) {
      const matchedInSub = subData.childSubscriptions.find(
        (c) => c.childPlayerId === selectedChildPlayerId
      );
      if (matchedInSub) {
        return isChildItemSubscribed(matchedInSub);
      }
    }

    if (
      selectedChildPlayerId &&
      typeof scopedSubData?.hasActiveSubscription === "boolean"
    ) {
      return scopedSubData.hasActiveSubscription;
    }

    // 3. Check selectedChild from /parents/my-children
    if (selectedChild) {
      return isChildItemSubscribed(selectedChild);
    }

    return false;
  }, [
    selectedChildPlayerId,
    scopedYouthProfile,
    scopedOverviewSummary?.activeChildHasSubscription,
    subData?.childSubscriptions,
    scopedSubData?.hasActiveSubscription,
    selectedChild,
  ]);

  const selectedChildSubscriptionStatus = useMemo(() => {
    const raw =
      scopedYouthProfile?.subscriptionStatus ||
      scopedSubData?.subscriptionStatus ||
      selectedChild?.subscriptionStatus;
    if (raw) return String(raw).toUpperCase();
    return isSelectedChildUnlocked ? "ACTIVE" : "FREE";
  }, [
    scopedYouthProfile?.subscriptionStatus,
    scopedSubData?.subscriptionStatus,
    selectedChild?.subscriptionStatus,
    isSelectedChildUnlocked,
  ]);

  const selectedChildCurrentSubscription =
    scopedYouthProfile?.currentSubscription ??
    scopedSubData?.currentSubscription ??
    selectedChild?.currentSubscription ??
    null;

  const isChildrenLoading = parentDashboard
    ? parentDashboard.isChildrenLoading
    : isFallbackChildrenLoading;

  const isLoading =
    isChildrenLoading || isSubLoading || isOverviewLoading || isMeLoading;

  return {
    // Sidebar / parent-level
    isUnlocked: hasAnySubscribedChild,
    hasAnySubscribedChild,
    subscribedChildrenCount,
    totalChildrenCount,
    // Per-selected-child gating
    isSelectedChildUnlocked,
    selectedChildSubscriptionStatus,
    selectedChildCurrentSubscription,
    selectedChild,
    selectedChildPlayerId,
    // Raw datasets
    isLoading,
    parentSubscription: subData,
    childSubscriptions: subData?.childSubscriptions || [],
    overviewData,
    children,
  };
};

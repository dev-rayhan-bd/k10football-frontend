"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconLoader2 } from "@tabler/icons-react";
import {
  useGetSubscriptionPlansQuery,
  useSubscribeToPlanMutation,
} from "@/redux/features/subscription/subscriptionApi";
import {
  getToken,
  isLoggedIn,
  getUserInfo,
  getUserRole,
} from "@/helpers/SessionHelper";
import { WarningToast } from "@/helpers/ValidationHelper";

interface DisplayPlanItem {
  _id?: string;
  name: string;
  price: string;
  billingCycle: string;
  planCategory: string;
  targetRole?: string;
  features: string[];
}

const DEFAULT_PLANS: DisplayPlanItem[] = [
  {
    name: "Player",
    price: "$19.99",
    billingCycle: "/month",
    planCategory: "PLAYER",
    features: [
      "Production of analysis materials",
      "Upload videos, photos, and game reports",
      "Exposure of your profile to licensed agents and professional clubs",
      "Transfer of your analysis materials to other clubs",
    ],
  },
  {
    name: "Coaches",
    price: "$39.99",
    billingCycle: "/month",
    planCategory: "COACH",
    features: [
      "Production of analysis materials",
      "Upload videos, photos, courses and certificates",
      "Exposure of your profile to licensed agents and professional clubs",
      "Transfer of your analysis materials to other clubs",
    ],
  },
  {
    name: "Football Agent",
    price: "$89.99",
    billingCycle: "/month",
    planCategory: "AGENT",
    features: [
      "Access to all athlete and coach profiles on the platform",
      "Detailed analysis of athletes' materials",
      "Direct contact with athletes' parents",
      "Faster and More objective pre-field analysis",
      "Promotion of tryouts and events on the platform",
    ],
  },
  {
    name: "Professional Club",
    price: "$159.00",
    billingCycle: "/month",
    planCategory: "CLUB",
    features: [
      "Access to all athlete and coach profiles on the platform",
      "Detailed analysis of athletes' materials",
      "Direct contact with athletes' parents",
      "Faster and More objective analysis before sending scouts to the field",
      "Display of club's trials on the platform",
    ],
  },
  {
    name: "Grassroot Clubs",
    price: "$300.00",
    billingCycle: "/month",
    planCategory: "CLUB",
    features: [
      "Production of analysis materials for up to 3 coaches and 30 players",
      "Upload videos, photos, and game reports",
      "Exposure of your club profile to licensed agents and professional clubs",
      "Display of your club's trials of the platform",
      "Commission for each game report submitted by an athlete",
    ],
  },
];

const ROLE_SORT_ORDER: Record<string, number> = {
  PLAYER: 1,
  COACH: 2,
  AGENT: 3,
  CLUB: 4,
  ACADEMY: 5,
};

const normalizeRoleKey = (roleStr?: string | null): string => {
  if (!roleStr) return "";
  const r = roleStr.toLowerCase().trim().replace(/[-_]/g, "");
  if (r.includes("player")) return "player";
  if (r.includes("coach")) return "coach";
  if (r.includes("agent")) return "agent";
  if (r.includes("club")) return "club";
  if (r.includes("acad")) return "academy";
  if (r.includes("admin")) return "admin";
  if (r.includes("parent")) return "parent";
  return r;
};

const formatBillingCycle = (cycle?: string) => {
  if (!cycle) return "/month";
  const c = cycle.toLowerCase().trim();
  if (c.includes("month")) return "/month";
  if (c.includes("year")) return "/year";
  return `/${c}`;
};

const MembershipPlanSection = () => {
  const router = useRouter();
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  const { data: plansResponse, isLoading } = useGetSubscriptionPlansQuery();
  const [subscribeToPlan] = useSubscribeToPlanMutation();

  const handleChoosePlan = async (plan: {
    _id?: string;
    name: string;
    planCategory?: string;
    targetRole?: string;
  }) => {
    // 1. Check if logged in
    const token = getToken();
    const loggedIn = isLoggedIn() || !!token;
    if (!loggedIn) {
      WarningToast("Please log in to your account to subscribe to a membership plan.");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      return;
    }

    // 2. Check if user's role matches planCategory / targetRole
    const userInfo = getUserInfo();
    const currentUserRole = userInfo?.role || getUserRole() || "";
    const userRoleKey = normalizeRoleKey(currentUserRole);
    const planRoleKey = normalizeRoleKey(
      plan.planCategory || plan.targetRole || plan.name
    );

    if (userRoleKey && planRoleKey && userRoleKey !== planRoleKey) {
      const roleDisplay = userRoleKey.toUpperCase();
      const planDisplay = planRoleKey.toUpperCase();
      WarningToast(
        `This plan is exclusively for ${planDisplay}s. You are currently logged in as a ${roleDisplay}.`
      );
      return;
    }

    if (!plan._id) {
      WarningToast("Plan ID not found. Please refresh the page and try again.");
      return;
    }

    // 3. Call Subscribe to Plan API
    try {
      setSubscribingPlanId(plan._id);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await subscribeToPlan({
        planId: plan._id,
        ...(origin
          ? {
              origin,
              successUrl: `${origin}/subscription/success`,
              cancelUrl: `${origin}/plans`,
              redirectUrl: `${origin}/subscription/success`,
            }
          : {}),
      } as any).unwrap();

      const sessionUrl =
        res?.data?.checkoutSessionUrl ||
        res?.checkoutSessionUrl ||
        res?.data?.checkoutUrl ||
        res?.data?.url;

      if (sessionUrl) {
        window.location.assign(sessionUrl);
      }
    } catch {
      // Error notifications handled by subscriptionApi onQueryStarted
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const displayedPlans = useMemo(() => {
    const apiPlans = plansResponse?.data;
    if (apiPlans && Array.isArray(apiPlans) && apiPlans.length > 0) {
      const activePlans = apiPlans.filter((p) => p.isActive !== false && p.status !== "INACTIVE");
      const listToSort = activePlans.length > 0 ? activePlans : apiPlans;

      const sorted = [...listToSort].sort((a, b) => {
        const orderA = ROLE_SORT_ORDER[a.planCategory?.toUpperCase()] ?? 99;
        const orderB = ROLE_SORT_ORDER[b.planCategory?.toUpperCase()] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return a.price - b.price;
      });

      return sorted.map((p) => {
        const currency = p.currency || "$";
        const priceStr =
          typeof p.price === "number"
            ? `${currency}${p.price % 1 === 0 ? p.price.toFixed(2) : p.price}`
            : `${currency}0.00`;

        return {
          _id: p._id,
          name: p.title || p.planName || "Membership Plan",
          price: priceStr,
          billingCycle: formatBillingCycle(p.billingCycle),
          features: Array.isArray(p.features) ? p.features : [],
          planCategory: p.planCategory,
          targetRole: p.targetRole,
        };
      });
    }

    return DEFAULT_PLANS;
  }, [plansResponse]);

  return (
    <section className="bg-black py-12 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8">
      <div className="container flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white">
            Membership <span className="text-primary">Plans</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan for your needs.
          </p>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="bg-cardBg border border-border p-6 flex flex-col gap-6 h-full rounded-2xl animate-pulse"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="h-6 w-32 bg-white/10 rounded-md" />
                  <div className="h-8 w-28 bg-white/10 rounded-md mt-1" />
                </div>
                <div className="flex flex-col gap-3 grow py-2">
                  <div className="h-3.5 w-full bg-white/5 rounded" />
                  <div className="h-3.5 w-5/6 bg-white/5 rounded" />
                  <div className="h-3.5 w-4/5 bg-white/5 rounded" />
                  <div className="h-3.5 w-3/4 bg-white/5 rounded" />
                </div>
                <div className="h-10 w-full bg-white/10 rounded-full mt-auto" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayedPlans.map((plan, i) => (
              <Card
                key={plan._id || i}
                className="bg-cardBg border border-border cursor-pointer p-6 flex flex-col gap-6 hover:border-primary transition h-full rounded-2xl"
              >
                <div>
                  <h4 className="text-xl lg:text-2xl text-center font-bold text-white">
                    {plan.name}
                  </h4>
                  <div className="text-2xl lg:text-3xl font-bold text-white text-center mt-2">
                    {plan.price}{" "}
                    <span className="text-gray-400 text-xl font-normal">
                      {plan.billingCycle}
                    </span>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 grow">
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-400 flex items-start"
                    >
                      <span className="text-primary mr-2 select-none">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleChoosePlan(plan)}
                  disabled={subscribingPlanId === plan._id}
                  variant="outline"
                  className="w-full bg-primary text-black rounded-full cursor-pointer hover:bg-[#00dd00] font-bold mt-auto flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {subscribingPlanId === plan._id ? (
                    <>
                      <IconLoader2 className="size-4 animate-spin text-black" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    "Choose Plan"
                  )}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MembershipPlanSection;

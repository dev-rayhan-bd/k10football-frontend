"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { IconShoppingCart, IconLoader2 } from "@tabler/icons-react";
import { useGetCartQuery } from "@/redux/features/shop/shopApi";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { setAccessToken, setRefreshToken, setUser } from "@/redux/features/auth";
import { setToken, setUserInfo } from "@/helpers/SessionHelper";
import {
  useGetMyChildrenQuery,
  useLazyGetMyChildrenQuery,
  useSwitchProfileToChildMutation,
  useSwitchToParentMutation,
} from "@/redux/features/parent/parentApi";
import { apiSlice } from "@/redux/features/api/apiSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import NotificationBellDropdown from "@/components/notifications/NotificationBellDropdown";

const SiteHeader = ({
  showToggle = false,
  customToggle,
}: {
  showToggle?: boolean;
  customToggle?: ReactNode;
}) => {
  const pathName = usePathname();
  const isAnalysis = pathName.includes("/analysis");
  const isPlayerPage = pathName.startsWith("/dashboard/player");
  const isParentPage = pathName.startsWith("/dashboard/parent");
  const isParentOrPlayerSpace = isPlayerPage || isParentPage;
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Shop cart query (only on parent pages)
  const { data: cartResponse } = useGetCartQuery(undefined, {
    skip: !isParentPage,
  });
  const cartCount =
    cartResponse?.data?.itemCount ??
    cartResponse?.data?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) ??
    0;

  // Profile switching mutations & linked children query
  const [switchProfileToChild, { isLoading: isSwitchingToChild }] =
    useSwitchProfileToChildMutation();
  const [switchToParent, { isLoading: isSwitchingToParent }] =
    useSwitchToParentMutation();
  const [triggerGetMyChildren] = useLazyGetMyChildrenQuery();

  const { data: myChildrenResponse } = useGetMyChildrenQuery(undefined, {
    skip: !isParentPage,
  });

  // Keep childUserId persisted in localStorage when loaded
  useEffect(() => {
    const childId = myChildrenResponse?.data?.[0]?.childUserId;
    if (childId && typeof window !== "undefined") {
      localStorage.setItem("childUserId", childId);
    }
  }, [myChildrenResponse]);

  const isSwitching = isSwitchingToChild || isSwitchingToParent;

  const handleSwitchToAthlete = async () => {
    if (isPlayerPage || isSwitching) return;

    let targetChildUserId =
      myChildrenResponse?.data?.[0]?.childUserId ||
      (typeof window !== "undefined" ? localStorage.getItem("childUserId") : null);

    if (!targetChildUserId) {
      try {
        const res = await triggerGetMyChildren().unwrap();
        targetChildUserId = res?.data?.[0]?.childUserId || null;
      } catch {
        // Handled below
      }
    }

    if (!targetChildUserId) {
      toast.error("No linked child athlete found. Please create a child profile first.");
      router.push("/dashboard/parent/profiles");
      return;
    }

    try {
      const res = await switchProfileToChild({
        childUserId: targetChildUserId,
      }).unwrap();

      const token = res?.data?.accessToken;
      const user = res?.data?.user;
      const refreshToken = res?.data?.refreshToken;
      const switchedFromParentId = res?.data?.switchedFromParentId;

      if (token) {
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
        dispatch(setAccessToken(token));
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        dispatch(setRefreshToken(refreshToken));
      }
      if (switchedFromParentId) {
        localStorage.setItem("switchedFromParentId", switchedFromParentId);
      }
      if (user) {
        const fullName = user.name || user.fullName || "";
        const email = user.email || "";
        const profileImg = user.avatar || user.profileImage || "";
        setUserInfo({ fullName, email, profileImg, role: "player" });
        dispatch(
          setUser({
            user: {
              ...user,
              role: "player",
            },
          })
        );
      }

      dispatch(apiSlice.util.resetApiState());
      router.push("/dashboard/player");
    } catch {
      // Toast handled by onQueryStarted
    }
  };

  const handleSwitchToParent = async () => {
    if (isParentPage || isSwitching) return;

    try {
      const res = await switchToParent().unwrap();
      const token = res?.data?.accessToken;
      const user = res?.data?.user;
      const refreshToken = res?.data?.refreshToken;

      if (token) {
        setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
        dispatch(setAccessToken(token));
      }
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
        dispatch(setRefreshToken(refreshToken));
      }
      localStorage.removeItem("switchedFromParentId");
      if (user) {
        const fullName = user.name || user.fullName || "";
        const email = user.email || "";
        const profileImg = user.avatar || user.profileImage || "";
        setUserInfo({ fullName, email, profileImg, role: "parent" });
        dispatch(
          setUser({
            user: {
              ...user,
              role: "parent",
            },
          })
        );
      }

      dispatch(apiSlice.util.resetApiState());
      router.push("/dashboard/parent");
    } catch {
      // Toast handled by onQueryStarted
    }
  };

  const handleParentAthleteToggle = () => {
    if (isSwitching) return;
    if (isParentPage) {
      handleSwitchToAthlete();
    } else {
      handleSwitchToParent();
    }
  };

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Only apply hide/show logic on small devices (mobile)
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;

      if (isLandscape) {
        // In landscape, only show when at the very top
        if (currentScrollY > 10) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        // Hide when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 60) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleToggle = () => {
    if (isAnalysis) {
      router.push("/dashboard/academy/management");
    } else {
      router.push("/dashboard/academy/analysis");
    }
  };

  return (
    <header
      className={`flex h-(--header-height) shrink-0 items-center justify-between gap-4 px-4 lg:px-8 border-b border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50 transition-transform duration-300 ${!isVisible ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative">
          {/* Glow effect behind the trigger */}
          <div
            className="absolute inset-0 bg-white/20 rounded-md animate-ping"
            style={{ animationDuration: "2s" }}
          ></div>
          <SidebarTrigger className="text-white relative z-10 scale-125 md:scale-150 transition-transform duration-300 hover:text-[#E31B23] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>

        <div className="hidden sm:relative sm:block w-full max-w-2xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search By Age Range, Country, Gender And Positions..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
          />
        </div>

        {customToggle && <div className="flex ml-auto sm:ml-0">{customToggle}</div>}
      </div>

      <div className="flex items-center gap-4 text-gray-300">
        {/* Parent / Athlete Switcher Toggle */}
        {isParentOrPlayerSpace && (
          <div className="flex items-center bg-white/5 rounded-lg p-1.5 sm:p-1.5 gap-2 sm:gap-1.5 mr-0 sm:mr-2 border border-white/10 shadow-inner">
            <button
              type="button"
              disabled={isSwitching}
              onClick={handleSwitchToParent}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50",
                isParentPage
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/35"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              Parent
            </button>
            <div
              onClick={handleParentAthleteToggle}
              className={cn(
                "w-10 sm:w-10 h-5 sm:h-5 bg-white/10 rounded-full relative cursor-pointer group border border-white/5 transition-opacity",
                isSwitching && "opacity-60 cursor-not-allowed"
              )}
              title={isParentPage ? "Switch to Athlete Profile" : "Switch to Parent Profile"}
            >
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 size-4 sm:size-3.5 bg-white rounded-full transition-all duration-300 shadow-sm flex items-center justify-center",
                  isPlayerPage ? "right-0.5" : "left-0.5"
                )}
              >
                {isSwitching && (
                  <IconLoader2 size={10} className="animate-spin text-black" />
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={isSwitching}
              onClick={handleSwitchToAthlete}
              className={cn(
                "px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer disabled:opacity-50",
                isPlayerPage
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/35 font-extrabold"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              Athlete
            </button>
          </div>
        )}

        {/* Academy Shop Cart (Only shown for Parent) */}
        {isParentPage && (
          <Link
            href="/dashboard/parent/shop"
            className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center cursor-pointer group"
            title="Academy Shop Cart"
          >
            <IconShoppingCart
              size={18}
              className="text-gray-300 group-hover:text-white transition-colors"
            />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 px-1 bg-[#E31B23] text-white text-[10px] font-black rounded-full flex items-center justify-center border border-[#0A0A0A] font-orbitron leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        )}

        {showToggle && (
          <div className="flex items-center bg-[#5a0000] rounded-lg p-1.5 sm:p-1.5 gap-2 sm:gap-1.5 mr-0 sm:mr-2 border border-white/5">
            <button
              onClick={() => router.push("/dashboard/academy/management")}
              className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all ${!isAnalysis ? "bg-[#E31B23] text-white" : "text-white/40 hover:text-white/60"}`}
            >
              Management
            </button>
            <div
              onClick={handleToggle}
              className="w-10 sm:w-10 h-5 sm:h-5 bg-white/10 rounded-full relative cursor-pointer group border border-white/5"
            >
              <div
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isAnalysis ? "right-0.5" : "left-0.5"}`}
              ></div>
            </div>
            <button
              onClick={() => router.push("/dashboard/academy/analysis")}
              className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all ${isAnalysis ? "bg-[#E31B23] text-white" : "text-white/40 hover:text-white/60"}`}
            >
              Analysis
            </button>
          </div>
        )}

        <div className="hidden xs:flex items-center gap-1 cursor-pointer bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
          <span>EN</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <NotificationBellDropdown />
      </div>
    </header>
  );
};

export default SiteHeader;

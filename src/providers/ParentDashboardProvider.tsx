/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetMyChildrenQuery,
  useLazyGetMyChildrenQuery,
  useSwitchProfileToChildMutation,
} from "@/redux/features/parent/parentApi";
import { apiSlice } from "@/redux/features/api/apiSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import {
  setAccessToken,
  setRefreshToken,
  setUser,
} from "@/redux/features/auth";
import { setToken, setUserInfo } from "@/helpers/SessionHelper";
import { ILinkedChild } from "@/types/parent.type";

const SELECTED_CHILD_STORAGE_KEY = "parent_selected_child_player_id";
const SELECTED_CHILD_USER_STORAGE_KEY = "childUserId";

export interface ParentDashboardContextValue {
  children: ILinkedChild[];
  isChildrenLoading: boolean;
  isChildrenFetching: boolean;
  isChildrenError: boolean;
  refetchChildren: () => void;
  selectedChildPlayerId: string;
  selectedChild: ILinkedChild | null;
  setSelectedChildPlayerId: (childPlayerId: string) => void;
  switchToChildAccount: (
    childUserId?: string,
    redirectPath?: string
  ) => Promise<boolean>;
  isSwitchingProfile: boolean;
}

const ParentDashboardContext = createContext<
  ParentDashboardContextValue | undefined
>(undefined);

const readInitialChildPlayerId = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("childPlayerId");
    if (fromQuery) return fromQuery;
    return localStorage.getItem(SELECTED_CHILD_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

export const ParentDashboardProvider = ({
  children: reactChildren,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [selectedChildPlayerId, setSelectedChildPlayerIdState] = useState<string>(
    readInitialChildPlayerId
  );

  const {
    data: childrenResponse,
    isLoading: isChildrenLoading,
    isFetching: isChildrenFetching,
    isError: isChildrenError,
    refetch: refetchChildren,
  } = useGetMyChildrenQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [triggerGetMyChildren] = useLazyGetMyChildrenQuery();
  const [switchProfileToChild, { isLoading: isSwitchingProfile }] =
    useSwitchProfileToChildMutation();

  const linkedChildren: ILinkedChild[] = useMemo(
    () => (Array.isArray(childrenResponse?.data) ? childrenResponse.data : []),
    [childrenResponse]
  );

  // Resolve active childPlayerId safely: if persisted ID no longer exists, fallback to children[0]
  const resolvedChildPlayerId = useMemo(() => {
    if (linkedChildren.length === 0) return selectedChildPlayerId;
    const exists = linkedChildren.some(
      (c) => c.childPlayerId === selectedChildPlayerId
    );
    return exists ? selectedChildPlayerId : linkedChildren[0].childPlayerId;
  }, [linkedChildren, selectedChildPlayerId]);

  const selectedChild = useMemo<ILinkedChild | null>(() => {
    if (linkedChildren.length === 0) return null;
    return (
      linkedChildren.find((c) => c.childPlayerId === resolvedChildPlayerId) ||
      linkedChildren[0] ||
      null
    );
  }, [linkedChildren, resolvedChildPlayerId]);

  // Sync resolved ID & childUserId into state + localStorage
  useEffect(() => {
    if (
      resolvedChildPlayerId &&
      resolvedChildPlayerId !== selectedChildPlayerId
    ) {
      setSelectedChildPlayerIdState(resolvedChildPlayerId);
    }
    if (typeof window !== "undefined") {
      if (resolvedChildPlayerId) {
        localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, resolvedChildPlayerId);
      }
      if (selectedChild?.childUserId) {
        localStorage.setItem(
          SELECTED_CHILD_USER_STORAGE_KEY,
          selectedChild.childUserId
        );
      }
    }
  }, [resolvedChildPlayerId, selectedChildPlayerId, selectedChild?.childUserId]);

  const setSelectedChildPlayerId = useCallback(
    (childPlayerId: string) => {
      setSelectedChildPlayerIdState(childPlayerId);
      if (typeof window !== "undefined") {
        if (childPlayerId) {
          localStorage.setItem(SELECTED_CHILD_STORAGE_KEY, childPlayerId);
        } else {
          localStorage.removeItem(SELECTED_CHILD_STORAGE_KEY);
        }
        const matched = linkedChildren.find(
          (c) => c.childPlayerId === childPlayerId
        );
        if (matched?.childUserId) {
          localStorage.setItem(
            SELECTED_CHILD_USER_STORAGE_KEY,
            matched.childUserId
          );
        }
      }
    },
    [linkedChildren]
  );

  const switchToChildAccount = useCallback(
    async (
      explicitChildUserId?: string,
      redirectPath: string = "/dashboard/player"
    ): Promise<boolean> => {
      if (isSwitchingProfile) return false;

      let targetChildUserId =
        explicitChildUserId ||
        selectedChild?.childUserId ||
        (selectedChild as any)?.userId ||
        (typeof window !== "undefined"
          ? localStorage.getItem(SELECTED_CHILD_USER_STORAGE_KEY)
          : null);

      if (!targetChildUserId) {
        try {
          const res = await triggerGetMyChildren().unwrap();
          const list = res?.data || [];
          const matched =
            list.find((c) => c.childPlayerId === resolvedChildPlayerId) ||
            list[0];
          targetChildUserId =
            matched?.childUserId || (matched as any)?.userId || null;
        } catch {
          // Handled below
        }
      }

      if (!targetChildUserId) {
        toast.error(
          "No linked child athlete found. Please create a child profile first."
        );
        router.push("/dashboard/parent/profiles");
        return false;
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
        localStorage.setItem(SELECTED_CHILD_USER_STORAGE_KEY, targetChildUserId);

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
        router.push(redirectPath);
        return true;
      } catch {
        // Error toast already triggered in parentApi onQueryStarted
        return false;
      }
    },
    [
      isSwitchingProfile,
      selectedChild?.childUserId,
      resolvedChildPlayerId,
      triggerGetMyChildren,
      switchProfileToChild,
      dispatch,
      router,
    ]
  );

  const value = useMemo<ParentDashboardContextValue>(
    () => ({
      children: linkedChildren,
      isChildrenLoading,
      isChildrenFetching,
      isChildrenError,
      refetchChildren,
      selectedChildPlayerId: resolvedChildPlayerId,
      selectedChild,
      setSelectedChildPlayerId,
      switchToChildAccount,
      isSwitchingProfile,
    }),
    [
      linkedChildren,
      isChildrenLoading,
      isChildrenFetching,
      isChildrenError,
      refetchChildren,
      resolvedChildPlayerId,
      selectedChild,
      setSelectedChildPlayerId,
      switchToChildAccount,
      isSwitchingProfile,
    ]
  );

  return (
    <ParentDashboardContext.Provider value={value}>
      {reactChildren}
    </ParentDashboardContext.Provider>
  );
};

export const useParentDashboard = () => {
  const ctx = useContext(ParentDashboardContext);
  if (!ctx) {
    throw new Error(
      "useParentDashboard must be used within a ParentDashboardProvider"
    );
  }
  return ctx;
};

export const useOptionalParentDashboard = () => {
  return useContext(ParentDashboardContext) ?? null;
};

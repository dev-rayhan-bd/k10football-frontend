/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  updatePlayerField,
  setSelectedPlayerId,
  validatePlayerCv,
  addPlayer,
  syncFromCvResponse,
  PlayerData,
} from "@/redux/features/player/playerSlice";
import {
  useGetMyPlayerCvQuery,
  useGetMyPlayerProfileQuery,
  useUpdateMyPlayerProfileMutation,
  useAddPlayerClubMutation,
  useDeletePlayerClubMutation,
  useUpdatePlayerClubMutation,
} from "@/redux/features/player/playerApi";
import { IUpdatePlayerPayload } from "@/types/player.type";
import { toast } from "sonner";

export const usePlayer = () => {
  const dispatch = useAppDispatch();
  const players = useAppSelector((state) => state.player.players);
  const selectedPlayerId = useAppSelector((state) => state.player.selectedPlayerId);
  const playerData = players.find((p) => p.id === selectedPlayerId) || players[0];

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("token") || localStorage.getItem("accessToken"));

  // Check if viewing a specific player via query parameter (e.g. ?playerId=...)
  const isViewingSpecificPlayer =
    typeof window !== "undefined" &&
    Boolean(new URLSearchParams(window.location.search).get("playerId"));

  // 1. GET CV API: Fetch complete player CV from {{baseUrl}}/players/me/cv
  const {
    data: cvResponse,
    isLoading: isCvLoading,
    isFetching: isCvFetching,
    error: cvError,
    refetch: refetchCv,
  } = useGetMyPlayerCvQuery(undefined, {
    skip: !hasToken || isViewingSpecificPlayer,
  });

  // 1b. GET Profile API: Fetch player profile from {{baseUrl}}/players/me
  const {
    data: profileResponse,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useGetMyPlayerProfileQuery(undefined, {
    skip: !hasToken || isViewingSpecificPlayer,
  });

  // 2. PATCH Player API: Update player profile / CV from {{baseUrl}}/players/me
  const [updatePlayerMutation, { isLoading: isUpdating }] = useUpdateMyPlayerProfileMutation();
  const [addPlayerClubMutation, { isLoading: isAddingClub }] = useAddPlayerClubMutation();
  const [deletePlayerClubMutation, { isLoading: isDeletingClub }] = useDeletePlayerClubMutation();
  const [updatePlayerClubMutation, { isLoading: isUpdatingClub }] = useUpdatePlayerClubMutation();

  // Sync API data into Redux player state whenever API responds (only for self player)
  useEffect(() => {
    if (!isViewingSpecificPlayer && cvResponse?.data) {
      dispatch(syncFromCvResponse(cvResponse.data));
    }
  }, [cvResponse, dispatch, isViewingSpecificPlayer]);

  useEffect(() => {
    if (!isViewingSpecificPlayer && profileResponse?.data) {
      dispatch(syncFromCvResponse(profileResponse.data));
    }
  }, [profileResponse, dispatch, isViewingSpecificPlayer]);

  // Update whole section or partial payload via PATCH /players/me
  const updatePlayerProfile = useCallback(
    async (payload: FormData | Partial<IUpdatePlayerPayload> | any) => {
      try {
        const response = await updatePlayerMutation(payload).unwrap();
        if (response?.data) {
          dispatch(syncFromCvResponse(response.data));
        }
        return response;
      } catch (err: any) {
        console.error("Failed to update player:", err);
        throw err;
      }
    },
    [updatePlayerMutation, dispatch]
  );

  // Section-based update helper: can update any section/portion directly
  const updateSection = useCallback(
    async (
      sectionOrPayload: string | Partial<IUpdatePlayerPayload>,
      sectionData?: any
    ) => {
      let payload: Partial<IUpdatePlayerPayload> = {};
      if (typeof sectionOrPayload === "string") {
        payload = { [sectionOrPayload]: sectionData };
      } else {
        payload = sectionOrPayload;
      }
      return updatePlayerProfile(payload);
    },
    [updatePlayerProfile]
  );

  // Field-based update handler with automatic mapping to backend PATCH payload
  const handleUpdate = useCallback(
    async (field: string, value: any, fileOrMeta?: any) => {
      const isClubField = field === "clubs" || field === "clubHistory";

      // Optimistically update local redux state for non-club fields only
      if (!isClubField) {
        dispatch(updatePlayerField({ field, value }));
      }

      // 2. Build partial payload for PATCH /players/me (skip if viewing another player's CV)
      if (!hasToken || isViewingSpecificPlayer) return;

      let backendPayload: any = null;

      switch (field) {
        case "playerImage":
        case "profileImage": {
          let fileToUpload: File | null = null;
          if (fileOrMeta instanceof File) {
            fileToUpload = fileOrMeta;
          } else if (value instanceof File) {
            fileToUpload = value;
          } else if (typeof value === "string" && value.startsWith("data:")) {
            try {
              const arr = value.split(",");
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              fileToUpload = new File([u8arr], "profile.png", { type: mime });
            } catch (e) {
              console.error("Failed to convert dataURL to File", e);
            }
          }

          if (fileToUpload) {
            backendPayload = { profileImage: fileToUpload };
          }
          break;
        }
        case "coverImage": {
          let fileToUpload: File | null = null;
          if (fileOrMeta instanceof File) {
            fileToUpload = fileOrMeta;
          } else if (value instanceof File) {
            fileToUpload = value;
          } else if (typeof value === "string" && value.startsWith("data:")) {
            try {
              const arr = value.split(",");
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              fileToUpload = new File([u8arr], "cover.png", { type: mime });
            } catch (e) {
              console.error("Failed to convert dataURL to File", e);
            }
          }

          if (fileToUpload) {
            backendPayload = { coverImage: fileToUpload };
          }
          break;
        }
        case "cardImage":
        case "cardPhoto": {
          let fileToUpload: File | null = null;
          if (fileOrMeta instanceof File) {
            fileToUpload = fileOrMeta;
          } else if (value instanceof File) {
            fileToUpload = value;
          } else if (typeof value === "string" && value.startsWith("data:")) {
            try {
              const arr = value.split(",");
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : "image/png";
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              fileToUpload = new File([u8arr], "cardImage.png", { type: mime });
            } catch (e) {
              console.error("Failed to convert dataURL to File", e);
            }
          }

          if (fileToUpload) {
            backendPayload = { cardImage: fileToUpload, cardPhoto: fileToUpload };
          }
          break;
        }
        case "fullName":
          backendPayload = { fullName: String(value) };
          break;
        case "dob":
        case "dateOfBirth":
          backendPayload = { dateOfBirth: String(value) };
          break;
        case "birthCountry":
        case "country":
        case "location":
          backendPayload = { country: String(value) };
          break;
        case "dualNationality":
          backendPayload = { dualNationality: String(value || "") };
          break;
        case "academyName":
        case "academy":
          backendPayload = { academy: String(value) };
          break;
        case "coachName":
          backendPayload = { coachName: String(value) };
          break;
        case "clubManaged":
          backendPayload = { clubManaged: String(value) };
          break;
        case "coachLicenseNumber":
        case "licenseNumber":
          backendPayload = { licenseNumber: String(value) };
          break;
        case "phone":
          backendPayload = { phone: String(value) };
          break;
        case "website":
          backendPayload = { website: String(value) };
          break;
        case "height":
          backendPayload = { height: parseFloat(String(value)) || 0 };
          break;
        case "weight":
          backendPayload = { weight: parseFloat(String(value)) || 0 };
          break;
        case "preferredFoot":
          backendPayload = { preferredFoot: String(value) };
          break;
        case "rightLegUsage":
        case "rightFootDominance":
          backendPayload = { rightFootDominance: Number(value) };
          break;
        case "leftLegUsage":
        case "leftFootDominance":
          backendPayload = { leftFootDominance: Number(value) };
          break;
        case "position":
          backendPayload = { position: String(value) };
          break;
        case "secondaryPositions":
          backendPayload = {
            secondaryPositions: Array.isArray(value) ? value : [String(value)],
          };
          break;
        case "contractUntil":
          backendPayload = { contractUntil: String(value) };
          break;
        case "agent":
        case "agentName":
          backendPayload = { agentName: String(value) };
          break;
        case "agency":
        case "agencyName":
          backendPayload = { agencyName: String(value) };
          break;
        case "agentStatus":
          backendPayload = { agentStatus: String(value) };
          break;
        case "clubStatus":
          backendPayload = { clubStatus: String(value) };
          break;
        case "currentClub":
          backendPayload = { currentClub: String(value) };
          break;
        case "marketValue":
          backendPayload = {
            marketValue:
              typeof value === "number"
                ? value
                : parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0,
          };
          break;
        case "languages":
          backendPayload = {
            languages: Array.isArray(value)
              ? value.map((l: any) => ({
                  language: l.language || l.name || "",
                  proficiency: l.proficiency || l.level || "Native",
                }))
              : value,
          };
          break;
        case "selectedStyleIds":
        case "playerStyles":
          backendPayload = {
            playerStyles: Array.isArray(value) ? value : [String(value)],
          };
          break;
        case "clubs":
        case "clubHistory": {
          const clubList = Array.isArray(value)
            ? value.map((c: any) => ({
                clubName: c.name || c.clubName || "",
                from: c.from || (c.period ? c.period.split("-")[0]?.trim() : "2020"),
                to: c.to || (c.period ? c.period.split("-")[1]?.trim() : (c.isCurrent ? "present" : "2022")),
                isCurrent:
                  c.isCurrent ??
                  (String(c.to || "").toLowerCase() === "present" ||
                    String(c.period || "").toLowerCase().includes("present")),
                logoUrl: typeof c.logo === "string" && c.logo.startsWith("http") ? c.logo : undefined,
              }))
            : value;

          const formData = new FormData();
          formData.append("data", JSON.stringify({ clubHistory: clubList }));
          backendPayload = formData as any;
          break;
        }
        case "careerHighlights":
        case "accomplishments":
          backendPayload = {
            accomplishments: Array.isArray(value)
              ? value.map((a: any) => ({
                  year: Number(a.year) || 2024,
                  title: a.title || "",
                }))
              : value,
          };
          break;
        case "positionMarkers":
        case "positionMap":
          backendPayload = {
            positionMap: Array.isArray(value)
              ? value.map((m: any, idx: number) => ({
                  slot: idx === 0 ? "Primary" : idx === 1 ? "Secondary" : "Third Position",
                  position: m.name || "Defensive Midfielder",
                  role: "Anchor Man",
                  x: Math.round(m.x),
                  y: Math.round(m.y),
                }))
              : value,
          };
          break;
        case "futsalMarkers":
        case "futsalMap":
          backendPayload = {
            futsalMap: Array.isArray(value)
              ? value.map((m: any, idx: number) => ({
                  slot: idx === 0 ? "Primary" : idx === 1 ? "Secondary" : "Third Position",
                  position: m.name || "Pivot",
                  role: "Attacker",
                  x: Math.round(m.x),
                  y: Math.round(m.y),
                }))
              : value,
          };
          break;
        case "perceptionMetrics":
          backendPayload = { perceptionMetrics: value };
          break;
        case "visionMetrics":
          backendPayload = { visionMetrics: value };
          break;
        case "transferStatus":
          backendPayload = { transferStatus: String(value || "") };
          break;
        case "strengths":
        case "strength":
          backendPayload = {
            attributes: value,
            strength: typeof value === "object" ? value.physical ?? 50 : Number(value) || 50,
          };
          break;
        case "additionalNotes":
          backendPayload = { additionalNotes: String(value) };
          break;
        default:
          // Local or UI-only fields (e.g., skillsCategories, age, rating) are updated in Redux only
          // and must not trigger backend PATCH mutations or unprompted toasts.
          backendPayload = null;
          break;
      }

      if (backendPayload) {
        const isImageUpload =
          field === "playerImage" ||
          field === "profileImage" ||
          field === "coverImage" ||
          field === "cardImage" ||
          field === "cardPhoto";
        if (isImageUpload) {
          const loadingMsg =
            field === "coverImage"
              ? "Saving cover photo to server..."
              : field === "cardImage" || field === "cardPhoto"
                ? "Saving card photo to server..."
                : "Saving profile photo to server...";
          toast.loading(loadingMsg, { id: `upload-${field}` });
        }
        try {
          const res = await updatePlayerMutation(backendPayload).unwrap();
          if (isClubField && res?.data) {
            dispatch(syncFromCvResponse(res.data));
          }
          if (isImageUpload) {
            if (res?.data) {
              dispatch(syncFromCvResponse(res.data));
            }
            await Promise.allSettled([refetchProfile(), refetchCv()]);
            const successMsg =
              field === "coverImage"
                ? "Cover photo updated successfully!"
                : field === "cardImage" || field === "cardPhoto"
                  ? "Card photo updated successfully!"
                  : "Profile photo updated successfully!";
            toast.success(successMsg, { id: `upload-${field}` });
          }
        } catch (err: any) {
          console.error(`Failed to patch field ${field}:`, err);
          if (isImageUpload) {
            const errorMsg =
              field === "coverImage"
                ? "Failed to upload cover photo. Please try again."
                : field === "cardImage" || field === "cardPhoto"
                  ? "Failed to upload card photo. Please try again."
                  : "Failed to upload profile photo. Please try again.";
            toast.error(err?.data?.message || errorMsg, { id: `upload-${field}` });
          } else {
            toast.error(err?.data?.message || "Failed to save changes. Please try again.");
          }
        }
      }
    },
    [dispatch, hasToken, isViewingSpecificPlayer, updatePlayerMutation, refetchProfile, refetchCv]
  );

  const handleAddClub = useCallback(
    async ({
      name,
      from,
      to,
      logoFile,
    }: {
      name: string;
      from: string;
      to: string;
      logoFile?: File | null;
      previewLogo?: string | null;
    }) => {
      const isCurrent = to.toLowerCase() === "present";

      if (!hasToken || isViewingSpecificPlayer) return;

      // Build FormData matching POST {{baseUrl}}/players/me/clubs:
      // - image: File object (the uploaded club logo)
      // - data: JSON string with single club object:
      //   { "clubName": "...", "name": "...", "from": "...", "to": "...", "isCurrent": true/false, "period": "..." }
      const formData = new FormData();
      if (logoFile instanceof File) {
        formData.append("image", logoFile);
      }

      const clubData = {
        clubName: name,
        from: String(from),
        to: String(to),
        period: `${from} - ${to}`,
        isCurrent,
      };

      formData.append("data", JSON.stringify(clubData));

      // Pure API call: UI updates via Tag invalidation / sync
      try {
        const response = await addPlayerClubMutation(formData).unwrap();
        if (response?.data) {
          dispatch(syncFromCvResponse(response.data));
        }
        await Promise.allSettled([refetchCv(), refetchProfile()]);
        return response;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.data?.errorSources?.[0]?.message ||
          err?.error ||
          err?.message ||
          "Failed to add club";
        console.warn("Failed to add club:", errorMsg);
        throw err;
      }
    },
    [addPlayerClubMutation, dispatch, hasToken, isViewingSpecificPlayer, refetchCv, refetchProfile]
  );

  const handleDeleteClub = useCallback(
    async (clubId: string) => {
      if (!hasToken || isViewingSpecificPlayer || !clubId) return;

      try {
        const response = await deletePlayerClubMutation(clubId).unwrap();
        if (response?.data) {
          dispatch(syncFromCvResponse(response.data));
        }
        await Promise.allSettled([refetchCv(), refetchProfile()]);
        return response;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.data?.errorSources?.[0]?.message ||
          err?.error ||
          err?.message ||
          "Failed to delete club";
        console.warn("Failed to delete club:", errorMsg);
        throw err;
      }
    },
    [deletePlayerClubMutation, dispatch, hasToken, isViewingSpecificPlayer, refetchCv, refetchProfile]
  );

  const handleUpdateClub = useCallback(
    async ({
      clubId,
      name,
      from,
      to,
      logoFile,
    }: {
      clubId: string;
      name: string;
      from: string;
      to: string;
      logoFile?: File | null;
    }) => {
      const cleanClubId = String(clubId || "").trim();
      if (!hasToken || isViewingSpecificPlayer || !cleanClubId) return;

      const isCurrent = String(to || "").trim().toLowerCase() === "present";
      const formattedTo = isCurrent ? "Present" : String(to);
      const formData = new FormData();
      if (logoFile instanceof File) {
        formData.append("image", logoFile);
      }

      const clubData = {
        clubName: name,
        from: String(from),
        to: formattedTo,
        isCurrent,
      };

      formData.append("data", JSON.stringify(clubData));

      try {
        const response = await updatePlayerClubMutation({ clubId: cleanClubId, data: formData }).unwrap();
        if (response?.data) {
          dispatch(syncFromCvResponse(response.data));
        }
        await Promise.allSettled([refetchCv(), refetchProfile()]);
        return response;
      } catch (err: any) {
        const errorMsg =
          err?.data?.message ||
          err?.data?.errorSources?.[0]?.message ||
          err?.error ||
          err?.message ||
          "Failed to update club";
        console.warn("Failed to update club:", errorMsg);
        throw err;
      }
    },
    [updatePlayerClubMutation, dispatch, hasToken, isViewingSpecificPlayer, refetchCv, refetchProfile]
  );

  const selectPlayer = (id: number) => {
    dispatch(setSelectedPlayerId(id));
  };

  const validatePlayer = (id: number) => {
    dispatch(validatePlayerCv(id));
    toast.success("Player CV successfully validated");
  };

  const handleCreatePlayer = (data: Partial<PlayerData>) => {
    dispatch(addPlayer(data));
    toast.success("Player added successfully");
  };

  return {
    dispatch,
    playerData: {
      ...playerData,
      coverImage: (cvResponse?.data as any)?.coverImage || (profileResponse?.data as any)?.coverImage || (playerData as any).coverImage || "",
      ...(cvResponse?.data?.isVerifiedByCoach !== undefined
        ? {
            isVerifiedByCoach: Boolean(cvResponse.data.isVerifiedByCoach),
            validationStatus: cvResponse.data.isVerifiedByCoach ? "verified" : "pending",
          }
        : {}),
    },
    players,
    selectedPlayerId,
    cvData: cvResponse?.data || profileResponse?.data || (playerData as any).cvData,
    profileData: profileResponse?.data,
    certificates:
      profileResponse?.data?.certificates ||
      profileResponse?.data?.documents ||
      cvResponse?.data?.certificates ||
      cvResponse?.data?.documents ||
      (playerData as any).certificates ||
      (playerData as any).documents ||
      [],
    isLoading: isCvLoading || isCvFetching || isProfileLoading || isProfileFetching,
    isUpdating,
    isAddingClub,
    isDeletingClub,
    isUpdatingClub,
    error: cvError || profileError,
    refetchCv,
    refetchProfile,
    handleUpdate,
    handleAddClub,
    handleDeleteClub,
    handleUpdateClub,
    updatePlayerProfile,
    updateSection,
    selectPlayer,
    validatePlayer,
    handleCreatePlayer,
  };
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { updateCoachField, syncFromCoachCvResponse } from "@/redux/features/coach/coachSlice";
import {
  useGetMyCoachCvQuery,
  useUpdateMyCoachProfileMutation,
} from "@/redux/features/coach/coachApi";
import { IUpdateCoachPayload } from "@/types/coach.type";
import { toast } from "sonner";
import { ALL_COACH_STYLES, COUNTRY_CODES } from "@/components/cvs/coach-cv-details/bio-components/constants";

const getCountryCode = (countryName?: string) => {
  if (!countryName) return undefined;
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  return code ? code.toUpperCase() : countryName.toUpperCase().slice(0, 2);
};

export const useCoach = () => {
  const dispatch = useAppDispatch();
  const coachData = useAppSelector((state) => state.coach);

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(localStorage.getItem("token") || localStorage.getItem("accessToken"));

  // 1. GET CV API: Fetch complete Coach CV from {{baseUrl}}/coaches/me/cv
  const {
    data: cvResponse,
    isLoading: isCvLoading,
    isFetching: isCvFetching,
    error: cvError,
    refetch: refetchCv,
  } = useGetMyCoachCvQuery(undefined, {
    skip: !hasToken,
  });

  // 2. PATCH Coach API: Update coach profile / CV from {{baseUrl}}/coaches/me
  const [updateCoachMutation, { isLoading: isUpdating }] = useUpdateMyCoachProfileMutation();

  // Sync API data into Redux coach state whenever API responds
  useEffect(() => {
    if (cvResponse?.data) {
      dispatch(syncFromCoachCvResponse(cvResponse.data));
    }
  }, [cvResponse, dispatch]);

  // Update whole section or partial payload via PATCH /coaches/me
  const updateCoachProfile = useCallback(
    async (payload: FormData | Partial<IUpdateCoachPayload> | any) => {
      try {
        const response = await updateCoachMutation(payload).unwrap();
        if (response?.data) {
          dispatch(syncFromCoachCvResponse(response.data));
        }
        return response;
      } catch (err: any) {
        console.error("Failed to update coach:", err);
        throw err;
      }
    },
    [updateCoachMutation, dispatch]
  );

  // Field-based update handler with automatic mapping to backend PATCH payload
  const handleUpdate = useCallback(
    async (field: string, value: any, file?: File) => {
      // 1. Optimistically update local redux state
      dispatch(updateCoachField({ field, value }));
      if (field === "coachImage") {
        dispatch(updateCoachField({ field: "profileImage", value }));
      }
      if (field === "profileImage") {
        dispatch(updateCoachField({ field: "coachImage", value }));
      }

      if (!hasToken) return;

      const imageFile = file instanceof File ? file : (value instanceof File ? value : null);
      if (imageFile && (field === "coachImage" || field === "profileImage")) {
        try {
          const formData = new FormData();
          formData.append("profileImage", imageFile);
          formData.append("data", JSON.stringify({}));
          await updateCoachMutation(formData).unwrap();
          toast.success("Profile image updated successfully");
        } catch (err: any) {
          console.error(`Failed to patch coach profileImage:`, err);
          toast.error("Failed to update profile image");
        }
        return;
      }

      if (imageFile && (field === "coverImage")) {
        try {
          const formData = new FormData();
          formData.append("coverImage", imageFile);
          formData.append("data", JSON.stringify({}));
          await updateCoachMutation(formData).unwrap();
          toast.success("Cover image updated successfully");
        } catch (err: any) {
          console.error(`Failed to patch coach coverImage:`, err);
          toast.error("Failed to update cover image");
        }
        return;
      }

      if (imageFile && (field === "cardImage" || field === "cardPhoto")) {
        try {
          const formData = new FormData();
          formData.append("cardImage", imageFile);
          formData.append("cardPhoto", imageFile);
          formData.append("data", JSON.stringify({}));
          await updateCoachMutation(formData).unwrap();
          toast.success("Card image updated successfully");
        } catch (err: any) {
          console.error(`Failed to patch coach cardImage:`, err);
          toast.error("Failed to update card image");
        }
        return;
      }

      let backendPayload: Partial<IUpdateCoachPayload> | null = null;

      switch (field) {
        case "overallRatingScore":
          backendPayload = { overallRatingScore: Number(value) };
          break;
        case "fullName":
        case "dob":
        case "dateOfBirth":
        case "age":
        case "birthCountry":
        case "dualNationality": {
          const currentFullName = field === "fullName" ? String(value) : (coachData.fullName || "");
          const currentDob = (field === "dob" || field === "dateOfBirth") ? String(value) : (coachData.dob || "");
          const currentAge = field === "age" ? Number(value) : (Number(coachData.age) || undefined);
          const currentBirthCountry = field === "birthCountry" ? String(value) : (coachData.birthCountry || "");
          const currentDual = field === "dualNationality" ? String(value) : (coachData.dualNationality || "");

          backendPayload = {
            fullName: currentFullName,
            personalInformation: {
              fullName: currentFullName,
              dateOfBirth: currentDob,
              age: currentAge,
              birthCountry: currentBirthCountry,
              birthCountryFlag: getCountryCode(currentBirthCountry),
              dualNationality: currentDual,
              dualNationalityFlag: getCountryCode(currentDual),
            },
          };
          break;
        }
        case "email":
        case "phone":
        case "location":
        case "website":
          backendPayload = {
            contact: {
              email: field === "email" ? String(value) : (coachData.email || ""),
              phone: field === "phone" ? String(value) : (coachData.phone || ""),
              location: field === "location" ? String(value) : (coachData.location || ""),
              website: field === "website" ? String(value) : (coachData.website || ""),
            },
          };
          break;
        case "coachType": {
          const strVal = String(value);
          if (strVal === "INDIVIDUAL_COACH" || strVal === "CLUB_COACH") {
            // Local client-side toggle between Individual Coach and Club Coach
            backendPayload = null;
          } else {
            // If selecting a coaching role (e.g. "Head Coach"), save to backend as title
            backendPayload = { title: strVal };
          }
          break;
        }
        case "title":
          backendPayload = { title: String(value) };
          break;
        case "currentClub":
          backendPayload = { currentClub: String(value) };
          break;
        case "yearsExperience":
          backendPayload = { yearsExperience: Number(value) || 0 };
          break;
        case "speciality":
          backendPayload = { speciality: String(value) };
          break;
        case "licenseStatus":
          backendPayload = { licenseStatus: String(value) };
          break;
        case "status":
          backendPayload = { status: String(value) };
          break;
        case "seasonStats":
        case "seasonStats.matches":
        case "seasonStats.wins":
        case "seasonStats.losses":
        case "seasonStats.draws":
        case "matchesCoached":
        case "totalWins":
        case "losses":
        case "draws":
        case "cleanSheets":
          backendPayload = {
            seasonStats: {
              matchesCoached: field === "seasonStats.matches" || field === "matchesCoached" ? Number(value) : (coachData.seasonStats?.matches ?? 0),
              totalWins: field === "seasonStats.wins" || field === "totalWins" ? Number(value) : (coachData.seasonStats?.wins ?? 0),
              losses: field === "seasonStats.losses" || field === "losses" ? Number(value) : (coachData.seasonStats?.losses ?? 0),
              draws: field === "seasonStats.draws" || field === "draws" ? Number(value) : (coachData.seasonStats?.draws ?? 0),
              cleanSheets: field === "cleanSheets" ? Number(value) : (coachData.seasonStats?.cleanSheets ?? 0),
            },
          };
          break;
        case "transferStatus":
        case "contractUntil":
        case "agent":
        case "agency":
        case "salary":
        case "statusBadge":
        case "footballAgentContract":
          backendPayload = {
            transferStatus: {
              footballAgentContract: field === "footballAgentContract" ? String(value) : "No",
              contractUntil: field === "contractUntil" ? String(value) : (coachData.contractUntil || "June, 2026"),
              agent: field === "agent" ? String(value) : (coachData.agent || ""),
              agency: field === "agency" ? String(value) : (coachData.agency || ""),
              salary: field === "salary" ? String(value) : (coachData.salary || ""),
              statusBadge: field === "statusBadge" ? String(value) : (coachData.statusBadge || "Active"),
            },
          };
          break;
        case "languages":
          backendPayload = {
            languages: Array.isArray(value)
              ? value.map((l: any) => ({
                  language: l.name || l.language || "",
                  proficiency: (l.level || l.proficiency || "FLUENT").toUpperCase(),
                }))
              : value,
          };
          break;
        case "selectedStyleIds":
        case "coachStyles":
          backendPayload = {
            coachStyles: Array.isArray(value)
              ? value.map((s: string) => {
                  const found = ALL_COACH_STYLES.find((item) => item.id === s.toLowerCase());
                  return found ? found.label.toUpperCase() : s.toUpperCase();
                })
              : value,
          };
          break;
        case "clubs":
        case "clubHistory":
          backendPayload = {
            clubHistory: Array.isArray(value)
              ? value.map((c: any) => ({
                  clubName: c.name || c.clubName || "",
                  role: c.role || "Coach",
                  period: c.period || `${c.from || "2020"} - ${c.to || "Present"}`,
                  startYear: parseInt(c.from) || c.startYear || undefined,
                  endYear: c.to === "Present" ? undefined : parseInt(c.to) || c.endYear || undefined,
                  isCurrent: c.isCurrent ?? (c.to === "Present" || String(c.period || "").includes("Present")),
                  logoUrl: typeof c.logo === "string" && c.logo.startsWith("http") ? c.logo : undefined,
                }))
              : value,
          };
          break;
        case "qualifications":
        case "accomplishments":
          backendPayload = {
            accomplishments: Array.isArray(value)
              ? value.map((a: any) => ({
                  text: a.text || String(a),
                }))
              : value,
          };
          break;
        case "keySkills":
          backendPayload = {
            keySkills: Array.isArray(value)
              ? value.map((k: any) => ({
                  name: k.text || k.name || "",
                  icon: k.icon || "star",
                }))
              : value,
          };
          break;
        case "majorTrophies":
          backendPayload = {
            majorTrophies: Array.isArray(value)
              ? value.map((t: any) => ({
                  title: t.name || t.title || "",
                  count: Number(t.count) || 1,
                  year: Number(t.year) || undefined,
                }))
              : value,
          };
          break;
        case "cupHistory":
        case "cupsPlayed":
          backendPayload = {
            cupsPlayed: Array.isArray(value)
              ? value.map((item: any) => {
                  if (typeof item === "string") {
                    const parts = item.split("-").map((s) => s.trim());
                    return {
                      year: parseInt(parts[0]) || 2021,
                      tournament: parts.slice(1).join(" - ") || item,
                    };
                  }
                  return item;
                })
              : value,
          };
          break;
        case "courses":
        case "complementaryCourses":
          backendPayload = {
            courses: Array.isArray(value)
              ? value.map((c: any) => {
                  const title = c.title || c.name || "";
                  const category = c.category || (title.includes("Licence") ? "Licence" : title.includes("Analysis") ? "Analysis" : "Certificate");
                  return {
                    name: title,
                    category,
                    isCompleted: c.isCompleted ?? true,
                    isSelected: c.isSelected ?? true,
                  };
                })
              : value,
          };
          break;
        case "associations":
          backendPayload = {
            associations: Array.isArray(value)
              ? value.map((a: any) => ({
                  name: a.name,
                  code: a.code || a.name,
                  isSelected: a.isSelected ?? true,
                }))
              : value,
          };
          break;
        case "formationMarkers":
        case "formations":
          if (Array.isArray(value)) {
            backendPayload = {
              formations: value.map((slotPins: any[], idx: number) => ({
                formationSlot: idx + 1,
                positions: (slotPins || []).map((p: any, pIdx: number) => ({
                  id: p.id ? String(p.id) : `pin-${pIdx + 1}`,
                  x: Math.round(p.x),
                  y: Math.round(p.y),
                })),
              })),
            };
          }
          break;
        default:
          backendPayload = null;
          break;
      }

      if (backendPayload) {
        try {
          await updateCoachMutation(backendPayload).unwrap();
        } catch (err: any) {
          const message = err?.data?.message || err?.message || "Failed to save changes. Please try again.";
          console.warn(`Failed to patch coach field ${field}:`, message);
          toast.error(message);
        }
      }
    },
    [dispatch, hasToken, coachData, updateCoachMutation]
  );

  return {
    dispatch,
    coachData,
    cvData: cvResponse?.data || coachData.cvData,
    assignedPlayerReviews: cvResponse?.data?.assignedPlayerReviews || coachData.assignedPlayerReviews || [],
    isLoading: isCvLoading || isCvFetching,
    isUpdating,
    error: cvError,
    refetchCv,
    handleUpdate,
    updateCoachProfile,
  };
};

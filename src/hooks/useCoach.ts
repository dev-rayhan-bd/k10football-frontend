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
    async (field: string, value: any) => {
      // 1. Optimistically update local redux state
      dispatch(updateCoachField({ field, value }));

      if (!hasToken) return;

      let backendPayload: Partial<IUpdateCoachPayload> | null = null;

      switch (field) {
        case "fullName":
          backendPayload = {
            fullName: String(value),
            personalInformation: {
              fullName: String(value),
              dateOfBirth: coachData.dob,
              age: Number(coachData.age) || undefined,
              birthCountry: coachData.birthCountry,
              dualNationality: coachData.dualNationality,
            },
          };
          break;
        case "dob":
        case "dateOfBirth":
          backendPayload = {
            personalInformation: {
              fullName: coachData.fullName,
              dateOfBirth: String(value),
              age: Number(coachData.age) || undefined,
              birthCountry: coachData.birthCountry,
              dualNationality: coachData.dualNationality,
            },
          };
          break;
        case "birthCountry":
          backendPayload = {
            personalInformation: {
              fullName: coachData.fullName,
              dateOfBirth: coachData.dob,
              age: Number(coachData.age) || undefined,
              birthCountry: String(value),
              dualNationality: coachData.dualNationality,
            },
          };
          break;
        case "dualNationality":
          backendPayload = {
            personalInformation: {
              fullName: coachData.fullName,
              dateOfBirth: coachData.dob,
              age: Number(coachData.age) || undefined,
              birthCountry: coachData.birthCountry,
              dualNationality: String(value),
            },
          };
          break;
        case "email":
          backendPayload = {
            contact: {
              email: String(value),
              phone: coachData.phone,
              location: coachData.location,
              website: coachData.website,
            },
          };
          break;
        case "phone":
          backendPayload = {
            contact: {
              email: coachData.email,
              phone: String(value),
              location: coachData.location,
              website: coachData.website,
            },
          };
          break;
        case "location":
          backendPayload = {
            contact: {
              email: coachData.email,
              phone: coachData.phone,
              location: String(value),
              website: coachData.website,
            },
          };
          break;
        case "website":
          backendPayload = {
            contact: {
              email: coachData.email,
              phone: coachData.phone,
              location: coachData.location,
              website: String(value),
            },
          };
          break;
        case "coachType":
          backendPayload = { coachType: String(value) };
          break;
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
        case "languages":
          backendPayload = {
            languages: Array.isArray(value)
              ? value.map((l: any) => ({
                  language: l.name || l.language || "",
                  proficiency: l.level || l.proficiency || "FLUENT",
                }))
              : value,
          };
          break;
        case "selectedStyleIds":
        case "coachStyles":
          backendPayload = {
            coachStyles: Array.isArray(value)
              ? value.map((s: string) => s.toUpperCase().replace(/-/g, "_"))
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
              ? value.map((c: any) => ({
                  name: c.title || c.name || "",
                  category: c.category || "Certificate",
                  isCompleted: c.isCompleted ?? true,
                  isSelected: c.isSelected ?? true,
                }))
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
          // Map formationMarkers [[pins1], [pins2], [pins3]] into formations payload
          if (Array.isArray(value)) {
            backendPayload = {
              formations: value.map((slotPins: any[], idx: number) => ({
                formationSlot: idx + 1,
                formationName: `FORMATION ${idx + 1}`,
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
          console.error(`Failed to patch coach field ${field}:`, err);
          toast.error(err?.data?.message || "Failed to save changes. Please try again.");
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

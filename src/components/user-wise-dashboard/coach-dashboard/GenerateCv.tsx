/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import {
  IconDownload,
  IconClock,
  IconPhone,
  IconMail,
  IconShield,
  IconShare,
  IconUserCheck,
  IconLoader2,
  IconCamera,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import FullEditableCv from "@/components/cvs/coach-cv-details/FullEditableCv";
import { useCoach } from "@/hooks/useCoach";
import { usePlayerStats } from "@/components/cvs/player-cv-details/FullEditablePage";
import { usePlayer } from "@/hooks/usePlayer";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useGetMyCoachCvQuery } from "@/redux/features/coach/coachApi";
import { syncFromCoachCvResponse, updateCoachField } from "@/redux/features/coach/coachSlice";
import { cn } from "@/lib/utils";
import { domPagesToPdf } from "@/lib/pdf/domToPdf";

const COUNTRY_CODES: Record<string, string> = {
  "afghanistan": "af", "albania": "al", "algeria": "dz", "andorra": "ad", "angola": "ao",
  "antigua and barbuda": "ag", "argentina": "ar", "armenia": "am", "australia": "au",
  "austria": "at", "azerbaijan": "az", "bahamas": "bs", "bahrain": "bh", "bangladesh": "bd",
  "barbados": "bb", "belarus": "by", "belgium": "be", "belize": "bz", "benin": "bj",
  "bhutan": "bt", "bolivia": "bo", "bosnia and herzegovina": "ba", "botswana": "bw",
  "brazil": "br", "brunei": "bn", "bulgaria": "bg", "burkina faso": "bf", "burundi": "bi",
  "cambodia": "kh", "cameroon": "cm", "canada": "ca", "cape verde": "cv",
  "central african republic": "cf", "chad": "td", "chile": "cl", "china": "cn",
  "colombia": "co", "comoros": "km", "congo": "cg", "costa rica": "cr", "croatia": "hr",
  "cuba": "cu", "cyprus": "cy", "czech republic": "cz", "denmark": "dk", "djibouti": "dj",
  "dominica": "dm", "dominican republic": "do", "ecuador": "ec", "egypt": "eg",
  "el salvador": "sv", "equatorial guinea": "gq", "eritrea": "er", "estonia": "ee",
  "ethiopia": "et", "fiji": "fj", "finland": "fi", "france": "fr", "gabon": "ga",
  "gambia": "gm", "georgia": "ge", "germany": "de", "ghana": "gh", "greece": "gr",
  "grenada": "gd", "guatemala": "gt", "guinea": "gn", "guinea-bissau": "gw",
  "guyana": "gy", "haiti": "ht", "honduras": "hn", "hungary": "hu", "iceland": "is",
  "india": "in", "indonesia": "id", "iran": "ir", "iraq": "iq", "ireland": "ie",
  "israel": "il", "italy": "it", "jamaica": "jm", "japan": "jp", "jordan": "jo",
  "kazakhstan": "kz", "kenya": "ke", "kiribati": "ki", "korea, north": "kp",
  "korea, south": "kr", "kuwait": "kw", "kyrgyzstan": "kg", "laos": "la", "latvia": "lv",
  "lebanon": "lb", "lesotho": "ls", "liberia": "lr", "libya": "ly", "liechtenstein": "li",
  "lithuania": "lt", "luxembourg": "lu", "macedonia": "mk", "madagascar": "mg",
  "malawi": "mw", "malaysia": "my", "maldives": "mv", "mali": "ml", "malta": "mt",
  "marshall islands": "mh", "mauritania": "mr", "mauritius": "mu", "mexico": "mx",
  "micronesia": "fm", "moldova": "md", "monaco": "mc", "mongolia": "mn", "montenegro": "me",
  "morocco": "ma", "mozambique": "mz", "myanmar": "mm", "namibia": "na", "nauru": "nr",
  "nepal": "np", "netherlands": "nl", "new zealand": "nz", "nicaragua": "ni",
  "niger": "ne", "nigeria": "ng", "norway": "no", "oman": "om", "pakistan": "pk",
  "palau": "pw", "panama": "pa", "papua new guinea": "pg", "paraguay": "py", "peru": "pe",
  "philippines": "ph", "poland": "pl", "portugal": "pt", "qatar": "qa", "romania": "ro",
  "russia": "ru", "rwanda": "rw", "saint kitts and nevis": "kn", "saint lucia": "lc",
  "saint vincent and the grenadines": "vc", "samoa": "ws", "san marino": "sm",
  "sao tome and principe": "st", "saudi arabia": "sa", "senegal": "sn", "serbia": "rs",
  "seychelles": "sc", "sierra leone": "sl", "singapore": "sg", "slovakia": "sk",
  "slovenia": "si", "solomon islands": "sb", "somalia": "so", "south africa": "za",
  "spain": "es", "sri lanka": "lk", "sudan": "sd", "suriname": "sr", "swaziland": "sz",
  "sweden": "se", "switzerland": "ch", "syria": "sy", "taiwan": "tw", "tajikistan": "tj",
  "tanzania": "tz", "thailand": "th", "timor-leste": "tl", "togo": "tg", "tonga": "to",
  "trinidad and tobago": "tt", "tunisia": "tn", "turkey": "tr", "turkmenistan": "tm",
  "tuvalu": "tv", "uganda": "ug", "ukraine": "ua", "united arab emirates": "ae",
  "united kingdom": "gb", "united states": "us", "uruguay": "uy", "uzbekistan": "uz",
  "vanuatu": "vu", "vatican city": "va", "venezuela": "ve", "vietnam": "vn", "yemen": "ye",
  "zambia": "zm", "zimbabwe": "zw"
};

const getFlagUrl = (countryName?: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  if (!code) return "";
  return `https://flagcdn.com/w160/${code}.png`;
};

const MAX_VALIDATIONS_PREVIEW = 3;

const GenerateCvCoach = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // 1. Fetch live Coach CV directly via RTK Query
  const {
    data: cvResponse,
    isLoading: isCvLoading,
    isFetching: isCvFetching,
  } = useGetMyCoachCvQuery();
  const cv = cvResponse?.data;

  // 2. Redux Coach State
  const { coachData, assignedPlayerReviews, isUpdating, updateCoachProfile } = useCoach();
  const { players, selectPlayer } = usePlayer();
  const [role, setRole] = useState<string>("coach");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isProfileImgLoaded, setIsProfileImgLoaded] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsProfileImgLoaded(false);
  }, [coachData.profileImage, coachData.coachImage]);

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image size must be less than 10MB");
      return;
    }

    setIsUploadingCover(true);
    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch(updateCoachField({ field: "coverImage", value: reader.result as string }));
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      formData.append("data", JSON.stringify({}));
      await updateCoachProfile(formData);
    } catch (err: any) {
      console.error("Cover image upload failed:", err);
    } finally {
      setIsUploadingCover(false);
      if (coverFileInputRef.current) {
        coverFileInputRef.current.value = "";
      }
    }
  };

  // Sync API response to Redux so all child sub-sections inherit live data
  useEffect(() => {
    if (cv) {
      dispatch(syncFromCoachCvResponse(cv));
    }
  }, [cv, dispatch]);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole") || "coach";
    setRole(userRole);
  }, []);

  // Compute values prioritizing live API data, then Redux state
  const overallRating =
    cv?.overallRatingScore !== undefined
      ? cv.overallRatingScore
      : (coachData.overallRatingScore ?? 0);

  const statusBadge =
    cv?.status ||
    cv?.transferStatus?.statusBadge ||
    coachData.statusBadge ||
    coachData.status ||
    "ACTIVE";

  const fullName =
    cv?.fullName ||
    cv?.personalInformation?.fullName ||
    coachData.fullName ||
    "Coach";

  const title =
    cv?.title ||
    (cv?.coachType ? cv.coachType.replace(/_/g, " ") : "") ||
    coachData.title ||
    "Coach";

  const yearsExperience =
    cv?.yearsExperience !== undefined
      ? cv.yearsExperience
      : coachData.yearsExperience;

  const experienceText =
    yearsExperience !== undefined && yearsExperience !== null && yearsExperience > 0
      ? `${yearsExperience}+ Years Experience`
      : yearsExperience === 0
      ? "0 Years Experience"
      : "15+ Years Experience";

  const birthCountry =
    cv?.personalInformation?.birthCountry || coachData.birthCountry || "";
  const flagUrl = getFlagUrl(birthCountry);

  const currentClub =
    cv?.currentClub ||
    coachData.currentClub ||
    coachData.clubs?.[0]?.name ||
    "Not specified";

  const contactPhone = cv?.contact?.phone || coachData.phone || "N/A";

  const validationStatus =
    cv?.validationStatus ||
    cv?.licenseStatus ||
    (cv?.revalidationRequested ? "Re-validation Requested" : "") ||
    coachData.validationStatus ||
    "UEFA A License";

  const contactEmail = cv?.contact?.email || coachData.email || "N/A";

  const completionPercentage =
    cv?.profileCompletion ??
    cv?.completionPercentage ??
    coachData.profileCompletion ??
    coachData.completionPercentage ??
    0;

  const tierLabel =
    cv?.tierStatus?.label ||
    coachData.tierStatus?.label ||
    "COMPLETE ALL MANDATORY SECTIONS TO UNLOCK TIER STATUS";

  const cvTier = (
    cv?.cvTier ||
    cv?.tierStatus?.currentTier ||
    coachData.cvTier ||
    coachData.tierStatus?.currentTier ||
    "BRONZE"
  ).toUpperCase();

  const assignedReviews =
    cv?.assignedPlayerReviews && cv.assignedPlayerReviews.length > 0
      ? cv.assignedPlayerReviews
      : assignedPlayerReviews && assignedPlayerReviews.length > 0
      ? assignedPlayerReviews
      : [];

  // Filter players who need validation (fallback)
  const validationNeededPlayers = players.filter((player) => {
    return (
      player.validationStatus === "pending" ||
      player.validationStatus === "expired" ||
      player.requestedValidation ||
      (player.assignedMonthsAgo &&
        player.assignedMonthsAgo >= 3 &&
        player.validationStatus !== "verified")
    );
  });

  // The validations card shares a row with Completion Status and Tier; showing
  // only a preview keeps that row compact (the full list is one click away).
  const validationsTotal =
    assignedReviews.length > 0 ? assignedReviews.length : validationNeededPlayers.length;

  const getValidationReason = (player: any) => {
    if (player.requestedValidation) return "Requested";
    if (player.validationStatus === "expired") return "Expired";
    if (player.assignedMonthsAgo && player.assignedMonthsAgo >= 3)
      return "Assigned > 3M";
    return "Pending";
  };

  // Exports the CV exactly as it looks on screen: one PDF page per
  // `data-cv-pdf-page` group in FullEditableCv (same exporter as the player CV).
  //  1) personal info, photo, styles, stats  2) clubs & courses
  //  3) formations & testimonials           4) documents, images/videos (3 each), story
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const generateProfessionalPDF = async () => {
    if (isExportingPdf) return;
    const pages = [1, 2, 3, 4]
      .map((n) => document.querySelector<HTMLElement>(`[data-cv-pdf-page="${n}"]`))
      .filter((el): el is HTMLElement => Boolean(el));
    if (pages.length !== 4) {
      toast.error("The CV is still loading. Please try again in a moment.");
      return;
    }
    setIsExportingPdf(true);
    const toastId = toast.loading("Generating CV PDF... Please wait.");
    try {
      const displayName = (fullName || "Coach").trim();
      const safeName = displayName.replace(/\s+/g, "_");
      await domPagesToPdf({
        pages,
        fileName: `CV_${safeName}.pdf`,
        footer: (page, total) => `${displayName} - Coach CV - Page ${page} of ${total}`,
      });
      toast.success("CV PDF downloaded.", { id: toastId });
    } catch (err) {
      console.error("Coach CV PDF export failed:", err);
      toast.error("Failed to generate the CV PDF. Please try again.", { id: toastId });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 print:hidden">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">
            Generate CV
          </h1>
          <p className="text-white/60 font-medium mt-1 md:mt-2 text-sm md:text-lg">
            My Professional Coaching Profile
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {isCvFetching && !isCvLoading && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <IconLoader2 className="animate-spin size-4 text-[#E31B23]" />
              <span>Syncing CV...</span>
            </div>
          )}
          <Button
            onClick={generateProfessionalPDF}
            disabled={isExportingPdf}
            className="w-full md:w-auto bg-[#222222] hover:bg-[#333333] text-white border border-white/5 gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] h-auto cursor-pointer"
          >
            {isExportingPdf ? <IconLoader2 size={18} className="animate-spin" /> : <IconDownload size={18} />}
            {isExportingPdf ? "Generating PDF..." : "Download CV PDF"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Personal Information Hero */}
        <section className="bg-[#111111] rounded-3xl border border-white/10 p-4 md:p-8 flex flex-col gap-8">
          <div className="relative rounded-3xl overflow-hidden min-h-100 md:min-h-140 border border-white/10 group flex flex-col justify-end">
            {/* Cover Image or Skeleton */}
            {isCvLoading || isUploadingCover ? (
              <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center">
                <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                  <IconLoader2 className="size-4 animate-spin text-[#E31B23]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">
                    {isUploadingCover ? "Uploading Cover..." : "Loading Cover..."}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${coachData.coverImage || "/stadium-night.jpg"}')`,
                }}
              />
            )}
            <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/40 via-45% to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

            {/* Cover Image Upload Button */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 print:hidden">
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={isUploadingCover || isCvLoading}
                className="flex items-center gap-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] md:text-xs font-bold px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-white/20 hover:border-white/40 transition-all shadow-xl cursor-pointer"
              >
                {isUploadingCover ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin text-[#E31B23]" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <IconCamera className="size-4 text-white" />
                    <span>Change Cover</span>
                  </>
                )}
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </div>
            {/* Profile Image Standing Cutout or Skeleton */}
            <div className="absolute right-0 bottom-0 h-full w-[70%] p-8 md:w-[40%] flex items-end justify-center pointer-events-none opacity-60 md:opacity-100">
              {isCvLoading || isUpdating ? (
                <div className="h-[80%] md:h-[95%] w-36 sm:w-48 md:w-56 bg-white/5 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/10 mb-2">
                  <IconLoader2 className="size-6 animate-spin text-[#E31B23]" />
                  <span className="text-[10px] text-white/60 font-black uppercase tracking-widest text-center px-2">
                    {isUpdating ? "Updating Photo..." : "Loading Coach..."}
                  </span>
                </div>
              ) : (
                <div className="relative h-[90%] md:h-[105%] w-full flex items-end justify-center">
                  {!isProfileImgLoaded && (
                    <div className="absolute inset-0 m-auto h-[90%] w-36 sm:w-48 md:w-56 bg-white/5 animate-pulse rounded-2xl flex items-center justify-center border border-white/10">
                      <IconLoader2 className="size-6 animate-spin text-[#E31B23]" />
                    </div>
                  )}
                  <Image
                    src={
                      coachData.profileImage ||
                      coachData.coachImage?.src ||
                      coachData.coachImage ||
                      "/coach-image.png"
                    }
                    alt={fullName}
                    width={400}
                    height={500}
                    onLoad={() => setIsProfileImgLoaded(true)}
                    className={cn(
                      "h-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-opacity duration-300",
                      isProfileImgLoaded ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              )}
            </div>
            <div className="relative p-6 md:p-10 w-full flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <div className="size-20 md:size-24 rounded-full border-4 border-gold bg-gold/80 flex items-center justify-center backdrop-blur-2xl shadow-2xl">
                  <span className="text-3xl md:text-4xl font-black text-white font-orbitron">
                    {overallRating}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-[#E31B23] border border-[#E31B23]/20 px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase w-fit tracking-[0.2em] shadow-[0_0_20px_rgba(227,27,35,0.3)]">
                    {statusBadge}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-6xl font-black text-white font-orbitron uppercase tracking-tighter leading-none">
                      {fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] pt-1">
                      <span className="text-[#E31B23]">{title}</span>
                      <span className="text-white/20 hidden md:inline">/</span>
                      <span className="text-white">{experienceText}</span>
                      {birthCountry ? (
                        <>
                          <span className="text-white/20 hidden md:inline">/</span>
                          <span className="flex items-center gap-2 text-white">
                            {flagUrl && (
                              <Image
                                src={flagUrl}
                                alt={birthCountry}
                                width={20}
                                height={14}
                                className="w-4 h-3 md:w-5 md:h-3.5 object-cover rounded-sm shadow-sm"
                              />
                            )}
                            {birthCountry}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Info Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 lg:gap-x-12 gap-y-4 md:gap-y-6 pt-4 md:pt-8 w-full p-0 md:p-6 rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="p-2 md:p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 shrink-0">
                    <IconShield size={16} className="md:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">
                      Current Club
                    </p>
                    <p className="text-xs md:text-sm font-bold text-white truncate">
                      {currentClub}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="p-2 md:p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 shrink-0">
                    <IconPhone size={16} className="md:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">
                      Contact
                    </p>
                    <p className="text-xs md:text-sm font-bold text-white truncate">
                      {contactPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="p-2 md:p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 shrink-0">
                    <IconClock size={16} className="md:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">
                      Validation Status
                    </p>
                    <p className="text-xs md:text-sm font-bold text-[#FBBF24] truncate">
                      {validationStatus}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="p-2 md:p-3 bg-white/5 rounded-xl border border-white/10 text-white/40 shrink-0">
                    <IconMail size={16} className="md:size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] md:text-[10px] text-white/40 uppercase font-black tracking-widest truncate">
                      Email
                    </p>
                    <p className="text-xs md:text-sm font-bold text-white truncate">
                      {contactEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
          {/* Completion Status */}
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-8 flex flex-col gap-6">
            <h3 className="text-sm font-black text-white font-orbitron uppercase tracking-widest">
              Completion Status
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <span className="text-5xl font-black text-[#E31B23] font-orbitron">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, completionPercentage))}%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-wider">
                {tierLabel}
              </p>
            </div>
          </div>

          {/* Tier Status */}
          <div className="bg-[#111111] rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col gap-4 md:gap-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 size-32 bg-[#FBBF24]/10 blur-3xl rounded-full" />
            <div className="flex flex-col">
              <h3 className="text-2xl md:text-3xl font-black text-[#FBBF24] font-orbitron italic tracking-tighter leading-none">
                {cvTier}
              </h3>
              <div className="w-full h-1 bg-[#FBBF24] mt-2 opacity-50" />
            </div>
            <p className="text-[9px] md:text-[10px] text-white/60 font-bold leading-relaxed uppercase tracking-wider mt-0 md:mt-2">
              Your CV meets {cvTier} standards and is ready to share with top clubs and agents.
            </p>
            <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 gap-2 w-full py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] h-auto mt-auto cursor-pointer">
              <IconShare size={16} className="text-white/40" /> Request Re-validation
            </Button>
          </div>

          {/* Player CV Validations */}
          <section className="p-6 rounded-2xl border border-white/20 bg-[#0D0D0D]">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-[#E31B23]/10 text-[#E31B23]">
                <IconUserCheck size={20} />
              </div>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                Player CV Validations
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {assignedReviews && assignedReviews.length > 0 ? (
                assignedReviews.slice(0, MAX_VALIDATIONS_PREVIEW).map((review: any, idx: number) => (
                  <div
                    key={review._id || review.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-[#E31B23]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Image
                        width={100}
                        height={100}
                        src={review.playerAvatar || "/avatar-placeholder.png"}
                        className="size-10 rounded-full object-cover border border-white/10 shrink-0"
                        alt={review.playerName || "Player"}
                      />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {review.playerName || "Player"}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest truncate">
                            {review.playerPosition || "Player"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap bg-blue-500/10 text-blue-400 border-blue-500/20">
                            {review.status || "Requested"}
                          </span>
                          {review.amount && (
                            <span className="text-[8px] text-white/60 font-medium">
                              {review.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                      {Number(review.rating) > 0 && (
                        <div className="text-base sm:text-lg font-black text-white italic">
                          {review.rating}
                        </div>
                      )}
                      <button
                        onClick={() => {
                          router.push("/dashboard/coach/player-cv-validations");
                        }}
                        className="px-2 sm:px-3 py-1.5 bg-[#E31B23] hover:bg-[#ff2d35] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-[#E31B23]/50 cursor-pointer"
                      >
                        {review.action || "Review"}
                      </button>
                    </div>
                  </div>
                ))
              ) : validationNeededPlayers.length > 0 ? (
                validationNeededPlayers.slice(0, MAX_VALIDATIONS_PREVIEW).map((player) => {
                  const reason = getValidationReason(player);
                  const reasonColors =
                    reason === "Requested"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : reason === "Expired"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20";
                  return (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 group hover:border-[#E31B23]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Image
                          width={100}
                          height={100}
                          src={player.playerImage}
                          className="size-10 rounded-full object-cover border border-white/10 shrink-0"
                          alt={player.fullName}
                        />
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-bold text-white truncate">
                            {player.fullName}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5">
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest truncate">
                              {player.position}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap ${reasonColors}`}
                            >
                              {reason}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                        {Number(player.rating) > 0 && (
                          <div className="text-base sm:text-lg font-black text-white italic">
                            {player.rating}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            selectPlayer(player.id);
                            router.push("/cvs/player-cv-details");
                          }}
                          className="px-2 sm:px-3 py-1.5 bg-[#E31B23] hover:bg-[#ff2d35] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-[#E31B23]/50 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs text-white/40 uppercase tracking-wider font-bold">
                  All Player CVs Validated
                </div>
              )}
              {validationsTotal > MAX_VALIDATIONS_PREVIEW && (
                <button
                  type="button"
                  onClick={() => router.push("/dashboard/coach/player-cv-validations")}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  View all ({validationsTotal})
                </button>
              )}
            </div>
          </section>
        </div>

        <FullEditableCv editable={true} />
      </div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GenerateCvCoach;

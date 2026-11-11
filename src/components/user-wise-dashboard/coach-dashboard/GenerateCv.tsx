/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  IconDownload,
  IconClock,
  IconPhone,
  IconMail,
  IconShield,
  IconShare,
  IconUserCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import FullEditableCv from "@/components/cvs/coach-cv-details/FullEditableCv";
import { useCoach } from "@/hooks/useCoach";
import { usePlayerStats } from "@/components/cvs/player-cv-details/FullEditablePage";
import { usePlayer } from "@/hooks/usePlayer";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useGetMyCoachCvQuery } from "@/redux/features/coach/coachApi";
import { syncFromCoachCvResponse } from "@/redux/features/coach/coachSlice";

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
  const { coachData, assignedPlayerReviews } = useCoach();
  const { players, selectPlayer } = usePlayer();
  const [role, setRole] = useState<string>("coach");

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
  const validationNeededPlayers = players
    .filter((player) => {
      return (
        player.validationStatus === "pending" ||
        player.validationStatus === "expired" ||
        player.requestedValidation ||
        (player.assignedMonthsAgo &&
          player.assignedMonthsAgo >= 3 &&
          player.validationStatus !== "verified")
      );
    })
    .slice(0, 3);

  const getValidationReason = (player: any) => {
    if (player.requestedValidation) return "Requested";
    if (player.validationStatus === "expired") return "Expired";
    if (player.assignedMonthsAgo && player.assignedMonthsAgo >= 3)
      return "Assigned > 3M";
    return "Pending";
  };

  const generateProfessionalPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const htmlContent = `
      <html>
        <head>
          <title>${fullName} - Technical Coaching Profile</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              color: #111;
              margin: 0;
              padding: 50px;
              line-height: 1.4;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 4px solid #E31B23;
              padding-bottom: 40px;
              margin-bottom: 50px;
            }
            .brand { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; color: #E31B23; margin-bottom: 10px; }
            .coach-name { font-size: 48px; font-weight: 900; text-transform: uppercase; letter-spacing: -2px; margin: 0; line-height: 1; }
            .coach-title { font-size: 16px; font-weight: 600; color: #666; margin-top: 5px; text-transform: uppercase; }
            .rating-circle {
              width: 100px;
              height: 100px;
              background: #111;
              color: #fff;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 4px solid #E31B23;
            }
            .rating-value { font-size: 36px; font-weight: 900; line-height: 1; }
            .rating-label { font-size: 10px; font-weight: 800; text-transform: uppercase; opacity: 0.6; }
            .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
            .section { margin-bottom: 40px; }
            .section-header { 
              font-size: 14px; 
              font-weight: 900; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              color: #111;
              border-bottom: 2px solid #eee;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
            }
            .attribute-table { width: 100%; border-collapse: collapse; }
            .attribute-row { border-bottom: 1px solid #f0f0f0; }
            .attribute-cell { padding: 10px 0; font-size: 13px; }
            .attr-label { color: #666; font-weight: 600; }
            .attr-value { font-weight: 900; text-align: right; color: #111; }
            .attr-bar-bg { width: 60px; height: 6px; background: #eee; border-radius: 3px; display: inline-block; margin-left: 15px; position: relative; top: -2px; }
            .attr-bar-fill { height: 100%; background: #E31B23; border-radius: 3px; }
            .full-width { grid-column: span 2; }
            .highlight-box { background: #f9f9f9; padding: 25px; border-radius: 15px; border: 1px solid #eee; }
            .footer {
              margin-top: 80px;
              padding-top: 30px;
              border-top: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #999;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
              -webkit-print-color-adjust: exact;
            }
          </style>
        </head>
        <body oncontextmenu="return false;">
          <div class="header">
            <div>
              <div class="brand">Eddie Ricci Football Management</div>
              <h1 class="coach-name">${fullName}</h1>
              <div class="coach-title">${title}</div>
            </div>
            <div class="rating-circle">
              <span class="rating-label">Overall</span>
              <span class="rating-value">${overallRating}</span>
            </div>
          </div>
          <div class="main-grid">
            <!-- Bio Section -->
            <div class="section">
              <div class="section-header">Professional Profile</div>
              <table class="attribute-table">
                <tr class="attribute-row"><td class="attribute-cell attr-label">Experience</td><td class="attribute-cell attr-value">${experienceText}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Current Role</td><td class="attribute-cell attr-value">${title}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Current Club</td><td class="attribute-cell attr-value">${currentClub}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Nationality</td><td class="attribute-cell attr-value">${birthCountry || "International"}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Contact</td><td class="attribute-cell attr-value">${contactPhone}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Email</td><td class="attribute-cell attr-value">${contactEmail}</td></tr>
              </table>
            </div>
            <!-- Performance Metrics -->
            <div class="section">
              <div class="section-header">Coaching Summary</div>
              <table class="attribute-table">
                <tr class="attribute-row"><td class="attribute-cell attr-label">License</td><td class="attribute-cell attr-value">${validationStatus}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Tier Status</td><td class="attribute-cell attr-value">${cvTier}</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Profile Completion</td><td class="attribute-cell attr-value">${completionPercentage}%</td></tr>
                <tr class="attribute-row"><td class="attribute-cell attr-label">Status</td><td class="attribute-cell attr-value">${statusBadge}</td></tr>
              </table>
            </div>
          </div>
          <div class="footer">
            <span>Tech ID: ${cv?._id || "COACH-CV"} • Confirmed By: K10 Football Management</span>
            <span>Internal Document</span>
            <span>Date: ${new Date().toLocaleDateString()}</span>
          </div>
          <script>
            window.onload = function() { 
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            className="w-full md:w-auto bg-[#222222] hover:bg-[#333333] text-white border border-white/5 gap-2 px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] h-auto cursor-pointer"
          >
            <IconDownload size={18} /> Download CV PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        {/* Personal Information Hero */}
        <section className="bg-[#111111] rounded-3xl border border-white/10 p-4 md:p-8 flex flex-col gap-8">
          <div className="relative rounded-3xl overflow-hidden min-h-100 md:min-h-140 border border-white/10 group flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url('${coachData.coverImage || "/stadium-night.jpg"}')`,
              }}
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/95 via-black/40 via-45% to-transparent" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute right-0 bottom-0 h-full w-[70%] p-8 md:w-[40%] flex items-center justify-center pointer-events-none opacity-60 md:opacity-100">
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
                className="h-[90%] md:h-[105%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"
              />
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
                assignedReviews.map((review: any, idx: number) => (
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
                      <div className="text-base sm:text-lg font-black text-white italic">
                        {review.rating ?? 0}
                      </div>
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
                validationNeededPlayers.map((player) => {
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
                        <div className="text-base sm:text-lg font-black text-white italic">
                          {player.rating}
                        </div>
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

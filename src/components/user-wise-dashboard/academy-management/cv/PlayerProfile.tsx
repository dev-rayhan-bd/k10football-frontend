/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useState } from "react";
import playerImage from "@/assets/cvs/id/player-short-image.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlayerStats } from "../CvNotEditable";
import { useUpdatePlayerProfileMutation } from "@/redux/features/cv/cvApi";
import CMSField from "@/components/shared/CMSField";
import { toast } from "sonner";
import { cn, getShortForm, getVeryShortPosition } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import goldCard from "@/assets/cvs/gold-card.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import flag1 from "@/assets/cvs/flag1.png";
import club1 from "@/assets/cvs/club1.png";
import { useRouter } from "next/navigation";
import { IconCircleCheck, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { calculateWeightedRating } from "@/lib/utils/rating";
import {
  useGetMyPlayerAttributesQuery,
  useUpdateMyPlayerAttributesMutation,
} from "@/redux/features/player/playerApi";
import { INITIAL_SKILL_CATEGORIES } from "./SkillAttributeSection";
import { smartRemoveBackground } from "@/lib/utils/backgroundRemoval";

const SKILL_NAME_TO_KEY: Record<string, string> = {
  "ball control": "ballControl",
  "dribbling": "dribbling",
  "short passing": "shortPassing",
  "long passing": "longPassing",
  "crossing": "crossing",
  "shooting": "shooting",
  "finishing": "finishing",
  "long shots": "longShots",
  "positioning": "positioning",
  "vision": "vision",
  "anticipation": "anticipation",
  "composition": "composure",
  "composure": "composure",
  "teamwork": "teamwork",
  "work rate": "workRate",
  "decisions": "decisions",
  "att. position": "attPosition",
  "att position": "attPosition",
  "acceleration": "acceleration",
  "sprint speed": "sprintSpeed",
  "stamina": "stamina",
  "strength": "strength",
  "balance": "balance",
  "agility": "agility",
  "reactions": "reactions",
  "jumping": "jumping",
  "aggression": "aggression",
  "concentration": "concentration",
  "consistency": "consistency",
  "leadership": "leadership",
  "bravery": "bravery",
  "determination": "determination",
  "heading": "heading",
  "influence": "influence",
  "first touch": "firstTouch",
  "shot power": "shotPower",
  "curve": "curve",
  "free kick": "freeKick",
  "penalties": "penalties",
  "volleys": "volleys",
  "heading accuracy": "headingAccuracy",
  "weak foot": "weakFoot",
  "standing tackle": "standingTackle",
  "sliding tackle": "slidingTackle",
  "interception": "interception",
  "interceptions": "interception",
  "marking": "marking",
  "aerial duels": "aerialDuels",
  "clearance": "clearance",
  "pressing": "pressing",
  "defensive awareness": "defensiveAwareness",
};
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
interface Attribute {
  name: string;
  score: number;
  status: "Excellent" | "Good" | "Average";
}
const getBadgeStatus = (score: number): "Excellent" | "Good" | "Average" => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Average";
};
const getBadgeVariant = (status: string) => {
  switch (status) {
    case "Excellent":
      return "bg-green-500/10 text-green-500 border-green-500/50";
    case "Good":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/50";
    case "Average":
      return "bg-red-500/10 text-red-500 border-red-500/50";
    default:
      return "bg-green-500/10 text-green-500 border-green-500/50";
  }
};
const getIndicatorColor = (val: number) => {
  if (val >= 80) return "bg-green-500";
  if (val >= 60) return "bg-yellow-500";
  return "bg-red-500";
};
const getHexColor = (val: number) => {
  if (val >= 80) return "#22c55e";
  if (val >= 60) return "#eab308";
  return "#ef4444";
};
const getFlagUrl = (countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  return code ? `https://flagcdn.com/w160/${code}.png` : "";
};
const PlayerProfile = ({
  editable = false,
}: {
  editable?: boolean;
}) => {
const router = useRouter();
const { bioRating, skillsAvg, metricsAvg, attributesAvg, role } =
usePlayerStats();
const { playerData, handleUpdate: updatePlayerData, validatePlayer } = usePlayer();
const [updatePlayer] = useUpdatePlayerProfileMutation();

const isViewingSpecificPlayer =
  typeof window !== "undefined" &&
  Boolean(new URLSearchParams(window.location.search).get("playerId"));

const { data: attributesResponse } = useGetMyPlayerAttributesQuery(undefined, {
  skip: !editable || isViewingSpecificPlayer,
});
const [updateMyPlayerAttributes, { isLoading: isUpdatingAttributes }] = useUpdateMyPlayerAttributesMutation();
const [isDirty, setIsDirty] = useState(false);

// Sync API attributes data into Redux on load if available
React.useEffect(() => {
  const apiCats = attributesResponse?.data?.categories;
  if (apiCats && typeof apiCats === "object" && editable && !isViewingSpecificPlayer) {
    const currentCats =
      playerData.skillsCategories && playerData.skillsCategories.length > 0
        ? playerData.skillsCategories
        : INITIAL_SKILL_CATEGORIES;

    const synced = currentCats.map((cat) => {
      const catKey = cat.categoryKey || cat.category.toLowerCase();
      const catData = apiCats[catKey] || {};
      return {
        ...cat,
        categoryKey: catKey,
        skills: cat.skills.map((skill) => {
          const skillKey =
            skill.key ||
            SKILL_NAME_TO_KEY[skill.name.toLowerCase().trim()] ||
            skill.name.toLowerCase();
          let val = catData[skillKey];
          if (val === undefined) {
            if (skillKey === "composition" && catData.composure !== undefined) {
              val = catData.composure;
            } else if (skillKey === "composure" && catData.composition !== undefined) {
              val = catData.composition;
            }
          }
          return {
            ...skill,
            key: skillKey,
            value: typeof val === "number" ? val : skill.value,
          };
        }),
      };
    });

    updatePlayerData("skillsCategories", synced);
  }
}, [attributesResponse, editable, isViewingSpecificPlayer]);

const getFlagUrlWithFallback = () => {
const url = getFlagUrl(playerData.birthCountry);
return url || flag1.src;
};

const getClubLogoUrl = () => {
const firstClub = playerData.clubs?.[0];
if (firstClub && firstClub.logo) {
  if (firstClub.logo.startsWith('bg-')) {
    return club1.src;
  }
  return firstClub.logo;
}
return club1.src;
};

const attrData: Attribute[] = ((playerData.skillsCategories && playerData.skillsCategories.length > 0)
  ? playerData.skillsCategories
  : INITIAL_SKILL_CATEGORIES)
.flatMap(c => c.skills)
.slice(0, 12) // Keep it to 12 as before
.map(s => ({
  name: s.name,
  score: s.value,
  status: getBadgeStatus(s.value)
}));

const currentStats = {
pac: playerData.strengths?.pace ?? 75,
sho: playerData.strengths?.shooting ?? 75,
pas: playerData.strengths?.passing ?? 75,
dri: playerData.strengths?.dribbling ?? 75,
def: playerData.strengths?.defending ?? 75,
phy: playerData.strengths?.physical ?? 75
};

const overallRating = calculateWeightedRating(playerData.position, {
pace: currentStats.pac,
shooting: currentStats.sho,
passing: currentStats.pas,
dribbling: currentStats.dri,
defending: currentStats.def,
physical: currentStats.phy
});

const currentPlayer = {
name: playerData.fullName?.split(' ').pop()?.toUpperCase() || "PLAYER",
rating: overallRating,
position: getShortForm(playerData.position) || "ST",
stats: currentStats,
cardType: (overallRating >= 80 ? "gold" : overallRating >= 60 ? "white" : "pink") as "gold" | "white" | "pink"
};

const getValidImg = (img: any): string => {
  if (typeof img === "string") {
    const trimmed = img.trim();
    if (
      trimmed &&
      !trimmed.includes("player-short-image") &&
      !trimmed.includes("player-image")
    ) {
      return trimmed;
    }
  }
  return "";
};

const cardImg =
  (typeof playerData.cardImage === "string" && playerData.cardImage.trim()) ||
  (typeof playerData.cardPhoto === "string" && playerData.cardPhoto.trim()) ||
  (typeof (playerData as any).fifaCardStats?.cardImage === "string" && (playerData as any).fifaCardStats.cardImage.trim()) ||
  (typeof (playerData as any).fifaCardStats?.cardPhoto === "string" && (playerData as any).fifaCardStats.cardPhoto.trim()) ||
  "";

const profileImg =
  getValidImg((playerData as any).profileImage) ||
  getValidImg((playerData as any).avatar) ||
  getValidImg((playerData as any).userId?.avatar) ||
  getValidImg(playerData.playerImage) ||
  "";

const cardDisplayImg =
  (typeof cardImg === "string" && cardImg.trim()) ||
  (typeof profileImg === "string" && profileImg.trim()) ||
  "/profile_placeholder.jpg";
const isPlaceholderCard =
  cardDisplayImg === "/profile_placeholder.jpg" ||
  cardDisplayImg === "/profile_placeholder.png" ||
  (typeof cardDisplayImg === "string" && cardDisplayImg.includes("placeholder"));

const [editingField, setEditingField] = useState<string | null>(null);

const handleUpdate = (attrName: string, rawVal: number) => {
  const value = Math.max(0, Math.min(100, isNaN(rawVal) ? 0 : rawVal));

  // Immediately update Redux state for 60fps UI responsiveness
  playerData.skillsCategories?.forEach((cat, catIdx) => {
    const skillIdx = cat.skills?.findIndex((s) => s.name.toLowerCase() === attrName.toLowerCase());
    if (skillIdx !== -1) {
      updatePlayerData(`skillsCategories.${catIdx}.skills.${skillIdx}.value`, value);
    }
  });

  setIsDirty(true);
};

const handleSaveAttributes = async () => {
  if (!editable || isViewingSpecificPlayer || isUpdatingAttributes) return;

  try {
    const apiCategories = attributesResponse?.data?.categories || {};
    const payload: Record<string, number> = {};

    // 1. Initialize with all 48 default skills to ensure every expected key has a valid value
    INITIAL_SKILL_CATEGORIES.forEach((cat) => {
      const catData = (apiCategories as any)[cat.categoryKey] || {};
      cat.skills.forEach((skill) => {
        const existingVal = typeof catData[skill.key] === "number" ? catData[skill.key] : skill.value;
        payload[skill.key] = existingVal;
      });
    });

    // 2. Overlay values from current Redux skillsCategories
    (playerData.skillsCategories || []).forEach((cat) => {
      cat.skills?.forEach((skill) => {
        const key =
          skill.key ||
          SKILL_NAME_TO_KEY[skill.name.toLowerCase().trim()] ||
          skill.name
            .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
              index === 0 ? word.toLowerCase() : word.toUpperCase()
            )
            .replace(/[\s\.\-]+/g, "");
        if (key && typeof skill.value === "number") {
          payload[key] = skill.value;
        }
      });
    });

    // 3. Keep composition / composure compatibility
    if (payload.composition !== undefined) {
      payload.composure = payload.composition;
    }
    if (payload.composure !== undefined) {
      payload.composition = payload.composure;
    }

    await updateMyPlayerAttributes(payload).unwrap();
    setIsDirty(false);
  } catch (err: any) {
    // Handled by playerApi onQueryStarted with user-facing toasts
  }
};

const handleInfoChange = async (field: string, value: any) => {
updatePlayerData(field, value);
};

const fileInputRef = React.useRef<HTMLInputElement>(null);

const handleCardImageUpload = async (file: File) => {
  toast.loading("Removing background from FIFA card image...", { id: "academy-card-bg-removal" });
  try {
    const cleanFile = await smartRemoveBackground(file, false, (percent, stage) => {
      toast.loading(`${stage} ${percent}%`, { id: "academy-card-bg-removal" });
    });
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read processed image"));
      reader.readAsDataURL(cleanFile);
    });
    updatePlayerData("cardImage", dataUrl, cleanFile);
    toast.success("Card image background removed & updated!", { id: "academy-card-bg-removal" });
  } catch (err) {
    console.error("Card image background removal error:", err);
    toast.error("Background removal failed. Please try again.", { id: "academy-card-bg-removal" });
  }
};

const handleDrop = (e: React.DragEvent) => {
e.preventDefault();
if (!editable) return;
const file = e.dataTransfer.files[0];
if (file && file.type.startsWith("image/")) {
  handleCardImageUpload(file);
}
};

return (
<div className="text-white p-4 lg:p-8 w-full overflow-hidden min-w-0">
  <div className="container mt-10">
    <h1 className="text-3xl font-bold flex items-center justify-center font-heading text-white text-center lg:text-left">
      POSITIONAL CO-EFFICIENTS
    </h1>
  </div>
  <div className="container grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
    {/* Left Section - Player Card */}
    <div className="lg:col-span-1  bg-cardBg h-fit rounded-xl overflow-hidden">
      <div className=" overflow-hidden">
        <div className="aspect-square bg-linear-to-b from-[#2df168] to-[#39493b] flex items-center justify-center">
          <div onClick={() => router.push("/cvs/player-cv-details")} className="flex justify-center cursor-pointer w-full max-w-67.5 mx-auto">
            <div className={`relative w-full aspect-270/385 hover:scale-105 transition-all duration-300 z-0 ${
              currentPlayer.cardType === "gold"
                ? "drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] hover:drop-shadow-[0_0_25px_rgba(253,224,71,0.95)]"
                : currentPlayer.cardType === "white"
                  ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.95)]"
                  : "drop-shadow-[0_0_10px_rgba(251,113,133,0.5)] hover:drop-shadow-[0_0_25px_rgba(251,113,133,0.95)]"
            }`}>
              <Image
                className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
                src={
                  currentPlayer.cardType === "pink"
                    ? pinkCard
                    : currentPlayer.cardType === "gold"
                      ? goldCard
                      : whiteCard
                }
                alt="card background"
              />

              {/* Top values */}
              <div className="absolute top-[13.5%] left-[13%] text-black flex flex-col items-center z-20 w-[16%] gap-1 pl-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">{currentPlayer.rating}</span>

                {/* Position Badge */}
                <span className="bg-black text-white/95 px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black tracking-wider uppercase leading-none min-w-7 text-center shadow-xs whitespace-nowrap">
                  {currentPlayer.position}
                </span>

                <Image width={300} height={400} src={getFlagUrlWithFallback()} className="w-5.5 sm:w-6.5 h-3.5 sm:h-4.5 object-cover rounded-[2px] shadow-xs" alt="flag" />
                <Image width={300} height={400} src={getClubLogoUrl()} className="w-5.5 sm:w-6.5 h-5.5 sm:h-6.5 object-contain" alt="club logo" />
              </div>

              {/* Player Image with Upload capabilities */}
              <div
                className={`absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden rounded-t-3xl group ${
                  editable ? "cursor-pointer" : ""
                }`}
                onClick={(e) => {
                  if (editable) {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (editable) {
                    e.stopPropagation();
                    handleDrop(e);
                  }
                }}
              >
                <Image
                  className={cn(
                    "h-full w-auto object-contain select-none pointer-events-none transition-all duration-300",
                    isPlaceholderCard && "max-h-[85%] max-w-[85%] pb-1 opacity-85"
                  )}
                  width={300}
                  height={400}
                  src={cardDisplayImg}
                  alt="player Image"
                  unoptimized={
                    typeof cardDisplayImg === "string" &&
                    (cardDisplayImg.startsWith("http") || cardDisplayImg.startsWith("/") || cardDisplayImg.startsWith("data:"))
                  }
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.srcset = "";
                    target.src = "/profile_placeholder.jpg";
                    target.classList.add("max-h-[85%]", "max-w-[85%]", "pb-1", "opacity-85");
                  }}
                />
                {editable && (
                  <>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-[10px] text-white font-black uppercase tracking-widest text-center">
                        Drop or Click
                      </span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCardImageUpload(file);
                      }}
                    />
                  </>
                )}
              </div>

              {/* Name */}
              <div className="absolute top-[51%] left-1/2 -translate-x-1/2 w-[85%] text-center pb-1 z-20">
                <h3 className="text-gray-900 font-heading text-xl sm:text-2xl font-black uppercase tracking-widest truncate">
                  {currentPlayer.name}
                </h3>
              </div>

              {/* Stats */}
              <div className="absolute top-[59%] left-1/2 -translate-x-1/2 w-[86%] text-black z-20">
                <div className="flex items-center justify-between gap-2 p-2">
                  {/* left */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.pac}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PAC</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.sho}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">SHO</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.pas}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PAS</span>
                    </div>
                  </div>

                  <div className="h-14 border-r-2 border-black/15 mx-1"></div>

                  {/* right */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.dri}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">DRI</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.def}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">DEF</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-none">{currentPlayer.stats.phy}</span>
                      <span className="font-bold text-xs sm:text-sm text-gray-700 leading-none">PHY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom decorative spacer */}
              <div className="absolute bottom-[13.5%] left-1/2 -translate-x-1/2 w-[80%] flex flex-col items-center justify-center z-20">
                <div className="w-[32%] border-b border-black/10 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Rating */}
        <div className="flex justify-center -mt-16 relative z-10">
          <div className="w-32 h-32 rounded-full bg-[#2a2a2a] border-4 border-primary flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white font-heading">
                {overallRating}
              </div>
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="text-center p-4 sm:p-8 space-y-4">
          <CMSField
            value={playerData.fullName}
            onUpdate={(val) => handleInfoChange("fullName", val)}
            canEdit={false}
            className="text-3xl font-black justify-center uppercase tracking-tight"
            inputClassName="text-center"
          />
          <div className="flex items-center justify-center gap-2">
            <CMSField
              value={playerData.birthCountry}
              onUpdate={(val) => handleInfoChange("birthCountry", val)}
              canEdit={false}
              className="text-lg text-gray-300 font-bold uppercase tracking-wider"
              inputClassName="text-center"
            />
            <div className="flex items-center gap-2 ml-1">
              {getFlagUrl(playerData.birthCountry) && (
                <Image
                  src={getFlagUrl(playerData.birthCountry)}
                  alt="birth country flag"
                  width={40}
                  height={24}
                  className="w-8 h-5 object-cover rounded-sm shadow-md"
                />
              )}
              {playerData.dualNationality && getFlagUrl(playerData.dualNationality) && (
                <Image
                  src={getFlagUrl(playerData.dualNationality)}
                  alt="dual nationality flag"
                  width={40}
                  height={24}
                  className="w-8 h-5 object-cover rounded-sm shadow-md"
                />
              )}
            </div>
          </div>
          <CMSField
            value={getShortForm(playerData.position)}
            onUpdate={(val) => handleInfoChange("position", val)}
            canEdit={false}
            className="text-xl sm:text-2xl text-primary/80 font-black justify-center uppercase tracking-[0.2em]"
            inputClassName="text-center"
          />

          {/* Validation / Verification Action */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
            {role === "coach" && (playerData.validationStatus === "pending" || playerData.validationStatus === "expired") && (
              <button
                onClick={() => validatePlayer(playerData.id)}
                className="w-full py-2.5 bg-[#E31B23] hover:bg-[#ff2d35] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(227,27,35,0.3)] border border-[#E31B23]/50 flex items-center gap-2 justify-center cursor-pointer"
              >
                <IconCircleCheck size={16} /> Validate Player CV
              </button>
            )}
            {playerData.validationStatus === "verified" && (
              <div className="w-full py-2.5 bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 justify-center">
                <IconCircleCheck size={16} /> CV Verified & Active
              </div>
            )}
            {playerData.validationStatus === "expired" && (
              <div className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider mt-1 text-center">
                Validation Expired - Requires Re-validation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Right Section - Positional Co-Efficients */}
    <div className="lg:col-span-2">
      <div className="flex flex-col gap-6">
        {/* Top Save Changes Bar */}
        {editable && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#1a1a1a] border border-border rounded-lg">
            <p className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="text-yellow-400 font-semibold">• You have unsaved positional co-efficient changes</span>
              ) : (
                "Positional co-efficients are synced with your profile."
              )}
            </p>
            <Button
              type="button"
              onClick={handleSaveAttributes}
              disabled={isUpdatingAttributes || !isDirty}
              className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 h-9 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shrink-0"
            >
              {isUpdatingAttributes ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {attrData.map((attr, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 sm:gap-6 p-3 sm:p-5 bg-[#1a1a1a] border border-border rounded-lg hover:bg-[#222] transition-colors"
            >
              {/* Attribute Name */}
              <div className="flex-1 sm:flex-[1.5] min-w-0">
                <p className="text-[10px] sm:text-base font-bold text-gray-200 uppercase tracking-wide truncate">{attr.name}</p>
              </div>

              {/* Progress Bar / Slider */}
              <div className="hidden sm:block flex-2 min-w-0 max-w-xs transition-all duration-300">
                {editable ? (
                  <div className="relative flex items-center h-2 group">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={attr.score}
                      onChange={(e) =>
                        handleUpdate(attr.name, parseInt(e.target.value))
                      }
                      style={{
                        background: `linear-gradient(to right, ${getHexColor(attr.score)} ${attr.score}%, #333 ${attr.score}%)`,
                      }}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary hover:accent-primary transition-all absolute inset-0 z-10 opacity-0 group-hover:opacity-100"
                    />
                    <div className="w-full h-2 bg-[#333] rounded-full overflow-hidden relative">
                      <div
                        className={cn("h-full transition-all duration-300 ease-out", getIndicatorColor(attr.score))}
                        style={{ width: `${attr.score}%` }}
                      />
                    </div>
                    {/* Always show range input but overlay it */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={attr.score}
                      onChange={(e) =>
                        handleUpdate(attr.name, parseInt(e.target.value))
                      }
                      className="w-full h-8 opacity-0 cursor-pointer absolute inset-0 z-20"
                    />
                  </div>
                ) : (
                  <Progress
                    value={attr.score}
                    className="h-2"
                    style={{ backgroundColor: '#333' }}
                    indicatorClassName={getIndicatorColor(attr.score)}
                  />
                )}
              </div>

              {/* Score */}
              <div className="shrink-0 text-right min-w-8 sm:min-w-20 transition-all duration-300">
                <CMSField
                  value={attr.score}
                  onUpdate={(val) => handleUpdate(attr.name, parseInt(String(val)))}
                  canEdit={editable}
                  type="number"
                  editTrigger="doubleClick"
                  className="text-base sm:text-xl font-black justify-end uppercase"
                  style={{ color: getHexColor(attr.score) }}
                  inputClassName="text-right h-6 w-12 sm:h-8 sm:w-20 text-sm sm:text-lg bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-1 sm:px-2 rounded-md uppercase"
                />
              </div>

              {/* Status Badge */}
              <div className="w-17.5 sm:w-32 shrink-0">
                <Badge
                  className={`${getBadgeVariant(attr.status)} border text-[8px] sm:text-sm font-black justify-center w-full py-0.5 sm:py-1 uppercase tracking-tighter`}
                >
                  {attr.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Save Changes Bar */}
        {editable && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#1a1a1a] border border-border rounded-lg">
            <p className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="text-yellow-400 font-semibold">• You have unsaved positional co-efficient changes</span>
              ) : (
                "Positional co-efficients are synced with your profile."
              )}
            </p>
            <Button
              type="button"
              onClick={handleSaveAttributes}
              disabled={isUpdatingAttributes || !isDirty}
              className="w-full sm:w-auto bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-wider px-5 h-9 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shrink-0"
            >
              {isUpdatingAttributes ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
);
}
export default PlayerProfile;

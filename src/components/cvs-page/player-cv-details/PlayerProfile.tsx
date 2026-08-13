/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import playerImage from "@/assets/cvs-page/id/player-short-image.png";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { usePlayerStats } from "./FullEditablePage";
import { useUpdatePlayerProfileMutation } from "@/lib/features/cv/cvApi";
import CMSField from "@/components/shared/CMSField";
import { toast } from "sonner";
import { cn, getShortForm, getVeryShortPosition } from "@/lib/utils";
import { usePlayer } from "@/lib/hooks/usePlayer";
import goldCard from "@/assets/cvs-page/gold-card.png";
import pinkCard from "@/assets/cvs-page/pink-card.png";
import whiteCard from "@/assets/cvs-page/white-card.png";
import flag1 from "@/assets/cvs-page/flag1.png";
import club1 from "@/assets/cvs-page/club1.png";
import { useRouter } from "next/navigation";
import { IconCircleCheck } from "@tabler/icons-react";
import { calculateWeightedRating } from "@/lib/utils/rating";

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
  return code ? `https://flagcdn.com/${code}.svg` : "";
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

const attrData: Attribute[] = (playerData.skillsCategories || [])
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

const [editingField, setEditingField] = useState<string | null>(null);

const handleUpdate = async (attrName: string, value: number) => {
// Find which category this skill belongs to
playerData.skillsCategories.forEach((cat, catIdx) => {
  const skillIdx = cat.skills.findIndex(s => s.name === attrName);
  if (skillIdx !== -1) {
    updatePlayerData(`skillsCategories.${catIdx}.skills.${skillIdx}.value`, value);
  }
});
};

const handleInfoChange = async (field: string, value: any) => {
updatePlayerData(field, value);
};

const fileInputRef = React.useRef<HTMLInputElement>(null);

const handleCardImageUpload = async (file: File) => {
try {
  toast.loading("Removing background... Please wait.", { id: "card-bg-removal" });
  const { removeBackground } = await import("@imgly/background-removal");
  const blob = await removeBackground(file);
  const processedFile = new File([blob], file.name, { type: "image/png" });
  
  const reader = new FileReader();
  reader.onloadend = () => {
    updatePlayerData("cardImage", reader.result as string);
    toast.success("Card image updated with background removed!", { id: "card-bg-removal" });
  };
  reader.readAsDataURL(processedFile);
} catch (error) {
  console.error("Background removal failed:", error);
  toast.error("Background removal failed. Using original image.", { id: "card-bg-removal" });
  
  const reader = new FileReader();
  reader.onloadend = () => {
    updatePlayerData("cardImage", reader.result as string);
  };
  reader.readAsDataURL(file);
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
<div className=" text-white p-8">
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
          <div onClick={() => router.push("/cvs-page/player-cv-details")} className="flex justify-center cursor-pointer w-full max-w-67.5 mx-auto">
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

                {/* Jersey Number Badge */}
                <span className="bg-[#E31B23] text-white px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black font-mono leading-none tracking-tight shadow-xs min-w-7 text-center">
                  #{playerData.jerseyNumber || 10}
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
                  className="h-full w-auto object-contain select-none pointer-events-none"
                  width={300}
                  height={400}
                  src={playerData.cardImage || playerImage.src}
                  alt="player Image"
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
        <div className="text-center p-8 space-y-4">
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
            value={getVeryShortPosition(playerData.position)}
            onUpdate={(val) => handleInfoChange("position", val)}
            canEdit={false}
            className="text-base text-primary/80 font-black justify-center uppercase tracking-[0.2em]"
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
      <div className="space-y-6">
        <div className="space-y-4">
          {attrData.map((attr, idx) => (
            <div
              key={idx}
              className="flex items-center gap-6 p-5 bg-[#1a1a1a] border border-border rounded-lg hover:bg-[#222] transition-colors"
            >
              {/* Attribute Name */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-gray-200 uppercase tracking-wide">{attr.name}</p>
              </div>

              {/* Progress Bar / Slider */}
              <div className="flex-1 min-w-0 max-w-xs transition-all duration-300">
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
              <div className="shrink-0 text-right min-w-20 transition-all duration-300">
                <CMSField
                  value={attr.score}
                  onUpdate={(val) => handleUpdate(attr.name, parseInt(String(val)))}
                  canEdit={editable}
                  type="number"
                  editTrigger="doubleClick"
                  className="text-xl font-black justify-end uppercase"
                  style={{ color: getHexColor(attr.score) }}
                  inputClassName="text-right h-8 w-20 text-lg bg-gray-900/50 border-gray-700 focus:border-primary transition-all px-2 rounded-md uppercase"
                />
              </div>

              {/* Status Badge */}
              <div className="w-32">
                <Badge
                  className={`${getBadgeVariant(attr.status)} border text-sm font-black justify-center w-full py-1 uppercase tracking-tighter`}
                >
                  {attr.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
);
}
export default PlayerProfile;

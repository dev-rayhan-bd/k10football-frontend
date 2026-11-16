"use client";
import Image from "next/image";
import club1 from "@/assets/cvs/club1.png";
import flag1 from "@/assets/cvs/flag1.png";
import goldCard from "@/assets/cvs/gold-card.png";
import playerImage from "@/assets/cvs/id/player-short-image.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/hooks/usePlayer";
import { useGetPlayersQuery } from "@/redux/features/player/playerApi";
import { getShortForm, cn } from "@/lib/utils";

const COUNTRY_CODES: Record<string, string> = {
  france: "fr",
  china: "cn",
  "united kingdom": "gb",
  uk: "gb",
  "great britain": "gb",
  england: "gb-eng",
  "united states": "us",
  usa: "us",
  spain: "es",
  japan: "jp",
  brazil: "br",
  croatia: "hr",
  ghana: "gh",
  ireland: "ie",
  serbia: "rs",
  argentina: "ar",
  bangladesh: "bd",
  portugal: "pt",
  germany: "de",
  italy: "it",
  netherlands: "nl",
  belgium: "be",
  nigeria: "ng",
  senegal: "sn",
  morocco: "ma",
  colombia: "co",
  uruguay: "uy",
};

const getFlagUrl = (countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase().trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
};

const Players = () => {
  const router = useRouter();
  const { data: playersResponse, isLoading, isFetching } = useGetPlayersQuery({ limit: 50 });
  const { players: mockPlayers, selectPlayer } = usePlayer();

  const apiPlayers: any[] = Array.isArray(playersResponse?.data)
    ? playersResponse.data
    : Array.isArray(playersResponse)
    ? playersResponse
    : [];

  const displayPlayers = apiPlayers.length > 0 ? apiPlayers : mockPlayers;

  return (
    <div className="container mx-auto px-4 mt-20 bg-black py-8 rounded-3xl">
      <div className="flex items-center justify-center gap-3 mb-12">
        <h1
          className="text-4xl text-center font-heading animate-pulse"
          style={{ color: "#00FF62" }}
        >
          PLAYERS
        </h1>
        {isFetching && !isLoading && (
          <span className="size-2 rounded-full bg-[#00FF62] animate-ping" title="Syncing live players..." />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {isLoading && apiPlayers.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`player-skel-${i}`} className="w-full max-w-67.5 mx-auto">
              <div className="relative w-full aspect-270/385 bg-white/5 border border-white/10 rounded-3xl animate-pulse flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="size-8 rounded-lg bg-white/10" />
                    <div className="w-10 h-4 rounded bg-white/5" />
                  </div>
                  <div className="size-16 rounded-full bg-white/10" />
                </div>
                <div className="w-3/4 h-5 mx-auto rounded bg-white/10" />
                <div className="h-20 w-full rounded-xl bg-white/5 border border-white/10" />
              </div>
            </div>
          ))
        ) : (
          displayPlayers.map((player: any, index: number) => {
            const playerId = player._id || player.id;
            const fullName = player.fullName || player.name || player.userId?.name || "Player";
            const names = fullName.trim().split(" ");
            const displayLastName = names.length > 0 ? names[names.length - 1].toUpperCase() : fullName.toUpperCase();

            // Rating: prioritized from fifaCardStats or overallRating
            const rating = player.fifaCardStats?.overallRating ?? player.overallRating ?? player.rating ?? 50;

            // Card type: gold >= 80, silver/white >= 60, else pink
            const cardType = 
              player.cvTier?.toLowerCase() === "gold" || rating >= 80 
                ? "gold" 
                : player.cvTier?.toLowerCase() === "silver" || rating >= 60 
                ? "white" 
                : "pink";

            // Position:
            const rawPos = player.fifaCardStats?.position || player.position || "Forward";
            const shortPos = getShortForm(rawPos) || "ST";

            // Jersey Number:
            const jerseyNumber = player.jerseyNumber ?? player.shirtNo ?? player.shirtNumber ?? ((index % 99) + 1);

            // Flag and Country:
            const country = player.country || player.birthCountry || "Bangladesh";
            const flagSrc = getFlagUrl(country) || flag1.src;

            // Player image:
            const cardImg =
              (typeof player.cardImage === "string" && player.cardImage.trim()) ||
              (typeof player.cardPhoto === "string" && player.cardPhoto.trim()) ||
              (typeof player.fifaCardStats?.cardImage === "string" && player.fifaCardStats.cardImage.trim()) ||
              (typeof player.fifaCardStats?.cardPhoto === "string" && player.fifaCardStats.cardPhoto.trim()) ||
              "";

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

            const profileImg =
              getValidImg(player.profileImage) ||
              getValidImg(player.avatar) ||
              getValidImg(player.userId?.avatar) ||
              getValidImg(player.playerImage) ||
              "";

            const playerImgSrc =
              (typeof cardImg === "string" && cardImg.trim()) ||
              (typeof profileImg === "string" && profileImg.trim()) ||
              "/profile_placeholder.jpg";

            const isPlaceholder =
              playerImgSrc === "/profile_placeholder.jpg" ||
              playerImgSrc === "/profile_placeholder.png" ||
              (typeof playerImgSrc === "string" && playerImgSrc.includes("placeholder"));

            // FIFA Card stats: pac, sho, pas, dri, def, phy from fifaCardStats!
            const stats = {
              pac: player.fifaCardStats?.pac ?? player.strengths?.pace ?? 50,
              sho: player.fifaCardStats?.sho ?? player.strengths?.shooting ?? 50,
              pas: player.fifaCardStats?.pas ?? player.strengths?.passing ?? 50,
              dri: player.fifaCardStats?.dri ?? player.strengths?.dribbling ?? 50,
              def: player.fifaCardStats?.def ?? player.strengths?.defending ?? 50,
              phy: player.fifaCardStats?.phy ?? player.strengths?.physical ?? 50,
            };

            const glowClass = 
              cardType === "gold"
                ? "drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] hover:drop-shadow-[0_0_25px_rgba(253,224,71,0.95)]"
                : cardType === "white"
                  ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.95)]"
                  : "drop-shadow-[0_0_10px_rgba(251,113,133,0.5)] hover:drop-shadow-[0_0_25px_rgba(251,113,133,0.95)]";

            return (
              <div
                onClick={() => {
                  if (player.id && selectPlayer) {
                    selectPlayer(player.id);
                  }
                  if (playerId) {
                    router.push(`/cvs/player-cv-details?playerId=${playerId}`);
                  } else {
                    router.push("/cvs/player-cv-details");
                  }
                }}
                key={playerId || `player-${index}`}
                className="flex justify-center cursor-pointer w-full max-w-67.5 mx-auto"
              >
                <div className={`relative w-full aspect-270/385 hover:scale-105 transition-all duration-300 z-0 ${glowClass}`}>
                  <Image
                    className="absolute inset-0 size-full object-contain z-0 pointer-events-none"
                    src={
                      cardType === "pink"
                        ? pinkCard
                        : cardType === "gold"
                          ? goldCard
                          : whiteCard
                    }
                    alt="card background"
                    width={285}
                    height={370}
                  />
                  {/* Top values */}
                  <div className="absolute top-[13.5%] left-[13%] text-black flex flex-col items-center z-20 w-[16%] gap-1 pl-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">
                      {rating}
                    </span>
                    {/* Position Badge */}
                    <span className="bg-black text-white/95 px-2 py-0.5 rounded-[3px] text-[10px] sm:text-xs font-black tracking-wider uppercase leading-none min-w-8 text-center shadow-xs whitespace-nowrap">
                      {shortPos}
                    </span>
                    <Image 
                      src={flagSrc} 
                      className="w-7 sm:w-8 h-4.5 sm:h-5.5 object-cover rounded-[2px] shadow-xs" 
                      width={40} 
                      height={28} 
                      alt="flag" 
                      unoptimized
                    />
                    <Image 
                      src={club1} 
                      className="size-7 sm:size-8 object-contain" 
                      width={32} 
                      height={32} 
                      alt="club image" 
                    />
                  </div>
                  {/* Player image */}
                  <div className="absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden">
                    <Image
                      className={cn(
                        "h-full w-auto object-contain select-none pointer-events-none transition-all duration-300",
                        isPlaceholder && "max-h-[85%] max-w-[85%] pb-1 opacity-85"
                      )}
                      src={playerImgSrc}
                      width={285}
                      height={370}
                      alt="player Image"
                      unoptimized={
                        typeof playerImgSrc === "string" &&
                        (playerImgSrc.startsWith("http") || playerImgSrc.startsWith("/"))
                      }
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.srcset = "";
                        target.src = "/profile_placeholder.jpg";
                        target.classList.add("max-h-[85%]", "max-w-[85%]", "pb-1", "opacity-85");
                      }}
                    />
                  </div>
                  {/* Name */}
                  <div className="absolute top-[51%] left-1/2 -translate-x-1/2 w-[85%] text-center pb-1 z-20">
                    <h3 className="text-gray-900 font-heading text-lg sm:text-xl font-black uppercase tracking-widest truncate">
                      {displayLastName}
                    </h3>
                  </div>
                  {/* Stats - Redesigned as a glassmorphic block */}
                  <div className="absolute top-[59%] left-1/2 -translate-x-1/2 w-[86%] bg-black/3 border border-black/10 backdrop-blur-3xs rounded-xl p-2.5 text-black z-20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <div className="flex items-center justify-between gap-3">
                      {/* left */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.pac}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">PAC</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.sho}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">SHO</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.pas}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">PAS</span>
                        </div>
                      </div>
                      <div className="h-16 border-r-2 border-black/10 mx-1"></div>
                      {/* right */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.dri}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">DRI</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.def}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">DEF</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">{stats.phy}</span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">PHY</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Players;

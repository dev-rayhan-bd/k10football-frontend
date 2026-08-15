"use client";

import club1 from "@/assets/cvs/club1.png";
import flag1 from "@/assets/cvs/flag1.png";
import goldCard from "@/assets/cvs/gold-card.png";
import playerImage from "@/assets/cvs/id/player-short-image.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { getShortForm } from "@/lib/utils";

const COUNTRY_CODES: Record<string, string> = {
  "france": "fr",
  "china": "cn",
  "united kingdom": "gb",
  "united states": "us",
  "spain": "es",
  "japan": "jp",
  "brazil": "br",
  "croatia": "hr",
  "ghana": "gh",
  "ireland": "ie",
  "serbia": "rs",
  "argentina": "ar"
};

const getFlagUrl = (countryName: string) => {
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
};

const Players = () => {
  const router = useRouter();
  const { players, selectPlayer } = usePlayer();

  return (
    <div className="container mx-auto px-4 mt-20 bg-black py-8 rounded-3xl">
      <h1
        className="text-4xl text-center font-heading mb-12 animate-pulse"
        style={{ color: "#00FF62" }}
      >
        PLAYERS
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {players.map((player) => {
          // avg under 60 -> pink, gte 60 and less 80 -> white/silver, gte 80 -> gold
          const cardType = player.rating >= 80 ? "gold" : player.rating >= 60 ? "white" : "pink";
          const shortPos = getShortForm(player.position) || "ST";
          const flagSrc = getFlagUrl(player.birthCountry) || flag1.src;
          const displayLastName = player.fullName.split(" ").pop()?.toUpperCase() || player.fullName.toUpperCase();

          const stats = {
            pac: player.strengths.pace,
            sho: player.strengths.shooting,
            pas: player.strengths.passing,
            dri: player.strengths.dribbling,
            def: player.strengths.defending,
            phy: player.strengths.physical,
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
                selectPlayer(player.id);
                router.push("/cvs/player-cv-details");
              }}
              key={player.id}
              className="flex justify-center cursor-pointer w-full max-w-67.5 mx-auto"
            >
              <div className={`relative w-full aspect-270/385 hover:scale-105 transition-all duration-300 z-0 ${glowClass}`}>
                <Image
                  className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
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
                  <span className="text-3xl sm:text-4xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">{player.rating}</span>

                  {/* Position Badge */}
                  <span className="bg-black text-white/95 px-2 py-0.5 rounded-[3px] text-[10px] sm:text-xs font-black tracking-wider uppercase leading-none min-w-8 text-center shadow-xs whitespace-nowrap">
                    {shortPos}
                  </span>

                  {/* Jersey Number Badge */}
                  <span className="bg-[#E31B23] text-white px-2 py-0.5 rounded-[3px] text-[10px] sm:text-xs font-black font-mono leading-none tracking-tight shadow-xs min-w-8 text-center">
                    #{player.jerseyNumber}
                  </span>

                  <Image src={flagSrc} className="w-7 sm:w-8 h-4.5 sm:h-5.5 object-cover rounded-[2px] shadow-xs" width={285} height={370} alt="flag" />
                  <Image src={club1} className="w-7 sm:w-8 h-7 sm:h-8 object-contain" width={285} height={370} alt="club image" />
                </div>

                {/* Player image */}
                <div className="absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden">
                  <Image
                    className="h-full w-auto object-contain select-none pointer-events-none"
                    src={player.cardImage || playerImage}
                    width={285}
                    height={370}
                    alt="player Image"
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
        })}
      </div>
    </div>
  );
};

export default Players;


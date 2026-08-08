"use client";
import club1 from "@/assets/cvs-page/club1.png";
import playerImage from "@/assets/cvs-page/coach-image2.png";
import flag1 from "@/assets/cvs-page/flag1.png";
import goldCard from "@/assets/cvs-page/gold-card.png";
import pinkCard from "@/assets/cvs-page/pink-card.png";
import whiteCard from "@/assets/cvs-page/white-card.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCoach } from "@/lib/hooks/useCoach";

interface Coach {
  id: number;
  name: string;
  rating: number;
  position: string;
  country: string;
  image: string;
  stats: {
    att: number;
    tac: number;
    def: number;
    imp: number;
    exp: number;
    lea: number;
  };
  cardType: "gold" | "white" | "pink";
}

const coaches: Coach[] = [
  {
    id: 1,
    name: "SAM KERR",
    rating: 74,
    position: "MAN",
    country: "🇦🇺",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 2,
    name: "ALVAREZ",
    rating: 74,
    position: "MAN",
    country: "🇦🇷",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 3,
    name: "ANCELOTTI",
    rating: 74,
    position: "MAN",
    country: "🇮🇹",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 4,
    name: "MOURINHO",
    rating: 74,
    position: "MAN",
    country: "🇵🇹",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 5,
    name: "TEN HAG",
    rating: 74,
    position: "MAN",
    country: "🇳🇱",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 6,
    name: "ALVAREZ",
    rating: 74,
    position: "MAN",
    country: "🇦🇷",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 7,
    name: "ZIDANE",
    rating: 74,
    position: "MAN",
    country: "🇫🇷",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 8,
    name: "ALONSO",
    rating: 74,
    position: "MAN",
    country: "🇪🇸",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 9,
    name: "EDDIE HOWE",
    rating: 74,
    position: "MAN",
    country: "🇬🇧",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 10,
    name: "MARTINEZ",
    rating: 74,
    position: "MAN",
    country: "🇪🇸",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 11,
    name: "NAYMAR",
    rating: 74,
    position: "MAN",
    country: "🇧🇷",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 12,
    name: "KAMAL",
    rating: 74,
    position: "MAN",
    country: "🇪🇬",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 13,
    name: "K. BENZAMA",
    rating: 74,
    position: "MAN",
    country: "🇫🇷",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
  {
    id: 14,
    name: "FODEN",
    rating: 74,
    position: "MAN",
    country: "🇬🇧",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "white",
  },
  {
    id: 15,
    name: "HARI CANE",
    rating: 74,
    position: "MAN",
    country: "🇦🇺",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    stats: { att: 93, tac: 85, def: 75, imp: 78, exp: 78, lea: 82 },
    cardType: "gold",
  },
];

export default function Coaches() {
  const router = useRouter();
  const { coachData } = useCoach();

  // Map Redux data to the SILVA coach card (if it exists) or replace one
  const displayCoaches = coaches.map(c => {
    // Let's assume SILVA is the coach we want to sync
    if (c.name === "SAM KERR" || c.name === "SILVA") {
      return {
        ...c,
        name: coachData.fullName.split(" ")[1]?.toUpperCase() || coachData.fullName.toUpperCase(),
        rating: 58, // Fixed rating from bio
        stats: {
          att: coachData.seasonStats.wins,
          tac: coachData.seasonStats.matches,
          def: coachData.seasonStats.cleanSheets,
          imp: 85,
          exp: 90,
          lea: 95,
        }
      }
    }
    return c;
  });


  return (
    <div className="container mx-auto px-4 mt-20 bg-black py-8 rounded-3xl">
      <h1
        className="text-4xl  text-center font-heading mb-12"
        style={{ color: "#00FF62" }}
      >
        Coaches
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {displayCoaches.map((coach) => {
          const glowClass = 
            coach.cardType === "gold"
              ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.35)] hover:drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]"
              : coach.cardType === "white"
                ? "drop-shadow-[0_0_8px_rgba(229,231,235,0.45)] hover:drop-shadow-[0_0_18px_rgba(229,231,235,0.8)]"
                : "drop-shadow-[0_0_8px_rgba(244,114,182,0.35)] hover:drop-shadow-[0_0_18px_rgba(244,114,182,0.7)]";

          return (
            <div onClick={() => router.push("/cvs-page/coach-cv-details")} key={coach.id} className="flex justify-center w-full max-w-[270px] mx-auto">
              <div className={`relative w-full aspect-[270/385] cursor-pointer hover:scale-105 transition-all duration-300 z-0 ${glowClass}`}>
                <Image
                  className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none"
                  src={
                    coach.cardType === "pink"
                      ? pinkCard
                      : coach.cardType === "gold"
                        ? goldCard
                        : whiteCard
                  }
                  alt="card background"
                />
                
                {/* Top values */}
                <div className="absolute top-[13.5%] left-[13%] text-black flex flex-col items-center z-20 w-[16%] gap-1 pl-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold leading-none font-heading tracking-tighter text-gray-950">{coach.rating}</span>
                  
                  {/* Position Badge */}
                  <span className="bg-black text-white/95 px-1.5 py-0.5 rounded-[3px] text-[8px] sm:text-[9px] font-black tracking-wider uppercase leading-none min-w-7 text-center shadow-xs whitespace-nowrap">
                    {coach.position}
                  </span>

                  <div className="w-[60%] border-b border-black/10 my-1"></div>

                  <Image src={flag1} className="w-5.5 sm:w-6.5 h-3.5 sm:h-4.5 object-cover rounded-[2px] shadow-xs" alt="flag image" />
                  <Image src={club1} className="w-5.5 sm:w-6.5 h-5.5 sm:h-6.5 object-contain" alt="club image" />
                </div>

                {/* Coach image */}
                <div className="absolute top-[12%] right-[11%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden">
                  <Image
                    className="h-full w-auto object-contain select-none pointer-events-none"
                    src={playerImage}
                    alt="coach Image"
                  />
                </div>


                {/* Name */}
                <div className="absolute top-[52%] left-1/2 -translate-x-1/2 w-[76%] text-center pb-1 z-20">
                <h3 className="text-gray-900 font-heading text-lg sm:text-xl font-black uppercase tracking-wide truncate">
                  {coach.name}
                </h3>
              </div>

              {/* Stats */}
              <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[82%] text-black z-20">
                <div className="flex items-center justify-between gap-1 p-2">
                  {/* left */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.att}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">ATT</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.def}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">DEF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.exp}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">EXP</span>
                    </div>
                  </div>

                  <div className="h-10 border-r border-black/15 mx-1"></div>

                  {/* right */}
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.tac}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">TAC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.imp}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">IMP</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 leading-none">{coach.stats.lea}</span>
                      <span className="font-bold text-[9px] sm:text-[10px] text-gray-700 leading-none">LEA</span>
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
        );
      })}
      </div>
    </div>
  );
}

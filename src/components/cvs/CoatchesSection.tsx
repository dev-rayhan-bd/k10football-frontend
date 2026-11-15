"use client";
import Image from "next/image";
import club1 from "@/assets/cvs/club1.png";
import playerImage from "@/assets/cvs/coach-image2.png";
import flag1 from "@/assets/cvs/flag1.png";
import goldCard from "@/assets/cvs/gold-card.png";
import pinkCard from "@/assets/cvs/pink-card.png";
import whiteCard from "@/assets/cvs/white-card.png";
import { useRouter } from "next/navigation";
import { useGetAllCoachesQuery } from "@/redux/features/coach/coachApi";
import { cn } from "@/lib/utils";

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

const getFlagUrl = (countryName?: string, flagCode?: string) => {
  if (flagCode && flagCode.length === 2) {
    return `https://flagcdn.com/w40/${flagCode.toLowerCase()}.png`;
  }
  if (!countryName) return "";
  const code = COUNTRY_CODES[countryName.toLowerCase().trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "";
};

interface Coach {
  id: number | string;
  name?: string;
  fullName?: string;
  rating?: number;
  position?: string;
  country?: string;
  birthCountry?: string;
  birthCountryFlag?: string;
  image?: string;
  profileImage?: string;
  avatar?: string;
  clubLogo?: string;
  cvTier?: string;
  coachCardStats?: any;
  userId?: any;
  cardType?: "gold" | "white" | "pink";
  [key: string]: any;
}

const mockCoaches: Coach[] = [
  {
    id: 1,
    name: "SAM KERR",
    rating: 74,
    position: "MAN",
    country: "Australia",
    birthCountryFlag: "AU",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 2,
    name: "ALVAREZ",
    rating: 74,
    position: "MAN",
    country: "Argentina",
    birthCountryFlag: "AR",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 3,
    name: "ANCELOTTI",
    rating: 74,
    position: "MAN",
    country: "Italy",
    birthCountryFlag: "IT",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 4,
    name: "MOURINHO",
    rating: 74,
    position: "MAN",
    country: "Portugal",
    birthCountryFlag: "PT",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 5,
    name: "TEN HAG",
    rating: 74,
    position: "MAN",
    country: "Netherlands",
    birthCountryFlag: "NL",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 6,
    name: "ALVAREZ",
    rating: 74,
    position: "MAN",
    country: "Argentina",
    birthCountryFlag: "AR",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 7,
    name: "ZIDANE",
    rating: 74,
    position: "MAN",
    country: "France",
    birthCountryFlag: "FR",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 8,
    name: "ALONSO",
    rating: 74,
    position: "MAN",
    country: "Spain",
    birthCountryFlag: "ES",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 9,
    name: "EDDIE HOWE",
    rating: 74,
    position: "MAN",
    country: "United Kingdom",
    birthCountryFlag: "GB",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 10,
    name: "MARTINEZ",
    rating: 74,
    position: "MAN",
    country: "Spain",
    birthCountryFlag: "ES",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 11,
    name: "NAYMAR",
    rating: 74,
    position: "MAN",
    country: "Brazil",
    birthCountryFlag: "BR",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 12,
    name: "KAMAL",
    rating: 74,
    position: "MAN",
    country: "Egypt",
    birthCountryFlag: "EG",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 13,
    name: "K. BENZAMA",
    rating: 74,
    position: "MAN",
    country: "France",
    birthCountryFlag: "FR",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    cardType: "gold",
  },
  {
    id: 14,
    name: "FODEN",
    rating: 74,
    position: "MAN",
    country: "United Kingdom",
    birthCountryFlag: "GB",
    image: "https://images.unsplash.com/photo-1507919886487-4fed9a8a5e0c?w=400&h=400&fit=crop",
    cardType: "white",
  },
  {
    id: 15,
    name: "HARI CANE",
    rating: 74,
    position: "MAN",
    country: "Australia",
    birthCountryFlag: "AU",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    cardType: "gold",
  },
];

const Coaches = () => {
  const router = useRouter();
  const { data: coachesResponse, isLoading, isFetching } = useGetAllCoachesQuery({ limit: 50 });

  const apiCoaches: any[] = Array.isArray(coachesResponse?.data)
    ? coachesResponse.data
    : Array.isArray(coachesResponse)
    ? coachesResponse
    : [];

  const displayCoaches: Coach[] = apiCoaches.length > 0 ? apiCoaches : mockCoaches;

  return (
    <div className="container mx-auto px-4 mt-20 bg-black py-8 rounded-3xl">
      <div className="flex items-center justify-center gap-3 mb-12">
        <h1
          className="text-4xl text-center font-heading"
          style={{ color: "#00FF62" }}
        >
          Coaches
        </h1>
        {isFetching && !isLoading && (
          <span
            className="size-2 rounded-full bg-[#00FF62] animate-ping"
            title="Syncing live coaches..."
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading && apiCoaches.length === 0 ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={`coach-skel-${i}`} className="w-full max-w-67.5 mx-auto">
              <div className="relative w-full aspect-270/385 rounded-2xl bg-white/5 border border-white/10 animate-pulse flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <div className="size-12 bg-white/10 rounded-lg animate-pulse" />
                  <div className="w-24 h-28 bg-white/10 rounded-xl animate-pulse" />
                </div>
                <div className="flex flex-col gap-3">
                  <div className="h-5 bg-white/10 rounded w-3/4 mx-auto animate-pulse" />
                  <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          ))
        ) : (
          displayCoaches.map((coach, index) => {
            const coachId = coach._id || coach.id;
            const coachName = (
              coach.fullName ||
              coach.name ||
              coach.userId?.name ||
              "COACH"
            ).toUpperCase();

            const rating =
              coach.rating ??
              coach.coachCardStats?.rating ??
              coach.overallRatingScore ??
              74;

            const position =
              coach.coachCardStats?.position || coach.position || "MAN";

            const country =
              coach.birthCountry || coach.country || "France";

            const flagSrc = getFlagUrl(country, coach.birthCountryFlag);

            const clubLogoSrc =
              coach.clubLogo ||
              coach.clubHistory?.find((c: any) => c?.isCurrent)?.logoUrl ||
              coach.clubHistory?.[0]?.logoUrl ||
              "";

            const cardImg =
              (typeof coach.cardImage === "string" && coach.cardImage.trim()) ||
              (typeof coach.cardPhoto === "string" && coach.cardPhoto.trim()) ||
              (typeof coach.coachCardStats?.cardImage === "string" && coach.coachCardStats.cardImage.trim()) ||
              (typeof coach.coachCardStats?.cardPhoto === "string" && coach.coachCardStats.cardPhoto.trim()) ||
              "";

            const profileImg =
              (typeof coach.profileImage === "string" &&
                coach.profileImage.trim() &&
                !coach.profileImage.includes("coach-image")) ||
              (typeof coach.avatar === "string" &&
                coach.avatar.trim() &&
                !coach.avatar.includes("coach-image")) ||
              (typeof coach.userId?.avatar === "string" &&
                coach.userId.avatar.trim() &&
                !coach.userId.avatar.includes("coach-image")) ||
              "";

            const coachImgSrc = cardImg || profileImg || "/profile_placeholder.jpg";

            const isPlaceholder =
              !coachImgSrc ||
              coachImgSrc === "/profile_placeholder.jpg" ||
              coachImgSrc === "/profile_placeholder.png" ||
              (typeof coachImgSrc === "string" && coachImgSrc.includes("placeholder"));

            const cardType: "gold" | "white" | "pink" =
              coach.cardType ||
              (coach.cvTier?.toLowerCase() === "gold" || rating >= 80
                ? "gold"
                : coach.cvTier?.toLowerCase() === "silver"
                ? "white"
                : index % 2 === 0
                ? "gold"
                : "white");

            const glowClass =
              cardType === "gold"
                ? "drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] hover:drop-shadow-[0_0_25px_rgba(253,224,71,0.95)]"
                : cardType === "white"
                ? "drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.95)]"
                : "drop-shadow-[0_0_10px_rgba(251,113,133,0.5)] hover:drop-shadow-[0_0_25px_rgba(251,113,133,0.95)]";

            return (
              <div
                onClick={() => {
                  if (coachId) {
                    router.push(`/cvs/coach-cv-details?coachId=${coachId}`);
                  } else {
                    router.push("/cvs/coach-cv-details");
                  }
                }}
                key={coachId || `coach-${index}`}
                className="flex justify-center w-full max-w-67.5 mx-auto"
              >
                <div
                  className={`relative w-full aspect-270/385 cursor-pointer hover:scale-105 transition-all duration-300 z-0 ${glowClass}`}
                >
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
                      {position}
                    </span>

                    {/* Flag */}
                    {flagSrc ? (
                      <img
                        src={flagSrc}
                        className="w-7 sm:w-8 h-4.5 sm:h-5.5 object-cover rounded-[2px] shadow-xs"
                        alt={country}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.srcset = "";
                          target.src = flag1.src;
                        }}
                      />
                    ) : (
                      <Image
                        src={flag1}
                        className="w-7 sm:w-8 h-4.5 sm:h-5.5 object-cover rounded-[2px] shadow-xs"
                        alt="flag image"
                      />
                    )}

                    {/* Club */}
                    {clubLogoSrc ? (
                      <img
                        src={clubLogoSrc}
                        className="size-7 sm:size-8 object-contain"
                        alt="club logo"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.srcset = "";
                          target.src = club1.src;
                        }}
                      />
                    ) : (
                      <Image
                        src={club1}
                        className="size-7 sm:size-8 object-contain"
                        alt="club image"
                      />
                    )}
                  </div>

                  {/* Coach image */}
                  <div className="absolute top-[11%] right-[10%] w-[58%] h-[40%] flex items-end justify-center z-10 overflow-hidden">
                    <Image
                      className={cn(
                        "h-full w-auto object-contain select-none pointer-events-none transition-all duration-300",
                        isPlaceholder && "max-h-[85%] max-w-[85%] pb-1 opacity-85"
                      )}
                      src={coachImgSrc}
                      width={285}
                      height={370}
                      alt={coachName}
                      unoptimized={
                        typeof coachImgSrc === "string" &&
                        (coachImgSrc.startsWith("http") || coachImgSrc.startsWith("/"))
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
                    <h3 className="text-gray-900 font-heading text-lg sm:text-xl font-black uppercase tracking-wide truncate">
                      {coachName}
                    </h3>
                  </div>

                  {/* Stats - Static stats section as requested */}
                  <div className="absolute top-[59%] left-1/2 -translate-x-1/2 w-[86%] bg-black/3 border border-black/10 backdrop-blur-3xs rounded-xl p-2.5 text-black z-20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <div className="flex items-center justify-between gap-3">
                      {/* left */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            93
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            PAC
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            85
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            SHO
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            75
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            PAS
                          </span>
                        </div>
                      </div>
                      <div className="h-16 border-r-2 border-black/10 mx-1"></div>
                      {/* right */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            78
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            DRI
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            78
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            DEF
                          </span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="font-extrabold text-lg sm:text-xl text-gray-950 leading-none">
                            82
                          </span>
                          <span className="font-bold text-sm sm:text-[15px] text-gray-700 leading-none">
                            PHY
                          </span>
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
          })
        )}
      </div>
    </div>
  );
};

export default Coaches;

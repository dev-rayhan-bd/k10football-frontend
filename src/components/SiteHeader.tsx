"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";

const SiteHeader = ({ showToggle = false, customToggle }: { showToggle?: boolean, customToggle?: ReactNode }) => {
const pathName = usePathname();
const isAnalysis = pathName.includes("/analysis");
const isPlayerPage = pathName.startsWith("/dashboard/player");
const isParentPage = pathName.startsWith("/dashboard/parent");
const isParentOrPlayerSpace = isPlayerPage || isParentPage;
const router = useRouter();

const [isVisible, setIsVisible] = useState(true);
const [lastScrollY, setLastScrollY] = useState(0);

useEffect(() => {
  const handleScroll = () => {
    // Only apply hide/show logic on small devices (mobile)
    if (window.innerWidth >= 768) {
      setIsVisible(true);
      return;
    }
    
    const currentScrollY = window.scrollY;
    // Hide when scrolling down, show when scrolling up
    if (currentScrollY > lastScrollY && currentScrollY > 60) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setLastScrollY(currentScrollY);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, [lastScrollY]);

const handleToggle = () => {
if (isAnalysis) {
  router.push("/dashboard/academy/management");
} else {
  router.push("/dashboard/academy/analysis");
}
};

return (
<header 
  className={`flex h-(--header-height) shrink-0 items-center justify-between gap-4 px-4 lg:px-8 border-b border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-50 transition-transform duration-300 ${!isVisible ? '-translate-y-full' : 'translate-y-0'}`}
>
  <div className="flex flex-1 items-center gap-4">
    <div className="relative">
      {/* Glow effect behind the trigger */}
      <div className="absolute inset-0 bg-white/20 rounded-md animate-ping" style={{ animationDuration: '2s' }}></div>
      <SidebarTrigger className="text-white relative z-10 scale-125 md:scale-150 transition-transform duration-300 hover:text-[#E31B23] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
    </div>

    <div className="hidden sm:relative sm:block w-full max-w-2xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        placeholder="Search By Age Range, Country, Gender And Positions..."
        className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#E31B23]"
      />
    </div>

    {customToggle && (
      <div className="flex ml-auto sm:ml-0">
        {customToggle}
      </div>
    )}
  </div>

  <div className="flex items-center gap-4 text-gray-300">
    {isParentOrPlayerSpace && (
      <div className="flex items-center bg-white/5 rounded-lg p-1.5 sm:p-1.5 gap-2 sm:gap-1.5 mr-0 sm:mr-2 border border-white/10 shadow-inner">
        <button
          onClick={() => router.push("/dashboard/parent")}
          className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isParentPage ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/35' : 'text-white/40 hover:text-white/60'}`}
        >
          Parent
        </button>
        <div
          onClick={() => {
            if (isParentPage) {
              router.push("/dashboard/player");
            } else {
              router.push("/dashboard/parent");
            }
          }}
          className="w-10 sm:w-10 h-5 sm:h-5 bg-white/10 rounded-full relative cursor-pointer group border border-white/5"
        >
          <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isPlayerPage ? 'right-0.5' : 'left-0.5'}`}></div>
        </div>
        <button
          onClick={() => router.push("/dashboard/player")}
          className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${isPlayerPage ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/35 font-extrabold' : 'text-white/40 hover:text-white/60'}`}
        >
          Athlete
        </button>
      </div>
    )}

    {showToggle && (
      <div className="flex items-center bg-[#5a0000] rounded-lg p-1.5 sm:p-1.5 gap-2 sm:gap-1.5 mr-0 sm:mr-2 border border-white/5">
        <button
          onClick={() => router.push("/dashboard/academy/management")}
          className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all ${!isAnalysis ? 'bg-[#E31B23] text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          Management
        </button>
        <div
          onClick={handleToggle}
          className="w-10 sm:w-10 h-5 sm:h-5 bg-white/10 rounded-full relative cursor-pointer group border border-white/5"
        >
          <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-3.5 sm:h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${isAnalysis ? 'right-0.5' : 'left-0.5'}`}></div>
        </div>
        <button
          onClick={() => router.push("/dashboard/academy/analysis")}
          className={`px-3 sm:px-4 py-1.5 sm:py-1.5 rounded-md text-xs sm:text-[11px] font-bold uppercase tracking-wider transition-all ${isAnalysis ? 'bg-[#E31B23] text-white' : 'text-white/40 hover:text-white/60'}`}
        >
          Analysis
        </button>
      </div>
    )}

    <div className="hidden xs:flex items-center gap-1 cursor-pointer bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm font-medium">
      <span>EN</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
    </div>

    <div className="hidden xs:block relative cursor-pointer hover:text-white transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
      <span className="absolute top-0 right-0 w-2 h-2 bg-[#E31B23] rounded-full border border-[#0A0A0A]"></span>
    </div>
  </div>
</header>
);
}

export default SiteHeader;

"use client";
import Image from "next/image";
import { useState, useMemo } from "react";
import {
    IconSearch,
    IconBell,
    IconX,
    IconLoader2,
    IconCheck,
    IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { COACH_POOL } from "@/components/user-wise-dashboard/academy-analysis/TeamDataStore";
import ViewCv from "@/components/user-wise-dashboard/academy-management/ViewCv";
import { useRouter } from "next/navigation";

// ─── CV Tier calculation ───────────────────────────────────────────────────
type CvTier = "Gold" | "Silver" | "Bronze";

function getCvTier(rating: number): CvTier {
    if (rating >= 80) return "Gold";
    if (rating >= 60) return "Silver";
    return "Bronze";
}

const TIER_STYLES: Record<CvTier, { label: string; color: string; border: string; bg: string; glow: string }> = {
    Gold: { label: "GOLD", color: "text-[#FBBF24]", border: "border-[#FBBF24]/40", bg: "bg-[#FBBF24]/10", glow: "shadow-[0_0_16px_rgba(251,191,36,0.25)]" },
    Silver: { label: "SILVER", color: "text-[#CBD5E1]", border: "border-[#CBD5E1]/40", bg: "bg-[#CBD5E1]/10", glow: "shadow-[0_0_16px_rgba(203,213,225,0.15)]" },
    Bronze: { label: "BRONZE", color: "text-[#F97316]", border: "border-[#F97316]/40", bg: "bg-[#F97316]/10", glow: "shadow-[0_0_16px_rgba(249,115,22,0.15)]" },
};


const ViewCVDetailsPage = () => {
    const [notifying, setNotifying] = useState(false);
    const [notified, setNotified] = useState(false);
    const tier = getCvTier(4);
    const tierStyle = TIER_STYLES[tier];
    const router = useRouter();

    // State for Select & Notify Coach feature
    const [showCoachSelector, setShowCoachSelector] = useState(false);
    const [coachSearch, setCoachSearch] = useState("");
    const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
    const [isNotifyingCoaches, setIsNotifyingCoaches] = useState(false);

    const filteredCoaches = useMemo(() => {
        return COACH_POOL.filter(c =>
            c.name.toLowerCase().includes(coachSearch.toLowerCase()) ||
            c.role.toLowerCase().includes(coachSearch.toLowerCase())
        );
    }, [coachSearch]);

    const toggleCoachSelection = (coachId: string) => {
        setSelectedCoachIds(prev =>
            prev.includes(coachId)
                ? prev.filter(id => id !== coachId)
                : [...prev, coachId]
        );
    };

    const handleNotifySelectedCoaches = async () => {
        if (selectedCoachIds.length === 0) return;
        setIsNotifyingCoaches(true);

        const coachNames = COACH_POOL
            .filter(c => selectedCoachIds.includes(c.id))
            .map(c => c.name)
            .join(", ");

        const tid = toast.loading(`Sending CV of ${'Marcus Silva'} to selected coaches...`);
        await new Promise((r) => setTimeout(r, 1800));

        toast.success(`Successfully notified coaches: ${coachNames}!`, { id: tid, duration: 5000 });

        setIsNotifyingCoaches(false);
        setShowCoachSelector(false);
        setSelectedCoachIds([]);
    };

    const handleNotifyCoach = async () => {
        if (notified) return;
        setNotifying(true);
        const coachName = "the assigned coach";
        const tid = toast.loading(`Sending validation request to ${coachName}...`);
        await new Promise((r) => setTimeout(r, 1600));
        toast.success(`Validation request sent to ${coachName}! They will review ${'Marcus Silva'}'s CV shortly.`, { id: tid, duration: 5000 });
        setNotifying(false);
        setNotified(true);
    };


    const backToManagement = () => {
        router.push("/dashboard/academy/management/validate-cv");
    };



    return (
        <>
            <div className="py-4 sm:py-5">
                <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <button
                            onClick={backToManagement}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer shrink-0"
                        >
                            <IconArrowLeft size={18} />
                        </button>
                        <div className={`px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest border shrink-0 ${tierStyle.bg} ${tierStyle.border} ${tierStyle.color}`}>
                            {tier} CV
                        </div>
                        <h2 className="text-lg sm:text-xl font-black uppercase text-white font-orbitron tracking-tight truncate">{'Marcus Silva'}</h2>
                    </div>
                    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                        {/* NEW: Select & Notify Coach Button */}
                        <div className="relative w-full sm:w-auto flex-1 md:flex-none">
                            <button
                                onClick={() => setShowCoachSelector(!showCoachSelector)}
                                className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer bg-[#E31B23] hover:bg-[#C2181F] border-[#E31B23]/40 text-white shadow-lg shadow-[#E31B23]/20 w-full"
                            >
                                <IconBell size={16} className="shrink-0" />
                                <span className="truncate">Select & Notify Coach</span>
                            </button>


                            {showCoachSelector && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowCoachSelector(false)} />
                                    <div className="absolute right-0 top-12 w-80 bg-[#0d0d0d] border border-white/15 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-50 flex flex-col gap-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Select Coaches</span>
                                            <button
                                                onClick={() => setShowCoachSelector(false)}
                                                className="text-white/40 hover:text-white"
                                            >
                                                <IconX size={14} />
                                            </button>
                                        </div>

                                        {/* Search */}
                                        <div className="relative">
                                            <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                            <input
                                                type="text"
                                                placeholder="Search coaches..."
                                                value={coachSearch}
                                                onChange={(e) => setCoachSearch(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
                                            />
                                        </div>

                                        {/* Coaches list */}
                                        <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 pr-1">
                                            {filteredCoaches.map(coach => {
                                                const isSelected = selectedCoachIds.includes(coach.id);
                                                return (
                                                    <div
                                                        key={coach.id}
                                                        onClick={() => toggleCoachSelection(coach.id)}
                                                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${isSelected
                                                            ? "bg-[#E31B23]/10 border-[#E31B23]/30"
                                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10 shrink-0">
                                                                <Image width={100} height={100} src={coach.avatar} alt={coach.name} className="w-full h-full object-cover" onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.srcset = "";
                                                                    target.src = "/placeholder_img.jpg";
                                                                }} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] font-black text-white truncate">{coach.name}</p>
                                                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{coach.role}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isSelected
                                                            ? "bg-[#E31B23] border-[#E31B23] text-white"
                                                            : "border-white/20 text-transparent"
                                                            }`}>
                                                            <IconCheck size={10} strokeWidth={3} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {filteredCoaches.length === 0 && (
                                                <p className="text-center text-[10px] text-white/30 py-4 uppercase font-bold">No coaches found</p>
                                            )}
                                        </div>

                                        {/* Select options */}
                                        <div className="flex gap-2 pt-2 border-t border-white/10">
                                            <button
                                                onClick={() => setSelectedCoachIds(COACH_POOL.map(c => c.id))}
                                                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white/60 hover:text-white tracking-widest transition-all min-w-0"
                                            >
                                                Select All
                                            </button>
                                            <button
                                                onClick={() => setSelectedCoachIds([])}
                                                className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase text-white/60 hover:text-white tracking-widest transition-all min-w-0"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            onClick={handleNotifySelectedCoaches}
                                            disabled={selectedCoachIds.length === 0 || isNotifyingCoaches}
                                            className="w-full py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] border-[#E31B23]/40 text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg shadow-[#E31B23]/20"
                                        >
                                            {isNotifyingCoaches ? (
                                                <><IconLoader2 size={12} className="animate-spin" /> Sending...</>
                                            ) : (
                                                <>Notify ({selectedCoachIds.length})</>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Original Auto Notify Coach Button */}
                        <button
                            onClick={handleNotifyCoach}
                            disabled={notifying || notified}
                            className={`flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer disabled:cursor-default border w-full sm:w-auto flex-1 md:flex-none ${notified
                                ? "bg-[#4ADE80]/10 border-[#4ADE80]/30 text-[#4ADE80]"
                                : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white"
                                }`}
                        >
                            {notifying ? (
                                <><IconLoader2 size={16} className="animate-spin shrink-0" /> <span className="truncate">Sending...</span></>
                            ) : notified ? (
                                <><IconCheck size={16} className="shrink-0" /> <span className="truncate">Coach Notified</span></>
                            ) : (
                                <><IconBell size={16} className="shrink-0" /> <span className="truncate">Auto Notify ({"the assigned coach"})</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <ViewCv />
        </>
    )
}

export default ViewCVDetailsPage;
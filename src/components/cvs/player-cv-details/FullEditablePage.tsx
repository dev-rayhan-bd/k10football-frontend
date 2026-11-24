/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import AdditionalNotesSection from "./AdditionalNotesSection";
import AttributesAnalysis from "./AttributeAnalycies";
import ClubSection from "./ClubSection";
import DocSection from "./DocSection";
import MetricsAnalysis from "./MatricsAnalycies";
import MyImagesSection from "./MyImageSection";
import MyVideosSection from "./MyVideoSection";
import PerformanceAnalytics from "./PerformanceChart";
import PlayerBioSection from "./PlayerBioSection";
import PlayerProfile from "./PlayerProfile";
import SkillsAttributes from "./SkillAttributeSection";
import SportsAnalytics from "./SportsAnalycies";
import { useAppSelector } from "@/hooks/reduxHooks";
import { AuthState } from "@/redux/features/auth";

type UserRole = "player" | "parent" | "coach" | "academy" | "club" | "agent" | "admin" | "super_admin" | "";

interface PlayerStatsContextType {
    bioRating: number;
    setBioRating: (v: number) => void;
    skillsAvg: number;
    setSkillsAvg: (v: number) => void;
    metricsAvg: number;
    setMetricsAvg: (v: number) => void;
    attributesAvg: number;
    setAttributesAvg: (v: number) => void;
    role: UserRole;
}

export const PlayerStatsContext = createContext<PlayerStatsContextType | undefined>(undefined);

export const usePlayerStats = () => {
    const context = useContext(PlayerStatsContext);
    if (!context) {
        return {
            bioRating: 0,
            setBioRating: () => { },
            skillsAvg: 0,
            setSkillsAvg: () => { },
            metricsAvg: 0,
            setMetricsAvg: () => { },
            attributesAvg: 0,
            setAttributesAvg: () => { },
            role: "player" as UserRole,
        };
    }
    return context;
};

export const PlayerStatsProvider = ({
    children,
    forcedRole,
}: {
    children: React.ReactNode;
    forcedRole?: UserRole;
}) => {
    const [bioRating, setBioRating] = useState(94);
    const [skillsAvg, setSkillsAvg] = useState(85);
    const [metricsAvg, setMetricsAvg] = useState(88);
    const [attributesAvg, setAttributesAvg] = useState(82);
    const { user } = useAppSelector((state) => state.auth as AuthState);
    const [role, setRole] = useState<UserRole>(() => {
        if (forcedRole) return forcedRole;
        if (typeof window === "undefined") return "";
        return (user?.role as UserRole) || (localStorage.getItem("userRole") as UserRole) || "";
    });

    useEffect(() => {
        if (forcedRole) {
            setRole(forcedRole);
            return;
        }
        if (user?.role) {
            setRole(user.role as UserRole);
        }
    }, [user?.role, forcedRole]);

    return (
        <PlayerStatsContext.Provider value={{
            bioRating, setBioRating,
            skillsAvg, setSkillsAvg,
            metricsAvg, setMetricsAvg,
            attributesAvg, setAttributesAvg,
            role
        }}>
            {children}
        </PlayerStatsContext.Provider>
    );
};

// Plain block wrapper: sections keep their own top margins, so the on-screen
// layout is unchanged; the wrapper only marks what goes on each PDF page.
const PDF_PAGE_CLASS = "w-full min-w-0";

const FullEditablePage = ({ editable = false }: { editable?: boolean }) => {
    const { role } = usePlayerStats() || { role: 'player' };
    const { accessToken } = useAppSelector((state) => state.auth as AuthState);

    // If no access token, force view mode
    const isActuallyEditable = editable && !!accessToken;

    // Logic for role-based editability
    // Player/Parent can edit bio, profile, and documents/media
    // Coach, Player, and Parent can edit evaluations
    const canEditEvaluations = isActuallyEditable && (role === "player" || role === "parent" || role === "coach");
    // Player/Parent can edit media
    const canEditMedia = isActuallyEditable && (role === "player" || role === "parent");

    return (
        <>
            <div id="player-bio"></div>
            {/* Each group below is exported as exactly one page of the CV PDF
                (see `data-cv-pdf-page` in GenerateCv). */}
            {/* Page 1 — personal info → clubs */}
            <div data-cv-pdf-page="1" className={PDF_PAGE_CLASS}>
                <PlayerBioSection editable={isActuallyEditable} />
                <ClubSection />
            </div>
            {/* Page 2 — skills attributes */}
            <div data-cv-pdf-page="2" className={PDF_PAGE_CLASS}>
                <SkillsAttributes editable={canEditEvaluations} />
            </div>
            {/* Page 3 — performance, attributes, metrics, game reports */}
            <div data-cv-pdf-page="3" className={PDF_PAGE_CLASS}>
                <PerformanceAnalytics />
                <AttributesAnalysis editable={canEditEvaluations} />
                <MetricsAnalysis editable={canEditEvaluations} />
                <SportsAnalytics editable={canEditEvaluations} />
            </div>
            {/* Page 4 — positional co-efficients → the rest */}
            <div data-cv-pdf-page="4" className={PDF_PAGE_CLASS}>
                <PlayerProfile editable={canEditEvaluations} />
                <DocSection editable={canEditMedia} />
                <MyImagesSection editable={canEditMedia} />
                <MyVideosSection editable={canEditMedia} />
                <AdditionalNotesSection editable={canEditEvaluations} />
            </div>
        </>
    );
};

const FullEditablePageWrapper = (props: { editable?: boolean }) => (
    <PlayerStatsProvider>
        <FullEditablePage {...props} />
    </PlayerStatsProvider>
);

export default FullEditablePageWrapper;
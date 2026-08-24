/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import AdditionalNotesSection from "@/components/cvs/player-cv-details/AdditionalNotesSection";
import AttributesAnalysis from "@/components/cvs/player-cv-details/AttributeAnalycies";
import CvClubSection from "@/components/user-wise-dashboard/academy-management/CvClubSection";
import DocSection from "@/components/cvs/player-cv-details/DocSection";
import MetricsAnalysis from "@/components/cvs/player-cv-details/MatricsAnalycies";
import MyImagesSection from "@/components/cvs/player-cv-details/MyImageSection";
import MyVideosSection from "@/components/cvs/player-cv-details/MyVideoSection";
import PerformanceAnalytics from "@/components/cvs/player-cv-details/PerformanceChart";
import PlayerBioSection from "@/components/cvs/player-cv-details/PlayerBioSection";
import PlayerProfile from "@/components/cvs/player-cv-details/PlayerProfile";
import SkillsAttributes from "@/components/cvs/player-cv-details/SkillAttributeSection";
import SportsAnalytics from "@/components/cvs/player-cv-details/SportsAnalycies";
import { useAppSelector } from "@/lib/hooks/reduxHooks";
import { AuthState } from "@/redux/features/auth";

type UserRole = "player" | "parent" | "coach" | "academy" | "club" | "agent" | "admin" | "";

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

export const PlayerStatsProvider = ({ children }: { children: React.ReactNode }) => {
    const [bioRating, setBioRating] = useState(94);
    const [skillsAvg, setSkillsAvg] = useState(85);
    const [metricsAvg, setMetricsAvg] = useState(88);
    const [attributesAvg, setAttributesAvg] = useState(82);
    const { user } = useAppSelector((state) => state.auth as AuthState);
    const [role, setRole] = useState<UserRole>(() => {
        if (typeof window === "undefined") return "";
        return (user?.role as UserRole) || (localStorage.getItem("userRole") as UserRole) || "";
    });

    useEffect(() => {
        if (user?.role) {
            setRole(user.role as UserRole);
        }
    }, [user?.role]);

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

const CvEditable = ({ editable = false }: { editable?: boolean }) => {
    const { role } = usePlayerStats() || { role: 'player' };
    const { accessToken } = useAppSelector((state) => state.auth as AuthState);

    // If no access token, force view mode
    const isActuallyEditable = editable && !!accessToken;

    // Logic for role-based editability
    // Player/Parent can edit bio, profile, and documents/media
    const canEditBio = isActuallyEditable && (role === "player" || role === "parent");
    // Coach, Player, and Parent can edit evaluations
    const canEditEvaluations = isActuallyEditable && (role === "player" || role === "parent" || role === "coach");
    // Player/Parent can edit media
    const canEditMedia = isActuallyEditable && (role === "player" || role === "parent");

    return (
        <>
            <div id="player-bio"></div>
            <PlayerBioSection editable={isActuallyEditable} />
            <CvClubSection />
            <SkillsAttributes editable={canEditEvaluations} />
            <PerformanceAnalytics />
            <AttributesAnalysis editable={canEditEvaluations} />
            <MetricsAnalysis editable={canEditEvaluations} />
            <SportsAnalytics editable={canEditEvaluations} />
            <PlayerProfile editable={canEditEvaluations} />
            <DocSection editable={canEditMedia} />
            <MyImagesSection editable={canEditMedia} />
            <MyVideosSection editable={canEditMedia} />
            <AdditionalNotesSection editable={canEditEvaluations} />
        </>
    );
};

const FullEditablePageWrapper = (props: { editable?: boolean }) => (
    <PlayerStatsProvider>
        <CvEditable {...props} />
    </PlayerStatsProvider>
);

export default FullEditablePageWrapper;
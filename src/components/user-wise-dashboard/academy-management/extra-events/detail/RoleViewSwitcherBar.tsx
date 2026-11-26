"use client";

import React from "react";
import {
  IconActivity,
  IconCrown,
  IconDeviceGamepad,
  IconEye,
  IconShield,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export type ExtraEventPreviewRole = "invited_club" | "spectator_parent" | "owner_admin";

interface RoleViewSwitcherBarProps {
  previewRole: ExtraEventPreviewRole;
  onChangeRole: (role: ExtraEventPreviewRole) => void;
  isLiveMode: boolean;
  isTogglingLive: boolean;
  onToggleLiveMode: () => void;
  canSwitchRoles?: boolean;
}

export const RoleViewSwitcherBar: React.FC<RoleViewSwitcherBarProps> = ({
  previewRole,
  onChangeRole,
  isLiveMode,
  isTogglingLive,
  onToggleLiveMode,
  canSwitchRoles = true,
}) => {
  return (
    <div className="bg-[#161618] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-r from-transparent via-[#E31B23]/10 to-[#00FF62]/10 pointer-events-none" />
      <div className="flex items-center gap-3.5 z-10">
        <div className="size-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF62] shadow-inner shrink-0">
          <IconDeviceGamepad className="animate-pulse" size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase text-white font-orbitron tracking-wider">
              Interactive Role &amp; View Switcher
            </p>
            <span className="bg-[#00FF62]/10 border border-[#00FF62]/30 text-[#00FF62] text-[8px] font-black uppercase px-2 py-0.5 rounded-full font-orbitron">
              LIVE PORTAL
            </span>
          </div>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-0.5">
            Switch view roles to preview how clubs, parents, and admins see live results
          </p>
        </div>
      </div>

      {canSwitchRoles && (
        <div className="flex flex-wrap items-center gap-2 z-10 bg-black/60 p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => onChangeRole("invited_club")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
              previewRole === "invited_club"
                ? "bg-[#E31B23] text-white shadow-lg shadow-[#E31B23]/30 border border-[#E31B23]"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <IconShield size={14} />
            Invited Club Flow
          </button>

          <button
            type="button"
            onClick={() => onChangeRole("spectator_parent")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
              previewRole === "spectator_parent"
                ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/30 border border-amber-400"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <IconEye size={14} />
            Parents &amp; Spectators View
          </button>

          <button
            type="button"
            onClick={() => onChangeRole("owner_admin")}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
              previewRole === "owner_admin"
                ? "bg-[#00FF62] text-black font-black shadow-lg shadow-[#00FF62]/30 border border-[#00FF62]"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <IconCrown size={14} />
            Tournament Owner (Admin)
          </button>
        </div>
      )}

      {canSwitchRoles && (
        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            type="button"
            onClick={onToggleLiveMode}
            disabled={isTogglingLive}
            className={cn(
              "px-3.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border cursor-pointer font-orbitron flex items-center gap-1.5",
              isLiveMode
                ? "bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                : "bg-[#00FF62]/10 border-[#00FF62]/30 text-[#00FF62] hover:bg-[#00FF62]/20",
              isTogglingLive && "opacity-60 cursor-not-allowed"
            )}
          >
            {isTogglingLive ? (
              <div className="size-3 border-2 border-t-white border-white/20 rounded-full animate-spin" />
            ) : (
              <IconActivity size={13} className="animate-pulse" />
            )}
            {isTogglingLive ? "Updating..." : isLiveMode ? "Live Mode Active" : "Toggle Live Mode"}
          </button>
        </div>
      )}
    </div>
  );
};

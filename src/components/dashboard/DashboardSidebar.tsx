/* eslint-disable @next/next/no-img-element */
import React from "react";
import { cn } from "@/lib/utils";

interface DashboardSidebarPanelProps {
  title: string;
  icon?: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

export const DashboardSidebarPanel = ({
  title,
  icon,
  iconColor = "text-[#E31B23]",
  children,
  className = "",
}: DashboardSidebarPanelProps) => {
  return (
    <div className={cn("bg-[#111111] rounded-3xl border border-white/15 p-6 flex flex-col gap-6", className)}>
      <div className="flex items-center gap-3">
        {icon && <div className={iconColor}>{icon}</div>}
        <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-white font-orbitron">
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
};

interface DashboardSidebarItemProps {
  avatar?: string;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  extraInfo?: string;
  onClick?: () => void;
}

export const DashboardSidebarItem = ({
  avatar,
  title,
  subtitle,
  subtitleColor = "text-white/40",
  extraInfo,
  onClick,
}: DashboardSidebarItemProps) => {
  return (
    <div 
      onClick={onClick}
      className="p-4 bg-white/2 border border-white/5 rounded-2xl hover:bg-white/4 transition-all group flex items-center gap-4 cursor-pointer"
    >
      <div className="size-12 rounded-full overflow-hidden border border-white/10 shrink-0 bg-white/5 flex items-center justify-center">
        <img
          src={avatar || "/placeholder_img.jpg"}
          alt={title}
          className="size-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder_img.jpg";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">
          {title}
        </p>
        <p className={cn("text-[10px] font-bold uppercase tracking-wider", subtitleColor)}>
          {subtitle}
        </p>
      </div>
      {extraInfo && (
        <div className="text-sm md:text-base font-black text-white shrink-0 whitespace-nowrap">
          {extraInfo}
        </div>
      )}
    </div>
  );
};

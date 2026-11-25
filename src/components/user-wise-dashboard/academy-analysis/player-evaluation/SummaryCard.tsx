import React from "react";
import type { Icon as TablerIcon } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  icon: TablerIcon;
  iconClassName?: string;
}

export const SummaryCard = ({ label, value, icon: Icon, iconClassName }: SummaryCardProps) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-[20px] p-4 md:p-5 flex items-center gap-3 md:gap-4 flex-1 min-w-0">
    <div className="size-10 md:size-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/20 shrink-0">
      <Icon className={cn("size-5 md:size-6 text-primary", iconClassName)} stroke={2} />
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-muted-foreground text-[10px] md:text-[11px] font-medium leading-none truncate">{label}</p>
      <p className="text-white text-xl md:text-2xl font-bold font-orbitron truncate">{value}</p>
    </div>
  </div>
);

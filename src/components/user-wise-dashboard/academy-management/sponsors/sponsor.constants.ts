import { ISponsorsMetaData } from "@/types/academy.type";

export const DEFAULT_SPONSORS_META: ISponsorsMetaData = {
  sponsorshipTypes: [
    "EQUIPMENT",
    "APPAREL",
    "FINANCIAL",
    "TECHNOLOGY",
    "MEDIA",
    "MEDICAL",
    "NUTRITION",
    "OTHER",
  ],
  sponsorshipStatuses: [
    "ACTIVE",
    "EXPIRING SOON",
    "EXPIRED",
    "PENDING",
    "TERMINATED",
  ],
  paymentStatuses: [
    "PAID",
    "PENDING",
    "PARTIALLY_PAID",
    "OVERDUE",
  ],
};

export const getBadgeStyle = (variant?: string, fallbackText?: string): string => {
  const key = (variant || fallbackText || "").toLowerCase();
  if (
    key.includes("green") ||
    key === "active" ||
    key === "paid" ||
    key === "equipment"
  ) {
    return "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20";
  }
  if (
    key.includes("blue") ||
    key === "apparel" ||
    key === "media" ||
    key === "technology"
  ) {
    return "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20";
  }
  if (
    key.includes("yellow") ||
    key.includes("warning") ||
    key.includes("expiring") ||
    key === "financial" ||
    key === "pending" ||
    key.includes("partially")
  ) {
    return "bg-[#FBBF24]/10 text-[#FBBF24] border border-[#FBBF24]/20";
  }
  if (key.includes("purple") || key === "medical" || key === "nutrition") {
    return "bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20";
  }
  if (
    key.includes("red") ||
    key === "expired" ||
    key === "terminated" ||
    key === "overdue"
  ) {
    return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20";
  }
  return "bg-white/10 text-white/80 border border-white/15";
};

export const formatContractPeriod = (
  contractPeriod?: string,
  startDate?: string,
  endDate?: string
): string => {
  if (contractPeriod) return contractPeriod;
  if (!startDate || !endDate) return "—";

  try {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return `${startDate} to ${endDate}`;
    const startFormatted = s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const endFormatted = e.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFormatted} to ${endFormatted}`;
  } catch {
    return `${startDate} to ${endDate}`;
  }
};

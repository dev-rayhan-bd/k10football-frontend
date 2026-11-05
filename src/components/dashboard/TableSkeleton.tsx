import React from "react";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  headers?: string[];
  hasAvatar?: boolean;
  actionButtonsCount?: number;
  className?: string;
}

export const TableSkeleton = ({
  rowCount = 6,
  columnCount = 7,
  headers,
  hasAvatar = true,
  actionButtonsCount = 3,
  className,
}: TableSkeletonProps) => {
  const effectiveColCount = headers && headers.length > 0 ? headers.length : columnCount;

  return (
    <div
      className={cn(
        "border border-white/20 rounded-2xl overflow-x-auto bg-black/20 animate-pulse",
        className
      )}
    >
      <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-white/5 border-b border-white/20 text-[10px] font-black text-white uppercase tracking-wider">
            {headers && headers.length > 0
              ? headers.map((header, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      "px-6 py-4",
                      idx !== headers.length - 1 && "border-r border-white/20"
                    )}
                  >
                    <span className="opacity-80">{header}</span>
                  </th>
                ))
              : Array.from({ length: effectiveColCount }).map((_, c) => (
                  <th
                    key={c}
                    className={cn(
                      "px-6 py-4",
                      c !== effectiveColCount - 1 && "border-r border-white/20"
                    )}
                  >
                    <div className="h-3.5 w-20 rounded bg-white/10" />
                  </th>
                ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {Array.from({ length: rowCount }).map((_, r) => (
            <tr key={r} className="hover:bg-white/2 transition-colors">
              {/* First column: avatar + title/subtitle OR text block */}
              <td className="px-6 py-5 border-r border-white/20">
                {hasAvatar ? (
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white/10 shrink-0" />
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="h-3.5 w-32 rounded bg-white/15" />
                      <div className="h-2.5 w-20 rounded bg-white/5" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="h-3.5 w-28 rounded bg-white/15" />
                    <div className="h-2.5 w-16 rounded bg-white/5" />
                  </div>
                )}
              </td>

              {/* Middle columns */}
              {Array.from({ length: Math.max(1, effectiveColCount - 2) }).map((_, c) => (
                <td key={c} className="px-6 py-5 border-r border-white/20 text-center">
                  <div className="h-3.5 w-20 rounded bg-white/10 mx-auto" />
                </td>
              ))}

              {/* Last column: action buttons */}
              <td className="px-6 py-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: actionButtonsCount }).map((_, btnIdx) => (
                    <div
                      key={btnIdx}
                      className="size-8 rounded-xl bg-white/10 border border-white/10"
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const StatCardSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "bg-[#111111] border border-white/20 rounded-2xl p-4 sm:p-6 flex flex-col gap-2 sm:gap-4 flex-1 min-w-0 animate-pulse",
      className
    )}
  >
    <div className="size-8 sm:size-10 rounded-lg bg-white/10 shrink-0" />
    <div className="min-w-0 flex flex-col gap-2">
      <div className="h-7 sm:h-9 w-24 bg-white/15 rounded-md" />
      <div className="h-3 w-20 bg-white/5 rounded" />
    </div>
  </div>
);

export const ChartSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-full h-80 sm:h-96 rounded-3xl bg-[#111111] border border-white/10 p-6 flex flex-col gap-6 animate-pulse",
      className
    )}
  >
    <div className="flex items-center justify-between">
      <div className="h-5 w-44 bg-white/10 rounded" />
      <div className="h-8 w-28 bg-white/10 rounded-xl" />
    </div>
    <div className="flex items-end gap-3 sm:gap-6 h-full pt-8 pb-4 border-b border-white/5">
      {[45, 60, 35, 75, 50, 85, 65, 90, 40, 70, 55, 80].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <div
            className="w-full bg-white/10 rounded-t-sm"
            style={{ height: `${h}%` }}
          />
          <div className="h-2 w-6 bg-white/5 rounded" />
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between text-[10px] text-white/20">
      <div className="h-2.5 w-12 bg-white/5 rounded" />
      <div className="h-2.5 w-12 bg-white/5 rounded" />
      <div className="h-2.5 w-12 bg-white/5 rounded" />
      <div className="h-2.5 w-12 bg-white/5 rounded" />
    </div>
  </div>
);

export default TableSkeleton;

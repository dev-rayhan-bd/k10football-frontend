import React from "react";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  className?: string;
}

export const TableSkeleton = ({
  rowCount = 5,
  columnCount = 7,
  className,
}: TableSkeletonProps) => (
  <div
    className={cn(
      "border border-white/10 rounded-2xl overflow-x-auto animate-pulse bg-white/2",
      className
    )}
  >
    <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
      <thead>
        <tr className="bg-white/5 border-b border-white/10">
          {Array.from({ length: columnCount }).map((_, c) => (
            <th key={c} className="px-6 py-4">
              <div className="h-3.5 w-20 rounded bg-white/10" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {Array.from({ length: rowCount }).map((_, r) => (
          <tr key={r} className="border-b border-white/5">
            {/* First column: avatar + title/subtitle */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-white/10 shrink-0" />
                <div className="flex flex-col gap-2">
                  <div className="h-3.5 w-28 rounded bg-white/10" />
                  <div className="h-2.5 w-16 rounded bg-white/5" />
                </div>
              </div>
            </td>
            {/* Middle columns */}
            {Array.from({ length: Math.max(1, columnCount - 2) }).map((_, c) => (
              <td key={c} className="px-6 py-4">
                <div className="h-3.5 w-16 rounded bg-white/5" />
              </td>
            ))}
            {/* Last column: action buttons */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-white/10" />
                <div className="size-8 rounded-xl bg-white/10" />
                <div className="size-8 rounded-xl bg-white/10" />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TableSkeleton;

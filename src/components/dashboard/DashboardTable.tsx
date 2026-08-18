/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
}

interface DashboardTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
}

const DashboardTable = <T,>({ columns, data, className, onRowClick }: DashboardTableProps<T>) => {
return (
<div className={cn("border border-white/20 rounded-2xl overflow-x-auto", className)}>
  <table className="w-full min-w-max text-left border-collapse whitespace-nowrap">
    <thead>
      <tr className="bg-white/5 border-b border-white/20 text-[10px] font-black text-white uppercase tracking-wider">
        {columns.map((col, i) => (
          <th 
            key={col.key} 
            className={cn(
              "px-6 py-4",
              i !== columns.length - 1 && "border-r border-white/20",
              col.align === "center" && "text-center",
              col.align === "right" && "text-right",
              col.headerClassName
            )}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-white/20">
      {data.map((row, rowIndex) => (
        <tr 
          key={rowIndex} 
          onClick={() => onRowClick?.(row)}
          className={cn(
            "hover:bg-white/2 transition-colors",
            onRowClick && "cursor-pointer"
          )}
        >
          {columns.map((col, colIndex) => (
            <td 
              key={`${rowIndex}-${col.key}`} 
              className={cn(
                "px-6 py-5",
                colIndex !== columns.length - 1 && "border-r border-white/20",
                col.align === "center" && "text-center",
                col.align === "right" && "text-right",
                col.cellClassName
              )}
            >
              {col.render ? col.render(row) : (row as any)[col.key]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
);
}

export default DashboardTable;

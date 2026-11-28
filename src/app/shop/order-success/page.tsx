"use client";

import React, { Suspense, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconShoppingBag,
  IconReceipt,
} from "@tabler/icons-react";
import { apiSlice } from "@/redux/features/api/apiSlice";
import TagTypes from "@/constants/tagType.constant";
import { useAppDispatch } from "@/hooks/reduxHooks";

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const orderNumber = useMemo(() => {
    const fromParam = searchParams.get("orderNumber") || searchParams.get("orderId");
    if (fromParam) return fromParam;
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_order_number") || "";
    }
    return "";
  }, [searchParams]);

  // Clear cart cache once on mount so the shop shows an empty cart
  useEffect(() => {
    dispatch(apiSlice.util.invalidateTags([TagTypes.CART]));
    if (typeof window !== "undefined") {
      localStorage.removeItem("last_session_id");
      localStorage.removeItem("last_order_number");
      localStorage.removeItem("last_order_id");
    }
  }, [dispatch]);

  const displayOrderNumber = orderNumber || "K10-ORDER";

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-40 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col items-center gap-8 relative z-10 py-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Success Icon */}
        <div className="size-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
          <IconCheck size={44} stroke={3} />
        </div>

        {/* Success Message */}
        <div className="flex flex-col items-center text-center gap-3">
          <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-orbitron tracking-tight">
            Payment <span className="text-emerald-400 italic">Successful!</span>
          </h1>
          <p className="text-sm text-white/50 font-medium max-w-md">
            Thank you for your purchase. Your order has been placed and the academy shop will process it shortly.
          </p>
        </div>

        {/* Order Reference Card */}
        <div className="bg-[#0D0D0D]/70 border border-white/10 rounded-2xl p-5 w-full flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <IconReceipt className="size-5 text-primary shrink-0" />
            <div>
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block">Order Reference</span>
              <span className="text-base font-black text-white font-orbitron">{displayOrderNumber}</span>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-orbitron uppercase tracking-wider shrink-0">
            Confirmed
          </span>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-wrap gap-4 justify-center w-full">
          <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6">
            <Link href="/dashboard/parent/shop" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
              <IconShoppingBag size={16} /> Continue Shopping
            </Link>
          </Button>
          <Button
            asChild
            className="bg-[#E31B23] hover:bg-[#C2181F] text-white font-orbitron font-bold text-xs uppercase tracking-wider px-8 shadow-lg shadow-[#E31B23]/20"
          >
            <Link href="/dashboard/parent/my-orders" className="flex items-center gap-2">
              <IconReceipt size={16} /> View My Orders
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

const OrderSuccessLoadingSkeleton = () => (
  <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4">
    <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-10 max-w-md w-full flex flex-col items-center gap-4">
      <Skeleton className="size-20 rounded-full bg-white/10" />
      <Skeleton className="h-6 w-48 bg-white/10" />
      <Skeleton className="h-4 w-64 bg-white/5" />
    </div>
  </div>
);

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoadingSkeleton />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

"use client";

import React, { useEffect, useRef, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconShoppingBag,
  IconArrowLeft,
  IconReceipt,
} from "@tabler/icons-react";
import { useLazyVerifyOrderQuery } from "@/redux/features/shop/shopApi";
import { IOrderItem, IProductItem } from "@/types/shop.type";

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const hasInitiatedRef = useRef(false);

  // Read params from URL or fallback to localStorage
  const sessionId = useMemo(() => {
    const fromParam = searchParams.get("session_id") || searchParams.get("sessionId");
    if (fromParam) return fromParam;
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_session_id") || "";
    }
    return "";
  }, [searchParams]);

  const orderNumber = useMemo(() => {
    const fromParam = searchParams.get("orderNumber") || searchParams.get("orderId");
    if (fromParam) return fromParam;
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_order_number") || "";
    }
    return "";
  }, [searchParams]);

  const lastOrderId = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("last_order_id") || "";
    }
    return "";
  }, []);

  const [verifyOrder, { data: verifyResponse, isLoading, isSuccess, isError, error }] =
    useLazyVerifyOrderQuery();

  useEffect(() => {
    if (hasInitiatedRef.current) return;

    const targetId = orderNumber || lastOrderId;
    if (!sessionId && !targetId) {
      hasInitiatedRef.current = true;
      return;
    }

    hasInitiatedRef.current = true;

    if (targetId) {
      verifyOrder({ orderId: targetId, sessionId })
        .unwrap()
        .then(() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("last_session_id");
            localStorage.removeItem("last_order_number");
            localStorage.removeItem("last_order_id");
          }
        })
        .catch(() => {
          // If first attempt with orderNumber fails and distinct lastOrderId exists, retry with lastOrderId
          if (targetId === orderNumber && lastOrderId && lastOrderId !== orderNumber) {
            verifyOrder({ orderId: lastOrderId, sessionId })
              .unwrap()
              .then(() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("last_session_id");
                  localStorage.removeItem("last_order_number");
                  localStorage.removeItem("last_order_id");
                }
              })
              .catch(() => {});
          }
        });
    }
  }, [orderNumber, lastOrderId, sessionId, verifyOrder]);

  const orderData = verifyResponse?.data;
  const items: IOrderItem[] = orderData?.items || [];
  const displayOrderNumber = orderData?.orderNumber || orderNumber || "K10-ORDER";
  const displayTotal = orderData?.totalAmount ?? 0;
  const shippingAddress = orderData?.shippingAddress || "Flat 4B, Road 12, London, UK";

  // Helper to extract product info
  const getItemInfo = (item: IOrderItem) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const prod = typeof item.productId === "object" && item.productId !== null ? (item.productId as IProductItem) : null;
    const name = prod?.productName || (prod as any)?.name || (prod as any)?.title || "Official Uniform Product";
    const image =
      prod?.productImage ||
      (prod?.images && prod.images[0]) ||
      (prod as any)?.image ||
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400";
    const size = item.size || "M";
    const price = item.price || prod?.salePrice || prod?.regularPrice || 0;
    return { name, image, size, price };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-40 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 size-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10 py-10">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-10 sm:p-14 w-full flex flex-col items-center justify-center gap-6 shadow-2xl backdrop-blur-md text-center">
            <div className="size-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(227,27,35,0.25)]">
              <IconLoader2 size={36} className="animate-spin" />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron tracking-tight">
                Verifying Payment...
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Please wait while we confirm your Stripe transaction and finalize your academy order.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && isError && (
          <div className="bg-[#0D0D0D]/60 border border-white/10 rounded-3xl p-8 sm:p-12 w-full flex flex-col items-center justify-center gap-6 shadow-2xl backdrop-blur-md text-center">
            <div className="size-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center text-destructive shadow-[0_0_30px_rgba(239,68,68,0.25)]">
              <IconAlertCircle size={40} />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white font-orbitron tracking-tight">
                Verification Note
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(error as any)?.data?.message ||
                  "Your payment session was completed, but order verification could not be loaded automatically. Please verify your order in your parent dashboard."}
              </p>
              {displayOrderNumber && (
                <p className="text-xs text-white/70 font-mono mt-1">
                  Order Reference: <span className="font-bold text-white">{displayOrderNumber}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
              <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5">
                <Link href="/dashboard/parent/shop" className="flex items-center gap-2">
                  <IconArrowLeft size={16} /> Return to Shop
                </Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron font-bold">
                <Link href="/dashboard/parent/my-orders">View My Orders</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {(!isLoading && (isSuccess || (!isError && orderData))) && (
          <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
            {/* Success Header */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="size-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
                <IconCheck size={44} stroke={3} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-black uppercase text-white font-orbitron tracking-tight">
                  Payment <span className="text-emerald-400 italic">Successful!</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground font-semibold mt-2 max-w-md">
                  Thank you for your purchase! Your order has been placed and confirmed by the academy shop.
                </p>
              </div>
            </div>

            {/* Order Card */}
            <div className="bg-[#0D0D0D]/70 border border-white/10 rounded-3xl p-6 sm:p-8 w-full flex flex-col gap-6 shadow-2xl backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <IconReceipt className="size-5 text-primary" />
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                      Order Reference
                    </span>
                    <span className="text-base sm:text-lg font-black text-white font-orbitron">
                      {displayOrderNumber}
                    </span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-orbitron font-bold text-xs">
                  {orderData?.paymentStatus || "PAID"}
                </Badge>
              </div>

              {/* Order Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Shipping Address
                  </span>
                  <span className="text-white font-medium truncate">{shippingAddress}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Fulfillment Status
                  </span>
                  <span className="text-primary font-bold uppercase tracking-wider">
                    {orderData?.orderStatus || "PROCESSING"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Purchased Items ({items.length})
                  </span>
                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {items.map((it, idx) => {
                      const itemInfo = getItemInfo(it);
                      return (
                        <div
                          key={it._id || idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="size-11 rounded-lg overflow-hidden relative shrink-0 bg-neutral-900 border border-white/5">
                              <Image
                                src={itemInfo.image}
                                alt={itemInfo.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white truncate">{itemInfo.name}</h4>
                              <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                                Qty: {it.quantity} {itemInfo.size ? `• Size: ${itemInfo.size}` : ""}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-white font-orbitron pl-3">
                            ${(itemInfo.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-400 font-bold uppercase text-[10px]">Free Academy Delivery</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
                  <span className="uppercase font-orbitron">Total Paid</span>
                  <span className="text-2xl font-black text-white font-orbitron">
                    ${displayTotal > 0 ? displayTotal.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>
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
        )}
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


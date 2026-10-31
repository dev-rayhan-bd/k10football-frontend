"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconReceipt,
  IconShoppingBag,
  IconCheck,
  IconClock,
  IconCreditCard,
  IconTruck,
  IconSearch,
  IconPackage,
  IconCalendar,
  IconX,
} from "@tabler/icons-react";
import { useGetMyOrdersQuery } from "@/redux/features/shop/shopApi";
import { IOrderData, IOrderItem, IProductItem } from "@/types/shop.type";

const MyOrdersPage = () => {
  const { data: ordersResponse, isLoading, isError, refetch } = useGetMyOrdersQuery();
  const [activeTab, setActiveTab] = useState<"ALL" | "PAID" | "PENDING" | "PROCESSING">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<IOrderData | null>(null);

  const orders: IOrderData[] = useMemo(() => {
    return ordersResponse?.data || [];
  }, [ordersResponse]);

  // Statistics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const paidOrders = orders.filter((o) => o.paymentStatus === "PAID").length;
    const pendingOrders = orders.filter((o) => o.paymentStatus === "PENDING").length;
    const totalSpent = orders
      .filter((o) => o.paymentStatus === "PAID")
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return { totalOrders, paidOrders, pendingOrders, totalSpent };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab filter
      if (activeTab === "PAID" && order.paymentStatus !== "PAID") return false;
      if (activeTab === "PENDING" && order.paymentStatus !== "PENDING") return false;
      if (activeTab === "PROCESSING" && order.orderStatus !== "PROCESSING") return false;

      // Search filter
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase();
        const matchesNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchesItem = order.items?.some((it) => {
          const p = typeof it.productId === "object" && it.productId !== null ? (it.productId as IProductItem) : null;
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          const name = p?.productName || (p as any)?.name || (p as any)?.title || "";
          return name.toLowerCase().includes(query);
        });
        return matchesNumber || matchesItem;
      }

      return true;
    });
  }, [orders, activeTab, searchTerm]);

  const getItemProduct = (item: IOrderItem) => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const prod = typeof item.productId === "object" && item.productId !== null ? (item.productId as IProductItem) : null;
    const name = prod?.productName || (prod as any)?.name || (prod as any)?.title || "Uniform Item";
    const image =
      prod?.productImage ||
      (prod?.images && prod.images[0]) ||
      (prod as any)?.image ||
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=400";
    const size = item.size || "M";
    const price = item.price ?? prod?.salePrice ?? prod?.regularPrice ?? 0;
    return { name, image, size, price };
    /* eslint-enable @typescript-eslint/no-explicit-any */
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recent Order";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-24 md:pb-12 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
            My <span className="text-primary italic">Orders</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
            Track and manage your uniform, kit, and academy merchandise orders
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron font-bold text-xs uppercase tracking-wider">
          <Link href="/dashboard/parent/shop" className="flex items-center gap-2">
            <IconShoppingBag size={16} /> Browse Shop
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0D0D0D]/60 border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Orders</span>
            <IconReceipt size={18} className="text-primary" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-white">
            {isLoading ? <Skeleton className="h-8 w-14 bg-white/10" /> : stats.totalOrders}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D0D]/60 border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Paid Orders</span>
            <IconCheck size={18} className="text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-emerald-400">
            {isLoading ? <Skeleton className="h-8 w-14 bg-white/10" /> : stats.paidOrders}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D0D]/60 border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Pending Payment</span>
            <IconClock size={18} className="text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-amber-400">
            {isLoading ? <Skeleton className="h-8 w-14 bg-white/10" /> : stats.pendingOrders}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D0D0D]/60 border border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Spent</span>
            <IconCreditCard size={18} className="text-primary" />
          </div>
          <span className="text-2xl sm:text-3xl font-black font-orbitron text-white">
            {isLoading ? <Skeleton className="h-8 w-24 bg-white/10" /> : `$${stats.totalSpent.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Controls: Search & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Tab Filters */}
        <div className="flex gap-1 bg-black/40 border border-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide">
          {(["ALL", "PAID", "PENDING", "PROCESSING"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer",
                activeTab === tab
                  ? "bg-[#E31B23] text-white"
                  : "text-muted-foreground hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order # or item..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-10 rounded-3xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
          <IconPackage className="size-12 text-muted-foreground" />
          <p className="text-sm font-semibold text-white">Failed to load order history</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#0D0D0D]/60 border border-white/5 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-36 bg-white/10" />
                <Skeleton className="h-6 w-20 bg-white/5" />
              </div>
              <div className="flex gap-4 items-center">
                <Skeleton className="size-16 rounded-xl bg-white/10" />
                <div className="flex-1 flex flex-col gap-2">
                  <Skeleton className="h-4 w-1/3 bg-white/10" />
                  <Skeleton className="h-3 w-1/4 bg-white/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOrders.length === 0 && (
        <div className="p-14 rounded-3xl bg-[#0D0D0D]/40 border border-white/5 text-center flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
            <IconReceipt size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <h3 className="text-base font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-muted-foreground">
              {searchTerm
                ? "No orders match your search query. Try searching with a different term."
                : "You haven't placed any orders in this category yet. Explore the academy shop to find jerseys and kits."}
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron font-bold text-xs uppercase tracking-wider mt-2">
            <Link href="/dashboard/parent/shop">Explore Shop</Link>
          </Button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && !isError && filteredOrders.length > 0 && (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => {
            const isPaid = order.paymentStatus === "PAID";
            const itemCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 0;

            return (
              <div
                key={order._id}
                className="bg-[#0D0D0D]/60 border border-white/5 hover:border-white/10 transition-all rounded-3xl p-5 sm:p-7 flex flex-col gap-5 backdrop-blur-sm"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-white font-orbitron tracking-tight">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <IconCalendar size={14} />
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Status Badge */}
                    <Badge
                      className={cn(
                        "font-orbitron font-bold text-[10px] tracking-wider",
                        isPaid
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      )}
                    >
                      {order.paymentStatus || "PENDING"}
                    </Badge>

                    {/* Order Fulfillment Status Badge */}
                    <Badge
                      variant="secondary"
                      className="font-orbitron font-bold text-[10px] tracking-wider bg-white/5 text-white/80 border border-white/10"
                    >
                      {order.orderStatus || "PROCESSING"}
                    </Badge>
                  </div>
                </div>

                {/* Items Thumbnails & Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                    <div className="flex -gap-2 overflow-hidden items-center shrink-0">
                      {order.items?.slice(0, 3).map((it, idx) => {
                        const info = getItemProduct(it);
                        return (
                          <div
                            key={idx}
                            className="size-12 rounded-xl overflow-hidden relative border-2 border-[#0A0A0A] bg-neutral-900 shrink-0"
                          >
                            <Image
                              src={info.image}
                              alt={info.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        );
                      })}
                      {order.items?.length > 3 && (
                        <div className="size-12 rounded-xl bg-black/60 border-2 border-[#0A0A0A] flex items-center justify-center text-xs font-bold text-white shrink-0">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {order.items?.map((it) => getItemProduct(it).name).join(", ") || "Academy Items"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Total {itemCount} {itemCount === 1 ? "item" : "items"}
                        {order.shippingAddress ? ` • Deliver to ${order.shippingAddress}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                        Total Amount
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-orbitron">
                        ${order.totalAmount?.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="border-white/10 text-white hover:bg-white/5 font-bold text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
          <div className="bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 rounded-3xl max-w-xl w-full flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Order Details
                </span>
                <h3 className="text-xl font-black text-white font-orbitron">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Status & Date */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Order Date
                </span>
                <span className="text-white font-medium">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col gap-1">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Payment Status
                </span>
                <span
                  className={cn(
                    "font-bold uppercase font-orbitron",
                    selectedOrder.paymentStatus === "PAID" ? "text-emerald-400" : "text-amber-400"
                  )}
                >
                  {selectedOrder.paymentStatus || "PENDING"}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
              <IconTruck className="size-5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Shipping Destination
                </span>
                <span className="text-xs text-white truncate">
                  {selectedOrder.shippingAddress || "Flat 4B, Road 12, London, UK"}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Order Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                {selectedOrder.items?.map((it, idx) => {
                  const info = getItemProduct(it);
                  return (
                    <div
                      key={it._id || idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="size-11 rounded-lg overflow-hidden relative shrink-0 bg-neutral-900 border border-white/5">
                          <Image src={info.image} alt={info.name} fill sizes="44px" className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate">{info.name}</h4>
                          <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                            Qty: {it.quantity} {info.size ? `• Size: ${info.size}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-white font-orbitron pl-3">
                        ${(info.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total Summary */}
            <div className="border-t border-white/5 pt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Delivery</span>
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Free</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-white pt-1">
                <span className="uppercase font-orbitron">Total</span>
                <span className="text-2xl font-black text-white font-orbitron">
                  ${selectedOrder.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
                className="border-white/10 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;


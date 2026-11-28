"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  IconAlertCircle,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconPackage,
  IconTruck,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useGetAcademyOrdersQuery, useUpdateOrderStatusMutation } from "@/redux/features/shop/shopApi";
import type { IAcademyOrder, IAcademyOrderItem } from "@/types/shop.type";

const PAGE_LIMIT = 20;

type PaymentFilter = "" | "PAID" | "PENDING" | "FAILED";
type OrderStatusFilter = "" | "PROCESSING" | "SHIPPED" | "DELIVERED";

const ORDER_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"] as const;
type OrderStatus = (typeof ORDER_STATUSES)[number];

const paymentBadge = (status?: string) => {
  if (status === "PAID") return <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">Paid</span>;
  if (status === "FAILED") return <span className="inline-flex items-center rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-400">Failed</span>;
  return <span className="inline-flex items-center rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-400">Pending</span>;
};

const orderStatusIcon = (status?: string) => {
  if (status === "SHIPPED") return <IconTruck size={12} />;
  if (status === "DELIVERED") return <IconCircleCheck size={12} />;
  return <IconPackage size={12} />;
};

const orderStatusColor = (status?: string) => {
  if (status === "SHIPPED") return "text-blue-400 bg-blue-500/10 border-blue-500/25";
  if (status === "DELIVERED") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
  return "text-amber-400 bg-amber-500/10 border-amber-500/25";
};

const getProductName = (item: IAcademyOrderItem) => {
  if (item.productId && typeof item.productId === "object") {
    return item.productId.productName || "Product";
  }
  return "Product";
};

const getProductImage = (item: IAcademyOrderItem) => {
  if (item.productId && typeof item.productId === "object") {
    return item.productId.images?.[0] || null;
  }
  return null;
};

const getUserInfo = (order: IAcademyOrder) => {
  if (order.userId && typeof order.userId === "object") return order.userId;
  return {};
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr.split("T")[0];
  }
};

const formatAmount = (amount?: number) => {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

const StatusDropdown = ({ order }: { order: IAcademyOrder }) => {
  const [updateOrderStatus, { isLoading }] = useUpdateOrderStatusMutation();
  const current = order.orderStatus as OrderStatus | undefined;
  const isPaid = order.paymentStatus === "PAID";

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === current) return;
    try {
      await updateOrderStatus({ orderId: order._id, orderStatus: newStatus }).unwrap();
    } catch {
      // Toast handled by API
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {isLoading && <IconLoader2 size={12} className="animate-spin text-white/60 absolute -left-4" />}
      <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${orderStatusColor(current)}`}>
        {orderStatusIcon(current)}
        <span>{current || "—"}</span>
      </div>
      {isPaid ? (
        <div className="relative">
          <select
            value={current || ""}
            onChange={handleChange}
            disabled={isLoading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            aria-label="Update order status"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <IconChevronDown size={12} className="text-white/40 cursor-pointer" />
        </div>
      ) : (
        <span className="text-[9px] text-white/25 font-bold">(awaiting payment)</span>
      )}
    </div>
  );
};

const OrdersTab = () => {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching } = useGetAcademyOrdersQuery({
    status: paymentFilter || undefined,
    orderStatus: orderStatusFilter || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  const hasFilters = Boolean(paymentFilter || orderStatusFilter);

  const clearFilters = () => {
    setPaymentFilter("");
    setOrderStatusFilter("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative shrink-0">
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value as PaymentFilter); setPage(1); }}
            className="appearance-none bg-[#111111] border border-white/15 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-white/80 hover:text-white focus:outline-none focus:border-white/30 transition-all cursor-pointer"
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
          <IconChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>

        <div className="relative shrink-0">
          <select
            value={orderStatusFilter}
            onChange={(e) => { setOrderStatusFilter(e.target.value as OrderStatusFilter); setPage(1); }}
            className="appearance-none bg-[#111111] border border-white/15 rounded-xl py-2 pl-3.5 pr-8 text-xs font-bold text-white/80 hover:text-white focus:outline-none focus:border-white/30 transition-all cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <IconChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-bold text-[#E31B23] hover:text-[#C2181F] underline transition-all cursor-pointer px-1"
          >
            Reset
          </button>
        )}

        {meta?.total !== undefined && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-white/40">
            {meta.total} order{meta.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-sm text-destructive py-8 justify-center">
          <IconAlertCircle className="size-4" /> Failed to load orders.
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-white/5 bg-white/1">
          <IconPackage size={36} className="text-white/20" />
          <p className="text-white text-sm font-bold uppercase tracking-wider font-orbitron">No Orders Found</p>
          <p className="text-white/40 text-xs text-center max-w-xs">
            {hasFilters ? "No orders match the selected filters." : "No orders have been placed in your store yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/2">
                {["Order #", "Customer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={isFetching ? "opacity-60 transition-opacity" : ""}>
              {orders.map((order) => {
                const user = getUserInfo(order);
                const firstItem = order.items?.[0];
                const itemCount = order.items?.length ?? 0;
                const firstProductName = firstItem ? getProductName(firstItem) : "—";
                const firstProductImg = firstItem ? getProductImage(firstItem) : null;

                return (
                  <tr key={order._id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    {/* Order # */}
                    <td className="px-4 py-3 font-mono font-bold text-white whitespace-nowrap">
                      {order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || "Customer"}
                            width={28}
                            height={28}
                            className="rounded-full object-cover size-7 shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="size-7 rounded-full bg-white/10 border border-white/10 shrink-0 flex items-center justify-center text-[10px] font-black text-white/50">
                            {(user.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[120px]">{user.name || "Unknown"}</p>
                          {user.email && <p className="text-[10px] text-white/40 truncate max-w-[120px]">{user.email}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {firstProductImg && (
                          <Image
                            src={firstProductImg}
                            alt={firstProductName}
                            width={28}
                            height={28}
                            className="rounded-lg object-cover size-7 shrink-0 border border-white/10"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[130px]">{firstProductName}</p>
                          {itemCount > 1 && (
                            <p className="text-[10px] text-white/40">+{itemCount - 1} more</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 font-orbitron font-black text-white whitespace-nowrap">
                      {formatAmount(order.totalAmount)}
                    </td>

                    {/* Payment */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {paymentBadge(order.paymentStatus)}
                    </td>

                    {/* Status with dropdown */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusDropdown order={order} />
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
            Page <span className="text-white">{meta?.page ?? page}</span> of <span className="text-white">{totalPages}</span>
            {meta?.total !== undefined && <> ({meta.total} total)</>}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <IconChevronLeft size={15} />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <IconChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTab;

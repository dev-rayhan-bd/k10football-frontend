"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  IconReceipt,
  IconCreditCard,
  IconCalendar,
  IconDownload,
  IconUser,
  IconBuildingCommunity,
  IconPrinter,
  IconX,
  IconPackage,
  IconLoader2,
  IconChevronDown,
} from "@tabler/icons-react";
import { useGetParentFeesQuery, usePayFeeInvoiceMutation } from "@/redux/features/parent/parentApi";
import { useParentDashboard } from "@/providers/ParentDashboardProvider";
import { IParentFeeInvoice, ParentFeeType } from "@/types/parent.type";

const ParentFeesAndPayments = () => {
  const { selectedChildPlayerId, selectedChild } = useParentDashboard();
  const [activeTab, setActiveTab] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [activeFeeType, setActiveFeeType] = useState<ParentFeeType | "ALL">("ALL");
  const [receiptInvoice, setReceiptInvoice] = useState<IParentFeeInvoice | null>(null);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);

  // Query fees from API scoped to selected child: GET /api/v1/parents/fees?childPlayerId=<selectedChildPlayerId>
  const { data: feesResponse, isLoading, isError, refetch } = useGetParentFeesQuery({
    status: activeTab === "ALL" ? undefined : activeTab,
    childPlayerId: selectedChildPlayerId || undefined,
    feeType: activeFeeType === "ALL" ? undefined : activeFeeType,
  });

  const [payFeeInvoice] = usePayFeeInvoiceMutation();

  const invoices: IParentFeeInvoice[] = useMemo(() => {
    return feesResponse?.data || [];
  }, [feesResponse]);

  const handlePayInvoice = async (invoice: IParentFeeInvoice) => {
    const targetId = invoice._id || invoice.id || "";
    if (!targetId) return;
    try {
      setPayingInvoiceId(targetId);
      const res = await payFeeInvoice(targetId).unwrap();
      if (res?.data?.checkoutUrl) {
        if (res.data.sessionId) {
          localStorage.setItem("last_fee_session_id", res.data.sessionId);
        }
        if (targetId) {
          localStorage.setItem("last_fee_invoice_id", targetId);
        }
        if (res.data.invoiceNumber) {
          localStorage.setItem("last_fee_invoice_number", res.data.invoiceNumber);
        }
        window.location.assign(res.data.checkoutUrl);
      } else {
        toast.error("Could not obtain Stripe checkout URL");
      }
    } catch {
      // Handled in parentApi onQueryStarted
    } finally {
      setPayingInvoiceId(null);
    }
  };

  const handleDownloadInvoice = (invoice: IParentFeeInvoice) => {
    setReceiptInvoice(invoice);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 sm:pb-24 md:pb-12 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="w-full min-w-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none truncate">
          Fees & <span className="text-primary italic">Payments</span>
        </h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] sm:text-[11px] mt-2 leading-relaxed line-clamp-2 sm:line-clamp-none">
          View academy invoices for {selectedChild?.fullName || "your child"}, download billing receipts, and pay academy fees
        </p>
      </div>

      <div className="bg-[#0D0D0D]/40 border border-white/5 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-4 sm:gap-6 w-full min-w-0">
        {/* Tabs Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full min-w-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Status tabs */}
            <div className="flex gap-1 bg-black/40 border border-white/5 p-1 rounded-xl overflow-x-auto scrollbar-hide">
              {(["ALL", "UNPAID", "PAID"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer",
                    activeTab === tab
                      ? "bg-[#E31B23] text-white"
                      : "text-muted-foreground hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Fee type dropdown */}
            <div className="relative shrink-0">
              <select
                value={activeFeeType}
                onChange={(e) => setActiveFeeType(e.target.value as ParentFeeType | "ALL")}
                className="appearance-none bg-black/40 border border-white/10 h-9 rounded-xl text-white/70 text-[10px] sm:text-xs font-bold uppercase tracking-widest pl-3 pr-8 focus:outline-none focus:border-white/30 transition-colors cursor-pointer"
              >
                <option value="ALL" className="bg-[#111111] text-white">All Types</option>
                <option value="MONTHLY_TRAINING_FEE" className="bg-[#111111] text-white">Training Fee</option>
                <option value="EVENT_ENTRY_FEE" className="bg-[#111111] text-white">Event Entry Fee</option>
              </select>
              <IconChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
            </div>
          </div>

          <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest shrink-0">
            Showing {invoices.length} billing statement(s)
          </span>
        </div>

        {/* Error State */}
        {isError && !isLoading && (
          <div className="p-10 rounded-2xl bg-black/40 border border-white/5 text-center flex flex-col items-center justify-center gap-3">
            <IconPackage className="size-12 text-muted-foreground" />
            <p className="text-sm font-semibold text-white">Failed to load fee invoices</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {/* Skeleton Loading State */}
        {isLoading && (
          <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full min-w-0"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                  <Skeleton className="size-10 sm:size-12 rounded-xl bg-white/10 shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-48 bg-white/10" />
                    <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col gap-1 items-end">
                    <Skeleton className="h-5 w-16 bg-white/10" />
                    <Skeleton className="h-4 w-12 bg-white/5" />
                  </div>
                  <Skeleton className="h-9 w-24 rounded-xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice List */}
        {!isLoading && !isError && (
          <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
            {invoices.map((invoice) => {
              const isPaid = invoice.status === "PAID";
              const isUnpaid = invoice.status === "UNPAID";

              return (
                <div
                  key={invoice._id || invoice.id}
                  className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all w-full min-w-0 group"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto flex-1">
                    <div className="size-10 sm:size-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                      <IconReceipt className="size-5 sm:size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                        {invoice.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-1">
                        <span className="flex items-center gap-1 shrink-0">
                          <IconCalendar size={12} className="shrink-0" />
                          <span className="truncate">{invoice.dueDateFormatted || `Due: ${invoice.dueDate}`}</span>
                        </span>
                        <span>•</span>
                        <span className="truncate font-mono">{invoice.idDisplay || `ID: ${invoice.invoiceNumber}`}</span>

                        {invoice.childPlayer?.fullName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-white/70 truncate">
                              <IconUser size={12} className="shrink-0" />
                              <span className="truncate">{invoice.childPlayer.fullName}</span>
                            </span>
                          </>
                        )}

                        {invoice.academy?.name && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-white/70 truncate">
                              <IconBuildingCommunity size={12} className="shrink-0" />
                              <span className="truncate">{invoice.academy.name}</span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t border-white/5 sm:border-0 shrink-0 min-w-0">
                    <div className="text-left sm:text-right min-w-0">
                      <p className="text-lg sm:text-xl font-black text-white font-orbitron truncate">
                        {invoice.amountFormatted || `$${invoice.amount.toFixed(2)}`}
                      </p>
                      <Badge
                        className={cn(
                          "text-[8px] font-bold mt-0.5 sm:mt-1 shrink-0 font-orbitron uppercase tracking-wider",
                          isPaid
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-destructive/10 border-destructive/30 text-destructive"
                        )}
                      >
                        {invoice.displayStatus || invoice.status}
                      </Badge>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {isUnpaid ? (
                        <button
                          type="button"
                          disabled={payingInvoiceId === (invoice._id || invoice.id)}
                          onClick={() => handlePayInvoice(invoice)}
                          className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md shadow-[#E31B23]/10 cursor-pointer font-orbitron disabled:opacity-50"
                        >
                          {payingInvoiceId === (invoice._id || invoice.id) ? (
                            <>
                              <IconLoader2 size={14} className="animate-spin" /> Redirecting...
                            </>
                          ) : (
                            <>
                              <IconCreditCard size={14} /> Pay Fee
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(invoice)}
                          className="p-2.5 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white rounded-xl border border-white/10 transition-all cursor-pointer"
                          title="View & Download Billing Receipt"
                        >
                          <IconDownload size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {invoices.length === 0 && (
              <div className="p-12 text-center text-muted-foreground text-sm font-light">
                No billing invoices found matching this filter.
              </div>
            )}
          </div>
        )}
      </div>

      {/* View & Download Receipt Modal */}
      {receiptInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300 p-4">
          <div className="bg-[#0D0D0D] border border-white/10 p-6 sm:p-8 rounded-2xl sm:rounded-3xl max-w-lg w-full flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <IconReceipt className="size-5 text-primary" />
                <div>
                  <h3 className="text-lg font-black text-white uppercase font-orbitron">
                    Billing Receipt
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono block">
                    {receiptInvoice.invoiceNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptInvoice(null)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-black border border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-bold text-white block">{receiptInvoice.title}</span>
                  <span className="text-[10px] text-muted-foreground">{receiptInvoice.feeType || "Event Fee"}</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-orbitron">
                  {receiptInvoice.displayStatus || "PAID"}
                </Badge>
              </div>

              <div className="border-t border-white/5 pt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Athlete</span>
                  <span className="text-white font-medium">{receiptInvoice.childPlayer?.fullName || "Youth Player"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Academy</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {receiptInvoice.academy?.logo && (
                      <div className="size-4 relative rounded-full overflow-hidden shrink-0">
                        <Image src={receiptInvoice.academy.logo} alt="Academy" fill className="object-cover" />
                      </div>
                    )}
                    <span className="text-white font-medium truncate">{receiptInvoice.academy?.name || "K10 Academy"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Payment Method</span>
                  <span className="text-white font-medium">{receiptInvoice.paymentMethod || "STRIPE"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Transaction ID</span>
                  <span className="text-white font-mono text-[10px] truncate block">{receiptInvoice.transactionId || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-white/5 pt-3">
              <span className="text-xs uppercase font-bold text-muted-foreground font-orbitron">Total Paid</span>
              <span className="text-2xl font-black text-white font-orbitron">
                {receiptInvoice.amountFormatted || `$${receiptInvoice.amount.toFixed(2)}`}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setReceiptInvoice(null)}
                className="border-white/10 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={handlePrintReceipt}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
              >
                <IconPrinter size={16} /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentFeesAndPayments;

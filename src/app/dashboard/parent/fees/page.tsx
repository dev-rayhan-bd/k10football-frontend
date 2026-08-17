"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  IconReceipt,
  IconCreditCard,
  IconCalendar,
  IconDownload
} from "@tabler/icons-react";

interface Invoice {
  id: string;
  item: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Unpaid";
  paidDate?: string;
}

const ParentFeesAndPayments = () => {
const [invoices, setInvoices] = useState<Invoice[]>([
{
  id: "INV-2026-003",
  item: "August Training Fee",
  dueDate: "2026-08-10",
  amount: 45.00,
  status: "Unpaid"
},
{
  id: "INV-2026-002",
  item: "São Paulo Cup Entry Fee",
  dueDate: "2026-07-20",
  amount: 35.00,
  status: "Paid",
  paidDate: "2026-07-18"
},
{
  id: "INV-2026-001",
  item: "Academy Home Jersey Kit",
  dueDate: "2026-06-15",
  amount: 85.00,
  status: "Paid",
  paidDate: "2026-06-12"
}
]);

const [activeTab, setActiveTab] = useState<"All" | "Unpaid" | "Paid">("All");
const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
const [isPaying, setIsPaying] = useState(false);

const filteredInvoices = invoices.filter(inv => {
if (activeTab === "All") return true;
return inv.status === activeTab;
});

const handlePayInvoice = (invoice: Invoice) => {
setSelectedInvoice(invoice);
setIsPaying(true);
};

const handlePaymentConfirm = async () => {
if (!selectedInvoice) return;
const toastId = toast.loading("Connecting to Stripe payment server...");
await new Promise((resolve) => setTimeout(resolve, 1500));
setInvoices(invoices.map(inv =>
  inv.id === selectedInvoice.id
    ? { ...inv, status: "Paid", paidDate: new Date().toISOString().split("T")[0] }
    : inv
));
setIsPaying(false);
toast.success(`Invoice ${selectedInvoice.id} paid successfully!`, { id: toastId });
};

const handleDownloadInvoice = (invoiceId: string) => {
toast.success(`Downloading PDF Receipt for ${invoiceId}`);
};

return (
<div className="space-y-8 pb-24 md:pb-12">
  {/* Header */}
  <div>
    <h1 className="text-3xl md:text-5xl font-black uppercase text-white font-orbitron tracking-tight leading-none">
      Fees & <span className="text-primary italic">Payments</span>
    </h1>
    <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2 leading-relaxed">
      View academy invoices, download billing receipts, and pay membership fees
    </p>
  </div>

  <div className="bg-[#0D0D0D]/40 border border-white/5 p-8 rounded-3xl shadow-xl space-y-6">
    {/* Tabs Filter */}
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div className="flex gap-1 sm:gap-2 bg-black/40 border border-white/5 p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-hide">
        {(["All", "Unpaid", "Paid"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-[#E31B23] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
        Showing {filteredInvoices.length} billing statement(s)
      </span>
    </div>

    {/* Invoice List */}
    <div className="space-y-4">
      {filteredInvoices.map((invoice) => (
        <div
          key={invoice.id}
          className="p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/20 transition-all"
        >
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
              <IconReceipt className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate leading-tight">{invoice.item}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-1">
                <span className="flex items-center gap-1">
                  <IconCalendar size={12} className="shrink-0" /> Due: {invoice.dueDate}
                </span>
                <span className="truncate">ID: {invoice.id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end pt-4 sm:pt-0 border-t border-white/5 sm:border-0 shrink-0">
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-lg font-black text-white font-orbitron">${invoice.amount.toFixed(2)}</p>
              <Badge className={`text-[8px] font-bold mt-1 ${
                invoice.status === "Paid"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                {invoice.status}
              </Badge>
            </div>

            <div className="flex gap-2">
              {invoice.status === "Unpaid" ? (
                <button
                  onClick={() => handlePayInvoice(invoice)}
                  className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#C2181F] text-white rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md shadow-[#E31B23]/10"
                >
                  <IconCreditCard size={14} /> Pay Fee
                </button>
              ) : (
                <button
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"
                  title="Download Invoice PDF"
                >
                  <IconDownload size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {filteredInvoices.length === 0 && (
        <div className="p-12 text-center text-gray-500 text-sm font-light">
          No billing invoices found matching this filter.
        </div>
      )}
    </div>
  </div>

  {/* Stripe Payment Modal */}
  {isPaying && selectedInvoice && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-[#0D0D0D] border border-white/10 p-8 rounded-3xl max-w-md w-full mx-4 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-white uppercase font-orbitron">Invoice Checkout</h3>
          <p className="text-xs text-gray-400">Complete payment for {selectedInvoice.item}</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black border border-white/5 flex flex-col gap-2">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Invoice Total</span>
            <span className="text-3xl font-black text-white font-orbitron">${selectedInvoice.amount.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider ml-1">Card Details</label>
            <div className="px-4 py-3.5 rounded-xl border border-white/5 bg-black text-white text-xs select-none">
              •••• •••• •••• 4242 (Stripe Checkout)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsPaying(false)}
            className="py-3 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:bg-white/5 transition-all uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={handlePaymentConfirm}
            className="py-3 rounded-xl bg-primary hover:bg-primary/90 text-black text-xs font-bold uppercase tracking-wider transition-all"
          >
            Confirm Pay
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
export default ParentFeesAndPayments;

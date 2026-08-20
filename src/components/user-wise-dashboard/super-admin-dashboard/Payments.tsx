/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { 
  IconCurrencyDollar, 
  IconCreditCard,
  IconFileText,
  IconReportAnalytics
} from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";

const SummaryStatCard = ({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) => (
  <div className="bg-[#111111] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden shadow-lg">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
       <Icon size={18} className="sm:w-5 sm:h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-white text-xl sm:text-3xl font-black font-orbitron truncate">{value}</p>
      <p className="text-white/40 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider truncate mt-0.5 sm:mt-1">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span className="px-3 sm:px-4 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 whitespace-nowrap shrink-0">
    {status}
  </span>
);

interface PaymentRow {
  id: string;
  type: string;
  user: string;
  amount: string;
  spend: string;
  date: string;
  status: string;
}

const SuperAdminPayments = () => {
  const columns: Column<PaymentRow>[] = [
    { header: "Payment ID", key: "id", align: "center", cellClassName: "text-white/60 text-xs sm:text-sm font-medium whitespace-nowrap" },
    { header: "Type", key: "type", align: "center", cellClassName: "text-white/60 text-xs sm:text-sm font-medium whitespace-nowrap" },
    { header: "User/Entity", key: "user", align: "center", cellClassName: "text-white/60 text-xs sm:text-sm font-medium whitespace-nowrap" },
    { header: "Amount", key: "amount", align: "center", cellClassName: "text-emerald-400 text-xs sm:text-sm font-black font-orbitron whitespace-nowrap" },
    { header: "Spend", key: "spend", align: "center", cellClassName: "text-red-400 text-xs sm:text-sm font-black font-orbitron whitespace-nowrap" },
    { header: "Date", key: "date", align: "center", cellClassName: "text-white/60 text-xs sm:text-sm font-medium whitespace-nowrap" },
    { 
      header: "Status", 
      key: "status", 
      align: "center", 
      render: (row) => <StatusBadge status={row.status} /> 
    }
  ];

  const data: PaymentRow[] = [
    { id: "PAY-001", type: "Subscription", user: "Elite FC Academy", amount: "$ 89.00", spend: "$ 25.00", date: "2024-01-15", status: "Completed" },
    { id: "PAY-002", type: "Game Report", user: "John Smith", amount: "$ 9.99", spend: "$ 3.99", date: "2024-02-01", status: "Completed" },
    { id: "PAY-003", type: "Subscription", user: "Michael Brown", amount: "$ 99.00", spend: "$ 15.00", date: "2023-12-01", status: "Completed" },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white">
      {/* Header */}
      <div className="shrink-0 w-full min-w-0">
        <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">Payments</h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-sm sm:text-lg truncate">Platform revenue</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        <SummaryStatCard icon={IconCurrencyDollar} value="$ 197,400" label="Total Revenue" />
        <SummaryStatCard icon={IconCreditCard} value="$ 188,000" label="Subscription" />
        <SummaryStatCard icon={IconFileText} value="$ 2,000" label="Game Reports" />
        <SummaryStatCard icon={IconReportAnalytics} value="$ 800" label="Total Spend" />
      </div>

      {/* Main Container */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        <div className="w-full overflow-x-auto no-scrollbar">
          <DashboardTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPayments;

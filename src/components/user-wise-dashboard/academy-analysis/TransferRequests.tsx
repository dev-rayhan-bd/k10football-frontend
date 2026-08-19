/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  IconDownload,
  IconUpload,
  IconCheck,
  IconClock,
  IconCircleX,
  IconEye,
  IconPlus,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
const RequestStatCard = ({ icon: Icon, value, label, iconColor }: { icon: any, value: string | number, label: string, iconColor: string }) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-6 flex flex-col gap-4 flex-1 min-w-0">
    <div className={`w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${iconColor}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-white text-3xl font-black font-orbitron">{value}</p>
      <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);
const StatusPill = ({ status }: { status: "Approved" | "Pending" | "Rejected" }) => {
  const styles = {
    Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};
const TransferTable = ({ title, data }: { title: string, data: any[] }) => (
  <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-6 md:p-8 flex flex-col gap-6 w-full max-w-full">
    <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight">{title}</h2>
    <div className="border border-white/20 rounded-2xl overflow-x-auto w-full custom-scrollbar">
      <table className="w-full min-w-200 text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/20 text-[10px] font-black text-white uppercase tracking-wider">
            <th className="px-6 py-4 border-r border-white/20">Name</th>
            <th className="px-6 py-4 border-r border-white/20 text-center">Incoming</th>
            <th className="px-6 py-4 border-r border-white/20 text-center">Outgoing</th>
            <th className="px-6 py-4 border-r border-white/20 text-center">Requested By</th>
            <th className="px-6 py-4 border-r border-white/20 text-center">Date</th>
            <th className="px-6 py-4 border-r border-white/20 text-center">Status</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/20">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-white/2 transition-colors text-center">
              <td className="px-6 py-5 border-r border-white/20 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20">
                    <Image width={100} height={100} src={`https://i.pravatar.cc/150?u=${row.name}`} alt={row.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-black uppercase">{row.name}</p>
                    <p className="text-red-500 text-[10px] font-bold uppercase">{row.pos}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 border-r border-white/20">
                <span className="text-white/60 text-sm font-medium">{row.incoming}</span>
              </td>
              <td className="px-6 py-5 border-r border-white/20">
                <span className="text-white/60 text-sm font-medium">{row.outgoing}</span>
              </td>
              <td className="px-6 py-5 border-r border-white/20">
                <span className="text-white/60 text-sm font-medium">{row.requestedBy}</span>
              </td>
              <td className="px-6 py-5 border-r border-white/20">
                <span className="text-white/60 text-sm font-medium">{row.date}</span>
              </td>
              <td className="px-6 py-5 border-r border-white/20">
                <StatusPill status={row.status} />
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-center gap-2">
                  <button className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/70 hover:text-white hover:border-white/40 hover:bg-white/10 transition-all hover:scale-105">
                    <IconEye size={20} stroke={2} />
                  </button>
                  <button className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all hover:scale-105">
                    <IconCheck size={20} stroke={2} />
                  </button>
                  <button className="w-10 h-10 inline-flex items-center justify-center rounded-xl border border-red-500/30 bg-red-500/5 text-red-500 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all hover:scale-105">
                    <IconX size={20} stroke={2} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
const TransferRequests = () => {
  const [open, setOpen] = useState(false);
  const mockData = [
    { name: "Marcus Silva", pos: "Forward", incoming: "Chelsea U19", outgoing: "Liverpool U17", requestedBy: "Coach Williams", date: "2024-01-15", status: "Pending" as const },
    { name: "Alex Jonson", pos: "Defender", incoming: "Liverpool U17", outgoing: "City U16", requestedBy: "Coach Anderson", date: "2023-12-01", status: "Approved" as const },
    { name: "James Brown", pos: "Goalkeeper", incoming: "City U16", outgoing: "Chelsea U19", requestedBy: "Coach Martinez", date: "2024-03-10", status: "Rejected" as const },
  ];
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight wrap-break-word">Transfer Requests</h1>
          <p className="text-white/60 font-medium mt-1 md:mt-2 text-sm md:text-lg">Manage athlete transfers and requests across teams and academies</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto bg-[#111111] border border-white/20 hover:bg-white/5 text-white/80 h-12 md:h-10 px-4 rounded-xl flex justify-center items-center gap-2 text-xs font-bold shrink-0">
              <IconPlus size={16} /> Transfer Request
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0D0D0D] border border-white/10 rounded-3xl md:rounded-4xl p-6 md:p-8 w-[95vw] sm:w-full sm:max-w-125 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl font-black text-white font-orbitron uppercase tracking-tight mb-4 md:mb-8 text-center md:text-left wrap-break-word leading-tight">
                Transfer Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 md:space-y-6">
              <div className="space-y-1 md:space-y-2">
                <Input
                  placeholder="Enter full name"
                  className="bg-[#111111] border-white/20 h-12 md:h-14 rounded-xl px-4 md:px-6 text-sm md:text-base text-white placeholder:text-white/30"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label className="text-white/70 text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Transfer Type</Label>
                <div className="relative">
                  <Input
                    value="Outgoing (To Another Academy)"
                    readOnly
                    className="bg-[#111111] border-white/20 h-12 md:h-14 rounded-xl px-4 md:px-6 text-sm md:text-base text-white/90 pr-10 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                  <IconChevronDown size={18} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label className="text-white/70 text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Target Academy</Label>
                <div className="relative">
                  <Input
                    value="Select Academy"
                    readOnly
                    className="bg-[#111111] border-white/20 h-12 md:h-14 rounded-xl px-4 md:px-6 text-sm md:text-base text-white/60 pr-10 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                  />
                  <IconChevronDown size={18} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-white/40" />
                </div>
              </div>
              <div className="space-y-1 md:space-y-2">
                <Label className="text-white/70 text-[10px] md:text-[11px] font-bold uppercase tracking-wider">Reason for Transfer</Label>
                <Textarea
                  placeholder="Please provide a reason for this transfer request,,"
                  className="bg-[#111111] border-white/20 rounded-2xl p-4 md:p-6 text-sm md:text-base text-white placeholder:text-white/30 min-h-32 md:min-h-40 resize-none custom-scrollbar"
                />
              </div>
              <div className="flex flex-row gap-3 md:gap-4 pt-2 md:pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-transparent border-white/10 h-12 md:h-14 rounded-xl text-white text-[10px] md:text-sm font-bold hover:bg-white/5 w-full uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-[#1A1A1A] border border-white/10 h-12 md:h-14 rounded-xl text-white text-[10px] md:text-sm font-bold hover:bg-white/5 w-full uppercase tracking-wider">
                  Submit Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Summary Stats */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-6 md:p-10 flex flex-col gap-6 md:gap-10 w-full max-w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <RequestStatCard icon={IconDownload} value="3" label="Incoming Requests" iconColor="text-blue-500" />
          <RequestStatCard icon={IconUpload} value="2" label="Outgoing Requests" iconColor="text-purple-500" />
          <RequestStatCard icon={IconCheck} value="1" label="Approved" iconColor="text-emerald-500" />
          <RequestStatCard icon={IconClock} value="1" label="Pending" iconColor="text-yellow-500" />
          <RequestStatCard icon={IconCircleX} value="1" label="Rejected" iconColor="text-red-500" />
        </div>
      </div>
      {/* Tables Section */}
      <div className="flex flex-col gap-12">
        <TransferTable title="Incoming" data={mockData} />
        <TransferTable title="Outgoing" data={mockData} />
      </div>
    </div>
  );
};
const IconChevronDown = ({ size, className }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default TransferRequests;

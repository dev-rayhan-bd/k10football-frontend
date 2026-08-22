/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import {
  IconEye,
  IconCheck,
  IconX
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import { toast } from "sonner";

const StatusPill = ({ status }: { status: "Pending" | "Approved" | "Rejected" }) => {
  const styles = {
    Pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    Approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Rejected: "bg-red-500/10 text-red-400 border-red-500/20"
  };

  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};

interface ApprovalRow {
  name: string;
  category?: string;
  role: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface StoryRow {
  title: string;
  role: string;
  date: string;
  status: "Approved" | "Pending";
}

const SuperAdminApprovals = () => {
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [activeTab, setActiveTab] = useState("Academies");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStatus = localStorage.getItem("agent_profile_verification_status");
      const agentName = localStorage.getItem("agent_fullName") || "John Doe";
      const agentCerts = localStorage.getItem("agent_certifications") || "FIFA Licensed Agent";

      const baseApprovals: ApprovalRow[] = [
        { name: "Elite FC Academy", category: "Premier League Academy", role: "Academy", date: "2024-01-15", status: "Pending" },
        { name: "Champions Academy", category: "Premier League Academy", role: "Academy", date: "2024-02-01", status: "Approved" },
        { name: "Elite FC Academy", category: "Premier League Academy", role: "Academy", date: "2024-02-01", status: "Rejected" },
      ];

      // If the agent profile has a verification request active
      if (storedStatus && storedStatus !== "None") {
        setApprovals([
          {
            name: agentName,
            category: agentCerts,
            role: "Agent",
            date: new Date().toISOString().split("T")[0],
            status: storedStatus as "Pending" | "Approved" | "Rejected"
          },
          ...baseApprovals
        ]);
      } else {
        setApprovals(baseApprovals);
      }
    }
  }, []);

  const handleApprove = (row: ApprovalRow) => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.name === row.name && item.role === row.role) {
          return { ...item, status: "Approved" };
        }
        return item;
      })
    );

    if (row.role === "Agent") {
      localStorage.setItem("agent_profile_verification_status", "Approved");
      toast.success(`Agent "${row.name}" profile approved & verified!`);
    } else {
      toast.success(`${row.role} "${row.name}" approved successfully!`);
    }
  };

  const handleReject = (row: ApprovalRow) => {
    setApprovals((prev) =>
      prev.map((item) => {
        if (item.name === row.name && item.role === row.role) {
          return { ...item, status: "Rejected" };
        }
        return item;
      })
    );

    if (row.role === "Agent") {
      localStorage.setItem("agent_profile_verification_status", "Rejected");
      toast.error(`Agent "${row.name}" verification rejected.`);
    } else {
      toast.error(`${row.role} "${row.name}" verification rejected.`);
    }
  };

  const approvalColumns: Column<ApprovalRow>[] = [
    {
      header: "Name",
      key: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 overflow-hidden border border-white/20 shrink-0">
            <Image src={`https://i.pravatar.cc/150?u=${row.name}`} alt={row.name} className="w-full h-full object-cover" width={40} height={40} />
          </div>
          <div>
            <p className="text-white text-sm font-black uppercase line-clamp-1">{row.name}</p>
            {row.category && <p className="text-red-500 text-[10px] font-bold uppercase line-clamp-1">{row.category}</p>}
          </div>
        </div>
      )
    },
    { header: "Role", key: "role", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    { header: "Date", key: "date", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusPill status={row.status} />
    },
    {
      header: "Actions",
      key: "actions",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-3">
          <button className="text-white/40 hover:text-white transition-all"><IconEye size={18} /></button>
          <button
            onClick={() => handleApprove(row)}
            className="text-emerald-500/60 hover:text-emerald-500 transition-all"
          >
            <IconCheck size={18} />
          </button>
          <button
            onClick={() => handleReject(row)}
            className="text-red-500/60 hover:text-red-500 transition-all"
          >
            <IconX size={18} />
          </button>
        </div>
      )
    }
  ];

  const storyColumns: Column<StoryRow>[] = [
    {
      header: "Story Title",
      key: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 shrink-0">
            <Image src={`https://i.pravatar.cc/150?u=${row.title}`} alt={row.title} className="w-full h-full object-cover" width={40} height={40} />
          </div>
          <p className="text-white text-sm font-black uppercase max-w-62.5 leading-tight line-clamp-2">{row.title}</p>
        </div>
      )
    },
    { header: "Role", key: "role", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    { header: "Date", key: "date", align: "center", cellClassName: "text-white/60 text-sm font-medium" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (row) => <StatusPill status={row.status} />
    },
    {
      header: "Action",
      key: "actions",
      align: "center",
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <button className="text-white/40 hover:text-white transition-all"><IconEye size={18} /></button>
          <button className="text-emerald-500/60 hover:text-emerald-500 transition-all"><IconCheck size={18} /></button>
          <button className="text-red-500/60 hover:text-red-500 transition-all"><IconX size={18} /></button>
        </div>
      )
    }
  ];

  const storyData: StoryRow[] = [
    { title: "Academy Graduate Makes First Team Debut", role: "Academies", date: "2024-01-15", status: "Approved" },
    { title: "Agent Luis Secures Trial for Midfielder at Benfica Academy", role: "Agents", date: "2024-02-01", status: "Pending" },
    { title: "1-114 Winger Signed by National Talent Centre", role: "Clubs", date: "2023-12-01", status: "Approved" },
  ];

  const filteredApprovals = approvals.filter(item => {
    if (activeTab === "Academies") return item.role === "Academy";
    if (activeTab === "Agents") return item.role === "Agent";
    if (activeTab === "Clubs") return item.role === "Club";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 w-full">
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white font-orbitron tracking-tight uppercase wrap-break-word w-full">Approvals & Verifications</h1>
        <p className="text-white/60 font-medium mt-1 sm:mt-2 text-[11px] sm:text-sm md:text-lg">Review and approve pending applications</p>
      </div>

      {/* Approvals Section */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full shrink-0">
          <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight">Approvals</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto pb-1 sm:pb-0">
            {["Academies", "Agents", "Clubs"].map(tab => (
              <Button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                variant="outline" 
                className={`border-white/10 h-9 sm:h-10 px-3 sm:px-6 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
                  activeTab === tab 
                    ? "bg-white/10 text-white border-white/30" 
                    : "bg-black/40 text-white/60 hover:text-white"
                }`}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <DashboardTable columns={approvalColumns} data={filteredApprovals} />
        </div>
      </div>

      {/* Success Story Section */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-4 sm:p-6 md:p-10 flex flex-col gap-5 sm:gap-8 min-w-0 overflow-hidden w-full">
        <h2 className="text-lg sm:text-2xl font-black text-white font-orbitron uppercase tracking-tight shrink-0">Success Story</h2>
        
        <div className="w-full overflow-x-auto no-scrollbar">
          <DashboardTable columns={storyColumns} data={storyData} />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminApprovals;

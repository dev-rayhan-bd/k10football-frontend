/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  IconUsers,
  IconTrophy,
  IconBallFootball,
  IconPlus,
} from "@tabler/icons-react";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const teamsData = [
  { id: "1", name: "Santos U17", ageGroup: "Under 17", coachCount: 3, playerCount: 22, status: "Active" },
  { id: "2", name: "Santos U19", ageGroup: "Under 19", coachCount: 4, playerCount: 18, status: "Active" },
  { id: "3", name: "Santos U16", ageGroup: "Under 16", coachCount: 2, playerCount: 16, status: "Inactive" },
  { id: "4", name: "Santos U18", ageGroup: "Under 18", coachCount: 4, playerCount: 20, status: "Active" },
];

const Teams = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      teamName: "",
      ageGroup: "",
      coachCount: 1,
      playerCount: 11,
      status: "Active"
    }
  });

  const onSubmit = (data: any) => {
    console.log("Team data:", data);
    toast.success("Team added successfully!");
    setIsOpen(false);
    reset();
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-black text-white font-orbitron uppercase tracking-tight">Teams</h1>
        <p className="text-white/60 font-medium mt-2 text-lg">Manage your Coach and Players</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <DashboardStatCard icon={<IconBallFootball size={24} />} label="Teams" value="4" />
        <DashboardStatCard icon={<IconTrophy size={24} />} label="Total Coach" value="16" />
        <DashboardStatCard icon={<IconUsers size={24} />} label="Total Players" value="64" />
      </div>

      {/* Teams Table Section */}
      <div className="bg-[#111111] rounded-3xl border border-white/20 p-6 md:p-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-auto min-w-0">
            <h2 className="text-2xl font-black text-white font-orbitron uppercase tracking-tight truncate">My Teams</h2>
            <p className="text-white/60 font-medium text-xs uppercase tracking-widest mt-1 truncate">Coaches and Players</p>
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            <IconPlus size={16} />
            Add Team
          </button>
        </div>

        <div className="w-full overflow-x-auto rounded-2xl border border-white/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/20 bg-white/2">
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20">Team Name</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">Age Group</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">Coach</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">Players</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 border-r border-white/20 text-center">Status</th>
                <th className="py-5 px-6 text-[11px] font-black uppercase tracking-widest text-white/40 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamsData.map((team, index) => (
                <tr key={team.id} className={`group hover:bg-white/2 transition-colors ${index !== teamsData.length - 1 ? 'border-b border-white/20' : ''}`}>
                  <td className="py-6 px-6 border-r border-white/20">
                    <span className="text-sm font-bold text-white group-hover:text-[#00FF85] transition-colors">{team.name}</span>
                  </td>
                  <td className="py-6 px-6 border-r border-white/20 text-center text-sm font-medium text-white/60">
                    {team.ageGroup}
                  </td>
                  <td className="py-6 px-6 border-r border-white/20 text-center text-sm font-black text-white font-orbitron">
                    {team.coachCount}
                  </td>
                  <td className="py-6 px-6 border-r border-white/20 text-center text-sm font-black text-white font-orbitron">
                    {team.playerCount}
                  </td>
                  <td className="py-6 px-6 border-r border-white/20 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block ${team.status === "Active"
                      ? "bg-[#00FF85]/10 text-[#00FF85] border border-[#00FF85]/20 shadow-[0_0_15px_rgba(0,255,133,0.1)]"
                      : "bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20"
                      }`}>
                      {team.status}
                    </span>
                  </td>
                  <td className="py-6 px-6 text-center">
                    <TableActionButtons
                      onView={() => console.log("View", team.id)}
                      onEdit={() => console.log("Edit", team.id)}
                      onDelete={() => console.log("Delete", team.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl max-w-lg p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Add New Team
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Team Name</label>
              <input
                type="text"
                placeholder="e.g. Santos U17"
                className="w-full h-12 bg-white/2 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all placeholder:text-gray-600"
                {...register("teamName", { required: "Team Name is required" })}
              />
              {errors.teamName && <p className="text-xs text-red-500 font-bold">{errors.teamName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Age Group</label>
              <select
                className="w-full h-12 bg-[#111111] border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all"
                {...register("ageGroup", { required: "Age Group is required" })}
              >
                <option value="">Select Age Group</option>
                <option value="Under 16">Under 16</option>
                <option value="Under 17">Under 17</option>
                <option value="Under 18">Under 18</option>
                <option value="Under 19">Under 19</option>
              </select>
              {errors.ageGroup && <p className="text-xs text-red-500 font-bold">{errors.ageGroup.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Coach Count</label>
                <input
                  type="number"
                  min="1"
                  className="w-full h-12 bg-white/2 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all"
                  {...register("coachCount", { required: "Required" })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Player Count</label>
                <input
                  type="number"
                  min="1"
                  className="w-full h-12 bg-white/2 border border-white/10 rounded-xl px-4 text-sm font-bold text-white focus:outline-none focus:border-[#E31B23]/50 transition-all"
                  {...register("playerCount", { required: "Required" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/60 uppercase tracking-widest block">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input
                    type="radio"
                    value="Active"
                    className="accent-[#E31B23] w-4 h-4 cursor-pointer"
                    {...register("status")}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
                  <input
                    type="radio"
                    value="Inactive"
                    className="accent-[#E31B23] w-4 h-4 cursor-pointer"
                    {...register("status")}
                  />
                  Inactive
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5 justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#ff2d35] text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_15px_rgba(227,27,35,0.3)]"
              >
                Add Team
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;

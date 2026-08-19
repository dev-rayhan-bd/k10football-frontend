"use client";
import Image from "next/image";
import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import DashboardTable, { Column } from "@/components/dashboard/DashboardTable";
import TableActionButtons from "@/components/dashboard/TableActionButtons";
import { 
  DashboardPageHeader, 
  DashboardSection 
} from "@/components/dashboard/DashboardElements";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const successData = [
  { id: 1, title: "New Striker Joins IJ17 Squad from Local Rivals", category: "Player Promotion", date: "2024-01-15", status: "Approved", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, title: "Regional Championship Win Caps Historic Season", category: "Tournament Achievement", date: "2024-02-01", status: "Pending", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, title: "New Striker Joins IJ17 Squad from Local Rivals", category: "Seasonal Highlight", date: "2023-12-01", status: "Rejected", avatar: "https://i.pravatar.cc/150?u=3" },
];

const SuccessStory = () => {
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);

  const columns: Column<typeof successData[0]>[] = [
    {
      header: "Story Title",
      key: "title",
      render: (item) => (
        <div className="flex items-center gap-2 sm:gap-3 py-2">
          <Image src={item.avatar} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shrink-0" alt="avatar" width={100} height={100} />
          <span className="text-xs sm:text-sm font-bold text-white max-w-40 sm:max-w-xs leading-snug line-clamp-2 sm:line-clamp-none whitespace-normal">{item.title}</span>
        </div>
      ),
    },
    { header: "Category", key: "category", align: "center", cellClassName: "text-sm text-gray-400" },
    { header: "Date", key: "date", align: "center", cellClassName: "text-sm text-gray-400" },
    {
      header: "Status",
      key: "status",
      align: "center",
      render: (item) => (
        <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          item.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
          item.status === 'Pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      header: "Action",
      key: "actions",
      align: "right",
      render: () => <TableActionButtons onView={() => {}} onEdit={() => {}} onDelete={() => {}} />,
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8 pb-8 md:pb-12 min-w-0">
      <DashboardPageHeader 
        title="Success Story" 
        subtitle="Share your academy's latest achievement or success Story" 
        action={{
          label: "Add Success Story",
          icon: <IconPlus size={18} />,
          onClick: () => setIsAddStoryOpen(true)
        }}
      />
      <DashboardSection>
        <DashboardTable columns={columns} data={successData} className="border-white/10" />
      </DashboardSection>

      <Dialog open={isAddStoryOpen} onOpenChange={setIsAddStoryOpen}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white rounded-3xl w-[95vw] sm:max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase text-white font-orbitron tracking-tight">
              Add Success Story
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Story Title</Label>
              <Input placeholder="Enter title" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</Label>
              <Input placeholder="e.g. Player Promotion" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date</Label>
              <Input type="date" className="bg-white/5 border-white/10 text-white scheme-dark" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cover Image</Label>
              <Input type="file" accept="image/*" className="bg-white/5 border-white/10 text-white file:text-white" />
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
              <Button variant="outline" className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10" onClick={() => setIsAddStoryOpen(false)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0" onClick={() => setIsAddStoryOpen(false)}>Submit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuccessStory;

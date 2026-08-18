"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePlayer } from "@/lib/hooks/usePlayer";

interface AddPlayerModalProps {
  children: React.ReactNode;
}

const AddPlayerModal = ({ children }: AddPlayerModalProps) => {
  const { handleCreatePlayer } = usePlayer();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    rating: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.position || !formData.rating) return;
    
    handleCreatePlayer({
      fullName: formData.fullName,
      position: formData.position,
      rating: Number(formData.rating),
    });
    
    setOpen(false);
    setFormData({ fullName: "", position: "", rating: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 bg-[#111] border-white/20 text-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold uppercase italic tracking-tight">Add New Player</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs uppercase font-bold text-gray-400">Full Name</Label>
            <Input 
              id="fullName" 
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({...prev, fullName: e.target.value}))}
              placeholder="e.g. Cristiano Ronaldo"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#E31B23]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position" className="text-xs uppercase font-bold text-gray-400">Position</Label>
            <Input 
              id="position" 
              value={formData.position}
              onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
              placeholder="e.g. Forward"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#E31B23]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-xs uppercase font-bold text-gray-400">Initial Rating</Label>
            <Input 
              id="rating" 
              type="number"
              min="1"
              max="99"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({...prev, rating: e.target.value}))}
              placeholder="e.g. 85"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#E31B23]"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-[#E31B23] hover:bg-red-700 text-white font-bold tracking-wider rounded-xl mt-4">
            Create Player
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlayerModal;

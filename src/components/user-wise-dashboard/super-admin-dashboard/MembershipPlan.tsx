"use client";

import React from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const plans = [
    {
        name: "Players",
        price: "$19.99",
        features: [
            "Production of analysis materials",
            "Upload videos, photos, and game reports",
            "Exposure of your profile to licensed agents and professional clubs",
            "Transfer of your analysis materials to other clubs"
        ]
    },
    {
        name: "Coaches",
        price: "$19.99",
        features: [
            "Production of analysis materials",
            "Upload videos, photos, courses and certificates",
            "Exposure of your profile to licensed agents and professional clubs",
            "Transfer of your analysis materials to other clubs"
        ]
    },
    {
        name: "Football Agent",
        price: "$89.00",
        features: [
            "Access to all athlete and coach profiles on the platform",
            "Detailed analysis of athletes' materials",
            "Direct contact wth athletes' parents",
            "Faster and More objective pre-field analysis",
            "Promotion of tryouts and events on the platform"
        ]
    },
    {
        name: "Professional Clubs",
        price: "$159.00",
        features: [
            "Access to all athlete and coach profiles on the platform",
            "Detailed analysis of athletes' materials",
            "Direct contact wth athletes' parents",
            "Faster and More objective analysis before sending scouts to the field",
            "Display of club's trials on the platform"
        ]
    },
    {
        name: "Grassroot Clubs",
        price: "$109.90",
        features: [
            "Production of analysis materials for up to 3 coaches and 30 players",
            "Upload videos, photos, and game reports",
            "Exposure of your club profile to licensed agents and professional clubs",
            "Display of your club's trials of the platform",
            "Commission for each game report submitted by an athlete"
        ]
    }
];

const SuperAdminMembershipPlans = () => {
return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 pb-10 w-full min-w-0 overflow-hidden text-white min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 w-full shrink-0">
            <div className="min-w-0 flex-1">
                <h1 className="text-3xl sm:text-5xl font-black text-white font-orbitron tracking-tight truncate">Membership Plans</h1>
                <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-lg truncate">Manage subscription plans for all user roles</p>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="bg-[#27272a] hover:bg-[#3f3f46] text-white border border-[#3f3f46] rounded-xl px-4 flex items-center gap-2 h-10 text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 w-full sm:w-auto">
                        <Plus className="w-4 h-4" /> Add Plan
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#18181b] border-[#27272a] text-white sm:max-w-106.25 [&>button]:hidden p-6 rounded-3xl w-[90vw] sm:w-full">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-white font-orbitron tracking-tight">Add Plan</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 sm:space-y-5 mt-2">
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="text-gray-400 font-medium">Plan Name</Label>
                            <Input 
                                className="bg-[#1e1e20] border-[#2c2c30] text-white h-10 sm:h-12 focus-visible:ring-1 focus-visible:ring-gray-500 rounded-xl placeholder:text-gray-500" 
                                placeholder="Enter Plan Name" 
                            />
                        </div>
                        
                        <div className="space-y-1.5 sm:space-y-2">
                            <Label className="text-gray-400 font-medium">Plan Category</Label>
                            <div className="flex gap-2 sm:gap-3">
                                <Input 
                                    className="bg-[#1e1e20] border-[#2c2c30] text-white h-10 sm:h-12 focus-visible:ring-1 focus-visible:ring-gray-500 rounded-xl placeholder:text-gray-500 flex-1" 
                                    placeholder="Enter Plan Name" 
                                />
                                <Button size="icon" className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 bg-[#1e1e20] hover:bg-[#2c2c30] border border-[#2c2c30] rounded-xl">
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
                                </Button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-gray-400 font-medium">Start Date</Label>
                                <div className="relative">
                                    <Input 
                                        type="text"
                                        defaultValue="10/12/2025"
                                        className="bg-[#1e1e20] border-[#2c2c30] text-white h-10 sm:h-12 text-center focus-visible:ring-1 focus-visible:ring-gray-500 rounded-xl" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 sm:space-y-2">
                                <Label className="text-gray-400 font-medium">End Date</Label>
                                <div className="relative">
                                    <Input 
                                        type="text"
                                        defaultValue="10/01/2026"
                                        className="bg-[#1e1e20] border-[#2c2c30] text-white h-10 sm:h-12 text-center focus-visible:ring-1 focus-visible:ring-gray-500 rounded-xl" 
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-1 pb-1">
                            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-400 bg-transparent text-gray-200 cursor-pointer shrink-0">
                                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </div>
                            <Label className="text-sm sm:text-[15px] font-medium text-gray-200 cursor-pointer">Active</Label>
                        </div>
                        
                        <div className="space-y-1.5 sm:space-y-2 pb-2">
                            <Label className="text-gray-400 font-medium">Plan Price</Label>
                            <Input 
                                className="bg-[#1e1e20] border-[#2c2c30] text-white h-10 sm:h-12 focus-visible:ring-1 focus-visible:ring-gray-500 rounded-xl placeholder:text-gray-500" 
                                placeholder="Enter Price" 
                            />
                        </div>
                        
                        <div className="flex gap-3 sm:gap-4 pt-2">
                            <DialogTrigger asChild>
                                <Button variant="outline" className="flex-1 bg-transparent border-[#3f3f46] text-white hover:bg-[#27272a] hover:text-white h-10 sm:h-12 rounded-xl font-medium min-w-0">
                                    Cancel
                                </Button>
                            </DialogTrigger>
                            <Button className="flex-1 bg-[#333336] hover:bg-[#4a4a4e] text-white border-0 h-10 sm:h-12 rounded-xl font-medium min-w-0">
                                Save
                            </Button>
                        </div>
                        
                        <div className="flex items-start sm:items-center space-x-3 pt-1">
                            <Checkbox id="defaultPricing" className="border-gray-500 bg-gray-500 data-[state=checked]:bg-gray-500 data-[state=checked]:text-white h-4 w-4 sm:h-4.5 sm:w-4.5 rounded-sm mt-0.5 sm:mt-0 shrink-0" />
                            <Label htmlFor="defaultPricing" className="text-sm sm:text-[15px] font-medium text-gray-400 cursor-pointer leading-tight sm:leading-normal">Default Pricing</Label>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 w-full shrink-0">
            {plans.map((plan, index) => (
                <div key={index} className="bg-[#111111] border border-white/20 rounded-3xl sm:rounded-[40px] p-5 sm:p-6 md:p-8 flex flex-col h-full shadow-lg overflow-hidden min-w-0">
                    <div className="flex justify-center mb-6">
                        <span className="text-[10px] font-black tracking-widest text-gray-300 px-4 py-1.5 rounded-full border border-white/20 bg-white/5">
                            ACTIVE
                        </span>
                    </div>
                    
                    <h2 className="text-center text-xl sm:text-[22px] font-black font-orbitron mb-4 text-white truncate">{plan.name}</h2>
                    
                    <div className="text-center mb-6 sm:mb-8 flex items-baseline justify-center">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight text-white truncate">{plan.price}</span>
                        <span className="text-gray-400 text-xs sm:text-sm ml-1 font-medium shrink-0">/month</span>
                    </div>
                    
                    <div className="grow space-y-4 sm:space-y-5 mb-8 sm:mb-10 min-w-0">
                        {plan.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3 w-full">
                                <Check className="w-4.5 h-4.5 text-emerald-500 mt-0.5 shrink-0" strokeWidth={3} />
                                <span className="text-xs sm:text-sm text-white/60 leading-snug">{feature}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-auto pt-4 flex justify-center w-full">
                        <div className="flex rounded-xl border border-white/20 overflow-hidden w-full max-w-70">
                            <button className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm py-2.5 sm:py-3 px-3 transition-colors font-bold min-w-0 truncate">
                                Edit Plan
                            </button>
                            <button className="flex-1 bg-transparent hover:bg-white/5 text-white/70 text-xs sm:text-sm py-2.5 sm:py-3 px-3 transition-colors font-bold min-w-0 truncate border-l border-white/20">
                                Deactivate
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);
}

export default SuperAdminMembershipPlans;

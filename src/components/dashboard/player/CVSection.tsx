'use client'

import React from "react";
import { CheckCircle2, Download, Share2 } from 'lucide-react';

const CVSection = () => {
  const sections = [
    { name: 'Personal Info', completed: true },
    { name: 'Physical Stats', completed: true },
    { name: 'Skills & Attributes', completed: true },
    { name: 'Match History', completed: true },
    { name: 'References', completed: false }
  ];

  return (
    <div className="py-4">
      <div className="mx-auto">
        {/* Main Card */}
        <div className="border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 bg-black/40 backdrop-blur-xs shadow-xl">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-heading text-white mb-6 uppercase">My CV</h1>

          {/* Tabs/Sections */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 md:gap-8 mb-6 sm:mb-8 pb-6 border-b border-white/10">
            {sections.map((section) => (
              <div key={section.name} className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${section.completed ? 'text-green-500' : 'text-gray-600'}`} />
                <span className="text-gray-300 text-xs sm:text-sm">{section.name}</span>
              </div>
            ))}
          </div>

          {/* Content Section */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 lg:gap-8">
            {/* Left - Profile Completion */}
            <div className="border border-white/10 rounded-xl p-5 bg-black/60 min-w-fit">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Profile Completion</p>
              <p className="text-red-500 text-2xl sm:text-3xl font-bold mb-3 font-orbitron">85%</p>
              <div className="w-full sm:w-48 rounded-full h-2 overflow-hidden bg-gray-800">
                <div className="bg-red-600 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Middle - Gold Ready Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-yellow-500 font-bold text-xs sm:text-sm tracking-widest font-orbitron">GOLD READY</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Your CV meets Gold tier standards and is ready to share with top clubs and agents.
              </p>
            </div>

            {/* Right - Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-fit">
              <button className="px-5 py-2.5 border border-gray-600 text-white rounded-xl hover:border-gray-400 transition flex items-center justify-center gap-2 text-xs font-orbitron uppercase tracking-wider cursor-pointer">
                <Download className="w-4 h-4 text-red-500" />
                Download PDF
              </button>
              <button className="px-5 py-2.5 border border-gray-600 text-white rounded-xl hover:border-gray-400 transition flex items-center justify-center gap-2 text-xs font-orbitron uppercase tracking-wider cursor-pointer">
                <Share2 className="w-4 h-4 text-red-500" />
                Share with Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVSection;

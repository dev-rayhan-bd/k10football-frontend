
"use client";

import React from "react";
import { useGetPublicStatsQuery } from "@/redux/features/player/playerApi";

const ServiceSection = () => {
  const { data, isLoading } = useGetPublicStatsQuery();
  const servicesStats = data?.data?.servicesStats;

  const stats = [
    {
      number: isLoading ? "..." : (servicesStats?.activePlayers?.count ?? 0),
      label: servicesStats?.activePlayers?.label || "Active Players",
    },
    {
      number: isLoading ? "..." : (servicesStats?.professionalScouts?.count ?? 0),
      label: servicesStats?.professionalScouts?.label || "Professional Scouts",
    },
    {
      number: isLoading ? "..." : (servicesStats?.countries?.count ?? 0),
      label: servicesStats?.countries?.label || "Countries",
    },
    {
      number: isLoading ? "..." : (servicesStats?.matchReports?.count ?? 0),
      label: servicesStats?.matchReports?.label || "Match Reports",
    },
  ];

  return (
    <div className="container py-12 sm:py-20 px-4 sm:px-6 mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="px-4 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: '#00FF62', color: '#000000' }}>
            Our Services
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold font-heading mb-4">
            Transforming Football <span style={{ color: '#00FF62' }}>Analytics</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional performance tracking and career development tools designed for modern football players, scouts, and clubs.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-lg p-8 border bg-cardBg "
            >
              <div className="text-3xl font-bold mb-2" style={{ color: '#00FF62' }}>
                {stat.number}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
  )
}

export default ServiceSection

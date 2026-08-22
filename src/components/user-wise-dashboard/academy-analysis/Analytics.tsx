/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { 
  IconUsers, 
  IconUser, 
  IconSchool, 
  IconFileText, 
  IconTrophy 
} from "@tabler/icons-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useAppSelector } from "@/lib/hooks/reduxHooks";

const AnalyticsStatCard = ({ icon: Icon, value, label }: { icon: any, value: string | number, label: string }) => (
  <div className="bg-[#0A0A0A] border border-white/20 rounded-2xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 flex-1 min-w-0">
    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
       <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </div>
    <div className="truncate">
      <p className="text-white text-2xl md:text-3xl font-black font-orbitron truncate">{value}</p>
      <p className="text-white/40 text-[9px] md:text-[11px] font-bold uppercase tracking-wider truncate">{label}</p>
    </div>
  </div>
);

const pieData = [
  { name: "Gold CV", value: 60 },
  { name: "Silver CV", value: 40 },
];

const engagementData = [
  { name: "Jan-Feb", completed: 5, pending: 3 },
  { name: "Mar-Apr", completed: 4, pending: 6 },
  { name: "May-Jun", completed: 7, pending: 4 },
  { name: "Jul-Aug", completed: 8, pending: 3 },
  { name: "Sept-Oct", completed: 5, pending: 3 },
  { name: "Nov-Dec", completed: 3, pending: 4 },
];

const Analytics = () => {
  const players = useAppSelector((state) => state.player.players);

  // Deterministic age mapper for mock players to provide a rich distribution
  const getPlayerAge = (player: any) => {
    const parsedAge = parseInt(player.age);
    if (!isNaN(parsedAge) && parsedAge !== 24) return parsedAge;
    
    const mockAges: Record<number, number> = {
      1: 8, 2: 10, 3: 21, 4: 19, 5: 22,
      6: 12, 7: 15, 8: 7, 9: 13, 10: 16,
      11: 18, 12: 23, 13: 20, 14: 25, 15: 11
    };
    return mockAges[player.id] || 16;
  };

  const ageGroups = [
    { category: "7-8", count: 0 },
    { category: "9-10", count: 0 },
    { category: "11-12", count: 0 },
    { category: "13-14", count: 0 },
    { category: "15-16", count: 0 },
    { category: "17-18", count: 0 },
    { category: "19-20", count: 0 },
    { category: "21+", count: 0 },
  ];

  players.forEach((player) => {
    const age = getPlayerAge(player);
    if (age >= 7 && age < 9) ageGroups[0].count++;
    else if (age >= 9 && age < 11) ageGroups[1].count++;
    else if (age >= 11 && age < 13) ageGroups[2].count++;
    else if (age >= 13 && age < 15) ageGroups[3].count++;
    else if (age >= 15 && age < 17) ageGroups[4].count++;
    else if (age >= 17 && age < 19) ageGroups[5].count++;
    else if (age >= 19 && age < 21) ageGroups[6].count++;
    else if (age >= 21) ageGroups[7].count++;
  });
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black text-white font-orbitron uppercase tracking-tight">Analytics</h1>
        <p className="text-white/60 font-medium mt-2 text-sm md:text-lg">Deep insights into player and team performance</p>
      </div>

      {/* Summary Stats */}
      <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-5 md:p-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <AnalyticsStatCard icon={IconUsers} value="4" label="Teams" />
          <AnalyticsStatCard icon={IconUser} value="64" label="Players" />
          <AnalyticsStatCard icon={IconSchool} value="12" label="Coaches" />
          <AnalyticsStatCard icon={IconFileText} value="12" label="Game Reports" />
          <AnalyticsStatCard icon={IconTrophy} value="60%" label="CV Silver to Gold" />
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="flex flex-col gap-8">
        {/* Age Category */}
        <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-3 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-hidden">
           <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight px-1">Age Category</h2>
           <div className="h-[300px] sm:h-[400px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={ageGroups} margin={{ top: 10, right: 15, left: -25, bottom: 25 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis 
                     dataKey="category" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: '#888', fontSize: 9 }} 
                     interval={0}
                     angle={-45}
                     textAnchor="end"
                     padding={{ left: 10, right: 10 }}
                     tickMargin={8}
                   />
                   <YAxis hide />
                   <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                     contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                   />
                   <Bar 
                     dataKey="count" 
                     name="Player Count"
                     fill="#E31B23" 
                     radius={[4, 4, 0, 0]}
                   />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
           {/* CV Status Distribution */}
           <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-3 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-hidden">
              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight text-center md:text-left px-1">CV Status Distribution</h2>
              <div className="h-[300px] sm:h-[400px] w-full relative flex flex-col items-center justify-center min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="45%"
                         innerRadius={0}
                         outerRadius={140}
                         paddingAngle={0}
                         dataKey="value"
                         stroke="none"
                       >
                          <Cell fill="#991111" />
                          <Cell fill="#FFFFFF" />
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="flex gap-8 mt-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-[#991111] rounded-sm" />
                       <span className="text-white/60 text-xs font-bold uppercase">Gold CV</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 bg-white rounded-sm" />
                       <span className="text-white/60 text-xs font-bold uppercase">Silver CV</span>
                    </div>
                 </div>
                 {/* Percent Labels on the Chart */}
                 <div className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 text-white font-black font-orbitron text-2xl -rotate-45">60%</div>
                 <div className="absolute top-[55%] left-[55%] -translate-x-1/2 -translate-y-1/2 text-[#111111] font-black font-orbitron text-2xl rotate-15">40%</div>
              </div>
           </div>

           {/* Game Reports Engagement */}
           <div className="bg-[#111111] border border-white/20 rounded-3xl md:rounded-[40px] p-3 sm:p-6 md:p-10 flex flex-col gap-6 md:gap-8 overflow-hidden">
              <h2 className="text-xl md:text-2xl font-black text-white font-orbitron uppercase tracking-tight px-1">Game Reports Engagement</h2>
              <div className="h-[300px] sm:h-[400px] w-full min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData} margin={{ top: 10, right: 15, left: -25, bottom: 10 }}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                       <XAxis 
                         dataKey="name" 
                         tick={{ fill: '#888', fontSize: 10 }} 
                         tickLine={false} 
                         axisLine={false}
                         interval="preserveStartEnd"
                         dy={10}
                       />
                       <YAxis 
                         tick={{ fill: '#888', fontSize: 10 }} 
                         tickLine={false} 
                         axisLine={false}
                       />
                       <Tooltip 
                         cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                         contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #ffffff20', borderRadius: '12px' }}
                       />
                       <Bar dataKey="completed" fill="#ffffff20" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="pending" fill="#ffffff40" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

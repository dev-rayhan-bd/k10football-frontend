"use client"
import { ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  return (
    <section className="mb-6 sm:mb-10 bg-background text-foreground">
      {/* Header */}
      <div className="pt-8 sm:pt-16 pb-6 sm:pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight">
          Analysis{' '}
          <span className="text-primary font-bold">CVs</span>
        </h1>
      </div>

      {/* Search and Filters Container */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-border shadow-xl">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
            <input
              type="text"
              placeholder="Search players, coaches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition"
            />
            <button className="bg-input border border-border hover:bg-white/10 rounded-xl px-6 py-3 text-foreground font-medium text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer">
              <Search size={18} />
              Search
            </button>
          </div>

          {/* Advanced Filters Header */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
              <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center">
                <ChevronDown size={14} />
              </div>
              <span className="font-semibold uppercase tracking-wider text-[11px] font-orbitron">Advanced Filters</span>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category / Genre Dropdown */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="">Select Category</option>
              <option value="pop">Players</option>
              <option value="rock">Coaches</option>
              <option value="hiphop">Agents</option>
            </select>

            {/* Age Groups Dropdown */}
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="">Select Age Group</option>
              <option value="18-25">18-25</option>
              <option value="26-35">26-35</option>
              <option value="36-45">36-45</option>
              <option value="46+">46+</option>
            </select>

            {/* Position Dropdown */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition appearance-none cursor-pointer"
            >
              <option value="">Select Position</option>
              <option value="vocalist">Forward (ST / RW / LW)</option>
              <option value="guitarist">Midfielder (CAM / CM / CDM)</option>
              <option value="drummer">Defender (CB / LB / RB)</option>
              <option value="bassist">Goalkeeper (GK)</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
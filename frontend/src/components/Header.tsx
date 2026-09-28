import React from 'react';
import { User } from '../types/auth';
import { Search, Bell, Filter, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  onRefresh: () => void;
  onNavigateToAssets: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  searchQuery,
  setSearchQuery,
  selectedDistrict,
  setSelectedDistrict,
  onRefresh,
  onNavigateToAssets,
  onLogout,
}) => {
  const districts = [
    'ALL',
    'Ahmedabad',
    'Surat',
    'Vadodara',
    'Rajkot',
    'Gandhinagar',
    'Bhavnagar',
    'Junagadh',
    'Kutch',
    'Anand',
    'Mehsana',
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onNavigateToAssets();
            }}
            placeholder={`Search ${user.assetCategory !== 'ALL' ? user.assetCategory : ''} Infrastructure (Code, Name, District)...`}
            className="w-full bg-slate-100 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition"
          />
        </div>
      </div>

      {/* Controls & User Profile */}
      <div className="flex items-center gap-3">
        {/* District Selector */}
        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500 font-semibold">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
          >
            {districts.map((d) => (
              <option key={d} value={d} className="bg-white text-slate-900">
                {d === 'ALL' ? 'All Districts' : d}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Refresh Application Data"
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-1">
          <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-extrabold text-xs uppercase">
            {user.name.substring(0, 2)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              {user.name}
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {user.assetCategory}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono font-medium">{user.role}</div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 transition ml-2"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

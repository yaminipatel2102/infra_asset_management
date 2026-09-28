import React from 'react';
import { User } from '../types/auth';
import { hasPermission, Permission } from '../utils/permissions';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  MapPin,
  FileSpreadsheet,
  Building,
  ShieldCheck,
  ChevronRight,
  Users
} from 'lucide-react';

interface SidebarProps {
  user: User;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  openAddAssetModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, currentTab, onSelectTab, openAddAssetModal }) => {
  const navItems: Array<{ id: string; label: string; icon: any; perm: Permission }> = [
    { id: 'dashboard', label: 'R&B Master Dashboard', icon: LayoutDashboard, perm: 'DASHBOARD_VIEW' },
    { id: 'assets', label: user.assetCategory !== 'ALL' ? `${user.assetCategory} Assets` : 'All Infrastructure', icon: Building2, perm: 'ASSET_VIEW' },
    { id: 'map', label: 'GIS Asset Map', icon: MapPin, perm: 'MAP_VIEW' },
    { id: 'inspections', label: 'Field Inspections', icon: ClipboardCheck, perm: 'INSPECTION_VIEW' },
    { id: 'maintenance', label: 'Work Orders', icon: Wrench, perm: 'MAINTENANCE_VIEW' },
    { id: 'priority', label: 'Priority Matrix', icon: AlertTriangle, perm: 'MAINTENANCE_VIEW' },
    { id: 'reports', label: 'Reports & CSV', icon: FileSpreadsheet, perm: 'REPORT_VIEW' },
  ];

  if (hasPermission(user.role, 'USER_VIEW')) {
    navItems.push({ id: 'users', label: 'User Management', icon: Users, perm: 'USER_VIEW' });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none shadow-sm">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-extrabold text-lg font-outfit">
            R&B
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 font-outfit uppercase">
              R&B Asset Portal
            </h1>
            <p className="text-xs text-blue-600 font-semibold tracking-wide">
              Govt of Gujarat
            </p>
          </div>
        </div>

        {/* Officer Context Badge */}
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="truncate">
            <span className="font-bold text-slate-900 block truncate">{user.name}</span>
            <span className="text-[11px] text-blue-700 font-semibold">{user.role}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-100" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Action Button & Footer */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        {hasPermission(user.role, 'ASSET_CREATE') && (
          <button
            onClick={openAddAssetModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2"
          >
            <Building className="w-4 h-4" />
            <span>+ Add {user.assetCategory !== 'ALL' ? user.assetCategory : 'Asset'}</span>
          </button>
        )}

        <div className="text-[10px] text-slate-400 text-center font-medium">
          R&B Lifecycle Management Platform v3.0
        </div>
      </div>
    </aside>
  );
};

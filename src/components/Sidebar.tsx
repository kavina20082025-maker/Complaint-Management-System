import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Activity,
  Search,
  Star,
  Megaphone,
  Building2,
  Sparkles,
  Inbox,
  ClockAlert,
  Wrench,
  BarChart3,
  ShieldCheck,
  Users,
  FileText,
  Download,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  urgentCount?: number;
  slaWarningCount?: number;
  onExportData?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  urgentCount = 0,
  slaWarningCount = 0,
  onExportData,
}) => {
  const isStudent = currentUser.role === 'student';
  const isStaff = currentUser.role === 'staff' || currentUser.role === 'department_head';
  const isLeader = currentUser.role === 'department_head' || currentUser.role === 'admin';
  const isAdmin = currentUser.role === 'admin';

  const NavItem = ({
    view,
    label,
    icon: Icon,
    badge,
    badgeColor = 'bg-rose-500',
  }: {
    view: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }) => {
    const active = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
          active
            ? 'bg-slate-900 text-white dark:bg-indigo-600 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && Number(badge) > 0 && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white tabular-nums ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-60 shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-3 space-y-6">
      {/* Primary section */}
      <div>
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Overview
        </div>
        <div className="space-y-1">
          <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} />
          {isStudent && (
            <NavItem
              view="submit"
              label="New Grievance"
              icon={PlusCircle}
            />
          )}
          <NavItem view="status-board" label="Live Status Board" icon={Activity} />
          <NavItem view="search" label="Search & Filters" icon={Search} />
          <NavItem view="watchlist" label="My Watchlist" icon={Star} />
          <NavItem view="announcements" label="Campus Notices" icon={Megaphone} />
          <NavItem view="services" label="Service Directory" icon={Building2} />
        </div>
      </div>

      {/* Operations & Smart Tools */}
      <div>
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Smart Operations
        </div>
        <div className="space-y-1">
          <NavItem
            view="assistant"
            label="CampusCare Assistant"
            icon={Sparkles}
          />
          {(isStaff || isAdmin) && (
            <NavItem
              view="work-queue"
              label="Staff Work Queue"
              icon={Inbox}
              badge={urgentCount > 0 ? urgentCount : undefined}
              badgeColor="bg-amber-500"
            />
          )}
          {isLeader && (
            <NavItem
              view="sla-warning"
              label="SLA Warning Center"
              icon={ClockAlert}
              badge={slaWarningCount > 0 ? slaWarningCount : undefined}
              badgeColor="bg-rose-500"
            />
          )}
          {(isStaff || isAdmin) && (
            <NavItem
              view="maintenance"
              label="Service Maintenance"
              icon={Wrench}
            />
          )}
          {isLeader && (
            <NavItem
              view="analytics"
              label="Analytics & Trends"
              icon={BarChart3}
            />
          )}
        </div>
      </div>

      {/* Admin Command Center */}
      {isAdmin && (
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Administration
          </div>
          <div className="space-y-1">
            <NavItem
              view="admin-command"
              label="Command Center"
              icon={ShieldCheck}
            />
            <NavItem view="users" label="User Directory" icon={Users} />
            <NavItem view="audit" label="Audit Trail" icon={FileText} />
          </div>
        </div>
      )}

      {/* Personal / Account Utility */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Account
        </div>
        <div className="space-y-1">
          <NavItem view="profile" label="My Profile" icon={UserCheck} />
          {isStudent && onExportData && (
            <button
              onClick={onExportData}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors text-left"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Privacy Data</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

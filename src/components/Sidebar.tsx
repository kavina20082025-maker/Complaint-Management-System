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
  QrCode,
  ShieldAlert,
  GraduationCap,
  Briefcase,
  X,
  Compass,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentUser: User;
  currentView: string;
  onNavigate: (view: string) => void;
  urgentCount?: number;
  slaWarningCount?: number;
  onExportData?: () => void;
  onExportDeptData?: () => void;
  onOpenScanner?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  urgentCount = 0,
  slaWarningCount = 0,
  onExportData,
  onExportDeptData,
  onOpenScanner,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isStudent = currentUser.role === 'student';
  const isStaff = currentUser.role === 'staff';
  const isDeptHead = currentUser.role === 'department_head';
  const isAdmin = currentUser.role === 'admin';

  // Role Theme Color Definitions
  const getRoleTheme = () => {
    if (isStudent) {
      return {
        badgeText: 'STUDENT PORTAL',
        badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
        activeNav: 'bg-emerald-600 text-white shadow-xs',
        accentIcon: 'text-emerald-500',
        roleSubtitle: 'Student Grievance & Tracking Desk',
        icon: GraduationCap,
      };
    }
    if (isStaff) {
      return {
        badgeText: 'STAFF SPECIALIST',
        badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
        activeNav: 'bg-indigo-600 text-white shadow-xs',
        accentIcon: 'text-indigo-500',
        roleSubtitle: `${currentUser.department} Operations Desk`,
        icon: Briefcase,
      };
    }
    if (isDeptHead) {
      return {
        badgeText: 'DEPT HEAD COMMAND',
        badgeBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
        activeNav: 'bg-violet-600 text-white shadow-xs',
        accentIcon: 'text-violet-500',
        roleSubtitle: `${currentUser.department} Leadership HQ`,
        icon: ShieldAlert,
      };
    }
    return {
      badgeText: 'INSTITUTIONAL ADMIN',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      activeNav: 'bg-slate-900 text-white dark:bg-amber-600 shadow-xs',
      accentIcon: 'text-amber-500',
      roleSubtitle: 'Campus-wide Administration',
      icon: ShieldCheck,
    };
  };

  const theme = getRoleTheme();
  const RoleIcon = theme.icon;

  const handleItemClick = (view: string) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  };

  const handleActionClick = (action?: () => void) => {
    if (action) action();
    if (onCloseMobile) onCloseMobile();
  };

  const NavItem = ({
    view,
    label,
    icon: Icon,
    badge,
    badgeColor = 'bg-rose-500',
    highlight = false,
  }: {
    view: string;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
    highlight?: boolean;
  }) => {
    const active = currentView === view;
    return (
      <button
        onClick={() => handleItemClick(view)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
          active
            ? theme.activeNav
            : highlight
            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={`w-4 h-4 shrink-0 ${
              active
                ? 'text-white'
                : highlight
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && (typeof badge === 'string' || Number(badge) > 0) && (
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white tabular-nums shrink-0 ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </button>
    );
  };

  const ActionItem = ({
    label,
    icon: Icon,
    onClick,
    badge,
    badgeColor = 'bg-emerald-600',
  }: {
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
    badge?: string;
    badgeColor?: string;
  }) => (
    <button
      onClick={() => handleActionClick(onClick)}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors text-left"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      {badge && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${badgeColor} shrink-0`}
        >
          {badge}
        </span>
      )}
    </button>
  );

  const sidebarContent = (
    <div className="space-y-6">
      {/* Role Identity Card */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1.5">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${theme.badgeBg}`}
          >
            {theme.badgeText}
          </span>
          <RoleIcon className={`w-4 h-4 ${theme.accentIcon}`} />
        </div>
        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
          {currentUser.name}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {theme.roleSubtitle}
        </div>
        {currentUser.department && (
          <div className="mt-1.5 text-[10px] inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
            <Compass className="w-3 h-3 text-slate-400" />
            <span className="truncate">{currentUser.department}</span>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. STUDENT NAVIGATION (Dedicated to reporting, tracking, privacy) */}
      {/* ============================================================== */}
      {isStudent && (
        <>
          {/* Section: Grievance Desk */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              My Grievance Desk
            </div>
            <div className="space-y-1">
              <NavItem
                view="dashboard"
                label="My Grievance Dashboard"
                icon={LayoutDashboard}
              />
              <NavItem
                view="submit"
                label="Report New Grievance"
                icon={PlusCircle}
                badge="Priority"
                badgeColor="bg-emerald-600"
                highlight={true}
              />
              <NavItem
                view="status-board"
                label="Live Status Board"
                icon={Activity}
              />
              <NavItem
                view="watchlist"
                label="My Watchlist"
                icon={Star}
              />
            </div>
          </div>

          {/* Section: Campus & Support */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Campus & Support
            </div>
            <div className="space-y-1">
              {onOpenScanner && (
                <ActionItem
                  label="Scan Inspection QR"
                  icon={QrCode}
                  onClick={onOpenScanner}
                  badge="Camera"
                  badgeColor="bg-emerald-600"
                />
              )}
              <NavItem
                view="assistant"
                label="CampusCare Assistant"
                icon={Sparkles}
                badge="AI"
                badgeColor="bg-purple-600"
              />
              <NavItem
                view="announcements"
                label="Campus Notices"
                icon={Megaphone}
              />
              <NavItem
                view="services"
                label="Service Directory"
                icon={Building2}
              />
              <NavItem
                view="search"
                label="Search Grievances"
                icon={Search}
              />
            </div>
          </div>

          {/* Section: Privacy & Account */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Student Account
            </div>
            <div className="space-y-1">
              <NavItem
                view="profile"
                label="Student Profile"
                icon={UserCheck}
              />
              {onExportData && (
                <ActionItem
                  label="Export Privacy Data"
                  icon={Download}
                  onClick={onExportData}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 2. STAFF SPECIALIST NAVIGATION (Dedicated to execution, claiming) */}
      {/* ============================================================== */}
      {isStaff && (
        <>
          {/* Section: Task Execution */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Task Execution
            </div>
            <div className="space-y-1">
              <NavItem
                view="dashboard"
                label="My Desk"
                icon={LayoutDashboard}
                badge="INDIGO"
                badgeColor="bg-indigo-600"
              />
              <NavItem
                view="work-queue"
                label="Unassigned Pool"
                icon={Inbox}
                badge={urgentCount > 0 ? urgentCount : undefined}
                badgeColor="bg-amber-600"
              />
              {onOpenScanner && (
                <ActionItem
                  label="Inspection QR Scanner"
                  icon={QrCode}
                  onClick={onOpenScanner}
                  badge="Field Scan"
                  badgeColor="bg-indigo-600"
                />
              )}
            </div>
          </div>

          {/* Section: Field & Operations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations & Field
            </div>
            <div className="space-y-1">
              <NavItem
                view="maintenance"
                label="Service Maintenance"
                icon={Wrench}
              />
              <NavItem
                view="search"
                label="Dept Issues Search"
                icon={Search}
              />
              <NavItem
                view="announcements"
                label="Campus Notices"
                icon={Megaphone}
              />
            </div>
          </div>

          {/* Section: Specialist Account */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Specialist Account
            </div>
            <div className="space-y-1">
              <NavItem
                view="profile"
                label="Staff Profile"
                icon={UserCheck}
              />
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 3. DEPARTMENT HEAD NAVIGATION (Leadership, SLA, Approvals)    */}
      {/* ============================================================== */}
      {isDeptHead && (
        <>
          {/* Section: Leadership & Dispatch */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Leadership & Dispatch
            </div>
            <div className="space-y-1">
              <NavItem
                view="dashboard"
                label="Command Center"
                icon={ShieldAlert}
                badge="HEAD"
                badgeColor="bg-violet-600"
              />
              <NavItem
                view="sla-warning"
                label="SLA Warning Center"
                icon={ClockAlert}
                badge={slaWarningCount > 0 ? slaWarningCount : undefined}
                badgeColor="bg-rose-600"
              />
              <NavItem
                view="work-queue"
                label="Staff Dispatch Queue"
                icon={Inbox}
                badge={urgentCount > 0 ? urgentCount : undefined}
                badgeColor="bg-violet-600"
              />
              {onOpenScanner && (
                <ActionItem
                  label="Audit QR Scanner"
                  icon={QrCode}
                  onClick={onOpenScanner}
                  badge="Audit"
                  badgeColor="bg-violet-600"
                />
              )}
            </div>
          </div>

          {/* Section: Department Governance & Analytics */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Governance & Analytics
            </div>
            <div className="space-y-1">
              <NavItem
                view="analytics"
                label="Department Analytics"
                icon={BarChart3}
              />
              <NavItem
                view="search"
                label="Department Grievances"
                icon={Search}
              />
              <NavItem
                view="announcements"
                label="Campus Bulletins"
                icon={Megaphone}
              />
              <NavItem
                view="services"
                label="Department Services"
                icon={Building2}
              />
            </div>
          </div>

          {/* Section: Reports & Settings */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Reports & Account
            </div>
            <div className="space-y-1">
              {onExportDeptData && (
                <ActionItem
                  label="Export Dept Report (CSV)"
                  icon={Download}
                  onClick={onExportDeptData}
                  badge="CSV"
                  badgeColor="bg-violet-600"
                />
              )}
              <NavItem
                view="profile"
                label="Head Profile"
                icon={UserCheck}
              />
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 4. ADMINISTRATOR NAVIGATION (Full Institutional Control)       */}
      {/* ============================================================== */}
      {isAdmin && (
        <>
          {/* Section: System Command */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Executive Command
            </div>
            <div className="space-y-1">
              <NavItem
                view="dashboard"
                label="Global Overview"
                icon={LayoutDashboard}
              />
              <NavItem
                view="admin-command"
                label="Admin Command Center"
                icon={ShieldCheck}
                badge="ROOT"
                badgeColor="bg-amber-600"
              />
              <NavItem
                view="sla-warning"
                label="Institutional SLA Center"
                icon={ClockAlert}
                badge={slaWarningCount > 0 ? slaWarningCount : undefined}
                badgeColor="bg-rose-600"
              />
              {onOpenScanner && (
                <ActionItem
                  label="Master QR Scanner"
                  icon={QrCode}
                  onClick={onOpenScanner}
                  badge="Camera"
                  badgeColor="bg-amber-600"
                />
              )}
            </div>
          </div>

          {/* Section: Campus Operations */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations & Governance
            </div>
            <div className="space-y-1">
              <NavItem
                view="work-queue"
                label="Staff Work Queues"
                icon={Inbox}
              />
              <NavItem
                view="maintenance"
                label="Service Maintenance"
                icon={Wrench}
              />
              <NavItem
                view="analytics"
                label="Campus Analytics"
                icon={BarChart3}
              />
              <NavItem
                view="status-board"
                label="Live Status Board"
                icon={Activity}
              />
              <NavItem
                view="search"
                label="Universal Search"
                icon={Search}
              />
              <NavItem
                view="announcements"
                label="Campus Notices"
                icon={Megaphone}
              />
            </div>
          </div>

          {/* Section: Administration & Security */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Management & Security
            </div>
            <div className="space-y-1">
              <NavItem
                view="users"
                label="User & Role Directory"
                icon={Users}
              />
              <NavItem
                view="audit"
                label="System Audit Trail"
                icon={FileText}
              />
              <NavItem
                view="profile"
                label="Admin Profile"
                icon={UserCheck}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-3 space-y-6">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Responsive Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-out Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  CC
                </div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Campus<span className="text-indigo-600 dark:text-indigo-400">Care</span>
                </span>
              </div>
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Nav Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

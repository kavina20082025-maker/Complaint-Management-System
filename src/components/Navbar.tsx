import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Check,
  RotateCcw,
  Sparkles,
  QrCode,
  Menu,
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { CampusCareStorage } from '../services/storage';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  allUsers: User[];
  currentView: string;
  onNavigate: (view: string) => void;
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSelectComplaint?: (cid: string) => void;
  onOpenScanner?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  allUsers,
  currentView,
  onNavigate,
  notifications,
  theme,
  onToggleTheme,
  onSelectComplaint,
  onOpenScanner,
  onToggleMobileMenu,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    CampusCareStorage.markAllNotificationsRead(currentUser.id);
  };

  const getRoleBadgeTitle = (role: string) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'staff':
        return 'Staff Specialist';
      case 'department_head':
        return 'Department Head';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  const isStudent = currentUser.role === 'student';
  const isStaff = currentUser.role === 'staff';
  const isDeptHead = currentUser.role === 'department_head';
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Mobile Hamburger & Brand title */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open sidebar menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-xs">
              CC
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
                Campus<span className="text-indigo-600 dark:text-indigo-400">Care</span>
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest hidden sm:block">
                {isStudent
                  ? 'Student Portal'
                  : isStaff
                  ? `${currentUser.department} Staff`
                  : isDeptHead
                  ? `${currentUser.department} HQ`
                  : 'System Administration'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Tailored per role) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {isStudent && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'dashboard'
                    ? 'text-slate-950 dark:text-white border-b-2 border-emerald-600 dark:border-emerald-400'
                    : ''
                }`}
              >
                My Dashboard
              </button>
              <button
                onClick={() => onNavigate('status-board')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'status-board'
                    ? 'text-slate-950 dark:text-white border-b-2 border-emerald-600 dark:border-emerald-400'
                    : ''
                }`}
              >
                Status Board
              </button>
              <button
                onClick={() => onNavigate('search')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'search'
                    ? 'text-slate-950 dark:text-white border-b-2 border-emerald-600 dark:border-emerald-400'
                    : ''
                }`}
              >
                Search
              </button>
              <button
                onClick={() => onNavigate('services')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'services'
                    ? 'text-slate-950 dark:text-white border-b-2 border-emerald-600 dark:border-emerald-400'
                    : ''
                }`}
              >
                Service Desks
              </button>
              <button
                onClick={() => onNavigate('assistant')}
                className={`inline-flex items-center gap-1.5 transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'assistant'
                    ? 'text-slate-950 dark:text-white border-b-2 border-purple-600 dark:border-purple-400'
                    : ''
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                AI Assistant
              </button>
            </>
          )}

          {isStaff && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'dashboard'
                    ? 'text-slate-950 dark:text-white border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                My Desk
              </button>
              <button
                onClick={() => onNavigate('work-queue')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'work-queue'
                    ? 'text-slate-950 dark:text-white border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Unassigned Pool
              </button>
              <button
                onClick={() => onNavigate('maintenance')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'maintenance'
                    ? 'text-slate-950 dark:text-white border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Maintenance Log
              </button>
              <button
                onClick={() => onNavigate('search')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'search'
                    ? 'text-slate-950 dark:text-white border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Dept Search
              </button>
            </>
          )}

          {isDeptHead && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'dashboard'
                    ? 'text-slate-950 dark:text-white border-b-2 border-violet-600 dark:border-violet-400'
                    : ''
                }`}
              >
                Command Center (HQ)
              </button>
              <button
                onClick={() => onNavigate('sla-warning')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'sla-warning'
                    ? 'text-slate-950 dark:text-white border-b-2 border-rose-600 dark:border-rose-400'
                    : ''
                }`}
              >
                SLA Warnings
              </button>
              <button
                onClick={() => onNavigate('work-queue')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'work-queue'
                    ? 'text-slate-950 dark:text-white border-b-2 border-violet-600 dark:border-violet-400'
                    : ''
                }`}
              >
                Dispatch Queue
              </button>
              <button
                onClick={() => onNavigate('analytics')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'analytics'
                    ? 'text-slate-950 dark:text-white border-b-2 border-violet-600 dark:border-violet-400'
                    : ''
                }`}
              >
                Dept Analytics
              </button>
            </>
          )}

          {isAdmin && (
            <>
              <button
                onClick={() => onNavigate('dashboard')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'dashboard'
                    ? 'text-slate-950 dark:text-white border-b-2 border-amber-600 dark:border-amber-400'
                    : ''
                }`}
              >
                Global HQ
              </button>
              <button
                onClick={() => onNavigate('admin-command')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'admin-command'
                    ? 'text-slate-950 dark:text-white border-b-2 border-amber-600 dark:border-amber-400'
                    : ''
                }`}
              >
                Command Center
              </button>
              <button
                onClick={() => onNavigate('sla-warning')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'sla-warning'
                    ? 'text-slate-950 dark:text-white border-b-2 border-rose-600 dark:border-rose-400'
                    : ''
                }`}
              >
                SLA Center
              </button>
              <button
                onClick={() => onNavigate('users')}
                className={`transition-colors hover:text-slate-950 dark:hover:text-white pb-0.5 ${
                  currentView === 'users'
                    ? 'text-slate-950 dark:text-white border-b-2 border-amber-600 dark:border-amber-400'
                    : ''
                }`}
              >
                User Directory
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions (CTA, Switcher, Theme, Notifications) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Submit CTA if student */}
          {currentUser.role === 'student' && (
            <button
              onClick={() => onNavigate('submit')}
              className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              Report Grievance
            </button>
          )}

          {/* QR Scanner Trigger */}
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
              title="Scan physical inspection QR tag with camera"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Scan QR</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle color theme"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowRoleMenu(false);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          if (notif.complaint_id && onSelectComplaint) {
                            onSelectComplaint(notif.complaint_id);
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          notif.read
                            ? 'bg-slate-50/60 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-slate-200 border-l-2 border-indigo-500'
                        } hover:bg-slate-100 dark:hover:bg-slate-800`}
                      >
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {notif.title}
                        </div>
                        <p className="mt-0.5 text-slate-500 dark:text-slate-400 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block leading-none">
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{currentUser.name.split(' ')[0]}</span>
                  {currentUser.role === 'department_head' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-violet-600 text-white rounded-sm shadow-xs">
                      HEAD
                    </span>
                  )}
                  {currentUser.role === 'staff' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-sm">
                      STAFF
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {getRoleBadgeTitle(currentUser.role)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Switch Active Persona
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Test how students, staff & leadership experience CampusCare
                  </div>
                </div>

                <div className="py-1">
                  {allUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onSelectUser(user);
                        setShowRoleMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {user.role === 'department_head' && (
                            <span className="px-1 py-0.2 text-[9px] font-black uppercase tracking-wider bg-violet-600 text-white rounded-xs">
                              HEAD
                            </span>
                          )}
                          {user.role === 'staff' && (
                            <span className="px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-xs">
                              STAFF
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {getRoleBadgeTitle(user.role)} · {user.department}
                        </div>
                      </div>
                      {user.id === currentUser.id && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      CampusCareStorage.resetToDefaults();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset system to initial seed data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

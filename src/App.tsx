import React, { useState, useEffect } from 'react';
import {
  Lock,
  AlertTriangle,
  LayoutDashboard,
  PlusCircle,
  QrCode,
  Activity,
  Menu,
  Inbox,
  Wrench,
  ClockAlert,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SubmitComplaint } from './components/SubmitComplaint';
import { ComplaintDetails } from './components/ComplaintDetails';
import { LiveStatusBoard } from './components/LiveStatusBoard';
import { WorkQueue } from './components/WorkQueue';
import { SlaWarningCenter } from './components/SlaWarningCenter';
import { AdminCommandCenter } from './components/AdminCommandCenter';
import { AnalyticsTrends } from './components/AnalyticsTrends';
import { CampusCareAssistant } from './components/CampusCareAssistant';
import { ServiceDirectory } from './components/ServiceDirectory';
import { MaintenancePage } from './components/MaintenancePage';
import { AnnouncementsPage } from './components/AnnouncementsPage';
import { SearchFilterPage } from './components/SearchFilterPage';
import { WatchlistPage } from './components/WatchlistPage';
import { AuditTrailPage } from './components/AuditTrailPage';
import { UserManagementPage } from './components/UserManagementPage';
import { ProfilePage } from './components/ProfilePage';
import { QrScannerModal } from './components/QrScannerModal';
import { CampusCareStorage } from './services/storage';
import { User, Complaint, NotificationItem } from './types';
import { getSlaStatus } from './services/smartEngine';

// Role-based view authorization matrix
const ROLE_ALLOWED_VIEWS: Record<string, string[]> = {
  student: [
    'dashboard',
    'submit',
    'complaint-detail',
    'status-board',
    'search',
    'watchlist',
    'assistant',
    'announcements',
    'services',
    'profile',
  ],
  staff: [
    'dashboard',
    'complaint-detail',
    'work-queue',
    'maintenance',
    'search',
    'announcements',
    'profile',
  ],
  department_head: [
    'dashboard',
    'complaint-detail',
    'sla-warning',
    'work-queue',
    'analytics',
    'search',
    'announcements',
    'services',
    'profile',
  ],
  admin: [
    'dashboard',
    'submit',
    'complaint-detail',
    'status-board',
    'work-queue',
    'sla-warning',
    'admin-command',
    'analytics',
    'assistant',
    'services',
    'maintenance',
    'announcements',
    'search',
    'watchlist',
    'audit',
    'users',
    'profile',
  ],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() =>
    CampusCareStorage.getCurrentUser()
  );
  const [allUsers, setAllUsers] = useState<User[]>(() =>
    CampusCareStorage.getAllUsers()
  );
  const [allComplaints, setAllComplaints] = useState<Complaint[]>(() =>
    CampusCareStorage.getComplaints()
  );
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    CampusCareStorage.getTheme()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    CampusCareStorage.getNotifications(currentUser.id)
  );
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Initialize theme on mount
  useEffect(() => {
    CampusCareStorage.setTheme(theme);
  }, [theme]);

  // Sync notifications when current user changes
  useEffect(() => {
    setNotifications(CampusCareStorage.getNotifications(currentUser.id));
  }, [currentUser]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    CampusCareStorage.setTheme(next);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    CampusCareStorage.setCurrentUser(user);
    // Return to dashboard when persona changes
    setCurrentView('dashboard');
    setSelectedComplaintId(null);
  };

  const handleSelectComplaint = (cid: string) => {
    setSelectedComplaintId(cid);
    setCurrentView('complaint-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintCreated = (complaint: Complaint) => {
    setAllComplaints(CampusCareStorage.getComplaints());
    setSelectedComplaintId(complaint.complaint_id);
    setCurrentView('complaint-detail');
  };

  const handleUpdateComplaint = (updated: Complaint) => {
    setAllComplaints(CampusCareStorage.getComplaints());
  };

  const handleRefreshComplaints = () => {
    setAllComplaints(CampusCareStorage.getComplaints());
  };

  const handleRefreshUsers = () => {
    setAllUsers(CampusCareStorage.getAllUsers());
  };

  const handleExportPrivacyData = () => {
    const studentComplaints = allComplaints.filter(
      (c) => c.student_id === currentUser.id
    );
    const payload = {
      university_portal: 'CampusCare V3 Student Grievance System',
      export_timestamp: new Date().toISOString(),
      student_profile: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        department: currentUser.department,
        roll_number: currentUser.studentId,
      },
      grievance_records: studentComplaints,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campuscare_privacy_data_${currentUser.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportDeptData = () => {
    const deptComplaints = allComplaints.filter(
      (c) => c.department.toLowerCase() === currentUser.department.toLowerCase()
    );
    const headers = [
      'Ticket ID',
      'Title',
      'Location',
      'Student',
      'Category',
      'Priority',
      'Assigned Officer',
      'Status',
      'SLA Hours',
      'SLA Deadline',
      'Created Date',
    ];

    const rows = deptComplaints.map((c) => [
      c.complaint_id,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      c.anonymous ? 'Anonymous' : `"${c.student_name.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      `"${c.assigned_name || 'Unassigned'}"`,
      c.status,
      c.sla_hours,
      c.sla_deadline,
      c.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusCare_${currentUser.department.replace(/\s+/g, '_')}_Grievances_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Urgent counts for sidebar badges
  const urgentCount = allComplaints.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    if (currentUser.role === 'staff' || currentUser.role === 'department_head') {
      const isDept = c.department.toLowerCase() === currentUser.department.toLowerCase();
      const isMe = c.assigned_to === currentUser.id;
      if (!isDept && !isMe) return false;
    }
    return c.priority === 'Critical' || c.priority === 'High';
  }).length;

  const slaWarningCount = allComplaints.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    const sla = getSlaStatus(c.sla_deadline, c.status);
    return sla.isApproaching || sla.isOverdue;
  }).length;

  // Check if current view is authorized for this role
  const isViewAuthorized =
    !currentView ||
    currentView === 'dashboard' ||
    (ROLE_ALLOWED_VIEWS[currentUser.role] &&
      ROLE_ALLOWED_VIEWS[currentUser.role].includes(currentView));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        allUsers={allUsers}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setSelectedComplaintId(null);
        }}
        notifications={notifications}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSelectComplaint={handleSelectComplaint}
        onOpenScanner={() => setIsScannerOpen(true)}
        onToggleMobileMenu={() => setIsMobileNavOpen(!isMobileNavOpen)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Responsive Differentiated Sidebar */}
        <Sidebar
          currentUser={currentUser}
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            setSelectedComplaintId(null);
          }}
          urgentCount={urgentCount}
          slaWarningCount={slaWarningCount}
          onExportData={currentUser.role === 'student' ? handleExportPrivacyData : undefined}
          onExportDeptData={currentUser.role === 'department_head' ? handleExportDeptData : undefined}
          onOpenScanner={() => setIsScannerOpen(true)}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {/* Unauthorized Role Gate Notice */}
          {!isViewAuthorized && (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                  Access Restricted
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Role Permission Boundary
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                  You are signed in as <strong className="text-slate-900 dark:text-white">{currentUser.name}</strong> ({currentUser.role}). This module (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs">{currentView}</code>) is restricted to authorized personnel.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors shadow-sm"
                >
                  Return to My Workspace
                </button>
              </div>
            </div>
          )}

          {isViewAuthorized && currentView === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              allComplaints={allComplaints}
              allUsers={allUsers}
              onNavigate={(view) => setCurrentView(view)}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {isViewAuthorized && currentView === 'submit' && (
            <SubmitComplaint
              currentUser={currentUser}
              allComplaints={allComplaints}
              allUsers={allUsers}
              onComplaintCreated={handleComplaintCreated}
              onNavigateToComplaint={handleSelectComplaint}
            />
          )}

          {isViewAuthorized && currentView === 'complaint-detail' && selectedComplaintId && (
            <ComplaintDetails
              complaintId={selectedComplaintId}
              currentUser={currentUser}
              allUsers={allUsers}
              onBack={() => setCurrentView('dashboard')}
              onUpdateComplaint={handleUpdateComplaint}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {isViewAuthorized && currentView === 'status-board' && (
            <LiveStatusBoard
              complaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {isViewAuthorized && currentView === 'work-queue' && (
            <WorkQueue
              currentUser={currentUser}
              allComplaints={allComplaints}
              allUsers={allUsers}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {isViewAuthorized && currentView === 'sla-warning' && (
            <SlaWarningCenter
              currentUser={currentUser}
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
            />
          )}

          {isViewAuthorized && currentView === 'admin-command' && (
            <AdminCommandCenter
              allComplaints={allComplaints}
              allUsers={allUsers}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {isViewAuthorized && currentView === 'analytics' && (
            <AnalyticsTrends complaints={allComplaints} />
          )}

          {isViewAuthorized && currentView === 'assistant' && (
            <CampusCareAssistant
              onNavigateToSubmit={() => setCurrentView('submit')}
              onNavigateToServices={() => setCurrentView('services')}
            />
          )}

          {isViewAuthorized && currentView === 'services' && (
            <ServiceDirectory
              onFileForDesk={(dept) => {
                setCurrentView('submit');
              }}
            />
          )}

          {isViewAuthorized && currentView === 'maintenance' && (
            <MaintenancePage currentUser={currentUser} />
          )}

          {isViewAuthorized && currentView === 'announcements' && (
            <AnnouncementsPage currentUser={currentUser} />
          )}

          {isViewAuthorized && currentView === 'search' && (
            <SearchFilterPage
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          )}

          {isViewAuthorized && currentView === 'watchlist' && (
            <WatchlistPage
              currentUser={currentUser}
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {isViewAuthorized && currentView === 'audit' && <AuditTrailPage />}

          {isViewAuthorized && currentView === 'users' && (
            <UserManagementPage
              allUsers={allUsers}
              onRefreshUsers={handleRefreshUsers}
            />
          )}

          {isViewAuthorized && currentView === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
                CampusCareStorage.setCurrentUser(updated);
                handleRefreshUsers();
              }}
              allComplaints={allComplaints}
            />
          )}
        </main>
      </div>

      {/* Mobile Ergonomic Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden sticky bottom-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around shadow-lg"
      >
        {/* Student Mobile Bar */}
        {currentUser.role === 'student' && (
          <>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Desk</span>
            </button>
            <button
              onClick={() => setCurrentView('submit')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'submit'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setCurrentView('status-board')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'status-board'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live</span>
            </button>
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </>
        )}

        {/* Staff Mobile Bar */}
        {currentUser.role === 'staff' && (
          <>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>My Desk</span>
            </button>
            <button
              onClick={() => setCurrentView('work-queue')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'work-queue'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Pool</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setCurrentView('maintenance')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'maintenance'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Service</span>
            </button>
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </>
        )}

        {/* Dept Head Mobile Bar */}
        {currentUser.role === 'department_head' && (
          <>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>HQ</span>
            </button>
            <button
              onClick={() => setCurrentView('sla-warning')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'sla-warning'
                  ? 'text-rose-600 dark:text-rose-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ClockAlert className="w-4 h-4" />
              <span>SLA</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <QrCode className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setCurrentView('work-queue')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'work-queue'
                  ? 'text-violet-600 dark:text-violet-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Dispatch</span>
            </button>
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </>
        )}

        {/* Admin Mobile Bar */}
        {currentUser.role === 'admin' && (
          <>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>HQ</span>
            </button>
            <button
              onClick={() => setCurrentView('admin-command')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'admin-command'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Command</span>
            </button>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Scan QR</span>
            </button>
            <button
              onClick={() => setCurrentView('users')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                currentView === 'users'
                  ? 'text-amber-600 dark:text-amber-400 font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users</span>
            </button>
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              <Menu className="w-4 h-4" />
              <span>Menu</span>
            </button>
          </>
        )}
      </nav>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            CampusCare V3 · Smart Student Grievance & Administrative SLA Resolution System
          </div>
          <div className="text-[11px] text-slate-400">
            Automated Escalation Protocol Active · Strict Institutional Accountability
          </div>
        </div>
      </footer>

      {/* Camera QR Code Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(cid) => {
          handleSelectComplaint(cid);
        }}
        allComplaints={allComplaints}
      />
    </div>
  );
}

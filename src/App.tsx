import React, { useState, useEffect } from 'react';
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
import { CampusCareStorage } from './services/storage';
import { User, Complaint, NotificationItem } from './types';
import { getSlaStatus } from './services/smartEngine';

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
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
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
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {currentView === 'dashboard' && (
            <Dashboard
              currentUser={currentUser}
              allComplaints={allComplaints}
              onNavigate={(view) => setCurrentView(view)}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'submit' && (
            <SubmitComplaint
              currentUser={currentUser}
              allComplaints={allComplaints}
              allUsers={allUsers}
              onComplaintCreated={handleComplaintCreated}
              onNavigateToComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'complaint-detail' && selectedComplaintId && (
            <ComplaintDetails
              complaintId={selectedComplaintId}
              currentUser={currentUser}
              allUsers={allUsers}
              onBack={() => setCurrentView('dashboard')}
              onUpdateComplaint={handleUpdateComplaint}
            />
          )}

          {currentView === 'status-board' && (
            <LiveStatusBoard
              complaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'work-queue' && (
            <WorkQueue
              currentUser={currentUser}
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'sla-warning' && (
            <SlaWarningCenter
              currentUser={currentUser}
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
            />
          )}

          {currentView === 'admin-command' && (
            <AdminCommandCenter
              allComplaints={allComplaints}
              allUsers={allUsers}
              onSelectComplaint={handleSelectComplaint}
              onRefreshComplaints={handleRefreshComplaints}
              onNavigate={(view) => setCurrentView(view)}
            />
          )}

          {currentView === 'analytics' && (
            <AnalyticsTrends complaints={allComplaints} />
          )}

          {currentView === 'assistant' && (
            <CampusCareAssistant
              onNavigateToSubmit={() => setCurrentView('submit')}
              onNavigateToServices={() => setCurrentView('services')}
            />
          )}

          {currentView === 'services' && (
            <ServiceDirectory
              onFileForDesk={(dept) => {
                setCurrentView('submit');
              }}
            />
          )}

          {currentView === 'maintenance' && (
            <MaintenancePage currentUser={currentUser} />
          )}

          {currentView === 'announcements' && (
            <AnnouncementsPage currentUser={currentUser} />
          )}

          {currentView === 'search' && (
            <SearchFilterPage
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'watchlist' && (
            <WatchlistPage
              currentUser={currentUser}
              allComplaints={allComplaints}
              onSelectComplaint={handleSelectComplaint}
            />
          )}

          {currentView === 'audit' && <AuditTrailPage />}

          {currentView === 'users' && (
            <UserManagementPage
              allUsers={allUsers}
              onRefreshUsers={handleRefreshUsers}
            />
          )}

          {currentView === 'profile' && (
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
    </div>
  );
}

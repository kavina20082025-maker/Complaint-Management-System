import React from 'react';
import {
  PlusCircle,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Hourglass,
  Star,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { getSlaStatus } from '../services/smartEngine';

interface DashboardProps {
  currentUser: User;
  allComplaints: Complaint[];
  onNavigate: (view: string) => void;
  onSelectComplaint: (cid: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  allComplaints,
  onNavigate,
  onSelectComplaint,
}) => {
  const isStudent = currentUser.role === 'student';
  const isStaff = currentUser.role === 'staff';
  const isDeptHead = currentUser.role === 'department_head';
  const isAdmin = currentUser.role === 'admin';

  // Filter complaints based on persona
  const userComplaints = React.useMemo(() => {
    if (isStudent) {
      return allComplaints.filter((c) => c.student_id === currentUser.id);
    }
    if (isStaff) {
      return allComplaints.filter(
        (c) =>
          c.department.toLowerCase() === currentUser.department.toLowerCase() ||
          c.assigned_to === currentUser.id
      );
    }
    if (isDeptHead) {
      return allComplaints.filter(
        (c) => c.department.toLowerCase() === currentUser.department.toLowerCase()
      );
    }
    return allComplaints;
  }, [allComplaints, currentUser, isStudent, isStaff, isDeptHead]);

  // Key metrics
  const total = userComplaints.length;
  const pending = userComplaints.filter((c) => c.status === 'Pending' || c.status === 'Assigned').length;
  const inProgress = userComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = userComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const critical = userComplaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Closed'
  ).length;

  const overdue = userComplaints.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    return new Date(c.sla_deadline).getTime() < Date.now();
  }).length;

  // Student verification pending
  const pendingVerification = userComplaints.filter(
    (c) => c.status === 'Resolved' && !c.verified
  );

  // Ratings calculation
  const ratedComplaints = allComplaints.filter((c) => c.rating !== undefined);
  const avgSatisfaction =
    ratedComplaints.length > 0
      ? (
          ratedComplaints.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
          ratedComplaints.length
        ).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Student Action Needed Banner: Resolution Verification Loop */}
      {isStudent && pendingVerification.length > 0 && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                Action Required: {pendingVerification.length} Grievance marked as Resolved
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Please verify if the physical work was done satisfactorily to close the grievance.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectComplaint(pendingVerification[0].complaint_id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
          >
            Review & Verify Now <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            {isStudent
              ? 'Student Redressal Portal'
              : isAdmin
              ? 'Institutional Operations Command'
              : 'Administrative Duty Desk'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isStudent
              ? 'Track campus grievances in real time, monitor maintenance progress, and verify resolutions with guaranteed service-level accountability.'
              : `Managing ${currentUser.department} student affairs and facility tickets with automated SLA routing and escalation protocols.`}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isStudent ? (
              <button
                onClick={() => onNavigate('submit')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Report New Grievance
              </button>
            ) : (
              <button
                onClick={() => onNavigate('work-queue')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
              >
                <Activity className="w-4 h-4 text-indigo-600" />
                Open Duty Queue ({pending + inProgress} active)
              </button>
            )}

            <button
              onClick={() => onNavigate('status-board')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
            >
              Live Status Board
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Tickets
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged in registry</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending Triage
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {pending}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting dispatch</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            In Progress
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {inProgress}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Under field repair</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Resolved / Done
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {resolved}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Verified resolutions</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Critical / SLA Risk
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {overdue > 0 ? overdue : critical}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {overdue > 0 ? `${overdue} overdue SLA` : 'High attention'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Student Rating
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white flex items-center gap-1">
            {avgSatisfaction} <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across departments</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Grievances (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {isStudent ? 'My Logged Grievances' : 'Active Department Grievances'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of issues across campus zones
              </p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View all ({userComplaints.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority & SLA</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {userComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No complaints found. {isStudent && 'Click "Report New Grievance" above to submit one.'}
                    </td>
                  </tr>
                ) : (
                  userComplaints.slice(0, 6).map((c) => {
                    const slaInfo = getSlaStatus(c.sla_deadline, c.status);
                    return (
                      <tr
                        key={c.complaint_id}
                        onClick={() => onSelectComplaint(c.complaint_id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                            <span>{c.complaint_id}</span>
                            <span aria-hidden="true">·</span>
                            <span>{c.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {c.category}
                          </span>
                          <span className="block text-[11px] text-slate-400">
                            {c.department}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div
                            className={`font-semibold ${
                              c.priority === 'Critical'
                                ? 'text-rose-600 dark:text-rose-400'
                                : c.priority === 'High'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {c.priority}
                          </div>
                          <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            {slaInfo.formatted}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              c.status === 'Resolved' || c.status === 'Closed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : c.status === 'Escalated'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                : c.status === 'In Progress'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComplaint(c.complaint_id);
                            }}
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Fast Shortcuts & Operational Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Access Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Redressal Desks
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('services')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Service Directory & Extensions
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('assistant')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Grievance Policy & SLA Guide
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('announcements')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Campus Administrative Notices
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Planned Maintenance Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Scheduled Maintenance
              </h3>
              <button
                onClick={() => onNavigate('maintenance')}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Full calendar
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
              <div className="font-semibold text-slate-900 dark:text-white">
                Hostel Overhead Tank Sanitization
              </div>
              <p className="text-slate-500 text-[11px]">
                Hostel Block B & C · 08:00 AM - 01:00 PM tomorrow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

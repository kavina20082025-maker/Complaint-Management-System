import React, { useState } from 'react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  FileCheck,
  ChevronRight,
  Search,
  Check,
  X,
  QrCode,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { CampusCareStorage } from '../services/storage';
import { getSlaStatus } from '../services/smartEngine';

interface StaffDeskProps {
  currentUser: User;
  allComplaints: Complaint[];
  onSelectComplaint: (cid: string) => void;
  onRefreshComplaints?: () => void;
  onOpenScanner?: () => void;
}

export const StaffDesk: React.FC<StaffDeskProps> = ({
  currentUser,
  allComplaints,
  onSelectComplaint,
  onRefreshComplaints,
  onOpenScanner,
}) => {
  // Tabs: "Assigned to Me" (default), "Unassigned Pool", "Urgent"
  const [activeTab, setActiveTab] = useState<'assigned_to_me' | 'unassigned' | 'urgent'>('assigned_to_me');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal for Staff resolve flow: "Resolved - Pending Approval"
  const [resolveModalComplaint, setResolveModalComplaint] = useState<Complaint | null>(null);
  const [resolveNote, setResolveNote] = useState('');

  // Filter department complaints
  const deptComplaints = allComplaints.filter(
    (c) =>
      c.department.toLowerCase() === currentUser.department.toLowerCase() ||
      c.assigned_to === currentUser.id
  );

  // Top of page: Personal stats: "my open", "my resolved", "my SLA at risk"
  const myComplaints = deptComplaints.filter((c) => c.assigned_to === currentUser.id);

  const myOpen = myComplaints.filter(
    (c) => c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Pending'
  ).length;

  const myResolved = myComplaints.filter(
    (c) =>
      c.status === 'Resolved' ||
      c.status === 'Resolved - Pending Approval' ||
      c.status === 'Closed'
  ).length;

  const mySlaAtRisk = myComplaints.filter((c) => {
    if (
      c.status === 'Resolved' ||
      c.status === 'Resolved - Pending Approval' ||
      c.status === 'Closed'
    ) {
      return false;
    }
    const sla = getSlaStatus(c.sla_deadline, c.status);
    return sla.isApproaching || sla.isOverdue;
  }).length;

  // Tab counts
  const assignedToMeCount = myComplaints.length;
  const unassignedPoolCount = deptComplaints.filter(
    (c) => !c.assigned_to || c.assigned_to === '' || c.status === 'Pending'
  ).length;
  const urgentCount = deptComplaints.filter(
    (c) =>
      (c.priority === 'Critical' || c.priority === 'High') &&
      c.status !== 'Closed' &&
      c.status !== 'Resolved'
  ).length;

  // Filtered by tab
  const tabFiltered = deptComplaints.filter((c) => {
    if (activeTab === 'assigned_to_me') {
      return c.assigned_to === currentUser.id;
    }
    if (activeTab === 'unassigned') {
      return !c.assigned_to || c.assigned_to === '' || c.status === 'Pending';
    }
    if (activeTab === 'urgent') {
      return (
        (c.priority === 'Critical' || c.priority === 'High') &&
        c.status !== 'Closed' &&
        c.status !== 'Resolved'
      );
    }
    return true;
  });

  // Filtered by search
  const displayedComplaints = tabFiltered.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.complaint_id.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  // Action: Claim (unassigned)
  const handleClaim = (e: React.MouseEvent, complaint: Complaint) => {
    e.stopPropagation();
    const nowIso = new Date().toISOString();
    const updated: Complaint = {
      ...complaint,
      assigned_to: currentUser.id,
      assigned_name: currentUser.name,
      status: 'Assigned',
      updated_at: nowIso,
      timeline: [
        ...complaint.timeline,
        {
          status: 'Assigned',
          note: `Claimed from unassigned pool by ${currentUser.name}.`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'CLAIMED_TICKET',
      complaint.complaint_id,
      `Claimed by ${currentUser.name}`
    );
    CampusCareStorage.addNotification(
      complaint.student_id,
      'Complaint Claimed by Staff',
      `${currentUser.name} has claimed your grievance and is reviewing it.`,
      complaint.complaint_id
    );

    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Start Work (assigned)
  const handleStartWork = (e: React.MouseEvent, complaint: Complaint) => {
    e.stopPropagation();
    const nowIso = new Date().toISOString();
    const updated: Complaint = {
      ...complaint,
      status: 'In Progress',
      updated_at: nowIso,
      timeline: [
        ...complaint.timeline,
        {
          status: 'In Progress',
          note: `Work commenced on-site by ${currentUser.name}.`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'STARTED_WORK',
      complaint.complaint_id,
      `Work started by ${currentUser.name}`
    );
    CampusCareStorage.addNotification(
      complaint.student_id,
      'Technician Started Work',
      `${currentUser.name} has started active repair/investigation on ${complaint.complaint_id}.`,
      complaint.complaint_id
    );

    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Submit "Resolved - Pending Approval"
  const handleSubmitResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalComplaint) return;

    const nowIso = new Date().toISOString();
    const noteText =
      resolveNote.trim() || 'Work completed on-site. Forwarded to Department Head for final approval.';

    const updated: Complaint = {
      ...resolveModalComplaint,
      status: 'Resolved - Pending Approval',
      updated_at: nowIso,
      timeline: [
        ...resolveModalComplaint.timeline,
        {
          status: 'Resolved - Pending Approval',
          note: `Marked "Resolved - Pending Approval" by ${currentUser.name}: ${noteText}`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'RESOLVED_PENDING_APPROVAL',
      resolveModalComplaint.complaint_id,
      noteText
    );

    // Notify Department Head and Student
    CampusCareStorage.addNotification(
      resolveModalComplaint.student_id,
      'Complaint Resolved (Pending Approval)',
      `Staff member ${currentUser.name} has completed work on ${resolveModalComplaint.complaint_id}. Awaiting Head approval.`,
      resolveModalComplaint.complaint_id
    );

    setResolveModalComplaint(null);
    setResolveNote('');
    if (onRefreshComplaints) onRefreshComplaints();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header: Indigo accent */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-indigo-100 dark:border-indigo-950/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400">
              Staff Portal · {currentUser.department}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            My Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your assigned complaints, claim unassigned pool issues, and submit completed work for Head approval.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              title="Scan physical equipment or room inspection tag with camera"
            >
              <QrCode className="w-3.5 h-3.5" />
              Scan Tag
            </button>
          )}

          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Duty Officer: {currentUser.name}
          </div>
        </div>
      </div>

      {/* Top of page: Personal stats: "my open", "my resolved", "my SLA at risk" */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* My Open */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Open
            </div>
            <Inbox className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {myOpen}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Active tickets currently assigned to you
          </p>
        </div>

        {/* My Resolved */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My Resolved
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {myResolved}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submitted for approval & completed
          </p>
        </div>

        {/* My SLA at Risk */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs relative overflow-hidden group hover:border-rose-300 dark:hover:border-rose-700 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              My SLA at Risk
            </div>
            <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="mt-3 text-3xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {mySlaAtRisk}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Approaching deadline or breached
          </p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Tabs: Assigned to Me (default), Unassigned Pool, Urgent */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('assigned_to_me')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'assigned_to_me'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Assigned to Me
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'assigned_to_me'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {assignedToMeCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'unassigned'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Unassigned Pool
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'unassigned'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {unassignedPoolCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('urgent')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'urgent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Urgent
            {urgentCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'urgent'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {urgentCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, IDs, rooms..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      No complaints found in this tab.
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {activeTab === 'unassigned'
                        ? 'All department complaints are currently assigned.'
                        : 'Your work queue is clear.'}
                    </p>
                  </td>
                </tr>
              ) : (
                displayedComplaints.map((c) => {
                  const sla = getSlaStatus(c.sla_deadline, c.status);
                  const isAssignedToMe = c.assigned_to === currentUser.id;
                  const isUnassigned = !c.assigned_to || c.assigned_to === '';

                  return (
                    <tr
                      key={c.complaint_id}
                      onClick={() => onSelectComplaint(c.complaint_id)}
                      className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      {/* Ticket title and info */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-white truncate hover:text-indigo-600">
                          {c.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {c.complaint_id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{c.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{c.anonymous ? 'Anonymous Student' : c.student_name}</span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.location}
                      </td>

                      {/* Priority and SLA */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold ${
                            c.priority === 'Critical'
                              ? 'text-rose-600 dark:text-rose-400'
                              : c.priority === 'High'
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {c.priority} Priority
                        </span>
                        <div
                          className={`text-[11px] font-mono tabular-nums ${
                            sla.isOverdue
                              ? 'text-rose-600 font-bold'
                              : sla.isApproaching
                              ? 'text-amber-600 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          {sla.formatted}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            c.status === 'Resolved - Pending Approval'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : c.status === 'Resolved' || c.status === 'Closed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : c.status === 'In Progress'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : c.status === 'Escalated'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>

                      {/* Main Button action: Claim (unassigned), Start Work (assigned), Resolve - Pending Approval */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isUnassigned && (
                            <button
                              onClick={(e) => handleClaim(e, c)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                              title="Claim this unassigned complaint into your personal desk"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Claim
                            </button>
                          )}

                          {isAssignedToMe && c.status === 'Assigned' && (
                            <button
                              onClick={(e) => handleStartWork(e, c)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                              title="Start active work on this complaint"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                              Start Work
                            </button>
                          )}

                          {isAssignedToMe && c.status === 'In Progress' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setResolveModalComplaint(c);
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors inline-flex items-center gap-1.5"
                              title="Mark issue completed and submit for Department Head approval"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              Resolve (Submit for Approval)
                            </button>
                          )}

                          {c.status === 'Resolved - Pending Approval' && (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                              Awaiting Head Approval
                            </span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectComplaint(c.complaint_id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title="View complete ticket details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Resolve Flow Modal: Marks "Resolved - Pending Approval" */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit Work for Approval
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {resolveModalComplaint.complaint_id} · {resolveModalComplaint.location}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              As Staff, your resolution will be marked{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">
                "Resolved - Pending Approval"
              </strong>
              . The Department Head will review your work findings to approve and close the ticket.
            </p>

            <form onSubmit={handleSubmitResolve} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Work Completion Details & Findings
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Describe parts replaced, tests conducted, or repair completed on-site..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalComplaint(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Submit as "Resolved - Pending Approval"
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

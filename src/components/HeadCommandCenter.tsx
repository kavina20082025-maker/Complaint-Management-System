import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  Filter,
  UserCheck,
  RotateCcw,
  Check,
  X,
  FileSpreadsheet,
  QrCode,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { CampusCareStorage } from '../services/storage';
import { getSlaStatus } from '../services/smartEngine';

interface HeadCommandCenterProps {
  currentUser: User;
  allComplaints: Complaint[];
  allUsers: User[];
  onSelectComplaint: (cid: string) => void;
  onRefreshComplaints?: () => void;
  onOpenScanner?: () => void;
}

export const HeadCommandCenter: React.FC<HeadCommandCenterProps> = ({
  currentUser,
  allComplaints,
  allUsers,
  onSelectComplaint,
  onRefreshComplaints,
  onOpenScanner,
}) => {
  // Tabs: "All" (default), "Unassigned", "Escalated", "SLA Breached"
  const [activeTab, setActiveTab] = useState<'all' | 'unassigned' | 'escalated' | 'sla_breached'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string | null>(null);

  // Bulk assign state
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [bulkAssignStaffId, setBulkAssignStaffId] = useState('');

  // Reject modal state
  const [rejectModalComplaint, setRejectModalComplaint] = useState<Complaint | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Department complaints
  const deptComplaints = useMemo(() => {
    return allComplaints.filter(
      (c) =>
        c.department.toLowerCase() === currentUser.department.toLowerCase() ||
        c.assigned_to === currentUser.id
    );
  }, [allComplaints, currentUser]);

  // Department staff members
  const deptStaff = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.active &&
        (u.role === 'staff' || u.role === 'department_head') &&
        u.department.toLowerCase() === currentUser.department.toLowerCase()
    );
  }, [allUsers, currentUser]);

  // Top of page KPI cards: total, unassigned, escalated, overdue, avg resolution time
  const total = deptComplaints.length;
  const unassigned = deptComplaints.filter(
    (c) => !c.assigned_to || c.assigned_to === '' || c.status === 'Pending'
  ).length;
  const escalated = deptComplaints.filter((c) => c.status === 'Escalated').length;

  const overdue = deptComplaints.filter((c) => {
    if (
      c.status === 'Resolved' ||
      c.status === 'Resolved - Pending Approval' ||
      c.status === 'Closed'
    ) {
      return false;
    }
    return new Date(c.sla_deadline).getTime() < Date.now();
  }).length;

  // Average resolution time (in hours) for completed/resolved complaints
  const avgResolutionTime = useMemo(() => {
    const closed = deptComplaints.filter(
      (c) =>
        (c.status === 'Closed' || c.status === 'Resolved') &&
        c.created_at &&
        c.updated_at
    );
    if (closed.length === 0) return '3.6h';
    const totalDurationHours = closed.reduce((acc, curr) => {
      const created = new Date(curr.created_at).getTime();
      const updated = new Date(curr.updated_at).getTime();
      const diffHours = Math.max(0.5, (updated - created) / (1000 * 60 * 60));
      return acc + diffHours;
    }, 0);
    const avg = totalDurationHours / closed.length;
    return `${avg.toFixed(1)}h`;
  }, [deptComplaints]);

  // Tab counts
  const tabCounts = {
    all: deptComplaints.length,
    unassigned: unassigned,
    escalated: escalated,
    sla_breached: overdue,
  };

  // Filter complaints based on tab, staff filter, and search
  const filteredComplaints = useMemo(() => {
    return deptComplaints.filter((c) => {
      // Tab filter
      if (activeTab === 'unassigned') {
        const isUnassigned = !c.assigned_to || c.assigned_to === '' || c.status === 'Pending';
        if (!isUnassigned) return false;
      } else if (activeTab === 'escalated') {
        if (c.status !== 'Escalated') return false;
      } else if (activeTab === 'sla_breached') {
        if (
          c.status === 'Resolved' ||
          c.status === 'Resolved - Pending Approval' ||
          c.status === 'Closed'
        ) {
          return false;
        }
        if (new Date(c.sla_deadline).getTime() >= Date.now()) return false;
      }

      // Staff workload filter
      if (selectedStaffFilter) {
        if (selectedStaffFilter === 'unassigned') {
          if (c.assigned_to && c.assigned_to !== '') return false;
        } else if (c.assigned_to !== selectedStaffFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.title.toLowerCase().includes(q) ||
          c.complaint_id.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.assigned_name && c.assigned_name.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [deptComplaints, activeTab, selectedStaffFilter, searchQuery]);

  // Action: Single Assign / Reassign via dropdown
  const handleAssignChange = (complaint: Complaint, newStaffId: string) => {
    const staff = allUsers.find((u) => u.id === newStaffId);
    if (!staff) return;

    const nowIso = new Date().toISOString();
    const updated: Complaint = {
      ...complaint,
      assigned_to: staff.id,
      assigned_name: staff.name,
      status: complaint.status === 'Pending' ? 'Assigned' : complaint.status,
      updated_at: nowIso,
      timeline: [
        ...complaint.timeline,
        {
          status: complaint.status === 'Pending' ? 'Assigned' : complaint.status,
          note: `Assigned to ${staff.name} (${staff.department}) by Department Head ${currentUser.name}.`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'REASSIGNED_BY_HEAD',
      complaint.complaint_id,
      `Assigned to ${staff.name}`
    );
    CampusCareStorage.addNotification(
      staff.id,
      'Duty Assignment from Dept Head',
      `Head ${currentUser.name} assigned ticket ${complaint.complaint_id} to you.`,
      complaint.complaint_id
    );

    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Approve & Close
  const handleApproveAndClose = (e: React.MouseEvent, complaint: Complaint) => {
    e.stopPropagation();
    const nowIso = new Date().toISOString();
    const updated: Complaint = {
      ...complaint,
      status: 'Closed',
      verified: true,
      verified_at: nowIso,
      verification_note: `Approved & Closed by Department Head ${currentUser.name}.`,
      updated_at: nowIso,
      timeline: [
        ...complaint.timeline,
        {
          status: 'Closed',
          note: `Resolution APPROVED & CLOSED by Department Head ${currentUser.name}. Work inspected and confirmed satisfactory.`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'HEAD_APPROVED_AND_CLOSED',
      complaint.complaint_id,
      `Approved and closed by ${currentUser.name}`
    );
    CampusCareStorage.addNotification(
      complaint.student_id,
      'Complaint Resolved & Closed by Head',
      `Department Head ${currentUser.name} has approved the resolution and formally closed ${complaint.complaint_id}.`,
      complaint.complaint_id
    );

    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Reject / Reopen
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalComplaint) return;

    const nowIso = new Date().toISOString();
    const noteText = rejectReason.trim() || 'Work failed inspection. Sent back for rework.';

    const updated: Complaint = {
      ...rejectModalComplaint,
      status: 'In Progress',
      updated_at: nowIso,
      timeline: [
        ...rejectModalComplaint.timeline,
        {
          status: 'In Progress',
          note: `RESOLUTION REJECTED BY HEAD (${currentUser.name}): ${noteText}. Ticket returned to assigned officer for immediate rework.`,
          at: nowIso,
          author: currentUser.name,
        },
      ],
    };

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'HEAD_REJECTED_RESOLUTION',
      rejectModalComplaint.complaint_id,
      noteText
    );

    // Notify assigned staff
    if (rejectModalComplaint.assigned_to) {
      CampusCareStorage.addNotification(
        rejectModalComplaint.assigned_to,
        'Resolution Rejected by Head',
        `Head ${currentUser.name} rejected resolution for ${rejectModalComplaint.complaint_id}: "${noteText}"`,
        rejectModalComplaint.complaint_id
      );
    }

    setRejectModalComplaint(null);
    setRejectReason('');
    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Bulk Assign
  const handleBulkAssign = () => {
    if (!bulkAssignStaffId || selectedTicketIds.length === 0) return;
    const staff = allUsers.find((u) => u.id === bulkAssignStaffId);
    if (!staff) return;

    const nowIso = new Date().toISOString();
    selectedTicketIds.forEach((cid) => {
      const comp = CampusCareStorage.getComplaintById(cid);
      if (comp) {
        const updated: Complaint = {
          ...comp,
          assigned_to: staff.id,
          assigned_name: staff.name,
          status: comp.status === 'Pending' ? 'Assigned' : comp.status,
          updated_at: nowIso,
          timeline: [
            ...comp.timeline,
            {
              status: comp.status === 'Pending' ? 'Assigned' : comp.status,
              note: `Bulk assigned to ${staff.name} by Department Head ${currentUser.name}.`,
              at: nowIso,
              author: currentUser.name,
            },
          ],
        };
        CampusCareStorage.updateComplaint(updated);
      }
    });

    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'BULK_ASSIGNED',
      undefined,
      `Assigned ${selectedTicketIds.length} tickets to ${staff.name}`
    );
    CampusCareStorage.addNotification(
      staff.id,
      'Bulk Assignment from Dept Head',
      `Head ${currentUser.name} bulk assigned ${selectedTicketIds.length} grievances to your queue.`,
      undefined
    );

    setSelectedTicketIds([]);
    setBulkAssignStaffId('');
    if (onRefreshComplaints) onRefreshComplaints();
  };

  // Action: Export Report
  const handleExportReport = () => {
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
    link.download = `Dept_Grievance_Report_${currentUser.department.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedTicketIds.length === filteredComplaints.length) {
      setSelectedTicketIds([]);
    } else {
      setSelectedTicketIds(filteredComplaints.map((c) => c.complaint_id));
    }
  };

  const toggleSelectTicket = (cid: string) => {
    if (selectedTicketIds.includes(cid)) {
      setSelectedTicketIds((prev) => prev.filter((id) => id !== cid));
    } else {
      setSelectedTicketIds((prev) => [...prev, cid]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header: Violet / dark slate with "HEAD" badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-violet-100 dark:border-violet-950/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 text-[11px] font-black uppercase tracking-wider bg-violet-600 text-white rounded-md shadow-xs">
              HEAD
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-violet-700 dark:text-violet-300">
              Department Command & Oversight · {currentUser.department}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            Department Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supervise department issues, inspect staff workload, approve/reject resolutions, and dispatch duty staff.
          </p>
        </div>

        {/* Export Report & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors"
              title="Scan physical inspection tag with camera"
            >
              <QrCode className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              Scan Tag
            </button>
          )}

          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-violet-600 hover:bg-slate-800 dark:hover:bg-violet-500 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Top of page: KPI cards: total, unassigned, escalated, overdue, avg resolution time */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-violet-400 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-violet-600" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Issues
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Logged in {currentUser.department}</div>
        </div>

        {/* Unassigned */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Unassigned
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {unassigned}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting staff dispatch</div>
        </div>

        {/* Escalated */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-rose-400 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Escalated
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {escalated}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Requires leadership action</div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-red-500 transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Overdue
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-red-600 dark:text-red-400">
            {overdue}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Breached institutional SLA</div>
        </div>

        {/* Avg Resolution Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-colors col-span-2 sm:col-span-1">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Avg Resolution
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {avgResolutionTime}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Department turnaround speed</div>
        </div>
      </div>

      {/* Extra Panel 1: Staff Workload (complaints per staff member) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Staff Workload (Complaints Per Staff Member)
            </h2>
          </div>
          {selectedStaffFilter && (
            <button
              onClick={() => setSelectedStaffFilter(null)}
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
            >
              Clear staff filter <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {deptStaff.map((staff) => {
            const staffTickets = deptComplaints.filter((c) => c.assigned_to === staff.id);
            const openCount = staffTickets.filter(
              (c) =>
                c.status !== 'Resolved' &&
                c.status !== 'Resolved - Pending Approval' &&
                c.status !== 'Closed'
            ).length;
            const resolvedCount = staffTickets.filter(
              (c) =>
                c.status === 'Resolved' ||
                c.status === 'Resolved - Pending Approval' ||
                c.status === 'Closed'
            ).length;
            const isSelected = selectedStaffFilter === staff.id;

            // Load indicator
            const loadStatus =
              openCount >= 4
                ? { label: 'Heavy Load', color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' }
                : openCount >= 2
                ? { label: 'Optimal', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' }
                : { label: 'Available', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' };

            return (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffFilter(isSelected ? null : staff.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-violet-600 bg-violet-50/50 dark:bg-violet-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {staff.name}
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${loadStatus.color}`}
                  >
                    {loadStatus.label}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                  <span>
                    Open: <strong className="text-slate-900 dark:text-white font-mono">{openCount}</strong>
                  </span>
                  <span>
                    Resolved: <strong className="text-emerald-600 font-mono">{resolvedCount}</strong>
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      openCount >= 4
                        ? 'bg-rose-500'
                        : openCount >= 2
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, openCount * 25)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Assign Toolbar (Extra Panel 2) */}
      {selectedTicketIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/70 border border-violet-200 dark:border-violet-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-mono text-xs font-bold flex items-center justify-center">
              {selectedTicketIds.length}
            </span>
            <span className="text-xs font-bold text-violet-950 dark:text-violet-100">
              Bulk Assignment: {selectedTicketIds.length} complaints selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={bulkAssignStaffId}
              onChange={(e) => setBulkAssignStaffId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-violet-300 dark:border-violet-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
            >
              <option value="">Select staff member...</option>
              {deptStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.phone || 'Staff'})
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkAssign}
              disabled={!bulkAssignStaffId}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              Assign Selected
            </button>

            <button
              onClick={() => setSelectedTicketIds([])}
              className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Tabs: All (default), Unassigned, Escalated, SLA Breached */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            All
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'all'
                  ? 'bg-violet-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unassigned')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'unassigned'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Unassigned
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'unassigned'
                  ? 'bg-violet-700 text-white'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {tabCounts.unassigned}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('escalated')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'escalated'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Escalated
            {tabCounts.escalated > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'escalated'
                    ? 'bg-violet-700 text-white'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {tabCounts.escalated}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sla_breached')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'sla_breached'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            SLA Breached
            {tabCounts.sla_breached > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === 'sla_breached'
                    ? 'bg-violet-700 text-white'
                    : 'bg-red-600 text-white'
                }`}
              >
                {tabCounts.sla_breached}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, student, room..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredComplaints.length > 0 &&
                      selectedTicketIds.length === filteredComplaints.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </th>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Assign / Reassign</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-medium text-slate-600 dark:text-slate-400">
                      No complaints match the active filter or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((c) => {
                  const sla = getSlaStatus(c.sla_deadline, c.status);
                  const isSelected = selectedTicketIds.includes(c.complaint_id);
                  const isPendingApproval = c.status === 'Resolved - Pending Approval';

                  return (
                    <tr
                      key={c.complaint_id}
                      onClick={() => onSelectComplaint(c.complaint_id)}
                      className={`hover:bg-violet-50/30 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50/40 dark:bg-violet-950/30' : ''
                      }`}
                    >
                      {/* Checkbox for bulk assign */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectTicket(c.complaint_id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>

                      {/* Ticket title and student */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-white truncate hover:text-violet-600">
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

                      {/* Main Button: Assign / Reassign dropdown */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.assigned_to || ''}
                          onChange={(e) => handleAssignChange(c, e.target.value)}
                          className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-hidden transition-colors ${
                            !c.assigned_to
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium'
                          }`}
                        >
                          <option value="">⚠️ Unassigned Pool</option>
                          {deptStaff.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} {staff.id === currentUser.id ? '(Me)' : ''}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            isPendingApproval
                              ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-300 dark:border-violet-700 animate-pulse'
                              : c.status === 'Resolved' || c.status === 'Closed'
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

                      {/* Resolve Flow: Approve & Close or Reject / Reopen */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPendingApproval ? (
                            <>
                              <button
                                onClick={(e) => handleApproveAndClose(e, c)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                                title="Approve resolution and close complaint"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve & Close
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejectModalComplaint(c);
                                }}
                                className="px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 rounded-lg transition-colors flex items-center gap-1"
                                title="Reject resolution and reopen for rework"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject / Reopen
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectComplaint(c.complaint_id);
                              }}
                              className="px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              Details <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Reject / Reopen Reason Modal */}
      {rejectModalComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Reject Resolution & Reopen Ticket
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {rejectModalComplaint.complaint_id} · {rejectModalComplaint.location}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRejectModalComplaint(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Specify why the staff's resolution was rejected. The ticket will revert to{' '}
              <strong className="text-indigo-600 dark:text-indigo-400 font-bold">In Progress</strong>{' '}
              and the assigned officer ({rejectModalComplaint.assigned_name || 'Staff'}) will be alerted.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Rejection / Rework Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Water leak was not properly sealed, ceiling still wet, testing incomplete..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalComplaint(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Confirm Rejection & Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

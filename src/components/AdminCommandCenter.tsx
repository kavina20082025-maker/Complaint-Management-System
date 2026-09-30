import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  FileSpreadsheet,
  Printer,
  CheckSquare,
  AlertOctagon,
  Users,
  Layers,
  BarChart,
  ArrowRight,
} from 'lucide-react';
import { Complaint, User } from '../types';
import { CATEGORIES, DEPARTMENTS } from '../services/smartEngine';
import { CampusCareStorage } from '../services/storage';

interface AdminCommandCenterProps {
  allComplaints: Complaint[];
  allUsers: User[];
  onSelectComplaint: (cid: string) => void;
  onRefreshComplaints: () => void;
  onNavigate: (view: string) => void;
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  allComplaints,
  allUsers,
  onSelectComplaint,
  onRefreshComplaints,
  onNavigate,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'Resolved' | 'Escalated' | 'Pending'>('Resolved');
  const [successMessage, setSuccessMessage] = useState('');

  const total = allComplaints.length;
  const resolved = allComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
  const overdue = allComplaints.filter(
    (c) =>
      c.status !== 'Resolved' &&
      c.status !== 'Closed' &&
      new Date(c.sla_deadline).getTime() < Date.now()
  ).length;
  const critical = allComplaints.filter(
    (c) => c.priority === 'Critical' && c.status !== 'Closed'
  ).length;

  // Category counts
  const categoryStats = CATEGORIES.map((cat) => ({
    name: cat,
    count: allComplaints.filter((c) => c.category === cat).length,
  }));
  const maxCat = Math.max(...categoryStats.map((c) => c.count), 1);

  // Department counts
  const departmentStats = DEPARTMENTS.map((dept) => ({
    name: dept,
    count: allComplaints.filter((c) => c.department === dept).length,
  }));
  const maxDept = Math.max(...departmentStats.map((d) => d.count), 1);

  const toggleSelect = (cid: string) => {
    setSelectedIds((prev) =>
      prev.includes(cid) ? prev.filter((id) => id !== cid) : [...prev, cid]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === allComplaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allComplaints.map((c) => c.complaint_id));
    }
  };

  const handleApplyBulk = () => {
    if (selectedIds.length === 0) return;

    const nowIso = new Date().toISOString();
    selectedIds.forEach((cid) => {
      const c = CampusCareStorage.getComplaintById(cid);
      if (c) {
        const updated: Complaint = {
          ...c,
          status: bulkAction,
          updated_at: nowIso,
          timeline: [
            ...c.timeline,
            {
              status: bulkAction,
              note: `Bulk administrator operation applied: marked ${bulkAction}.`,
              at: nowIso,
              author: 'System Administrator',
            },
          ],
        };
        CampusCareStorage.updateComplaint(updated);
      }
    });

    CampusCareStorage.addAuditLog(
      'usr_admin_sarah',
      'admin@campus.com',
      'BULK_STATUS_UPDATE',
      undefined,
      `${bulkAction} applied to ${selectedIds.length} tickets`
    );

    setSuccessMessage(`Successfully updated ${selectedIds.length} complaints to ${bulkAction}.`);
    setSelectedIds([]);
    onRefreshComplaints();
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // CSV Report Generator
  const downloadCsv = () => {
    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Priority',
      'Department',
      'Status',
      'Student Name',
      'Created At',
      'SLA Deadline',
      'Rating',
    ];

    const rows = allComplaints.map((c) => [
      c.complaint_id,
      `"${c.title.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.department,
      c.status,
      c.anonymous ? 'Anonymous' : c.student_name,
      c.created_at,
      c.sla_deadline,
      c.rating || 'N/A',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campuscare_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Institutional Administration
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Command Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor institutional service quality, track departmental load balances, and execute bulk resolution actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>
        </div>
      </div>

      {/* Success banner */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          ✓ {successMessage}
        </div>
      )}

      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Registry</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Complaints logged</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Resolved Rate</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
            {total > 0 ? Math.round((resolved / total) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{resolved} issues closed</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overdue SLA</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
            {overdue}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Requires intervention</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Critical Hazards</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400 mt-1">
            {critical}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">4h response policy</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Registered Users</div>
          <div className="text-2xl font-mono font-bold tabular-nums text-slate-900 dark:text-white mt-1">
            {allUsers.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Students & staff</div>
        </div>
      </div>

      {/* Visual Load Balances (Feature 36 from V3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Load Bars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Grievance Volume by Category
            </h3>
            <span className="text-[11px] text-slate-400">Total: {total}</span>
          </div>

          <div className="space-y-2.5">
            {categoryStats.map((item) => {
              const pct = total > 0 ? (item.count / maxCat) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department Load Bars */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Departmental Operational Workload
            </h3>
            <span className="text-[11px] text-slate-400">Active staffing</span>
          </div>

          <div className="space-y-2.5">
            {departmentStats.map((item) => {
              const pct = total > 0 ? (item.count / maxDept) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bulk Action Controls & Grievance Selection Table (Feature 33) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bulk Complaint Operations
            </h3>
            <p className="text-xs text-slate-500">
              Select multiple grievances to apply batch state transitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="Resolved">Mark Resolved</option>
              <option value="Escalated">Escalate to Dean</option>
              <option value="Pending">Move to Pending</option>
            </select>

            <button
              onClick={handleApplyBulk}
              disabled={selectedIds.length === 0}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 shadow-xs"
            >
              Apply to Selected ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === allComplaints.length && allComplaints.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                </th>
                <th className="py-2.5 px-3">Identifier</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allComplaints.map((c) => {
                const isSelected = selectedIds.includes(c.complaint_id);
                return (
                  <tr
                    key={c.complaint_id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                      isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                    onClick={() => toggleSelect(c.complaint_id)}
                  >
                    <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(c.complaint_id)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {c.complaint_id}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {c.department}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {c.priority}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Administration Hub links */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => onNavigate('users')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Users className="w-3.5 h-3.5" />
          User Management
        </button>

        <button
          onClick={() => onNavigate('audit')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Security Audit Trail
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <BarChart className="w-3.5 h-3.5" />
          Analytics & Trends
        </button>

        <button
          onClick={() => onNavigate('maintenance')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Layers className="w-3.5 h-3.5" />
          Maintenance Notices
        </button>
      </div>
    </div>
  );
};

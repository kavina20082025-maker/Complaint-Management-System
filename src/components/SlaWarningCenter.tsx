import React, { useState } from 'react';
import { ClockAlert, Bell, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { Complaint, User } from '../types';
import { getSlaStatus } from '../services/smartEngine';
import { CampusCareStorage } from '../services/storage';

interface SlaWarningCenterProps {
  currentUser: User;
  allComplaints: Complaint[];
  onSelectComplaint: (cid: string) => void;
  onRefreshComplaints: () => void;
}

export const SlaWarningCenter: React.FC<SlaWarningCenterProps> = ({
  currentUser,
  allComplaints,
  onSelectComplaint,
  onRefreshComplaints,
}) => {
  const [alertSent, setAlertSent] = useState(false);
  const [escalatedCount, setEscalatedCount] = useState(0);

  // Complaints approaching SLA within 6 hours OR already overdue
  const atRiskComplaints = allComplaints.filter((c) => {
    if (c.status === 'Resolved' || c.status === 'Closed') return false;
    const sla = getSlaStatus(c.sla_deadline, c.status);
    return sla.isApproaching || sla.isOverdue;
  });

  const overdueComplaints = atRiskComplaints.filter(
    (c) => new Date(c.sla_deadline).getTime() < Date.now() && c.status !== 'Escalated'
  );

  const handleSendReminders = () => {
    atRiskComplaints.forEach((c) => {
      if (c.assigned_to) {
        CampusCareStorage.addNotification(
          c.assigned_to,
          'SLA Deadline Approaching',
          `Complaint ${c.complaint_id} is approaching its guaranteed SLA limit. Immediate action required.`,
          c.complaint_id
        );
      }
      CampusCareStorage.addNotification(
        c.student_id,
        'SLA Priority Tracking Active',
        `Your grievance ${c.complaint_id} is under heightened SLA monitoring by department leadership.`,
        c.complaint_id
      );
    });

    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'SLA_REMINDERS_SENT',
      undefined,
      `Sent alerts for ${atRiskComplaints.length} tickets`
    );

    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  };

  const handleEscalateOverdue = () => {
    let count = 0;
    const nowIso = new Date().toISOString();

    allComplaints.forEach((c) => {
      if (
        (c.status === 'Pending' || c.status === 'Assigned' || c.status === 'In Progress') &&
        new Date(c.sla_deadline).getTime() < Date.now()
      ) {
        const updated: Complaint = {
          ...c,
          status: 'Escalated',
          updated_at: nowIso,
          timeline: [
            ...c.timeline,
            {
              status: 'Escalated',
              note: `Automated SLA breach escalation triggered by ${currentUser.name}. Forwarded to Dean of Student Affairs.`,
              at: nowIso,
              author: currentUser.name,
            },
          ],
        };
        CampusCareStorage.updateComplaint(updated);
        CampusCareStorage.addAuditLog(
          currentUser.id,
          currentUser.email,
          'AUTO_ESCALATED',
          c.complaint_id,
          'Exceeded SLA target'
        );
        count++;
      }
    });

    setEscalatedCount(count);
    onRefreshComplaints();
    setTimeout(() => setEscalatedCount(0), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-rose-600 dark:text-rose-400 mb-1">
            Service Level Governance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            SLA Warning & Escalation Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitors unresolved grievances within 6 hours of guaranteed SLA breach or overdue resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendReminders}
            disabled={atRiskComplaints.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border dark:border-amber-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Bell className="w-3.5 h-3.5" />
            {alertSent ? 'Alerts Dispatched!' : 'Send Reminder Notifications'}
          </button>

          <button
            onClick={handleEscalateOverdue}
            disabled={overdueComplaints.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {escalatedCount > 0
              ? `Escalated ${escalatedCount} Tickets!`
              : 'Escalate Overdue Tickets'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total SLA At-Risk</div>
          <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
            {atRiskComplaints.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under close monitoring</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Overdue Breaches</div>
          <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
            {overdueComplaints.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Past resolution window</div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Resolution SLA Policy</div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
            4h Critical · 12h High · 48h Medium
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dean’s Office Mandate</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-900 dark:text-white">
          Complaints Requiring Immediate Attention
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Department & Assignee</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">SLA Deadline Status</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {atRiskComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    All active grievances are comfortably within their guaranteed SLA windows!
                  </td>
                </tr>
              ) : (
                atRiskComplaints.map((c) => {
                  const sla = getSlaStatus(c.sla_deadline, c.status);
                  return (
                    <tr
                      key={c.complaint_id}
                      onClick={() => onSelectComplaint(c.complaint_id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {c.complaint_id} · {c.location}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {c.department}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.assigned_name || 'Unassigned pool'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-rose-600 dark:text-rose-400">
                        {c.priority}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold tabular-nums text-xs ${
                            sla.isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {sla.formatted}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Target: {new Date(c.sla_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
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
                          Triage Now
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
    </div>
  );
};

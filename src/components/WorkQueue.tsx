import React, { useState } from 'react';
import { Inbox, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';
import { Complaint, User } from '../types';
import { getSlaStatus } from '../services/smartEngine';

interface WorkQueueProps {
  currentUser: User;
  allComplaints: Complaint[];
  onSelectComplaint: (cid: string) => void;
}

export const WorkQueue: React.FC<WorkQueueProps> = ({
  currentUser,
  allComplaints,
  onSelectComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned_to_me' | 'urgent'>('all');

  const queueComplaints = allComplaints.filter((c) => {
    // Staff usually sees their department
    if (currentUser.role === 'staff' || currentUser.role === 'department_head') {
      const isDept = c.department.toLowerCase() === currentUser.department.toLowerCase();
      const isMe = c.assigned_to === currentUser.id;
      if (!isDept && !isMe) return false;
    }

    if (activeTab === 'assigned_to_me') {
      return c.assigned_to === currentUser.id;
    }
    if (activeTab === 'urgent') {
      return c.priority === 'Critical' || c.priority === 'High';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          Duty Desk Operational Queue
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Staff Work Queue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Active triage for {currentUser.department}. Resolve issues before SLA countdown expires to prevent administrative escalation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Department Issues ({allComplaints.filter((c) => c.department.toLowerCase() === currentUser.department.toLowerCase()).length})
        </button>
        <button
          onClick={() => setActiveTab('assigned_to_me')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'assigned_to_me'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Assigned to Me ({allComplaints.filter((c) => c.assigned_to === currentUser.id).length})
        </button>
        <button
          onClick={() => setActiveTab('urgent')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'urgent'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Critical / Urgent Priority
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {queueComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active issues currently in this view.
                  </td>
                </tr>
              ) : (
                queueComplaints.map((c) => {
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
                          {c.complaint_id} · {c.category}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.location}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {c.assigned_name || 'Unassigned pool'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.student_name}
                        </div>
                      </td>

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
                          {c.priority}
                        </span>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          {sla.formatted}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
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
                          className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 rounded-lg shadow-xs"
                        >
                          Triage
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

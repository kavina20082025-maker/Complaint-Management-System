import React, { useState } from 'react';
import { Activity, Clock, Search, ArrowUpRight } from 'lucide-react';
import { Complaint } from '../types';
import { getSlaStatus } from '../services/smartEngine';

interface LiveStatusBoardProps {
  complaints: Complaint[];
  onSelectComplaint: (cid: string) => void;
}

export const LiveStatusBoard: React.FC<LiveStatusBoardProps> = ({
  complaints,
  onSelectComplaint,
}) => {
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = complaints.filter((c) => {
    if (filterDept !== 'All' && c.department !== filterDept) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    return true;
  });

  const departments = ['All', ...Array.from(new Set(complaints.map((c) => c.department)))];
  const statuses = ['All', 'Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Escalated'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Campus Live Operations
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Complaint Status Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time movement and triage telemetry across all university residential and academic facilities.
          </p>
        </div>

        {/* Live Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time Stream Connected</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
        <div className="text-xs font-semibold text-slate-500">Filter by Dept:</div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="text-xs font-semibold text-slate-500 ml-2">Status:</div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="text-xs text-slate-400 ml-auto tabular-nums font-mono">
          Showing {filtered.length} active records
        </div>
      </div>

      {/* Grid of Movement Cards */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket Identifier</th>
                <th className="py-3 px-4">Issue Summary</th>
                <th className="py-3 px-4">Department & Officer</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Current Phase</th>
                <th className="py-3 px-4 text-right">Last Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((c) => {
                const sla = getSlaStatus(c.sla_deadline, c.status);
                return (
                  <tr
                    key={c.complaint_id}
                    onClick={() => onSelectComplaint(c.complaint_id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {c.complaint_id}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {c.location}
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

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500 text-[11px]">
                      {new Date(c.updated_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

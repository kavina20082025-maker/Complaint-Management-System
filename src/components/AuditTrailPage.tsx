import React from 'react';
import { ShieldCheck, Clock, FileText } from 'lucide-react';
import { CampusCareStorage } from '../services/storage';

export const AuditTrailPage: React.FC = () => {
  const auditLogs = CampusCareStorage.getAuditLogs();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          System Integrity & Compliance
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Security & Operations Audit Trail
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Immutable event log of user authentications, ticket state modifications, escalations, and resolution verifications.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          Showing latest {auditLogs.length} audit entries
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Target Complaint</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-500 tabular-nums">
                    {new Date(log.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-white">
                    {log.user_email}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {log.complaint_id || '—'}
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600 dark:text-slate-300">
                    {log.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

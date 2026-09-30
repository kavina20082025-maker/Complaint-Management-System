import React from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { Complaint, User } from '../types';
import { CampusCareStorage } from '../services/storage';
import { getSlaStatus } from '../services/smartEngine';

interface WatchlistPageProps {
  currentUser: User;
  allComplaints: Complaint[];
  onSelectComplaint: (cid: string) => void;
}

export const WatchlistPage: React.FC<WatchlistPageProps> = ({
  currentUser,
  allComplaints,
  onSelectComplaint,
}) => {
  const watchedIds = CampusCareStorage.getWatchlist(currentUser.id);
  const watchedComplaints = allComplaints.filter((c) =>
    watchedIds.includes(c.complaint_id)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          Pinned Grievances
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          My Watchlist
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Issues you have bookmarked for priority tracking and instant status movement notifications.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Category & Department</th>
                <th className="py-3 px-4">Priority & SLA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {watchedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Star className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                    You haven’t pinned any complaints yet. Open any ticket and click "Watch Ticket" to pin it here.
                  </td>
                </tr>
              ) : (
                watchedComplaints.map((c) => {
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
                          {c.category}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.department}</div>
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
    </div>
  );
};

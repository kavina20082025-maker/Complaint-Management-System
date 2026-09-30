import React from 'react';
import { BarChart3, TrendingUp, Star, Award, CheckCircle2 } from 'lucide-react';
import { Complaint } from '../types';

interface AnalyticsTrendsProps {
  complaints: Complaint[];
}

export const AnalyticsTrends: React.FC<AnalyticsTrendsProps> = ({ complaints }) => {
  // Mock monthly trends simulating past 6 months
  const monthlyData = [
    { month: 'May 2026', total: 28, resolved: 26 },
    { month: 'Jun 2026', total: 34, resolved: 31 },
    { month: 'Jul 2026', total: 22, resolved: 21 },
    { month: 'Aug 2026', total: 46, resolved: 42 },
    { month: 'Sep 2026', total: 39, resolved: 35 },
    { month: 'Current', total: complaints.length, resolved: complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => d.total), 1);
  const nextMonthForecast = Math.round(
    monthlyData.slice(-3).reduce((acc, curr) => acc + curr.total, 0) / 3
  );

  // Rating distribution
  const ratings = complaints.filter((c) => c.rating !== undefined);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          Performance Analytics
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Complaint Trend & Quality Metrics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historical analysis of university student grievances, seasonal surges, and resolution turnaround times.
        </p>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Monthly Grievance Inflow & Resolution
            </h3>
            <p className="text-xs text-slate-500">6-Month volume comparison</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-600 rounded-sm" />
              <span className="text-slate-600 dark:text-slate-400">Total Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm" />
              <span className="text-slate-600 dark:text-slate-400">Resolved</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 grid grid-cols-6 gap-2 sm:gap-6 items-end h-64 border-b border-slate-100 dark:border-slate-800 pb-4">
          {monthlyData.map((d) => {
            const hTotal = (d.total / maxVal) * 100;
            const hRes = (d.resolved / maxVal) * 100;
            return (
              <div key={d.month} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 w-full justify-center h-48">
                  {/* Total bar */}
                  <div
                    className="w-4 sm:w-8 bg-indigo-600 dark:bg-indigo-500 rounded-t-md transition-all duration-500 relative group"
                    style={{ height: `${hTotal}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.total}
                    </span>
                  </div>
                  {/* Resolved bar */}
                  <div
                    className="w-4 sm:w-8 bg-emerald-500 dark:bg-emerald-400 rounded-t-md transition-all duration-500 relative group"
                    style={{ height: `${hRes}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {d.resolved}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-slate-500 text-center truncate max-w-full">
                  {d.month}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-2">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>Next-Month Moving Average Projection: {nextMonthForecast} complaints</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Based on 3-month rolling weighted average
          </span>
        </div>
      </div>

      {/* Satisfaction & Turnaround Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Rating Quality Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Student Post-Resolution Ratings
            </h3>
            <Award className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-2">
            {ratingCounts.map(({ star, count }) => {
              const maxR = Math.max(...ratingCounts.map((r) => r.count), 1);
              const pct = (count / maxR) * 100;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 font-mono tabular-nums text-right text-slate-500">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turnaround Compliance by SLA Tier */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              SLA Window Compliance
            </h3>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Critical Hazards (4h SLA)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">96.4% on-time</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">High Urgency (12h SLA)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">92.8% on-time</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Medium Routine (48h SLA)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">98.1% on-time</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-600 dark:text-slate-400">Low Administration (120h SLA)</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">99.2% on-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Wrench, Calendar, MapPin, Plus, CheckCircle2, Clock } from 'lucide-react';
import { MaintenanceNotice, User } from '../types';
import { CampusCareStorage } from '../services/storage';

interface MaintenancePageProps {
  currentUser: User;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ currentUser }) => {
  const [notices, setNotices] = useState<MaintenanceNotice[]>(() =>
    CampusCareStorage.getMaintenance()
  );
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const isStaffOrAdmin =
    currentUser.role === 'staff' ||
    currentUser.role === 'department_head' ||
    currentUser.role === 'admin';

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !area.trim() || !date) return;

    const newNotice: MaintenanceNotice = {
      id: `maint_${Date.now()}`,
      title: title.trim(),
      area: area.trim(),
      date,
      note: note.trim(),
      created_by: currentUser.email,
      created_at: new Date().toISOString(),
      status: 'Scheduled',
    };

    CampusCareStorage.addMaintenance(newNotice);
    setNotices(CampusCareStorage.getMaintenance());
    setTitle('');
    setArea('');
    setDate('');
    setNote('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Campus Infrastructure Noticeboard
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Planned Maintenance & Service Windows
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Advance schedule of water tank scouring, network backbone migrations, electrical calibrations, and lift servicing.
          </p>
        </div>

        {isStaffOrAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Publish Maintenance Notice
          </button>
        )}
      </div>

      {/* Grid of Notices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {notices.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : item.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                  }`}
                >
                  {item.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {item.date}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                {item.title}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.area}</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                {item.note}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Published by {item.created_by}
            </div>
          </div>
        ))}
      </div>

      {/* Modal to add notice */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Publish Planned Maintenance
            </h3>

            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maintenance Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electrical transformer maintenance"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campus Area Affected
                </label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Hostel Block B, South Gate"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Impact Details & Timings
                </label>
                <textarea
                  rows={3}
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain which services will be down and for how long..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Megaphone, Plus, AlertCircle, Shield } from 'lucide-react';
import { Announcement, User } from '../types';
import { CampusCareStorage } from '../services/storage';

interface AnnouncementsPageProps {
  currentUser: User;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ currentUser }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(() =>
    CampusCareStorage.getAnnouncements()
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'students' | 'staff'>('all');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'students' | 'staff'>('all');
  const [isUrgent, setIsUrgent] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const filtered = announcements.filter((a) => {
    if (audienceFilter === 'all') return true;
    return a.audience === 'all' || a.audience === audienceFilter;
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newAnn: Announcement = {
      id: `ann_${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      audience,
      created_at: new Date().toISOString(),
      created_by: currentUser.name,
      urgent: isUrgent,
    };

    CampusCareStorage.addAnnouncement(newAnn);
    setAnnouncements(CampusCareStorage.getAnnouncements());
    setTitle('');
    setMessage('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Institutional Notices & Broadcasts
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            Campus Notices
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Authoritative policy alerts, anti-ragging mandates, examination schedules, and facility guidelines.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Publish Campus Notice
          </button>
        )}
      </div>

      {/* Audience selector */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {(['all', 'students', 'staff'] as const).map((aud) => (
          <button
            key={aud}
            onClick={() => setAudienceFilter(aud)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
              audienceFilter === aud
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {aud === 'all' ? 'All Broadcasts' : `For ${aud}`}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs space-y-2.5 ${
              ann.urgent
                ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {ann.urgent && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    High Priority Alert
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium capitalize">
                  Target: {ann.audience}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {new Date(ann.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {ann.title}
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {ann.message}
            </p>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Published by {ann.created_by}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Publish Campus Notice
            </h3>

            <form onSubmit={handlePublish} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Campus Wi-Fi scheduled downtime"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Audience
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="all">Everyone on Campus</option>
                  <option value="students">Students Only</option>
                  <option value="staff">Administrative Staff Only</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Announcement Text
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write message details..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-slate-300 text-rose-600"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Mark as High-Priority Notice
                </span>
              </label>

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

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  Building,
  Upload,
  X,
  FileCheck,
  ChevronRight,
  Shield,
  Info,
} from 'lucide-react';
import {
  smartCategory,
  smartDepartment,
  smartPriority,
  findDuplicate,
  getActionTip,
  suggestStaff,
  generateComplaintId,
  SLA_HOURS,
  CATEGORIES,
} from '../services/smartEngine';
import { Complaint, User, Attachment } from '../types';
import { CampusCareStorage } from '../services/storage';

interface SubmitComplaintProps {
  currentUser: User;
  allComplaints: Complaint[];
  allUsers: User[];
  onComplaintCreated: (complaint: Complaint) => void;
  onNavigateToComplaint: (cid: string) => void;
}

export const SubmitComplaint: React.FC<SubmitComplaintProps> = ({
  currentUser,
  allComplaints,
  allUsers,
  onComplaintCreated,
  onNavigateToComplaint,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual override toggles if user wants to change detected category
  const [manualCategory, setManualCategory] = useState<string>('');

  // Live pre-analysis computation
  const combinedText = useMemo(() => `${title} ${description}`, [title, description]);

  const detectedCategory = useMemo(() => {
    if (manualCategory) return manualCategory;
    return smartCategory(combinedText);
  }, [combinedText, manualCategory]);

  const detectedPriority = useMemo(() => {
    return smartPriority(combinedText, isCritical);
  }, [combinedText, isCritical]);

  const detectedDepartment = useMemo(() => {
    return smartDepartment(combinedText, detectedCategory as any);
  }, [combinedText, detectedCategory]);

  const slaHours = SLA_HOURS[detectedPriority];

  const suggestedStaffMember = useMemo(() => {
    return suggestStaff(detectedDepartment, allUsers, allComplaints);
  }, [detectedDepartment, allUsers, allComplaints]);

  const duplicate = useMemo(() => {
    return findDuplicate(title, description, allComplaints, currentUser.id);
  }, [title, description, allComplaints, currentUser.id]);

  const actionTip = useMemo(() => {
    return getActionTip(detectedPriority, detectedCategory as any);
  }, [detectedPriority, detectedCategory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newAttachments: Attachment[] = files.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type || 'application/octet-stream',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const cid = generateComplaintId();
    const nowIso = new Date().toISOString();
    const deadlineIso = new Date(Date.now() + slaHours * 3600 * 1000).toISOString();

    const newComplaint: Complaint = {
      complaint_id: cid,
      student_id: currentUser.id,
      student_name: isAnonymous ? 'Anonymous Student' : currentUser.name,
      student_email: currentUser.email,
      anonymous: isAnonymous,
      location: location.trim() || 'Campus Premises',
      title: title.trim(),
      description: description.trim(),
      category: detectedCategory as any,
      priority: detectedPriority,
      department: detectedDepartment,
      status: suggestedStaffMember ? 'Assigned' : 'Pending',
      sla_hours: slaHours,
      sla_deadline: deadlineIso,
      created_at: nowIso,
      updated_at: nowIso,
      attachments,
      duplicate_of: duplicate ? duplicate.complaint_id : null,
      critical: isCritical || detectedPriority === 'Critical',
      assigned_to: suggestedStaffMember ? suggestedStaffMember.id : undefined,
      assigned_name: suggestedStaffMember ? suggestedStaffMember.name : undefined,
      timeline: [
        {
          status: 'Pending',
          note: `Grievance submitted by ${isAnonymous ? 'Anonymous Student' : currentUser.name}. Classified as ${detectedCategory} with guaranteed ${slaHours}h resolution SLA.`,
          at: nowIso,
          author: 'CampusCare Smart Engine',
        },
      ],
    };

    if (suggestedStaffMember) {
      newComplaint.timeline.push({
        status: 'Assigned',
        note: `Workload-aware routing dispatched ticket to ${suggestedStaffMember.name} (${detectedDepartment}).`,
        at: nowIso,
        author: 'Automated Dispatcher',
      });
    }

    CampusCareStorage.addComplaint(newComplaint);
    setIsSubmitting(false);
    onComplaintCreated(newComplaint);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          Intelligent Grievance Intake
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
          Report a Campus Issue
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          CampusCare analyzes your issue in real time to recommend the responsible administrative
          department, assign priority, and enforce SLA deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submission Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water supply stopped on 2nd floor of Hostel Block B"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, exact room or wing, how long the issue has persisted, and how it impacts your academic or living environment..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Location & Category override row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Campus Location / Room
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Block C, Room 314"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category (Auto-detected)
                </label>
                <select
                  value={manualCategory || detectedCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} {cat === detectedCategory && !manualCategory ? '(AI Suggestion)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Evidence & Attachment Uploader */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Attach Supporting Evidence (Images, Logs, PDF receipts)
              </label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop files
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  PNG, JPG, PDF up to 10MB
                </div>
              </div>

              {/* Uploaded attachments list */}
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {file.name}
                        </span>
                        <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                          {file.size}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkbox controls */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCritical}
                  onChange={(e) => setIsCritical(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-rose-600 dark:text-rose-400 font-bold">Mark as Critical Emergency</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Use strictly for direct bodily hazard, severe electrical/fire risk, or total hostel disruption. Triggers an urgent 4-hour SLA.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    Submit as Anonymous Student
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Hides your name and roll number from normal complaint displays. Recommended for sensitive personal issues or integrity reports.
                  </div>
                </div>
              </label>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs"
              >
                <span>Submit Grievance</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Right Column: Live Smart Pre-Analysis Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Live Pre-Analysis Engine
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Dynamic classification as you type
                </div>
              </div>
            </div>

            {/* Duplicate detection alert banner */}
            {duplicate && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Possible Duplicate Detected</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  A very similar issue was already submitted recently:
                  <span className="font-semibold block mt-0.5 text-amber-950 dark:text-amber-100">
                    "{duplicate.title}" ({duplicate.complaint_id})
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToComplaint(duplicate.complaint_id)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:underline pt-0.5"
                >
                  View existing ticket <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Analytical Metrics */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Predicted Category</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {detectedCategory}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Assigned Priority</span>
                <span
                  className={`font-semibold ${
                    detectedPriority === 'Critical'
                      ? 'text-rose-600 dark:text-rose-400'
                      : detectedPriority === 'High'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {detectedPriority}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Routing Department</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {detectedDepartment}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Resolution SLA Target</span>
                <span className="font-mono font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {slaHours} hours guaranteed
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Automated Dispatch</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {suggestedStaffMember ? suggestedStaffMember.name : 'Duty Officer Pool'}
                </span>
              </div>
            </div>

            {/* AI Action Guidance Tip */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                <span>Intake Guidance</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {actionTip}
              </p>
            </div>

            {/* University Service Charter */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>CampusCare Assurance Policy</span>
              </div>
              <p>
                Every grievance is logged with an immutable audit timestamp. If an issue is not
                resolved within {slaHours} hours, it is escalated directly to the Dean of Student Affairs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

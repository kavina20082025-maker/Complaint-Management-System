import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  QrCode,
  Clock,
  Building,
  MapPin,
  Send,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User as UserIcon,
  Shield,
  MessageSquare,
  History,
  FileText,
} from 'lucide-react';
import { Complaint, User, Message, ComplaintStatus } from '../types';
import { CampusCareStorage } from '../services/storage';
import { getSlaStatus } from '../services/smartEngine';
import { QrCodeModal } from './QrCodeModal';

interface ComplaintDetailsProps {
  complaintId: string;
  currentUser: User;
  allUsers: User[];
  onBack: () => void;
  onUpdateComplaint: (updated: Complaint) => void;
}

export const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  complaintId,
  currentUser,
  allUsers,
  onBack,
  onUpdateComplaint,
}) => {
  const [complaint, setComplaint] = useState<Complaint | undefined>(() =>
    CampusCareStorage.getComplaintById(complaintId)
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    CampusCareStorage.getMessages(complaintId)
  );
  const [newMessage, setNewMessage] = useState('');
  const [isWatched, setIsWatched] = useState<boolean>(() =>
    CampusCareStorage.getWatchlist(currentUser.id).includes(complaintId)
  );
  const [showQrModal, setShowQrModal] = useState(false);

  // Staff workflow form
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(
    complaint ? complaint.status : 'Pending'
  );
  const [statusNote, setStatusNote] = useState('');
  const [reassignStaffId, setReassignStaffId] = useState('');

  // Student resolution verification form
  const [verificationDecision, setVerificationDecision] = useState<'accept' | 'reject' | null>(null);
  const [verificationNote, setVerificationNote] = useState('');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  // Canned templates
  const templates = CampusCareStorage.getTemplates();

  useEffect(() => {
    const current = CampusCareStorage.getComplaintById(complaintId);
    setComplaint(current);
    if (current) {
      setSelectedStatus(current.status);
    }
    setMessages(CampusCareStorage.getMessages(complaintId));
    setIsWatched(CampusCareStorage.getWatchlist(currentUser.id).includes(complaintId));
  }, [complaintId, currentUser.id]);

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Complaint Record Not Found
        </h2>
        <p className="text-sm text-slate-500">
          The requested complaint identifier ({complaintId}) could not be located in the university registry.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </button>
      </div>
    );
  }

  const sla = getSlaStatus(complaint.sla_deadline, complaint.status);
  const isStudentOwner =
    currentUser.role === 'student' && complaint.student_id === currentUser.id;
  const isStaffOrAdmin =
    currentUser.role === 'staff' ||
    currentUser.role === 'department_head' ||
    currentUser.role === 'admin';

  // Toggle watchlist
  const handleToggleWatchlist = () => {
    const active = CampusCareStorage.toggleWatchlist(currentUser.id, complaint.complaint_id);
    setIsWatched(active);
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: `msg_${Date.now()}`,
      complaint_id: complaint.complaint_id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_email: currentUser.email,
      user_role: currentUser.role,
      body: newMessage.trim(),
      created_at: new Date().toISOString(),
    };

    CampusCareStorage.addMessage(msg);
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  // Staff update status
  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const nowIso = new Date().toISOString();
    const noteText = statusNote.trim() || `Status updated to ${selectedStatus} by ${currentUser.name}.`;

    const updatedTimeline = [
      ...complaint.timeline,
      {
        status: selectedStatus,
        note: noteText,
        at: nowIso,
        author: currentUser.name,
      },
    ];

    const updated: Complaint = {
      ...complaint,
      status: selectedStatus,
      updated_at: nowIso,
      timeline: updatedTimeline,
    };

    // Reassignment if selected
    if (reassignStaffId) {
      const staffUser = allUsers.find((u) => u.id === reassignStaffId);
      if (staffUser) {
        updated.assigned_to = staffUser.id;
        updated.assigned_name = staffUser.name;
        updated.timeline.push({
          status: selectedStatus,
          note: `Reassigned to ${staffUser.name} (${staffUser.department}) by ${currentUser.name}.`,
          at: nowIso,
          author: currentUser.name,
        });
        CampusCareStorage.addNotification(
          staffUser.id,
          'Complaint Reassigned to You',
          `Complaint ${complaint.complaint_id} was reassigned to your queue.`,
          complaint.complaint_id
        );
      }
    }

    CampusCareStorage.updateComplaint(updated);
    CampusCareStorage.addAuditLog(
      currentUser.id,
      currentUser.email,
      'STATUS_CHANGED',
      complaint.complaint_id,
      `Status changed to ${selectedStatus}`
    );

    // Notify student
    CampusCareStorage.addNotification(
      complaint.student_id,
      `Complaint Updated: ${selectedStatus}`,
      `Your grievance ${complaint.complaint_id} is now ${selectedStatus}.`,
      complaint.complaint_id
    );

    setComplaint(updated);
    setStatusNote('');
    setReassignStaffId('');
    onUpdateComplaint(updated);
  };

  // Resolution verification submission (Student closes loop)
  const handleResolutionVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDecision) return;

    const nowIso = new Date().toISOString();

    if (verificationDecision === 'accept') {
      // Verified and closed
      const updated: Complaint = {
        ...complaint,
        status: 'Closed',
        verified: true,
        verified_at: nowIso,
        verification_note: verificationNote.trim() || 'Student verified resolution.',
        rating,
        feedback: feedbackText.trim() || 'Issue addressed satisfactorily.',
        feedback_at: nowIso,
        updated_at: nowIso,
        timeline: [
          ...complaint.timeline,
          {
            status: 'Closed',
            note: `Student accepted resolution: "${verificationNote.trim() || 'Service restored successfully'}". Satisfaction rating: ${rating}/5.`,
            at: nowIso,
            author: currentUser.name,
          },
        ],
      };

      CampusCareStorage.updateComplaint(updated);
      CampusCareStorage.addAuditLog(
        currentUser.id,
        currentUser.email,
        'RESOLUTION_VERIFIED',
        complaint.complaint_id,
        `Closed with rating ${rating}/5`
      );

      setComplaint(updated);
      setVerificationDecision(null);
      onUpdateComplaint(updated);
    } else {
      // Rejected and reopened
      const updated: Complaint = {
        ...complaint,
        status: 'Reopened',
        verified: false,
        verification_note: verificationNote.trim() || 'Student reported issue still persists.',
        updated_at: nowIso,
        timeline: [
          ...complaint.timeline,
          {
            status: 'Reopened',
            note: `REOPENED BY STUDENT: "${verificationNote.trim() || 'Problem remains unresolved'}". Escalated back to department lead.`,
            at: nowIso,
            author: currentUser.name,
          },
        ],
      };

      CampusCareStorage.updateComplaint(updated);
      CampusCareStorage.addAuditLog(
        currentUser.id,
        currentUser.email,
        'RESOLUTION_REJECTED',
        complaint.complaint_id,
        verificationNote.trim()
      );

      // Alert department head & staff
      if (complaint.assigned_to) {
        CampusCareStorage.addNotification(
          complaint.assigned_to,
          'Resolution Rejected: Grievance Reopened',
          `Student reported that ${complaint.complaint_id} was not resolved. Reason: ${verificationNote.slice(0, 50)}`,
          complaint.complaint_id
        );
      }

      setComplaint(updated);
      setVerificationDecision(null);
      onUpdateComplaint(updated);
    }
  };

  const handleApplyTemplate = (body: string) => {
    setStatusNote(body);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <div className="flex items-center gap-2">
          {/* Watchlist toggle */}
          <button
            onClick={handleToggleWatchlist}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isWatched
                ? 'border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-amber-400 text-amber-400' : ''}`} />
            {isWatched ? 'Watched' : 'Watch Ticket'}
          </button>

          {/* QR Code trigger */}
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            Inspection QR
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            {/* Unboxed metadata row with separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {complaint.complaint_id}
              </span>
              <span aria-hidden="true">·</span>
              <span>{complaint.category}</span>
              <span aria-hidden="true">·</span>
              <span>{complaint.department}</span>
              <span aria-hidden="true">·</span>
              <span>{complaint.location}</span>
              {complaint.anonymous && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    Anonymous Filing
                  </span>
                </>
              )}
            </div>

            <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              {complaint.title}
            </h1>
          </div>

          {/* SLA Countdown & Status */}
          <div className="flex flex-col sm:items-end gap-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                  complaint.status === 'Resolved' || complaint.status === 'Closed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : complaint.status === 'Escalated'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {complaint.status}
              </span>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                  complaint.priority === 'Critical'
                    ? 'bg-rose-500 text-white'
                    : complaint.priority === 'High'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                {complaint.priority} Priority
              </span>
            </div>

            {/* SLA Timer */}
            <div className="flex items-center gap-1.5 text-xs mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span
                className={`font-mono tabular-nums font-semibold ${
                  sla.isOverdue
                    ? 'text-rose-600 dark:text-rose-400'
                    : sla.isApproaching
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {sla.formatted}
              </span>
              <span className="text-[11px] text-slate-400">
                ({complaint.sla_hours}h SLA)
              </span>
            </div>
          </div>
        </div>

        {/* Duplicate Banner if flagged */}
        {complaint.duplicate_of && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              This ticket shares high similarity with previously logged ticket{' '}
              <span className="font-mono font-bold">{complaint.duplicate_of}</span>.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content (Left, 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Description & Evidence */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Problem Description
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Attached Evidence */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Evidence & Documentation ({complaint.attachments.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {complaint.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {file.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                        {file.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Student Resolution Verification Loop (Feature 29) */}
          {complaint.status === 'Resolved' && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Resolution Verification Requested
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    The maintenance desk reported that this issue has been fixed. Did their action solve the problem?
                  </p>
                </div>
              </div>

              {isStudentOwner || currentUser.role === 'student' || isStaffOrAdmin ? (
                <form onSubmit={handleResolutionVerification} className="space-y-3 pt-1">
                  {!verificationDecision ? (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setVerificationDecision('accept')}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Yes, service restored — close ticket
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationDecision('reject')}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        No, problem persists — reopen
                      </button>
                    </div>
                  ) : verificationDecision === 'accept' ? (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Confirm Closure & Rate Support
                        </span>
                        <button
                          type="button"
                          onClick={() => setVerificationDecision(null)}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* 5-star rating */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Satisfaction Rating (1 to 5)
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRating(s)}
                              className="p-1 text-amber-400 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 ml-2">
                            {rating} / 5
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Optional Student Feedback
                        </label>
                        <textarea
                          rows={2}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="What did the team do well? Any suggestions for campus facilities?"
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                      >
                        Submit Verification & Close Grievance
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          Reopen Grievance
                        </span>
                        <button
                          type="button"
                          onClick={() => setVerificationDecision(null)}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Cancel
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Why is the issue not resolved? (Required)
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={verificationNote}
                          onChange={(e) => setVerificationNote(e.target.value)}
                          placeholder="Describe what is still broken or what the technician missed..."
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 px-3 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                      >
                        Confirm Reopening & Alert Lead
                      </button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-xs text-slate-500">
                  Awaiting student verification before formal ticket closure.
                </div>
              )}
            </div>
          )}

          {/* Student Feedback Display if Closed */}
          {complaint.status === 'Closed' && complaint.rating && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified Student Feedback
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= (complaint.rating || 0)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono ml-1">
                  {complaint.rating} / 5
                </span>
              </div>
              {complaint.feedback && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                  "{complaint.feedback}"
                </p>
              )}
              {complaint.verification_note && (
                <div className="text-[11px] text-slate-400 pt-1">
                  Verification note: {complaint.verification_note}
                </div>
              )}
            </div>
          )}

          {/* Timeline of Events */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Auditable Grievance Timeline
              </h3>
            </div>

            <div className="space-y-4 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {complaint.timeline.map((event, idx) => (
                <div key={idx} className="relative flex items-start gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 shrink-0 mt-0.5 ${
                      event.status === 'Resolved' || event.status === 'Closed'
                        ? 'bg-emerald-500'
                        : event.status === 'Escalated'
                        ? 'bg-rose-500'
                        : event.status === 'In Progress'
                        ? 'bg-indigo-500'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div className="flex-1 text-xs space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {event.status}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {new Date(event.at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{event.note}</p>
                    {event.author && (
                      <div className="text-[10px] text-slate-400">By {event.author}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Way Communication Thread */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Grievance Discussion Thread
              </h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No comments yet. Send a message to communicate directly with the duty team.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.user_id === currentUser.id;
                  return (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        isMe
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 ml-4 border-l-2 border-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 mr-4 border-l-2 border-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                          <span>{msg.user_name}</span>
                          <span className="text-[10px] text-slate-500 capitalize">
                            ({msg.user_role.replace('_', ' ')})
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {msg.body}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input to send reply */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message or inquiry regarding this ticket..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Reply
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Panel (Right, 4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Administrative Dispatch Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <div className="text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
              Operational Assignment
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Student Roll / ID</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">
                {complaint.anonymous ? 'Anonymous' : complaint.student_name}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Assigned Officer</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {complaint.assigned_name || 'Pending assignment'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Target Department</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {complaint.department}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">SLA Window</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                {complaint.sla_hours} hours ({sla.formatted})
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500">Submission Timestamp</span>
              <span className="font-mono tabular-nums text-slate-500 text-[11px]">
                {new Date(complaint.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Staff Workflow Actions Box */}
          {isStaffOrAdmin && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Staff Action Console
                </span>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Transition Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved (triggers student verify)</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Closed">Closed</option>
                    <option value="Reopened">Reopened</option>
                  </select>
                </div>

                {/* Reassignment to colleague if needed */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reassign Duty Officer
                  </label>
                  <select
                    value={reassignStaffId}
                    onChange={(e) => setReassignStaffId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="">Keep current assignee ({complaint.assigned_name || 'Unassigned'})</option>
                    {allUsers
                      .filter((u) => u.active && (u.role === 'staff' || u.role === 'department_head'))
                      .map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.department})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Canned Response Template Shortcut */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Insert Canned Response Template
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleApplyTemplate(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="" disabled>Select pre-approved response template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.body}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Note */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Note / Findings
                  </label>
                  <textarea
                    rows={3}
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Enter inspection findings, replacement parts, or resolution confirmation..."
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                >
                  Commit Status & Update Timeline
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Inspection Modal */}
      {showQrModal && (
        <QrCodeModal complaint={complaint} onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
};

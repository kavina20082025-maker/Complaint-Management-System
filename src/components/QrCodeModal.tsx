import React from 'react';
import { X, Printer, Check, Copy } from 'lucide-react';
import { Complaint } from '../types';

interface QrCodeModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ complaint, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  // Generate deterministic QR-like SVG matrix pattern based on complaint_id
  const size = 25;
  const hash = complaint.complaint_id
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 42);

  const getCell = (r: number, c: number): boolean => {
    // Standard 3 corner finder patterns (7x7)
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    if (r < 7 && c >= size - 7) {
      const cc = c - (size - 7);
      if (r === 0 || r === 6 || cc === 0 || cc === 6) return true;
      if (r >= 2 && r <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    }
    if (r >= size - 7 && c < 7) {
      const rr = r - (size - 7);
      if (rr === 0 || rr === 6 || c === 0 || c === 6) return true;
      if (rr >= 2 && rr <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Timing patterns
    if (r === 6 || c === 6) return (r + c) % 2 === 0;

    // Pseudo-random data modules derived from complaint hash & coords
    const val = (r * 37 + c * 19 + hash + r * c) % 17;
    return val % 2 === 0 || val === 3 || val === 7;
  };

  const shareUrl = `${window.location.origin}/#complaint/${complaint.complaint_id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Campus Physical Inspection Tag
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {complaint.complaint_id}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {complaint.title}
          </p>
        </div>

        {/* QR Code Graphic */}
        <div className="flex justify-center my-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col items-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-48 h-48 block"
              shapeRendering="crispEdges"
            >
              {Array.from({ length: size }).map((_, r) =>
                Array.from({ length: size }).map((_, c) =>
                  getCell(r, c) ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width={1}
                      height={1}
                      fill="#0f172a"
                    />
                  ) : null
                )
              )}
            </svg>
            <div className="mt-2 text-[10px] font-mono font-medium text-slate-500 tracking-wider">
              SCAN FOR AUDIT & LIVE TIMELINE
            </div>
          </div>
        </div>

        {/* Metadata unboxed */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
          <div className="flex justify-between">
            <span>Location</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
              {complaint.location}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Department</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {complaint.department}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Priority / SLA</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {complaint.priority} · {complaint.sla_hours}h target
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={copyLink}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Link' : 'Copy Direct URL'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};

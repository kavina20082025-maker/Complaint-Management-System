import React, { useEffect, useState } from 'react';
import { X, Printer, Check, Copy, Download, QrCode as QrIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { Complaint } from '../types';

interface QrCodeModalProps {
  complaint: Complaint;
  onClose: () => void;
  onOpenScanner?: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ complaint, onClose, onOpenScanner }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [encodeFormat, setEncodeFormat] = useState<'id' | 'url'>('id');

  const shareUrl = `${window.location.origin}/#complaint/${complaint.complaint_id}`;
  const qrContent = encodeFormat === 'id' ? complaint.complaint_id : shareUrl;

  useEffect(() => {
    QRCode.toDataURL(qrContent, {
      width: 320,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR code:', err);
      });
  }, [qrContent]);

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Inspection_Tag_${complaint.complaint_id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider mb-2">
            <QrIcon className="w-3.5 h-3.5" />
            Official Physical Inspection Tag
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {complaint.complaint_id}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
            {complaint.title}
          </p>
        </div>

        {/* Encode Format Pill Switcher */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setEncodeFormat('id')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                encodeFormat === 'id'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Ticket ID Tag
            </button>
            <button
              onClick={() => setEncodeFormat('url')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                encodeFormat === 'url'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Web Direct URL
            </button>
          </div>
        </div>

        {/* QR Code Graphic Display */}
        <div className="flex justify-center my-3">
          <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md flex flex-col items-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for ${complaint.complaint_id}`}
                className="w-48 h-48 block"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                Generating QR Tag...
              </div>
            )}
            <div className="mt-2 text-[10px] font-mono font-bold text-slate-600 tracking-wider">
              SCAN WITH CAMERA FOR INSTANT AUDIT
            </div>
          </div>
        </div>

        {/* Physical Metadata Card */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Location Tag</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200 text-right">
              {complaint.location}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Department</span>
            <span className="font-medium text-slate-900 dark:text-slate-200">
              {complaint.department}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Priority & SLA</span>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {complaint.priority} · {complaint.sla_hours}h target
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <button
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors truncate"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors truncate"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            Download
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs truncate"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Tag
          </button>
        </div>

        {onOpenScanner && (
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Open Camera QR Scanner <QrIcon className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

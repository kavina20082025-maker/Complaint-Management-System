import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Flashlight,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  ShieldAlert,
  History,
  Trash2,
  Clock,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Complaint, RecentScanItem } from '../types';
import { CampusCareStorage } from '../services/storage';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (complaintId: string) => void;
  allComplaints: Complaint[];
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  allComplaints,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [detectedComplaint, setDetectedComplaint] = useState<Complaint | null>(null);
  const [manualInput, setManualInput] = useState<string>('');
  const [manualError, setManualError] = useState<string | null>(null);

  // Recent Scans Drawer State
  const [showRecentDrawer, setShowRecentDrawer] = useState<boolean>(false);
  const [recentScans, setRecentScans] = useState<RecentScanItem[]>(() =>
    CampusCareStorage.getRecentScans()
  );

  // Refresh recent scans when modal opens
  useEffect(() => {
    if (isOpen) {
      setRecentScans(CampusCareStorage.getRecentScans());
    }
  }, [isOpen]);

  // Relative timestamp formatter
  const formatScanTime = (iso: string): string => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  // Play subtle feedback chime
  const playSuccessSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio not permitted or supported
    }

    // Vibration on mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  };

  // Helper to extract Complaint ID from scanned text / URL / JSON
  const extractComplaintId = useCallback(
    (raw: string): { id: string | null; complaint: Complaint | null } => {
      if (!raw) return { id: null, complaint: null };
      const trimmed = raw.trim();

      // 1. Direct match with existing complaints
      const direct = allComplaints.find(
        (c) => c.complaint_id.toLowerCase() === trimmed.toLowerCase()
      );
      if (direct) return { id: direct.complaint_id, complaint: direct };

      // 2. Pattern match CC-XXXXX
      const match = trimmed.match(/CC-[A-Za-z0-9]+/i);
      if (match) {
        const foundId = match[0].toUpperCase();
        const foundComp = allComplaints.find(
          (c) => c.complaint_id.toUpperCase() === foundId
        );
        return { id: foundId, complaint: foundComp || null };
      }

      // 3. Try parsing as URL
      try {
        const url = new URL(trimmed);
        const hashMatch = url.hash.match(/CC-[A-Za-z0-9]+/i);
        if (hashMatch) {
          const foundId = hashMatch[0].toUpperCase();
          const foundComp = allComplaints.find(
            (c) => c.complaint_id.toUpperCase() === foundId
          );
          return { id: foundId, complaint: foundComp || null };
        }
        const paramId = url.searchParams.get('id') || url.searchParams.get('cid');
        if (paramId) {
          const foundId = paramId.toUpperCase();
          const foundComp = allComplaints.find(
            (c) => c.complaint_id.toUpperCase() === foundId
          );
          return { id: foundId, complaint: foundComp || null };
        }
      } catch {
        // Not a URL
      }

      // 4. Try parsing as JSON
      try {
        const json = JSON.parse(trimmed);
        const candidate = json.id || json.complaint_id;
        if (candidate) {
          const foundId = String(candidate).toUpperCase();
          const foundComp = allComplaints.find(
            (c) => c.complaint_id.toUpperCase() === foundId
          );
          return { id: foundId, complaint: foundComp || null };
        }
      } catch {
        // Not JSON
      }

      return { id: null, complaint: null };
    },
    [allComplaints]
  );

  // Stop media stream tracks
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Handle successful detection
  const handleFoundCode = useCallback(
    (codeText: string) => {
      const { id, complaint } = extractComplaintId(codeText);
      if (id) {
        setIsScanning(false);
        playSuccessSound();

        if (complaint) {
          // Record to persistent Recent Scans
          CampusCareStorage.addRecentScan(complaint);
          setRecentScans(CampusCareStorage.getRecentScans());
          setDetectedComplaint(complaint);

          setTimeout(() => {
            stopCamera();
            onScanSuccess(complaint.complaint_id);
            onClose();
          }, 1100);
        } else {
          // If valid formatted ID but not found in seed
          stopCamera();
          onScanSuccess(id);
          onClose();
        }
      }
    },
    [extractComplaintId, onScanSuccess, onClose, stopCamera]
  );

  // Start video stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);
    setDetectedComplaint(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCamera(false);
      setCameraError('Camera access API is not available on this browser or connection.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      setHasCamera(true);

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
        setHasTorch(Boolean(capabilities?.torch));
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      setHasCamera(false);
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera permissions in your browser to scan QR tags.'
          : 'Unable to access camera. Another application might be using it, or permissions are blocked.';
      setCameraError(message);
    }
  }, [facingMode, stopCamera]);

  // Frame processing loop with jsQR
  useEffect(() => {
    if (!isOpen || !isScanning || showRecentDrawer) return;

    let mounted = true;

    const scanFrame = () => {
      if (!mounted || !isScanning || showRecentDrawer) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Use jsQR to decode image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (qrCode && qrCode.data) {
            handleFoundCode(qrCode.data);
            return;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      mounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, isScanning, showRecentDrawer, handleFoundCode]);

  // Start camera when modal opens, stop when closes
  useEffect(() => {
    if (isOpen && !showRecentDrawer) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, showRecentDrawer, startCamera, stopCamera]);

  // Toggle front/back camera
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle torch
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch toggle failed:', e);
      }
    }
  };

  // Upload an image file of a QR tag
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
        if (qrCode && qrCode.data) {
          handleFoundCode(qrCode.data);
        } else {
          setManualError('No valid QR code was detected in the uploaded image. Please try another photo or enter the ID below.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Manual code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const { id, complaint } = extractComplaintId(manualInput);
    if (id) {
      setManualError(null);
      if (complaint) {
        CampusCareStorage.addRecentScan(complaint);
        setRecentScans(CampusCareStorage.getRecentScans());
      }
      stopCamera();
      onScanSuccess(complaint ? complaint.complaint_id : id);
      onClose();
    } else {
      setManualError(`No matching complaint found for "${manualInput.trim()}". Check the ticket identifier and retry.`);
    }
  };

  // Quick Demo Tag selection
  const handleQuickDemoSelect = (complaintId: string) => {
    const complaint = allComplaints.find((c) => c.complaint_id === complaintId);
    if (complaint) {
      CampusCareStorage.addRecentScan(complaint);
      setRecentScans(CampusCareStorage.getRecentScans());
    }
    stopCamera();
    onScanSuccess(complaintId);
    onClose();
  };

  // Recent scans drawer handlers
  const handleSelectRecentScan = (complaintId: string) => {
    stopCamera();
    onScanSuccess(complaintId);
    onClose();
  };

  const handleRemoveRecentScan = (e: React.MouseEvent, complaintId: string) => {
    e.stopPropagation();
    CampusCareStorage.removeRecentScan(complaintId);
    setRecentScans(CampusCareStorage.getRecentScans());
  };

  const handleClearAllRecentScans = () => {
    CampusCareStorage.clearRecentScans();
    setRecentScans([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Scan Inspection Tag
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Live Scanner
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Point camera at equipment or room QR code to open complaint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Recent Scans Drawer Toggle Button */}
            <button
              onClick={() => setShowRecentDrawer(!showRecentDrawer)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                showRecentDrawer
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Toggle Recent Scans History Drawer"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Recent Scans</span>
              {recentScans.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    showRecentDrawer
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  {recentScans.length}
                </span>
              )}
            </button>

            {/* Modal Close */}
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder OR Recent Scans Drawer Viewport */}
        {showRecentDrawer ? (
          /* =================================================== */
          /* RECENT SCANS DRAWER PANEL                           */
          /* =================================================== */
          <div className="flex-1 flex flex-col min-h-[360px] max-h-[520px] bg-slate-50 dark:bg-slate-900/90 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Drawer Sub-Header */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRecentDrawer(false)}
                  className="p-1 -ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
                  title="Back to camera scanner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    Recent Inspection Scans
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {recentScans.length} {recentScans.length === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Quickly jump back to previously scanned grievances
                  </p>
                </div>
              </div>

              {recentScans.length > 0 && (
                <button
                  onClick={handleClearAllRecentScans}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline"
                  title="Clear all recent scans"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear All</span>
                </button>
              )}
            </div>

            {/* Drawer List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {recentScans.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="max-w-xs mx-auto space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      No Recent Scans Yet
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Physical inspection tags scanned with your camera will appear here for fast one-tap navigation.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRecentDrawer(false)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Camera Scanner
                  </button>
                </div>
              ) : (
                recentScans.map((item) => (
                  <div
                    key={item.complaint_id}
                    onClick={() => handleSelectRecentScan(item.complaint_id)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                            {item.complaint_id}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatScanTime(item.scanned_at)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </h4>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                          <span>{item.location}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.department}</span>
                        </div>

                        {/* Badges */}
                        <div className="pt-1 flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.priority === 'Critical'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : item.priority === 'High'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.priority}
                          </span>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'Resolved - Pending Approval'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : item.status === 'Resolved' || item.status === 'Closed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : item.status === 'In Progress'
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      {/* Right action & delete button */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          onClick={(e) => handleRemoveRecentScan(e, item.complaint_id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelectRecentScan(item.complaint_id)}
                          className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform"
                          title="Open grievance details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Bottom Bar */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Click any ticket to jump straight to its resolution timeline
              </span>
              <button
                onClick={() => setShowRecentDrawer(false)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Scan Tag
              </button>
            </div>
          </div>
        ) : (
          /* =================================================== */
          /* CAMERA VIEWFINDER & LIVE SCANNER                    */
          /* =================================================== */
          <>
            <div className="relative flex-1 bg-slate-950 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] overflow-hidden">
              {/* Live Video Element */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraError ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Hidden Canvas for Frame Processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Scanning Overlay & Laser */}
              {!cameraError && isScanning && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Outer Dimmer Mask */}
                  <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                    {/* 4 Corner Targeting Reticles */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl" />

                    {/* Animated Sweeping Laser Line */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] animate-[bounce_2s_infinite]" />

                    {/* Center Subtitle */}
                    <div className="absolute -bottom-8 inset-x-0 text-center">
                      <span className="text-[11px] font-mono text-white/80 bg-slate-950/70 px-3 py-1 rounded-full backdrop-blur-xs">
                        Align QR tag within frame
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Scanned Success Match Preview Card */}
              {detectedComplaint && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                  <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl max-w-sm w-full text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                        Inspection Tag Recognized
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                        {detectedComplaint.complaint_id}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                        {detectedComplaint.title}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {detectedComplaint.location} · {detectedComplaint.department}
                      </p>
                    </div>
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">
                        Opening Grievance Details <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera Error / No Camera Fallback State */}
              {cameraError && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900 text-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h3 className="text-sm font-bold">Camera Unavailable</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cameraError}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center">
                    <button
                      onClick={startCamera}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                    >
                      Retry Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                    >
                      Upload Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Camera Controls (Flip camera, Torch, Upload) */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                {hasTorch && (
                  <button
                    onClick={toggleTorch}
                    className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                      torchOn ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/70 text-white hover:bg-slate-900'
                    }`}
                    title="Toggle Flashlight / Torch"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={toggleCameraFacing}
                  className="p-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 transition-colors"
                  title="Flip Front / Rear Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-xl bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 transition-colors"
                  title="Upload QR Tag Image"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hidden File Input for Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Lower Controls & Direct Manual Lookup */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4">
              {manualError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {/* Direct Input Form */}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => {
                      setManualInput(e.target.value);
                      setManualError(null);
                    }}
                    placeholder="Or enter Ticket ID directly (e.g. CC-260930101)..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                >
                  Open Ticket
                </button>
              </form>

              {/* One-Click Quick Demo Tags */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Quick Test: Scan Demo Physical Tags</span>
                  <span className="text-[10px] text-slate-400">1-click test</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allComplaints.slice(0, 4).map((c) => (
                    <button
                      key={c.complaint_id}
                      onClick={() => handleQuickDemoSelect(c.complaint_id)}
                      className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors text-left"
                    >
                      {c.complaint_id} · <span className="font-sans text-[10px] text-slate-400">{c.department.slice(0, 10)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

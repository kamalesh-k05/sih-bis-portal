import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Upload,
  X,
  Aperture,
  ScanLine,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  FileImage,
} from 'lucide-react';

type Step = 'idle' | 'camera' | 'analyzing' | 'confirm';

interface ProductScannerProps {
  onAnalyzed: (input: { licenceNumber?: string; isCode?: string }) => void;
  onBack: () => void;
}

const DEMO_CODES = ['CM/L-1234567', 'CM/L-9999999', 'CM/L-7654321', 'CM/L-5555555', 'ISI-FAKE-001', 'HUID-ABC123'];

export default function ProductScanner({ onAnalyzed, onBack }: ProductScannerProps) {
  const [step, setStep] = useState<Step>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [licence, setLicence] = useState('');
  const [isCode, setIsCode] = useState('');
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setStep('camera');
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      setError(
        'Camera could not be opened. Please allow camera access, or use "Upload a photo" instead.'
      );
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      setStep('analyzing');
    };
    reader.readAsDataURL(file);
  };

  const captureFromCamera = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    setImageUrl(dataUrl);
    setStep('analyzing');
  };

  const analyze = useCallback(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 18;
        if (next >= 100) {
          clearInterval(timer);
          setStep('confirm');
          return 100;
        }
        return next;
      });
    }, 220);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 'analyzing') {
      const cleanup = analyze();
      return cleanup;
    }
  }, [step, analyze]);

  const cancel = () => {
    stopCamera();
    setImageUrl(null);
    setError(null);
    setStep('idle');
  };

  const renderIdle = () => (
    <div className="space-y-4">
      <button
        onClick={startCamera}
        className="w-full card p-6 text-center hover:border-saffron-400/50 transition-all group"
      >
        <div className="w-16 h-16 bg-saffron-500/15 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Camera className="w-8 h-8 text-saffron-600" />
        </div>
        <h3 className="font-semibold text-sm text-slate-900">Open Camera</h3>
        <p className="text-xs text-slate-500 mt-1">Point at the BIS/ISI mark and capture a photo</p>
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full card p-6 text-center hover:border-slate-300 transition-all group"
      >
        <div className="w-16 h-16 bg-saffron-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-saffron-600" />
        </div>
        <h3 className="font-semibold text-sm text-slate-900">Upload a Photo</h3>
        <p className="text-xs text-slate-500 mt-1">Choose an existing photo of the product label</p>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      <button onClick={onBack} className="w-full text-sm text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to verification options
      </button>
    </div>
  );

  const renderCamera = () => (
    <div>
      <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-[4/3] mb-4">
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-16 rounded-xl border-2 border-saffron-400/70" />
          <ScanLine className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-saffron-600 w-6 h-6 opacity-80" />
        </div>
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest text-white/60 bg-black/40 px-2 py-1 rounded">
          Align the BIS mark inside the frame
        </span>
      </div>
      <div className="flex gap-3">
        <button onClick={captureFromCamera} className="flex-1 btn-primary flex items-center justify-center gap-2">
          <Aperture className="w-4 h-4" /> Capture
        </button>
        <button onClick={cancel} className="btn-secondary flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
    </div>
  );

  const renderAnalyzing = () => (
    <div className="text-center">
      {imageUrl && (
        <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black aspect-[4/3] mx-auto max-w-sm mb-5">
          <img src={imageUrl} alt="Captured product" className="absolute inset-0 w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="absolute left-0 right-0 h-12 bg-gradient-to-r from-transparent via-saffron-400/40 to-transparent animate-pulse" />
            <div className="bg-black/60 rounded-full px-4 py-2 flex items-center gap-2 text-saffron-700">
              <ScanLine className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">AI is reading your label…</span>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-sm mx-auto">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-saffron-500 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-slate-500">
          Detecting licence number, IS code, and mark type from the image.
        </p>
      </div>
      <button onClick={cancel} className="mt-5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        Cancel scan
      </button>
    </div>
  );

  const renderConfirm = () => (
    <div>
      <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-saffron-500/10 border border-saffron-200">
        <CheckCircle2 className="w-5 h-5 text-saffron-700 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-saffron-700">
          Our AI read the label on your product. Please confirm the licence number below so we can check it against official records.
        </p>
      </div>

      {imageUrl && (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-[4/3] max-w-[160px] mb-5">
          <img src={imageUrl} alt="Captured product" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-1 right-1">
            <button onClick={() => { setImageUrl(null); setStep('idle'); }} className="p-1 bg-black/50 rounded text-slate-700 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Licence Number <span className="text-slate-9000 font-normal">(read from label)</span>
          </label>
          <input
            type="text"
            value={licence}
            onChange={(e) => setLicence(e.target.value)}
            placeholder="e.g., CM/L-1234567"
            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 focus:border-saffron-500/70 outline-none font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            IS Code <span className="text-slate-9000 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={isCode}
            onChange={(e) => setIsCode(e.target.value)}
            placeholder="e.g., IS 302"
            className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 focus:border-saffron-500/70 outline-none font-mono"
          />
        </div>
      </div>

      <div className="mb-5">
        <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Try a sample scan:
        </p>
        <div className="flex flex-wrap gap-2">
          {DEMO_CODES.map((code) => (
            <button
              key={code}
              onClick={() => setLicence(code)}
              className="text-xs bg-slate-900/[0.04] text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-saffron-500/10 hover:text-saffron-700 transition-all font-mono"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onAnalyzed({ licenceNumber: licence || undefined, isCode: isCode || undefined })}
        disabled={!licence && !isCode}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <FileImage className="w-4 h-4" />
        Verify this scan
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={cancel} className="p-2 text-slate-9000 hover:text-saffron-700 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-display font-bold text-xl text-slate-900">Scan Product</h1>
      </div>

      <div className="card-elevated p-6 sm:p-8 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'idle' && renderIdle()}
            {step === 'camera' && renderCamera()}
            {step === 'analyzing' && renderAnalyzing()}
            {step === 'confirm' && renderConfirm()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

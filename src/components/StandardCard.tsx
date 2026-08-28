import { CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, Info } from 'lucide-react';
import { useState } from 'react';
import type { IndianStandard } from '../data/standards';

interface StandardCardProps {
  standard: IndianStandard;
  matchReason: string;
  confidence: 'high' | 'medium' | 'low';
  showDetails?: boolean;
}

export default function StandardCard({ standard, matchReason, confidence, showDetails = true }: StandardCardProps) {
  const [expanded, setExpanded] = useState(false);

  const confidenceConfig = {
    high: { color: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: 'Strong Match', icon: CheckCircle2 },
    medium: { color: 'text-amber-300', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: 'Possible Match', icon: AlertTriangle },
    low: { color: 'text-slate-300', bg: 'bg-white/[0.04]', border: 'border-white/15', label: 'Needs Verification', icon: AlertCircle },
  };

  const certConfig = {
    mandatory: { color: 'text-red-300', bg: 'bg-red-400/10', label: 'Certification Required', desc: 'Mandatory BIS certification is required for this product.' },
    voluntary: { color: 'text-emerald-300', bg: 'bg-emerald-400/10', label: 'Certification Voluntary', desc: 'BIS certification is not mandatory but recommended.' },
    check_qco: { color: 'text-amber-300', bg: 'bg-amber-400/10', label: 'Check Applicable QCO', desc: 'Please verify the applicable Quality Control Order.' },
  };

  const conf = confidenceConfig[confidence];
  const cert = certConfig[standard.certificationRequired];
  const ConfIcon = conf.icon;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-bold text-saffron-400 bg-saffron-500/100/10 px-2.5 py-0.5 rounded-md">
                {standard.id}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${conf.bg} ${conf.color} ${conf.border} border`}>
                <ConfIcon className="w-3 h-3" />
                {conf.label}
              </span>
            </div>
            <h3 className="font-display font-bold text-base text-slate-50 mt-2">{standard.title}</h3>
          </div>
        </div>

        {/* Match reason */}
        <div className="bg-white/[0.04] rounded-xl px-4 py-3 mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-saffron-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-saffron-400 mb-0.5">Why does this apply?</p>
              <p className="text-sm text-slate-300">{matchReason}</p>
            </div>
          </div>
        </div>

        {/* Certification status */}
        <div className={`${cert.bg} rounded-xl px-4 py-3 mb-4`}>
          <p className={`text-sm font-semibold ${cert.color}`}>{cert.label}</p>
          <p className="text-xs text-slate-300 mt-1">{cert.desc}</p>
          {standard.qcoName && (
            <p className="text-xs text-slate-400 mt-1">QCO: {standard.qcoName}</p>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{standard.description}</p>

        {/* Expand details */}
        {showDetails && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-sm font-medium text-saffron-400 hover:text-slate-50 transition-colors"
          >
            {expanded ? 'Show less' : 'View details'}
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/10 p-5 sm:p-6 bg-white/[0.02]">
          {/* What it covers */}
          <div className="mb-5">
            <h4 className="font-semibold text-sm text-slate-50 mb-2">What does it cover?</h4>
            <ul className="space-y-1.5">
              {standard.whatItCovers.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Safety requirements */}
          <div className="mb-5">
            <h4 className="font-semibold text-sm text-slate-50 mb-2">Safety Requirements</h4>
            <p className="text-sm text-slate-300">{standard.safetyRequirements}</p>
          </div>

          {/* Certification scheme */}
          <div className="mb-5">
            <h4 className="font-semibold text-sm text-slate-50 mb-2">Certification Scheme</h4>
            <span className="badge-blue">{standard.certificationScheme}</span>
          </div>

          {/* Source */}
          <div className="bg-white/[0.04] rounded-lg px-4 py-3 border border-white/10">
            <p className="text-xs text-slate-400">
              <strong>Source:</strong> {standard.source} | Updated: {standard.lastUpdated}
            </p>
            {standard.officialLink && (
              <a
                href={standard.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-saffron-400 hover:underline mt-1 inline-block"
              >
                View on BIS Portal →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

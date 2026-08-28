import { Shield, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SourceEvidenceProps {
  source: string;
  sourceUrl?: string;
  evidenceText: string;
  confidence?: 'high' | 'medium' | 'low';
  lastUpdated?: string;
}

export default function SourceEvidence({ source, sourceUrl, evidenceText, confidence, lastUpdated }: SourceEvidenceProps) {
  const [expanded, setExpanded] = useState(false);

  const confidenceLabel = {
    high: { text: 'Based on official BIS source information.', color: 'text-emerald-300' },
    medium: { text: 'Based on available source information. Verify for final decisions.', color: 'text-amber-300' },
    low: { text: 'Limited source information available. Please verify with official sources.', color: 'text-slate-300' },
  };

  const conf = confidence ? confidenceLabel[confidence] : confidenceLabel.medium;

  return (
    <div className="bg-[#0d1424] border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-saffron-400" />
          <span className="text-sm font-medium text-slate-200">Why am I seeing this?</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <p className={`text-xs font-medium mt-3 mb-2 ${conf.color}`}>{conf.text}</p>
          <p className="text-sm text-slate-300 mb-3 leading-relaxed">{evidenceText}</p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              <strong>Source:</strong> {source}
              {lastUpdated && ` | Last updated: ${lastUpdated}`}
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-saffron-400 hover:underline inline-flex items-center gap-1"
              >
                View evidence <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

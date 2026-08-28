import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
  label?: string;
  description?: string;
  showDescription?: boolean;
}

export default function ConfidenceBadge({ level, label, description, showDescription = false }: ConfidenceBadgeProps) {
  const config = {
    high: {
      icon: CheckCircle2,
      color: 'text-emerald-300',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/30',
      defaultLabel: 'High confidence',
      defaultDesc: 'Multiple verified sources match your product description.',
    },
    medium: {
      icon: AlertTriangle,
      color: 'text-amber-300',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/30',
      defaultLabel: 'Moderate confidence',
      defaultDesc: 'We found some relevant standards, but additional details may improve accuracy.',
    },
    low: {
      icon: HelpCircle,
      color: 'text-slate-300',
      bg: 'bg-white/[0.04]',
      border: 'border-white/15',
      defaultLabel: 'We need more information',
      defaultDesc: 'Tell us the product material, intended use, or model number.',
    },
  };

  const c = config[level];
  const Icon = c.icon;

  return (
    <div className={`${c.bg} border ${c.border} rounded-xl px-4 py-3`}>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${c.color}`} />
        <span className={`text-sm font-semibold ${c.color}`}>{label || c.defaultLabel}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-slate-300 mt-1 ml-6">{description || c.defaultDesc}</p>
      )}
    </div>
  );
}

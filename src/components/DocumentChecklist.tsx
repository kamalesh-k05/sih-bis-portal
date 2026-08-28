import { CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface DocumentItem {
  id: string;
  name: string;
  description: string;
}

interface DocumentChecklistProps {
  documents: DocumentItem[];
}

export default function DocumentChecklist({ documents }: DocumentChecklistProps) {
  const { checklist, toggleChecklistItem } = useAppStore();
  
  const completed = documents.filter(d => checklist[d.id]).length;
  const total = documents.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card-elevated p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-base text-slate-50">Documents You May Need</h3>
        <span className="text-sm font-medium text-saffron-400">{completed}/{total} completed</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-2 mb-5">
        <div
          className="bg-saffron-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="space-y-2">
        {documents.map((doc) => {
          const isChecked = checklist[doc.id] || false;
          return (
            <button
              key={doc.id}
              onClick={() => toggleChecklistItem(doc.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                isChecked
                  ? 'bg-emerald-400/10 border border-emerald-400/30'
                  : 'bg-white/[0.04] border border-white/10 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isChecked ? 'text-emerald-300 line-through opacity-70' : 'text-slate-50'}`}>
                  {doc.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{doc.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

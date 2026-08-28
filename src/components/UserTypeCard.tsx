import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserTypeCardProps {
  type: 'business' | 'consumer';
  title: string;
  description: string;
  buttonText: string;
  icon: string;
}

export default function UserTypeCard({ type, title, description, buttonText, icon }: UserTypeCardProps) {
  const isBusiness = type === 'business';
  
  return (
    <Link
      to={isBusiness ? '/business' : '/consumer'}
      className={`group card p-6 sm:p-8 flex flex-col items-start gap-4 cursor-pointer 
        hover:shadow-lg transition-all duration-300 border-2 
        ${isBusiness ? 'hover:border-saffron-500/60 hover:bg-saffron-400/10' : 'hover:border-saffron-400/60 hover:bg-saffron-500/100/15'}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl
        ${isBusiness ? 'bg-saffron-500/100/15' : 'bg-saffron-400/20'}`}>
        {icon}
      </div>
      
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg text-slate-50 mb-2">{title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      
      <div className={`flex items-center gap-2 font-semibold text-sm 
        ${isBusiness ? 'text-saffron-400' : 'text-saffron-400'}
        group-hover:gap-3 transition-all duration-300`}>
        {buttonText}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

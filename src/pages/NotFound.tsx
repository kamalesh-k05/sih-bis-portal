import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, House } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-saffron-500/100/10 mb-6">
          <ShieldAlert className="w-8 h-8 text-saffron-400" />
        </div>
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-saffron-400 mb-3">404 · Not found</p>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-50 mb-4">This page isn't on our register.</h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          You may have followed a broken link, or the page may have been withdrawn like an outdated standard.
          Standards lead somewhere definite, so let's get you back to one that exists.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <House className="w-4 h-4" /> Back Home
          </Link>
          <Link
            to="/standards"
            className="btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Browse Standards
          </Link>
        </div>
      </div>
    </div>
  );
}

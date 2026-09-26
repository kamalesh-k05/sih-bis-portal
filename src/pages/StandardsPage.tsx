import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Radio, ExternalLink, FileImage, Table2, Loader2 } from 'lucide-react';
import { INDIAN_STANDARDS, type IndianStandard } from '../data/standards';
import { fetchLiveStandard, getOfficialLinks, type LiveResult } from '../utils/bisLive';
import { searchDocuments } from '../utils/documentSearch';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import Seo, { SITE_URL } from '../components/Seo';

const categories = [...new Set(INDIAN_STANDARDS.map(s => s.category))].sort();

export default function StandardsPage() {
  const { language } = useAppStore();
  const t = translations[language] || translations['en'];
  const [tab, setTab] = useState<'standards' | 'docs'>('standards');
  const [search, setSearch] = useState('');
  const [docQuery, setDocQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCertStatus, setSelectedCertStatus] = useState<string>('');
  const [liveMap, setLiveMap] = useState<Record<string, LiveResult>>({});
  const [liveLoading, setLiveLoading] = useState<Record<string, boolean>>({});

  const checkLive = async (std: IndianStandard) => {
    setLiveLoading(p => ({ ...p, [std.id]: true }));
    const r = await fetchLiveStandard(std);
    setLiveMap(p => ({ ...p, [std.id]: r }));
    setLiveLoading(p => ({ ...p, [std.id]: false }));
  };

  const docResults = docQuery.trim() ? searchDocuments(docQuery, 12) : [];

  const filtered = INDIAN_STANDARDS.filter(std => {
    const matchesSearch = !search || 
      std.id.toLowerCase().includes(search.toLowerCase()) ||
      std.title.toLowerCase().includes(search.toLowerCase()) ||
      std.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || std.category === selectedCategory;
    const matchesCert = !selectedCertStatus || std.certificationRequired === selectedCertStatus;
    return matchesSearch && matchesCategory && matchesCert;
  });

  return (
    <div className="min-h-screen">
      <Seo
        title="Indian Standards Database | BIS Smart Portal"
        description="Browse and search the Indian Standards (IS codes) database — categories, product coverage, and certification requirements in one place."
        path="/standards"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Indian Standards Database',
            url: `${SITE_URL}/standards`,
            description:
              'Browse and search all indexed Indian Standards (IS codes) by product, category, and certification status.',
            inLanguage: 'en',
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'Standards', item: `${SITE_URL}/standards` },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Standards', item: `${SITE_URL}/standards` },
            ],
          },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link to="/" className="hover:text-saffron-300">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-saffron-400 font-medium">Standards</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-50 mb-2">Indian Standards Database</h1>
          <p className="text-slate-300">Browse and search all indexed Indian Standards. Data is cached for offline use — every card links straight to the <span className="text-saffron-300 font-medium">ORIGINAL BIS site</span> for verification.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setTab('standards')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'standards' ? 'bg-saffron-500 text-black' : 'bg-white/10 text-slate-200 hover:bg-white/15'}`}>Standards</button>
            <button onClick={() => setTab('docs')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'docs' ? 'bg-saffron-500 text-black' : 'bg-white/10 text-slate-200 hover:bg-white/15'}`}>Diagrams & Tables in official docs</button>
          </div>
        </div>

        {tab === 'docs' && (
          <div className="card-elevated p-4 sm:p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={docQuery} onChange={(e) => setDocQuery(e.target.value)}
                placeholder='Try: "show diagram for IS 694" or "resistance table"'
                className="w-full pl-10 pr-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none" />
            </div>
            <p className="text-xs text-slate-400 mt-3">Searches figures & tables inside official BIS documents — each result cites page + original PDF.</p>
            {docQuery.trim() !== '' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {docResults.map(({ fig, reason }) => (
                  <div key={fig.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold text-saffron-400 bg-saffron-500/10 px-2 py-0.5 rounded">{fig.isCode}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${fig.kind === 'diagram' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                        {fig.kind === 'diagram' ? <FileImage className="w-3 h-3" /> : <Table2 className="w-3 h-3" />}{fig.kind} · p.{fig.page}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-slate-50">{fig.title}</h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{fig.caption}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Why: {reason}</p>
                    <a href={fig.pdfUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-saffron-300 hover:text-saffron-200">
                      Open original BIS document <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
                {docResults.length === 0 && <p className="text-slate-400 text-sm">No figure/table matched. Try an IS code like IS 694, IS 302, or a word like diagram/table/clearance.</p>}
              </div>
            )}
          </div>
        )}

        {/* Search & Filters */}
        {tab === 'standards' && (
        <div className="card-elevated p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by IS code, title, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none bg-[#0d1424] text-slate-200"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedCertStatus}
              onChange={(e) => setSelectedCertStatus(e.target.value)}
              className="px-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none bg-[#0d1424] text-slate-200"
            >
              <option value="">All Status</option>
              <option value="mandatory">Mandatory</option>
              <option value="voluntary">Voluntary</option>
              <option value="check_qco">Check QCO</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-3">{filtered.length} standard{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        )}

        {/* Results */}
        {tab === 'standards' && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((std) => {
            const live = liveMap[std.id];
            const loading = liveLoading[std.id];
            const links = getOfficialLinks(std);
            return (
            <div key={std.id + std.title} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs font-bold text-saffron-400 bg-saffron-500/100/10 px-2 py-0.5 rounded">{std.id}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  std.certificationRequired === 'mandatory' ? 'bg-red-400/10 text-red-300' :
                  std.certificationRequired === 'voluntary' ? 'bg-emerald-400/10 text-emerald-300' :
                  'bg-amber-400/10 text-amber-300'
                }`}>
                  {std.certificationRequired === 'mandatory' ? 'Mandatory' :
                   std.certificationRequired === 'voluntary' ? 'Voluntary' : 'Check QCO'}
                </span>
              </div>
              <Link to={`/business`}>
                <h3 className="font-semibold text-sm text-slate-50 group-hover:text-saffron-300 transition-colors mb-1">{std.title}</h3>
              </Link>
              <p className="text-xs text-slate-400 mb-3">{std.category} • {std.subcategory}</p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{std.description}</p>
              <button onClick={() => checkLive(std)} disabled={loading}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-saffron-300 hover:text-saffron-200 disabled:opacity-50">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Radio className="w-3.5 h-3.5" />}
                {loading ? 'Checking ORIGINAL BIS site…' : live ? (live.live ? 'Live ✓ services.bis.gov.in' : 'Cached + official links') : 'Check live on ORIGINAL BIS site'}
              </button>
              {live && (
                <div className="mt-2 rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[11px] text-slate-300 leading-relaxed">{live.message}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Source: {live.source}</p>
                  <div className="mt-2 flex flex-col gap-1">
                    {live.officialLinks.map(l => (
                      <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-saffron-300 hover:text-saffron-200">
                        {l.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!live && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {links.slice(0, 2).map(l => (
                    <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-saffron-300">
                      {l.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1 mt-3">
                {std.productExamples.slice(0, 3).map((ex, i) => (
                  <span key={i} className="text-[10px] bg-white/[0.04] text-slate-400 px-2 py-0.5 rounded-full">{ex}</span>
                ))}
                {std.productExamples.length > 3 && (
                  <span className="text-[10px] text-slate-400">+{std.productExamples.length - 3}</span>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No standards found matching your search.</p>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}

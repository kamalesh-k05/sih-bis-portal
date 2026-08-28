import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Search, Mic, Image, CheckCircle2, Clock, FileText, Award, Building2, Shield, Loader2, ExternalLink, ChevronRight, BookOpen } from 'lucide-react';
import StandardCard from '../components/StandardCard';
import DocumentChecklist from '../components/DocumentChecklist';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SourceEvidence from '../components/SourceEvidence';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { INDIAN_STANDARDS, type IndianStandard } from '../data/standards';
import { searchStandards, type SearchResult } from '../utils/searchEngine';
import { validateResponse, getConfidenceLevel, buildSafetyDisclaimer } from '../utils/antiHallucination';
import { generateProductStandardsResponse } from '../utils/responseGenerator';

const productExamples = [
  'I manufacture electric fans',
  'I make cement blocks',
  'I sell children\'s toys',
  'I manufacture pressure cookers',
  'I make LED lights',
  'I manufacture stainless steel water bottles',
  'I sell gas stoves',
  'I make packaged drinking water',
];

const roadmapSteps = [
  { icon: Search, title: 'Identify applicable standard', desc: 'Find the right Indian Standard for your product', complexity: 'Easy' },
  { icon: BookOpen, title: 'Understand requirements', desc: 'Learn what the standard requires for your product', complexity: 'Easy' },
  { icon: FileText, title: 'Product testing', desc: 'Get your product tested at a BIS-recognized lab', complexity: 'Medium' },
  { icon: FileText, title: 'Prepare documents', desc: 'Gather all required documentation', complexity: 'Medium' },
  { icon: Building2, title: 'Apply through BIS', desc: 'Submit your application through the official BIS portal', complexity: 'Medium' },
  { icon: Shield, title: 'Inspection / assessment', desc: 'BIS may inspect your manufacturing facility', complexity: 'Hard' },
  { icon: Award, title: 'Certification', desc: 'Receive your BIS certification', complexity: 'Done' },
];

export default function BusinessJourney() {
  const navigate = useNavigate();
  const { language, setUserType } = useAppStore();
  const t = translations[language] || translations['en'];
  
  const [step, setStep] = useState(0); // 0: input, 1: loading, 2: results, 3: standard detail, 4: roadmap, 5: checklist
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<IndianStandard | null>(null);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    setUserType('business');
  }, [setUserType]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setStep(1);
    setUserType('business');
    
    // Simulate progressive loading
    setLoadingText(t.understandingProduct);
    await new Promise(r => setTimeout(r, 800));
    setLoadingText(t.identifyingStandards);
    await new Promise(r => setTimeout(r, 600));
    setLoadingText(t.checkingCertification);
    await new Promise(r => setTimeout(r, 500));
    
    const searchResults = searchStandards(query, INDIAN_STANDARDS, 8);
    setResults(searchResults);
    setStep(2);
  };

  const handleViewStandard = (std: IndianStandard) => {
    setSelectedStandard(std);
    setStep(3);
  };

  const getDocChecklist = () => {
    if (!selectedStandard) return [];
    return selectedStandard.documentsNeeded.map((doc, i) => ({
      id: `${selectedStandard.id}-doc-${i}`,
      name: doc,
      description: `Required for ${selectedStandard.id} certification process`,
    }));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-saffron-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-saffron-300 font-medium">For Businesses</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 0: Product Input */}
          {step === 0 && (
            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-saffron-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏭</span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">{t.tellUsProduct}</h1>
                <p className="text-slate-300 max-w-lg mx-auto">
                  Describe your product in simple words. We'll find the applicable Indian Standards and certification requirements.
                </p>
              </div>

              <div className="card-elevated p-6 sm:p-8 max-w-2xl mx-auto">
                <label className="block text-sm font-semibold text-slate-200 mb-3">
                  What do you make or sell?
                </label>
                <div className="relative mb-4">
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.productPlaceholder}
                    className="w-full px-4 py-3 border-2 border-white/15 bg-[#0d1424] text-slate-200 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none resize-none transition-colors"
                    rows={3}
                  />
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button className="p-2 text-slate-300 hover:text-saffron-300 transition-colors" title="Voice input">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-saffron-300 transition-colors" title="Upload image">
                      <Image className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  disabled={!query.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  {t.findRequirements}
                </button>

                {/* Quick examples */}
                <div className="mt-5">
                  <p className="text-xs font-medium text-slate-400 mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {productExamples.slice(0, 4).map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setQuery(ex)}
                        className="text-xs bg-white/10 text-slate-300 px-3 py-1.5 rounded-full border border-white/15 hover:bg-saffron-500/10 hover:text-saffron-300 hover:border-white/25 transition-all"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Loading */}
          {step === 1 && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <div className="w-16 h-16 bg-saffron-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-saffron-300 animate-spin" />
              </div>
              <p className="text-lg font-medium text-white mb-2">{loadingText}</p>
              <p className="text-sm text-slate-400">Analyzing your product description...</p>
            </motion.div>
          )}

          {/* Step 2: Results */}
          {step === 2 && (
            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(0)} className="p-2 text-slate-300 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-white">{t.foundStandards}</h1>
                  <p className="text-sm text-slate-400">Based on your product description</p>
                </div>
              </div>

              {/* Product summary */}
              <div className="card-elevated p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 mb-1">{t.yourProduct}</p>
                  <p className="font-semibold text-white">{query}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 mb-1">{t.productCategory}</p>
                  <p className="font-semibold text-white">{results[0]?.standard.category || 'Analyzing...'}</p>
                </div>
                <ConfidenceBadge
                  level={results.length >= 3 ? 'high' : results.length >= 1 ? 'medium' : 'low'}
                  showDescription
                />
              </div>

              {/* Standards results */}
              <h2 className="font-display font-bold text-lg text-white mb-4">{t.recommendedStandards}</h2>
              
              {results.length === 0 ? (
                <div className="card-elevated p-8 text-center">
                  <p className="text-slate-300 mb-4">No specific standards found for your query. Try describing your product with more details.</p>
                  <button onClick={() => setStep(0)} className="btn-primary">Try Again</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, i) => (
                    <motion.div
                      key={result.standard.id + '-' + i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                    >
                      <StandardCard
                        standard={result.standard}
                        matchReason={result.matchReason}
                        confidence={result.confidence}
                        showDetails={false}
                      />
                      <button
                        onClick={() => handleViewStandard(result.standard)}
                        className="mt-2 text-sm font-medium text-saffron-300 hover:text-saffron-300 flex items-center gap-1 ml-2"
                      >
                        View full details <ArrowRight className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-8">
                <button onClick={() => setStep(4)} className="btn-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Certification Roadmap
                </button>
                <button onClick={() => { setStep(5); setSelectedStandard(results[0]?.standard || null); }} className="btn-secondary flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Document Checklist
                </button>
                <Link to="/" className="btn-secondary flex items-center gap-2">
                  Back to Home
                </Link>
              </div>

              {/* Safety disclaimer */}
              <div className="mt-6 bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-200 leading-relaxed">{buildSafetyDisclaimer()}</p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Standard Detail */}
          {step === 3 && selectedStandard && (
            <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(2)} className="p-2 text-slate-300 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-200 bg-saffron-500/10 px-2.5 py-0.5 rounded-md">{selectedStandard.id}</span>
                    <span className="badge-blue">{selectedStandard.certificationScheme}</span>
                  </div>
                  <h1 className="font-display font-bold text-xl sm:text-2xl text-white mt-1">{selectedStandard.title}</h1>
                </div>
              </div>

              <div className="space-y-6">
                {/* What is this? */}
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">What is this?</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedStandard.description}</p>
                </div>

                {/* What does it cover? */}
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">What does it cover?</h2>
                  <ul className="space-y-2">
                    {selectedStandard.whatItCovers.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Certification */}
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">Certification</h2>
                  <div className={`rounded-xl px-4 py-3 mb-3 ${
                    selectedStandard.certificationRequired === 'mandatory' ? 'bg-red-400/10' :
                    selectedStandard.certificationRequired === 'voluntary' ? 'bg-emerald-400/10' : 'bg-amber-400/10'
                  }`}>
                    <p className={`text-sm font-semibold ${
                      selectedStandard.certificationRequired === 'mandatory' ? 'text-red-300' :
                      selectedStandard.certificationRequired === 'voluntary' ? 'text-emerald-300' : 'text-amber-300'
                    }`}>
                      {selectedStandard.certificationRequired === 'mandatory' ? '🔴 Certification Required' :
                       selectedStandard.certificationRequired === 'voluntary' ? '🟢 Certification Voluntary' : '🟡 Check Applicable Requirements'}
                    </p>
                  </div>
                  {selectedStandard.qcoName && (
                    <div className="text-sm text-slate-300 space-y-1">
                      <p><strong>QCO:</strong> {selectedStandard.qcoName}</p>
                      {selectedStandard.qcoEffectiveDate && <p><strong>Effective Date:</strong> {selectedStandard.qcoEffectiveDate}</p>}
                    </div>
                  )}
                </div>

                {/* Why recommending */}
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-lg text-white mb-3">Why are we recommending this?</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{selectedStandard.applicabilityReason}</p>
                </div>

                {/* Source evidence */}
                <SourceEvidence
                  source={selectedStandard.source}
                  sourceUrl={selectedStandard.sourceUrl}
                  evidenceText={selectedStandard.evidenceText}
                  confidence="high"
                  lastUpdated={selectedStandard.lastUpdated}
                />

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setStep(4)} className="btn-primary flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    See Certification Steps
                  </button>
                  <button onClick={() => { setStep(5); }} className="btn-secondary flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Document Checklist
                  </button>
                  {selectedStandard.officialLink && (
                    <a href={selectedStandard.officialLink} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Official BIS Portal
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Certification Roadmap */}
          {step === 4 && (
            <motion.div key="roadmap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(selectedStandard ? 3 : 2)} className="p-2 text-slate-300 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-white">{t.certificationJourney}</h1>
              </div>

              <div className="card-elevated p-6 sm:p-8">
                <div className="space-y-0">
                  {roadmapSteps.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.complexity === 'Done' ? 'bg-emerald-400/10 text-emerald-300' :
                          item.complexity === 'Easy' ? 'bg-saffron-500/15 text-saffron-300' :
                          item.complexity === 'Medium' ? 'bg-amber-400/10 text-amber-300' :
                          'bg-red-400/10 text-red-300'
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        {i < roadmapSteps.length - 1 && (
                          <div className="w-0.5 h-12 bg-white/10 my-1" />
                        )}
                      </div>
                      <div className="pb-8">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-white">Step {i + 1}: {item.title}</h3>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            item.complexity === 'Done' ? 'bg-emerald-400/10 text-emerald-300' :
                            item.complexity === 'Easy' ? 'bg-saffron-500/15 text-saffron-300' :
                            item.complexity === 'Medium' ? 'bg-amber-400/10 text-amber-300' :
                            'bg-red-400/10 text-red-300'
                          }`}>
                            {item.complexity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <a href="https://bis.gov.in" target="_blank" rel="noopener noreferrer" className="btn-primary flex items-center gap-2">
                  Continue on Official BIS Portal
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          )}

          {/* Step 5: Document Checklist */}
          {step === 5 && (
            <motion.div key="checklist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(selectedStandard ? 3 : 2)} className="p-2 text-slate-300 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Document Checklist</h1>
              </div>

              <DocumentChecklist documents={getDocChecklist()} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

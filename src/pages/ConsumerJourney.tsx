import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Keyboard, HelpCircle, ArrowLeft, Search, CheckCircle2, AlertTriangle, AlertCircle, ChevronRight, Shield, Info, ExternalLink } from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';
import ProductScanner from '../components/ProductScanner';
import { useAppStore } from '../store/appStore';
import { translations } from '../data/translations';
import { verifyProduct, getMarkExplanation } from '../utils/verificationEngine';
import { BIS_EDUCATIONAL_CONTENT } from '../data/standards';
import Seo, { SITE_URL, SITE_NAME } from '../components/Seo';

export default function ConsumerJourney() {
  const { language, setUserType } = useAppStore();
  const t = translations[language] || translations['en'];
  
  const [mode, setMode] = useState<'select' | 'scan' | 'manual' | 'explain' | 'result'>('select');
  const [licenceNumber, setLicenceNumber] = useState('');
  const [isCode, setIsCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<string | null>(null);

  useEffect(() => {
    setUserType('consumer');
  }, [setUserType]);

  const handleVerify = () => {
    const result = verifyProduct({
      licenceNumber: licenceNumber || undefined,
      isCode: isCode || undefined,
    });
    setVerificationResult(result);
    setMode('result');
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
    verified: { icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', label: t.appearsConsistent },
    warning: { icon: AlertTriangle, color: 'text-amber-300', bg: 'bg-amber-400/10', border: 'border-amber-400/30', label: t.needsVerification },
    error: { icon: AlertCircle, color: 'text-red-300', bg: 'bg-red-400/10', border: 'border-red-400/30', label: t.potentialIssue },
    not_found: { icon: Search, color: 'text-slate-300', bg: 'bg-white/[0.04]', border: 'border-white/15', label: 'No match found' },
  };

  return (
    <div className="min-h-screen">
      <Seo
        title="For Consumers — Verify BIS Products | BIS Smart Portal"
        description="Check whether a product is genuine, understand BIS marks, and learn how to verify product certification — built for consumers."
        path="/consumer"
        schema={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'For Consumers — Verify BIS Products',
            url: `${SITE_URL}/consumer`,
            description:
              'Check whether a product is genuine, understand BIS marks, and learn how to verify product certification.',
            inLanguage: 'en',
            isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'For Consumers', item: `${SITE_URL}/consumer` },
              ],
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'For Consumers', item: `${SITE_URL}/consumer` },
            ],
          },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to="/" className="hover:text-saffron-300">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-saffron-400 font-medium">For Consumers</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Mode Select */}
          {mode === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indian-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛒</span>
                </div>
                <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-50 mb-3">{t.isProductGenuine}</h1>
                <p className="text-slate-300 max-w-lg mx-auto">{t.verifySubtitle}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setMode('scan')}
                  className="card p-6 text-center hover:shadow-lg hover:border-saffron-400/50 transition-all group"
                >
                  <div className="w-14 h-14 bg-saffron-500/100/15 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7 text-saffron-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-50 mb-1">{t.scanProduct}</h3>
                  <p className="text-xs text-slate-400">Scan the BIS mark with your camera or a photo</p>
                </button>

                <button
                  onClick={() => setMode('manual')}
                  className="card p-6 text-center hover:shadow-lg hover:border-white/30 transition-all group"
                >
                  <div className="w-14 h-14 bg-saffron-500/100/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <Keyboard className="w-7 h-7 text-saffron-400" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-50 mb-1">{t.enterDetails}</h3>
                  <p className="text-xs text-slate-400">Type the licence or IS number</p>
                </button>

                <button
                  onClick={() => setMode('explain')}
                  className="card p-6 text-center hover:shadow-lg hover:border-amber-400/30 transition-all group"
                >
                  <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-7 h-7 text-amber-300" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-50 mb-1">{t.dontKnowWhatToCheck}</h3>
                  <p className="text-xs text-slate-400">Learn what BIS marks mean</p>
                </button>
              </div>

              {/* Try examples */}
              <div className="card-elevated p-5 max-w-2xl mx-auto mt-6">
                <p className="text-xs font-medium text-slate-400 mb-3">Try a demo verification:</p>
                <div className="flex flex-wrap gap-2">
                  {['CM/L-1234567', 'CM/L-9999999', 'ISI-FAKE-001', 'HUID-ABC123'].map((num) => (
                    <button
                      key={num}
                      onClick={() => { setLicenceNumber(num); setMode('manual'); }}
                      className="text-xs bg-white/[0.04] text-slate-300 px-3 py-1.5 rounded-full border border-white/15 hover:bg-saffron-400/10 hover:text-saffron-300 hover:border-white/30 transition-all font-mono"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Scan mode */}
          {mode === 'scan' && (
            <ProductScanner
              onAnalyzed={(input) => {
                setLicenceNumber(input.licenceNumber || '');
                setIsCode(input.isCode || '');
                setVerificationResult(verifyProduct(input));
                setMode('result');
              }}
              onBack={() => setMode('select')}
            />
          )}

          {/* Manual entry */}
          {mode === 'manual' && (
            <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('select')} className="p-2 text-slate-400 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-xl text-slate-50">{t.enterDetails}</h1>
              </div>

              <div className="card-elevated p-6 sm:p-8 max-w-lg mx-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                      Licence Number <span className="text-slate-400 font-normal">(if available)</span>
                    </label>
                    <input
                      type="text"
                      value={licenceNumber}
                      onChange={(e) => setLicenceNumber(e.target.value)}
                      placeholder="e.g., CM/L-1234567"
                      className="w-full px-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                      IS Code <span className="text-slate-400 font-normal">(if visible on product)</span>
                    </label>
                    <input
                      type="text"
                      value={isCode}
                      onChange={(e) => setIsCode(e.target.value)}
                      placeholder="e.g., IS 302"
                      className="w-full px-4 py-2.5 border-2 border-white/15 rounded-xl text-sm focus:border-saffron-500/70 focus:ring-0 outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={!licenceNumber && !isCode}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  Verify Product
                </button>

                <div className="mt-4 bg-saffron-500/100/15 rounded-xl px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-saffron-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-saffron-400">
                      <strong>Tip:</strong> The licence number is usually printed near the BIS/ISI mark on the product or packaging.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Explanation mode */}
          {mode === 'explain' && (
            <motion.div key="explain" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setMode('select')} className="p-2 text-slate-400 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-xl text-slate-50">Understanding BIS Marks</h1>
              </div>

              {selectedExplanation ? (
                <div>
                  <button onClick={() => setSelectedExplanation(null)} className="text-sm text-saffron-400 hover:underline mb-4 flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Back to all marks
                  </button>
                  {BIS_EDUCATIONAL_CONTENT.filter(c => c.id === selectedExplanation).map(item => (
                    <div key={item.id} className="card-elevated p-6 sm:p-8">
                      <div className="w-14 h-14 mb-4 bg-saffron-500/100/10 rounded-2xl flex items-center justify-center">
                        <item.icon className="w-7 h-7 text-saffron-400" />
                      </div>
                      <h2 className="font-display font-bold text-xl text-slate-50 mb-2">{item.title}</h2>
                      <p className="text-slate-300 leading-relaxed mb-6">{item.detailed}</p>
                      
                      <h3 className="font-semibold text-sm text-slate-50 mb-2">Examples:</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.examples.map((ex, i) => (
                          <span key={i} className="text-xs bg-white/[0.04] text-slate-300 px-3 py-1 rounded-full">{ex}</span>
                        ))}
                      </div>
                      
                      <div className="bg-saffron-500/100/10 rounded-xl px-4 py-3">
                        <p className="text-sm text-slate-200"><strong>Where to find:</strong> {item.whereToFind}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BIS_EDUCATIONAL_CONTENT.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedExplanation(item.id)}
                      className="card p-5 text-left hover:shadow-md transition-all group"
                    >
                      <div className="w-11 h-11 mb-2 bg-saffron-500/100/10 rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-saffron-400" />
                      </div>
                      <h3 className="font-display font-bold text-base text-slate-50 group-hover:text-saffron-300 transition-colors">{item.title}</h3>
                      <p className="text-sm text-slate-300 mt-1">{item.summary}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-saffron-400 mt-3">
                        Learn more <ChevronRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Verification Result */}
          {mode === 'result' && verificationResult && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => { setMode('select'); setVerificationResult(null); setLicenceNumber(''); setIsCode(''); }} className="p-2 text-slate-400 hover:text-saffron-300 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-display font-bold text-xl text-slate-50">Product Check</h1>
              </div>

              <div className="max-w-lg mx-auto">
                {/* Status banner */}
                <div className={`${statusConfig[verificationResult.status].bg} border ${statusConfig[verificationResult.status].border} rounded-2xl p-6 mb-6 text-center`}>
                  {(() => {
                    const StatusIcon = statusConfig[verificationResult.status].icon;
                    return <StatusIcon className={`w-12 h-12 mx-auto mb-3 ${statusConfig[verificationResult.status].color}`} />;
                  })()}
                  <h2 className={`font-display font-bold text-lg ${statusConfig[verificationResult.status].color}`}>
                    {statusConfig[verificationResult.status].label}
                  </h2>
                  <p className="text-sm text-slate-300 mt-2">{verificationResult.message}</p>
                </div>

                {/* BIS Information */}
                {verificationResult.record && (
                  <div className="card-elevated p-6 mb-6">
                    <h3 className="font-display font-bold text-base text-slate-50 mb-4">{t.bisInformationFound}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-sm text-slate-400">{t.licenceNumber}</span>
                        <span className="text-sm font-mono font-medium text-slate-50">{verificationResult.record.licenceNumber}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-sm text-slate-400">{t.standard}</span>
                        <span className="text-sm font-mono font-medium text-slate-50">{verificationResult.record.isCode}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-sm text-slate-400">Product</span>
                        <span className="text-sm font-medium text-slate-50">{verificationResult.record.productDetails}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-sm text-slate-400">Manufacturer</span>
                        <span className="text-sm font-medium text-slate-50">{verificationResult.record.manufacturer}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-sm text-slate-400">Mark Type</span>
                        <span className="badge-blue">{verificationResult.record.markType}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-400">Status</span>
                        <span className={`text-sm font-medium ${
                          verificationResult.record.status === 'active' ? 'text-emerald-300' :
                          verificationResult.record.status === 'expired' ? 'text-amber-300' : 'text-red-300'
                        }`}>
                          {verificationResult.record.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Flags */}
                    {verificationResult.record.flags.length > 0 && (
                      <div className="mt-4 bg-red-400/10 rounded-xl px-4 py-3">
                        {verificationResult.record.flags.map((flag: string, i: number) => (
                          <p key={i} className="text-xs text-red-300 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            {flag}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mark explanation */}
                {verificationResult.record && (
                  <div className="card-elevated p-5 mb-6">
                    <h3 className="font-semibold text-sm text-slate-50 mb-2">What does this mark mean?</h3>
                    {(() => {
                      const markInfo = getMarkExplanation(verificationResult.record.markType);
                      return (
                        <div>
                          <p className="text-sm text-slate-300">{markInfo.description}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Prototype notice */}
                <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3 mb-6">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-amber-300 mb-1">Prototype verification</p>
                      <p className="text-xs text-amber-300">{t.prototypeNotice}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => { setMode('select'); setVerificationResult(null); setLicenceNumber(''); setIsCode(''); }} className="btn-primary">
                    Check Another Product
                  </button>
                  <a href="https://bis.gov.in" target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Official BIS Portal
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

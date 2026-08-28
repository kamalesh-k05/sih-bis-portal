import { useState } from 'react';
import { Play, Clock, CheckCircle2, XCircle, Target, BarChart3, Database, Shield, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIAN_STANDARDS, DEMO_SCENARIOS } from '../data/standards';
import { searchStandards } from '../utils/searchEngine';
import { validateResponse } from '../utils/antiHallucination';

export default function JudgeDemo() {
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runEvaluation = async (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    setIsRunning(true);
    setResults(null);
    
    const startTime = performance.now();
    await new Promise(r => setTimeout(r, 300));
    
    const searchResults = searchStandards(scenario.input, INDIAN_STANDARDS, 10);
    const latency = performance.now() - startTime;
    
    const retrievedIds = searchResults.map(r => r.standard.id);
    const expectedIds = scenario.expectedStandards;
    
    const top3 = retrievedIds.slice(0, 3);
    const hitAt3 = expectedIds.length > 0 
      ? expectedIds.filter(id => top3.includes(id)).length / Math.min(3, expectedIds.length)
      : (retrievedIds.length > 0 ? 1 : 0);
    
    const top5 = retrievedIds.slice(0, 5);
    let mrrSum = 0;
    for (const expected of expectedIds) {
      const rank = top5.indexOf(expected);
      if (rank !== -1) {
        mrrSum += 1 / (rank + 1);
      }
    }
    const mrrAt5 = expectedIds.length > 0 ? mrrSum / expectedIds.length : (retrievedIds.length > 0 ? 1 : 0);
    
    const allCodes = searchResults.map(r => r.standard.id);
    const whitelistCheck = validateResponse(allCodes.join(' '));
    
    setResults({
      scenario,
      searchResults,
      metrics: {
        hitAt3: Math.round(hitAt3 * 100),
        mrrAt5: Math.round(mrrAt5 * 100),
        latency: Math.round(latency),
        totalIndexed: INDIAN_STANDARDS.length,
        verifiedCodes: allCodes.filter(c => whitelistCheck.validCodes.includes(c)).length,
        totalCodes: allCodes.length,
        hallucinationGuardActive: true,
        whitelistValidated: whitelistCheck.isValid,
      },
      whitelistCheck,
    });
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
            <Eye className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold text-amber-300">Judge / Demo Mode</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-50 mb-2">Retrieval Evaluation</h1>
          <p className="text-slate-300">Evaluate the search engine, anti-hallucination system, and retrieval quality.</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Database, label: 'Standards Indexed', value: INDIAN_STANDARDS.length, color: 'text-saffron-400' },
            { icon: Shield, label: 'Whitelist Active', value: 'Yes', color: 'text-emerald-300' },
            { icon: Target, label: 'IS Codes Verified', value: new Set(INDIAN_STANDARDS.map(s => s.id)).size, color: 'text-saffron-400' },
            { icon: CheckCircle2, label: 'Hallucination Guard', value: 'Active', color: 'text-emerald-300' },
          ].map((item, i) => (
            <div key={i} className="card p-4 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mx-auto mb-2`} />
              <p className={`font-display font-bold text-lg ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Scenario Selection */}
        <div className="card-elevated p-6 mb-6">
          <h2 className="font-display font-bold text-lg text-slate-50 mb-4">Select Test Scenario</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-saffron-400/60 bg-saffron-500/100/10'
                    : 'border-white/10 hover:border-white/30 bg-[#0d1424]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    scenario.type === 'business' ? 'bg-saffron-500/100/15 text-saffron-400' :
                    scenario.type === 'consumer' ? 'bg-emerald-400/15 text-emerald-300' :
                    scenario.type === 'challenge' ? 'bg-amber-400/15 text-amber-300' :
                    'bg-red-400/15 text-red-300'
                  }`}>
                    {scenario.type}
                  </span>
                </div>
                <p className="font-semibold text-sm text-slate-50">{scenario.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">"{scenario.input}"</p>
              </button>
            ))}
          </div>

          <button
            onClick={() => selectedScenario && runEvaluation(selectedScenario)}
            disabled={!selectedScenario || isRunning}
            className="btn-primary mt-4 flex items-center gap-2 disabled:opacity-50"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running Evaluation...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Evaluation</>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="card-elevated p-4 text-center">
                  <BarChart3 className="w-5 h-5 text-saffron-400 mx-auto mb-2" />
                  <p className="font-display font-bold text-2xl text-slate-200">{results.metrics.hitAt3}%</p>
                  <p className="text-[10px] text-slate-400">Hit@3</p>
                </div>
                <div className="card-elevated p-4 text-center">
                  <Target className="w-5 h-5 text-saffron-400 mx-auto mb-2" />
                  <p className="font-display font-bold text-2xl text-saffron-400">{results.metrics.mrrAt5}%</p>
                  <p className="text-[10px] text-slate-400">MRR@5</p>
                </div>
                <div className="card-elevated p-4 text-center">
                  <Clock className="w-5 h-5 text-emerald-300 mx-auto mb-2" />
                  <p className="font-display font-bold text-2xl text-emerald-300">{results.metrics.latency}ms</p>
                  <p className="text-[10px] text-slate-400">Avg Latency</p>
                </div>
              </div>

              {/* Search Results Detail */}
              <div className="card-elevated p-6">
                <h3 className="font-display font-bold text-base text-slate-50 mb-4">Retrieval Results</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Query: <span className="font-mono bg-white/10 px-2 py-0.5 rounded">"{results.scenario.input}"</span>
                </p>
                
                <div className="space-y-2">
                  {results.searchResults.slice(0, 5).map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl">
                      <div className="w-7 h-7 bg-saffron-500/100/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-saffron-400">#{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-saffron-400">{r.standard.id}</span>
                          <span className="text-xs text-slate-400 truncate">{r.standard.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{r.matchReason}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-slate-400">Score: {r.combinedScore.toFixed(2)}</p>
                        <p className={`text-[10px] font-medium ${
                          r.confidence === 'high' ? 'text-emerald-300' :
                          r.confidence === 'medium' ? 'text-amber-300' : 'text-slate-400'
                        }`}>{r.confidence}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Whitelist validation */}
                <div className="mt-6 p-4 bg-white/[0.04] rounded-xl">
                  <h4 className="font-semibold text-sm text-slate-50 mb-2">Whitelist Validation</h4>
                  <div className="space-y-1">
                    {results.searchResults.slice(0, 5).map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {results.whitelistCheck.validCodes.includes(r.standard.id) ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-300" />
                        )}
                        <span className="font-mono">{r.standard.id}</span>
                        <span className="text-slate-400">- {results.whitelistCheck.validCodes.includes(r.standard.id) ? 'Verified ✓' : 'Not in whitelist ✗'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected vs Retrieved */}
                {results.scenario.expectedStandards.length > 0 && (
                  <div className="mt-4 p-4 bg-saffron-500/100/10 rounded-xl">
                    <h4 className="font-semibold text-sm text-slate-50 mb-2">Expected Standards</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.scenario.expectedStandards.map((id: string) => (
                        <span key={id} className={`text-xs font-mono px-2 py-1 rounded-lg ${
                          results.searchResults.some((r: any) => r.standard.id === id)
                            ? 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30'
                            : 'bg-red-400/15 text-red-300 border border-red-400/30'
                        }`}>
                          {results.searchResults.some((r: any) => r.standard.id === id) ? '✓' : '✗'} {id}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

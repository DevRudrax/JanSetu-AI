import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { checkWelfareEligibilityWithGemini } from '../../services/gemini';
import { SchemeApplicationWizard } from '../schemes/SchemeApplicationWizard';
import { WelfareScheme } from '../../types';
import { 
  Landmark, 
  Search, 
  CheckCircle2, 
  Rocket, 
  ExternalLink, 
  Loader2, 
  Filter, 
  Check,
  Bot
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Agriculture',
  'Housing',
  'Healthcare',
  'Energy / Solar',
  'Financial Inclusion',
  'Skill Development'
] as const;

export const SchemesView: React.FC = () => {
  const { currentCitizen, schemes, appliedSchemeIds, globalSearchQuery, setGlobalSearchQuery } = useCitizen();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [incomeFilter, setIncomeFilter] = useState<number>(currentCitizen.annualIncome);
  const [isMatchingLive, setIsMatchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<Record<string, any>>({});
  const [selectedSchemeForModal, setSelectedSchemeForModal] = useState<WelfareScheme | null>(null);

  // Sync globalSearchQuery if arriving from Universal Search
  React.useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  // Sync income filter when citizen profile switches
  React.useEffect(() => {
    setIncomeFilter(currentCitizen.annualIncome);
  }, [currentCitizen]);

  const handleRunAiMatch = async () => {
    setIsMatchingLive(true);
    try {
      const results = await checkWelfareEligibilityWithGemini({
        ...currentCitizen,
        annualIncome: incomeFilter
      }, schemes);
      const resultMap: Record<string, any> = {};
      results.forEach(r => {
        resultMap[r.schemeId] = r;
      });
      setLiveResults(resultMap);
    } catch (e) {
      console.error(e);
    } finally {
      setIsMatchingLive(false);
    }
  };

  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
    const matchesSearch = 
      scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 py-8 gap-8 max-w-[1500px] mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-light pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-[2px] bg-primary"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Direct Benefit Transfer & Welfare Hub
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-on-surface tracking-tight">
            Find & Apply for Government Welfare Schemes
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-2xl">
            Discover Central and State welfare initiatives personalized to your citizen profile. Our AI engine verifies your criteria in real-time.
          </p>
        </div>

        {/* Active Profile Pill */}
        <div className="bg-surface-container-low border border-border-light rounded-2xl p-3.5 flex items-center gap-3 shadow-sm shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {currentCitizen.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Active Persona
            </span>
            <span className="text-xs font-bold text-on-surface">
              {currentCitizen.name} ({currentCitizen.occupation})
            </span>
            <span className="text-[11px] text-primary font-semibold">
              {currentCitizen.state} • ₹{(currentCitizen.annualIncome / 100000).toFixed(1)}L/yr
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Filters Sidebar + Schemes Catalog */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-surface-container-lowest border border-border-light rounded-3xl p-6 shadow-card sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-border-light pb-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Filter className="w-4 h-4" />
                <span>Eligibility Filters</span>
              </div>
              <button
                type="button"
                onClick={handleRunAiMatch}
                disabled={isMatchingLive}
                className="text-xs text-secondary hover:underline font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                {isMatchingLive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                Match with AI
              </button>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface">Search Schemes</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="e.g. Kisan, Solar, Health..."
                  className="w-full bg-surface-container-low border border-border-light rounded-xl pl-9 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface">Category</label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-on-primary font-bold'
                        : 'hover:bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Income Slider */}
            <div className="space-y-3 pt-2 border-t border-border-light">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-on-surface">Annual Income</label>
                <span className="font-mono font-bold text-primary">₹{(incomeFilter / 100000).toFixed(1)}L</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000000"
                step="50000"
                value={incomeFilter}
                onChange={e => setIncomeFilter(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>₹0</span>
                <span>₹5 Lakhs</span>
                <span>₹10 Lakhs+</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunAiMatch}
              disabled={isMatchingLive}
              className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isMatchingLive ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Profile...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4 text-tertiary-fixed" />
                  <span>Recalculate with AI Engine</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Schemes Catalog Cards Grid */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-on-surface">
              Showing {filteredSchemes.length} Government Schemes
            </h2>
            <span className="text-xs text-on-surface-variant">
              Central & State DBTs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map(scheme => {
              const aiResult = liveResults[scheme.id];
              const score = aiResult?.matchScore ?? scheme.matchScore;
              const isApplied = appliedSchemeIds.includes(scheme.id);
              const reasons = aiResult?.matchReasons || scheme.matchReasons;
              const missing = aiResult?.missingCriteria || [];

              return (
                <div
                  key={scheme.id}
                  className="bg-surface-container-lowest border border-border-light rounded-3xl shadow-card overflow-hidden flex flex-col justify-between hover:shadow-elevated transition-all group"
                >
                  {/* Banner with image */}
                  <div className="h-36 relative overflow-hidden bg-surface-container-high">
                    <img
                      src={scheme.bannerImage}
                      alt={scheme.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                    {/* Match Tag */}
                    <div className="absolute top-3.5 right-3.5 bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[11px] px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{score}% Match</span>
                    </div>

                    <div className="absolute bottom-3 left-4 flex gap-1.5 flex-wrap">
                      <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-semibold text-[10px] px-2 py-0.5 rounded-md">
                        {scheme.category}
                      </span>
                      <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-semibold text-[10px] px-2 py-0.5 rounded-md">
                        {scheme.benefitType}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                        {scheme.ministry}
                      </span>
                      <h3 className="font-display font-bold text-base text-primary line-clamp-1">
                        {scheme.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
                        {scheme.summary}
                      </p>

                      {/* AI Match Rationale Badge */}
                      {reasons && reasons.length > 0 && (
                        <div className="mt-2.5 bg-primary/5 border border-primary/10 rounded-xl p-2.5 text-[11px] text-on-surface flex items-start gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">
                            <strong className="text-primary font-semibold">AI Match:</strong> {reasons[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Benefit Info Box */}
                    <div className="bg-surface-container-low rounded-2xl p-3.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Benefit Amount</span>
                        <span className="font-bold text-on-surface truncate block">{scheme.benefitAmount}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-on-surface-variant">Target Beneficiary</span>
                        <span className="font-semibold text-on-surface truncate block">{scheme.targetBeneficiary}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedSchemeForModal(scheme)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                          isApplied
                            ? 'bg-status-success text-white'
                            : 'bg-primary text-on-primary hover:bg-primary/90'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Application Enrolled</span>
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 text-tertiary-fixed" />
                            <span>Apply with AI Assistant</span>
                          </>
                        )}
                      </button>
                      <a
                        href={scheme.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-11 h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center transition-colors shrink-0"
                        title="Official Government Portal"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unified Scheme Application Co-Pilot Wizard Modal with Live Gemini e-Sign & Audit */}
      {selectedSchemeForModal && (
        <SchemeApplicationWizard
          scheme={selectedSchemeForModal}
          onClose={() => setSelectedSchemeForModal(null)}
        />
      )}
    </div>
  );
};

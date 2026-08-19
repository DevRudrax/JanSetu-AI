import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { simplifyCircularWithGemini, CircularSimplificationResult } from '../../services/gemini';
import { SpeechAssistant } from '../../services/speech';
import { CircularDoc, Language } from '../../types';
import { 
  FolderLock, 
  FileText, 
  Bot, 
  Volume2, 
  VolumeX, 
  Languages, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  BadgeCheck, 
  Download, 
  Search, 
  BookOpen, 
  ZoomIn, 
  ZoomOut, 
  Building, 
  UserCheck 
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { currentCitizen, circulars, globalSearchQuery, setGlobalSearchQuery } = useCitizen();
  const { currentLanguage, languages, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'circulars' | 'mydocs'>('circulars');
  const [selectedCircular, setSelectedCircular] = useState<CircularDoc>(circulars[0]);
  const [targetLang, setTargetLang] = useState<Language>(currentLanguage);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<CircularSimplificationResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedMyDoc, setSelectedMyDoc] = useState<string>('Aadhaar Card');

  // Sync globalSearchQuery if routed from Universal Search
  React.useEffect(() => {
    if (globalSearchQuery) {
      setSearchDocQuery(globalSearchQuery);
      // Auto-match matching circular if possible
      const match = circulars.find(c =>
        c.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(globalSearchQuery.toLowerCase())
      );
      if (match) {
        setSelectedCircular(match);
      }
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery, circulars]);

  const myDocuments = [
    { title: 'Aadhaar Card', idNo: 'XXXX-XXXX-8912', date: '12 Jan 2024', status: 'Verified via UIDAI', icon: ShieldCheck },
    { title: 'Digital Ration Card', idNo: 'RC-HR-2023-4912', date: '05 Nov 2023', status: 'Active (NFSA)', icon: BadgeCheck },
    { title: '7/12 Land Record Extract', idNo: 'Khasra No 142/8', date: '18 Aug 2023', status: 'State Bhulekh Linked', icon: FileText },
    { title: 'Income & Asset Certificate', idNo: 'INC-2024-9981', date: '10 Feb 2024', status: 'Tahsildar Certified', icon: CheckCircle2 }
  ];

  const handleSelectCircular = (circ: CircularDoc) => {
    setSelectedCircular(circ);
    setSimplifiedResult(null);
    if (isPlayingAudio) {
      SpeechAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    }
  };

  const handleSimplify = async (lang?: Language) => {
    setIsSimplifying(true);
    if (isPlayingAudio) {
      SpeechAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    }

    try {
      const res = await simplifyCircularWithGemini(selectedCircular.originalText, lang || targetLang);
      setSimplifiedResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      SpeechAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const textToRead = simplifiedResult
        ? `${simplifiedResult.title}. ${simplifiedResult.plainLanguageSummary}. Point 1: ${simplifiedResult.threeKeyTakeaways.coreObjective}. Point 2: ${simplifiedResult.threeKeyTakeaways.eligibility}. Deadline: ${simplifiedResult.threeKeyTakeaways.keyDeadline}`
        : `${selectedCircular.title}. ${selectedCircular.takeaways.coreObjective}. ${selectedCircular.takeaways.eligibility}. Deadline: ${selectedCircular.takeaways.keyDeadline}`;

      setIsPlayingAudio(true);
      SpeechAssistant.speak(textToRead, targetLang, () => {
        setIsPlayingAudio(false);
      });
    }
  };

  const takeaways = simplifiedResult?.threeKeyTakeaways || {
    coreObjective: selectedCircular.takeaways.coreObjective,
    eligibility: selectedCircular.takeaways.eligibility,
    keyDeadline: selectedCircular.takeaways.keyDeadline,
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] overflow-hidden animate-in fade-in duration-200">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: DigiLocker & Circulars List */}
        <aside className="w-80 bg-surface border-r border-border-light flex flex-col h-full shadow-sm z-10 shrink-0 hidden md:flex">
          {/* Header */}
          <div className="p-5 border-b border-border-light bg-surface-container-low/50 space-y-3">
            <div className="flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-base text-primary">Document Vault</h2>
            </div>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('circulars')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'circulars'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Gazettes ({circulars.length})
              </button>
              <button
                onClick={() => setActiveTab('mydocs')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeTab === 'mydocs'
                    ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                DigiLocker ({myDocuments.length})
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === 'circulars' ? (
              circulars.map(circ => (
                <button
                  key={circ.id}
                  onClick={() => handleSelectCircular(circ)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                    selectedCircular.id === circ.id
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface-container-lowest hover:bg-surface-container border-border-light text-on-surface'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                    selectedCircular.id === circ.id ? 'text-primary-fixed' : 'text-on-surface-variant'
                  }`}>
                    {circ.category} • {circ.publishDate}
                  </span>
                  <p className="text-xs font-bold line-clamp-2 leading-snug">
                    {circ.title}
                  </p>
                  <span className={`text-[10px] font-mono mt-1 block ${
                    selectedCircular.id === circ.id ? 'text-primary-fixed-dim' : 'text-outline'
                  }`}>
                    Ref: {circ.refNumber}
                  </span>
                </button>
              ))
            ) : (
              myDocuments.map((doc, idx) => {
                const Icon = doc.icon;
                const isSelected = selectedMyDoc === doc.title;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedMyDoc(doc.title)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/5 border-primary ring-1 ring-primary/20'
                        : 'bg-surface-container-lowest hover:bg-surface-container border-border-light'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{doc.title}</p>
                        <p className="text-[10px] text-on-surface-variant font-mono">{doc.idNo}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border-light/60">
                      <span className="text-status-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {doc.status}
                      </span>
                      <span className="text-outline">{doc.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DigiLocker DPI Security Footer */}
          <div className="p-4 border-t border-border-light bg-surface-container-low/50 text-[11px] text-on-surface-variant flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
            <span>Digital locker synced with DigiLocker API</span>
          </div>
        </aside>

        {/* Main Content Area: Side-by-side Gazette Viewer & AI Simplifier */}
        <div className="flex-1 flex flex-col bg-surface-container-lowest h-full overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Panel: Original Document Viewer */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border-light bg-surface-dim/40 h-1/2 lg:h-full overflow-hidden">
              {/* Toolbar */}
              <div className="h-12 bg-surface px-4 flex items-center justify-between border-b border-border-light shadow-subtle shrink-0">
                <div className="flex items-center gap-2 text-on-surface">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold truncate max-w-[240px]">
                    {selectedCircular.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-on-surface-variant">
                    PDF / Gazette
                  </span>
                </div>
              </div>

              {/* Faux Government Gazette View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
                <div className="bg-surface-container-lowest w-full max-w-2xl shadow-elevated border border-border-light rounded-2xl p-6 sm:p-8 flex flex-col space-y-4 font-serif text-xs leading-relaxed text-on-surface-variant relative">
                  {/* Official Letterhead Header */}
                  <div className="border-b-2 border-slate-text pb-4 text-center font-sans">
                    <p className="font-bold text-xs text-on-surface uppercase tracking-wider">
                      GOVERNMENT OF INDIA
                    </p>
                    <p className="font-bold text-sm text-primary">
                      {selectedCircular.ministry}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      New Delhi • Ref: {selectedCircular.refNumber} • Date: {selectedCircular.publishDate}
                    </p>
                  </div>

                  <h3 className="font-sans font-bold text-sm text-center text-on-surface uppercase tracking-wide pt-2">
                    OFFICIAL NOTIFICATION
                  </h3>

                  <div className="whitespace-pre-wrap leading-relaxed">
                    {selectedCircular.originalText}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: AI Plain Summary & Takeaways */}
            <div className="flex-1 flex flex-col p-6 sm:p-8 bg-surface-container-lowest overflow-y-auto space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-on-surface">
                      AI Plain Language Breakdown
                    </h3>
                    <p className="text-xs text-on-surface-variant">Instant Indian Language Simplification</p>
                  </div>
                </div>

                {/* Translation Dropdown */}
                <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1 rounded-full border border-border-light">
                  <Languages className="w-3.5 h-3.5 text-secondary" />
                  <select
                    value={targetLang}
                    onChange={e => {
                      const newLang = e.target.value as Language;
                      setTargetLang(newLang);
                      handleSimplify(newLang);
                    }}
                    className="bg-transparent border-none text-xs font-semibold text-on-surface cursor-pointer outline-none"
                  >
                    {languages.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.nativeName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3 Takeaways */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-low border border-border-light">
                  <div className="w-7 h-7 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-on-surface block mb-0.5">{t('coreObjective')}:</strong>
                    <span className="text-on-surface-variant">{takeaways.coreObjective}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-low border border-border-light">
                  <div className="w-7 h-7 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-on-surface block mb-0.5">{t('eligibilityCriteria')}:</strong>
                    <span className="text-on-surface-variant">{takeaways.eligibility}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-error-container/30 border border-error-container">
                  <div className="w-7 h-7 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0 font-bold text-xs">
                    !
                  </div>
                  <div className="text-xs leading-relaxed">
                    <strong className="text-on-error-container block mb-0.5">{t('keyDeadline')}:</strong>
                    <span className="text-on-surface font-semibold">{takeaways.keyDeadline}</span>
                  </div>
                </div>
              </div>

              {/* Jargon Busters */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-secondary" />
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    Bureaucracy Jargon Buster
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCircular.jargonBusters.map((jb, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-surface-container-low border border-border-light text-xs">
                      <span className="font-bold text-primary block">{jb.term}</span>
                      <span className="text-on-surface-variant mt-0.5 block">{jb.plainMeaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-border-light flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
                    isPlayingAudio
                      ? 'bg-status-error text-white animate-pulse'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
                  <span>{isPlayingAudio ? 'Stop Narration' : `Listen Audio (${targetLang.toUpperCase()})`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSimplify()}
                  disabled={isSimplifying}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSimplifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4 text-tertiary-fixed" />}
                  <span>Regenerate Summary</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

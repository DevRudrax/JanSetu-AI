import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { simplifyCircularWithGemini, CircularSimplificationResult } from '../../services/gemini';
import { SpeechAssistant } from '../../services/speech';
import { OFFICIAL_CIRCULARS } from '../../services/dummyData';
import { CircularDoc, Language } from '../../types';
import { 
  FileText, 
  Volume2, 
  VolumeX, 
  Languages, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const DocSimplifierCard: React.FC = () => {
  const { circulars, setActiveView } = useCitizen();
  const { currentLanguage, languages, t } = useLanguage();

  const [selectedCircular, setSelectedCircular] = useState<CircularDoc>(circulars[0] || OFFICIAL_CIRCULARS[0]);
  const [customText, setCustomText] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [targetLang, setTargetLang] = useState<Language>(currentLanguage);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [simplifiedResult, setSimplifiedResult] = useState<CircularSimplificationResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSimplify = async (overrideText?: string, lang?: Language) => {
    const textToProcess = overrideText || (isCustomMode ? customText : selectedCircular.originalText);
    if (!textToProcess.trim()) return;

    setIsSimplifying(true);
    if (isPlayingAudio) {
      SpeechAssistant.stopSpeaking();
      setIsPlayingAudio(false);
    }

    try {
      const result = await simplifyCircularWithGemini(textToProcess, lang || targetLang);
      setSimplifiedResult(result);
    } catch (err) {
      console.error(err);
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
        ? `${simplifiedResult.title}. ${simplifiedResult.plainLanguageSummary}. Point 1: ${simplifiedResult.threeKeyTakeaways.coreObjective}. Point 2: ${simplifiedResult.threeKeyTakeaways.eligibility}. Key Deadline: ${simplifiedResult.threeKeyTakeaways.keyDeadline}`
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
    <div className="bg-surface-container-lowest border border-border-light shadow-card rounded-3xl overflow-hidden flex flex-col lg:flex-row">
      {/* Left Side: Document Preview & Circular Selector */}
      <div className="lg:w-5/12 bg-surface-container-low/60 border-b lg:border-b-0 lg:border-r border-border-light p-6 sm:p-8 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="font-bold text-sm text-on-surface">
                {t('originalDocument')}
              </span>
            </div>
            <span className="px-2.5 py-1 bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold rounded-md">
              REF: {selectedCircular.refNumber}
            </span>
          </div>

          {/* Quick Circular Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {circulars.slice(0, 3).map((circ) => (
              <button
                key={circ.id}
                type="button"
                onClick={() => {
                  setSelectedCircular(circ);
                  setIsCustomMode(false);
                  setSimplifiedResult(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedCircular.id === circ.id && !isCustomMode
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {circ.category}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isCustomMode
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              + Paste Custom
            </button>
          </div>

          {/* Document Content Paper Mockup */}
          {isCustomMode ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant">Paste Gazette / Circular Text:</label>
              <textarea
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Paste official notification text here..."
                className="w-full bg-surface-container-lowest border border-border-light rounded-xl p-3.5 text-xs text-on-surface font-serif leading-relaxed h-44 resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-border-light rounded-2xl p-4 sm:p-5 shadow-subtle relative group max-h-52 overflow-y-auto font-serif text-xs leading-relaxed text-on-surface-variant/90 space-y-2">
              <div className="border-b border-border-light pb-2 mb-2 flex justify-between items-center text-[10px] font-sans font-bold text-on-surface">
                <span>{selectedCircular.ministry}</span>
                <span>{selectedCircular.publishDate}</span>
              </div>
              <p className="font-bold text-on-surface text-xs font-sans">
                {selectedCircular.title}
              </p>
              <p className="whitespace-pre-wrap">
                {selectedCircular.originalText.slice(0, 320)}...
              </p>
            </div>
          )}
        </div>

        {/* Action Trigger Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => handleSimplify()}
            disabled={isSimplifying}
            className="w-full py-3 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs sm:text-sm hover:bg-primary-container/90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSimplifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simplifying Document...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-tertiary-fixed" />
                <span>Simplify Document with AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Side: AI Simplification & Vernacular Breakdown */}
      <div className="lg:w-7/12 p-6 sm:p-8 flex flex-col justify-between bg-surface-container-lowest">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center">
                <FileText className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-on-surface">
                  {t('aiSimplifiedSummary')}
                </h3>
                <p className="text-xs text-on-surface-variant">3 Actionable Takeaways & Plain Language</p>
              </div>
            </div>

            {/* Language Selector for translation */}
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-full border border-border-light">
              <Languages className="w-3.5 h-3.5 text-secondary" />
              <select
                value={targetLang}
                onChange={e => {
                  const newLang = e.target.value as Language;
                  setTargetLang(newLang);
                  handleSimplify(undefined, newLang);
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

          {/* 3 Actionable Key Takeaways */}
          <div className="flex flex-col gap-3.5">
            {/* Takeaway 1 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface-container-low/60 border border-border-light/60">
              <div className="w-7 h-7 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div className="text-xs leading-relaxed">
                <strong className="text-on-surface block mb-0.5">{t('coreObjective')}:</strong>
                <span className="text-on-surface-variant">{takeaways.coreObjective}</span>
              </div>
            </div>

            {/* Takeaway 2 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface-container-low/60 border border-border-light/60">
              <div className="w-7 h-7 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div className="text-xs leading-relaxed">
                <strong className="text-on-surface block mb-0.5">{t('eligibilityCriteria')}:</strong>
                <span className="text-on-surface-variant">{takeaways.eligibility}</span>
              </div>
            </div>

            {/* Takeaway 3 (Deadline Alert) */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-error-container/30 border border-error-container">
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
          {selectedCircular.jargonBusters && (
            <div className="pt-2">
              <div className="flex items-center gap-1.5 mb-2">
                <BookOpen className="w-3.5 h-3.5 text-secondary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Bureaucracy Jargon Buster
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCircular.jargonBusters.slice(0, 2).map((jb, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-surface-container-low border border-border-light text-[11px]">
                    <span className="font-bold text-primary block">{jb.term}</span>
                    <span className="text-on-surface-variant">{jb.plainMeaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions: Listen & Full View */}
        <div className="mt-6 pt-4 border-t border-border-light flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                isPlayingAudio
                  ? 'bg-status-error text-white shadow-md animate-pulse'
                  : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-primary" />}
              <span>{isPlayingAudio ? 'Stop Audio' : `${t('listen')} (${targetLang.toUpperCase()})`}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('documents')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Open in Document Vault</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

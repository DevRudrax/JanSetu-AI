import React, { useState, useEffect, useRef } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { analyzeUniversalQuery } from '../../services/gemini';
import { SpeechAssistant, isSpeechRecognitionSupported } from '../../services/speech';
import { UniversalAIQueryResult } from '../../types';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Landmark, 
  AlertTriangle, 
  FileText, 
  Scale, 
  ArrowRight, 
  Loader2, 
  FolderLock, 
  CheckCircle2 
} from 'lucide-react';

export const UniversalSearch: React.FC = () => {
  const { currentCitizen, setActiveView, globalSearchQuery, setGlobalSearchQuery } = useCitizen();
  const { currentLanguage, t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<UniversalAIQueryResult | null>(null);

  const speechAssistantRef = useRef<SpeechAssistant | null>(null);

  useEffect(() => {
    speechAssistantRef.current = new SpeechAssistant();
  }, []);

  // Sync globalSearchQuery if triggered from header
  useEffect(() => {
    if (globalSearchQuery && globalSearchQuery !== inputQuery) {
      setInputQuery(globalSearchQuery);
      handleExecuteQuery(globalSearchQuery);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setSpeechError(null);

    try {
      const result = await analyzeUniversalQuery(queryText, currentCitizen, currentLanguage);
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleExecuteQuery(inputQuery);
  };

  const handleToggleVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      speechAssistantRef.current?.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      setIsListening(true);
      speechAssistantRef.current?.startListening(
        currentLanguage,
        (transcript, isFinal) => {
          setInputQuery(transcript);
          if (isFinal) {
            setIsListening(false);
            handleExecuteQuery(transcript);
          }
        },
        (error) => {
          setSpeechError(`Voice input: ${error}`);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  const handlePillClick = (prompt: string, targetView?: 'schemes' | 'grievances' | 'documents' | 'rti-assistant') => {
    setInputQuery(prompt);
    if (targetView) {
      // Direct fast navigation or query execution
      handleExecuteQuery(prompt);
    } else {
      handleExecuteQuery(prompt);
    }
  };

  const actionPills = [
    { label: t('findSchemes'), icon: Landmark, prompt: 'Find all government welfare schemes and financial subsidies I am eligible for as a farmer in Haryana' },
    { label: t('trackGrievance'), icon: AlertTriangle, prompt: 'Report and route a large broken pothole on MG Road junction to the Public Works Department' },
    { label: t('analyzeDoc'), icon: FileText, prompt: 'Simplify the mandatory e-KYC official circular for PM-Kisan installment disbursals' },
    { label: t('rtiAssistant'), icon: Scale, prompt: 'Draft a legally sound Right to Information (RTI) application for road repair expenditure and contractor bills' },
    { label: t('digilockerVault'), icon: FolderLock, prompt: 'Verify and link my Aadhaar, Ration card, and 7/12 land records from DigiLocker' },
  ];

  return (
    <section className="flex flex-col gap-6 w-full max-w-5xl mx-auto text-center pt-2">
      {/* Hero Title & Branding */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-center items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-xs uppercase tracking-widest text-primary">
            JanSetu AI Citizen Copilot
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-on-surface tracking-tight">
          {t('heroQuestion')}
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
          {t('heroTagline')}
        </p>
      </div>

      {/* Universal Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full shadow-lg shadow-primary/5 rounded-full bg-surface-container-lowest border border-border-light flex items-center p-2 sm:p-2.5 transform transition-all focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary"
      >
        {/* Voice Input Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-3 rounded-full transition-all shrink-0 ${
            isListening
              ? 'bg-status-error text-white animate-pulse shadow-md'
              : 'text-primary hover:bg-surface-container-low'
          }`}
          title={isListening ? 'Listening... Speak in any language' : 'Speak your query (Speech to Text)'}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Input */}
        <input
          type="text"
          value={inputQuery}
          onChange={e => setInputQuery(e.target.value)}
          placeholder={isListening ? 'Listening to your voice...' : t('searchPlaceholder')}
          className="flex-1 bg-transparent outline-none text-sm sm:text-base text-on-surface placeholder:text-outline-variant px-3 py-2 w-full min-w-0"
        />

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="bg-primary text-on-primary rounded-full px-5 sm:px-7 py-3 text-xs sm:text-sm font-semibold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze</span>
            </>
          )}
        </button>
      </form>

      {/* Voice feedback / Error */}
      {isListening && (
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-status-error animate-pulse">
          <span className="w-2 h-2 rounded-full bg-status-error"></span>
          Listening in {currentLanguage.toUpperCase()}... Speak naturally now.
        </div>
      )}
      {speechError && (
        <p className="text-xs text-status-error">{speechError}</p>
      )}

      {/* Action Pills */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {actionPills.map((pill, idx) => {
          const Icon = pill.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePillClick(pill.prompt)}
              className="bg-surface-container-lowest text-on-surface text-xs font-semibold px-4 py-2.5 rounded-full border border-border-light shadow-sm hover:shadow-md hover:bg-surface-container-low hover:border-secondary/30 transition-all flex items-center gap-2 group"
            >
              <Icon className="w-3.5 h-3.5 text-secondary group-hover:scale-110 transition-transform" />
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Live AI Classification & Intent Routing Card */}
      {aiResult && (
        <div className="mt-2 text-left bg-surface-container-lowest border border-border-light rounded-2xl p-5 shadow-elevated animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-border-light">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center">
                <Bot className="w-4 h-4 text-tertiary-fixed" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    AI Intent: {aiResult.intent}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-status-success/10 text-status-success text-[10px] font-bold">
                    {(aiResult.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">Processed by JanSetu AI Engine</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (inputQuery.trim()) {
                  setGlobalSearchQuery(inputQuery.trim());
                }
                setActiveView(aiResult.targetModule);
              }}
              className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-semibold text-xs shadow-sm hover:bg-primary-container/90 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Open in {aiResult.targetModule.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-3">
            <p className="text-sm text-on-surface leading-relaxed">
              {aiResult.actionableSummary}
            </p>
          </div>

          {aiResult.suggestedPrompts && aiResult.suggestedPrompts.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Follow-ups:
              </span>
              {aiResult.suggestedPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handlePillClick(sp)}
                  className="text-xs px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  {sp}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

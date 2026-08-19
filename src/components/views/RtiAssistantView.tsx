import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { draftRtiWithGemini, RtiDraftResult } from '../../services/gemini';
import { SpeechAssistant, isSpeechRecognitionSupported } from '../../services/speech';
import { RtiRequest } from '../../types';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Scale, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  HelpCircle, 
  Copy, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RtiAssistantView: React.FC = () => {
  const { currentCitizen, rtiRequests, addRtiRequest, globalSearchQuery, setGlobalSearchQuery } = useCitizen();
  const { currentLanguage } = useLanguage();

  const [queryInput, setQueryInput] = useState('I want to know the total sanctioned budget and contractor measurement book entries for road repair on MG Road Sector 14 during financial year 2023-24.');
  const [departmentHint, setDepartmentHint] = useState('Public Works Department (PWD)');
  const [isListening, setIsListening] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<RtiDraftResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTrackingReq, setActiveTrackingReq] = useState<RtiRequest>(rtiRequests[0]);

  const speechAssistantRef = React.useRef<SpeechAssistant | null>(null);

  React.useEffect(() => {
    speechAssistantRef.current = new SpeechAssistant();
  }, []);

  // Sync globalSearchQuery if routed from Universal Search
  React.useEffect(() => {
    if (globalSearchQuery) {
      setQueryInput(globalSearchQuery);
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  const handleToggleVoice = () => {
    if (!isSpeechRecognitionSupported()) return;

    if (isListening) {
      speechAssistantRef.current?.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechAssistantRef.current?.startListening(
        currentLanguage,
        (transcript, isFinal) => {
          setQueryInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          if (isFinal) setIsListening(false);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const handleDraftApplication = async () => {
    if (!queryInput.trim()) return;
    setIsDrafting(true);

    try {
      const res = await draftRtiWithGemini(
        queryInput,
        currentCitizen.name,
        `House 142, ${currentCitizen.district}, ${currentCitizen.state} - India`,
        departmentHint
      );
      setDraftResult(res);

      const trackingId = `RTI-2024-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReq: RtiRequest = {
        id: `rti-${Date.now()}`,
        trackingId,
        applicantName: currentCitizen.name,
        applicantAddress: `${currentCitizen.district}, ${currentCitizen.state}`,
        targetDepartment: res.targetDepartment,
        designatedPio: res.designatedPio,
        querySubject: `Information sought under RTI Act 2005 regarding public records`,
        queryDetails: queryInput,
        legalClausesCited: res.legalSectionsCited,
        applicationFee: res.applicationFee,
        createdDate: new Date().toISOString().split('T')[0],
        statutoryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Drafted',
        fullDraftLetter: res.formalApplicationText,
        feeReceiptMode: 'UPI / BharatQR'
      };

      addRtiRequest(newReq);
      setActiveTrackingReq(newReq);

      try {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = draftResult ? draftResult.formalApplicationText : activeTrackingReq.fullDraftLetter;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FORM A - APPLICATION UNDER SECTION 6(1) OF RTI ACT, 2005', 14, 20);
    doc.setFontSize(10);
    doc.setLineWidth(0.5);
    doc.line(14, 24, 196, 24);

    doc.setFont('helvetica', 'normal');
    const textToPrint = draftResult ? draftResult.formalApplicationText : activeTrackingReq.fullDraftLetter;
    const split = doc.splitTextToSize(textToPrint, 180);
    doc.text(split, 14, 34);

    doc.save(`RTI_Application_${activeTrackingReq.trackingId}.pdf`);
  };

  const displayLetter = draftResult ? draftResult.formalApplicationText : activeTrackingReq.fullDraftLetter;
  const pio = draftResult ? draftResult.designatedPio : activeTrackingReq.designatedPio;
  const dept = draftResult ? draftResult.targetDepartment : activeTrackingReq.targetDepartment;
  const sections = draftResult ? draftResult.legalSectionsCited : activeTrackingReq.legalClausesCited;

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 py-8 gap-8 max-w-[1500px] mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-surface-container-low border border-border-light rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Right to Information Act, 2005 Portal
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-on-surface tracking-tight">
            AI RTI Legal Application Drafter
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 leading-relaxed">
            Navigate government transparency effortlessly. Describe what records, tender files, or audit data you seek in plain words—our AI drafts an ironclad legal application and routes it to the designated PIO.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 bg-surface-container-lowest px-4 py-2.5 rounded-2xl shadow-sm border border-border-light">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-status-success"></span>
          </span>
          <span className="text-xs font-bold text-on-surface">Statutory 30-Day Law Online</span>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Input & Legal Analysis (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Input Box */}
          <div className="bg-surface-container-lowest border border-border-light rounded-3xl p-6 shadow-card space-y-4">
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-on-surface">
                What public information or government records do you seek?
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                No legal terminology needed. Explain the bills, work orders, tender files, or sanction lists you require.
              </p>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-2 border border-border-light/60 focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all">
              <textarea
                value={queryInput}
                onChange={e => setQueryInput(e.target.value)}
                placeholder="E.g., I want copies of the sanctioned budget, contractor invoices, and quality test reports for road repairs in Ward 14..."
                className="w-full bg-transparent resize-none text-xs sm:text-sm text-on-surface p-2.5 focus:outline-none min-h-[140px] placeholder:text-outline-variant leading-relaxed font-sans"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isListening
                    ? 'bg-status-error text-white animate-pulse'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-primary" />}
                <span>{isListening ? 'Listening...' : 'Dictate Request'}</span>
              </button>

              <button
                type="button"
                onClick={handleDraftApplication}
                disabled={isDrafting || !queryInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Drafting Legal RTI...</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4 text-tertiary-fixed" />
                    <span>Draft RTI Application</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Authority & Section Mapping Panel */}
          <div className="bg-surface-container-lowest border border-border-light rounded-3xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Building2 className="w-4 h-4 text-secondary" />
              <span>Public Authority & Statutory Clause Mapping</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border-light">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Target Department</span>
                <span className="text-xs font-bold text-on-surface block mt-1">{dept}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border-light">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Designated PIO</span>
                <span className="text-xs font-bold text-on-surface block mt-1">{pio}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-surface-container-low border border-border-light">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">Application Fee</span>
                <span className="text-xs font-bold text-status-success block mt-1">₹10 (Postal Order / UPI)</span>
              </div>
            </div>

            {/* Legal sections */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-on-surface">Legal RTI Sections Cited in Application:</span>
              <div className="space-y-1.5">
                {sections.map((sec, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-primary-fixed/20 border border-primary/20 text-xs text-on-primary-fixed-variant flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{sec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Legal Draft Letter Preview & Statutory Timeline (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Timeline & 30-Day statutory clock */}
          <div className="bg-primary text-on-primary rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-tertiary-fixed" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-fixed">
                  Statutory 30-Day Response Clock
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                Active
              </span>
            </div>

            <div className="bg-white/10 rounded-2xl p-3.5 backdrop-blur-md flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-primary-fixed-dim uppercase block">Tracking Reference</span>
                <span className="font-mono font-bold text-white">{activeTrackingReq.trackingId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-primary-fixed-dim uppercase block">Mandatory Deadline</span>
                <span className="font-bold text-tertiary-fixed">{activeTrackingReq.statutoryDeadline}</span>
              </div>
            </div>
          </div>

          {/* Legal Draft Letter Preview */}
          <div className="bg-surface-container-lowest border border-border-light rounded-3xl p-6 shadow-card space-y-4 flex flex-col justify-between flex-1">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-light pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  Legal Draft Preview (Section 6(1))
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>

              {/* Scrollable Letter Body */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-light font-serif text-xs leading-relaxed text-on-surface max-h-72 overflow-y-auto whitespace-pre-wrap">
                {displayLetter}
              </div>
            </div>

            {/* Action Download / Export */}
            <div className="pt-4 border-t border-border-light flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportPdf}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-tertiary-fixed" />
                <span>Download Formatted RTI PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

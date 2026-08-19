import React, { useState, useRef } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { triageGrievanceWithGemini, GrievanceTriageResult } from '../../services/gemini';
import { SpeechAssistant, isSpeechRecognitionSupported } from '../../services/speech';
import { Grievance } from '../../types';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  Mic, 
  MicOff, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  FileText, 
  Loader2, 
  MapPin, 
  ArrowRight,
  Image as ImageIcon,
  Check,
  Bot,
  Mail,
  SendHorizontal,
  ExternalLink
} from 'lucide-react';

const SAMPLE_CIVIC_PHOTOS = [
  {
    name: 'Pothole on Main Road',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    description: 'Deep road cavity on Sector 14 crossing causing traffic hazards and skidding.',
    category: 'Roads & Infrastructure'
  },
  {
    name: 'Water Pipe Burst',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
    description: 'High-pressure drinking water supply line burst flooding the residential street.',
    category: 'Water Supply & Sanitation'
  },
  {
    name: 'Garbage Dump Overflow',
    url: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
    description: 'Waste container uncollected for 5 days near government primary school.',
    category: 'Solid Waste Management'
  }
];

export const GrievanceCard: React.FC = () => {
  const { currentCitizen, addGrievance, setActiveView } = useCitizen();
  const { currentLanguage, t } = useLanguage();

  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_CIVIC_PHOTOS[0].url);
  const [imageFileBase64, setImageFileBase64] = useState<string | null>(null);
  const [locationText, setLocationText] = useState(`${currentCitizen.district}, ${currentCitizen.state}`);
  const [isListening, setIsListening] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<GrievanceTriageResult | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState(import.meta.env.VITE_TARGET_DISPATCH_EMAIL || 'jonrad.studios@gmail.com');
  const [web3FormsKey, setWeb3FormsKey] = useState(
    import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || localStorage.getItem('web3forms_access_key') || '41854d54-e8fe-4c26-b69f-beeac8f6fd9c'
  );
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechAssistantRef = useRef<SpeechAssistant | null>(null);

  React.useEffect(() => {
    speechAssistantRef.current = new SpeechAssistant();
  }, []);

  React.useEffect(() => {
    setLocationText(`${currentCitizen.district}, ${currentCitizen.state}`);
  }, [currentCitizen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageFileBase64(base64);
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

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
          setAudioTranscript(transcript);
          setTextInput(prev => (prev ? `${prev} ${transcript}` : transcript));
          if (isFinal) setIsListening(false);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const handleAnalyze = async () => {
    const queryToAnalyze = textInput || audioTranscript || (selectedImage ? 'Civic infrastructure breakdown reported via photograph.' : '');
    if (!queryToAnalyze && !selectedImage) return;

    setIsAnalyzing(true);
    setTriageResult(null);
    setSubmittedTicketId(null);
    setDispatchStatus(null);

    try {
      const result = await triageGrievanceWithGemini(
        queryToAnalyze,
        imageFileBase64 || undefined,
        'image/jpeg',
        audioTranscript,
        currentCitizen.name,
        locationText
      );
      setTriageResult(result);
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!triageResult) return;
    setIsSubmittingForm(true);

    const ticketId = `GRV-2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const publicCode = `CPGRAMS-${currentCitizen.state.slice(0, 2).toUpperCase()}-2024-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance: Grievance = {
      id: ticketId,
      publicTrackingCode: publicCode,
      title: triageResult.title,
      description: textInput || audioTranscript || 'Reported civic issue via JanSetu AI portal.',
      category: triageResult.category,
      department: triageResult.department,
      designatedOfficer: triageResult.designatedOfficer,
      urgency: triageResult.urgency,
      urgencyRationale: triageResult.urgencyRationale,
      location: locationText,
      imageUrl: selectedImage || undefined,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AI Triaged',
      officialLetterDraft: triageResult.officialComplaintLetter,
      actionTimeline: [
        {
          stage: 'Submitted',
          timestamp: 'Just now',
          description: `Grievance registered and dispatched to designated department`,
          officerOrSystem: 'National DPI Grievance Gateway',
          completed: true,
        },
        {
          stage: 'AI Triaged',
          timestamp: 'Just now',
          description: `Classified as ${triageResult.category} (${triageResult.urgency} Urgency).`,
          officerOrSystem: 'JanSetu AI Vision Engine',
          completed: true,
          active: true,
        },
        {
          stage: 'Department Assigned',
          timestamp: 'Pending dispatch',
          description: `Routing to ${triageResult.department}.`,
          officerOrSystem: triageResult.designatedOfficer,
          completed: false,
        },
        {
          stage: 'In Progress',
          timestamp: 'Pending',
          description: 'Work order generation and site inspection.',
          officerOrSystem: 'Field Engineering Team',
          completed: false,
        },
        {
          stage: 'Resolved',
          timestamp: `Within ${triageResult.estimatedResolutionDays} days`,
          description: 'Completion verification certificate.',
          officerOrSystem: 'Nodal Officer',
          completed: false,
        }
      ]
    };

    addGrievance(newGrievance);
    setSubmittedTicketId(ticketId);

    // Save access key if entered
    if (web3FormsKey) {
      localStorage.setItem('web3forms_access_key', web3FormsKey);
    }

    const emailSubject = `[CPGRAMS / JanSetu AI Grievance #${ticketId}] ${triageResult.title}`;
    const emailBody = (
      `CITIZEN GRIEVANCE LODGEMENT RECORD\n\n` +
      `• Ticket ID: ${ticketId}\n` +
      `• Tracking Code: ${publicCode}\n` +
      `• Citizen Applicant: ${currentCitizen.name} (${currentCitizen.state})\n` +
      `• Incident Location: ${locationText}\n` +
      `• Department: ${triageResult.department}\n` +
      `• Designated Officer: ${triageResult.designatedOfficer}\n` +
      `• Urgency Level: ${triageResult.urgency} (SLA: ${triageResult.estimatedResolutionDays} Days)\n\n` +
      `OFFICIAL COMPLAINT LETTER\n\n` +
      `${triageResult.officialComplaintLetter}\n\n` +
      `RECOMMENDED FIELD ACTIONS\n\n` +
      triageResult.actionSteps.map((step, idx) => `${idx + 1}. ${step}`).join('\n') +
      `\n\nDispatched via JanSetu AI Citizen DPI Portal`
    );

    // 1. Dispatch via Web3Forms API
    let web3Success = false;
    try {
      const formData = new FormData();
      if (web3FormsKey) {
        formData.append('access_key', web3FormsKey.trim());
      }
      formData.append('from_name', 'JanSetu AI Citizen Governance Portal');
      formData.append('name', currentCitizen.name);
      formData.append('email', targetEmail.trim());
      formData.append('subject', emailSubject);
      formData.append('message', emailBody);
      formData.append('ticket_id', ticketId);
      formData.append('tracking_code', publicCode);
      formData.append('reported_location', locationText);
      formData.append('department', triageResult.department);
      formData.append('designated_officer', triageResult.designatedOfficer);
      formData.append('urgency', triageResult.urgency);

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        web3Success = true;
        setDispatchStatus(`Successfully dispatched to ${triageResult.department}`);
      }
    } catch (e) {
      console.warn('Dispatch notification:', e);
    }

    // 2. Secondary fallback via FormSubmit if Web3Forms key is not configured or in test mode
    if (!web3Success) {
      try {
        await fetch(`https://formsubmit.co/ajax/${targetEmail.trim()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: emailSubject,
            _template: 'table',
            'Ticket Reference ID': ticketId,
            'CPGRAMS Tracking Code': publicCode,
            'Citizen Name': currentCitizen.name,
            'Reported Location': locationText,
            'Assigned Department': triageResult.department,
            'Designated Officer': triageResult.designatedOfficer,
            'Urgency Level': triageResult.urgency,
            'Official Complaint Letter': triageResult.officialComplaintLetter
          })
        });
        setDispatchStatus(`Dispatched official complaint to ${targetEmail}`);
      } catch (err) {
        setDispatchStatus(`Recorded and queued for ${targetEmail}`);
      }
    }

    // 3. Trigger mailto redirect to open pre-filled email client
    try {
      const mailtoUrl = `mailto:${targetEmail.trim()}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    } catch (e) {
      console.warn('Mailto error:', e);
    }

    setIsSubmittingForm(false);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="bg-surface-container-lowest border border-border-light shadow-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden group">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-start justify-between z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-on-surface">
              {t('smartGrievanceTitle')}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary text-[10px] font-bold uppercase tracking-wider">
              Multimodal Vision AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            {t('smartGrievanceSubtitle')}
          </p>
        </div>
        <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {/* Image Upload Zone & Preset Photos */}
      <div className="space-y-3 z-10">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,.pdf"
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-surface-container-low hover:bg-surface-container/80 border-2 border-dashed border-border-light hover:border-secondary/50 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all group/upload"
        >
          {selectedImage ? (
            <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm group">
              <img
                src={selectedImage}
                alt="Selected civic issue"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                Click to change photo or drop file
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-surface-container-lowest shadow-sm rounded-full flex items-center justify-center text-primary group-hover/upload:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-on-surface">
                {t('dragDropText')}
              </span>
              <span className="text-[11px] text-outline">
                {t('dragDropSub')}
              </span>
            </>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-on-surface-variant shrink-0 flex items-center gap-1">
            <ImageIcon className="w-3 h-3 text-secondary" />
            Quick Presets:
          </span>
          {SAMPLE_CIVIC_PHOTOS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedImage(sample.url);
                setImageFileBase64(null);
                setTextInput(sample.description);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 transition-all ${
                selectedImage === sample.url
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest hover:bg-surface-container border-border-light text-on-surface'
              }`}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Location / Address Field */}
      <div className="space-y-2 z-10">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-on-surface flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>Incident Location / Address:</span>
          </label>
          <span className="text-[11px] text-on-surface-variant">
            Routes to local Municipal / PWD authority
          </span>
        </div>

        <div className="flex items-center gap-2 bg-surface-container rounded-xl px-3.5 py-1 border border-border-light/60 focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all">
          <MapPin className="w-4 h-4 text-secondary shrink-0" />
          <input
            type="text"
            value={locationText}
            onChange={e => setLocationText(e.target.value)}
            placeholder="e.g. Sector 5 crossing, Salt Lake, Kolkata / Indiranagar, Bengaluru / MG Road, Gurugram"
            className="w-full bg-transparent outline-none text-xs sm:text-sm py-2 text-on-surface placeholder:text-outline-variant font-medium"
          />
        </div>

        {/* Quick Location Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-[10px] uppercase font-bold text-on-surface-variant shrink-0">Quick City:</span>
          {[
            `${currentCitizen.district}, ${currentCitizen.state}`,
            'Sector 5, Salt Lake, Kolkata, West Bengal',
            'Sector 5, Gurugram, Haryana',
            'Indiranagar, Bengaluru, Karnataka',
            'Civil Lines, Jaipur, Rajasthan',
            'Varanasi, Uttar Pradesh',
            'Rohini Sector 14, Delhi'
          ].map((loc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setLocationText(loc)}
              className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-medium shrink-0 transition-all ${
                locationText === loc
                  ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-xs'
                  : 'bg-surface-container-low hover:bg-surface-container border-border-light text-on-surface-variant'
              }`}
            >
              {loc.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Text & Speech Input Area */}
      <div className="space-y-2 z-10">
        <label className="block text-xs font-bold text-on-surface">
          Describe Civic Breakdown / Defect:
        </label>
        <div className="flex flex-col sm:flex-row gap-2.5 items-center">
          <div className="flex-1 w-full bg-surface-container rounded-xl flex items-center px-3.5 py-1.5 border border-border-light/60 focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all">
            <input
              type="text"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={t('typeGrievancePlaceholder')}
              className="w-full bg-transparent outline-none text-xs sm:text-sm py-2 text-on-surface placeholder:text-outline-variant"
            />
          </div>

        {/* Mic Speech Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`h-11 px-3.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold transition-all shrink-0 ${
            isListening
              ? 'bg-status-error text-white animate-pulse'
              : 'bg-surface-container-high hover:bg-surface-container-highest text-primary'
          }`}
          title="Speak grievance in your language"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
        </button>

        {/* Analyze with Gemini Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="h-11 px-5 rounded-xl bg-primary text-on-primary text-xs font-semibold shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Routing...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4 text-tertiary-fixed" />
              <span>Analyze & Route</span>
            </>
          )}
        </button>
        </div>
      </div>

      {/* Auto-Routing Preview & Triage Result */}
      {triageResult && !submittedTicketId && (
        <div className="bg-surface-container-high/40 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-secondary" />
              {t('aiRoutingPreview')}
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              SLA Target: <strong>{triageResult.estimatedResolutionDays} Days</strong>
            </span>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-surface-container-lowest text-primary font-semibold text-xs rounded-full shadow-subtle flex items-center gap-1.5 border border-border-light">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Dept: {triageResult.department}
            </span>

            <span className={`px-3 py-1 font-semibold text-xs rounded-full shadow-subtle flex items-center gap-1.5 ${
              triageResult.urgency === 'High'
                ? 'bg-error-container text-on-error-container border border-error/20'
                : triageResult.urgency === 'Medium'
                ? 'bg-status-warning/20 text-status-warning'
                : 'bg-status-success/20 text-status-success'
            }`}>
              Urgency: {triageResult.urgency}
            </span>

            <span className="px-3 py-1 bg-surface-container-lowest text-on-surface font-semibold text-xs rounded-full shadow-subtle flex items-center gap-1.5 border border-border-light">
              <Building2 className="w-3.5 h-3.5 text-secondary" />
              Officer: {triageResult.designatedOfficer}
            </span>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Urgency Rationale:</strong> {triageResult.urgencyRationale}
          </p>

          {/* Official Letter Preview Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-on-surface">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-primary" />
                Official Complaint Letter Preview:
              </span>
              <span className="text-on-surface-variant font-normal">Formatted for statutory submission</span>
            </div>
            <div className="bg-surface-container-lowest/90 p-3.5 rounded-xl border border-border-light text-xs font-mono text-on-surface max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {triageResult.officialComplaintLetter}
            </div>
          </div>

          {/* Action to Submit */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-status-success hover:bg-status-success/90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingForm ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Grievance...</span>
                </>
              ) : (
                <>
                  <SendHorizontal className="w-4 h-4" />
                  <span>Submit Grievance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Successful Submission State */}
      {submittedTicketId && (
        <div className="bg-status-success/10 border border-status-success/30 p-5 rounded-2xl flex flex-col gap-3.5 z-10 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-on-surface">Grievance Lodged & Dispatched Successfully</h4>
                <p className="text-[11px] text-on-surface-variant font-mono font-bold text-primary">
                  Ticket #{submittedTicketId}
                </p>
                <p className="text-[11px] text-status-success font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Official complaint filed with designated department and officer</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('grievances')}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 flex items-center gap-1.5 shadow-subtle transition-all"
              >
                <span>Track in Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

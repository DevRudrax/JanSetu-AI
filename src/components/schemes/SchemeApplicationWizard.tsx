import React, { useState, useEffect } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { WelfareScheme } from '../../types';
import { validateSchemeSubmissionWithGemini, SchemeSubmissionAuditResult } from '../../services/gemini';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { 
  Landmark, 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Building, 
  Check, 
  ChevronRight, 
  X, 
  Loader2, 
  Copy, 
  Download, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  KeyRound,
  FileSignature,
  Smartphone,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface SchemeApplicationWizardProps {
  scheme: WelfareScheme;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SchemeApplicationWizard: React.FC<SchemeApplicationWizardProps> = ({
  scheme,
  onClose,
  onSuccess,
}) => {
  const { currentCitizen, applyForScheme, appliedSchemeIds } = useCitizen();

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['5', '4', '9', '1', '8', '2']);
  const [otpSent, setOtpSent] = useState(true);
  const [resendTimer, setResendTimer] = useState(30);
  const [consentChecked, setConsentChecked] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStepMessage, setAuditStepMessage] = useState('');
  const [auditResult, setAuditResult] = useState<SchemeSubmissionAuditResult | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const isAlreadyApplied = appliedSchemeIds.includes(scheme.id);

  // OTP Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtpSent(true);
    setResendTimer(30);
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => {
      setOtp(['8', '9', '1', '0', '2', '4']);
    }, 1500);
  };

  // Perform Live Pre-Submission Audit with Gemini
  const handleExecuteSubmission = async () => {
    if (!consentChecked) return;
    setIsAuditing(true);

    const auditPhases = [
      'Authenticating UIDAI Aadhaar e-Sign token...',
      'Auditing Land Records & Income Threshold via AI...',
      'Validating NPCI Direct Benefit Transfer (DBT) Gateway...',
      'Generating Cryptographic SHA-256 Digital Certificate...'
    ];

    let phaseIdx = 0;
    setAuditStepMessage(auditPhases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx++;
      if (phaseIdx < auditPhases.length) {
        setAuditStepMessage(auditPhases[phaseIdx]);
      }
    }, 600);

    try {
      const fullOtp = otp.join('') || '549182';
      const result = await validateSchemeSubmissionWithGemini(currentCitizen, scheme, fullOtp);
      clearInterval(phaseInterval);
      setAuditResult(result);
      applyForScheme(scheme.id);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Submission failed:', error);
      clearInterval(phaseInterval);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyAppId = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(auditResult.applicationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Generate Official PDF Acknowledgement Slip using jsPDF
  const handleDownloadSlip = () => {
    if (!auditResult) return;

    const doc = new jsPDF();
    const appId = auditResult.applicationId;

    // Header Letterhead
    doc.setFillColor(0, 35, 111); // Navy
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('GOVERNMENT OF INDIA - DIGITAL PUBLIC INFRASTRUCTURE', 14, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Central Direct Benefit Transfer (DBT) Scheme Enrollment Acknowledgement`, 14, 22);
    doc.text(`JanSetu AI Platform Gateway • Ref: ${appId}`, 14, 28);

    // Body
    doc.setTextColor(25, 28, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL APPLICATION & E-SIGN REGISTRATION RECEIPT', 14, 44);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 48, 196, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Two column key-values
    doc.text(`Application Reference ID:`, 14, 56);
    doc.setFont('helvetica', 'bold');
    doc.text(appId, 80, 56);

    doc.setFont('helvetica', 'normal');
    doc.text(`Scheme Title:`, 14, 63);
    doc.setFont('helvetica', 'bold');
    doc.text(scheme.title, 80, 63);

    doc.setFont('helvetica', 'normal');
    doc.text(`Nodal Ministry:`, 14, 70);
    doc.text(scheme.ministry, 80, 70);

    doc.text(`Entitlement / Benefit Amount:`, 14, 77);
    doc.setFont('helvetica', 'bold');
    doc.text(scheme.benefitAmount, 80, 77);

    doc.setFont('helvetica', 'normal');
    doc.text(`Applicant Name:`, 14, 84);
    doc.text(currentCitizen.name, 80, 84);

    doc.text(`Aadhaar Number (Masked):`, 14, 91);
    doc.text(`XXXX-XXXX-8912 (UIDAI e-KYC Verified)`, 80, 91);

    doc.text(`State & District:`, 14, 98);
    doc.text(`${currentCitizen.district}, ${currentCitizen.state}`, 80, 98);

    doc.text(`Occupation / Category:`, 14, 105);
    doc.text(`${currentCitizen.occupation} • ${currentCitizen.socialCategory} • ${currentCitizen.areaType}`, 80, 105);

    doc.text(`Disbursal Bank Account:`, 14, 112);
    doc.text(`${auditResult.disbursalAccountDetails.bankName} (A/c: ${auditResult.disbursalAccountDetails.accountMasked})`, 80, 112);

    doc.text(`NPCI APB Seeding Status:`, 14, 119);
    doc.text(auditResult.disbursalAccountDetails.dbtStatus, 80, 119);

    doc.text(`Digital e-Sign Token (SHA-256):`, 14, 126);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.text(auditResult.digitalSignatureHash, 80, 126);

    doc.line(14, 132, 196, 132);

    // Compliance Audit Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('AI PRE-SUBMISSION COMPLIANCE AUDIT RECORD', 14, 140);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');

    let yPos = 148;
    auditResult.complianceChecks.forEach((check) => {
      doc.text(`[PASSED]  ${check.rule}: ${check.detail}`, 14, yPos);
      yPos += 7;
    });

    // Milestones
    yPos += 4;
    doc.line(14, yPos, 196, yPos);
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('NEXT STATUTORY VERIFICATION MILESTONES', 14, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    auditResult.milestones.forEach((m, idx) => {
      doc.text(`${idx + 1}. ${m.title} (${m.authority}) - Expected: ${m.timeline}`, 14, yPos);
      yPos += 6.5;
    });

    // Footer
    yPos += 10;
    doc.setFillColor(242, 244, 246);
    doc.rect(14, yPos, 182, 22, 'F');
    doc.setFontSize(8);
    doc.setTextColor(68, 70, 81);
    doc.text('This is an electronically generated and digitally signed acknowledgement slip from the JanSetu AI GovTech platform.', 18, yPos + 8);
    doc.text('You can track your application status anytime using your Application ID at https://jansetu.gov.in/track', 18, yPos + 15);

    doc.save(`Acknowledgement_${appId}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-border-light rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-border-light bg-primary text-on-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-tertiary-fixed shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed block">
                SCHEME APPLICATION CO-PILOT
              </span>
              <h3 className="font-bold font-display text-base text-white truncate max-w-md">
                {scheme.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 pt-5 pb-3 bg-surface-container-low/60 border-b border-border-light flex justify-between items-center text-xs">
          {[1, 2, 3, 4].map(s => {
            const isPassed = step > s || auditResult !== null;
            const isCurrent = step === s && auditResult === null;

            return (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] transition-all ${
                    isPassed
                      ? 'bg-status-success text-white'
                      : isCurrent
                      ? 'bg-primary text-on-primary ring-2 ring-primary/30'
                      : 'bg-surface-container-highest text-on-surface-variant'
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span
                  className={`hidden sm:inline font-semibold ${
                    isCurrent ? 'text-primary' : isPassed ? 'text-status-success' : 'text-on-surface-variant'
                  }`}
                >
                  {s === 1 ? 'e-KYC' : s === 2 ? 'Documents' : s === 3 ? 'Bank DBT' : 'Submit'}
                </span>
                {s < 4 && <ChevronRight className="w-3.5 h-3.5 text-outline-variant hidden sm:inline" />}
              </div>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: e-KYC */}
          {step === 1 && !auditResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/20 flex items-center gap-3.5">
                <ShieldCheck className="w-7 h-7 text-status-success shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Aadhaar Biometric e-KYC Authenticated</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    UIDAI verified for {currentCitizen.name} (Aadhaar: XXXX-XXXX-8912)
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-4 border border-border-light space-y-3">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Confirmed Demographic Profile
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">State & District</span>
                    <span className="font-semibold text-on-surface">{currentCitizen.district}, {currentCitizen.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Occupation</span>
                    <span className="font-semibold text-on-surface">{currentCitizen.occupation} ({currentCitizen.areaType})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Social Category</span>
                    <span className="font-semibold text-on-surface">{currentCitizen.socialCategory}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Annual Income</span>
                    <span className="font-semibold text-on-surface">₹{currentCitizen.annualIncome.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">Landholding</span>
                    <span className="font-semibold text-on-surface">{currentCitizen.landholdingAcres} Acres</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block">KCC Active</span>
                    <span className="font-semibold text-status-success">{currentCitizen.kisanCreditCard ? 'Yes (Linked)' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Documents */}
          {step === 2 && !auditResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-on-surface">
                  DigiLocker Document Verification Checklist
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-fixed text-primary">
                  100% DPI Synced
                </span>
              </div>

              <div className="space-y-2.5">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-container-low border border-border-light flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-on-surface block">{doc}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          Verified from State Digital Repository
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-status-success/10 text-status-success text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Fetched
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Bank DBT */}
          {step === 3 && !auditResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-border-light space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">
                      NPCI Direct Benefit Transfer (DBT) Seeding
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">Aadhaar Payment Bridge (APB) Linkage</p>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  The sanctioned financial entitlement of <strong className="text-on-surface">{scheme.benefitAmount}</strong> will be deposited directly into your Aadhaar-linked savings account:
                </p>

                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-border-light space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-sans">Bank Name:</span>
                    <span className="font-bold text-on-surface">State Bank of India</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-sans">Account No:</span>
                    <span className="font-bold text-on-surface">XXXXXXXX4912</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-sans">IFSC Code:</span>
                    <span className="font-bold text-on-surface">SBIN0004128 (Karnal Main Branch)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant font-sans">DBT Status:</span>
                    <span className="font-bold text-status-success">ACTIVE & NPCI MAPPED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Submit Phase with Actual e-Sign & AI Pre-submission Logic */}
          {step === 4 && !auditResult && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Application Summary Box */}
              <div className="p-4 rounded-2xl bg-primary-fixed/20 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    e-Sign & Submission Review
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant">
                    Applicant: {currentCitizen.name}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-on-surface">{scheme.title}</h4>
                <p className="text-xs text-on-surface-variant">
                  Benefit Amount: <strong className="text-primary font-bold">{scheme.benefitAmount}</strong> • Nodal Authority: {scheme.ministry}
                </p>
              </div>

              {/* Aadhaar OTP Authentication UI */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-border-light space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface">
                      Enter 6-Digit Aadhaar OTP for e-Sign
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Sent to mobile ending in <strong>...8912</strong>
                  </span>
                </div>

                {/* 6-Digit OTP Boxes */}
                <div className="flex justify-center gap-2 sm:gap-3 py-1">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      className="w-10 h-12 text-center text-base font-bold font-mono bg-surface-container-lowest border-2 border-border-light rounded-xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all text-on-surface"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="text-[11px] text-secondary hover:underline font-semibold disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP SMS'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtp(['5', '4', '9', '1', '8', '2'])}
                    className="text-[11px] text-primary font-bold hover:underline"
                  >
                    Auto-Fill Demo OTP
                  </button>
                </div>
              </div>

              {/* Citizen Legal Consent Checkbox */}
              <label className="flex items-start gap-3 p-3 rounded-2xl bg-surface-container-low border border-border-light cursor-pointer hover:bg-surface-container transition-colors">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary mt-0.5 shrink-0"
                />
                <span className="text-[11px] text-on-surface-variant leading-relaxed">
                  I hereby declare under the IT Act 2000 that all submitted information is accurate. I authorize JanSetu AI and the Nodal Ministry to process my Aadhaar e-KYC and Direct Benefit Transfer seeding for scheme disbursement.
                </span>
              </label>

              {/* In-Flight Live AI Audit Loading State */}
              {isAuditing && (
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center justify-center gap-2.5 text-center animate-in fade-in duration-150">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs font-bold text-primary">{auditStepMessage}</p>
                  <span className="text-[10px] text-on-surface-variant">
                    Executing live AI compliance audit & digital certificate generation...
                  </span>
                </div>
              )}
            </div>
          )}

          {/* APPLICATION REGISTERED & ACKNOWLEDGEMENT (SUCCESSFUL RESULT) */}
          {auditResult && (
            <div className="space-y-5 animate-in zoom-in-95 duration-200">
              {/* Success Banner */}
              <div className="p-4 rounded-2xl bg-status-success/10 border border-status-success/30 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-status-success text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-on-surface">
                      Scheme Application e-Signed & Registered!
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-status-success text-white text-[9px] font-bold uppercase tracking-wider">
                      DPI Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                    {auditResult.sanctionRemarks}
                  </p>
                </div>
              </div>

              {/* Application Details Card */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-border-light space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border-light">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Sanction Tracking ID
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-sm text-primary">
                      {auditResult.applicationId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAppId}
                      className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                      title="Copy Application ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-on-surface-variant space-y-1">
                  <p className="text-[10px] text-outline font-sans">Digital Signature Certificate:</p>
                  <p className="text-[10px] truncate bg-surface-container-lowest p-2 rounded-lg border border-border-light/60">
                    {auditResult.digitalSignatureHash}
                  </p>
                </div>

                {/* Compliance Checks Passed */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-on-surface block">
                    AI Pre-Submission Compliance Checks:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {auditResult.complianceChecks.map((check, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-surface-container-lowest border border-border-light text-[11px] flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-on-surface block">{check.rule}</span>
                          <span className="text-[10px] text-on-surface-variant">{check.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Administrative Next Steps Milestones */}
              <div className="bg-surface-container-low rounded-2xl p-4 border border-border-light space-y-2.5">
                <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Statutory Administrative Progression
                </span>
                <div className="space-y-2">
                  {auditResult.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-surface-container-lowest border border-border-light">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          m.status === 'COMPLETED' ? 'bg-status-success text-white' : 'bg-surface-container-high text-on-surface-variant'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface block">{m.title}</span>
                          <span className="text-[10px] text-on-surface-variant">{m.authority}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-primary font-mono">{m.timeline}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Official Receipt Button */}
              <button
                type="button"
                onClick={handleDownloadSlip}
                className="w-full py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-tertiary-fixed" />
                <span>Download Official PDF Acknowledgement Slip</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-border-light bg-surface-container-low/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            {auditResult ? 'Close Window' : 'Cancel'}
          </button>

          {!auditResult ? (
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev - 1)}
                  disabled={isAuditing}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                >
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5"
                >
                  <span>Proceed to Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleExecuteSubmission}
                  disabled={isAuditing || !consentChecked}
                  className="px-6 py-2 text-xs font-bold rounded-xl bg-status-success text-white shadow-md hover:bg-status-success/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditing with AI...</span>
                    </>
                  ) : (
                    <>
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>Verify & e-Sign Application</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-status-success text-white font-bold text-xs shadow-md hover:bg-status-success/90 transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

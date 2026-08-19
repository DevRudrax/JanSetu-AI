import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { GrievanceCard } from '../bento/GrievanceCard';
import { Grievance } from '../../types';
import { jsPDF } from 'jspdf';
import { 
  MessageSquareWarning, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  FileDown, 
  Plus, 
  Filter, 
  Search, 
  Bot,
  ChevronRight,
  ShieldCheck,
  Check,
  Flame,
  ArrowRight,
  Mail
} from 'lucide-react';

export const GrievanceView: React.FC = () => {
  const { grievances, currentCitizen, globalSearchQuery, setGlobalSearchQuery } = useCitizen();
  const { t } = useLanguage();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubmitCard, setShowSubmitCard] = useState(false);
  const [selectedGrievanceForDetail, setSelectedGrievanceForDetail] = useState<Grievance | null>(null);

  // Sync globalSearchQuery if routed from Universal Search
  React.useEffect(() => {
    if (globalSearchQuery) {
      setSearchQuery(globalSearchQuery);
      // If search query looks like an intent to file a complaint, open form
      if (globalSearchQuery.length > 10) {
        setShowSubmitCard(true);
      }
      setGlobalSearchQuery('');
    }
  }, [globalSearchQuery]);

  const filteredGrievances = grievances.filter(grv => {
    const matchesStatus = selectedStatus === 'All' || grv.status === selectedStatus;
    const matchesSearch = 
      grv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grv.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grv.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grv.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDownloadPdf = (grv: Grievance) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GOVERNMENT OF INDIA - CPGRAMS / JANSETU AI', 14, 20);
    doc.setFontSize(12);
    doc.text('OFFICIAL CIVIC GRIEVANCE LODGEMENT RECORD', 14, 28);
    doc.setLineWidth(0.5);
    doc.line(14, 32, 196, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Ticket Reference ID: ${grv.id}`, 14, 40);
    doc.text(`CPGRAMS Tracking Code: ${grv.publicTrackingCode}`, 14, 46);
    doc.text(`Date & Time Logged: ${new Date(grv.submittedAt).toLocaleString('en-IN')}`, 14, 52);
    doc.text(`Citizen Name: ${currentCitizen.name}`, 14, 58);
    doc.text(`Reported Location: ${grv.location}`, 14, 64);
    doc.text(`Assigned Department: ${grv.department}`, 14, 70);
    doc.text(`Designated Officer: ${grv.designatedOfficer}`, 14, 76);
    doc.text(`Urgency Assessment: ${grv.urgency}`, 14, 82);

    doc.line(14, 86, 196, 86);
    doc.setFont('helvetica', 'bold');
    doc.text('SUBJECT & FORMAL COMPLAINT DRAFT:', 14, 94);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(grv.officialLetterDraft, 180);
    doc.text(splitText, 14, 102);

    doc.save(`${grv.id}_CPGRAMS_Official_Record.pdf`);
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-8 py-8 gap-8 max-w-[1500px] mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-light pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-[2px] bg-primary"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              CPGRAMS Integrated Civic Redirection
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-4xl text-on-surface tracking-tight">
            Smart Grievance & Civic Redressal Portal
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5 max-w-2xl">
            Submit, track, and monitor civic breakdown reports. JanSetu AI automatically assesses hazard severity, categorizes infrastructure faults, and dispatches directly to municipal nodal engineers.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowSubmitCard(!showSubmitCard)}
          className="px-5 py-3 rounded-2xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{showSubmitCard ? 'Hide Submission Form' : 'Log New Civic Grievance'}</span>
        </button>
      </div>

      {/* Conditionally Rendered Submission Form */}
      {showSubmitCard && (
        <div className="w-full bg-surface-container-low/40 p-4 sm:p-6 rounded-3xl border border-primary/20 animate-in fade-in duration-200">
          <GrievanceCard />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {['All', 'In Progress', 'AI Triaged', 'Department Assigned', 'Resolved'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedStatus === st
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-lowest hover:bg-surface-container border border-border-light text-on-surface'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tickets, roads, departments..."
            className="w-full bg-surface-container-lowest border border-border-light rounded-xl pl-9 pr-3.5 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50"
          />
        </div>
      </div>

      {/* Active Grievances List */}
      <div className="space-y-6">
        {filteredGrievances.length === 0 ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-border-light space-y-3">
            <MessageSquareWarning className="w-10 h-10 text-outline mx-auto" />
            <p className="text-sm font-bold text-on-surface">No grievances found matching criteria.</p>
            <button
              onClick={() => setShowSubmitCard(true)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Click here to log a new complaint
            </button>
          </div>
        ) : (
          filteredGrievances.map(grv => {
            const stages: Array<'Submitted' | 'AI Triaged' | 'Department Assigned' | 'In Progress' | 'Resolved'> = [
              'Submitted',
              'AI Triaged',
              'Department Assigned',
              'In Progress',
              'Resolved'
            ];

            const currentStageIndex = stages.indexOf(grv.status as any);

            return (
              <div
                key={grv.id}
                className="bg-surface-container-lowest border border-border-light rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-elevated transition-all flex flex-col gap-5 relative overflow-hidden"
              >
                {/* Status colored accent left stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  grv.status === 'Resolved' ? 'bg-status-success' :
                  grv.urgency === 'High' ? 'bg-status-error' : 'bg-status-warning'
                }`}></div>

                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-md">
                        {grv.id}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
                        {grv.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        grv.urgency === 'High' ? 'bg-error-container text-on-error-container' : 'bg-status-warning/20 text-status-warning'
                      }`}>
                        Urgency: {grv.urgency}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-on-surface">
                      {grv.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <a
                      href={`mailto:jonrad.studios@gmail.com?subject=${encodeURIComponent(`[CPGRAMS / JanSetu AI #${grv.id}] ${grv.title}`)}&body=${encodeURIComponent(
                        `CITIZEN GRIEVANCE LODGEMENT RECORD\n\n` +
                        `• Ticket ID: ${grv.id}\n` +
                        `• Tracking Code: ${grv.publicTrackingCode}\n` +
                        `• Citizen Applicant: ${currentCitizen.name}\n` +
                        `• Location: ${grv.location}\n` +
                        `• Department: ${grv.department} (${grv.designatedOfficer})\n\n` +
                        `OFFICIAL COMPLAINT LETTER\n\n` +
                        `${grv.officialLetterDraft}\n\n` +
                        `Dispatched via JanSetu AI Citizen DPI Portal`
                      )}`}
                      className="px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/5 text-xs font-semibold text-primary hover:bg-primary/10 flex items-center gap-1.5 transition-colors"
                      title="Email to Nodal Authority (jonrad.studios@gmail.com)"
                    >
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span>Email Authority</span>
                    </a>

                    <button
                      onClick={() => handleDownloadPdf(grv)}
                      className="px-3 py-1.5 rounded-xl border border-border-light text-xs font-semibold text-on-surface hover:bg-surface-container flex items-center gap-1.5 transition-colors"
                      title="Download Official PDF Letter"
                    >
                      <FileDown className="w-3.5 h-3.5 text-primary" />
                      <span>PDF Record</span>
                    </button>
                  </div>
                </div>

                {/* Photo & Description Row */}
                <div className="flex flex-col md:flex-row gap-5 items-start">
                  {grv.imageUrl && (
                    <div className="w-full md:w-56 h-36 rounded-2xl overflow-hidden relative shadow-sm border border-border-light shrink-0">
                      <img
                        src={grv.imageUrl}
                        alt={grv.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-status-error" />
                        <span className="truncate max-w-[140px]">{grv.location}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-3">
                    <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                      {grv.description}
                    </p>

                    <div className="p-3 bg-surface-container-low rounded-2xl border border-border-light flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-on-surface">{grv.department}</span>
                        <span className="text-[11px] text-on-surface-variant">Officer in Charge: {grv.designatedOfficer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Stage Visual Stepper Timeline */}
                <div className="pt-4 border-t border-border-light">
                  <div className="relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-3 left-4 right-4 h-0.5 bg-surface-container-highest -z-0"></div>

                    {/* Steps */}
                    <div className="flex justify-between relative z-10 text-center">
                      {stages.map((stage, idx) => {
                        const isDone = idx <= currentStageIndex;
                        const isCurrent = idx === currentStageIndex;

                        return (
                          <div key={stage} className="flex flex-col items-center gap-1.5 w-20">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                                isDone
                                  ? 'bg-status-success text-white ring-4 ring-surface-container-lowest'
                                  : 'bg-surface-container-highest text-on-surface-variant ring-4 ring-surface-container-lowest'
                              } ${isCurrent && grv.status !== 'Resolved' ? 'animate-pulse ring-status-warning' : ''}`}
                            >
                              {isDone ? <Check className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className={`text-[10px] font-semibold leading-tight ${
                              isDone ? 'text-on-surface' : 'text-outline'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

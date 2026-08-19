import React, { useState } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { ProfileModal } from '../layout/ProfileModal';
import { SchemeApplicationWizard } from '../schemes/SchemeApplicationWizard';
import { WelfareScheme } from '../../types';
import { 
  Bot, 
  Landmark, 
  Edit3, 
  Rocket, 
  CheckCircle2, 
  Building
} from 'lucide-react';

export const SchemeMatcherCard: React.FC = () => {
  const { currentCitizen, schemes, appliedSchemeIds, setActiveView } = useCitizen();
  const { t } = useLanguage();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedSchemeForWizard, setSelectedSchemeForWizard] = useState<WelfareScheme | null>(null);

  // Filter or sort top 2 matching schemes for active citizen
  const topMatches = schemes.slice(0, 2);

  const handleOpenWizard = (scheme: WelfareScheme) => {
    setSelectedSchemeForWizard(scheme);
  };

  return (
    <>
      <div className="bg-primary text-on-primary shadow-xl rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
        {/* Background gradient & decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none"></div>
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex justify-between items-start z-10 mb-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
              <Landmark className="w-4 h-4 text-tertiary-fixed" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary-fixed">
                AI Eligibility Engine
              </span>
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-on-primary">
              {t('citizenCopilotTitle')}
            </h2>
            <p className="text-xs text-primary-fixed-dim mt-0.5">
              {t('personalizedMatches')}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-tertiary-fixed shrink-0">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        {/* Profile Summary Badge */}
        <div className="bg-primary-container/60 border border-white/10 p-3.5 rounded-2xl mb-5 z-10 flex justify-between items-center backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-wider text-primary-fixed">
              {t('activeProfile')}
            </span>
            <span className="text-xs font-semibold text-on-primary mt-0.5">
              {currentCitizen.name} • {currentCitizen.state} • ₹{(currentCitizen.annualIncome / 100000).toFixed(1)}L/yr
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-tertiary-fixed hover:text-white flex items-center justify-center transition-colors shrink-0"
            title="Edit Profile Demographics"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Top Matches List */}
        <div className="flex flex-col gap-3 z-10 flex-1">
          {topMatches.map(scheme => {
            const isApplied = appliedSchemeIds.includes(scheme.id);
            return (
              <div
                key={scheme.id}
                onClick={() => handleOpenWizard(scheme)}
                className="bg-primary-container/80 hover:bg-primary-container border border-white/10 p-3.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-primary truncate">
                      {scheme.title}
                    </span>
                    {isApplied && (
                      <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-bold">
                        Enrolled
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-primary-fixed-dim mt-0.5 truncate">
                    {scheme.benefitAmount} • {scheme.category}
                  </span>
                </div>

                {/* Match percentage meter */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display font-bold text-lg text-tertiary-fixed">
                    {scheme.matchScore}%
                  </span>
                  <div className="w-8 h-8 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-white/20"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-tertiary-fixed"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray={`${scheme.matchScore}, 100`}
                        strokeWidth="3.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (topMatches[0]) handleOpenWizard(topMatches[0]);
            else setActiveView('schemes');
          }}
          className="mt-5 w-full bg-white text-primary font-bold text-xs sm:text-sm py-3.5 rounded-2xl shadow-lg hover:bg-primary-fixed transition-all flex items-center justify-center gap-2 z-10 group"
        >
          <Rocket className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span>{t('applyWithCopilot')}</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Unified Scheme Application Co-Pilot Wizard with Live Gemini e-Sign & Audit */}
      {selectedSchemeForWizard && (
        <SchemeApplicationWizard
          scheme={selectedSchemeForWizard}
          onClose={() => setSelectedSchemeForWizard(null)}
        />
      )}
    </>
  );
};

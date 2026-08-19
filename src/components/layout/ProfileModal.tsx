import React, { useState, useEffect } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { 
  User, 
  Edit3, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  X, 
  CheckCircle2, 
  Loader2
} from 'lucide-react';
import { CitizenProfile } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentCitizen, updateCitizenProfile, isSavingProfile } = useCitizen();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CitizenProfile>(currentCitizen);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setEditForm(currentCitizen);
  }, [currentCitizen]);

  if (!isOpen) return null;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCitizenProfile(editForm);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-border-light bg-surface-container-low/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-base">Citizen Profile Attributes</h3>
              <p className="text-xs text-on-surface-variant">Manage your demographic and socio-economic criteria for welfare matching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Active Citizen Demographics Attributes Header */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              ACTIVE PROFILE ATTRIBUTES
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              {isEditing ? 'Cancel Edit' : 'Edit Attributes'}
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Profile attributes saved and synced successfully!</span>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 bg-surface-container-low/50 p-4 rounded-xl border border-border-light">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={e => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">District</label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={e => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Occupation</label>
                  <select
                    value={editForm.occupation}
                    onChange={e => setEditForm({ ...editForm, occupation: e.target.value as any })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Student">Student</option>
                    <option value="Small Business Owner">Small Business Owner</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Artisan / Worker">Artisan / Worker</option>
                    <option value="Healthcare Worker">Healthcare Worker</option>
                    <option value="Homemaker">Homemaker</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Annual Income (₹)</label>
                  <input
                    type="number"
                    value={editForm.annualIncome}
                    onChange={e => setEditForm({ ...editForm, annualIncome: Number(e.target.value) })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                    step={10000}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Area Type</label>
                  <select
                    value={editForm.areaType}
                    onChange={e => setEditForm({ ...editForm, areaType: e.target.value as any })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="Rural">Rural</option>
                    <option value="Urban">Urban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Social Category</label>
                  <select
                    value={editForm.socialCategory}
                    onChange={e => setEditForm({ ...editForm, socialCategory: e.target.value as any })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">Landholding (Acres)</label>
                  <input
                    type="number"
                    value={editForm.landholdingAcres}
                    onChange={e => setEditForm({ ...editForm, landholdingAcres: Number(e.target.value) })}
                    className="w-full bg-surface-container-lowest border border-border-light rounded-lg px-2.5 py-1.5 text-xs text-on-surface"
                    step={0.5}
                  />
                </div>
              </div>

              {/* Additional DPI Checkboxes */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-light/60">
                <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.aadhaarLinked}
                    onChange={e => setEditForm({ ...editForm, aadhaarLinked: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Aadhaar Verified</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.digilockerSynced}
                    onChange={e => setEditForm({ ...editForm, digilockerSynced: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>DigiLocker Synced</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.bplCard}
                    onChange={e => setEditForm({ ...editForm, bplCard: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>BPL Card Holder</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-on-surface cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.kisanCreditCard}
                    onChange={e => setEditForm({ ...editForm, kisanCreditCard: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Kisan Credit Card (KCC)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-on-primary shadow-sm hover:bg-primary/90 flex items-center gap-1.5"
                >
                  {isSavingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-surface-container-low/50 rounded-xl p-4 border border-border-light grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-on-surface-variant">Location</p>
                  <p className="text-xs font-semibold text-on-surface">{currentCitizen.district}, {currentCitizen.state}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-on-surface-variant">Occupation</p>
                  <p className="text-xs font-semibold text-on-surface">{currentCitizen.occupation} ({currentCitizen.areaType})</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-on-surface-variant">Annual Income</p>
                  <p className="text-xs font-semibold text-on-surface">₹{currentCitizen.annualIncome.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-on-surface-variant">Aadhaar & DigiLocker</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {currentCitizen.aadhaarLinked && currentCitizen.digilockerSynced ? 'Verified & Linked' : 'Partially Linked'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant">Social Category</p>
                <p className="text-xs font-semibold text-on-surface">{currentCitizen.socialCategory}</p>
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant">Landholding</p>
                <p className="text-xs font-semibold text-on-surface">{currentCitizen.landholdingAcres} Acres</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-light bg-surface-container-low/30 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

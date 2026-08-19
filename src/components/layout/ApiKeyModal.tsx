import React, { useState } from 'react';
import { getStoredApiKey, setStoredApiKey, getGenAIClient, generateContentWithGemini } from '../../services/gemini';
import { KeyRound, CheckCircle2, AlertCircle, Bot, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setStoredApiKey(apiKey);
    setTesting(true);
    setTestResult(null);

    try {
      const reply = await generateContentWithGemini('Respond with "Connected" in 1 word.');
      setTestResult({
        success: true,
        message: `Gemini AI Engine successfully authenticated & active (${reply.trim()})!`
      });
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: err?.message || 'Failed to authenticate with AI Engine. Key saved for client calls.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-border-light bg-surface-container-low/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-base">AI Engine Configuration</h3>
              <p className="text-xs text-on-surface-variant">Central GovTech Intelligence Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-1.5">
              AI Engine API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your AI API key..."
                className="w-full bg-surface-container-low border border-border-light rounded-xl px-3.5 py-2.5 text-sm font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              Configured from environment variables or custom input. All features (Multimodal Grievance Triage, Welfare Eligibility, Circular Simplifier, RTI Drafter) execute live.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${
                testResult.success
                  ? 'bg-status-success/10 text-status-success border border-status-success/20'
                  : 'bg-error-container/40 text-on-error-container border border-error-container'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-secondary shrink-0" />
            <span className="text-xs text-on-surface">
              Engine Status: <strong className="font-semibold text-primary">High-Speed Multimodal + Vernacular Audio</strong>
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-light bg-surface-container-low/30 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={testing}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-on-primary shadow-sm hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {testing ? 'Testing Connection...' : 'Save & Verify Key'}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { INITIAL_CITIZENS } from '../../services/dummyData';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Landmark, 
  FileCheck2, 
  Cpu, 
  KeyRound,
  ArrowLeft,
  Loader2,
  X,
  UserPlus,
  LogIn,
  AlertTriangle,
  LockKeyhole
} from 'lucide-react';
import { Language } from '../../types';

export const LoginPage: React.FC = () => {
  const { 
    signIn, 
    signUp, 
    resetPassword,
    isLoading 
  } = useAuth();
  const { currentLanguage, setLanguage, languages } = useLanguage();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState('Varanasi');
  const [selectedOccupation, setSelectedOccupation] = useState<'Farmer' | 'Student' | 'Small Business Owner' | 'Senior Citizen' | 'Artisan / Worker' | 'Healthcare Worker' | 'Unemployed' | 'Homemaker'>('Senior Citizen');
  const [selectedPresetForSignup, setSelectedPresetForSignup] = useState<string>('c-4');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'error' | 'success' } | null>(null);

  // Email format validation
  const isEmailValid = useMemo(() => {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak (min 8 chars)', color: 'bg-red-500 text-red-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Moderate', color: 'bg-amber-500 text-amber-500' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500 text-emerald-500' };
  }, [password]);

  const triggerErrorToast = (title: string, desc: string) => {
    setFormError(desc);
    setToastMessage({ title, desc, type: 'error' });
    setShowToast(true);
  };

  const triggerSuccessToast = (title: string, desc: string) => {
    setFormSuccess(desc);
    setToastMessage({ title, desc, type: 'success' });
    setShowToast(true);
  };

  // Handle Sign In Submit
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setShowToast(false);

    if (!email.trim() || !password.trim()) {
      triggerErrorToast('Missing Credentials', 'Please enter both your email address and password to sign in.');
      return;
    }

    if (!isEmailValid) {
      triggerErrorToast('Invalid Email Format', 'Please enter a valid email format (e.g. name@example.com).');
      return;
    }

    const res = await signIn(email, password);
    if (!res.success) {
      const errorText = res.error || 'No account exists with this email address or the password was incorrect.';
      triggerErrorToast('Sign In Failed', errorText);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setShowToast(false);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      triggerErrorToast('Missing Information', 'Please complete all required fields to register.');
      return;
    }

    if (!isEmailValid) {
      triggerErrorToast('Invalid Email Format', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      triggerErrorToast('Weak Password', 'Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      triggerErrorToast('Password Mismatch', 'The passwords you entered do not match. Please verify and try again.');
      return;
    }

    const preset = INITIAL_CITIZENS.find(c => c.id === selectedPresetForSignup) || INITIAL_CITIZENS[3];
    const initialAttributes = {
      state: selectedState,
      district: selectedDistrict,
      occupation: selectedOccupation,
      annualIncome: preset.annualIncome,
      areaType: preset.areaType,
      socialCategory: preset.socialCategory,
      landholdingAcres: preset.landholdingAcres,
      aadhaarLinked: true,
      digilockerSynced: true,
    };

    const res = await signUp(email, password, fullName, initialAttributes);
    if (!res.success) {
      triggerErrorToast('Registration Failed', res.error || 'The email may already be in use. Please sign in instead.');
    } else {
      triggerSuccessToast('Account Created', 'Your citizen account was registered successfully! Logging you in...');
    }
  };

  // Handle Password Recovery Submit
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setShowToast(false);

    if (!email.trim() || !isEmailValid) {
      triggerErrorToast('Invalid Email', 'Please enter a valid email address to receive password recovery instructions.');
      return;
    }

    const res = await resetPassword(email);
    if (res.success) {
      triggerSuccessToast('Email Dispatched', res.message || `Password recovery link dispatched to ${email}.`);
    } else {
      triggerErrorToast('Recovery Error', res.error || 'Failed to dispatch password recovery link.');
    }
  };

  // Helper to switch to Create Account with email prefilled
  const handleSwitchToSignUp = () => {
    setFormError(null);
    setFormSuccess(null);
    setShowToast(false);
    setMode('signup');
  };

  // Helper to switch to Sign In with email prefilled
  const handleSwitchToSignIn = () => {
    setFormError(null);
    setFormSuccess(null);
    setShowToast(false);
    setMode('signin');
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between relative overflow-hidden selection:bg-primary selection:text-on-primary">
      {/* Ambient background lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP-CENTER FLOATING TOAST NOTIFICATION */}
      {showToast && toastMessage && (
        <div 
          className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[94%] sm:w-full transition-all duration-300 shadow-2xl"
          role="alert"
        >
          <div className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3.5 ${
            toastMessage.type === 'error'
              ? 'bg-[#b91c1c] text-white border-red-400 shadow-red-950/40'
              : 'bg-[#047857] text-white border-emerald-400 shadow-emerald-950/40'
          }`}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-white" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-black text-white tracking-tight">
                {toastMessage.title}
              </h4>
              <p className="text-xs text-white/90 mt-0.5 leading-relaxed font-medium">
                {toastMessage.desc}
              </p>
              {mode === 'signin' && toastMessage.type === 'error' && (
                <button
                  type="button"
                  onClick={handleSwitchToSignUp}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-700 font-bold text-xs shadow hover:bg-white/90 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account with {email || 'this email'}</span>
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-4 flex items-center justify-between border-b border-border-light/40 bg-surface/80 backdrop-blur-md">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-on-primary font-black text-lg shadow-md shadow-primary/20">
            JS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-on-surface tracking-tight">
                JanSetu <span className="text-primary">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-fixed text-primary border border-primary/20">
                National DPI
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">
              AI-Powered Citizen Governance & Welfare Delivery
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="relative flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-full border border-border-light text-xs font-medium">
            <Globe className="w-3.5 h-3.5 text-secondary shrink-0" />
            <select
              value={currentLanguage}
              onChange={e => setLanguage(e.target.value as Language)}
              className="bg-transparent border-none text-xs font-semibold text-on-surface cursor-pointer focus:outline-none pr-1"
              aria-label="Select Language"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-surface-container-lowest text-on-surface">
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Branding (LG Screens) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold w-fit">
              Unified Citizen Digital Public Infrastructure
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl xl:text-4xl font-black text-on-surface tracking-tight leading-tight">
                Empowering every citizen with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-indigo-500">Autonomous AI Governance</span>
              </h1>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Seamlessly discover eligible welfare schemes, automatically draft grievance filings with legal citations, generate RTI requests, and manage citizen demographic attributes in real-time.
              </p>
            </div>

            {/* Feature Bento Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-border-light/60 backdrop-blur-sm space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-xs text-on-surface">650+ Welfare Schemes</h2>
                <p className="text-[11px] text-on-surface-variant">Instant matching based on your live profile attributes.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-border-light/60 backdrop-blur-sm space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-xs text-on-surface">DigiLocker & Aadhaar</h2>
                <p className="text-[11px] text-on-surface-variant">Cryptographic attribute verification & fast sync.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-border-light/60 backdrop-blur-sm space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-xs text-on-surface">Gemini Multimodal AI</h2>
                <p className="text-[11px] text-on-surface-variant">Voice grievances in 8 Indian regional languages.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-low/70 border border-border-light/60 backdrop-blur-sm space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <LockKeyhole className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-xs text-on-surface">256-Bit DPI Encryption</h2>
                <p className="text-[11px] text-on-surface-variant">DPDP compliant enterprise citizen data isolation.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Secure Auth Card */}
          <div className="w-full lg:col-span-6 max-w-md mx-auto">
            <div className="bg-surface-container-lowest/95 backdrop-blur-xl border border-border-light rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/10 relative overflow-hidden">
              
              {/* Top Auth Mode Tabs */}
              {mode !== 'forgot' && (
                <div className="flex bg-surface-container-low p-1 rounded-2xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setFormError(null); setFormSuccess(null); setShowToast(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      mode === 'signin'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setFormError(null); setFormSuccess(null); setShowToast(false); }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      mode === 'signup'
                        ? 'bg-surface-container-lowest text-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Title & Description */}
              <div className="mb-5">
                {mode === 'signin' && (
                  <>
                    <h3 className="text-xl font-black text-on-surface tracking-tight">Citizen Sign In</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Enter your email and password to access your governance dashboard.
                    </p>
                  </>
                )}
                {mode === 'signup' && (
                  <>
                    <h3 className="text-xl font-black text-on-surface tracking-tight">Register Citizen Profile</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Create your DPI identity for automated scheme eligibility matching.
                    </p>
                  </>
                )}
                {mode === 'forgot' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setMode('signin'); setFormError(null); setFormSuccess(null); setShowToast(false); }}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Sign In
                    </button>
                    <h3 className="text-xl font-black text-on-surface tracking-tight">Password Recovery</h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Enter your registered email to receive an official password reset link.
                    </p>
                  </>
                )}
              </div>

              {/* In-Card Prominent Error Notification Box */}
              {formError && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-500/40 text-on-surface">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-red-600 dark:text-red-400">Authentication Error</p>
                      <p className="text-xs text-red-800 dark:text-red-200 mt-1 leading-relaxed font-medium">
                        {formError}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Button */}
                  {mode === 'signin' && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/60 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSwitchToSignUp}
                        className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Create Account instead</span>
                      </button>
                    </div>
                  )}

                  {mode === 'signup' && formError.toLowerCase().includes('already exists') && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-900/60 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSwitchToSignIn}
                        className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In to existing account</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* In-Card Success Notification Box */}
              {formSuccess && (
                <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 text-on-surface flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Success</p>
                    <p className="text-xs text-emerald-800 dark:text-emerald-200 mt-1 leading-relaxed font-medium">
                      {formSuccess}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 1: Sign In Form */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        formError ? 'text-red-500' : 'text-outline'
                      }`} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="citizen@domain.gov.in"
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none ${
                          formError 
                            ? 'border-red-500 ring-2 ring-red-500/20' 
                            : email && !isEmailValid 
                              ? 'border-red-500' 
                              : 'border-border-light'
                        }`}
                        required
                      />
                    </div>
                    {email && !isEmailValid && (
                      <p className="text-[11px] text-red-500 mt-1">Please enter a valid email format.</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-on-surface">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setFormError(null); setFormSuccess(null); setShowToast(false); }}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                        formError ? 'text-red-500' : 'text-outline'
                      }`} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="••••••••"
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-10 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none ${
                          formError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border-light'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span>Remember session</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 2: Create Account Form */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra Verma"
                        className="w-full bg-surface-container-low border border-border-light rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="yourname@gmail.com"
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none ${
                          email && !isEmailValid ? 'border-red-500' : 'border-border-light'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Password with Strength Meter */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Create Password (Min. 8 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="Min. 8 chars with mixed case/symbols"
                        className="w-full bg-surface-container-low border border-border-light rounded-xl pl-10 pr-10 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color.split(' ')[0] : 'bg-surface-container'}`} />
                          <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color.split(' ')[0] : 'bg-surface-container'}`} />
                          <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color.split(' ')[0] : 'bg-surface-container'}`} />
                        </div>
                        <p className={`text-[10px] font-semibold ${passwordStrength.color.split(' ')[1]}`}>
                          Strength: {passwordStrength.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full bg-surface-container-low border rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none ${
                          confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-border-light'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Location & Occupation Selectors */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">State</label>
                      <input
                        type="text"
                        value={selectedState}
                        onChange={e => setSelectedState(e.target.value)}
                        className="w-full bg-surface-container-low border border-border-light rounded-xl px-2.5 py-2 text-xs text-on-surface"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">Occupation</label>
                      <select
                        value={selectedOccupation}
                        onChange={e => setSelectedOccupation(e.target.value as any)}
                        className="w-full bg-surface-container-low border border-border-light rounded-xl px-2 py-2 text-xs text-on-surface"
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Tab 3: Forgot Password Form */}
              {mode === 'forgot' && (
                <form onSubmit={handlePasswordRecovery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="citizen@domain.gov.in"
                        className="w-full bg-surface-container-low border border-border-light rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-3 border-t border-border-light/40 bg-surface/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Compliant with Indian Digital Personal Data Protection (DPDP) Act & National DPI Guidelines</span>
        </div>
        <div>
          <span>JanSetu AI v1.0.0</span>
        </div>
      </footer>
    </div>
  );
};

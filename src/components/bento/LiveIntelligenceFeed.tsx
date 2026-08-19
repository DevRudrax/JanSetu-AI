import React, { useState, useEffect } from 'react';
import { useCitizen } from '../../context/CitizenContext';
import { useLanguage } from '../../context/LanguageContext';
import { PLATFORM_METRICS } from '../../services/dummyData';
import { 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Users, 
  Landmark,
  ArrowUpRight,
  Bot
} from 'lucide-react';

const LIVE_EVENTS_FEED = [
  { time: '10s ago', text: 'Pothole complaint GRV-2024-9182 routed to PWD Karnal via Vision AI Model.', tag: 'AI Triaged', type: 'triage' },
  { time: '42s ago', text: '₹6,000 DBT PM-KISAN installment verified for Rajesh K. via Aadhaar APB.', tag: 'DBT Disbursed', type: 'scheme' },
  { time: '2m ago', text: 'Water pipeline burst complaint JAL-MH-9104 marked "Resolved" by Jal Sansthan.', tag: 'Resolved', type: 'resolve' },
  { time: '4m ago', text: 'RTI application for road audit generated under Section 6(1) for Executive Engineer.', tag: 'RTI Drafted', type: 'rti' },
  { time: '7m ago', text: 'Ayushman Bharat Golden Card approved for senior citizen (Aadhaar 70+).', tag: 'DPI Enrolled', type: 'scheme' },
];

export const LiveIntelligenceFeed: React.FC = () => {
  const { grievances } = useCitizen();
  const { t } = useLanguage();

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % LIVE_EVENTS_FEED.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: t('totalResolved'),
      value: (PLATFORM_METRICS.totalGrievancesResolved / 1000000).toFixed(1) + 'M+',
      growth: '+12.4% this month',
      icon: CheckCircle2,
      color: 'text-status-success',
      bg: 'bg-status-success/10'
    },
    {
      label: t('aiAccuracy'),
      value: `${PLATFORM_METRICS.aiTriageAccuracy}%`,
      growth: 'Trained on 140+ depts',
      icon: Bot,
      color: 'text-secondary',
      bg: 'bg-secondary-fixed/30'
    },
    {
      label: t('schemesIndexed'),
      value: `${PLATFORM_METRICS.activeSchemesCount}+`,
      growth: 'Central & State Portals',
      icon: Landmark,
      color: 'text-primary',
      bg: 'bg-primary-fixed/40'
    },
    {
      label: t('avgResolution'),
      value: `${PLATFORM_METRICS.averageResolutionDays} Days`,
      growth: 'Reduced from 21 days',
      icon: Clock,
      color: 'text-status-warning',
      bg: 'bg-status-warning/10'
    }
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
        <div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-on-surface">
            {t('liveIntelligence')}
          </h3>
          <p className="text-xs text-on-surface-variant">Real-time Digital Public Infrastructure throughput</p>
        </div>

        {/* Live Pulse Ticker Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/20 text-status-success text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-status-success animate-ping"></span>
          <span>CPGRAMS & DigiLocker Grid Synchronized</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="bg-surface-container-lowest border border-border-light p-5 rounded-2xl shadow-card flex flex-col justify-between hover:shadow-elevated transition-all"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-on-surface-variant max-w-[140px]">
                  {st.label}
                </span>
                <div className={`w-8 h-8 rounded-xl ${st.bg} ${st.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <span className="font-display font-bold text-2xl sm:text-3xl text-on-surface tracking-tight">
                  {st.value}
                </span>
                <div className="flex items-center gap-1 mt-1 text-[11px] font-medium text-status-success">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span>{st.growth}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Animated Activity Stream */}
      <div className="bg-surface-container-lowest border border-border-light rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border-light pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
              {t('recentActivity')}
            </span>
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono">
            {grievances.length} Active Tickets in Local Session
          </span>
        </div>

        {/* Dynamic event item ticker */}
        <div className="space-y-2">
          {LIVE_EVENTS_FEED.map((event, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                i === tickerIndex
                  ? 'bg-primary-fixed/20 border-primary/30 ring-1 ring-primary/20'
                  : 'bg-surface-container-low/40 border-border-light/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  event.type === 'resolve' ? 'bg-status-success' :
                  event.type === 'triage' ? 'bg-secondary' :
                  event.type === 'rti' ? 'bg-primary' : 'bg-status-warning'
                }`}></span>
                <span className="text-on-surface font-medium truncate">{event.text}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-bold text-[10px]">
                  {event.tag}
                </span>
                <span className="text-[10px] text-outline font-mono">{event.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

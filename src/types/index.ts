export type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn';

export interface CitizenProfile {
  id: string;
  name: string;
  avatar: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  state: string;
  district: string;
  areaType: 'Rural' | 'Urban';
  occupation: 'Farmer' | 'Student' | 'Small Business Owner' | 'Senior Citizen' | 'Artisan / Worker' | 'Healthcare Worker' | 'Unemployed' | 'Homemaker';
  annualIncome: number; // in INR
  socialCategory: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  landholdingAcres: number;
  kisanCreditCard: boolean;
  bplCard: boolean;
  aadhaarLinked: boolean;
  digilockerSynced: boolean;
}

export type GrievanceUrgency = 'High' | 'Medium' | 'Low';

export type GrievanceStatus = 
  | 'Submitted' 
  | 'AI Triaged' 
  | 'Department Assigned' 
  | 'In Progress' 
  | 'Resolved';

export interface GrievanceTimelineEvent {
  stage: GrievanceStatus;
  timestamp: string;
  description: string;
  officerOrSystem: string;
  completed: boolean;
  active?: boolean;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: 'Roads & Infrastructure' | 'Water Supply & Sanitation' | 'Electricity & Energy' | 'Solid Waste Management' | 'Public Health' | 'Transport & Traffic' | 'Revenue & Land';
  department: string;
  designatedOfficer: string;
  urgency: GrievanceUrgency;
  urgencyRationale: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  audioUrl?: string;
  audioTranscript?: string;
  submittedAt: string;
  updatedAt: string;
  status: GrievanceStatus;
  officialLetterDraft: string;
  actionTimeline: GrievanceTimelineEvent[];
  publicTrackingCode: string;
}

export interface WelfareScheme {
  id: string;
  title: string;
  ministry: string;
  category: 'Agriculture' | 'Housing' | 'Healthcare' | 'Education' | 'Financial Inclusion' | 'Energy / Solar' | 'Women Empowerment' | 'Skill Development';
  benefitAmount: string;
  benefitType: 'Direct Benefit Transfer (DBT)' | 'Subsidy' | 'Insurance Cover' | 'Loan / Credit' | 'Scholarship';
  summary: string;
  detailedDescription: string;
  targetBeneficiary: string;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  matchScore: number;
  matchReasons: string[];
  missingCriteria?: string[];
  bannerImage: string;
  portalUrl: string;
  applicationSteps: { step: number; title: string; instruction: string }[];
}

export interface CircularDoc {
  id: string;
  title: string;
  refNumber: string;
  ministry: string;
  publishDate: string;
  originalText: string;
  category: 'Agriculture' | 'Healthcare' | 'Taxation' | 'Education' | 'Renewable Energy';
  pdfUrl?: string;
  takeaways: {
    coreObjective: string;
    eligibility: string;
    keyDeadline: string;
  };
  jargonBusters: { term: string; plainMeaning: string }[];
  summaryByLanguage?: Partial<Record<Language, {
    coreObjective: string;
    eligibility: string;
    keyDeadline: string;
  }>>;
}

export interface RtiRequest {
  id: string;
  trackingId: string;
  applicantName: string;
  applicantAddress: string;
  targetDepartment: string;
  designatedPio: string;
  querySubject: string;
  queryDetails: string;
  legalClausesCited: string[];
  applicationFee: number;
  createdDate: string;
  statutoryDeadline: string; // 30 days
  status: 'Drafted' | 'Ready to Dispatch' | 'Filed with PIO' | 'Information Awaited' | 'Disposed';
  fullDraftLetter: string;
  feeReceiptMode: 'e-Postal Order' | 'UPI / BharatQR' | 'Court Fee Stamp';
}

export interface UniversalAIQueryResult {
  intent: 'Grievance' | 'Scheme' | 'Document' | 'RTI' | 'GeneralGov';
  confidence: number;
  actionableSummary: string;
  targetModule: 'dashboard' | 'schemes' | 'grievances' | 'documents' | 'rti-assistant';
  suggestedPrompts: string[];
  extractedData?: Record<string, any>;
}

export interface PlatformMetric {
  totalGrievancesResolved: number;
  averageResolutionDays: number;
  aiTriageAccuracy: number;
  activeSchemesCount: number;
  citizensAssisted: number;
  fundTransfersFacilitatedCr: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}


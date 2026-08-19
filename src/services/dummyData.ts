import { CitizenProfile, Grievance, WelfareScheme, CircularDoc, RtiRequest, PlatformMetric } from '../types';

export const INITIAL_CITIZENS: CitizenProfile[] = [
  {
    id: 'citizen-1',
    name: 'Rajesh Kumar',
    avatar: 'RK',
    gender: 'Male',
    age: 44,
    state: 'Haryana',
    district: 'Karnal',
    areaType: 'Rural',
    occupation: 'Farmer',
    annualIncome: 240000,
    socialCategory: 'OBC',
    landholdingAcres: 2.5,
    kisanCreditCard: true,
    bplCard: false,
    aadhaarLinked: true,
    digilockerSynced: true,
  },
  {
    id: 'citizen-2',
    name: 'Priya Sharma',
    avatar: 'PS',
    gender: 'Female',
    age: 23,
    state: 'Delhi',
    district: 'South Delhi',
    areaType: 'Urban',
    occupation: 'Student',
    annualIncome: 90000,
    socialCategory: 'General',
    landholdingAcres: 0,
    kisanCreditCard: false,
    bplCard: false,
    aadhaarLinked: true,
    digilockerSynced: true,
  },
  {
    id: 'citizen-3',
    name: 'Lakshmi Devi',
    avatar: 'LD',
    gender: 'Female',
    age: 38,
    state: 'Maharashtra',
    district: 'Kolhapur',
    areaType: 'Rural',
    occupation: 'Homemaker',
    annualIncome: 150000,
    socialCategory: 'EWS',
    landholdingAcres: 0.5,
    kisanCreditCard: false,
    bplCard: true,
    aadhaarLinked: true,
    digilockerSynced: true,
  },
  {
    id: 'citizen-4',
    name: 'Ramakant Roy',
    avatar: 'RR',
    gender: 'Male',
    age: 68,
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    areaType: 'Urban',
    occupation: 'Senior Citizen',
    annualIncome: 180000,
    socialCategory: 'General',
    landholdingAcres: 0,
    kisanCreditCard: false,
    bplCard: true,
    aadhaarLinked: true,
    digilockerSynced: false,
  }
];

export const WELFARE_SCHEMES: WelfareScheme[] = [
  {
    id: 'pm-kisan',
    title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'Agriculture',
    benefitAmount: '₹6,000 / Year',
    benefitType: 'Direct Benefit Transfer (DBT)',
    summary: 'Direct income support of ₹6,000 per annum in three equal installments to all landholding farmer families across India.',
    detailedDescription: 'PM-KISAN is a central sector scheme providing direct financial assistance to small and marginal farmers for procurement of agricultural inputs like seeds, fertilizers, and equipment.',
    targetBeneficiary: 'Landholding farmer families with cultivable land in their name.',
    eligibilityCriteria: [
      'Must be an Indian citizen farmer',
      'Must own cultivable agricultural land registered in official revenue records',
      'Aadhaar seeded bank account mandatory',
      'Not paying Income Tax in previous assessment year',
      'Not serving as constitutional post holder or institutional landholder'
    ],
    requiredDocuments: ['Aadhaar Card', 'Land Ownership Record (Khata/Khesra / 7/12 extract)', 'Bank Passbook copy', 'Active Mobile Number'],
    matchScore: 98,
    matchReasons: [
      'Matches occupation: Landholding Farmer',
      'State of residence is registered on national land portal',
      'Annual income fits DBT beneficiary guidelines (< ₹5L)'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmkisan.gov.in',
    applicationSteps: [
      { step: 1, title: 'Identity & Aadhaar Verification', instruction: 'Auto-verify Aadhaar biometric or OTP through UIDAI via JanSetu.' },
      { step: 2, title: 'Land Record Validation', instruction: 'Fetch digital 7/12 or Khasra land record from State Bhulekh portal.' },
      { step: 3, title: 'Bank Account Seeding', instruction: 'Confirm NPCI Direct Benefit Transfer (DBT) mapped savings account.' },
      { step: 4, title: 'Instant e-Filing', instruction: 'Generate signed digital submission to Agriculture Department.' }
    ]
  },
  {
    id: 'pmay-gramin',
    title: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    ministry: 'Ministry of Rural Development',
    category: 'Housing',
    benefitAmount: '₹1,20,000 to ₹1,30,000',
    benefitType: 'Subsidy',
    summary: 'Financial grant provided to rural families living in kutcha/dilapidated houses for construction of pucca homes with basic amenities.',
    detailedDescription: 'PMAY-G provides direct cash assistance in 3 construction phases alongside 90-95 days of unskilled labor wages under MGNREGA and ₹12,000 for toilet construction under Swachh Bharat Mission.',
    targetBeneficiary: 'Houseless households and households living in zero, one, or two-room houses with kutcha walls and kutcha roof.',
    eligibilityCriteria: [
      'Rural household identified under SECC 2011 / Awas+ survey list',
      'Does not own a pucca house anywhere in India',
      'Annual household income within rural poverty threshold',
      'Priority given to SC/ST, widows, and disabled members'
    ],
    requiredDocuments: ['Aadhaar Card', 'MGNREGA Job Card', 'Bank Account details', 'Land / Plot possession certificate'],
    matchScore: 88,
    matchReasons: [
      'Matches rural residency classification',
      'Income category aligns with housing subsidy criteria'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmayg.nic.in',
    applicationSteps: [
      { step: 1, title: 'Gram Panchayat Verification', instruction: 'Check SECC priority ranking on village register.' },
      { step: 2, title: 'Geo-tagging of Kutcha site', instruction: 'Upload geo-tagged photograph of existing kutcha structure.' },
      { step: 3, title: 'Sanction Order Generation', instruction: 'AI Assistant validates document completeness for BDO approval.' }
    ]
  },
  {
    id: 'ayushman-bharat',
    title: 'Ayushman Bharat PM Jan Arogya Yojana (PM-JAY)',
    ministry: 'Ministry of Health and Family Welfare',
    category: 'Healthcare',
    benefitAmount: '₹5,00,000 / Family / Year',
    benefitType: 'Insurance Cover',
    summary: 'Cashless secondary and tertiary healthcare coverage of ₹5 Lakhs per family per year across 27,000+ empaneled hospitals.',
    detailedDescription: 'World’s largest government-funded health assurance scheme covering 1,949 medical treatments including cancer surgeries, cardiac stents, joint replacements, and ICU admissions.',
    targetBeneficiary: 'Bottom 40% vulnerable and poor families identified as per SECC 2011 database + all senior citizens aged 70+ regardless of income.',
    eligibilityCriteria: [
      'Enlisted under SECC 2011 rural/urban occupational criteria',
      'Holders of valid Ration Card / BPL card',
      'All citizens aged 70 and above eligible for specialized Ayushman Vay Vandana Card'
    ],
    requiredDocuments: ['Aadhaar Card', 'Ration Card / Parivar Pehchan Patra', 'Mobile number'],
    matchScore: 92,
    matchReasons: [
      'Valid Aadhaar and Ration Card verified on DigiLocker',
      'Complete cashless hospitalization coverage in all government and private empaneled hospitals'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmjay.gov.in',
    applicationSteps: [
      { step: 1, title: 'Instant e-KYC Check', instruction: 'Verify BIS eligibility using Aadhaar number and OTP.' },
      { step: 2, title: 'Family Member Linking', instruction: 'Add dependents from digital ration card record.' },
      { step: 3, title: 'Download Ayushman Card (PVC)', instruction: 'Generate verified Ayushman Card for cashless hospital admission.' }
    ]
  },
  {
    id: 'pm-surya-ghar',
    title: 'PM Surya Ghar: Muft Bijli Yojana',
    ministry: 'Ministry of New & Renewable Energy',
    category: 'Energy / Solar',
    benefitAmount: 'Up to ₹78,000 Subsidy',
    benefitType: 'Subsidy',
    summary: 'Rooftop solar subsidy enabling households to get up to 300 units of free electricity every month and earn revenue via net-metering.',
    detailedDescription: 'Provides ₹30,000 for 1 kW system, ₹60,000 for 2 kW system, and ₹78,000 for 3 kW or higher systems directly into the citizen bank account within 30 days of installation.',
    targetBeneficiary: 'Residential households with suitable rooftop space and active electricity connection.',
    eligibilityCriteria: [
      'Citizen of India owning a residential house with suitable roof',
      'Valid consumer electricity connection in applicant’s name',
      'No previous central solar rooftop subsidy claimed on same meter'
    ],
    requiredDocuments: ['Electricity Bill (last 6 months)', 'Aadhaar Card', 'Proof of Roof Ownership', 'Bank Account cancelled cheque'],
    matchScore: 82,
    matchReasons: [
      'High potential for reducing household electricity expenditure to zero',
      'Residential rooftop space available'
    ],
    bannerImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmsuryaghar.gov.in',
    applicationSteps: [
      { step: 1, title: 'DISCOM Connection Lookup', instruction: 'Enter your Electricity Consumer Number to fetch load profile.' },
      { step: 2, title: 'Vendor Quotation Matcher', instruction: 'JanSetu AI finds top-rated empaneled DISCOM solar installers near you.' },
      { step: 3, title: 'Net Metering Approval', instruction: 'Digital application submitted directly to State Power Utility.' }
    ]
  },
  {
    id: 'pm-svanidhi',
    title: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Financial Inclusion',
    benefitAmount: '₹10,000 to ₹50,000 Loan + 7% Interest Subsidy',
    benefitType: 'Loan / Credit',
    summary: 'Collateral-free working capital loan to street vendors and urban hawkers with cashback incentives on digital transactions.',
    detailedDescription: 'Tranche 1 offers ₹10,000 (1-year term); on timely repayment, Tranche 2 offers ₹20,000, and Tranche 3 offers ₹50,000 with 7% annual interest subsidy deposited directly to bank account.',
    targetBeneficiary: 'Street vendors, roadside stalls, cart vendors operating in urban or semi-urban areas.',
    eligibilityCriteria: [
      'Street vendors in possession of Certificate of Vending / Identity Card issued by Urban Local Bodies (ULBs)',
      'Vendors identified in the survey or possessing recommendation letter from ULB'
    ],
    requiredDocuments: ['Aadhaar Card', 'Vending ID Card or Letter of Recommendation (LoR)', 'Bank Account details'],
    matchScore: 75,
    matchReasons: ['Collateral-free micro-credit for urban self-employed citizens'],
    bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmsvanidhi.mohua.gov.in',
    applicationSteps: [
      { step: 1, title: 'ULB Vending Record Verification', instruction: 'Validate municipality vending register ID.' },
      { step: 2, title: 'Bank Branch Routing', instruction: 'Select preferred public or rural bank branch.' },
      { step: 3, title: 'UPI QR Cashback Setup', instruction: 'Activate BharatQR code for earning up to ₹1,200 annual cashback.' }
    ]
  },
  {
    id: 'pm-vishwakarma',
    title: 'PM Vishwakarma Kaushal Samman',
    ministry: 'Ministry of Micro, Small and Medium Enterprises',
    category: 'Skill Development',
    benefitAmount: '₹15,000 Toolkit Incentive + ₹3 Lakh Collateral-free Credit at 5%',
    benefitType: 'Direct Benefit Transfer (DBT)',
    summary: 'Holistic support for traditional artisans and craftspeople including PM Vishwakarma Certificate, skill training, tool grant, and concessional loans.',
    detailedDescription: 'Covers 18 traditional trades (Carpenters, Blacksmiths, Potters, Sculptors, Cobblers, Tailors, Weavers, etc.) with ₹500/day training stipend, ₹15,000 e-voucher for modern tools, and up to ₹3,00,000 loan at 5% interest rate.',
    targetBeneficiary: 'Artisans and craftspersons working with hands and tools in traditional family-based trades.',
    eligibilityCriteria: [
      'Minimum age 18 years',
      'Must be engaged in one of the 18 recognized traditional trades',
      'Should not have availed loan under PMEGP or PM SVANidhi in last 5 years'
    ],
    requiredDocuments: ['Aadhaar Card', 'Mobile linked with Aadhaar', 'Bank Account details', 'Ration Card'],
    matchScore: 90,
    matchReasons: ['Direct financial grant for artisan tools and zero-collateral loan'],
    bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    portalUrl: 'https://pmvishwakarma.gov.in',
    applicationSteps: [
      { step: 1, title: 'Trade Registration', instruction: 'Select your recognized artisan craft.' },
      { step: 2, title: 'Gram Panchayat Recommendation', instruction: 'Automated digital verification by Gram Pradhan / Ward Member.' },
      { step: 3, title: 'Skill Center Enrollment', instruction: 'Schedule 5-day basic skill training at nearest MSME center.' }
    ]
  }
];

export const INITIAL_GRIEVANCES: Grievance[] = [
  {
    id: 'GRV-2024-8910',
    publicTrackingCode: 'CPGRAMS-HR-2024-8910',
    title: 'Deep Pothole & Caved-in Asphalt near MG Road Junction',
    description: 'A 2-foot wide hazardous crater on the main arterial corridor causing severe traffic snarls and two-wheeler skidding accidents during monsoon rains.',
    category: 'Roads & Infrastructure',
    department: 'Public Works Department (PWD) - Division IV',
    designatedOfficer: 'Er. Sandeep Verma, Executive Engineer (Roads)',
    urgency: 'High',
    urgencyRationale: 'Immediate road safety hazard on high-density transit route with accident probability.',
    location: 'Sector 14, MG Road Crossing, Karnal, Haryana',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    submittedAt: '2024-10-21T09:30:00Z',
    updatedAt: '2024-10-22T14:15:00Z',
    status: 'In Progress',
    officialLetterDraft: `To,
The Executive Engineer (Roads),
Public Works Department (PWD), Division IV,
Government of Haryana, Karnal.

Subject: Formal Grievance regarding dangerous caved-in crater on MG Road Junction (Ref: GRV-2024-8910)

Respected Sir/Madam,
I am writing to draw your immediate attention to a hazardous road degradation on Sector 14, MG Road crossing. The asphalt has collapsed creating a deep crater of approximately 2 feet diameter. This poses a grave threat to commuters, especially two-wheeler riders.

I request you to inspect the location, deploy road cold-mix bitumen patching, and restore motorable surface at the earliest.

Photographic evidence and precise GPS coordinates are attached.

Yours sincerely,
Rajesh Kumar (Citizen ID: JAN-78219)
Ph: +91-98765-43210`,
    actionTimeline: [
      {
        stage: 'Submitted',
        timestamp: '21 Oct, 09:30 AM',
        description: 'Citizen logged grievance via JanSetu AI with geotagged photo.',
        officerOrSystem: 'Citizen Portal',
        completed: true,
      },
      {
        stage: 'AI Triaged',
        timestamp: '21 Oct, 09:31 AM',
        description: 'Vision AI Model classified issue as "Roads & Infrastructure" with High Urgency severity.',
        officerOrSystem: 'JanSetu AI Engine',
        completed: true,
      },
      {
        stage: 'Department Assigned',
        timestamp: '21 Oct, 11:45 AM',
        description: 'Forwarded to PWD Division IV. Ticket created on Haryana CPGRAMS gateway.',
        officerOrSystem: 'Municipal Nodal Officer',
        completed: true,
      },
      {
        stage: 'In Progress',
        timestamp: '22 Oct, 02:15 PM',
        description: 'Maintenance contractor work order issued. Cold asphalt patch work scheduled.',
        officerOrSystem: 'Er. Sandeep Verma, PWD',
        completed: true,
        active: true,
      },
      {
        stage: 'Resolved',
        timestamp: 'Expected 24 Oct',
        description: 'Physical inspection and citizen verification signoff.',
        officerOrSystem: 'Field Engineer',
        completed: false,
      }
    ]
  },
  {
    id: 'GRV-2024-8742',
    publicTrackingCode: 'MUNC-DL-2024-8742',
    title: 'Irregular Garbage Collection & Overflowing Waste Dump',
    description: 'Community garbage vat uncollected for 5 consecutive days leading to foul odor and stray animal menace near Govt Primary School.',
    category: 'Solid Waste Management',
    department: 'Municipal Corporation Sanitation Wing',
    designatedOfficer: 'Chief Sanitation Inspector, Ward 12',
    urgency: 'Medium',
    urgencyRationale: 'Public health hygiene concern adjacent to school perimeter.',
    location: 'Near Primary School, Ward 12, South Delhi',
    imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=600&auto=format&fit=crop&q=80',
    submittedAt: '2024-10-18T08:15:00Z',
    updatedAt: '2024-10-20T17:00:00Z',
    status: 'Resolved',
    officialLetterDraft: `To,
The Chief Sanitation Inspector,
Municipal Corporation, Ward 12.

Subject: Immediate clearance of overflowing waste vat near Government Primary School

Sir,
The municipal waste container located near the Govt Primary School has remained uncleared for past 5 days. Due to decomposition and rains, severe health hazards have arisen for school children.

Kindly dispatch compactor tipper vehicle and ensure daily morning clearance cycle.

Yours faithfully,
Citizen Resident Forum`,
    actionTimeline: [
      {
        stage: 'Submitted',
        timestamp: '18 Oct, 08:15 AM',
        description: 'Grievance submitted with photo.',
        officerOrSystem: 'Citizen App',
        completed: true,
      },
      {
        stage: 'AI Triaged',
        timestamp: '18 Oct, 08:16 AM',
        description: 'Triaged to Municipal Solid Waste Dept.',
        officerOrSystem: 'JanSetu AI',
        completed: true,
      },
      {
        stage: 'Department Assigned',
        timestamp: '18 Oct, 10:30 AM',
        description: 'Sanitation Inspector assigned.',
        officerOrSystem: 'Zonal Sanitation Office',
        completed: true,
      },
      {
        stage: 'In Progress',
        timestamp: '19 Oct, 09:00 AM',
        description: 'Garbage compactor vehicle deployed for complete site clearance and bleaching powder spray.',
        officerOrSystem: 'Sanitation Staff',
        completed: true,
      },
      {
        stage: 'Resolved',
        timestamp: '20 Oct, 05:00 PM',
        description: 'Site cleared and geo-tagged resolution photo uploaded.',
        officerOrSystem: 'Chief Sanitation Inspector',
        completed: true,
      }
    ]
  },
  {
    id: 'GRV-2024-9104',
    publicTrackingCode: 'JAL-MH-2024-9104',
    title: 'Drinking Water Pipeline Burst & Heavy Street Inundation',
    description: 'Major underground drinking water supply pipe burst leaking thousands of liters per hour and flooding residential lane.',
    category: 'Water Supply & Sanitation',
    department: 'Jal Sansthan / Municipal Water Supply Board',
    designatedOfficer: 'Assistant Engineer (Water Works)',
    urgency: 'High',
    urgencyRationale: 'Huge drinking water wastage and road waterlogging risking structural damage.',
    location: 'Shivaji Chowk, Ward 4, Kolhapur, Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
    submittedAt: '2024-10-23T06:45:00Z',
    updatedAt: '2024-10-23T08:30:00Z',
    status: 'Department Assigned',
    officialLetterDraft: `To,
The Assistant Engineer,
Maharashtra Jeevan Pradhikaran / Jal Sansthan,
Kolhapur.

Subject: Emergency repair of main water distribution pipe burst at Shivaji Chowk

Respected Officer,
An underground distribution pipeline has fractured near Shivaji Chowk since 5:00 AM today, releasing heavy potable water and submerging the adjacent road.

Immediate closure of the feeder sluice valve and pipe welding replacement is urgently requested.

Regards,
Lakshmi Devi`,
    actionTimeline: [
      {
        stage: 'Submitted',
        timestamp: '23 Oct, 06:45 AM',
        description: 'Emergency civic report logged.',
        officerOrSystem: 'Citizen Portal',
        completed: true,
      },
      {
        stage: 'AI Triaged',
        timestamp: '23 Oct, 06:46 AM',
        description: 'Categorized under "Water Supply" with High Urgency.',
        officerOrSystem: 'JanSetu AI Engine',
        completed: true,
      },
      {
        stage: 'Department Assigned',
        timestamp: '23 Oct, 08:30 AM',
        description: 'Assigned to Water Works Emergency Repair Crew.',
        officerOrSystem: 'Control Room Officer',
        completed: true,
        active: true,
      },
      {
        stage: 'In Progress',
        timestamp: 'Pending',
        description: 'Excavation and valve isolation.',
        officerOrSystem: 'Pipeline Crew',
        completed: false,
      },
      {
        stage: 'Resolved',
        timestamp: 'Pending',
        description: 'Pressure testing and backfill.',
        officerOrSystem: 'AE Water Works',
        completed: false,
      }
    ]
  }
];

export const OFFICIAL_CIRCULARS: CircularDoc[] = [
  {
    id: 'circ-1',
    title: 'Mandatory e-KYC Completion Guidelines for PM-KISAN 17th Installment Release',
    refNumber: 'AGR/EXT/2024/104-B',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    publishDate: '15 Feb 2024',
    category: 'Agriculture',
    pdfUrl: 'https://pmkisan.gov.in/Documents/eKYC_Circular_2024.pdf',
    originalText: `GOVERNMENT OF INDIA
MINISTRY OF AGRICULTURE & FARMERS WELFARE
DEPARTMENT OF AGRICULTURE & FARMERS WELFARE
KRISHI BHAWAN, NEW DELHI

NOTIFICATION / CIRCULAR No: AGR/EXT/2024/104-B
Date: 15th February 2024

Subject: Mandatory e-KYC Verification for All Registered Beneficiaries of Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) Scheme for Crediting of Subsequent Installments.

1. In continuation of earlier operational guidelines issued under the PM-KISAN scheme, it is hereby reiterated that completion of electronic Know Your Customer (e-KYC) verification is mandatory for all registered beneficiary farmer families to receive subsequent installment tranches through Aadhaar Payment Bridge (APB).

2. Modes of Verification Available:
   (a) OTP Based e-KYC: Beneficiaries can complete authentication independently via PM-KISAN mobile app or portal using Aadhaar linked mobile number.
   (b) Biometric Based e-KYC: Beneficiaries can visit the nearest Common Service Centre (CSC) or State Seva Kendra for fingerprint/iris validation.
   (c) Face Authentication: Available through the PM-KISAN mobile application utilizing UIDAI RD face service without requiring biometric dongles.

3. Timelines & Deadlines:
   All State Governments and Union Territory administrations are instructed to conduct saturation camps. Beneficiaries must complete e-KYC before 31st March 2024. Failure to authenticate may lead to temporary holding of installment disbursals until authentication is completed.

4. Bank Account Land Seeding:
   Farmers must also ensure that their active bank accounts are seeded with Aadhaar and marked for Direct Benefit Transfer (DBT) on NPCI portal, and their land ownership records are verified on the State Revenue portal.`,
    takeaways: {
      coreObjective: 'Mandates all PM-KISAN registered farmers to complete digital e-KYC and NPCI Aadhaar bank mapping to prevent stoppage of quarterly ₹2,000 cash installments.',
      eligibility: 'All active PM-KISAN beneficiaries across all States and UTs. Can be done free on mobile phone via Face Auth or at any village CSC centre for ₹15 nominal fee.',
      keyDeadline: 'Final saturation deadline is 31st March 2024. Incomplete KYC accounts will have future payments temporarily paused until validated.'
    },
    jargonBusters: [
      { term: 'e-KYC', plainMeaning: 'Digital identity verification using your Aadhaar card and fingerprint/face or mobile OTP.' },
      { term: 'Aadhaar Payment Bridge (APB)', plainMeaning: 'A government payment system that sends money directly to the bank account linked to your Aadhaar.' },
      { term: 'Land Seeding', plainMeaning: 'Linking your official land ownership paper (Khata/Khasra) with your PM-Kisan account.' }
    ]
  },
  {
    id: 'circ-2',
    title: 'Operational Guidelines for PM Surya Ghar: Muft Bijli Yojana Central Financial Assistance',
    refNumber: 'MNRE/SOLAR/2024/09',
    ministry: 'Ministry of New & Renewable Energy',
    publishDate: '28 Feb 2024',
    category: 'Renewable Energy',
    pdfUrl: 'https://pmsuryaghar.gov.in/guidelines/operational_guidelines.pdf',
    originalText: `GOVERNMENT OF INDIA
MINISTRY OF NEW AND RENEWABLE ENERGY
BLOCK-14, CGO COMPLEX, LODHI ROAD, NEW DELHI

OFFICE MEMORANDUM: MNRE/SOLAR/2024/09
Date: 28th February 2024

Subject: Revised Structure of Central Financial Assistance (CFA) for Residential Rooftop Solar Installations under PM Surya Ghar: Muft Bijli Yojana.

1. The Union Cabinet has approved the PM Surya Ghar: Muft Bijli Yojana with total outlay of ₹75,021 crore for installing rooftop solar plants across 1 crore households in India.

2. Subsidy / Central Financial Assistance Structure:
   (i) For Residential Rooftop Systems up to 2 kW capacity: ₹30,000 per kW (Max ₹60,000 for 2 kW).
   (ii) For additional capacity beyond 2 kW and up to 3 kW: ₹18,000 per kW (Total subsidy for 3 kW system = ₹78,000).
   (iii) For systems above 3 kW: Fixed at maximum ceiling of ₹78,000.
   (iv) Group Housing Societies / Residential Welfare Associations (GHS/RWA): ₹18,000 per kW for common facilities up to 500 kW.

3. Disbursal Procedure:
   The subsidy shall be transferred directly into the applicant beneficiary's bank account through DBT within 30 days of successful commissioning and inspection of net-meter by the local distribution company (DISCOM).

4. Concessional Financing:
   Beneficiaries can avail collateral-free loans up to ₹2 Lakhs at concessional interest rate of Repo Rate + 0.5% (approx 7% per annum) through nationalized banks on the PM Surya Ghar national portal.`,
    takeaways: {
      coreObjective: 'Provides direct bank subsidy of up to ₹78,000 for installing residential rooftop solar panels to generate up to 300 units of free electricity per month.',
      eligibility: 'Any Indian citizen owning a residential building with a separate DISCOM electricity connection and valid roof space.',
      keyDeadline: 'Open for continuous online registration on pmsuryaghar.gov.in portal. Subsidy transferred within 30 days of net-meter installation.'
    },
    jargonBusters: [
      { term: 'Central Financial Assistance (CFA)', plainMeaning: 'The direct government grant/subsidy deposited into your bank account.' },
      { term: 'Net Metering', plainMeaning: 'A special two-way electricity meter that deducts the solar units you export to the grid from your monthly power bill.' },
      { term: 'DISCOM', plainMeaning: 'Your local state electricity distribution company that supplies power to your home.' }
    ]
  },
  {
    id: 'circ-3',
    title: 'Ayushman Bharat PM-JAY Universal Senior Citizen Health Coverage (70+ Age Group)',
    refNumber: 'NHA/AB-PMJAY/2024/70PLUS',
    ministry: 'Ministry of Health and Family Welfare',
    publishDate: '12 Sep 2024',
    category: 'Healthcare',
    pdfUrl: 'https://nha.gov.in/circulars/senior_citizens_expansion.pdf',
    originalText: `NATIONAL HEALTH AUTHORITY
MINISTRY OF HEALTH & FAMILY WELFARE
9th Floor, Tower-l, Jeevan Bharati Building, Connaught Place, New Delhi

POLICY DIRECTIVE: NHA/AB-PMJAY/2024/70PLUS
Date: 12th September 2024

Subject: Expansion of Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY) to Provide Universal Health Assurance to All Senior Citizens Aged 70 Years and Above.

1. In accordance with the decision of the Union Cabinet, AB PM-JAY is hereby universally extended to cover all senior citizens of India who are 70 years of age and above, irrespective of their socio-economic status or annual income.

2. Entitlement & Card Issuance:
   (a) A distinct, dedicated "Ayushman Vay Vandana Card" shall be issued to all eligible senior citizens aged 70+.
   (b) Senior citizens aged 70+ belonging to families already covered under AB PM-JAY will receive an additional top-up cover of ₹5 Lakhs per year exclusively reserved for them (not shared with remaining family members).
   (c) Senior citizens aged 70+ not currently covered will receive full ₹5 Lakhs per annum family floater health cover.

3. Treatment of Existing Private or Public Health Insurance:
   Senior citizens holding private health insurance policies or Employees State Insurance (ESI) / Central Government Health Scheme (CGHS) may either continue with their current coverage or opt for AB PM-JAY benefit.

4. Implementation:
   State Health Agencies (SHAs) shall operationalize enrolment through portal beneficiary.nha.gov.in or Ayushman App using Aadhaar biometric authentication.`,
    takeaways: {
      coreObjective: 'Grants universal ₹5,00,000 per year cashless hospital treatment cover to every Indian citizen aged 70 and above, regardless of income or wealth.',
      eligibility: 'Every individual aged 70 years or above with a valid Aadhaar card stating birth date. No income certificate or BPL proof needed.',
      keyDeadline: 'Enrolment is active nationwide on beneficiary.nha.gov.in and at all hospital Ayushman Mitra helpdesks.'
    },
    jargonBusters: [
      { term: 'Ayushman Vay Vandana Card', plainMeaning: 'Special golden health card issued to senior citizens aged 70+ for instant cashless hospital admissions.' },
      { term: 'Family Floater', plainMeaning: 'An insurance sum where the entire ₹5 Lakh pool can be utilized by any or all senior family members.' },
      { term: 'Cashless Hospitalization', plainMeaning: 'You do not pay money at the hospital; the government pays the bill directly to the hospital.' }
    ]
  }
];

export const INITIAL_RTI_REQUESTS: RtiRequest[] = [
  {
    id: 'rti-1',
    trackingId: 'RTI-2024-8892',
    applicantName: 'Rajesh Kumar',
    applicantAddress: 'House 142, Sector 14, Karnal, Haryana - 132001',
    targetDepartment: 'Public Works Department (Roads & Bridges), Haryana',
    designatedPio: 'The Public Information Officer (PIO) / Executive Engineer, PWD Division IV, Karnal',
    querySubject: 'Information sought under RTI Act 2005 regarding Road Tender Sanction and Fund Utilization for Sector 14 Main Road Repair (2022-2024)',
    queryDetails: `Under Section 6(1) of the Right to Information Act 2005, please furnish certified copies of the following information:
1. Total sanctioned budget, tender advertisement copy, and final contract value for repair of MG Road sector 14 corridor.
2. Name of the selected contractor, work commencement date, and stipulated date of completion.
3. Copies of quality test inspection reports (bitumen density, aggregate grading) submitted by the Quality Control Engineer prior to passing final contractor billing.
4. Total payments disbursed till date with invoice vouchers and penalty clauses invoked for project delay.`,
    legalClausesCited: [
      'Section 2(f) - Right to access records, documents, memos, contracts, and samples',
      'Section 2(j)(i) & (ii) - Right to inspection of works, documents, records, and certified copies',
      'Section 7(1) - Statutory mandate to furnish information within 30 days of receipt'
    ],
    applicationFee: 10,
    createdDate: '2024-10-15',
    statutoryDeadline: '2024-11-14',
    status: 'Filed with PIO',
    feeReceiptMode: 'UPI / BharatQR',
    fullDraftLetter: `BEFORE THE PUBLIC INFORMATION OFFICER (PIO)
Under Section 6(1) of the Right to Information Act, 2005

To,
The Public Information Officer (PIO),
Office of the Executive Engineer,
Public Works Department (PWD) Division IV,
Government of Haryana, Karnal - 132001.

1. Full Name of the Applicant: Rajesh Kumar
2. Address: House 142, Sector 14, Karnal, Haryana - 132001
3. Contact Details: +91-98765-43210 | rajesh.karnal@gmail.com
4. Citizenship: Citizen of India

5. Particulars of Information Sought:
Subject: Information regarding Tender Award, Sanctioned Expenditure & Quality Audit for MG Road Sector 14 Repair (FY 2022-2024).

Please provide certified photocopies / inspection of the following public records under Section 2(j) of the RTI Act:
(a) Certified copy of the Work Order No., Sanctioned Project Estimate, and Technical Sanction for road resurfacing on Sector 14 corridor.
(b) Certified copy of the Measurement Book (MB) entries and Third-Party Quality Control audit certification for asphalt mix compaction.
(c) Itemized list of bills presented by the contractor, amounts passed, and statutory defect liability guarantee period.

6. Application Fee Details:
An amount of ₹10 (Rupees Ten only) has been deposited via Bharat Electronic Postal Order / Government Cyber Treasury receipt No: BHRTI-2024-99812.

7. Timeframe:
As per Section 7(1) of the RTI Act 2005, the information must be provided within 30 days of receipt of this application.

Place: Karnal
Date: 15 October 2024

(Signature of Applicant)
Rajesh Kumar`
  }
];

export const PLATFORM_METRICS: PlatformMetric = {
  totalGrievancesResolved: 1248920,
  averageResolutionDays: 4.2,
  aiTriageAccuracy: 98.4,
  activeSchemesCount: 1420,
  citizensAssisted: 4892100,
  fundTransfersFacilitatedCr: 18450
};

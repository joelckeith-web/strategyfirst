// Section 1: Business & Market Context
export interface BusinessContextData {
  businessName: string;
  websiteUrl: string;
  primaryServiceArea: string;
  secondaryServiceAreas: string[];
  yearsInBusiness: string;
  businessDescription: string;
  uniqueValueProposition: string;
  targetDemographic: string;
  averageJobValue: string;
  monthlyLeadGoal: string;
}

// Section 2: Revenue-Critical Services
export interface RevenueServicesData {
  primaryServices: string[];
  highestMarginServices: string[];
  mostRequestedServices: string[];
  seasonalServices: { service: string; season: string }[];
  emergencyServices: string[];
  serviceAreaRadius: string;
  pricingModel: 'fixed' | 'hourly' | 'project' | 'mixed';
  averageProjectSize: string;
  competitiveAdvantages: string[];
}

// Section 3: Local SEO & Competitive Positioning
export interface LocalSEOData {
  googleBusinessProfileUrl: string;
  gbpCategories: string[];
  currentGoogleRating: number;
  totalReviews: number;
  mainCompetitors: { name: string; website?: string; location?: string }[];
  targetKeywords: string[];
  currentRankingKeywords: string[];
  localDirectoriesListed: string[];
  napConsistencyIssues: string;
  citationSources: string[];
}

// Section 4: Website & Content Readiness
export interface WebsiteReadinessData {
  currentCMS: string;
  websiteAge: string;
  lastMajorUpdate: string;
  hasServicePages: boolean;
  hasLocationPages: boolean;
  hasBlog: boolean;
  blogPostFrequency: string;
  existingContentAssets: string[];
  technicalIssuesKnown: string[];
  mobileResponsive: boolean;
  pageLoadSpeed: 'fast' | 'average' | 'slow' | 'unknown';
  hasSSL: boolean;
  analyticsSetup: string[];
}

// Section 5: Tone, Voice & Buyer Psychology
export interface ToneVoiceData {
  brandPersonality: string[];
  communicationStyle: 'formal' | 'casual' | 'professional' | 'friendly' | 'authoritative';
  targetEmotions: string[];
  commonObjections: string[];
  trustSignals: string[];
  socialProofAvailable: string[];
  competitorDifferentiators: string[];
  messagingDontUse: string[];
}

// Section 6: Conversion & Measurement
export interface ConversionMeasurementData {
  primaryConversionGoal: string;
  secondaryConversionGoals: string[];
  currentConversionRate: string;
  leadSources: { source: string; percentage: number }[];
  crmSystem: string;
  callTrackingSetup: boolean;
  formTrackingSetup: boolean;
  currentMonthlyTraffic: string;
  currentMonthlyLeads: string;
  leadQualificationProcess: string;
}

// Section 7: AI/AEO Considerations
export interface AIConsiderationsData {
  awareOfAISearch: boolean;
  currentAIVisibility: 'none' | 'some' | 'good' | 'unknown';
  hasStructuredData: boolean;
  hasFAQContent: boolean;
  voiceSearchOptimized: boolean;
  contentFormatPreferences: string[];
  aiToolsCurrentlyUsing: string[];
  openToAIContent: boolean;
}

// Combined Intake Data
export interface IntakeData {
  id?: string;
  businessContext: BusinessContextData;
  revenueServices: RevenueServicesData;
  localSEO: LocalSEOData;
  websiteReadiness: WebsiteReadinessData;
  toneVoice: ToneVoiceData;
  conversionMeasurement: ConversionMeasurementData;
  aiConsiderations: AIConsiderationsData;
  createdAt?: Date;
  updatedAt?: Date;
  status: 'draft' | 'completed';
  currentSection: number;
}

// Form state for wizard
export interface IntakeWizardState {
  currentStep: number;
  totalSteps: number;
  data: Partial<IntakeData>;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  isSaving: boolean;
}

// Section metadata
export interface IntakeSectionMeta {
  id: number;
  title: string;
  description: string;
  icon: string;
  fields: number;
}

export const INTAKE_SECTIONS: IntakeSectionMeta[] = [
  {
    id: 1,
    title: 'Business & Market Context',
    description: 'Tell us about your business and target market',
    icon: 'building',
    fields: 10,
  },
  {
    id: 2,
    title: 'Revenue-Critical Services',
    description: 'Identify your most profitable services',
    icon: 'dollar',
    fields: 9,
  },
  {
    id: 3,
    title: 'Local SEO & Competitive Positioning',
    description: 'Your current local search presence',
    icon: 'map',
    fields: 10,
  },
  {
    id: 4,
    title: 'Website & Content Readiness',
    description: 'Current state of your digital assets',
    icon: 'globe',
    fields: 13,
  },
  {
    id: 5,
    title: 'Tone, Voice & Buyer Psychology',
    description: 'How you communicate with customers',
    icon: 'message',
    fields: 8,
  },
  {
    id: 6,
    title: 'Conversion & Measurement',
    description: 'Your goals and tracking setup',
    icon: 'chart',
    fields: 10,
  },
  {
    id: 7,
    title: 'AI/AEO Considerations',
    description: 'Readiness for AI-powered search',
    icon: 'sparkles',
    fields: 8,
  },
];

// Default empty intake data
export const DEFAULT_INTAKE_DATA: IntakeData = {
  businessContext: {
    businessName: '',
    websiteUrl: '',
    primaryServiceArea: '',
    secondaryServiceAreas: [],
    yearsInBusiness: '',
    businessDescription: '',
    uniqueValueProposition: '',
    targetDemographic: '',
    averageJobValue: '',
    monthlyLeadGoal: '',
  },
  revenueServices: {
    primaryServices: [],
    highestMarginServices: [],
    mostRequestedServices: [],
    seasonalServices: [],
    emergencyServices: [],
    serviceAreaRadius: '',
    pricingModel: 'mixed',
    averageProjectSize: '',
    competitiveAdvantages: [],
  },
  localSEO: {
    googleBusinessProfileUrl: '',
    gbpCategories: [],
    currentGoogleRating: 0,
    totalReviews: 0,
    mainCompetitors: [],
    targetKeywords: [],
    currentRankingKeywords: [],
    localDirectoriesListed: [],
    napConsistencyIssues: '',
    citationSources: [],
  },
  websiteReadiness: {
    currentCMS: '',
    websiteAge: '',
    lastMajorUpdate: '',
    hasServicePages: false,
    hasLocationPages: false,
    hasBlog: false,
    blogPostFrequency: '',
    existingContentAssets: [],
    technicalIssuesKnown: [],
    mobileResponsive: false,
    pageLoadSpeed: 'unknown',
    hasSSL: false,
    analyticsSetup: [],
  },
  toneVoice: {
    brandPersonality: [],
    communicationStyle: 'professional',
    targetEmotions: [],
    commonObjections: [],
    trustSignals: [],
    socialProofAvailable: [],
    competitorDifferentiators: [],
    messagingDontUse: [],
  },
  conversionMeasurement: {
    primaryConversionGoal: '',
    secondaryConversionGoals: [],
    currentConversionRate: '',
    leadSources: [],
    crmSystem: '',
    callTrackingSetup: false,
    formTrackingSetup: false,
    currentMonthlyTraffic: '',
    currentMonthlyLeads: '',
    leadQualificationProcess: '',
  },
  aiConsiderations: {
    awareOfAISearch: false,
    currentAIVisibility: 'unknown',
    hasStructuredData: false,
    hasFAQContent: false,
    voiceSearchOptimized: false,
    contentFormatPreferences: [],
    aiToolsCurrentlyUsing: [],
    openToAIContent: false,
  },
  status: 'draft',
  currentSection: 1,
};

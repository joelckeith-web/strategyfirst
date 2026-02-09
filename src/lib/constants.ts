export const APP_NAME = 'Competitor Analysis';
export const COMPANY_NAME = 'Atomic Souls Productions';

export const INDUSTRIES = [
  { value: 'home_services', label: 'Home Services' },
  { value: 'law_firm', label: 'Law Firm' },
] as const;

export const HOME_SERVICE_CATEGORIES = [
  'Plumbing',
  'HVAC',
  'Electrical',
  'Roofing',
  'Landscaping',
  'Pest Control',
  'Cleaning',
  'Handyman',
  'Painting',
  'Flooring',
  'Windows & Doors',
  'Pool Services',
  'Garage Doors',
  'Appliance Repair',
];

export const LAW_FIRM_CATEGORIES = [
  'Personal Injury',
  'Family Law',
  'Criminal Defense',
  'Estate Planning',
  'Business Law',
  'Real Estate',
  'Immigration',
  'Employment Law',
  'Bankruptcy',
  'Tax Law',
  'DUI/DWI',
  'Medical Malpractice',
];

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 20,
} as const;

export const API_ENDPOINTS = {
  analysis: '/api/analysis',
  analysisById: (id: string) => `/api/analysis/${id}`,
  clients: '/api/clients',
  clientById: (id: string) => `/api/clients/${id}`,
  clientLocations: (clientId: string) => `/api/clients/${clientId}/locations`,
  clientLocation: (clientId: string, locationId: string) =>
    `/api/clients/${clientId}/locations/${locationId}`,
  clientSessions: (clientId: string) => `/api/clients/${clientId}/sessions`,
} as const;

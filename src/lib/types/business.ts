export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: { lat: number; lng: number };
}

export interface BusinessInfo {
  id: string;
  name: string;
  address: Address;
  phone: string;
  website: string;
  industry: 'home_services' | 'law_firm';
  serviceArea: string[];
  categories: string[];
}

export interface Competitor extends BusinessInfo {
  competitorRank: 1 | 2 | 3;
  proximityScore: number;
  overlapScore: number;
}

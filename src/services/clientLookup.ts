import { BusinessInfo, Address } from '@/lib/types';
import { generateId } from '@/lib/utils/helpers';

export interface ClientLookupInput {
  businessName: string;
  location: string;
  industry: 'home_services' | 'law_firm';
}

export interface ClientLookupOutput {
  business: BusinessInfo;
  found: boolean;
}

// Parse location string into address components
function parseLocation(location: string): Partial<Address> {
  const parts = location.split(',').map(p => p.trim());
  return {
    city: parts[0] || '',
    state: parts[1] || '',
    street: '',
    zip: '',
  };
}

export async function clientLookup(input: ClientLookupInput): Promise<ClientLookupOutput> {
  // TODO: Integrate with actual API (Google Places, etc.)
  // Placeholder implementation returns mock data

  const locationParts = parseLocation(input.location);

  const mockBusiness: BusinessInfo = {
    id: generateId(),
    name: input.businessName,
    address: {
      street: '123 Main Street',
      city: locationParts.city || 'Unknown City',
      state: locationParts.state || 'Unknown State',
      zip: '12345',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    phone: '(555) 123-4567',
    website: `https://www.${input.businessName.toLowerCase().replace(/\s+/g, '')}.com`,
    industry: input.industry,
    serviceArea: [locationParts.city || 'Local Area'],
    categories: input.industry === 'home_services'
      ? ['General Services']
      : ['General Practice'],
  };

  return {
    business: mockBusiness,
    found: true,
  };
}

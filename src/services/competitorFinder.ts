import { BusinessInfo, Competitor } from '@/lib/types';
import { generateId } from '@/lib/utils/helpers';

export interface CompetitorFinderInput {
  client: BusinessInfo;
  maxCompetitors?: number;
}

export interface CompetitorFinderOutput {
  competitors: Competitor[];
  totalFound: number;
}

export async function competitorFinder(input: CompetitorFinderInput): Promise<CompetitorFinderOutput> {
  // TODO: Integrate with actual API to find competitors
  // Placeholder implementation returns mock competitors

  const { client, maxCompetitors = 3 } = input;
  const competitors: Competitor[] = [];

  const mockCompetitorNames = client.industry === 'home_services'
    ? ['Pro Services LLC', 'Quality Home Experts', 'Reliable Solutions Inc']
    : ['Smith & Associates', 'Johnson Law Group', 'Legal Eagles LLP'];

  for (let i = 0; i < Math.min(maxCompetitors, 3); i++) {
    const competitor: Competitor = {
      id: generateId(),
      name: mockCompetitorNames[i],
      address: {
        street: `${100 + i * 50} Business Ave`,
        city: client.address.city,
        state: client.address.state,
        zip: client.address.zip,
        coordinates: {
          lat: (client.address.coordinates?.lat || 40.7128) + (Math.random() - 0.5) * 0.1,
          lng: (client.address.coordinates?.lng || -74.006) + (Math.random() - 0.5) * 0.1,
        },
      },
      phone: `(555) ${200 + i}${300 + i}${400 + i}${500 + i}`,
      website: `https://www.${mockCompetitorNames[i].toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.com`,
      industry: client.industry,
      serviceArea: client.serviceArea,
      categories: client.categories,
      competitorRank: (i + 1) as 1 | 2 | 3,
      proximityScore: Math.round((0.9 - i * 0.15) * 100) / 100,
      overlapScore: Math.round((0.85 - i * 0.1) * 100) / 100,
    };
    competitors.push(competitor);
  }

  return {
    competitors,
    totalFound: competitors.length,
  };
}

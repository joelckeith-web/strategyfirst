import { BusinessInfo, Competitor, LocalSeoData, DirectoryListing, LocalKeywordRank } from '@/lib/types';

export interface LocalSeoAuditInput {
  client: BusinessInfo;
  competitors: Competitor[];
}

export interface LocalSeoAuditOutput {
  localSeo: LocalSeoData;
}

function generateDirectoryListings(): DirectoryListing[] {
  const directories = [
    'Yelp',
    'Yellow Pages',
    'BBB',
    'Angi',
    'HomeAdvisor',
    'Google Business',
    'Facebook',
    'Bing Places',
  ];

  return directories.map(dir => ({
    directory: dir,
    url: `https://www.${dir.toLowerCase().replace(/\s+/g, '')}.com/biz/example`,
    claimed: Math.random() > 0.2,
    consistent: Math.random() > 0.3,
    rating: Math.random() > 0.4 ? Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 : undefined,
    reviewCount: Math.random() > 0.4 ? Math.floor(Math.random() * 100) + 5 : undefined,
  }));
}

function generateLocalKeywordRankings(client: BusinessInfo, competitors: Competitor[]): LocalKeywordRank[] {
  const baseKeywords = client.industry === 'home_services'
    ? ['plumber', 'emergency plumbing', 'plumbing repair', 'water heater installation']
    : ['lawyer', 'attorney', 'legal services', 'law firm'];

  return baseKeywords.map(kw => ({
    keyword: `${kw} ${client.address.city}`,
    location: `${client.address.city}, ${client.address.state}`,
    mapPosition: Math.floor(Math.random() * 10) + 1,
    organicPosition: Math.floor(Math.random() * 20) + 1,
    competitorPositions: competitors.map(c => ({
      competitorId: c.id,
      mapPosition: Math.floor(Math.random() * 10) + 1,
      organicPosition: Math.floor(Math.random() * 20) + 1,
    })),
  }));
}

export async function localSeoAudit(input: LocalSeoAuditInput): Promise<LocalSeoAuditOutput> {
  // TODO: Integrate with actual local SEO APIs (BrightLocal, Whitespark, etc.)
  // Placeholder implementation returns mock data

  const { client, competitors } = input;

  const mockLocalSeo: LocalSeoData = {
    mapPackPosition: Math.floor(Math.random() * 5) + 1,
    citationConsistency: Math.floor(Math.random() * 30) + 70,
    napConsistency: Math.floor(Math.random() * 20) + 80,
    directoryListings: generateDirectoryListings(),
    proximityFactors: {
      distanceToCenter: Math.round(Math.random() * 10 * 10) / 10,
      serviceAreaCoverage: Math.floor(Math.random() * 30) + 70,
      competitorDensity: Math.floor(Math.random() * 50) + 20,
      marketSaturation: Math.floor(Math.random() * 40) + 30,
    },
    localKeywordRankings: generateLocalKeywordRankings(client, competitors),
  };

  return { localSeo: mockLocalSeo };
}

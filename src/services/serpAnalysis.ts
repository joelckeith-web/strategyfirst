import { BusinessInfo, Competitor, SerpAnalysis, KeywordRanking, OrganicResult, LocalPackResult } from '@/lib/types';

export interface SerpAnalysisInput {
  client: BusinessInfo;
  competitors: Competitor[];
  keywords?: string[];
}

export interface SerpAnalysisOutput {
  serp: SerpAnalysis;
}

function generateKeywords(client: BusinessInfo): string[] {
  const baseKeywords = client.industry === 'home_services'
    ? ['plumber near me', 'emergency plumbing', 'plumbing services', 'best plumber', 'affordable plumbing']
    : ['lawyer near me', 'legal services', 'attorney consultation', 'law firm', 'legal help'];

  return baseKeywords.map(kw =>
    `${kw} ${client.address.city}`.toLowerCase()
  );
}

export async function serpAnalysis(input: SerpAnalysisInput): Promise<SerpAnalysisOutput> {
  // TODO: Integrate with actual SERP API (SEMrush, Ahrefs, etc.)
  // Placeholder implementation returns mock data

  const { client, competitors } = input;
  const keywords = input.keywords || generateKeywords(client);

  const keywordRankings: KeywordRanking[] = keywords.map((keyword) => ({
    keyword,
    volume: Math.floor(Math.random() * 5000) + 500,
    difficulty: Math.floor(Math.random() * 60) + 20,
    clientRank: Math.floor(Math.random() * 20) + 1,
    competitorRanks: competitors.map(c => ({
      competitorId: c.id,
      rank: Math.floor(Math.random() * 15) + 1,
    })),
  }));

  const organicPositions: OrganicResult[] = [
    {
      position: 1,
      url: competitors[0]?.website || 'https://example.com',
      title: `${competitors[0]?.name || 'Competitor'} - Top Rated Services`,
      description: 'Professional services with 5-star reviews...',
      businessId: competitors[0]?.id,
    },
    {
      position: 2,
      url: client.website,
      title: `${client.name} - Quality Service Provider`,
      description: 'Trusted local business serving the community...',
      businessId: client.id,
    },
    {
      position: 3,
      url: competitors[1]?.website || 'https://example2.com',
      title: `${competitors[1]?.name || 'Competitor 2'} - Expert Solutions`,
      description: 'Experienced professionals ready to help...',
      businessId: competitors[1]?.id,
    },
  ];

  const localPackRankings: LocalPackResult[] = [
    {
      position: 1,
      businessId: competitors[0]?.id || '',
      name: competitors[0]?.name || 'Competitor 1',
      rating: 4.8,
      reviewCount: 245,
    },
    {
      position: 2,
      businessId: client.id,
      name: client.name,
      rating: 4.5,
      reviewCount: 127,
    },
    {
      position: 3,
      businessId: competitors[1]?.id || '',
      name: competitors[1]?.name || 'Competitor 2',
      rating: 4.6,
      reviewCount: 189,
    },
  ];

  return {
    serp: {
      keywords: keywordRankings,
      organicPositions,
      paidPositions: [],
      featuredSnippets: [],
      localPackRankings,
    },
  };
}

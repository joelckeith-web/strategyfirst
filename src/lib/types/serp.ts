export interface KeywordRanking {
  keyword: string;
  volume: number;
  difficulty: number;
  clientRank?: number;
  competitorRanks: { competitorId: string; rank: number }[];
}

export interface OrganicResult {
  position: number;
  url: string;
  title: string;
  description: string;
  businessId?: string;
}

export interface PaidResult {
  position: number;
  url: string;
  title: string;
  description: string;
  businessId?: string;
}

export interface FeaturedSnippet {
  keyword: string;
  type: 'paragraph' | 'list' | 'table';
  content: string;
  sourceUrl: string;
  businessId?: string;
}

export interface LocalPackResult {
  position: number;
  businessId: string;
  name: string;
  rating: number;
  reviewCount: number;
}

export interface SerpAnalysis {
  keywords: KeywordRanking[];
  organicPositions: OrganicResult[];
  paidPositions: PaidResult[];
  featuredSnippets: FeaturedSnippet[];
  localPackRankings: LocalPackResult[];
}

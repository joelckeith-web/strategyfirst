export interface DirectoryListing {
  directory: string;
  url: string;
  claimed: boolean;
  consistent: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface ProximityData {
  distanceToCenter: number;
  serviceAreaCoverage: number;
  competitorDensity: number;
  marketSaturation: number;
}

export interface LocalKeywordRank {
  keyword: string;
  location: string;
  mapPosition?: number;
  organicPosition?: number;
  competitorPositions: {
    competitorId: string;
    mapPosition?: number;
    organicPosition?: number;
  }[];
}

export interface LocalSeoData {
  mapPackPosition?: number;
  citationConsistency: number;
  napConsistency: number;
  directoryListings: DirectoryListing[];
  proximityFactors: ProximityData;
  localKeywordRankings: LocalKeywordRank[];
}

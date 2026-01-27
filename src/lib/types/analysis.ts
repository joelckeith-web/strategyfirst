import { BusinessInfo, Competitor } from './business';
import { SerpAnalysis } from './serp';
import { SeoMetrics } from './seo';
import { GbpData } from './gbp';
import { LocalSeoData } from './local';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface AnalysisRequest {
  businessName: string;
  location: string;
  industry: 'home_services' | 'law_firm';
  specificServices?: string[];
}

export interface AnalysisResult {
  id: string;
  status: AnalysisStatus;
  createdAt: Date;
  completedAt?: Date;
  client: BusinessInfo;
  competitors: Competitor[];
  serp: SerpAnalysis;
  seo: SeoMetrics;
  gbp: GbpData;
  localSeo: LocalSeoData;
  error?: string;
}

export interface AnalysisListItem {
  id: string;
  status: AnalysisStatus;
  businessName: string;
  location: string;
  industry: 'home_services' | 'law_firm';
  createdAt: Date;
  completedAt?: Date;
}

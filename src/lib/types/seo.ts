export interface BacklinkProfile {
  totalBacklinks: number;
  referringDomains: number;
  doFollowRatio: number;
  topReferrers: { domain: string; authority: number; links: number }[];
}

export interface TechnicalSeoAudit {
  mobileScore: number;
  pageSpeedDesktop: number;
  pageSpeedMobile: number;
  httpsEnabled: boolean;
  hasXmlSitemap: boolean;
  hasRobotsTxt: boolean;
  canonicalTagsValid: boolean;
  noIndexIssues: number;
  brokenLinks: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

export interface AeoMetrics {
  structuredDataScore: number;
  faqPresence: boolean;
  voiceSearchOptimization: number;
  answerBoxEligibility: number;
  schemaTypes: string[];
}

export interface SeoMetrics {
  domainAuthority: number;
  pageAuthority: number;
  backlinks: BacklinkProfile;
  technicalSeo: TechnicalSeoAudit;
  contentScore: number;
  aeoReadiness: AeoMetrics;
}

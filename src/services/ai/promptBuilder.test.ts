/**
 * Tests for Prompt Builder
 *
 * Unit tests for system prompt and data context building
 */

import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildDataContext,
  estimatePromptTokens,
  SYSTEM_PROMPT,
} from './promptBuilder';
import { mockAnalysisInput } from '@/test/fixtures/mockResponses';
import type { AIAnalysisInput } from '@/types/ai-analysis';

describe('PromptBuilder', () => {
  describe('SYSTEM_PROMPT constant', () => {
    it('should contain role definition', () => {
      expect(SYSTEM_PROMPT).toContain('expert digital marketing strategist');
    });

    it('should contain confidence scoring guidelines', () => {
      expect(SYSTEM_PROMPT).toContain('Confidence Scoring Guidelines');
      expect(SYSTEM_PROMPT).toContain('0.9-1.0');
      expect(SYSTEM_PROMPT).toContain('0.7-0.89');
    });

    it('should contain source attribution guidance', () => {
      expect(SYSTEM_PROMPT).toContain('Source Attribution');
      expect(SYSTEM_PROMPT).toContain('gbp');
      expect(SYSTEM_PROMPT).toContain('sitemap');
      expect(SYSTEM_PROMPT).toContain('websiteCrawl');
    });

    it('should contain Hub+Spoke methodology', () => {
      expect(SYSTEM_PROMPT).toContain('Hub+Spoke');
      expect(SYSTEM_PROMPT).toContain('3,000-5,000 words');
      expect(SYSTEM_PROMPT).toContain('1,500-2,200 words');
    });

    it('should contain AEO/Entity-First standards', () => {
      expect(SYSTEM_PROMPT).toContain('AEO');
      expect(SYSTEM_PROMPT).toContain('Entity-First');
      expect(SYSTEM_PROMPT).toContain('sameAs');
    });

    it('should contain competitor analysis requirements', () => {
      expect(SYSTEM_PROMPT).toContain('COMPETITOR ANALYSIS');
      expect(SYSTEM_PROMPT).toContain('Competitor Profile Requirements');
    });

    it('should contain ICP analysis requirements', () => {
      expect(SYSTEM_PROMPT).toContain('IDEAL CLIENT PROFILE');
      expect(SYSTEM_PROMPT).toContain('Demographics');
      expect(SYSTEM_PROMPT).toContain('Psychographics');
    });

    it('should contain SERP gap analysis requirements', () => {
      expect(SYSTEM_PROMPT).toContain('SERP GAP ANALYSIS');
      expect(SYSTEM_PROMPT).toContain('Competitor Weakness Detection');
    });

    it('should contain response structure definition', () => {
      expect(SYSTEM_PROMPT).toContain('Response Structure');
      expect(SYSTEM_PROMPT).toContain('"categories"');
      expect(SYSTEM_PROMPT).toContain('"insights"');
    });

    it('should require JSON-only output', () => {
      expect(SYSTEM_PROMPT).toContain('You MUST respond with valid JSON only');
    });
  });

  describe('buildSystemPrompt', () => {
    it('should include base system prompt', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain(SYSTEM_PROMPT);
    });

    it('should include field requirements', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Field Requirements by Category');
    });

    it('should include all 7 categories', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Business Context');
      expect(prompt).toContain('Revenue & Services');
      expect(prompt).toContain('Local SEO');
      expect(prompt).toContain('Website Readiness');
      expect(prompt).toContain('Tone & Voice');
      expect(prompt).toContain('Conversion & Measurement');
      expect(prompt).toContain('AI & AEO Considerations');
    });

    it('should include field definitions with types', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('companyName');
      expect(prompt).toContain('string');
      expect(prompt).toContain('primaryServices');
      expect(prompt).toContain('string[]');
    });

    it('should include field options where applicable', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('Solo');
      expect(prompt).toContain('2-5');
      expect(prompt).toContain('B2B');
      expect(prompt).toContain('B2C');
    });

    it('should include field ranges where applicable', () => {
      const prompt = buildSystemPrompt();
      expect(prompt).toContain('0-100');
      expect(prompt).toContain('0-5');
    });
  });

  describe('buildDataContext', () => {
    it('should include business information', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Business Information');
      expect(context).toContain(mockAnalysisInput.businessName);
      expect(context).toContain(mockAnalysisInput.website);
      expect(context).toContain(mockAnalysisInput.city!);
      expect(context).toContain(mockAnalysisInput.state!);
    });

    it('should include GBP data when available', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Google Business Profile Data');
      expect(context).toContain(JSON.stringify(mockAnalysisInput.gbp, null, 2));
    });

    it('should handle missing GBP data', () => {
      const inputWithoutGbp: AIAnalysisInput = {
        ...mockAnalysisInput,
        gbp: undefined,
      };

      const context = buildDataContext(inputWithoutGbp);

      expect(context).toContain('No GBP data available');
      expect(context).toContain('recommend claiming/optimizing GBP');
    });

    it('should include sitemap data when available', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Sitemap Analysis');
      expect(context).toContain(JSON.stringify(mockAnalysisInput.sitemap, null, 2));
    });

    it('should handle missing sitemap data', () => {
      const inputWithoutSitemap: AIAnalysisInput = {
        ...mockAnalysisInput,
        sitemap: undefined,
      };

      const context = buildDataContext(inputWithoutSitemap);

      expect(context).toContain('No sitemap found');
      expect(context).toContain('technical SEO issue');
    });

    it('should include website crawl data when available', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Website Crawl Data');
      expect(context).toContain(JSON.stringify(mockAnalysisInput.websiteCrawl, null, 2));
    });

    it('should handle missing website crawl data', () => {
      const inputWithoutCrawl: AIAnalysisInput = {
        ...mockAnalysisInput,
        websiteCrawl: undefined,
      };

      const context = buildDataContext(inputWithoutCrawl);

      expect(context).toContain('No website crawl data available');
    });

    it('should include competitor data when available', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Competitor Analysis');
      expect(context).toContain('competitive gaps and opportunities');
    });

    it('should handle missing competitor data', () => {
      const inputWithoutCompetitors: AIAnalysisInput = {
        ...mockAnalysisInput,
        competitors: undefined,
      };

      const context = buildDataContext(inputWithoutCompetitors);

      expect(context).toContain('No competitor data available');
    });

    it('should include SEO audit data when available', () => {
      const inputWithSeoAudit: AIAnalysisInput = {
        ...mockAnalysisInput,
        seoAudit: { score: 75, issues: [] },
      };

      const context = buildDataContext(inputWithSeoAudit);

      expect(context).toContain('SEO Audit Results');
    });

    it('should include citations data when available', () => {
      const inputWithCitations: AIAnalysisInput = {
        ...mockAnalysisInput,
        citations: [{ source: 'Yelp', url: 'https://yelp.com/biz/test' }],
      };

      const context = buildDataContext(inputWithCitations);

      expect(context).toContain('Business Citations');
    });

    it('should handle empty citations array', () => {
      const inputWithEmptyCitations: AIAnalysisInput = {
        ...mockAnalysisInput,
        citations: [],
      };

      const context = buildDataContext(inputWithEmptyCitations);

      expect(context).toContain('No citation data available');
    });

    it('should include analysis instructions', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Analysis Instructions');
      expect(context).toContain('Required Analysis');
      expect(context).toContain('Infer all 68+ intake fields');
    });

    it('should include Hub+Spoke analysis instructions', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Hub+Spoke Content Analysis');
      expect(context).toContain('Hub Page Standards');
      expect(context).toContain('Spoke Page Standards');
    });

    it('should include AEO analysis instructions', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('AEO (Answer Engine Optimization) Analysis');
      expect(context).toContain('Entity-First Checklist');
    });

    it('should include output reminder', () => {
      const context = buildDataContext(mockAnalysisInput);

      expect(context).toContain('Output Reminder');
      expect(context).toContain('valid JSON only');
    });

    it('should handle optional fields gracefully', () => {
      const minimalInput: AIAnalysisInput = {
        sessionId: 'test-123',
        businessName: 'Test',
        website: 'https://test.com',
      };

      const context = buildDataContext(minimalInput);

      expect(context).toContain('Test');
      expect(context).toContain('https://test.com');
      // Should not throw errors for missing optional fields
    });
  });

  describe('estimatePromptTokens', () => {
    it('should estimate tokens based on character count', () => {
      const systemPrompt = 'Hello world'; // 11 chars
      const dataContext = 'Test data'; // 9 chars
      // Total: 20 chars, with ~4 chars per token = 5 tokens

      const tokens = estimatePromptTokens(systemPrompt, dataContext);

      expect(tokens).toBe(Math.ceil(20 / 4));
    });

    it('should handle empty strings', () => {
      expect(estimatePromptTokens('', '')).toBe(0);
    });

    it('should provide reasonable estimate for real prompts', () => {
      const systemPrompt = buildSystemPrompt();
      const dataContext = buildDataContext(mockAnalysisInput);

      const tokens = estimatePromptTokens(systemPrompt, dataContext);

      // Should be a reasonable token count for the prompts
      expect(tokens).toBeGreaterThan(1000);
      expect(tokens).toBeLessThan(100000);
    });

    it('should scale linearly with content length', () => {
      const shortPrompt = 'a'.repeat(100);
      const longPrompt = 'a'.repeat(1000);

      const shortTokens = estimatePromptTokens(shortPrompt, '');
      const longTokens = estimatePromptTokens(longPrompt, '');

      expect(longTokens / shortTokens).toBeCloseTo(10, 0);
    });
  });

  describe('Prompt Integration', () => {
    it('should create a complete, usable prompt', () => {
      const systemPrompt = buildSystemPrompt();
      const dataContext = buildDataContext(mockAnalysisInput);

      // Should be valid strings
      expect(typeof systemPrompt).toBe('string');
      expect(typeof dataContext).toBe('string');

      // Should have reasonable lengths
      expect(systemPrompt.length).toBeGreaterThan(5000);
      expect(dataContext.length).toBeGreaterThan(500);
    });

    it('should maintain consistent structure', () => {
      const systemPrompt = buildSystemPrompt();

      // Should have structured sections
      expect(systemPrompt).toMatch(/## Your Role/);
      expect(systemPrompt).toMatch(/## Output Format/);
      expect(systemPrompt).toMatch(/## Response Structure/);
    });

    it('should properly escape special characters in data context', () => {
      const inputWithSpecialChars: AIAnalysisInput = {
        sessionId: 'test-123',
        businessName: 'Test "Business" & Co.',
        website: 'https://test.com/path?query=value&other=test',
        gbp: {
          name: 'Test "Business" & Co.',
          description: 'A great business with <strong>features</strong>',
        },
      };

      // Should not throw
      const context = buildDataContext(inputWithSpecialChars);

      // Should contain the escaped content (JSON.stringify handles this)
      expect(context).toContain('Test \\"Business\\"');
    });
  });
});

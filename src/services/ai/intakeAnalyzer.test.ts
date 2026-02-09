/**
 * Tests for Intake Analyzer Service
 *
 * Integration tests for the AI analysis orchestrator with mocked API responses
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeIntakeData, canAnalyze } from './intakeAnalyzer';
import * as claudeClientModule from './claudeClient';
import {
  mockClaudeSuccessResponse,
  mockAnalysisInput,
  mockCompleteResearchResults,
  mockPartialResearchResults,
  mockEmptyResearchResults,
} from '@/test/fixtures/mockResponses';

// Type for our mock fetch
type MockFetch = ReturnType<typeof vi.fn>;

describe('IntakeAnalyzer', () => {
  let mockFetch: MockFetch;

  beforeEach(() => {
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key-12345');
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('canAnalyze', () => {
    it('should return true when all research data is available', () => {
      const result = canAnalyze(mockCompleteResearchResults);
      expect(result.canAnalyze).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should return true when only GBP data is available', () => {
      const result = canAnalyze(mockPartialResearchResults);
      expect(result.canAnalyze).toBe(true);
    });

    it('should return true when only website data is available', () => {
      const result = canAnalyze({ websiteCrawl: { pages: [] } });
      expect(result.canAnalyze).toBe(true);
    });

    it('should return true when only sitemap data is available', () => {
      const result = canAnalyze({ sitemap: { urls: [] } });
      expect(result.canAnalyze).toBe(true);
    });

    it('should return false when no research data is available', () => {
      const result = canAnalyze(mockEmptyResearchResults);
      expect(result.canAnalyze).toBe(false);
      expect(result.reason).toContain('No research data available');
    });

    it('should return false when results contain only null values', () => {
      const result = canAnalyze({
        gbp: null,
        websiteCrawl: null,
        sitemap: null,
      });
      expect(result.canAnalyze).toBe(false);
    });
  });

  describe('analyzeIntakeData', () => {
    describe('Successful Analysis', () => {
      it('should successfully analyze research data', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data?.sessionId).toBe(mockAnalysisInput.sessionId);
        expect(result.data?.model).toBe('claude-sonnet-4-20250514');
      });

      it('should populate all category fields', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.categories.businessContext).toBeDefined();
        expect(result.data?.categories.revenueServices).toBeDefined();
        expect(result.data?.categories.localSEO).toBeDefined();
        expect(result.data?.categories.websiteReadiness).toBeDefined();
        expect(result.data?.categories.toneVoice).toBeDefined();
        expect(result.data?.categories.conversionMeasurement).toBeDefined();
        expect(result.data?.categories.aiConsiderations).toBeDefined();
      });

      it('should calculate confidence metrics', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.overallConfidence).toBeGreaterThan(0);
        expect(result.data?.overallConfidence).toBeLessThanOrEqual(1);
        expect(result.data?.fieldsAnalyzed).toBe(68);
        expect(typeof result.data?.fieldsWithHighConfidence).toBe('number');
        expect(typeof result.data?.fieldsWithLowConfidence).toBe('number');
      });

      it('should include token usage information', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.tokenUsage.input).toBe(15000);
        expect(result.data?.tokenUsage.output).toBe(4500);
        expect(result.data?.tokenUsage.total).toBe(19500);
      });

      it('should track processing time', async () => {
        // Add a small delay to ensure processing time is captured
        mockFetch.mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: () => Promise.resolve(mockClaudeSuccessResponse),
                  }),
                10
              )
            )
        );

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.processingTimeMs).toBeGreaterThanOrEqual(0);
      });

      it('should estimate cost correctly', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.estimatedCost).toBeDefined();
        expect(result.estimatedCost).toBeGreaterThan(0);
      });
    });

    describe('Strategic Insights', () => {
      it('should include content gaps', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.contentGaps).toBeDefined();
        expect(Array.isArray(result.data?.insights.contentGaps)).toBe(true);
      });

      it('should include competitor comparison', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.competitorComparison).toBeDefined();
        expect(result.data?.insights.competitorComparison.clientProfile).toBeDefined();
      });

      it('should include ICP analysis', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.icpAnalysis).toBeDefined();
        expect(result.data?.insights.icpAnalysis.primaryICP).toBeDefined();
      });

      it('should include SERP gap analysis', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.serpGapAnalysis).toBeDefined();
        expect(typeof result.data?.insights.serpGapAnalysis.overallOpportunityScore).toBe('number');
      });

      it('should include AEO strategy', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.aeoStrategy).toBeDefined();
        expect(result.data?.insights.aeoStrategy.aeoComplianceChecklist).toBeDefined();
      });

      it('should include hub-spoke analysis', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.hubSpokeAnalysis).toBeDefined();
        expect(typeof result.data?.insights.hubSpokeAnalysis.overallScore).toBe('number');
      });

      it('should include quick wins', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.insights.quickWins).toBeDefined();
        expect(Array.isArray(result.data?.insights.quickWins)).toBe(true);
      });
    });

    describe('Fallback Behavior', () => {
      it('should return fallback result when API key is not configured', async () => {
        // Mock isClaudeReady to return false (API not configured)
        vi.spyOn(claudeClientModule, 'isClaudeReady').mockReturnValue(false);

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data?.model).toBe('fallback');
        expect(result.data?.overallConfidence).toBe(0.2);
        expect(result.data?.warnings).toContain('AI analysis unavailable: ANTHROPIC_API_KEY not configured');
        expect(result.estimatedCost).toBe(0);

        vi.restoreAllMocks();
      });

      it('should return fallback result when API call fails', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({
            type: 'error',
            error: { type: 'server_error', message: 'Server error' },
          }),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data?.model).toBe('fallback');
        expect(result.data?.errors).toHaveLength(1);
      });

      it('should return fallback result when response parsing fails', async () => {
        // Return invalid JSON structure (missing categories)
        const invalidResponse = {
          ...mockClaudeSuccessResponse,
          content: [{ type: 'text', text: '{"invalid": "response"}' }],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(invalidResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data?.model).toBe('fallback');
      });

      it('should handle markdown code blocks in response', async () => {
        // Response wrapped in markdown code blocks
        const responseText = mockClaudeSuccessResponse.content[0].text;
        const wrappedResponse = {
          ...mockClaudeSuccessResponse,
          content: [{ type: 'text', text: '```json\n' + responseText + '\n```' }],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(wrappedResponse),
        });

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data?.model).toBe('claude-sonnet-4-20250514');
      });

      it('fallback should populate all category fields with defaults', async () => {
        // Mock isClaudeReady to return false (API not configured)
        vi.spyOn(claudeClientModule, 'isClaudeReady').mockReturnValue(false);

        const result = await analyzeIntakeData(mockAnalysisInput);

        // Business context should have user input values
        expect(result.data?.categories.businessContext.companyName.value).toBe(
          mockAnalysisInput.businessName
        );

        // Local SEO should have location from input
        expect(result.data?.categories.localSEO.primaryServiceArea.value).toContain(
          mockAnalysisInput.city!
        );

        // Website readiness should have SSL status
        expect(result.data?.categories.websiteReadiness.websiteUrl.value).toBe(
          mockAnalysisInput.website
        );

        vi.restoreAllMocks();
      });

      it('fallback should have low confidence scores', async () => {
        // Mock isClaudeReady to return false (API not configured)
        vi.spyOn(claudeClientModule, 'isClaudeReady').mockReturnValue(false);

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.data?.fieldsWithLowConfidence).toBe(68);
        expect(result.data?.fieldsWithHighConfidence).toBe(0);

        vi.restoreAllMocks();
      });
    });

    describe('Edge Cases', () => {
      it('should handle input with minimal data', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const minimalInput = {
          sessionId: 'test-123',
          businessName: 'Test',
          website: 'https://test.com',
        };

        const result = await analyzeIntakeData(minimalInput);

        expect(result.success).toBe(true);
      });

      it('should handle input with empty arrays', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockClaudeSuccessResponse),
        });

        const inputWithEmptyArrays = {
          ...mockAnalysisInput,
          competitors: [],
          citations: [],
        };

        const result = await analyzeIntakeData(inputWithEmptyArrays);

        expect(result.success).toBe(true);
      });

      it('should handle very long processing time', async () => {
        // Simulate slow response
        mockFetch.mockImplementationOnce(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: () => Promise.resolve(mockClaudeSuccessResponse),
                  }),
                100
              )
            )
        );

        const result = await analyzeIntakeData(mockAnalysisInput);

        expect(result.success).toBe(true);
        expect(result.data?.processingTimeMs).toBeGreaterThanOrEqual(100);
      });
    });
  });
});

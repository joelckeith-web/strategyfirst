/**
 * Tests for Claude AI Configuration
 *
 * Unit tests for config helpers, token estimation, and cost calculation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CLAUDE_MODELS,
  DEFAULT_MODEL,
  API_CONFIG,
  TOKEN_CONFIG,
  TOKEN_COSTS,
  ANALYSIS_CONFIG,
  getAnthropicApiKey,
  isClaudeConfigured,
  estimateTokenCount,
  estimateCost,
  getApiHeaders,
  getRetryDelay,
} from './config';

describe('Claude AI Configuration', () => {
  describe('Constants', () => {
    it('should have valid Claude model identifiers', () => {
      expect(CLAUDE_MODELS.SONNET).toBe('claude-sonnet-4-20250514');
      expect(CLAUDE_MODELS.OPUS).toBe('claude-opus-4-20250514');
      expect(CLAUDE_MODELS.HAIKU).toBe('claude-3-5-haiku-20241022');
    });

    it('should use Sonnet as default model', () => {
      expect(DEFAULT_MODEL).toBe(CLAUDE_MODELS.SONNET);
    });

    it('should have valid API configuration', () => {
      expect(API_CONFIG.baseUrl).toBe('https://api.anthropic.com/v1');
      expect(API_CONFIG.version).toBe('2023-06-01');
      expect(API_CONFIG.maxRetries).toBeGreaterThan(0);
      expect(API_CONFIG.timeoutMs).toBeGreaterThan(0);
    });

    it('should have valid token configuration', () => {
      expect(TOKEN_CONFIG.maxInputTokens).toBe(200000);
      expect(TOKEN_CONFIG.maxOutputTokens).toBe(8192);
      expect(TOKEN_CONFIG.charsPerToken).toBeGreaterThan(0);
    });

    it('should have token costs for all models', () => {
      expect(TOKEN_COSTS[CLAUDE_MODELS.SONNET]).toBeDefined();
      expect(TOKEN_COSTS[CLAUDE_MODELS.OPUS]).toBeDefined();
      expect(TOKEN_COSTS[CLAUDE_MODELS.HAIKU]).toBeDefined();

      // Verify cost structure
      for (const model of Object.values(CLAUDE_MODELS)) {
        expect(TOKEN_COSTS[model].input).toBeGreaterThan(0);
        expect(TOKEN_COSTS[model].output).toBeGreaterThan(0);
      }
    });

    it('should have valid analysis configuration', () => {
      expect(ANALYSIS_CONFIG.highConfidenceThreshold).toBeGreaterThan(0);
      expect(ANALYSIS_CONFIG.highConfidenceThreshold).toBeLessThanOrEqual(1);
      expect(ANALYSIS_CONFIG.lowConfidenceThreshold).toBeGreaterThan(0);
      expect(ANALYSIS_CONFIG.lowConfidenceThreshold).toBeLessThan(
        ANALYSIS_CONFIG.highConfidenceThreshold
      );
      expect(ANALYSIS_CONFIG.temperature).toBeGreaterThanOrEqual(0);
      expect(ANALYSIS_CONFIG.temperature).toBeLessThanOrEqual(1);
    });
  });

  describe('getAnthropicApiKey', () => {
    beforeEach(() => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key-12345');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return the API key when configured', () => {
      const apiKey = getAnthropicApiKey();
      expect(apiKey).toBe('test-api-key-12345');
    });

    it('should throw an error when API key is not configured', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', '');

      expect(() => getAnthropicApiKey()).toThrow('ANTHROPIC_API_KEY');
    });

    it('should throw an error when API key is undefined', () => {
      vi.unstubAllEnvs();
      delete process.env.ANTHROPIC_API_KEY;

      expect(() => getAnthropicApiKey()).toThrow('ANTHROPIC_API_KEY');
    });
  });

  describe('isClaudeConfigured', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return true when API key is configured', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-key');
      expect(isClaudeConfigured()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      vi.unstubAllEnvs();
      delete process.env.ANTHROPIC_API_KEY;
      expect(isClaudeConfigured()).toBe(false);
    });

    it('should return false when API key is empty string', () => {
      vi.stubEnv('ANTHROPIC_API_KEY', '');
      expect(isClaudeConfigured()).toBe(false);
    });
  });

  describe('estimateTokenCount', () => {
    it('should estimate tokens based on character count', () => {
      const text = 'Hello world'; // 11 characters
      const tokens = estimateTokenCount(text);

      // With 4 chars per token, 11 chars should be ~3 tokens (ceil)
      expect(tokens).toBe(Math.ceil(11 / TOKEN_CONFIG.charsPerToken));
    });

    it('should handle empty strings', () => {
      expect(estimateTokenCount('')).toBe(0);
    });

    it('should handle long text', () => {
      const longText = 'a'.repeat(10000);
      const tokens = estimateTokenCount(longText);

      expect(tokens).toBe(Math.ceil(10000 / TOKEN_CONFIG.charsPerToken));
    });

    it('should round up token counts', () => {
      // 5 characters with 4 chars/token should be 2 tokens (not 1.25)
      const text = '12345';
      expect(estimateTokenCount(text)).toBe(2);
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost for Sonnet model', () => {
      const inputTokens = 1000000; // 1M tokens
      const outputTokens = 100000; // 100K tokens

      const cost = estimateCost(inputTokens, outputTokens, CLAUDE_MODELS.SONNET);

      // Sonnet: $3 per 1M input, $15 per 1M output
      const expectedCost = 3.0 + 1.5; // $3 input + $1.5 output
      expect(cost).toBeCloseTo(expectedCost, 2);
    });

    it('should calculate cost for Opus model', () => {
      const inputTokens = 1000000;
      const outputTokens = 100000;

      const cost = estimateCost(inputTokens, outputTokens, CLAUDE_MODELS.OPUS);

      // Opus: $15 per 1M input, $75 per 1M output
      const expectedCost = 15.0 + 7.5;
      expect(cost).toBeCloseTo(expectedCost, 2);
    });

    it('should calculate cost for Haiku model', () => {
      const inputTokens = 1000000;
      const outputTokens = 100000;

      const cost = estimateCost(inputTokens, outputTokens, CLAUDE_MODELS.HAIKU);

      // Haiku: $0.8 per 1M input, $4 per 1M output
      const expectedCost = 0.8 + 0.4;
      expect(cost).toBeCloseTo(expectedCost, 2);
    });

    it('should use default model when not specified', () => {
      const inputTokens = 10000;
      const outputTokens = 5000;

      const cost = estimateCost(inputTokens, outputTokens);
      const costWithDefault = estimateCost(inputTokens, outputTokens, DEFAULT_MODEL);

      expect(cost).toBe(costWithDefault);
    });

    it('should handle zero tokens', () => {
      expect(estimateCost(0, 0)).toBe(0);
    });

    it('should handle typical analysis usage', () => {
      // Typical analysis: 15K input, 4.5K output
      const cost = estimateCost(15000, 4500, CLAUDE_MODELS.SONNET);

      // Expected: (15000/1M * $3) + (4500/1M * $15) = $0.045 + $0.0675 = $0.1125
      expect(cost).toBeCloseTo(0.1125, 4);
    });
  });

  describe('getApiHeaders', () => {
    it('should return correct headers', () => {
      const apiKey = 'test-key-123';
      const headers = getApiHeaders(apiKey);

      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': API_CONFIG.version,
      });
    });

    it('should include the correct API version', () => {
      const headers = getApiHeaders('any-key');
      expect(headers['anthropic-version']).toBe('2023-06-01');
    });
  });

  describe('getRetryDelay', () => {
    it('should calculate exponential backoff', () => {
      // Attempt 0: 1000ms
      expect(getRetryDelay(0)).toBe(API_CONFIG.initialRetryDelayMs);

      // Attempt 1: 2000ms
      expect(getRetryDelay(1)).toBe(API_CONFIG.initialRetryDelayMs * 2);

      // Attempt 2: 4000ms
      expect(getRetryDelay(2)).toBe(API_CONFIG.initialRetryDelayMs * 4);
    });

    it('should cap delay at maxRetryDelayMs', () => {
      // Very high attempt number should still cap at max
      const delay = getRetryDelay(100);
      expect(delay).toBe(API_CONFIG.maxRetryDelayMs);
    });

    it('should not exceed max delay for reasonable attempt counts', () => {
      for (let attempt = 0; attempt <= 10; attempt++) {
        const delay = getRetryDelay(attempt);
        expect(delay).toBeLessThanOrEqual(API_CONFIG.maxRetryDelayMs);
      }
    });
  });
});

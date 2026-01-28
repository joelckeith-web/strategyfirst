/**
 * Claude AI Configuration
 *
 * Model settings, API configuration, and environment handling
 * for the Claude API integration.
 */

/**
 * Available Claude models and their identifiers
 */
export const CLAUDE_MODELS = {
  // Recommended for this use case - best balance of cost, speed, quality
  SONNET: 'claude-sonnet-4-20250514',
  // Higher quality but more expensive
  OPUS: 'claude-opus-4-20250514',
  // Faster and cheaper for simpler tasks
  HAIKU: 'claude-3-5-haiku-20241022',
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * Default model for intake analysis
 * Using Sonnet for optimal cost/performance balance
 */
export const DEFAULT_MODEL: ClaudeModel = CLAUDE_MODELS.SONNET;

/**
 * API configuration settings
 */
export const API_CONFIG = {
  baseUrl: 'https://api.anthropic.com/v1',
  version: '2023-06-01',
  maxRetries: 3,
  initialRetryDelayMs: 1000,
  maxRetryDelayMs: 30000,
  timeoutMs: 120000, // 2 minutes - analysis can take time
} as const;

/**
 * Token limits and estimation
 */
export const TOKEN_CONFIG = {
  // Model context limits
  maxInputTokens: 200000, // Sonnet/Opus support 200k context
  maxOutputTokens: 8192, // Requested output limit

  // Estimation factors (rough approximations)
  charsPerToken: 4, // Average characters per token
  jsonOverhead: 1.2, // JSON formatting overhead multiplier
} as const;

/**
 * Cost per million tokens (USD) - for estimation purposes
 */
export const TOKEN_COSTS = {
  [CLAUDE_MODELS.SONNET]: {
    input: 3.0,
    output: 15.0,
  },
  [CLAUDE_MODELS.OPUS]: {
    input: 15.0,
    output: 75.0,
  },
  [CLAUDE_MODELS.HAIKU]: {
    input: 0.8,
    output: 4.0,
  },
} as const;

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Requests per minute (conservative estimate)
  requestsPerMinute: 50,
  // Tokens per minute (conservative estimate)
  tokensPerMinute: 100000,
} as const;

/**
 * Analysis-specific settings
 */
export const ANALYSIS_CONFIG = {
  // Minimum confidence threshold for "high confidence" classification
  highConfidenceThreshold: 0.7,
  // Maximum confidence for "low confidence" classification
  lowConfidenceThreshold: 0.4,
  // Default confidence when AI is uncertain
  defaultUncertainConfidence: 0.5,
  // Temperature setting for analysis (lower = more deterministic)
  temperature: 0.3,
} as const;

/**
 * Get the Anthropic API key from environment
 * @throws Error if key is not configured
 */
export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not configured. ' +
        'Please add it to your .env.local file.'
    );
  }

  return apiKey;
}

/**
 * Check if Claude AI is configured
 */
export function isClaudeConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Estimate token count for a string
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / TOKEN_CONFIG.charsPerToken);
}

/**
 * Estimate cost for a request
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: ClaudeModel = DEFAULT_MODEL
): number {
  const costs = TOKEN_COSTS[model];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

/**
 * Get headers for Anthropic API requests
 */
export function getApiHeaders(apiKey: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': API_CONFIG.version,
  };
}

/**
 * Calculate exponential backoff delay
 */
export function getRetryDelay(attempt: number): number {
  const delay = API_CONFIG.initialRetryDelayMs * Math.pow(2, attempt);
  return Math.min(delay, API_CONFIG.maxRetryDelayMs);
}

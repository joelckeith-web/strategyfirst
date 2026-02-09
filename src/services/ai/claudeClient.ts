/**
 * Claude API Client
 *
 * Singleton client for interacting with the Anthropic Claude API.
 * Includes error handling, retries, and rate limiting support.
 */

import {
  API_CONFIG,
  TOKEN_CONFIG,
  DEFAULT_MODEL,
  getAnthropicApiKey,
  getApiHeaders,
  getRetryDelay,
  type ClaudeModel,
} from '@/lib/ai/config';

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Message content for API request
 */
export interface MessageContent {
  role: MessageRole;
  content: string;
}

/**
 * API request structure
 */
export interface ClaudeRequest {
  model: ClaudeModel;
  max_tokens: number;
  temperature?: number;
  system?: string;
  messages: MessageContent[];
}

/**
 * Token usage from API response
 */
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

/**
 * API response structure
 */
export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: Array<{
    type: 'text';
    text: string;
  }>;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  stop_sequence: string | null;
  usage: TokenUsage;
}

/**
 * Error response from API
 */
export interface ClaudeErrorResponse {
  type: 'error';
  error: {
    type: string;
    message: string;
  };
}

/**
 * Client error types
 */
export type ClaudeErrorType =
  | 'api_key_missing'
  | 'rate_limited'
  | 'timeout'
  | 'invalid_request'
  | 'server_error'
  | 'network_error'
  | 'parse_error';

/**
 * Custom error class for Claude API errors
 */
export class ClaudeAPIError extends Error {
  constructor(
    message: string,
    public readonly type: ClaudeErrorType,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'ClaudeAPIError';
  }
}

/**
 * Result wrapper for API calls
 */
export interface ClaudeResult {
  success: boolean;
  data?: {
    content: string;
    usage: TokenUsage;
    model: string;
    stopReason: string;
  };
  error?: {
    type: ClaudeErrorType;
    message: string;
    retryable: boolean;
  };
}

/**
 * Claude API Client class
 */
class ClaudeClient {
  private apiKey: string | null = null;

  /**
   * Get or initialize the API key
   */
  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = getAnthropicApiKey();
    }
    return this.apiKey;
  }

  /**
   * Check if the client is configured
   */
  isConfigured(): boolean {
    try {
      this.getApiKey();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(
    messages: MessageContent[],
    options: {
      model?: ClaudeModel;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    } = {}
  ): Promise<ClaudeResult> {
    const {
      model = DEFAULT_MODEL,
      maxTokens = 8192,
      temperature = 0.3,
      system,
    } = options;

    let lastError: ClaudeAPIError | null = null;

    for (let attempt = 0; attempt <= API_CONFIG.maxRetries; attempt++) {
      try {
        const result = await this.makeRequest({
          model,
          max_tokens: maxTokens,
          temperature,
          system,
          messages,
        });

        return {
          success: true,
          data: {
            content: result.content[0]?.text || '',
            usage: result.usage,
            model: result.model,
            stopReason: result.stop_reason,
          },
        };
      } catch (error) {
        if (error instanceof ClaudeAPIError) {
          lastError = error;

          // Don't retry non-retryable errors
          if (!error.retryable) {
            break;
          }

          // Wait before retrying
          if (attempt < API_CONFIG.maxRetries) {
            const delay = getRetryDelay(attempt);
            console.log(
              `Claude API retry ${attempt + 1}/${API_CONFIG.maxRetries} after ${delay}ms`
            );
            await this.sleep(delay);
          }
        } else {
          // Unknown error type
          lastError = new ClaudeAPIError(
            error instanceof Error ? error.message : 'Unknown error',
            'network_error',
            undefined,
            true
          );
        }
      }
    }

    return {
      success: false,
      error: {
        type: lastError?.type || 'network_error',
        message: lastError?.message || 'Unknown error occurred',
        retryable: lastError?.retryable || false,
      },
    };
  }

  /**
   * Make the actual API request
   */
  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    const apiKey = this.getApiKey();
    const url = `${API_CONFIG.baseUrl}/messages`;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.timeoutMs
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(apiKey),
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return data as ClaudeResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ClaudeAPIError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ClaudeAPIError(
            'Request timed out',
            'timeout',
            undefined,
            true
          );
        }
        throw new ClaudeAPIError(error.message, 'network_error', undefined, true);
      }

      throw new ClaudeAPIError('Unknown error', 'network_error', undefined, true);
    }
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}`;
    let errorType: ClaudeErrorType = 'server_error';
    let retryable = false;

    try {
      const errorData = (await response.json()) as ClaudeErrorResponse;
      errorMessage = errorData.error?.message || errorMessage;

      // Determine error type based on status code and error type
      switch (response.status) {
        case 400:
          errorType = 'invalid_request';
          break;
        case 401:
          errorType = 'api_key_missing';
          break;
        case 429:
          errorType = 'rate_limited';
          retryable = true;
          break;
        case 500:
        case 502:
        case 503:
        case 529:
          errorType = 'server_error';
          retryable = true;
          break;
      }
    } catch {
      // Failed to parse error response
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new ClaudeAPIError(errorMessage, errorType, response.status, retryable);
  }

  /**
   * Sleep helper for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Analyze research data and return structured JSON response
   * This is a convenience method for the intake analysis use case
   */
  async analyzeResearchData(
    systemPrompt: string,
    dataContext: string,
    options: {
      model?: ClaudeModel;
      temperature?: number;
    } = {}
  ): Promise<ClaudeResult> {
    return this.sendMessage(
      [
        {
          role: 'user',
          content: dataContext,
        },
      ],
      {
        ...options,
        system: systemPrompt,
        maxTokens: TOKEN_CONFIG.maxOutputTokens,
      }
    );
  }
}

// Singleton instance
let clientInstance: ClaudeClient | null = null;

/**
 * Get the singleton Claude client instance
 */
export function getClaudeClient(): ClaudeClient {
  if (!clientInstance) {
    clientInstance = new ClaudeClient();
  }
  return clientInstance;
}

/**
 * Check if Claude API is configured
 */
export function isClaudeReady(): boolean {
  return getClaudeClient().isConfigured();
}

export { ClaudeClient };

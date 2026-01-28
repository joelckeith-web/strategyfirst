/**
 * Vitest Test Setup
 *
 * Global setup for all tests including environment mocking
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', 'test-api-key-12345');
  vi.stubEnv('NODE_ENV', 'test');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// Global fetch mock setup (can be overridden in individual tests)
global.fetch = vi.fn();

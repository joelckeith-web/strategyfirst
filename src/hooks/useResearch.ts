'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  ResearchInput,
  ResearchSession,
  ResearchStatus,
  ResearchProgress,
  ResearchResults,
  ResearchError,
} from '@/types/research';

interface UseResearchOptions {
  pollingInterval?: number; // Default 3000ms
  autoStartPolling?: boolean;
}

interface UseResearchReturn {
  // State
  sessionId: string | null;
  status: ResearchStatus | null;
  progress: ResearchProgress | null;
  results: Partial<ResearchResults> | null;
  errors: ResearchError[];
  isLoading: boolean;
  isPolling: boolean;

  // Actions
  startResearch: (input: ResearchInput) => Promise<string | null>;
  pollStatus: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  reset: () => void;
}

export function useResearch(options: UseResearchOptions = {}): UseResearchReturn {
  const { pollingInterval = 3000, autoStartPolling = true } = options;

  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ResearchStatus | null>(null);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [results, setResults] = useState<Partial<ResearchResults> | null>(null);
  const [errors, setErrors] = useState<ResearchError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Refs for polling
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Keep sessionIdRef in sync
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Start research
  const startResearch = useCallback(async (input: ResearchInput): Promise<string | null> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/research/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start research');
      }

      const data = await response.json();
      const newSessionId = data.sessionId;

      setSessionId(newSessionId);
      setStatus(data.status || 'pending');
      setProgress({
        currentStep: 'initializing',
        completedSteps: [],
        failedSteps: [],
        percentage: 0,
      });

      // Start polling if auto-start is enabled
      if (autoStartPolling) {
        startPollingInternal(newSessionId);
      }

      return newSessionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors([{
        step: 'trigger',
        code: 'TRIGGER_FAILED',
        message: errorMessage,
        recoverable: true,
      }]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [autoStartPolling]);

  // Poll status
  const pollStatus = useCallback(async (): Promise<void> => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const response = await fetch(`/api/research/status/${currentSessionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Session not found - stop polling
          stopPolling();
          setErrors(prev => [...prev, {
            step: 'poll',
            code: 'SESSION_NOT_FOUND',
            message: 'Research session not found',
            recoverable: false,
          }]);
          return;
        }
        throw new Error('Failed to fetch status');
      }

      const data = await response.json();

      setStatus(data.status);
      setProgress(data.progress);
      setResults(data.results);
      if (data.errors?.length) {
        setErrors(data.errors);
      }

      // Stop polling if research is complete
      if (['completed', 'failed', 'partial', 'timeout'].includes(data.status)) {
        stopPolling();
      }
    } catch (error) {
      console.error('Error polling research status:', error);
      // Don't stop polling on transient errors
    }
  }, []);

  // Internal start polling with session ID
  const startPollingInternal = useCallback((sid: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    setIsPolling(true);
    sessionIdRef.current = sid;

    // Initial poll
    pollStatus();

    // Set up interval
    pollingRef.current = setInterval(() => {
      pollStatus();
    }, pollingInterval);
  }, [pollingInterval, pollStatus]);

  // Start polling (public)
  const startPolling = useCallback(() => {
    if (sessionId) {
      startPollingInternal(sessionId);
    }
  }, [sessionId, startPollingInternal]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    stopPolling();
    setSessionId(null);
    setStatus(null);
    setProgress(null);
    setResults(null);
    setErrors([]);
    setIsLoading(false);
  }, [stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    sessionId,
    status,
    progress,
    results,
    errors,
    isLoading,
    isPolling,
    startResearch,
    pollStatus,
    startPolling,
    stopPolling,
    reset,
  };
}

// Helper hook for resuming an existing session
export function useResearchSession(
  existingSessionId: string | null,
  options: UseResearchOptions = {}
): UseResearchReturn {
  const research = useResearch({ ...options, autoStartPolling: false });

  useEffect(() => {
    if (existingSessionId && existingSessionId !== research.sessionId) {
      // Manually set session ID and start polling
      research.reset();
      // We need to trigger a poll for the existing session
      // This is a bit of a workaround since we can't directly set sessionId
    }
  }, [existingSessionId]);

  return research;
}

export default useResearch;

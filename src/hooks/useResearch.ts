'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import type {
  ResearchStatus,
  ResearchProgress,
  ResearchResults,
  ResearchError,
} from '@/types/research';

interface ResearchInput {
  businessName: string;
  website?: string;
  websiteUrl?: string;
  city?: string;
  state?: string;
  location?: string;
  serviceAreas?: string[];
  industry?: string;
  primaryServices?: string[];
  gbpUrl?: string;
}

interface UseResearchOptions {
  pollingInterval?: number; // Default 3000ms
  useRealtime?: boolean; // Use Supabase realtime instead of polling
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
  loadSession: (sessionId: string) => Promise<void>;
}

export function useResearch(options: UseResearchOptions = {}): UseResearchReturn {
  const { pollingInterval = 3000, useRealtime = true } = options;

  // State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<ResearchStatus | null>(null);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [results, setResults] = useState<Partial<ResearchResults> | null>(null);
  const [errors, setErrors] = useState<ResearchError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Refs for polling and realtime
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Keep sessionIdRef in sync
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // Update state from session data
  const updateFromSession = useCallback((session: {
    id: string;
    status: string;
    progress: unknown;
    results: unknown;
    errors: unknown;
  }) => {
    setStatus(session.status as ResearchStatus);
    setProgress(session.progress as ResearchProgress);
    setResults(session.results as Partial<ResearchResults>);
    if (session.errors && Array.isArray(session.errors)) {
      setErrors(session.errors as ResearchError[]);
    }
  }, []);

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

      // Set up realtime subscription or start polling
      if (useRealtime) {
        setupRealtimeSubscription(newSessionId);
      } else {
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
  }, [useRealtime]);

  // Set up Supabase realtime subscription
  const setupRealtimeSubscription = useCallback((sid: string) => {
    // Clean up any existing subscription
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`research-${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'research_sessions',
          filter: `id=eq.${sid}`,
        },
        (payload) => {
          const newSession = payload.new as {
            id: string;
            status: string;
            progress: unknown;
            results: unknown;
            errors: unknown;
          };
          updateFromSession(newSession);

          // Stop subscription if research is complete
          if (['completed', 'failed', 'partial', 'timeout'].includes(newSession.status)) {
            if (realtimeChannelRef.current) {
              supabase.removeChannel(realtimeChannelRef.current);
              realtimeChannelRef.current = null;
            }
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
    setIsPolling(true);
  }, [updateFromSession]);

  // Poll status (fallback when realtime is not used)
  const pollStatus = useCallback(async (): Promise<void> => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    try {
      const response = await fetch(`/api/research/status/${currentSessionId}`);

      if (!response.ok) {
        if (response.status === 404) {
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
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Load an existing session
  const loadSession = useCallback(async (sid: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/research/status/${sid}`);

      if (!response.ok) {
        throw new Error('Session not found');
      }

      const data = await response.json();

      setSessionId(sid);
      setStatus(data.status);
      setProgress(data.progress);
      setResults(data.results);
      if (data.errors?.length) {
        setErrors(data.errors);
      }

      // If session is still running, set up monitoring
      if (data.status === 'running' || data.status === 'pending') {
        if (useRealtime) {
          setupRealtimeSubscription(sid);
        } else {
          startPollingInternal(sid);
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setErrors([{
        step: 'load',
        code: 'LOAD_FAILED',
        message: error instanceof Error ? error.message : 'Failed to load session',
        recoverable: false,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [useRealtime, setupRealtimeSubscription, startPollingInternal]);

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
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
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
    loadSession,
  };
}

/**
 * Hook for loading and monitoring an existing research session
 */
export function useResearchSession(
  existingSessionId: string | null,
  options: UseResearchOptions = {}
): UseResearchReturn {
  const research = useResearch(options);

  useEffect(() => {
    if (existingSessionId && existingSessionId !== research.sessionId) {
      research.loadSession(existingSessionId);
    }
  }, [existingSessionId, research.sessionId, research.loadSession]);

  return research;
}

export default useResearch;

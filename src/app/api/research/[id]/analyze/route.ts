import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { analyzeIntakeData, canAnalyze } from '@/services/ai';
import { isClaudeConfigured } from '@/lib/ai/config';
import type { AIAnalysisInput } from '@/types/ai-analysis';
import type { ResearchSession, Json } from '@/lib/supabase/types';

// Extend Vercel function timeout for AI analysis (Claude API can take 60-120s)
export const maxDuration = 180; // 3 minutes

/**
 * POST /api/research/[id]/analyze
 *
 * Triggers AI analysis of research data for a session.
 * Stores results in the session's results.aiAnalysis field.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch the research session
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      console.error('Failed to fetch session:', fetchError);
      return NextResponse.json(
        { error: 'Research session not found' },
        { status: 404 }
      );
    }

    // Cast to proper type
    const session = sessionData as unknown as ResearchSession;

    // Check if research is complete
    if (session.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Research must be completed before analysis',
          status: session.status,
        },
        { status: 400 }
      );
    }

    // Parse results
    const results = session.results as Record<string, unknown>;
    const input = session.input as {
      businessName: string;
      website: string;
      city?: string;
      state?: string;
      industry?: string;
    };

    // Check if we have enough data to analyze
    const analyzeCheck = canAnalyze(results);
    if (!analyzeCheck.canAnalyze) {
      return NextResponse.json(
        { error: analyzeCheck.reason },
        { status: 400 }
      );
    }

    // Check if AI is configured
    if (!isClaudeConfigured()) {
      console.warn('ANTHROPIC_API_KEY not configured - analysis will use fallback');
    }

    // Update progress to show analysis is running
    await supabaseAdmin
      .from('research_sessions')
      .update({
        progress: {
          ...(session.progress as object),
          currentStep: 'aiAnalysis',
          phase: 'AI Analysis in progress...',
        },
      } as never)
      .eq('id', sessionId);

    // Check if manual input is available (from verification)
    const manualInput = results.manualInput as Record<string, Record<string, unknown>> | undefined;
    const hasManualInput = manualInput && Object.keys(manualInput).length > 0;

    if (hasManualInput) {
      console.log('Re-analyzing with manual input from verification');
    }

    // Build analysis input
    const analysisInput: AIAnalysisInput = {
      sessionId,
      businessName: input.businessName,
      website: input.website,
      city: input.city,
      state: input.state,
      industry: input.industry,
      gbp: results.gbp as Record<string, unknown> | undefined,
      sitemap: results.sitemap as Record<string, unknown> | undefined,
      websiteCrawl: results.websiteCrawl as Record<string, unknown> | undefined,
      competitors: results.competitors as Record<string, unknown>[] | undefined,
      seoAudit: results.seoAudit as Record<string, unknown> | undefined,
      citations: results.citations as Record<string, unknown>[] | undefined,
      manualInput,
    };

    // Run the analysis
    const analysisResult = await analyzeIntakeData(analysisInput);

    if (!analysisResult.success || !analysisResult.data) {
      // Update progress to show analysis failed
      await supabaseAdmin
        .from('research_sessions')
        .update({
          progress: {
            ...(session.progress as object),
            currentStep: 'complete',
            failedSteps: [
              ...((session.progress as { failedSteps?: string[] })?.failedSteps || []),
              'aiAnalysis',
            ],
          },
          errors: [
            ...((session.errors as Array<{ step: string; message: string }>) || []),
            { step: 'aiAnalysis', message: analysisResult.error || 'Unknown error' },
          ],
        } as never)
        .eq('id', sessionId);

      return NextResponse.json(
        { error: analysisResult.error || 'Analysis failed' },
        { status: 500 }
      );
    }

    // Store analysis results
    const updatedResults = {
      ...results,
      aiAnalysis: analysisResult.data,
    };

    // Get current progress
    const currentProgress = session.progress as {
      completedSteps?: string[];
      failedSteps?: string[];
      percentage?: number;
    };

    const completedSteps = [
      ...(currentProgress.completedSteps || []),
      'aiAnalysis',
    ];

    // Update session with analysis results
    await supabaseAdmin
      .from('research_sessions')
      .update({
        results: updatedResults,
        progress: {
          currentStep: 'complete',
          completedSteps,
          failedSteps: currentProgress.failedSteps || [],
          percentage: 100,
          phase: 'Analysis complete',
        },
      } as never)
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      data: {
        analyzedAt: analysisResult.data.analyzedAt,
        model: analysisResult.data.model,
        overallConfidence: analysisResult.data.overallConfidence,
        fieldsAnalyzed: analysisResult.data.fieldsAnalyzed,
        fieldsWithHighConfidence: analysisResult.data.fieldsWithHighConfidence,
        fieldsWithLowConfidence: analysisResult.data.fieldsWithLowConfidence,
        dataQualityScore: analysisResult.data.dataQualityScore,
        tokenUsage: analysisResult.data.tokenUsage,
        processingTimeMs: analysisResult.data.processingTimeMs,
        estimatedCost: analysisResult.estimatedCost,
        insightsSummary: {
          contentGaps: analysisResult.data.insights.contentGaps.length,
          competitiveInsights: analysisResult.data.insights.competitiveInsights.length,
          suggestedKeywords: analysisResult.data.insights.suggestedKeywords.length,
          quickWins: analysisResult.data.insights.quickWins.length,
        },
      },
    });
  } catch (error) {
    console.error('Error in analyze endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to analyze research data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/[id]/analyze
 *
 * Returns the AI analysis results for a session if available.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch the research session
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('results')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      return NextResponse.json(
        { error: 'Research session not found' },
        { status: 404 }
      );
    }

    const session = sessionData as unknown as { results: Json };
    const results = session.results as Record<string, unknown>;

    if (!results.aiAnalysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis not yet performed',
          canAnalyze: canAnalyze(results).canAnalyze,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      data: results.aiAnalysis,
    });
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis results' },
      { status: 500 }
    );
  }
}

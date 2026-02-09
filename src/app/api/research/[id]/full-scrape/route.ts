import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { crawlWebsite } from '@/services/apify/websiteCrawler';
import { enrichCrawlResult } from '@/lib/transformers/enrich-pages';
import type { ResearchSession } from '@/lib/supabase/types';

// Allow up to 5 minutes for full site crawl (Vercel limit)
export const maxDuration = 300;

/**
 * POST /api/research/[id]/full-scrape
 *
 * Triggers an unlimited crawl for a completed research session.
 * Replaces the existing websiteCrawl data with full results.
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

    const session = sessionData as unknown as ResearchSession;

    // Check if research is complete
    if (session.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Research must be completed before running full scrape',
          status: session.status,
        },
        { status: 400 }
      );
    }

    // Get data from session
    const results = session.results as Record<string, unknown>;
    const input = session.input as {
      businessName: string;
      website: string;
    };

    if (!input.website) {
      return NextResponse.json(
        { error: 'No website URL found in session data' },
        { status: 400 }
      );
    }

    // Get sitemap URLs from session if available
    const sitemapData = results.sitemap as {
      urls?: Array<{ url: string; lastmod?: string | null }>;
    } | undefined;
    const sitemapUrlStrings: string[] = (sitemapData?.urls || []).map(
      (item: { url: string }) => item.url
    );

    console.log(`Starting full scrape for session ${sessionId}: ${input.website}`);

    // Run unlimited crawl
    const crawlResult = await crawlWebsite(input.website, {
      lightweight: false,
      maxPages: 10000,
      maxDepth: 8,
      sitemapUrls: sitemapUrlStrings,
    });

    if (!crawlResult.success || crawlResult.pages.length === 0) {
      console.error('Full scrape failed:', crawlResult.error);
      return NextResponse.json(
        { error: crawlResult.error || 'Full scrape failed - no pages returned' },
        { status: 500 }
      );
    }

    // Process results using shared utility (no page limit for full scrape)
    const enriched = enrichCrawlResult(
      crawlResult.pages,
      input.website,
      input.businessName
    );
    // Full scrape has no meaningful limit
    enriched.pageLimitReached = false;

    // Merge into existing session results
    const updatedResults = {
      ...results,
      websiteCrawl: enriched,
    };

    await supabaseAdmin
      .from('research_sessions')
      .update({
        results: updatedResults,
      } as never)
      .eq('id', sessionId);

    console.log(`Full scrape completed for session ${sessionId}: ${enriched.totalPages} pages`);

    return NextResponse.json({
      success: true,
      sessionId,
      data: {
        websiteCrawl: enriched,
      },
    });
  } catch (error) {
    console.error('Error in full-scrape endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to run full scrape' },
      { status: 500 }
    );
  }
}

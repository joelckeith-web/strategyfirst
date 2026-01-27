import { NextRequest, NextResponse } from 'next/server';
import {
  extractSitemap,
  startSitemapExtraction,
  analyzeSitemapStructure,
} from '@/services/apify/sitemapExtractor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, async = false, options = {} } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    if (async) {
      // Start extraction without waiting
      const result = await startSitemapExtraction(url, options);

      if (!result) {
        return NextResponse.json(
          { error: 'Failed to start sitemap extraction' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'started',
        runId: result.runId,
        actorId: result.actorId,
      }, { status: 202 });
    }

    // Synchronous extraction (wait for results)
    const result = await extractSitemap(url, options);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Sitemap extraction failed' },
        { status: 500 }
      );
    }

    // Analyze the sitemap structure
    const analysis = analyzeSitemapStructure(result.urls);

    return NextResponse.json({
      status: 'completed',
      urls: result.urls,
      totalUrls: result.totalUrls,
      analysis,
    });
  } catch (error) {
    console.error('Sitemap extraction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

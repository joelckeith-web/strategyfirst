import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite, startWebsiteCrawl } from '@/services/apify/websiteCrawler';

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
      // Start crawl without waiting
      const result = await startWebsiteCrawl(url, options);

      if (!result) {
        return NextResponse.json(
          { error: 'Failed to start website crawl' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'started',
        runId: result.runId,
        actorId: result.actorId,
      }, { status: 202 });
    }

    // Synchronous crawl (wait for results)
    const result = await crawlWebsite(url, options);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Crawl failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'completed',
      pages: result.pages,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('Website crawl error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

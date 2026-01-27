import { NextRequest, NextResponse } from 'next/server';
import { researchSessions } from '../../trigger/route';

// GET - Poll research status by session ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = researchSessions.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Return session status and progress
    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      progress: session.progress,
      results: session.results,
      errors: session.errors,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt,
    });
  } catch (error) {
    console.error('Error fetching research status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research status' },
      { status: 500 }
    );
  }
}

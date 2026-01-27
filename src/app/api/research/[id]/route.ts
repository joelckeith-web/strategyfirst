import { NextRequest, NextResponse } from 'next/server';
import { getResearchProgress, getClientWithResearch } from '@/services/researchOrchestrator';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progress = await getResearchProgress(id);

    if (!progress) {
      return NextResponse.json(
        { error: 'Research not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error getting research progress:', error);
    return NextResponse.json(
      { error: 'Failed to get research progress' },
      { status: 500 }
    );
  }
}

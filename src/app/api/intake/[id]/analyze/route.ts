import { NextRequest, NextResponse } from 'next/server';
import { getIntake } from '@/lib/intakeStore';
import {
  createIntakeAnalysisJob,
  runIntakeAnalysis,
  getIntakeAnalysis,
} from '@/services/analysisOrchestrator';

// POST /api/intake/[id]/analyze - Start analysis for an intake
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const intake = getIntake(id);
  if (!intake) {
    return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
  }

  // Create analysis job
  const analysisId = createIntakeAnalysisJob(intake);

  // Start analysis asynchronously
  runIntakeAnalysis(analysisId).catch((error) => {
    console.error('Analysis failed:', error);
  });

  return NextResponse.json({
    analysisId,
    message: 'Analysis started',
    redirectUrl: `/intake/${id}/results/${analysisId}`,
  });
}

// GET /api/intake/[id]/analyze - Get analysis status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: intakeId } = await params;
  const { searchParams } = new URL(request.url);
  const analysisId = searchParams.get('analysisId');

  if (!analysisId) {
    return NextResponse.json({ error: 'Analysis ID required' }, { status: 400 });
  }

  const analysis = getIntakeAnalysis(analysisId);
  if (!analysis || analysis.intakeId !== intakeId) {
    return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
  }

  return NextResponse.json(analysis);
}

import { NextRequest, NextResponse } from 'next/server';
import { getClientWithResearch } from '@/services/researchOrchestrator';
import { getServerClient } from '@/lib/supabase';
import { mapResearchToIntake } from '@/services/autoPopulator';
import type { ResearchResults } from '@/lib/supabase/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientData = await getClientWithResearch(id);

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      client: clientData,
      research: clientData.research_results || {},
    });
  } catch (error) {
    console.error('Error getting verification data:', error);
    return NextResponse.json(
      { error: 'Failed to get verification data' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServerClient();

    // Get client and research data
    const clientData = await getClientWithResearch(id);

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Map research results to intake format
    const autoPopulatedIntake = mapResearchToIntake(
      (clientData.research_results || {}) as ResearchResults,
      {
        business_name: clientData.business_name,
        website_url: clientData.website_url,
        primary_service_area: clientData.primary_service_area,
      }
    );

    // Merge with user-provided data
    const finalIntakeData = {
      ...autoPopulatedIntake,
      businessContext: {
        ...autoPopulatedIntake.businessContext,
        businessName: body.businessName || autoPopulatedIntake.businessContext?.businessName,
        primaryServiceArea: body.primaryServiceArea || autoPopulatedIntake.businessContext?.primaryServiceArea,
        businessDescription: body.businessDescription || autoPopulatedIntake.businessContext?.businessDescription,
        yearsInBusiness: body.yearsInBusiness ? parseInt(body.yearsInBusiness) : null,
        averageJobValue: body.averageJobValue ? parseInt(body.averageJobValue) : null,
        monthlyLeadGoal: body.monthlyLeadGoal ? parseInt(body.monthlyLeadGoal) : null,
      },
      localSEO: {
        ...autoPopulatedIntake.localSEO,
        targetKeywords: body.targetKeywords
          ? body.targetKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
          : [],
      },
    };

    // Create analysis record - let Supabase generate UUID
    // Using explicit type assertion to work around Supabase type inference
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        client_id: id,
        intake_data: finalIntakeData,
        status: 'pending',
      } as never)
      .select('id')
      .single();

    if (analysisError || !analysis) {
      throw new Error(`Failed to create analysis: ${analysisError?.message}`);
    }

    const analysisId = (analysis as { id: string }).id;

    // Update client status
    await supabase
      .from('clients')
      .update({ status: 'completed' } as never)
      .eq('id', id);

    // In a real app, you'd trigger the full analysis here
    // For now, just mark it as completed
    await supabase
      .from('analyses')
      .update({
        status: 'completed',
        results: {
          message: 'Analysis completed based on research data',
          timestamp: new Date().toISOString(),
        },
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', analysisId);

    return NextResponse.json({
      analysisId,
      clientId: id,
    });
  } catch (error) {
    console.error('Error creating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}

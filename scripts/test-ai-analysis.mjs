// Test AI Analysis endpoint
// Usage: node scripts/test-ai-analysis.mjs [sessionId]

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwawccntztjfqacigkzg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('Missing Supabase key. Set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listCompletedSessions() {
  console.log('Fetching completed research sessions...\n');

  const { data, error } = await supabase
    .from('research_sessions')
    .select('id, input, status, created_at, results')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.log('No completed sessions found.');
    return [];
  }

  console.log('Completed sessions:\n');
  data.forEach((session, i) => {
    const input = session.input;
    const hasAiAnalysis = session.results?.aiAnalysis ? '✓' : '✗';
    const resultsKeys = session.results ? Object.keys(session.results) : [];
    console.log(`${i + 1}. ${session.id}`);
    console.log(`   Business: ${input?.businessName || 'Unknown'}`);
    console.log(`   Website: ${input?.website || 'Unknown'}`);
    console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
    console.log(`   Has AI Analysis: ${hasAiAnalysis}`);
    console.log(`   Results: ${resultsKeys.join(', ')}`);
    console.log('');
  });

  return data;
}

async function triggerAnalysis(sessionId) {
  console.log(`\nTriggering AI analysis for session: ${sessionId}`);
  console.log('This may take 30-60 seconds...\n');

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/research/${sessionId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Analysis failed:', data.error);
      return null;
    }

    console.log('✓ Analysis completed!\n');
    return data;
  } catch (error) {
    console.error('Error calling analyze endpoint:', error.message);
    console.log('\nMake sure the dev server is running: npm run dev');
    return null;
  }
}

async function main() {
  const sessionId = process.argv[2];

  if (sessionId) {
    // Trigger analysis for specific session
    const result = await triggerAnalysis(sessionId);
    if (result) {
      console.log('Analysis Summary:');
      console.log('─'.repeat(50));
      console.log(`  Model: ${result.data?.model}`);
      console.log(`  Overall Confidence: ${(result.data?.overallConfidence * 100).toFixed(1)}%`);
      console.log(`  Fields Analyzed: ${result.data?.fieldsAnalyzed}`);
      console.log(`  High Confidence Fields: ${result.data?.fieldsWithHighConfidence}`);
      console.log(`  Low Confidence Fields: ${result.data?.fieldsWithLowConfidence}`);
      console.log(`  Data Quality Score: ${result.data?.dataQualityScore}`);
      console.log(`  Processing Time: ${result.data?.processingTimeMs}ms`);
      console.log(`  Estimated Cost: $${result.estimatedCost?.toFixed(4)}`);
      console.log('');
      console.log('Insights Summary:');
      console.log(`  Content Gaps: ${result.data?.insightsSummary?.contentGaps}`);
      console.log(`  Competitive Insights: ${result.data?.insightsSummary?.competitiveInsights}`);
      console.log(`  Suggested Keywords: ${result.data?.insightsSummary?.suggestedKeywords}`);
      console.log(`  Quick Wins: ${result.data?.insightsSummary?.quickWins}`);
      console.log('');
      console.log('Token Usage:');
      console.log(`  Input: ${result.data?.tokenUsage?.input}`);
      console.log(`  Output: ${result.data?.tokenUsage?.output}`);
      console.log(`  Total: ${result.data?.tokenUsage?.total}`);
    }
  } else {
    // List available sessions
    const sessions = await listCompletedSessions();

    if (sessions.length > 0) {
      console.log('─'.repeat(50));
      console.log('To run AI analysis on a session:');
      console.log('  node scripts/test-ai-analysis.mjs <sessionId>');
      console.log('');
      console.log('Example:');
      console.log(`  node scripts/test-ai-analysis.mjs ${sessions[0].id}`);
    }
  }
}

main().catch(console.error);

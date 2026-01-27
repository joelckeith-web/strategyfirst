// Test creating a research session in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hwawccntztjfqacigkzg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3YXdjY250enRqZnFhY2lna3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MzE2MDQsImV4cCI6MjA4NTEwNzYwNH0.wLYuuZhieF2MMqBqaGD79D7pjsIFK4F-hHNKDU6Qhwk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateSession() {
  console.log('Testing research_sessions table...\n');

  // Test 1: Check if table exists
  try {
    const { data, error } = await supabase
      .from('research_sessions')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Table check failed:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Details:', error.details);
      return;
    }
    console.log('✅ Table "research_sessions" exists');
  } catch (err) {
    console.log('❌ Error:', err.message);
    return;
  }

  // Test 2: Try to insert a session
  console.log('\nTesting insert...');
  const testInput = {
    businessName: 'Test Business',
    website: 'https://test.com',
    city: 'Denver',
    state: 'CO',
  };

  const sessionData = {
    input: testInput,
    status: 'pending',
    progress: {
      currentStep: 'initializing',
      completedSteps: [],
      failedSteps: [],
      percentage: 0,
    },
    results: {},
    errors: [],
  };

  try {
    const { data, error } = await supabase
      .from('research_sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('   Error code:', error.code);
      console.log('   Details:', error.details);
      console.log('   Hint:', error.hint);
      return;
    }

    console.log('✅ Session created successfully!');
    console.log('   ID:', data.id);
    console.log('   Status:', data.status);

    // Clean up
    await supabase.from('research_sessions').delete().eq('id', data.id);
    console.log('✅ Test session cleaned up');

  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  console.log('\n🎉 All tests passed!');
}

testCreateSession();

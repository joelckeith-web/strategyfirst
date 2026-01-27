// Test the research trigger API endpoint
async function testTrigger() {
  console.log('Testing /api/research/trigger...\n');

  try {
    const response = await fetch('http://localhost:3000/api/research/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        businessName: 'Test Plumbing Co',
        website: 'https://testplumbing.com',
        city: 'Denver',
        state: 'CO',
        industry: 'Plumbing',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ API Error:', response.status);
      console.log('   Response:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('✅ Research triggered successfully!');
    console.log('   Session ID:', data.sessionId);
    console.log('   Status:', data.status);
    console.log('   Message:', data.message);

    // Wait a bit for fallback research to run
    console.log('\nWaiting 10 seconds for research to complete...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Check status
    console.log('\nChecking research status...');
    const statusResponse = await fetch(`http://localhost:3000/api/research/status/${data.sessionId}`);
    const statusData = await statusResponse.json();

    console.log('\n📊 Research Results:');
    console.log('   Status:', statusData.status);
    console.log('   Progress:', JSON.stringify(statusData.progress, null, 2));

    if (statusData.results) {
      console.log('\n   Results keys:', Object.keys(statusData.results));
      if (statusData.results.gbp) {
        console.log('   GBP Name:', statusData.results.gbp.name);
        console.log('   GBP Rating:', statusData.results.gbp.rating);
      }
      if (statusData.results.competitors) {
        console.log('   Competitors:', statusData.results.competitors.length);
      }
    }

  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

testTrigger();

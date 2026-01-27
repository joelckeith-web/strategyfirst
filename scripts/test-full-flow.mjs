// Test the complete research flow
async function testFullFlow() {
  console.log('Testing complete research flow...\n');

  // Step 1: Trigger research
  console.log('Step 1: Triggering research...');
  const triggerResponse = await fetch('http://localhost:3000/api/research/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessName: 'Denver Plumbing Pro',
      website: 'https://denverplumbingpro.com',
      city: 'Denver',
      state: 'CO',
      industry: 'Plumbing',
    }),
  });

  if (!triggerResponse.ok) {
    console.log('Failed to trigger research');
    return;
  }

  const { sessionId } = await triggerResponse.json();
  console.log('Session ID:', sessionId);

  // Step 2: Poll for completion
  console.log('\nStep 2: Waiting for research to complete...');
  let attempts = 0;
  let status = 'running';

  while (status === 'running' && attempts < 20) {
    await new Promise(r => setTimeout(r, 1000));
    const statusResponse = await fetch(`http://localhost:3000/api/research/status/${sessionId}`);
    const statusData = await statusResponse.json();
    status = statusData.status;
    const percentage = statusData.progress?.percentage || 0;
    process.stdout.write(`\r  Progress: ${percentage}% - ${statusData.progress?.currentStep || 'starting'}    `);
    attempts++;
  }

  console.log('\n');

  // Step 3: Fetch final results
  console.log('Step 3: Fetching final results...');
  const finalResponse = await fetch(`http://localhost:3000/api/research/status/${sessionId}`);
  const finalData = await finalResponse.json();

  console.log('\nFinal Status:', finalData.status);
  console.log('Results available:', Object.keys(finalData.results));

  if (finalData.results.gbp) {
    console.log('\nGBP Data:');
    console.log('  Name:', finalData.results.gbp.name);
    console.log('  Rating:', finalData.results.gbp.rating);
    console.log('  Reviews:', finalData.results.gbp.reviewCount);
  }

  if (finalData.results.competitors) {
    console.log('\nCompetitors:', finalData.results.competitors.length);
    finalData.results.competitors.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} - ${c.rating} stars (${c.reviewCount} reviews)`);
    });
  }

  if (finalData.results.seoAudit) {
    console.log('\nSEO Scores:');
    console.log('  Overall:', finalData.results.seoAudit.score);
    console.log('  Mobile:', finalData.results.seoAudit.mobile?.score);
    console.log('  Performance:', finalData.results.seoAudit.performance?.score);
  }

  if (finalData.results.sitemap) {
    console.log('\nSite Structure:');
    console.log('  Total Pages:', finalData.results.sitemap.totalPages);
    console.log('  Service Pages:', finalData.results.sitemap.pageTypes?.services || 0);
    console.log('  Blog Posts:', finalData.results.sitemap.pageTypes?.blog || 0);
  }

  console.log('\n------------------------------------');
  console.log('View results at: http://localhost:3000/research/' + sessionId + '/results');
  console.log('------------------------------------\n');
}

testFullFlow().catch(console.error);

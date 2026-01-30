/**
 * Test the Citation Checker AI actor directly
 */

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'alizarin_refrigerator-owner/citation-checker-ai';

if (!APIFY_API_TOKEN) {
  console.error('APIFY_API_TOKEN not set');
  process.exit(1);
}

// Test with a known business
const testInput = {
  businessName: "Starbucks",
  city: "Seattle",
  state: "WA",
  // Add more fields to help find the business
};

async function testCitationChecker() {
  console.log('Testing Citation Checker AI actor...');
  console.log('Input:', JSON.stringify(testInput, null, 2));
  
  const actorIdEncoded = ACTOR_ID.replace('/', '~');
  const url = `https://api.apify.com/v2/acts/${actorIdEncoded}/run-sync-get-dataset-items?timeout=300&memory=4096`;
  
  console.log('\nCalling Apify...');
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${APIFY_API_TOKEN}`,
      },
      body: JSON.stringify(testInput),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('\nRaw response (first 2000 chars):');
    console.log(JSON.stringify(data, null, 2).slice(0, 2000));
    
    if (Array.isArray(data)) {
      console.log(`\nTotal items returned: ${data.length}`);
      if (data.length > 0) {
        console.log('\nFirst item structure:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testCitationChecker();

import { startServer } from '../server/server.js';

async function runTests() {
  console.log('--- TESTING PUJO AURORA PRODUCTION SERVER ---');
  const TEST_PORT = 9988;
  const server = startServer(TEST_PORT, '127.0.0.1');

  await new Promise(r => setTimeout(r, 600));

  let passed = 0;
  let failed = 0;

  async function check(name, testFn) {
    try {
      await testFn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check probe
  await check('GET /healthz', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/healthz`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const text = await res.text();
    if (text !== 'OK') throw new Error(`Body: ${text}`);
  });

  // 2. Status Endpoint
  await check('GET /api/pujo-ai/status', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/status`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (typeof json.configured !== 'boolean') throw new Error('Missing configured field');
    console.log('       Status Response:', JSON.stringify(json));
  });

  // 3. CORS Preflight OPTIONS
  await check('OPTIONS /api/pujo-ai/chat', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/chat`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://pujoaurora.onrender.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    if (res.status !== 204) throw new Error(`Status ${res.status}`);
    const allowOrigin = res.headers.get('Access-Control-Allow-Origin');
    if (!allowOrigin) throw new Error('Missing Access-Control-Allow-Origin');
  });

  // 4. Greeting Endpoint (POST)
  await check('POST /api/pujo-ai/greeting', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/greeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Anirban', lang: 'en', mood: 'warm' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.greeting) throw new Error(`Greeting error: ${JSON.stringify(json)}`);
    console.log('       Greeting preview:', json.greeting.slice(0, 50));
  });

  // 5. Static Homepage serving
  await check('GET / (serves index.html)', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const contentType = res.headers.get('Content-Type');
    if (!contentType.includes('text/html')) throw new Error(`Content-Type: ${contentType}`);
    const text = await res.text();
    if (!text.includes('id="root"')) throw new Error('HTML does not contain root element');
  });

  // 6. Static Asset serving
  await check('GET /favicon.svg', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/favicon.svg`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const contentType = res.headers.get('Content-Type');
    if (!contentType.includes('image/svg+xml')) throw new Error(`Content-Type: ${contentType}`);
  });

  // 7. SPA Fallback routing
  await check('GET /some/client/route (SPA fallback)', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/some/client/route`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const contentType = res.headers.get('Content-Type');
    if (!contentType.includes('text/html')) throw new Error(`Content-Type: ${contentType}`);
  });

  // 8. Path Traversal Protection
  await check('GET Path Traversal protection', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/../../package.json`);
    // Should be safely handled (403, 400, or index.html SPA fallback, never leaking outside dist)
    const text = await res.text();
    if (text.includes('"name": "durga-puja"')) {
      throw new Error('Leaked package.json outside of dist directory!');
    }
  });

  server.close();
  console.log(`\n--- PRODUCTION SERVER TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

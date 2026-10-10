import { spawn } from 'child_process';

const TEST_PORT = 10456;

async function verifyDeployment() {
  console.log(`--- STARTING PRODUCTION DEPLOYMENT VERIFICATION (PORT=${TEST_PORT}) ---`);

  const serverProcess = spawn('npm', ['start'], {
    cwd: 'd:\\Durga puja',
    shell: true,
    env: {
      ...process.env,
      PORT: String(TEST_PORT),
      NODE_ENV: 'production'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverOutput = '';
  serverProcess.stdout.on('data', (d) => {
    serverOutput += d.toString();
  });
  serverProcess.stderr.on('data', (d) => {
    serverOutput += d.toString();
  });

  // Give server time to bind and listen
  await new Promise(r => setTimeout(r, 2000));

  console.log('Server Startup Output:\n' + serverOutput.trim());

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name}: ${e.message}`);
      failed++;
    }
  }

  // 1. Verify listening on custom process.env.PORT
  await test(`Server is listening on assigned PORT (${TEST_PORT})`, async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/healthz`);
    if (res.status !== 200) throw new Error(`Unexpected status ${res.status}`);
    const body = await res.text();
    if (body !== 'OK') throw new Error(`Unexpected body: ${body}`);
  });

  // 2. Verify /api/pujo-ai/status
  await test('GET /api/pujo-ai/status endpoint is correctly mounted', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/status`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (typeof data.configured !== 'boolean') throw new Error('Missing configured field');
    console.log(`       Provider: ${data.provider}, Model: ${data.model}, Configured: ${data.configured}`);
  });

  // 3. Verify /api/pujo-ai/chat
  await test('POST /api/pujo-ai/chat endpoint is correctly mounted', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'What is the significance of Bodhon?', lang: 'en' })
    });
    // If API key is configured, 200 with reply. If not, 503 with error explaining key setup.
    if (res.status === 200) {
      const data = await res.json();
      if (!data.success || !data.reply) throw new Error(`Unexpected body: ${JSON.stringify(data)}`);
      console.log(`       Chat Reply Preview: ${data.reply.slice(0, 60)}...`);
    } else if (res.status === 503) {
      const data = await res.json();
      if (!data.error) throw new Error(`503 without error message`);
      console.log(`       503 gracefully handled: ${data.error}`);
    } else {
      throw new Error(`Unexpected status ${res.status}`);
    }
  });

  // 4. Verify /api/pujo-ai/greeting
  await test('POST /api/pujo-ai/greeting endpoint is correctly mounted', async () => {
    const res = await fetch(`http://127.0.0.1:${TEST_PORT}/api/pujo-ai/greeting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tanmoy', lang: 'bn', mood: 'traditional' })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.greeting) throw new Error(`Unexpected body: ${JSON.stringify(data)}`);
    console.log(`       Greeting Preview: ${data.greeting.slice(0, 50).replace(/\n/g, ' ')}...`);
  });

  // 5. Verify Frontend serving on production server (index.html, JS, CSS)
  await test('Frontend HTML and bundle are served correctly', async () => {
    const htmlRes = await fetch(`http://127.0.0.1:${TEST_PORT}/`);
    if (htmlRes.status !== 200) throw new Error(`Status ${htmlRes.status}`);
    const html = await htmlRes.text();
    if (!html.includes('<div id="root">')) throw new Error('Root div not found in HTML');

    // Extract JS bundle asset path from index.html
    const scriptMatch = html.match(/src="(\/assets\/[^"]+\.js)"/);
    if (!scriptMatch) throw new Error('JS bundle script tag not found in HTML');
    const jsPath = scriptMatch[1];

    const jsRes = await fetch(`http://127.0.0.1:${TEST_PORT}${jsPath}`);
    if (jsRes.status !== 200) throw new Error(`JS bundle returned ${jsRes.status}`);
    const jsContent = await jsRes.text();
    if (!jsContent.includes('/api/pujo-ai/')) throw new Error('API paths not present in client bundle');
  });

  serverProcess.kill('SIGTERM');

  console.log(`\n--- VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

verifyDeployment().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});

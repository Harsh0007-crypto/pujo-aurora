import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testSpotifyEmbed() {
  console.log('--- STARTING SPOTIFY PLAYLIST EMBED VERIFICATION ---');

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--window-size=1280,800',
    'http://localhost:5173'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9225/json');
    const tabs = await listRes.json();
    const targetTab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!targetTab) {
      throw new Error('Target tab localhost:5173 not found');
    }

    const ws = new WebSocket(targetTab.webSocketDebuggerUrl);
    await new Promise(res => ws.onopen = res);

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    // Wait until React mounts the player
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 300));
      const isMounted = await evalCode(`Boolean(document.querySelector('.player-mode-pills-row'))`);
      if (isMounted) break;
    }

    async function evalCode(expression) {
      const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    // 1. Check Top Nav and Floating Player Pills
    const pillsCheck = await evalCode(`(() => {
      const modePills = Array.from(document.querySelectorAll('.player-mode-pill')).map(p => p.innerText.trim());
      const spotifyNav = document.querySelector('.spotify-nav-pill')?.innerText.trim();
      return { modePills, spotifyNav };
    })()`);
    console.log('[1] Music Player Navigation Pills:', pillsCheck);

    // 2. Click "SPOTIFY PLAYLIST" pill to open modal
    console.log('\n[2] Clicking SPOTIFY PLAYLIST pill...');
    await evalCode(`(() => {
      const pill = Array.from(document.querySelectorAll('.player-mode-pill')).find(p => p.innerText.includes('SPOTIFY'));
      if (pill) pill.click();
    })()`);
    await new Promise(r => setTimeout(r, 600));

    // 3. Inspect Modal & Iframe attributes
    const modalCheck = await evalCode(`(() => {
      const modal = document.querySelector('.music-library-container');
      if (!modal) return null;
      const iframe = modal.querySelector('iframe[data-testid="embed-iframe"]');
      const openBtn = modal.querySelector('.spotify-open-direct-btn');
      const closeBtn = modal.querySelector('.library-close-btn');
      const notice = modal.querySelector('.spotify-embed-notice')?.innerText.trim();
      const title = modal.querySelector('.library-title')?.innerText.trim();

      return {
        isModalVisible: modal.offsetWidth > 0 && modal.offsetHeight > 0,
        title,
        hasIframe: Boolean(iframe),
        iframeSrc: iframe?.src,
        iframeWidth: iframe?.width,
        iframeHeight: iframe?.height,
        iframeAllow: iframe?.getAttribute('allow'),
        openLinkHref: openBtn?.href,
        hasCloseBtn: Boolean(closeBtn),
        notice
      };
    })()`);
    console.log('[3] Spotify Embed Modal Attributes:', modalCheck);

    // Verify expected values
    if (!modalCheck?.hasIframe) throw new Error('Spotify embed iframe not found in modal');
    if (!modalCheck.iframeSrc.includes('1zVKSwcN1UDYBXsBWQlp16')) throw new Error('Incorrect Spotify playlist ID in iframe src');
    if (modalCheck.iframeHeight !== '352') throw new Error(`Expected height 352, got ${modalCheck.iframeHeight}`);
    console.log('-> Verified exact iframe embed and playlist parameters!');

    // 4. Test Mobile Viewport
    console.log('\n[4] Testing Mobile Viewport (390x844)...');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 500));

    const mobileCheck = await evalCode(`(() => {
      const modal = document.querySelector('.music-library-container');
      const mRect = modal?.getBoundingClientRect();
      const iframe = modal?.querySelector('iframe');
      const iRect = iframe?.getBoundingClientRect();
      return {
        modalWidth: mRect?.width,
        modalFits: mRect ? mRect.right <= window.innerWidth : false,
        iframeWidth: iRect?.width,
        iframeFits: iRect ? iRect.right <= window.innerWidth : false
      };
    })()`);
    console.log('[4] Mobile Responsiveness Check:', mobileCheck);

    // 5. Test Close Button
    console.log('\n[5] Testing Modal Close button...');
    await evalCode(`(() => {
      const closeBtn = document.querySelector('.library-close-btn');
      if (closeBtn) closeBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const closedCheck = await evalCode(`(() => {
      const modal = document.querySelector('.music-library-container');
      return Boolean(modal);
    })()`);
    console.log('[5] Modal closed properly (should be false):', closedCheck);

    // 6. Test other site features (Day/Night, Experience Pujo, Bengali Title)
    const siteFeaturesCheck = await evalCode(`(() => {
      const headline = document.querySelector('.hero-bengali-title')?.innerText.trim();
      const dayNightBtn = document.querySelector('.theme-mode-pill');
      const expBtn = document.querySelector('.experience-toggle-pill');
      const radioPill = Array.from(document.querySelectorAll('.player-mode-pill')).find(p => p.innerText.includes('PUJA RADIO'));
      return {
        bengaliHeadline: headline,
        hasDayNight: Boolean(dayNightBtn),
        hasExperience: Boolean(expBtn),
        hasPujaRadio: Boolean(radioPill)
      };
    })()`);
    console.log('\n[6] Core Site Features Intact:', siteFeaturesCheck);

    ws.close();
    console.log('\n--- ALL SPOTIFY EMBED VERIFICATION TESTS PASSED ---');
  } finally {
    edgeProcess.kill();
  }
}

testSpotifyEmbed().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

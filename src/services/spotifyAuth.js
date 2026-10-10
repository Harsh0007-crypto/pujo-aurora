/**
 * Spotify PKCE Authentication & Web API Helper
 * Complies with Spotify's Authorization Code Flow with PKCE:
 * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 * https://developer.spotify.com/documentation/web-playback-sdk/tutorials/getting-started
 *
 * Security: NO client secret is stored or exposed. Client ID is kept in localStorage or env.
 */

const STORAGE_KEYS = {
  CLIENT_ID: 'pujo_aurora_spotify_client_id',
  ACCESS_TOKEN: 'pujo_aurora_spotify_access_token',
  REFRESH_TOKEN: 'pujo_aurora_spotify_refresh_token',
  EXPIRES_AT: 'pujo_aurora_spotify_expires_at',
  CODE_VERIFIER: 'pujo_aurora_spotify_code_verifier',
  STATE: 'pujo_aurora_spotify_auth_state'
};

export const SPOTIFY_SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative'
];

/**
 * Generate cryptographically secure random string for code verifier
 */
export function generateRandomString(length = 64) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/**
 * Generate SHA-256 digest buffer
 */
async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

/**
 * Convert buffer to base64url string
 */
function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function safeStorageGet(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

function safeStorageSet(key, value) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }
}

function safeStorageRemove(key) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

/**
 * Get configured client ID (from Vite env or saved in localStorage)
 */
export function getSpotifyClientId() {
  const envId = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_SPOTIFY_CLIENT_ID : null;
  if (envId && envId.trim()) return envId.trim();
  return safeStorageGet(STORAGE_KEYS.CLIENT_ID) || '';
}

/**
 * Save custom client ID into localStorage
 */
export function setSpotifyClientId(id) {
  if (id && id.trim()) {
    safeStorageSet(STORAGE_KEYS.CLIENT_ID, id.trim());
  } else {
    safeStorageRemove(STORAGE_KEYS.CLIENT_ID);
  }
}

/**
 * Get current redirect URI based on window.location
 * For development, Spotify OAuth requires an exact matching loopback address:
 * exactly http://127.0.0.1:5174/
 */
export function getRedirectUri() {
  const envUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (envUri && envUri.trim()) {
    return envUri.trim();
  }

  if (typeof window !== 'undefined') {
    const isDev = import.meta.env.DEV || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';

    if (isDev) {
      return 'http://127.0.0.1:5174/';
    }

    return `${window.location.origin}${window.location.pathname}`;
  }

  return 'http://127.0.0.1:5174/';
}

/**
 * Initiate Spotify PKCE Authorization Redirect
 */
export async function initiateSpotifyLogin(customClientId) {
  const clientId = customClientId || getSpotifyClientId();
  if (!clientId) {
    throw new Error('Spotify Client ID is required to initiate authorization.');
  }

  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlencode(hashed);
  const state = generateRandomString(16);

  localStorage.setItem(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
  localStorage.setItem(STORAGE_KEYS.STATE, state);

  const redirectUri = getRedirectUri();
  const scope = SPOTIFY_SCOPES.join(' ');

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  const params = {
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
    state: state
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

/**
 * Exchange Authorization Code for Access Token
 */
export async function handleAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname);
    throw new Error(`Spotify authorization error: ${error}`);
  }

  if (!code) {
    return null;
  }

  const savedState = localStorage.getItem(STORAGE_KEYS.STATE);
  const codeVerifier = localStorage.getItem(STORAGE_KEYS.CODE_VERIFIER);
  const clientId = getSpotifyClientId();

  // Clean URL immediately
  window.history.replaceState({}, document.title, window.location.pathname);

  if (!codeVerifier || !clientId) {
    throw new Error('Authentication session state missing. Please try logging in again.');
  }

  if (state && savedState && state !== savedState) {
    throw new Error('State validation failed. Potential CSRF detected.');
  }

  const redirectUri = getRedirectUri();

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || 'Failed to exchange token');
  }

  // Store tokens
  saveTokenData(data);
  return data.access_token;
}

/**
 * Save tokens and expiration
 */
export function saveTokenData(data) {
  if (data.access_token) {
    safeStorageSet(STORAGE_KEYS.ACCESS_TOKEN, data.access_token);
  }
  if (data.refresh_token) {
    safeStorageSet(STORAGE_KEYS.REFRESH_TOKEN, data.refresh_token);
  }
  if (data.expires_in) {
    const expiresAt = Date.now() + data.expires_in * 1000 - 60000; // 1 min buffer
    safeStorageSet(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
  }
}

/**
 * Get valid stored access token or refresh if expired
 */
export async function getValidAccessToken() {
  const token = safeStorageGet(STORAGE_KEYS.ACCESS_TOKEN);
  const expiresAt = parseInt(safeStorageGet(STORAGE_KEYS.EXPIRES_AT) || '0', 10);
  const refreshToken = safeStorageGet(STORAGE_KEYS.REFRESH_TOKEN);
  const clientId = getSpotifyClientId();

  if (!token) return null;

  // If token is still valid
  if (Date.now() < expiresAt) {
    return token;
  }

  // Refresh token if available
  if (refreshToken && clientId) {
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        })
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        saveTokenData(data);
        return data.access_token;
      }
    } catch (err) {
      console.warn('Failed to refresh Spotify access token:', err);
    }
  }

  return null;
}

/**
 * Disconnect / Clear Spotify authentication
 */
export function disconnectSpotify() {
  safeStorageRemove(STORAGE_KEYS.ACCESS_TOKEN);
  safeStorageRemove(STORAGE_KEYS.REFRESH_TOKEN);
  safeStorageRemove(STORAGE_KEYS.EXPIRES_AT);
  safeStorageRemove(STORAGE_KEYS.CODE_VERIFIER);
  safeStorageRemove(STORAGE_KEYS.STATE);
}

/**
 * Fetch current user profile to verify account & subscription
 */
export async function fetchSpotifyUserProfile(accessToken) {
  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return res.json();
}



/**
 * Transfer playback to device or activate device
 */
export async function transferPlaybackToDevice(deviceId, play = false, accessToken) {
  const token = accessToken || (await getValidAccessToken());
  if (!token) return false;

  const res = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      device_ids: [deviceId],
      play: play
    })
  });
  return res.ok || res.status === 204;
}

/**
 * Play a track or playlist URI on a specific Spotify device.
 * Gracefully formats context_uri with offset or fallback to direct track uris.
 */
export async function playSpotifyUri(deviceId, contextUri, targetUri, accessToken) {
  const token = accessToken || (await getValidAccessToken());
  if (!token) {
    throw new Error('Spotify authorization required for playback.');
  }

  const body = {};

  if (targetUri && targetUri.startsWith('spotify:track:')) {
    // If targetUri is a valid track URI and we have contextUri (playlist)
    if (contextUri) {
      body.context_uri = contextUri;
      body.offset = { uri: targetUri };
    } else {
      body.uris = [targetUri];
    }
  } else if (contextUri) {
    // Context URI (e.g. playlist) without a specific track offset
    body.context_uri = contextUri;
    if (targetUri && !targetUri.startsWith('spotify:playlist:')) {
      body.offset = { uri: targetUri };
    }
  } else if (targetUri) {
    if (targetUri.startsWith('spotify:playlist:')) {
      body.context_uri = targetUri;
    } else {
      body.uris = [targetUri];
    }
  }

  let res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  // If playback within context offset failed, try direct track URI fallback
  if (!res.ok && res.status !== 204 && targetUri && targetUri.startsWith('spotify:track:') && body.context_uri) {
    const fallbackRes = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ uris: [targetUri] })
    });
    if (fallbackRes.ok || fallbackRes.status === 204) {
      return;
    }
  }

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.error?.message || `Playback request failed with status ${res.status}`;
    throw new Error(message);
  }
}

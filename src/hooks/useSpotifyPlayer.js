import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  getValidAccessToken, 
  handleAuthCallback, 
  fetchSpotifyUserProfile, 
  disconnectSpotify, 
  playSpotifyUri,
  transferPlaybackToDevice
} from '../services/spotifyAuth';
import { SPOTIFY_PLAYLIST_ID } from '../data/tracks';

/**
 * useSpotifyWebPlayback
 * Manages the official Spotify Web Playback SDK:
 * 1. Loads sdk.scdn.co/spotify-player.js
 * 2. Authenticates with access token
 * 3. Connects Spotify Player device
 * 4. Listens to state_changed, errors, and player ready events
 * 5. Controls play, pause, next, prev, seek, volume
 */
export function useSpotifyWebPlayback() {
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isSpotifyPlaying, setIsSpotifyPlaying] = useState(false);
  const [currentSpotifyTrack, setCurrentSpotifyTrack] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [hasPremium, setHasPremium] = useState(null); // null | boolean
  const [isInitializing, setIsInitializing] = useState(true);

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize or check for tokens on load (including callback handling)
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      setIsInitializing(true);
      try {
        let validToken = null;

        // Check if returning from Spotify authorization redirect with code
        if (window.location.search.includes('code=')) {
          try {
            validToken = await handleAuthCallback();
          } catch (callbackErr) {
            console.error('Spotify auth callback error:', callbackErr);
            if (mounted) setStatusMessage(`Auth failed: ${callbackErr.message}`);
          }
        }

        if (!validToken) {
          validToken = await getValidAccessToken();
        }

        if (validToken && mounted) {
          setToken(validToken);
          // Verify user profile & Premium tier
          try {
            const profile = await fetchSpotifyUserProfile(validToken);
            if (mounted) {
              setUserProfile(profile);
              const isPrem = profile.product === 'premium';
              setHasPremium(isPrem);
              if (!isPrem) {
                setStatusMessage('Spotify account detected, but Spotify Premium is required for Web Playback SDK full streaming.');
              }
            }
          } catch (profileErr) {
            console.warn('Could not verify profile:', profileErr);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Load and initialize Spotify Web Playback SDK script
  useEffect(() => {
    if (!token) {
      if (playerRef.current) {
        try {
          playerRef.current.disconnect();
        } catch {
          // ignore disconnect errors
        }
        playerRef.current = null;
      }
      return;
    }

    let script = document.getElementById('spotify-player-sdk-script');
    if (!script) {
      script = document.createElement('script');
      script.id = 'spotify-player-sdk-script';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Pujo Aurora — Durga Puja Player',
        getOAuthToken: (cb) => {
          getValidAccessToken().then((refreshedToken) => {
            cb(refreshedToken || token);
          });
        },
        volume: 0.8
      });

      playerRef.current = player;

      // Ready
      player.addListener('ready', ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(true);
        setStatusMessage('Connected to Spotify Web Playback SDK');
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        setDeviceId(device_id);
        setIsReady(false);
        setStatusMessage('Spotify device has gone offline');
      });

      // Error Handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Spotify initialization error:', message);
        setStatusMessage(`Initialization error: ${message}`);
      });

      player.addListener('authentication_error', ({ message }) => {
        console.error('Spotify authentication error:', message);
        setStatusMessage(`Authentication error: ${message}. Re-login needed.`);
        disconnectSpotify();
        setToken(null);
      });

      player.addListener('account_error', ({ message }) => {
        console.error('Spotify account error (Premium required):', message);
        setStatusMessage('Spotify Premium required for Web Playback SDK full-length streaming.');
        setHasPremium(false);
      });

      player.addListener('playback_error', ({ message }) => {
        console.error('Spotify playback error:', message);
        setStatusMessage(`Playback error: ${message}`);
      });

      // State Changed
      player.addListener('player_state_changed', (state) => {
        if (!state) {
          setIsSpotifyPlaying(false);
          return;
        }

        const current = state.track_window?.current_track;
        if (current) {
          setCurrentSpotifyTrack({
            id: current.id,
            uri: current.uri,
            title: current.name,
            artist: current.artists?.map((a) => a.name).join(', ') || 'Various Artists',
            album: current.album?.name || '',
            cover: current.album?.images?.[0]?.url || '/devipaksha_durga_puja_wallpaper.jpg',
            durationSec: Math.floor(current.duration_ms / 1000)
          });
        }

        setIsSpotifyPlaying(!state.paused);
        setPosition(Math.floor(state.position / 1000));
        setDuration(Math.floor(state.duration / 1000));
      });

      player.connect();
    };

    if (window.Spotify && window.Spotify.Player) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    };
  }, [token]);

  // Keep progress moving smoothly while playing
  useEffect(() => {
    if (isSpotifyPlaying) {
      intervalRef.current = setInterval(() => {
        setPosition((prev) => {
          if (duration && prev >= duration) return prev;
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isSpotifyPlaying, duration]);

  // Controls
  const playPlaylist = useCallback(async (trackUri) => {
    if (!deviceId || !token) {
      throw new Error('Spotify device is not ready or not authenticated');
    }
    const contextUri = `spotify:playlist:${SPOTIFY_PLAYLIST_ID}`;
    try {
      await playSpotifyUri(deviceId, contextUri, trackUri, token);
      setStatusMessage('');
    } catch (err) {
      console.warn('Error starting Spotify playback with context:', err);
      // If error indicates no list or player state issue, attempt activating device first
      try {
        await transferPlaybackToDevice(deviceId, false, token);
        await playSpotifyUri(deviceId, contextUri, trackUri, token);
        setStatusMessage('');
      } catch (retryErr) {
        console.error('Retry playback failed:', retryErr);
        setStatusMessage(retryErr.message || 'Could not start Spotify playback');
        throw retryErr;
      }
    }
  }, [deviceId, token]);

  const togglePlay = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      // Check current state
      const state = await playerRef.current.getCurrentState();
      if (!state || !state.track_window?.current_track) {
        // No track/list loaded yet in the SDK device: load the playlist!
        await playPlaylist();
        return;
      }
      await playerRef.current.togglePlay();
    } catch (e) {
      console.warn('Error toggling play on Spotify SDK:', e);
      // Fallback: If toggling fails because no list was loaded, load playlist
      try {
        await playPlaylist();
      } catch (loadErr) {
        console.warn('Fallback playPlaylist failed:', loadErr);
      }
    }
  }, [playPlaylist]);

  const nextTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      const state = await playerRef.current.getCurrentState();
      if (!state || !state.track_window?.current_track) {
        await playPlaylist();
        return;
      }
      await playerRef.current.nextTrack();
    } catch (e) {
      console.warn('Error next track on Spotify SDK:', e);
    }
  }, [playPlaylist]);

  const previousTrack = useCallback(async () => {
    if (!playerRef.current) return;
    try {
      const state = await playerRef.current.getCurrentState();
      if (!state || !state.track_window?.current_track) {
        await playPlaylist();
        return;
      }
      await playerRef.current.previousTrack();
    } catch (e) {
      console.warn('Error prev track on Spotify SDK:', e);
    }
  }, [playPlaylist]);

  const seek = useCallback(async (seconds) => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.seek(seconds * 1000);
      setPosition(seconds);
    } catch (e) {
      console.warn('Error seeking on Spotify SDK:', e);
    }
  }, []);

  const setVolume = useCallback(async (volumeRatio) => {
    if (!playerRef.current) return;
    try {
      await playerRef.current.setVolume(volumeRatio);
    } catch (e) {
      console.warn('Error setting volume on Spotify SDK:', e);
    }
  }, []);

  const logout = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.disconnect();
    }
    disconnectSpotify();
    setToken(null);
    setUserProfile(null);
    setDeviceId(null);
    setIsReady(false);
    setIsSpotifyPlaying(false);
    setCurrentSpotifyTrack(null);
    setStatusMessage('Logged out from Spotify');
  }, []);

  return {
    isAvailable: Boolean(token),
    isInitializing,
    token,
    userProfile,
    hasPremium,
    deviceId,
    isReady,
    isPlaying: isSpotifyPlaying,
    currentTrack: currentSpotifyTrack,
    position,
    duration,
    statusMessage,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    playPlaylist,
    logout
  };
}

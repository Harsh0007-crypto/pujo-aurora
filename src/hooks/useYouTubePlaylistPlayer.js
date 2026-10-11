import { useState, useEffect, useRef, useCallback } from 'react';
import { YOUTUBE_PLAYLIST_ID, YOUTUBE_PLAYLIST_TRACK_IDS } from '../data/tracks';

const DEFAULT_COVER = '/devipaksha_durga_puja_wallpaper.jpg';
const MAX_CONSECUTIVE_SKIPS = 5;

/**
 * useYouTubePlaylistPlayer
 * Controller for the official YouTube IFrame Player API:
 * - Directly embeds and plays official Durga Puja Songs playlist (PLJAiFJ6bGyew)
 * - Uses ordered playlist track queue with robust handling for embed-restricted tracks
 * - Synchronizes real-time player events: state, title, artist, live timeline & duration
 * - Supports Play/Pause, Next/Previous, Seek, Volume, Mute, and Shuffle directly
 * - Handles autoplay restrictions and blocked/restricted embeds with bounded skip protection
 */
export function useYouTubePlaylistPlayer({
  containerId = 'youtube-player-mount',
  playlistId = YOUTUBE_PLAYLIST_ID,
  trackIds = YOUTUBE_PLAYLIST_TRACK_IDS,
  initialVolume = 0.85
} = {}) {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [error, setError] = useState(null);

  const [currentTrack, setCurrentTrack] = useState({
    id: 'yt-durga-puja-init',
    videoId: '',
    title: 'Durga Puja Songs — শারদোৎসব সঙ্গীত',
    artist: 'Arup Mukherjee • YouTube Music Playlist',
    cover: DEFAULT_COVER
  });

  const playerRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const pendingPlayRef = useRef(false);
  const volumeRef = useRef(initialVolume);
  const lastVideoIdRef = useRef('');
  const consecutiveErrorsRef = useRef(0);
  const skipTimeoutRef = useRef(null);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  // Synchronize current video metadata from YouTube player
  const syncTrackMetadata = useCallback((player) => {
    if (!player || typeof player.getVideoData !== 'function') return;

    try {
      const data = player.getVideoData();
      if (!data) return;

      const videoId = data.video_id;
      const title = data.title;
      const author = data.author;

      if (videoId && (videoId !== lastVideoIdRef.current || title)) {
        lastVideoIdRef.current = videoId;
        const cover = videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : DEFAULT_COVER;

        setCurrentTrack({
          id: videoId || 'yt-track',
          videoId: videoId || '',
          title: title || 'Durga Puja Song',
          artist: author || 'Arup Mukherjee Collection',
          cover
        });
      }
    } catch (err) {
      console.warn('Error reading YouTube video data:', err);
    }
  }, []);

  // Poll timeline & duration during playback
  const startPolling = useCallback((player) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(() => {
      if (!player) return;

      try {
        if (typeof player.getCurrentTime === 'function') {
          const t = player.getCurrentTime();
          if (typeof t === 'number' && !isNaN(t)) {
            setCurrentTime(t);
          }
        }

        if (typeof player.getDuration === 'function') {
          const d = player.getDuration();
          if (typeof d === 'number' && !isNaN(d) && d > 0) {
            setDuration(d);
          }
        }

        syncTrackMetadata(player);
      } catch (err) {
        console.warn('Error polling YouTube player state:', err);
      }
    }, 250);
  }, [syncTrackMetadata]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Initialize YouTube IFrame API and Player
  useEffect(() => {
    let isMounted = true;

    const setupPlayer = () => {
      const mountEl = document.getElementById(containerId);
      if (!mountEl || !window.YT || !window.YT.Player) return;

      // Prevent re-creating if player already exists on element
      if (playerRef.current) return;

      try {
        const inst = new window.YT.Player(containerId, {
          height: '120',
          width: '200',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            enablejsapi: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : ''
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              const p = event.target;
              playerRef.current = p;
              setIsReady(true);

              try {
                p.setVolume(Math.round(volumeRef.current * 100));
              } catch (e) {
                console.warn('Error setting initial volume:', e);
              }

              // Cue the playlist tracks from playlist PLJAiFJ6bGyew
              try {
                if (Array.isArray(trackIds) && trackIds.length > 0) {
                  p.cuePlaylist({
                    playlist: trackIds,
                    index: 0,
                    startSeconds: 0
                  });
                } else if (playlistId) {
                  p.cuePlaylist({
                    list: playlistId,
                    listType: 'playlist',
                    index: 0,
                    startSeconds: 0
                  });
                }
              } catch (cueErr) {
                console.warn('Error cueing playlist:', cueErr);
              }

              // If user pressed Play while API was initializing
              if (pendingPlayRef.current) {
                pendingPlayRef.current = false;
                try {
                  p.playVideo();
                } catch (playErr) {
                  console.warn('Autoplay caught on onReady:', playErr);
                }
              }
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              const p = event.target;
              playerRef.current = p;
              const YTState = window.YT?.PlayerState;

              switch (event.data) {
                case YTState?.PLAYING:
                  consecutiveErrorsRef.current = 0;
                  setIsPlaying(true);
                  setIsBuffering(false);
                  setError(null);
                  syncTrackMetadata(p);
                  startPolling(p);
                  break;

                case YTState?.PAUSED:
                  setIsPlaying(false);
                  setIsBuffering(false);
                  stopPolling();
                  break;

                case YTState?.BUFFERING:
                  setIsBuffering(true);
                  syncTrackMetadata(p);
                  break;

                case YTState?.ENDED:
                  setIsPlaying(false);
                  setIsBuffering(false);
                  stopPolling();
                  try {
                    p.nextVideo();
                  } catch {}
                  break;

                case YTState?.CUED:
                  setIsPlaying(false);
                  setIsBuffering(false);
                  syncTrackMetadata(p);
                  break;

                default:
                  break;
              }
            },
            onError: (event) => {
              if (!isMounted) return;
              const p = event.target || playerRef.current;
              const errorCode = event.data;
              console.warn('YouTube Player Error code:', errorCode);

              // 100: Video removed/private, 101/150: Embed restricted by owner, 2: invalid param
              if (errorCode === 101 || errorCode === 150 || errorCode === 100 || errorCode === 2) {
                consecutiveErrorsRef.current += 1;

                if (consecutiveErrorsRef.current > MAX_CONSECUTIVE_SKIPS) {
                  setError('Several tracks restricted by copyright holder; tap YT Music to listen directly.');
                  return;
                }

                setError('Track restricted by rights holder; auto-advancing...');
                
                if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
                skipTimeoutRef.current = setTimeout(() => {
                  try {
                    if (p && typeof p.nextVideo === 'function') {
                      p.nextVideo();
                    }
                  } catch (err) {
                    console.warn('Error skipping restricted track:', err);
                  }
                }, 800);
              } else {
                setError('Playback notice: tap Play or Next to continue.');
              }
            }
          }
        });

        // Store reference immediately so play() calls don't get lost
        playerRef.current = inst;
        if (typeof window !== 'undefined') {
          window.__pujoYTPlayer = inst;
        }
      } catch (err) {
        console.error('Failed to instantiate YT.Player:', err);
      }
    };

    // Load YouTube IFrame API script if not present
    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevCallback === 'function') {
          try {
            prevCallback();
          } catch {}
        }
        if (isMounted) {
          setupPlayer();
        }
      };
    }

    return () => {
      isMounted = false;
      stopPolling();
      if (skipTimeoutRef.current) {
        clearTimeout(skipTimeoutRef.current);
      }
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [containerId, playlistId, trackIds, startPolling, stopPolling, syncTrackMetadata]);

  // User playback actions
  const play = useCallback(() => {
    setError(null);
    const player = playerRef.current;
    if (!player || typeof player.playVideo !== 'function') {
      pendingPlayRef.current = true;
      return;
    }
    try {
      player.playVideo();
    } catch (err) {
      console.warn('YouTube playVideo error:', err);
    }
  }, []);

  const pause = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.pauseVideo !== 'function') return;
    try {
      player.pauseVideo();
    } catch (err) {
      console.warn('YouTube pauseVideo error:', err);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const nextTrack = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.nextVideo !== 'function') return;
    try {
      setError(null);
      player.nextVideo();
    } catch (err) {
      console.warn('YouTube nextVideo error:', err);
    }
  }, []);

  const prevTrack = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.previousVideo !== 'function') return;
    try {
      setError(null);
      player.previousVideo();
    } catch (err) {
      console.warn('YouTube previousVideo error:', err);
    }
  }, []);

  const seekTo = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player || typeof player.seekTo !== 'function') return;
    try {
      player.seekTo(seconds, true);
      setCurrentTime(seconds);
    } catch (err) {
      console.warn('YouTube seekTo error:', err);
    }
  }, []);

  const setVolume = useCallback((newVol) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    const player = playerRef.current;
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(Math.round(clamped * 100));
        if (clamped === 0) {
          setIsMuted(true);
        } else {
          setIsMuted(false);
          if (typeof player.isMuted === 'function' && player.isMuted()) {
            player.unMute();
          }
        }
      } catch (err) {
        console.warn('YouTube setVolume error:', err);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      if (isMuted) {
        if (typeof player.unMute === 'function') player.unMute();
        if (typeof player.setVolume === 'function') {
          player.setVolume(Math.round((volume || 0.85) * 100));
        }
        setIsMuted(false);
      } else {
        if (typeof player.mute === 'function') player.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.warn('YouTube toggleMute error:', err);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    const player = playerRef.current;
    const nextShuffle = !isShuffled;
    setIsShuffled(nextShuffle);
    if (player && typeof player.setShuffle === 'function') {
      try {
        player.setShuffle(nextShuffle);
      } catch (err) {
        console.warn('YouTube setShuffle error:', err);
      }
    }
    if (nextShuffle && player && typeof player.nextVideo === 'function') {
      try {
        player.nextVideo();
      } catch {}
    }
  }, [isShuffled]);

  // Dhak volume ducking helper: smoothly scales current user volume
  const setDuckedVolumeRatio = useCallback((ratio) => {
    const player = playerRef.current;
    if (!player || typeof player.setVolume !== 'function') return;
    const clampedRatio = Math.max(0, Math.min(1, ratio));
    const effectiveVol = Math.round(volumeRef.current * clampedRatio * 100);
    try {
      player.setVolume(effectiveVol);
    } catch (err) {
      console.warn('YouTube setDuckedVolumeRatio error:', err);
    }
  }, []);

  const restoreVolume = useCallback(() => {
    const player = playerRef.current;
    if (!player || typeof player.setVolume !== 'function') return;
    try {
      player.setVolume(Math.round(volumeRef.current * 100));
    } catch (err) {
      console.warn('YouTube restoreVolume error:', err);
    }
  }, []);

  return {
    isReady,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    currentTrack,
    error,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    setDuckedVolumeRatio,
    restoreVolume
  };
}

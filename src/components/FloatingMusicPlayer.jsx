import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  ListMusic, 
  Loader2, 
  Radio, 
  Drum, 
  Shuffle, 
  AlertCircle
} from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL, YOUTUBE_PLAYLIST_URL } from '../data/tracks';

/**
 * FloatingMusicPlayer
 * Refined single compact glass player floating near the bottom-center of the wallpaper:
 * - Direct YouTube IFrame Player API playlist integration (PLJAiFJ6bGyew)
 * - Synchronized live track title, artist/channel, cover art, duration & seek timeline
 * - PUJA RADIO / DHAK mode toggle pills and direct SPOTIFY PLAYLIST embed launcher
 * - Volume slider with Dhak ambience crossfading
 * - Automatic skipping & user notification for embed-restricted tracks
 */
const FloatingMusicPlayer = ({
  currentTrack,
  isPlaying: fallbackIsPlaying = false,
  onPlayPause: fallbackPlayPause,
  onNext: fallbackNext,
  onPrev: fallbackPrev,
  onToggleLibrary,
  audioRef,
  dhakAudio = null,
  youtubePlayer = null,
  lang: _lang = 'en'
}) => {
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [localVolume, setLocalVolume] = useState(0.85);
  const [localIsMuted, setLocalIsMuted] = useState(false);
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('radio'); // 'radio' | 'dhak'

  // Determine active values (prefer YouTube Player API)
  const isUsingYouTube = Boolean(youtubePlayer);
  const displayTrack = (isUsingYouTube && youtubePlayer.currentTrack) ? youtubePlayer.currentTrack : currentTrack;
  const isPlaying = isUsingYouTube ? youtubePlayer.isPlaying : fallbackIsPlaying;
  const isLoading = isUsingYouTube ? youtubePlayer.isBuffering : localIsLoading;
  const currentTime = isUsingYouTube ? youtubePlayer.currentTime : localCurrentTime;
  const totalDuration = isUsingYouTube 
    ? (youtubePlayer.duration || displayTrack?.durationSec || 240)
    : (localDuration || displayTrack?.durationSec || 240);
  const volume = isUsingYouTube ? youtubePlayer.volume : localVolume;
  const isMuted = isUsingYouTube ? youtubePlayer.isMuted : localIsMuted;
  const isShuffled = isUsingYouTube ? youtubePlayer.isShuffled : false;
  const playerError = isUsingYouTube ? youtubePlayer.error : null;

  // Synchronize local audio element events only if fallback audioRef is used
  useEffect(() => {
    if (isUsingYouTube) return;
    const audio = audioRef?.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setLocalCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setLocalDuration(audio.duration || displayTrack?.durationSec || 0);
      setLocalIsLoading(false);
    };

    const handleCanPlay = () => setLocalIsLoading(false);
    const handleWaiting = () => setLocalIsLoading(true);
    const handlePlaying = () => setLocalIsLoading(false);
    const handlePause = () => setLocalIsLoading(false);
    const handleError = () => setLocalIsLoading(false);
    const handleEnded = () => fallbackNext?.();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef, displayTrack, fallbackNext, isUsingYouTube]);

  // Handle Seeking
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (isUsingYouTube) {
      youtubePlayer.seekTo(newTime);
    } else {
      setLocalCurrentTime(newTime);
      if (audioRef?.current && Number.isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    if (isUsingYouTube) {
      youtubePlayer.setVolume(val);
    } else {
      setLocalVolume(val);
      if (audioRef?.current) {
        audioRef.current.volume = val;
        setLocalIsMuted(val === 0);
      }
    }
  };

  const handleToggleMute = () => {
    if (isUsingYouTube) {
      youtubePlayer.toggleMute();
    } else if (audioRef?.current) {
      if (localIsMuted) {
        audioRef.current.volume = localVolume || 0.85;
        setLocalIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setLocalIsMuted(true);
      }
    }
  };

  // Play / Pause dispatcher
  const handlePlayPause = () => {
    if (isUsingYouTube) {
      youtubePlayer.togglePlay();
    } else {
      fallbackPlayPause?.();
    }
  };

  // Next Track dispatcher
  const handleNext = () => {
    if (isUsingYouTube) {
      youtubePlayer.nextTrack();
    } else {
      fallbackNext?.();
    }
  };

  // Previous Track dispatcher
  const handlePrev = () => {
    if (isUsingYouTube) {
      youtubePlayer.prevTrack();
    } else {
      fallbackPrev?.();
    }
  };

  // Shuffle dispatcher
  const handleShuffle = () => {
    if (isUsingYouTube) {
      youtubePlayer.toggleShuffle();
    } else {
      fallbackNext?.();
    }
  };

  // Mode button handler: PUJA RADIO vs DHAK Ambience Toggle
  const handleModeClick = (mode) => {
    if (mode === 'dhak') {
      if (dhakAudio) {
        dhakAudio.toggleDhak();
      }
    } else {
      setActiveMode('radio');
      if (!isPlaying) {
        handlePlayPause();
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || !Number.isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = totalDuration > 0 ? Math.min(100, Math.max(0, (currentTime / totalDuration) * 100)) : 0;
  const isDhakActive = Boolean(dhakAudio?.isDhakActive || dhakAudio?.isDhakPlaying);

  return (
    <div className="floating-player-wrapper" role="region" aria-label="Audio Player">
      {/* Top Floating Category Pills: PUJA RADIO and DHAK */}
      <div className="player-mode-pills-row">
        <button 
          type="button" 
          className={`player-mode-pill ${activeMode === 'radio' && !isDhakActive ? 'is-active' : ''}`}
          onClick={() => handleModeClick('radio')}
          title="Durga Puja Radio (YouTube Playlist)"
        >
          <Radio size={13} className="mode-pill-icon" />
          <span>PUJA RADIO</span>
        </button>

        <button 
          type="button" 
          className={`player-mode-pill ${isDhakActive ? 'is-active dhak-pulse-active' : ''}`}
          onClick={() => handleModeClick('dhak')}
          title={isDhakActive ? "Dhak Ambience Active — Click to smoothly fade out" : "Click to fade in authentic Durga Puja Dhak ambience"}
          aria-pressed={isDhakActive}
        >
          <Drum size={13} className="mode-pill-icon" />
          <span>DHAK</span>
          {isDhakActive && <span className="dhak-dot-indicator" />}
        </button>
      </div>

      {/* Main Glass Floating Player Container */}
      <div className={`floating-glass-player devipaksha-player-theme ${isPlaying ? 'glow-active' : ''}`}>
        
        {/* Left & Center: Album Artwork and Track Info */}
        <div className="player-track-info-group">
          <div className="player-artwork-box">
            <img 
              src={displayTrack?.cover || '/devipaksha_durga_puja_wallpaper.jpg'} 
              alt={displayTrack?.title || 'Durga Puja Track'} 
              className="player-artwork-img"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/devipaksha_durga_puja_wallpaper.jpg';
              }}
            />
            {isPlaying && (
              <div className="audio-equalizer-bars" aria-hidden="true">
                <span className="eq-bar bar-1"></span>
                <span className="eq-bar bar-2"></span>
                <span className="eq-bar bar-3"></span>
              </div>
            )}
          </div>

          {/* Center: Track details & Progress timeline */}
          <div className="player-center-track-block">
            <div className="player-meta-stacked">
              <div className="player-title-line">
                <span 
                  className="player-track-title" 
                  title={displayTrack?.title}
                  tabIndex={0}
                  aria-label={`Current track: ${displayTrack?.title}`}
                >
                  {displayTrack?.title || 'Durga Puja Songs'}
                </span>
              </div>
              <span 
                className="player-artist-name" 
                title={displayTrack?.artist}
                tabIndex={0}
                aria-label={`Artist: ${displayTrack?.artist}`}
              >
                {displayTrack?.artist || 'Sharadotsav Collection'}
              </span>

              {/* Error or skip notification banner if unplayable */}
              {playerError && (
                <div className="player-status-notice" role="status" title={playerError}>
                  <AlertCircle size={11} />
                  <span>{playerError}</span>
                </div>
              )}
            </div>

            {/* Progress bar with real-time timestamp */}
            <div className="player-progress-area">
              <span className="time-display">{formatTime(currentTime)}</span>
              <div className="progress-slider-container">
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="progress-seek-slider"
                  aria-label="Playback timeline"
                  style={{
                    background: `linear-gradient(to right, #ffd782 0%, #ffd782 ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
              </div>
              <span className="time-display">{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>

        {/* Playback action buttons */}
        <div className="player-buttons-group">
          <button 
            type="button" 
            className={`player-control-btn btn-shuffle ${isShuffled ? 'is-shuffled-active' : ''}`} 
            onClick={handleShuffle}
            title={isShuffled ? "Shuffle active (click to cycle)" : "Shuffle playlist tracks"}
            aria-label="Shuffle Track"
          >
            <Shuffle size={14} />
          </button>

          <button 
            type="button" 
            className="player-control-btn" 
            onClick={handlePrev}
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={16} />
          </button>

          <button 
            type="button" 
            className="player-play-btn" 
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={18} className="spin-animate" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="play-icon-offset" />
            )}
          </button>

          <button 
            type="button" 
            className="player-control-btn" 
            onClick={handleNext}
            title="Next Track"
            aria-label="Next Track"
          >
            <SkipForward size={16} />
          </button>

          {/* Library / Spotify Playlist Drawer Toggle Button */}
          <button
            type="button"
            className="player-control-btn btn-library-open"
            onClick={onToggleLibrary}
            title="Open Official Spotify Playlist"
            aria-label="Open Playlist"
          >
            <ListMusic size={16} />
          </button>
        </div>

        {/* Volume & External Links (YouTube Music & Spotify) */}
        <div className="player-right-actions">
          <div className="player-volume-group">
            <button 
              type="button" 
              className="player-icon-btn" 
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label="Toggle Mute"
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              aria-label="Volume Slider"
            />
          </div>

          <div className="player-direct-links-row">
            <a
              href={YOUTUBE_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify-track-pill yt-track-pill"
              title="Open playlist in YouTube Music"
            >
              <span>YT Music</span>
              <ExternalLink size={11} />
            </a>

            <a
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="spotify-track-pill"
              title="Open playlist in Spotify"
            >
              <span>Spotify</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(FloatingMusicPlayer);

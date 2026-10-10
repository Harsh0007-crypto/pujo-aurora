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
  Sparkles,
  Info,
  Music2
} from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL } from '../data/tracks';

/**
 * FloatingMusicPlayer
 * Refined single compact glass player floating near the bottom-center of the wallpaper,
 * styled after the user's reference screenshot:
 * - PUJA RADIO / DHAK mode toggle pills floating above the player
 * - Track album thumbnail on the left
 * - Song Title & Artist with elapsed / remaining time
 * - Shuffle, Previous, Play/Pause, Next, Library controls
 * - Volume slider and Spotify link
 * - Direct integration with Spotify Web Playback SDK when active, or verified local festive audio
 */
const FloatingMusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onToggleLibrary,
  audioRef,
  spotifyPlayer = null,
  dhakAudio = null
}) => {
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('radio'); // 'radio' | 'dhak'

  const isSpotifyActive = Boolean(spotifyPlayer?.isAvailable && spotifyPlayer?.isReady);
  const isActuallyPlaying = isSpotifyActive ? spotifyPlayer.isPlaying : isPlaying;

  // Active track information (Spotify Web Playback SDK state if active, else currentTrack)
  const displayTrack = (isSpotifyActive && spotifyPlayer?.currentTrack) 
    ? spotifyPlayer.currentTrack 
    : currentTrack;

  const currentTime = isSpotifyActive ? (spotifyPlayer.position || 0) : localCurrentTime;
  const totalDuration = isSpotifyActive 
    ? (spotifyPlayer.duration || displayTrack?.durationSec || 240)
    : (localDuration || displayTrack?.durationSec || 240);

  // Synchronize local audio element events when Spotify SDK is not active
  useEffect(() => {
    if (isSpotifyActive) return;

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setLocalCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setLocalDuration(audio.duration || displayTrack?.durationSec || 0);
      setIsLoading(false);
    };

    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handlePause = () => setIsLoading(false);
    const handleError = () => setIsLoading(false);
    const handleEnded = () => onNext();

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
  }, [audioRef, displayTrack, onNext, isSpotifyActive]);

  // Handle Seeking
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (isSpotifyActive && spotifyPlayer) {
      spotifyPlayer.seek(newTime);
    } else {
      setLocalCurrentTime(newTime);
      if (audioRef.current && Number.isFinite(newTime)) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isSpotifyActive && spotifyPlayer) {
      spotifyPlayer.setVolume(val);
      setIsMuted(val === 0);
    } else if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (isSpotifyActive && spotifyPlayer) {
      if (isMuted) {
        spotifyPlayer.setVolume(volume || 0.8);
        setIsMuted(false);
      } else {
        spotifyPlayer.setVolume(0);
        setIsMuted(true);
      }
    } else if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.8;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  // Play / Pause dispatcher
  const handlePlayPauseClick = () => {
    if (isSpotifyActive && spotifyPlayer) {
      spotifyPlayer.togglePlay();
    } else {
      onPlayPause();
    }
  };

  // Next / Prev dispatcher
  const handleNextClick = () => {
    if (isSpotifyActive && spotifyPlayer) {
      spotifyPlayer.nextTrack();
    } else {
      onNext();
    }
  };

  const handlePrevClick = () => {
    if (isSpotifyActive && spotifyPlayer) {
      spotifyPlayer.previousTrack();
    } else {
      onPrev();
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
      {/* Top Floating Category Pills: PUJA RADIO and DHAK (as in the reference image) */}
      <div className="player-mode-pills-row">
        <button 
          type="button" 
          className={`player-mode-pill ${activeMode === 'radio' && !isDhakActive ? 'is-active' : ''}`}
          onClick={() => handleModeClick('radio')}
          title="Durga Puja Radio"
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

        {/* Dynamic Verified Spotify Runtime Status Pill */}
        {(() => {
          if (!spotifyPlayer?.token) {
            return (
              <button
                type="button"
                className="player-mode-pill spotify-status-pill status-connect"
                onClick={onToggleLibrary}
                title="Connect your Spotify account to enable Web Playback SDK streaming"
              >
                <Music2 size={13} className="mode-pill-icon" />
                <span>CONNECT SPOTIFY</span>
              </button>
            );
          }

          if (spotifyPlayer.isInitializing || !spotifyPlayer.isReady) {
            return (
              <button
                type="button"
                className="player-mode-pill spotify-status-pill status-connecting"
                onClick={onToggleLibrary}
                title={spotifyPlayer.statusMessage || "Connecting to Spotify Web Playback device..."}
              >
                <span className="spotify-pulse-dot spotify-pulse-amber" />
                <span>CONNECTING...</span>
              </button>
            );
          }

          if (spotifyPlayer.isPlaying) {
            return (
              <button
                type="button"
                className="player-mode-pill spotify-status-pill status-playing"
                onClick={onToggleLibrary}
                title="Spotify Web Playback SDK is actively playing"
              >
                <span className="spotify-pulse-dot" />
                <span>PLAYING</span>
              </button>
            );
          }

          return (
            <button
              type="button"
              className="player-mode-pill spotify-status-pill status-ready"
              onClick={onToggleLibrary}
              title="Spotify Web Playback SDK device is ready"
            >
              <span className="spotify-pulse-dot" />
              <span>SPOTIFY READY</span>
            </button>
          );
        })()}
      </div>

      {/* Main Glass Floating Player Container */}
      <div className={`floating-glass-player devipaksha-player-theme ${isActuallyPlaying ? 'glow-active' : ''}`}>
        
        {/* Left: Album Artwork */}
        <div className="player-artwork-box">
          <img 
            src={displayTrack.cover} 
            alt={displayTrack.title} 
            className="player-artwork-img"
          />
          {isActuallyPlaying && (
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
                title={displayTrack.title}
                tabIndex={0}
                aria-label={`Current track: ${displayTrack.title}`}
              >
                {displayTrack.title}
              </span>
              {isSpotifyActive && isActuallyPlaying && (
                <span className="spotify-active-badge" title="Streaming via official Spotify Web Playback SDK">
                  <Sparkles size={10} /> SDK
                </span>
              )}
            </div>
            <span 
              className="player-artist-name" 
              title={displayTrack.artist}
              tabIndex={0}
              aria-label={`Artist: ${displayTrack.artist}`}
            >
              {displayTrack.artist}
            </span>
          </div>

          {/* Progress bar with timestamp */}
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

        {/* Playback action buttons */}
        <div className="player-buttons-group">
          <button 
            type="button" 
            className="player-control-btn btn-shuffle" 
            onClick={handleNextClick}
            title="Shuffle Track"
            aria-label="Shuffle Track"
          >
            <Shuffle size={14} />
          </button>

          <button 
            type="button" 
            className="player-control-btn" 
            onClick={handlePrevClick}
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={16} />
          </button>

          <button 
            type="button" 
            className="player-play-btn" 
            onClick={handlePlayPauseClick}
            title={isActuallyPlaying ? 'Pause' : 'Play'}
            aria-label={isActuallyPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={18} className="spin-animate" />
            ) : isActuallyPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="play-icon-offset" />
            )}
          </button>

          <button 
            type="button" 
            className="player-control-btn" 
            onClick={handleNextClick}
            title="Next Track"
            aria-label="Next Track"
          >
            <SkipForward size={16} />
          </button>

          {/* Library / Playlist Drawer Toggle Button */}
          <button
            type="button"
            className="player-control-btn btn-library-open"
            onClick={onToggleLibrary}
            title="Open Playlist & Track Library"
            aria-label="Open Playlist"
          >
            <ListMusic size={16} />
          </button>
        </div>

        {/* Volume & Spotify Direct Link */}
        <div className="player-right-actions">
          <div className="player-volume-group">
            <button 
              type="button" 
              className="player-icon-btn" 
              onClick={toggleMute}
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

      {/* Subtle SDK status notice if Spotify Premium is not detected or logged out */}
      {spotifyPlayer?.statusMessage && (
        <div className="player-sdk-notice">
          <Info size={12} className="notice-icon" />
          <span>{spotifyPlayer.statusMessage}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(FloatingMusicPlayer);

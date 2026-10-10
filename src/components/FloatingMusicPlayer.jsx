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
  Music2
} from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL } from '../data/tracks';

/**
 * FloatingMusicPlayer
 * Refined single compact glass player floating near the bottom-center of the wallpaper:
 * - PUJA RADIO / DHAK mode toggle pills and direct SPOTIFY PLAYLIST embed launcher
 * - Track album thumbnail on the left with subtle animated equalizer
 * - Song Title & Artist with elapsed / remaining time timeline
 * - Shuffle, Previous, Play/Pause, Next, and Library controls
 * - Volume slider and direct Spotify link
 * - Direct launcher for the official Spotify playlist embed modal
 */
const FloatingMusicPlayer = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  onToggleLibrary,
  audioRef,
  dhakAudio = null
}) => {
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('radio'); // 'radio' | 'dhak'

  const displayTrack = currentTrack;
  const currentTime = localCurrentTime;
  const totalDuration = localDuration || displayTrack?.durationSec || 240;

  // Synchronize local audio element events
  useEffect(() => {
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
  }, [audioRef, displayTrack, onNext]);

  // Handle Seeking
  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setLocalCurrentTime(newTime);
    if (audioRef.current && Number.isFinite(newTime)) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle Volume Change
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.85;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
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
      {/* Top Floating Category Pills: PUJA RADIO, DHAK, and SPOTIFY PLAYLIST */}
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

        {/* Official Spotify Playlist Embed Launcher Pill */}
        <button
          type="button"
          className="player-mode-pill spotify-status-pill status-ready"
          onClick={onToggleLibrary}
          title="Open official Spotify playlist embed"
        >
          <Music2 size={13} className="mode-pill-icon" />
          <span>SPOTIFY PLAYLIST</span>
        </button>
      </div>

      {/* Main Glass Floating Player Container */}
      <div className={`floating-glass-player devipaksha-player-theme ${isPlaying ? 'glow-active' : ''}`}>
        
        {/* Left: Album Artwork */}
        <div className="player-artwork-box">
          <img 
            src={displayTrack.cover} 
            alt={displayTrack.title} 
            className="player-artwork-img"
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
                title={displayTrack.title}
                tabIndex={0}
                aria-label={`Current track: ${displayTrack.title}`}
              >
                {displayTrack.title}
              </span>
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
            onClick={onNext}
            title="Shuffle Track"
            aria-label="Shuffle Track"
          >
            <Shuffle size={14} />
          </button>

          <button 
            type="button" 
            className="player-control-btn" 
            onClick={onPrev}
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={16} />
          </button>

          <button 
            type="button" 
            className="player-play-btn" 
            onClick={onPlayPause}
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
            onClick={onNext}
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
            title="Open Official Spotify Playlist"
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
    </div>
  );
};

export default React.memo(FloatingMusicPlayer);

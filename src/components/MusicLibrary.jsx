import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Disc3, 
  LogIn, 
  LogOut, 
  Sparkles, 
  Settings, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  Radio
} from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL } from '../data/tracks';
import { 
  initiateSpotifyLogin, 
  setSpotifyClientId, 
  getSpotifyClientId, 
  getRedirectUri 
} from '../services/spotifyAuth';

/**
 * MusicLibrary
 * Official Spotify Playlist & Web Playback SDK Modal:
 * 1. Modal header with external Spotify shortcut and Connect SDK toggle
 * 2. Real-time "NOW PLAYING" highlight card (updates upon confirmed playback)
 * 3. Official Spotify Playlist showcase card with direct link
 * 4. PKCE OAuth Connect SDK drawer for Web Playback SDK device connection
 */
const MusicLibrary = ({
  isOpen,
  onClose,
  lang = 'en',
  spotifyPlayer = null
}) => {
  const [showSdkSettings, setShowSdkSettings] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(getSpotifyClientId() || '');
  const [authError, setAuthError] = useState('');

  // Handle Spotify PKCE Login
  const handleConnectSpotify = async () => {
    setAuthError('');
    try {
      if (clientIdInput.trim()) {
        setSpotifyClientId(clientIdInput.trim());
      }
      await initiateSpotifyLogin(clientIdInput.trim());
    } catch (err) {
      setAuthError(err.message || 'Could not initiate Spotify connection');
    }
  };

  const redirectUri = typeof window !== 'undefined' ? getRedirectUri() : '';

  if (!isOpen) return null;

  // Confirmed playback state from Spotify Web Playback SDK
  const confirmedTrack = (spotifyPlayer?.isAvailable && spotifyPlayer?.isReady && spotifyPlayer?.currentTrack)
    ? spotifyPlayer.currentTrack
    : null;
  const isConfirmedPlaying = Boolean(spotifyPlayer?.isAvailable && spotifyPlayer?.isReady && spotifyPlayer?.isPlaying);

  return (
    <div className="music-library-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Spotify Playlist Modal">
      <div className="music-library-container glass-morphism spotify-modal-compact" onClick={(e) => e.stopPropagation()}>
        
        {/* 1. Modal Header */}
        <div className="library-header">
          <div className="library-title-box">
            <Disc3 className="spin-slow festival-accent-gold" size={24} />
            <div>
              <h2 className="library-title">
                {lang === 'bn' ? 'শারদোৎসব সঙ্গীত — অফিসিয়াল স্পটিফাই প্লেলিস্ট' : 'Durga Puja Songs — Official Spotify Playlist'}
              </h2>
              <p className="library-subtitle">
                {lang === 'bn' 
                  ? 'আশ্বিনের সুর ও পুজো আবহ — আশ্বিন শারদ সঙ্গীত সংগ্রহ'
                  : 'The Timeless Sounds of Durga Puja — Curated Festival Playlist'}
              </p>
            </div>
          </div>

          <div className="library-header-actions">
            <button
              type="button"
              className={`sdk-config-toggle-btn ${showSdkSettings ? 'is-active' : ''}`}
              onClick={() => setShowSdkSettings(!showSdkSettings)}
              title="Configure Spotify Web Playback SDK (PKCE)"
            >
              <Settings size={13} />
              <span>{spotifyPlayer?.isAvailable ? (spotifyPlayer.userProfile?.display_name || 'Connected') : 'Connect SDK'}</span>
            </button>
            <a 
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="spotify-open-direct-btn"
              title="Open full playlist in Spotify app"
            >
              <span>{lang === 'bn' ? 'স্পটিফাইতে শুনুন' : 'Open in Spotify'}</span>
              <ExternalLink size={13} />
            </a>
            <button 
              type="button" 
              className="library-close-btn"
              onClick={onClose}
              aria-label="Close Music Library"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Collapsible SDK OAuth / PKCE Connect Panel */}
        {showSdkSettings && (
          <div className="spotify-sdk-setup-drawer">
            <div className="sdk-drawer-header">
              <div className="sdk-header-icon-title">
                <Sparkles size={16} className="festival-accent-gold" />
                <h4>Spotify Web Playback SDK (Full-Length Streaming)</h4>
              </div>
              {spotifyPlayer?.isAvailable && (
                <button 
                  type="button" 
                  className="sdk-logout-btn"
                  onClick={() => spotifyPlayer.logout()}
                >
                  <LogOut size={13} />
                  <span>Disconnect</span>
                </button>
              )}
            </div>

            {spotifyPlayer?.isAvailable ? (
              <div className="sdk-connected-status-card">
                <div className="status-avatar-row">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>
                    Signed in as <strong>{spotifyPlayer.userProfile?.display_name || 'Spotify User'}</strong>
                    {spotifyPlayer.hasPremium ? ' (Spotify Premium Verified)' : ' (Free Account — Premium required for SDK playback)'}
                  </span>
                </div>
                <p className="sdk-status-help-txt">
                  Connected to Spotify Web Playback SDK device ({spotifyPlayer.deviceId ? 'Device Ready' : 'Connecting device...'}).
                </p>
              </div>
            ) : (
              <div className="sdk-connect-form">
                <p className="sdk-form-desc">
                  Connect your Spotify account using Spotify's official <strong>PKCE OAuth Flow</strong> (no secret exposed). 
                  To enable browser playback on your Spotify app, set Redirect URI in your Spotify Developer Dashboard to:
                </p>
                <code className="redirect-uri-pill">{redirectUri}</code>

                <div className="client-id-input-row">
                  <input 
                    type="text" 
                    placeholder="Enter Spotify Client ID (e.g. 4a2b9c8d...)" 
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    className="spotify-client-id-field"
                  />
                  <button 
                    type="button" 
                    className="spotify-connect-action-btn"
                    onClick={handleConnectSpotify}
                  >
                    <LogIn size={14} />
                    <span>Connect with Spotify</span>
                  </button>
                </div>

                {authError && (
                  <div className="sdk-auth-error-msg">
                    <AlertCircle size={14} />
                    <span>{authError}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. Top "NOW PLAYING" Highlight Card — ONLY updated when playback state confirms */}
        {confirmedTrack ? (
          <div className={`library-now-playing-banner ${isConfirmedPlaying ? 'is-active' : 'is-paused'}`}>
            <div className="now-playing-cover-wrapper">
              <img 
                src={confirmedTrack.cover || '/devipaksha_durga_puja_wallpaper.jpg'} 
                alt={confirmedTrack.title} 
                className={`now-playing-cover-img ${isConfirmedPlaying ? 'spin-subtle' : ''}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/devipaksha_durga_puja_wallpaper.jpg';
                }}
              />
              {isConfirmedPlaying && (
                <div className="now-playing-equalizer-mini" aria-hidden="true">
                  <span className="eq-bar eq-b1" />
                  <span className="eq-bar eq-b2" />
                  <span className="eq-bar eq-b3" />
                </div>
              )}
            </div>

            <div className="now-playing-info">
              <div className="now-playing-status-tag">
                <span className={`status-live-indicator ${isConfirmedPlaying ? 'live-pulsing' : ''}`} />
                <span className="status-label-txt">
                  {isConfirmedPlaying 
                    ? (lang === 'bn' ? 'বর্তমানে বাজছে' : 'NOW PLAYING') 
                    : (lang === 'bn' ? 'প্লেয়ার বিরতি' : 'CURRENT TRACK')}
                </span>
                <span className="source-stream-tag">
                  Spotify Web SDK
                </span>
              </div>
              <h3 className="now-playing-song-title" title={confirmedTrack.title}>
                {confirmedTrack.title}
              </h3>
              <p className="now-playing-song-artist">
                {confirmedTrack.artist}
              </p>
            </div>

            <div className="now-playing-indicator-pill">
              <Volume2 size={15} className={isConfirmedPlaying ? 'icon-playing text-gold' : 'text-muted'} />
              <span>{isConfirmedPlaying ? (lang === 'bn' ? 'সক্রিয়' : 'Playing') : (lang === 'bn' ? 'স্থগিত' : 'Paused')}</span>
            </div>
          </div>
        ) : (
          <div className="library-now-playing-banner is-standby">
            <div className="now-playing-cover-wrapper standby-disc">
              <Disc3 className="text-muted spin-slow" size={26} />
            </div>
            <div className="now-playing-info">
              <div className="now-playing-status-tag">
                <span className="status-label-txt text-muted">
                  {lang === 'bn' ? 'প্লেয়ার প্রস্তুত' : 'READY TO PLAY'}
                </span>
                <span className="source-stream-tag">
                  Spotify Web SDK
                </span>
              </div>
              <h3 className="now-playing-song-title text-dimmed">
                {lang === 'bn' ? 'স্পটিফাই প্লেয়ার স্ট্যান্ডবাই' : 'Spotify Web Playback SDK Standby'}
              </h3>
              <p className="now-playing-song-artist text-muted">
                {lang === 'bn' ? 'অফিসিয়াল স্পটিফাই প্লেলিস্ট (1zVKSwcN1UDYBXsBWQlp16)' : 'Official Spotify Playlist (1zVKSwcN1UDYBXsBWQlp16)'}
              </p>
            </div>
          </div>
        )}

        {/* 3. Tasteful Official Spotify Playlist Direct Showcase Card */}
        <div className="playlist-direct-access-card">
          <div className="playlist-direct-content">
            <div className="playlist-badge-icon">
              <Radio size={24} className="festival-accent-gold" />
            </div>
            <div className="playlist-direct-details">
              <h4 className="playlist-direct-title">
                {lang === 'bn' ? 'অফিসিয়াল শারদোৎসব সঙ্গীত প্লেলিস্ট' : 'Official Durga Puja Playlist'}
              </h4>
              <p className="playlist-direct-desc">
                {lang === 'bn' 
                  ? 'মহালয়া, আগমনী সুর, ঢাকের বোল এবং উৎসবের জনপ্রিয় গান উপভোগ করতে সরাসরি স্পটিফাইতে শুনুন।'
                  : 'Listen to the full, curated collection of Mahalaya chants, festive Bengali anthems, and vibrant Dhaak rhythms directly on Spotify.'}
              </p>
            </div>
          </div>

          <div className="playlist-direct-action-box">
            <a 
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="spotify-primary-launch-btn"
              title="Open Durga Puja Songs on Spotify"
            >
              <span>{lang === 'bn' ? 'স্পটিফাইতে শুনুন' : 'Open in Spotify'}</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* 4. Footer info banner with official attribution */}
        <div className="library-footer-banner">
          <span className="spotify-dot-icon">●</span>
          <span>
            {lang === 'bn' 
              ? 'অফিসিয়াল স্পটিফাই প্লেলিস্ট (1zVKSwcN1UDYBXsBWQlp16)। সম্পূর্ণ প্লেলিস্ট শুনতে "Open in Spotify" বাটনে ক্লিক করুন।'
              : 'Directly linked to the official Spotify Playlist (1zVKSwcN1UDYBXsBWQlp16). Click "Open in Spotify" to listen.'}
          </span>
          <a
            href={SPOTIFY_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-spotify-attr-link"
            title="Open playlist in Spotify"
          >
            <ExternalLink size={11} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default React.memo(MusicLibrary);

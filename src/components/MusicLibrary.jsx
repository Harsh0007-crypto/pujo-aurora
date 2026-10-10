import React from 'react';
import { 
  X, 
  ExternalLink, 
  Disc3, 
  Music2 
} from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL, SPOTIFY_EMBED_URL } from '../data/tracks';

/**
 * MusicLibrary
 * Official Spotify Playlist Embed Modal for Pujo Aurora:
 * - Features the official Spotify playlist embed player (1zVKSwcN1UDYBXsBWQlp16)
 * - Retains regal glass styling, responsive desktop/mobile layout
 * - Provides direct "Open in Spotify" link and modal close button
 * - Communicates that browser autoplay policies require pressing Play directly inside the embed
 */
const MusicLibrary = ({
  isOpen,
  onClose,
  lang = 'en'
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="music-library-backdrop" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-label="Spotify Playlist Player Modal"
    >
      <div 
        className="music-library-container glass-morphism spotify-modal-embed-mode" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Modal Header with Title, Open in Spotify, and Close Controls */}
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
            <a 
              href={SPOTIFY_PLAYLIST_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="spotify-open-direct-btn"
              title="Open full playlist in Spotify app"
            >
              <span>{lang === 'bn' ? 'স্পটিফাইতে খুলুন' : 'Open in Spotify'}</span>
              <ExternalLink size={13} />
            </a>
            
            <button 
              type="button" 
              className="library-close-btn"
              onClick={onClose}
              aria-label="Close Music Player"
              title={lang === 'bn' ? 'বন্ধ করুন' : 'Close player'}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. Official Spotify Playlist Embed Frame */}
        <div className="spotify-embed-frame-box">
          <iframe 
            data-testid="embed-iframe" 
            style={{ borderRadius: '12px' }} 
            src={SPOTIFY_EMBED_URL} 
            width="100%" 
            height="352" 
            frameBorder="0" 
            allowFullScreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            title="Official Durga Puja Spotify Playlist"
          />
        </div>

        {/* 3. Helpful note on playback interaction */}
        <div className="spotify-embed-notice">
          <span className="notice-dot">●</span>
          <span>
            {lang === 'bn' 
              ? 'ব্রাউজারে গান শুনতে প্লেলিস্টের প্লে বাটনে ট্যাপ করুন। সম্পূর্ণ গান ও বিজ্ঞাপনবিহীন অভিজ্ঞতার জন্য স্পটিফাই অ্যাকাউন্টে সাইন ইন থাকতে পারে।'
              : 'Tap Play on any track inside the player above to start listening. Browsers require direct user interaction to begin playback.'}
          </span>
        </div>

        {/* 4. Footer attribution bar */}
        <div className="library-footer-banner">
          <div className="footer-attr-left">
            <Music2 size={13} className="festival-accent-gold" />
            <span>
              {lang === 'bn' 
                ? 'অফিসিয়াল স্পটিফাই শারদোৎসব প্লেলিস্ট • Pujo Aurora'
                : 'Official Spotify Sharadotsav Playlist • Pujo Aurora'}
            </span>
          </div>

          <a
            href={SPOTIFY_PLAYLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-spotify-attr-link"
            title="Open playlist in Spotify"
          >
            <span>open.spotify.com</span>
            <ExternalLink size={11} />
          </a>
        </div>

      </div>
    </div>
  );
};

export default React.memo(MusicLibrary);

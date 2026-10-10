import React from 'react';
import FestivalCountdown from './FestivalCountdown';
import { Compass } from 'lucide-react';

/**
 * BengaliHero
 * Displays the iconic Bengali headline “পুজো আসছে”
 * Formatted with stacked calligraphic lettering matching the reference:
 *   পুজো
 *  আসছে
 * Centered in the open evening sky with no right clipping or overflow.
 */
const BengaliHero = ({ lang = 'bn', onExploreClick }) => {
  return (
    <div className="bengali-hero-section">
      <div className="bengali-hero-content">
        {/* Top festival countdown pill */}
        <div className="hero-pill-wrapper">
          <FestivalCountdown lang={lang} compact={true} />
        </div>

        {/* The Exact Bengali Headline - Two stacked calligraphic lines */}
        <h1 className="bengali-main-headline" lang="bn">
          <span className="headline-line-1">পুজো</span>
          <span className="headline-line-2">আসছে</span>
        </h1>

        {/* Action badge to open the Playlist / Library drawer */}
        <div className="hero-badges">
          <button 
            type="button" 
            className="hero-badge hero-badge-interactive"
            onClick={onExploreClick}
            aria-label="Open Playlist and Track Library"
          >
            <Compass size={14} className="badge-icon" />
            <span>{lang === 'bn' ? 'পুজো প্লেলিস্ট ও সঙ্গীত ভাণ্ডার' : 'Pujo Playlist & Music'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BengaliHero;

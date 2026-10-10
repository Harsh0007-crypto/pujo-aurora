import React, { useState, useEffect } from 'react';
import { Languages, Clock, Music, Sparkles, Sun, Moon, Bot } from 'lucide-react';
import { SPOTIFY_PLAYLIST_URL } from '../data/tracks';

/**
 * TopNavControls
 * Header bar styled cleanly after the reference image:
 * - Local IST time pill on the left
 * - Day/Night toggle, Experience Pujo, Ask Pujo AI, Spotify playlist shortcut & language toggle on the right
 */
const TopNavControls = ({ 
  lang, 
  onToggleLang, 
  onOpenLibrary, 
  isExperienceActive = false, 
  onToggleExperience,
  isNightMode = false,
  onToggleDayNight,
  onOpenAiModal
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      setCurrentTimeStr(timeFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-festival-controls" role="banner">
      {/* Kolkata Local Time (e.g., 9:40 pm IST) */}
      <div className="nav-control-pill time-pill" title="Kolkata Local Time (IST)">
        <Clock size={13} className="pill-icon" />
        <span className="time-val">{currentTimeStr}</span>
        <span className="ist-tag">IST</span>
      </div>

      {/* Right controls: Day/Night, Experience Pujo, Spotify Playlist & Language Switcher */}
      <div className="top-nav-actions">
        {/* Day / Night Mode Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={isNightMode}
          className={`nav-control-pill theme-mode-pill ${isNightMode ? 'night-active' : 'day-active'}`}
          onClick={onToggleDayNight}
          aria-label={lang === 'bn' ? 'দিন / রাত মোড পরিবর্তন' : 'Toggle Day / Night mode'}
          title={isNightMode 
            ? (lang === 'bn' ? 'দিনের আলোতে ফিরুন' : 'Switch to Day atmosphere') 
            : (lang === 'bn' ? 'রাতের আলোতে যান' : 'Switch to Night atmosphere')}
        >
          {isNightMode ? (
            <Moon size={13} className="theme-pill-icon moon-icon" />
          ) : (
            <Sun size={13} className="theme-pill-icon sun-icon" />
          )}
          <span className="theme-mode-label">
            {lang === 'bn' ? 'দিন / রাত' : 'Day / Night'}
          </span>
          <span className="theme-mode-pill-badge" aria-hidden="true">
            {isNightMode ? (lang === 'bn' ? 'রাত' : 'Night') : (lang === 'bn' ? 'দিন' : 'Day')}
          </span>
        </button>

        {/* Experience Pujo Atmosphere Toggle */}
        <button 
          type="button" 
          role="switch"
          aria-checked={isExperienceActive}
          className={`nav-control-pill experience-toggle-pill ${isExperienceActive ? 'active' : ''}`}
          onClick={onToggleExperience}
          aria-label={lang === 'bn' ? 'পুজো অনুভব করুন টগল' : 'Toggle Experience Pujo festive atmosphere'}
          title={isExperienceActive 
            ? (lang === 'bn' ? 'পুজো পরিবেশ বন্ধ করুন' : 'Disable Experience Pujo atmosphere') 
            : (lang === 'bn' ? 'পুজো পরিবেশ চালু করুন' : 'Enable Experience Pujo atmosphere')}
        >
          <Sparkles size={13} className={`experience-sparkle-icon ${isExperienceActive ? 'active-sparkle' : ''}`} />
          <span className="experience-pujo-label">
            {lang === 'bn' ? 'পুজো অনুভব করুন' : 'Experience Pujo'}
          </span>
          <span className="experience-switch-track" aria-hidden="true">
            <span className="experience-switch-thumb" />
          </span>
        </button>

        {/* Ask Pujo AI Companion Button */}
        <button
          type="button"
          className="nav-control-pill ai-nav-pill"
          onClick={onOpenAiModal}
          aria-label={lang === 'bn' ? 'পুজো এআই উৎসব সঙ্গীর সাথে কথা বলুন' : 'Ask Pujo AI Festival Companion'}
          title={lang === 'bn' ? 'পুজো এআই ও শুভেচ্ছা সহকারী খুলুন' : 'Open Pujo AI Companion & Greeting Generator'}
        >
          <Bot size={13} className="ai-pill-icon" />
          <span className="ai-pill-label">
            {lang === 'bn' ? 'পুজো এআই' : 'Ask Pujo AI'}
          </span>
        </button>

        {/* Open Spotify Playlist & Music Drawer */}
        <button 
          type="button" 
          className="nav-control-pill spotify-nav-pill"
          onClick={onOpenLibrary}
          aria-label="Open Durga Puja Music & Spotify Playlist"
        >
          <span className="spotify-dot-icon">●</span>
          <span className="lang-label">
            {lang === 'bn' ? 'স্পটিফাই প্লেলিস্ট' : 'Spotify Playlist'}
          </span>
        </button>

        {/* Direct Spotify External Link */}
        <a 
          href={SPOTIFY_PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="nav-control-pill icon-only-pill"
          title="Open in Spotify Web / App"
          aria-label="Open Spotify externally"
        >
          <Music size={14} className="spotify-green-icon" />
        </a>

        {/* Language Toggle */}
        <button 
          type="button" 
          className="nav-control-pill lang-toggle-pill"
          onClick={onToggleLang}
          aria-label="Toggle Bengali / English language"
        >
          <Languages size={14} className="pill-icon" />
          <span className="lang-label">
            {lang === 'bn' ? 'বাংলা' : 'EN'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default React.memo(TopNavControls);

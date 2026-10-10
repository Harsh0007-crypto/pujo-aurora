import React, { useState, useRef, useEffect, useCallback } from 'react';
import FestivalBackground from './components/FestivalBackground';
import TopNavControls from './components/TopNavControls';
import BengaliHero from './components/BengaliHero';
import FloatingMusicPlayer from './components/FloatingMusicPlayer';
import MusicLibrary from './components/MusicLibrary';
import PujoAiModal from './components/PujoAiModal';
import { LOCAL_AMBIENT_TRACKS } from './data/tracks';
import { useSpotifyWebPlayback } from './hooks/useSpotifyPlayer';
import { useDhakAudio } from './hooks/useDhakAudio';

function App() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('pujo_aurora_lang') || 'en';
    } catch {
      return 'en';
    }
  }); // Default 'en' on every fresh page load, user can toggle to 'bn'
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExperienceActive, setIsExperienceActive] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  
  // Real HTML5 Audio Element Ref for local festive audio playback
  const audioRef = useRef(null);

  // Initialize official Spotify Web Playback SDK integration
  const spotifyPlayer = useSpotifyWebPlayback();

  // Active main playback state
  const isMainPlaying = spotifyPlayer.isAvailable && spotifyPlayer.isReady
    ? spotifyPlayer.isPlaying
    : isPlaying;

  // Initialize dedicated Dhak audio controller with smooth crossfade
  const dhakAudio = useDhakAudio({
    mainAudioRef: audioRef,
    spotifyPlayer,
    userVolume: 0.85,
    isMainPlaying
  });

  const currentAmbientTrack = LOCAL_AMBIENT_TRACKS[currentTrackIndex] || LOCAL_AMBIENT_TRACKS[0];

  // Whether active playback is running either through Spotify SDK, local audio, or Dhak ambience
  const soundPlaying = isMainPlaying || dhakAudio.isDhakPlaying;

  // Play / Pause handling for local player (when Spotify SDK is not controlling)
  const handlePlayPause = useCallback(() => {
    // If Spotify SDK is active and connected, dispatch to Spotify SDK
    if (spotifyPlayer.isAvailable && spotifyPlayer.isReady) {
      spotifyPlayer.togglePlay();
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (!audio.src || !audio.src.includes(currentAmbientTrack.audioUrl)) {
        audio.src = currentAmbientTrack.audioUrl;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Playback permission or restriction:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [isPlaying, currentAmbientTrack.audioUrl, spotifyPlayer]);

  // Next Track
  const handleNextTrack = useCallback(() => {
    if (spotifyPlayer.isAvailable && spotifyPlayer.isReady) {
      spotifyPlayer.nextTrack();
      return;
    }

    setCurrentTrackIndex((prevIndex) => {
      return (prevIndex + 1) % LOCAL_AMBIENT_TRACKS.length;
    });
  }, [spotifyPlayer]);

  // Previous Track
  const handlePrevTrack = useCallback(() => {
    if (spotifyPlayer.isAvailable && spotifyPlayer.isReady) {
      spotifyPlayer.previousTrack();
      return;
    }

    setCurrentTrackIndex((prevIndex) => {
      return (prevIndex - 1 + LOCAL_AMBIENT_TRACKS.length) % LOCAL_AMBIENT_TRACKS.length;
    });
  }, [spotifyPlayer]);

  // Select Track from Floating Player or local playlist switch
  const handleSelectTrack = useCallback((track) => {
    // If track is a local ambient track
    const idx = LOCAL_AMBIENT_TRACKS.findIndex((t) => t.id === track.id);
    if (idx !== -1) {
      if (idx === currentTrackIndex) {
        handlePlayPause();
      } else {
        setCurrentTrackIndex(idx);
        setIsPlaying(true);
      }
    }
  }, [currentTrackIndex, handlePlayPause]);

  // Language Toggle
  const handleToggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'bn' : 'en';
      try {
        localStorage.setItem('pujo_aurora_lang', next);
      } catch {
        // Ignore localStorage error
      }
      return next;
    });
  }, []);

  // Experience Pujo Atmosphere Toggle
  const handleToggleExperience = useCallback(() => {
    setIsExperienceActive((prev) => !prev);
  }, []);

  // Day / Night Atmosphere Toggle
  const handleToggleDayNight = useCallback(() => {
    setIsNightMode((prev) => !prev);
  }, []);

  // Switch audio source whenever currentTrack changes (when not running on Spotify SDK)
  useEffect(() => {
    if (spotifyPlayer.isAvailable && spotifyPlayer.isReady) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentAmbientTrack.audioUrl;
    audio.load();

    if (isPlaying) {
      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play on track switch caught:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentTrackIndex, currentAmbientTrack.audioUrl, isPlaying, spotifyPlayer.isAvailable, spotifyPlayer.isReady]);

  return (
    <main className="pujo-aurora-app">
      {/* 1. Underlying Living Festival Wallpaper matching Devi Paksha reference */}
      <FestivalBackground 
        soundPlaying={soundPlaying} 
        isExperienceActive={isExperienceActive}
        isNightMode={isNightMode}
      />

      {/* 2. Top Festival Header: Local Kolkata Time, Day/Night, Experience Pujo, Ask Pujo AI & Spotify Shortcut */}
      <TopNavControls 
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        isExperienceActive={isExperienceActive}
        onToggleExperience={handleToggleExperience}
        isNightMode={isNightMode}
        onToggleDayNight={handleToggleDayNight}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* 3. Stacked Bengali Headline “পুজো আসছে” centered in open twilight sky */}
      <BengaliHero 
        lang={lang}
        onExploreClick={() => setIsLibraryOpen(true)}
      />

      {/* 4. Single compact floating music player matching the reference mockup */}
      <FloatingMusicPlayer
        currentTrack={currentAmbientTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNextTrack}
        onPrev={handlePrevTrack}
        onToggleLibrary={() => setIsLibraryOpen(true)}
        onSelectTrack={handleSelectTrack}
        tracks={LOCAL_AMBIENT_TRACKS}
        lang={lang}
        audioRef={audioRef}
        spotifyPlayer={spotifyPlayer}
        dhakAudio={dhakAudio}
      />

      {/* 5. Official Spotify Playlist Modal & SDK Connect Drawer */}
      <MusicLibrary 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        lang={lang}
        spotifyPlayer={spotifyPlayer}
      />

      {/* 6. Pujo AI — Your Festival Companion & Greeting Creator Modal */}
      <PujoAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        lang={lang}
      />

      {/* Real HTML5 Audio Element for local audio streams */}
      <audio 
        ref={audioRef}
        preload="metadata"
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.warn('HTML5 Audio error encountered:', e);
          setIsPlaying(false);
        }}
      />
    </main>
  );
}

export default App;

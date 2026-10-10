import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useDhakAudio
 * Dedicated controller for authentic Bengali Durga Puja Dhak ambient layer:
 * - Completely independent from main music player (HTML5 audio or Spotify SDK).
 * - Smooth exponential/linear crossfade:
 *   - When enabled: gradually lowers main music volume to ~35% of current over ~2s,
 *     while smoothly fading in looping Dhak audio from 0 to target ~0.72 over ~2.5s.
 *   - When disabled: fades Dhak audio to 0 over ~2.2s, then pauses, and smoothly restores
 *     main music volume back to the user's original volume setting over ~2s.
 * - Handles rapid repeated clicks, interrupted fades, pause state, and playback errors cleanly.
 */
export function useDhakAudio({
  mainAudioRef,
  spotifyPlayer,
  userVolume = 0.85,
  isMainPlaying = false
}) {
  const [isDhakActive, setIsDhakActive] = useState(false);
  const [isDhakPlaying, setIsDhakPlaying] = useState(false);
  const [dhakError, setDhakError] = useState(null);

  const dhakAudioRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const savedMusicVolumeRef = useRef(null);
  const wasMainPlayingWhenEnabledRef = useRef(false);

  // Initialize dedicated Dhak audio instance
  useEffect(() => {
    const audio = new Audio('/audio/puja_dhak_beats.ogg');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;

    const handlePlaying = () => {
      setIsDhakPlaying(true);
      setDhakError(null);
    };

    const handlePause = () => {
      if (audio.volume <= 0.02) {
        setIsDhakPlaying(false);
      }
    };

    const handleError = (e) => {
      console.warn('Dhak ambient audio error:', e);
      setIsDhakActive(false);
      setIsDhakPlaying(false);
      setDhakError('Dhak audio could not be loaded');
    };

    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    dhakAudioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
      audio.src = '';
      dhakAudioRef.current = null;
    };
  }, []);

  // Helper to adjust main player volume smoothly (either HTML5 audio or Spotify SDK)
  const setMainVolumeRatio = useCallback((ratio) => {
    // Clamp ratio between 0 and 1
    const clamped = Math.max(0, Math.min(1, ratio));

    if (mainAudioRef?.current) {
      mainAudioRef.current.volume = clamped;
    }

    if (spotifyPlayer?.isAvailable && spotifyPlayer?.isReady && typeof spotifyPlayer.setVolume === 'function') {
      spotifyPlayer.setVolume(clamped).catch(() => {});
    }
  }, [mainAudioRef, spotifyPlayer]);

  // Cancel any running fade animation
  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  /**
   * Smoothly crossfade in Dhak and duck main music
   */
  const startDhak = useCallback(() => {
    const dhakAudio = dhakAudioRef.current;
    if (!dhakAudio) return;

    clearFadeInterval();
    setIsDhakActive(true);

    // Save baseline user volume if not already saved
    if (savedMusicVolumeRef.current === null) {
      savedMusicVolumeRef.current = userVolume;
    }
    wasMainPlayingWhenEnabledRef.current = isMainPlaying;

    const baseMusicVol = savedMusicVolumeRef.current;
    const targetMusicDuckedVol = Math.max(0.12, baseMusicVol * 0.35); // 35% of original
    const targetDhakVol = 0.72; // comfortable ambient level

    // Start Dhak playback from 0 volume
    dhakAudio.volume = Math.max(0, dhakAudio.volume);
    const playPromise = dhakAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Dhak play permission caught:', err);
        setIsDhakActive(false);
        setIsDhakPlaying(false);
      });
    }

    const durationMs = 2200; // 2.2 seconds smooth crossfade
    const stepMs = 50;
    const totalSteps = durationMs / stepMs;
    let step = 0;

    const startDhakVol = dhakAudio.volume;
    const startMusicVol = mainAudioRef?.current ? mainAudioRef.current.volume : baseMusicVol;

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = Math.min(1, step / totalSteps);

      // Smooth cosine easing
      const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);

      // Fade in Dhak
      dhakAudio.volume = Math.min(1, Math.max(0, startDhakVol + (targetDhakVol - startDhakVol) * ease));

      // Duck main music if it is playing
      if (wasMainPlayingWhenEnabledRef.current) {
        const currentMusicVol = startMusicVol + (targetMusicDuckedVol - startMusicVol) * ease;
        setMainVolumeRatio(currentMusicVol);
      }

      if (progress >= 1) {
        clearFadeInterval();
        dhakAudio.volume = targetDhakVol;
        if (wasMainPlayingWhenEnabledRef.current) {
          setMainVolumeRatio(targetMusicDuckedVol);
        }
      }
    }, stepMs);
  }, [userVolume, isMainPlaying, mainAudioRef, setMainVolumeRatio]);

  /**
   * Smoothly crossfade out Dhak and restore main music volume
   */
  const stopDhak = useCallback(() => {
    const dhakAudio = dhakAudioRef.current;
    if (!dhakAudio) return;

    clearFadeInterval();
    setIsDhakActive(false);

    const baseMusicVol = savedMusicVolumeRef.current !== null ? savedMusicVolumeRef.current : userVolume;
    const startDhakVol = dhakAudio.volume;
    const startMusicVol = mainAudioRef?.current ? mainAudioRef.current.volume : baseMusicVol;

    const durationMs = 2000; // 2 seconds fade out
    const stepMs = 50;
    const totalSteps = durationMs / stepMs;
    let step = 0;

    fadeIntervalRef.current = setInterval(() => {
      step++;
      const progress = Math.min(1, step / totalSteps);
      const ease = 0.5 - 0.5 * Math.cos(progress * Math.PI);

      // Fade out Dhak
      const newDhakVol = Math.max(0, startDhakVol * (1 - ease));
      dhakAudio.volume = newDhakVol;

      // Restore main music volume smoothly if it was playing
      if (wasMainPlayingWhenEnabledRef.current) {
        const newMusicVol = startMusicVol + (baseMusicVol - startMusicVol) * ease;
        setMainVolumeRatio(newMusicVol);
      }

      if (progress >= 1) {
        clearFadeInterval();
        dhakAudio.volume = 0;
        dhakAudio.pause();
        setIsDhakPlaying(false);

        // Final restore
        setMainVolumeRatio(baseMusicVol);
        savedMusicVolumeRef.current = null;
      }
    }, stepMs);
  }, [userVolume, mainAudioRef, setMainVolumeRatio]);

  // Toggle Dhak on/off
  const toggleDhak = useCallback(() => {
    if (isDhakActive) {
      stopDhak();
    } else {
      startDhak();
    }
  }, [isDhakActive, startDhak, stopDhak]);

  return {
    isDhakActive,
    isDhakPlaying,
    dhakError,
    toggleDhak,
    startDhak,
    stopDhak
  };
}

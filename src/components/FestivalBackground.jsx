import React from 'react';
import ExperiencePujoAtmosphere from './ExperiencePujoAtmosphere';

// Gentle breathing lanterns along the village festive street
const HANGING_LANTERNS = [
  { id: 'l1', top: '28%', left: '52%', size: '6px', glowColor: 'rgba(255, 185, 60, 0.9)', delay: '0s' },
  { id: 'l2', top: '32%', left: '62%', size: '7px', glowColor: 'rgba(255, 205, 80, 0.95)', delay: '1.2s' },
  { id: 'l3', top: '36%', left: '71%', size: '6px', glowColor: 'rgba(255, 175, 50, 0.85)', delay: '2.1s' },
  { id: 'l4', top: '34%', left: '80%', size: '7px', glowColor: 'rgba(255, 210, 90, 0.9)', delay: '0.7s' },
  { id: 'l5', top: '38%', left: '89%', size: '6px', glowColor: 'rgba(255, 190, 70, 0.9)', delay: '1.8s' }
];

/**
 * FestivalBackground
 * Renders the authentic Devi Paksha Durga Puja living wallpaper:
 * - Bamboo pandal with illuminated Maa Durga on the left
 * - Warm golden halo glow around the sanctum & Maa Durga
 * - Slow-moving devotional incense smoke/mist (dhuno mist) near the pandal base
 * - Subtle drifting Shiuli flower petals (Sharadotsav signature)
 * - Twilight sky shimmer and festive hanging street lanterns
 */
const FestivalBackground = ({ 
  soundPlaying = false, 
  isExperienceActive = false,
  isNightMode = false
}) => {
  return (
    <div className={`festival-wallpaper-container ${isNightMode ? 'theme-night' : 'theme-day'}`} aria-hidden="true">
      {/* 1. Base illustrated artwork with carefully controlled framing */}
      <div 
        className={`festival-artwork-layer ${soundPlaying ? 'is-playing' : ''}`}
        style={{ backgroundImage: `url('/devipaksha_durga_puja_wallpaper.jpg')` }}
      />

      {/* 2. Day Atmosphere Overlay: Warmer, brighter ambient lighting with soft natural shadows */}
      <div className="day-atmosphere-overlay" />

      {/* 3. Night Atmosphere Overlays: Deep-blue festive night sky with golden light contrast */}
      <div className="night-atmosphere-overlay" />
      <div className="night-sky-deepening" />

      {/* Realistic Incense Sticks (Two Agarbatti Sticks in Brass Holder) & Visible Continuous Smoke Trails */}
      <div className="incense-smoke-origin" aria-hidden="true">
        {/* Brass Holder resting naturally on the ground */}
        <div className="incense-holder-brass" />

        {/* Incense Stick 1 (Left stick, tilted 11deg) */}
        <div className="incense-stick-assembly stick-1">
          <div className="incense-slender-rod" />
          <div className="incense-ember-tip">
            <div className="incense-ember-glow" />
          </div>
          {/* Overlapping, visible curly smoke wisps originating at tip 1 */}
          <div className="smoke-trail trail-1">
            <div className="smoke-wisp wisp-1" />
            <div className="smoke-wisp wisp-2" />
            <div className="smoke-wisp wisp-3" />
            <div className="smoke-wisp wisp-4" />
          </div>
        </div>

        {/* Incense Stick 2 (Right stick, tilted 19deg with slight gap) */}
        <div className="incense-stick-assembly stick-2">
          <div className="incense-slender-rod" />
          <div className="incense-ember-tip">
            <div className="incense-ember-glow" />
          </div>
          {/* Overlapping, visible curly smoke wisps originating at tip 2 with distinct timing */}
          <div className="smoke-trail trail-2">
            <div className="smoke-wisp wisp-1" />
            <div className="smoke-wisp wisp-2" />
            <div className="smoke-wisp wisp-3" />
            <div className="smoke-wisp wisp-4" />
          </div>
        </div>
      </div>

      {/* 4. Twilight Sky Glow Mesh Layer */}
      <div className="aurora-sky-mesh aurora-twilight-sky" />

      {/* 5. Golden Fairy Light Twinkle Overlay across street strings */}
      <div className="fairy-lights-shimmer" />

      {/* 6. Gently Glowing Festival Street Lanterns */}
      <div className="festive-lanterns-layer">
        {HANGING_LANTERNS.map((lantern) => (
          <div
            key={lantern.id}
            className="festive-lantern-dot"
            style={{
              top: lantern.top,
              left: lantern.left,
              width: lantern.size,
              height: lantern.size,
              animationDelay: lantern.delay,
              backgroundColor: lantern.glowColor,
              boxShadow: `0 0 10px ${lantern.glowColor}, 0 0 20px rgba(255, 160, 30, 0.5)`
            }}
          />
        ))}
      </div>

      {/* 7. Experience Pujo Atmosphere Layer (Warm Illumination, Floating Particles, Falling Shiuli Petals) */}
      <ExperiencePujoAtmosphere isActive={isExperienceActive} />

      {/* 9. Subtle legibility enhancement without covering the artwork */}
      <div className="cinematic-vignette" />
      <div className="headline-legibility-gradient" />
      <div className="bottom-player-gradient" />
    </div>
  );
};

export default React.memo(FestivalBackground);

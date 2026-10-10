import React from 'react';

// Restrained golden particles drifting gently through the twilight scene
// Sized delicately (2.2px to 3.2px) for subtle cinematic warmth without harsh glare
const GOLDEN_PARTICLES = [
  { id: 'gp-1', left: '14%', top: '65%', size: 2.8, duration: '9.5s', delay: '0.2s', sway: '16px' },
  { id: 'gp-2', left: '26%', top: '78%', size: 3.2, duration: '11.0s', delay: '1.4s', sway: '-20px' },
  { id: 'gp-3', left: '38%', top: '60%', size: 2.4, duration: '8.8s', delay: '0.7s', sway: '14px' },
  { id: 'gp-4', left: '50%', top: '70%', size: 3.0, duration: '12.5s', delay: '2.1s', sway: '-18px' },
  { id: 'gp-5', left: '62%', top: '55%', size: 2.5, duration: '10.2s', delay: '1.8s', sway: '22px' },
  { id: 'gp-6', left: '74%', top: '68%', size: 2.8, duration: '9.0s', delay: '0.5s', sway: '-15px' },
  { id: 'gp-7', left: '85%', top: '62%', size: 3.0, duration: '11.8s', delay: '2.8s', sway: '18px' },
  { id: 'gp-8', left: '20%', top: '50%', size: 2.2, duration: '8.5s', delay: '3.2s', sway: '-12px' },
  { id: 'gp-9', left: '44%', top: '45%', size: 2.8, duration: '10.6s', delay: '2.4s', sway: '16px' },
  { id: 'gp-10', left: '58%', top: '48%', size: 3.2, duration: '13.2s', delay: '3.9s', sway: '-20px' },
  { id: 'gp-11', left: '68%', top: '38%', size: 2.5, duration: '9.8s', delay: '1.1s', sway: '15px' },
  { id: 'gp-12', left: '80%', top: '42%', size: 2.6, duration: '11.4s', delay: '4.2s', sway: '-16px' },
  { id: 'gp-13', left: '92%', top: '54%', size: 3.0, duration: '12.0s', delay: '1.5s', sway: '20px' },
  { id: 'gp-14', left: '32%', top: '40%', size: 2.4, duration: '9.2s', delay: '4.6s', sway: '-14px' }
];

// Delicate Shiuli (Night-flowering Jasmine) flower petals falling naturally
// Distinctive pure white petal with iconic orange-coral calyx/stem (#ff5e13)
const SHIULI_FALLING_PETALS = [
  { id: 'sh-1', left: '9%', duration: '13.5s', delay: '0s', scale: 0.85, rotDir: 1, swayWidth: '45px' },
  { id: 'sh-2', left: '22%', duration: '16.0s', delay: '2.4s', scale: 1.05, rotDir: -1, swayWidth: '-55px' },
  { id: 'sh-3', left: '36%', duration: '14.2s', delay: '1.1s', scale: 0.9, rotDir: 1, swayWidth: '40px' },
  { id: 'sh-4', left: '49%', duration: '17.5s', delay: '4.5s', scale: 1.15, rotDir: -1, swayWidth: '-60px' },
  { id: 'sh-5', left: '63%', duration: '15.0s', delay: '2.8s', scale: 0.8, rotDir: 1, swayWidth: '50px' },
  { id: 'sh-6', left: '76%', duration: '18.0s', delay: '5.2s', scale: 1.0, rotDir: -1, swayWidth: '-48px' },
  { id: 'sh-7', left: '87%', duration: '14.8s', delay: '3.6s', scale: 0.95, rotDir: 1, swayWidth: '52px' },
  { id: 'sh-8', left: '95%', duration: '16.5s', delay: '1.9s', scale: 0.85, rotDir: -1, swayWidth: '-42px' },
  { id: 'sh-9', left: '30%', duration: '15.8s', delay: '7.0s', scale: 1.0, rotDir: 1, swayWidth: '46px' }
];

// Positions corresponding to hanging street lanterns for warm golden halo illumination
const LANTERN_HALOS = [
  { id: 'lh-1', top: '28%', left: '52%', size: '44px', delay: '0s' },
  { id: 'lh-2', top: '32%', left: '62%', size: '52px', delay: '1.2s' },
  { id: 'lh-3', top: '36%', left: '71%', size: '46px', delay: '2.1s' },
  { id: 'lh-4', top: '34%', left: '80%', size: '52px', delay: '0.7s' },
  { id: 'lh-5', top: '38%', left: '89%', size: '44px', delay: '1.8s' }
];

/**
 * ExperiencePujoAtmosphere
 * Living festival atmosphere activated via the "Experience Pujo" toggle:
 * 1. Subtle, warm, cinematic ambient illumination around lanterns & garland
 * 2. Restrained floating golden particles drifting through the twilight scene
 * 3. Delicate falling Shiuli (night-flowering jasmine) petals with natural tumble
 * 4. Strict lifecycle:
 *    - When disabled, returns null immediately: instantly stops and cleans up
 *      all particles, petals, animation loops, and listeners from DOM.
 *    - Repeated toggling never creates duplicate particles or animation instances.
 */
const ExperiencePujoAtmosphere = ({ isActive = false }) => {
  // If disabled, immediately stop and unmount all atmosphere elements
  if (!isActive) {
    return null;
  }

  return (
    <div 
      className="experience-pujo-atmosphere-layer"
      aria-hidden="true"
    >
      {/* 1. Warm Golden Illumination around Existing Decorative Lights */}
      <div className="decorative-lights-illumination">
        {/* Soft breathing golden halos behind hanging street lanterns */}
        {LANTERN_HALOS.map((halo) => (
          <div
            key={halo.id}
            className="lantern-warm-halo"
            style={{
              top: halo.top,
              left: halo.left,
              width: halo.size,
              height: halo.size,
              animationDelay: halo.delay
            }}
          />
        ))}

        {/* Ambient warm golden garland wash along pandal street lights */}
        <div className="garland-street-golden-wash" />
        
        {/* Sanctum festive halo accent */}
        <div className="sanctum-ambient-festive-glow" />
      </div>

      {/* 2. Restrained Floating Golden Particles */}
      <div className="golden-particles-container">
        {GOLDEN_PARTICLES.map((particle) => (
          <span
            key={particle.id}
            className="golden-particle-ember"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: particle.duration,
              animationDelay: particle.delay,
              '--sway-distance': particle.sway
            }}
          />
        ))}
      </div>

      {/* 3. Delicate Falling Shiuli Flower Petals */}
      <div className="shiuli-falling-container">
        {SHIULI_FALLING_PETALS.map((petal) => (
          <div
            key={petal.id}
            className="shiuli-petal-drop-wrapper"
            style={{
              left: petal.left,
              animationDuration: petal.duration,
              animationDelay: petal.delay,
              transform: `scale(${petal.scale})`,
              '--petal-sway': petal.swayWidth
            }}
          >
            <div 
              className="shiuli-petal-tumble"
              style={{
                animationDuration: `${parseFloat(petal.duration) * 0.42}s`
              }}
            >
              {/* White petal blade */}
              <div className="shiuli-petal-corolla" />
              {/* Iconic bright orange-coral stem/calyx */}
              <div className="shiuli-orange-calyx" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ExperiencePujoAtmosphere);

// Official Spotify Playlist Configuration
// https://open.spotify.com/playlist/1zVKSwcN1UDYBXsBWQlp16 ("Durga Puja Songs")
export const SPOTIFY_PLAYLIST_ID = '1zVKSwcN1UDYBXsBWQlp16';
export const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/1zVKSwcN1UDYBXsBWQlp16?si=0e4f04b0cfb5408b';
export const SPOTIFY_EMBED_URL = 'https://open.spotify.com/embed/playlist/1zVKSwcN1UDYBXsBWQlp16?utm_source=generator&si=0e4f04b0cfb5408b';

// Local ambient audio streams for background radio when Spotify Web Playback SDK is not active
export const LOCAL_AMBIENT_TRACKS = [
  {
    id: 'ambient-dhak',
    title: 'Festive Dhak & Kanshor Ambience',
    artist: 'Traditional Bengali Dhak Rhythms',
    audioUrl: '/audio/durga_puja_dhak_dhol.ogg',
    cover: '/devipaksha_durga_puja_wallpaper.jpg',
    durationSec: 308
  },
  {
    id: 'ambient-bansuri',
    title: 'Agomoni Morning Bansuri',
    artist: 'Classical Autumn Flute',
    audioUrl: '/audio/bansuri_classical_morning.ogg',
    cover: '/devipaksha_durga_puja_wallpaper.jpg',
    durationSec: 213
  },
  {
    id: 'ambient-raga',
    title: 'Raga Durga Classical Homage',
    artist: 'Classical Indian Ensemble',
    audioUrl: '/audio/raga_durga_classical.ogg',
    cover: '/devipaksha_durga_puja_wallpaper.jpg',
    durationSec: 194
  },
  {
    id: 'ambient-sitar',
    title: 'Sandhya Aarati Sitar',
    artist: 'Indian Classical Sitar',
    audioUrl: '/audio/sitar_raga_yaman.ogg',
    cover: '/devipaksha_durga_puja_wallpaper.jpg',
    durationSec: 112
  },
  {
    id: 'ambient-night',
    title: 'Kolkata Pandal Night Atmosphere',
    artist: 'Pujo Aurora Soundscapes',
    audioUrl: '/audio/kolkata_night_ambient.ogg',
    cover: '/devipaksha_durga_puja_wallpaper.jpg',
    durationSec: 135
  }
];

export const FESTIVAL_DATES = [
  { year: 2026, date: '2026-10-16T06:00:00+05:30', nameBn: 'দুর্গাপূজা ২০২৬ (মহা ষষ্ঠী)', nameEn: 'Durga Puja 2026 (Maha Shashthi)' },
  { year: 2027, date: '2027-10-06T06:00:00+05:30', nameBn: 'দুর্গাপূজা ২০২৭ (মহা ষষ্ঠী)', nameEn: 'Durga Puja 2027 (Maha Shashthi)' },
  { year: 2028, date: '2028-09-25T06:00:00+05:30', nameBn: 'দুর্গাপূজা ২০২৮ (মহা ষষ্ঠী)', nameEn: 'Durga Puja 2028 (Maha Shashthi)' }
];

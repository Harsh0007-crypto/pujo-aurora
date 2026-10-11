// Official Spotify Playlist Configuration
// https://open.spotify.com/playlist/1zVKSwcN1UDYBXsBWQlp16 ("Durga Puja Songs")
export const SPOTIFY_PLAYLIST_ID = '1zVKSwcN1UDYBXsBWQlp16';
export const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/1zVKSwcN1UDYBXsBWQlp16?si=0e4f04b0cfb5408b';
export const SPOTIFY_EMBED_URL = 'https://open.spotify.com/embed/playlist/1zVKSwcN1UDYBXsBWQlp16?utm_source=generator&si=0e4f04b0cfb5408b';

// Official YouTube Music Playlist Configuration
// https://music.youtube.com/playlist?list=PLJAiFJ6bGyew ("Durga Puja Songs" by Arup Mukherjee)
export const YOUTUBE_PLAYLIST_ID = 'PLJAiFJ6bGyew';
export const YOUTUBE_PLAYLIST_URL = 'https://music.youtube.com/playlist?list=PLJAiFJ6bGyew';

// Ordered video IDs directly from playlist PLJAiFJ6bGyew
// Used as fallback playlist array for YouTube IFrame Player when YouTube blocks playlist cueing
export const YOUTUBE_PLAYLIST_TRACK_IDS = [
  'SFJeglBF5cg', // Dugga Elo - Monali Thakur
  '7uzjfZ423Kc', // Dhak Baja Kashor Baja
  'w6SQsKD2U-Y', // Aamaar Dugga
  'upYGF3YAHeo', // O Menoka O Menoka
  'p_hqO0sJh-I', // Ailo Uma Barite
  'x_Nar1eYzBM', // Uma Ashe Notun Saje
  'I5uMBp5wDhI', // Abar Elo Maa
  'CWtqPoZrUoA', // Joy Joy Durga Ma
  'uLSEEBGr4Ag', // Durga Maa
  'W-YAf-bHkCw', // Gouri Elo Dekhe Jalo
  'JOQdF0wRjYY',
  'Ku7mJminJxI',
  'z-T4qiQMXaw',
  '1Yycc3tejNw',
  'nLrpLXaWbxk',
  'ZusnukjtotQ',
  'hDve9YmTZq4',
  'sto9TBxGibE',
  'mXqUIFUYqpM',
  'UpeueoYgHnE',
  'E40N8rKKTCc',
  'srJlx60zfBQ',
  'jwMo3vrsL7s',
  'nH65Xk8kPjQ',
  'Rx7l8bjzjg4',
  'CYcqPK0Dl60',
  'PEiFJAy_zsM',
  'YnU9c1aj5hY',
  'VNI_XEx7z-g',
  'avySoa5OW1w',
  'hDukD5TJmV4',
  'LLer3VPOcxg',
  'BvIcx9ev8X0',
  'j9_MLElmS9g',
  'cFsCf0MGuuA',
  '63X0l49OyjI',
  '_GUdZJQun2I',
  'QvhNGDZhJvE',
  'j7nWykTLEMs',
  'DxaNt-pmObM',
  'wLVkrgkoPro',
  '6ZCfPaz28_U',
  'YC4ERU01ZxY',
  'Z7kpAzbC66E',
  '43_oBh4YsQs',
  '_RmN29SHVS8',
  'PRTXLKCV6Nk',
  'gbGVjyHq8iA',
  'ocCQ1UVsel8',
  '707QgEnx8Hs',
  'd-NMikRHMQQ',
  'ADpMft-PUb8',
  'S-XOArX0faE',
  'AFOg5wPxduc',
  'jkCWHTt2ml4',
  'NwjbjGQXkdU',
  'G2tTYmSzR6U',
  'tMD3VtUyGz8',
  'eoLZVAk9t_U',
  'Ev1NLm7Kd4g',
  '0-rIe6yzwGE',
  '8NeUGOEpGh0'
];

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

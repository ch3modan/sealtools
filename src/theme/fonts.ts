export type FontFamilyName = 'atkinson' | 'openDyslexic' | 'lexend' | 'system';

export interface FontConfig {
  name: string;
  family: string;
  description: string;
}

export const FONT_OPTIONS: Record<FontFamilyName, FontConfig> = {
  atkinson: {
    name: 'Atkinson Hyperlegible',
    family: 'Atkinson-Hyperlegible',
    description: 'Designed for maximum legibility',
  },
  openDyslexic: {
    name: 'OpenDyslexic',
    family: 'OpenDyslexic-Regular',
    description: 'Weighted bottoms reduce letter-swapping',
  },
  lexend: {
    name: 'Lexend',
    family: 'Lexend-Regular',
    description: 'Reduces visual stress while reading',
  },
  system: {
    name: 'System Default',
    family: 'System',
    description: 'Your device default font',
  },
};

export const RSVP_FONT = 'RobotoMono-Regular';

export const TYPOGRAPHY_DEFAULTS = {
  fontSize: 18,
  letterSpacing: 0,
  lineHeight: 1.6,
  wordSpacing: 0,
  paragraphSpacing: 16,
};

export const TYPOGRAPHY_RANGES = {
  fontSize: { min: 14, max: 32, step: 1 },
  letterSpacing: { min: 0, max: 4, step: 0.5 },
  lineHeight: { min: 1.4, max: 2.5, step: 0.1 },
  wordSpacing: { min: 0, max: 8, step: 1 },
  paragraphSpacing: { min: 0, max: 32, step: 4 },
};

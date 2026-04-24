export type ColorProfileName = 'sealDark' | 'sealLight' | 'sepia' | 'ocean' | 'mint' | 'highContrast';

export interface ColorProfile {
  name: string;
  bg: string;
  text: string;
  accent: string;
  secondary: string;
  card: string;
  border: string;
}

export const COLOR_PROFILES: Record<ColorProfileName, ColorProfile> = {
  sealDark: {
    name: 'Seal Dark',
    bg: '#1A1A2E',
    text: '#E0E0E0',
    accent: '#7EC8E3',
    secondary: '#16213E',
    card: '#222244',
    border: '#2A2A4E',
  },
  sealLight: {
    name: 'Seal Light',
    bg: '#FAF3E0',
    text: '#2C3E50',
    accent: '#5B9BD5',
    secondary: '#F0E6D0',
    card: '#FFFFFF',
    border: '#E0D5C0',
  },
  sepia: {
    name: 'Sepia',
    bg: '#F5E6CA',
    text: '#5C4033',
    accent: '#D4956A',
    secondary: '#EBD9B8',
    card: '#F9EDDA',
    border: '#D4C4A8',
  },
  ocean: {
    name: 'Ocean',
    bg: '#0D1B2A',
    text: '#B8D4E3',
    accent: '#48CAE4',
    secondary: '#1B2838',
    card: '#152238',
    border: '#1E3048',
  },
  mint: {
    name: 'Pastel Mint',
    bg: '#E8F5E9',
    text: '#2E7D32',
    accent: '#66BB6A',
    secondary: '#D7ECD8',
    card: '#F1FAF1',
    border: '#C8E6C9',
  },
  highContrast: {
    name: 'High Contrast',
    bg: '#121212',
    text: '#FFFFFF',
    accent: '#BB86FC',
    secondary: '#1E1E1E',
    card: '#1E1E1E',
    border: '#333333',
  },
};

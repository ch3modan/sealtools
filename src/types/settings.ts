import { ColorProfileName } from '../theme/colors';
import { FontFamilyName } from '../theme/fonts';

export interface SettingsState {
  // Typography
  fontFamily: FontFamilyName;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  wordSpacing: number;
  paragraphSpacing: number;
  boldText: boolean;

  // Appearance
  colorProfile: ColorProfileName;
  customBg?: string;
  customText?: string;

  // Reading
  wpm: number;
  wordsPerFlash: 1 | 2 | 3;
  orpHighlight: boolean;
  bionicReading: boolean;
  smartPause: boolean;

  // Audio
  ttsEnabled: boolean;
  ttsVoice?: string;
  ttsRate: number;

  // Goals
  dailyGoal: number;
  gracePerodDays: number;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  fontFamily: 'atkinson',
  fontSize: 18,
  letterSpacing: 0,
  lineHeight: 1.6,
  wordSpacing: 0,
  paragraphSpacing: 16,
  boldText: false,
  colorProfile: 'sealDark',
  wpm: 250,
  wordsPerFlash: 1,
  orpHighlight: true,
  bionicReading: false,
  smartPause: true,
  ttsEnabled: false,
  ttsRate: 1.0,
  dailyGoal: 1000,
  gracePerodDays: 1,
  notificationsEnabled: false,
};

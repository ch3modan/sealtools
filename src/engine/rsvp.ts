import { ProcessedWord, getWordDelay } from './textProcessor';

export interface RSVPConfig {
  wpm: number;
  smartPause: boolean;
  wordsPerFlash: 1 | 2 | 3;
}

export interface RSVPState {
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

/**
 * Core RSVP engine that manages word-by-word playback timing.
 * Used by the useRSVP hook to control the reading flow.
 */
export class RSVPEngine {
  private words: ProcessedWord[] = [];
  private currentIndex = 0;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private config: RSVPConfig;
  private onWordChange: (index: number) => void;
  private onComplete: () => void;

  constructor(
    config: RSVPConfig,
    onWordChange: (index: number) => void,
    onComplete: () => void
  ) {
    this.config = config;
    this.onWordChange = onWordChange;
    this.onComplete = onComplete;
  }

  setWords(words: ProcessedWord[]) {
    this.words = words;
    this.currentIndex = 0;
  }

  setConfig(config: Partial<RSVPConfig>) {
    this.config = { ...this.config, ...config };
  }

  play() {
    if (this.currentIndex >= this.words.length) {
      this.onComplete();
      return;
    }
    this.scheduleNext();
  }

  pause() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  stop() {
    this.pause();
    this.currentIndex = 0;
    this.onWordChange(0);
  }

  seekTo(index: number) {
    this.pause();
    this.currentIndex = Math.max(0, Math.min(index, this.words.length - 1));
    this.onWordChange(this.currentIndex);
  }

  skipForward(count: number = 10) {
    this.seekTo(this.currentIndex + count);
  }

  skipBackward(count: number = 10) {
    this.seekTo(this.currentIndex - count);
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  destroy() {
    this.pause();
    this.words = [];
  }

  private scheduleNext() {
    if (this.currentIndex >= this.words.length) {
      this.onComplete();
      return;
    }

    const word = this.words[this.currentIndex];
    const delay = getWordDelay(word, this.config.wpm, this.config.smartPause);

    this.onWordChange(this.currentIndex);

    this.timerId = setTimeout(() => {
      this.currentIndex += this.config.wordsPerFlash;
      this.scheduleNext();
    }, delay);
  }
}

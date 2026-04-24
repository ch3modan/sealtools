import { useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '../stores/useReaderStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { RSVPEngine } from '../engine/rsvp';
import { processText, ProcessedWord } from '../engine/textProcessor';

export function useRSVP() {
  const engineRef = useRef<RSVPEngine | null>(null);
  const processedWordsRef = useRef<ProcessedWord[]>([]);

  const {
    currentWordIndex,
    isPlaying,
    words,
    setWordIndex,
    setPlaying,
  } = useReaderStore();

  const { wpm, smartPause, wordsPerFlash } = useSettingsStore();

  // Initialize engine
  useEffect(() => {
    const engine = new RSVPEngine(
      { wpm, smartPause, wordsPerFlash },
      (index) => setWordIndex(index),
      () => setPlaying(false)
    );
    engineRef.current = engine;

    return () => engine.destroy();
  }, []);

  // Update engine config when settings change
  useEffect(() => {
    engineRef.current?.setConfig({ wpm, smartPause, wordsPerFlash });
  }, [wpm, smartPause, wordsPerFlash]);

  // Load words into engine
  const loadText = useCallback((text: string) => {
    const processed = processText(text);
    processedWordsRef.current = processed;
    engineRef.current?.setWords(processed);

    const rawWords = processed.map((w) => w.original);
    useReaderStore.getState().setBook(
      useReaderStore.getState().currentBookId || 'demo',
      rawWords,
      rawWords.length
    );
  }, []);

  // Playback controls
  const play = useCallback(() => {
    setPlaying(true);
    engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    setPlaying(false);
    engineRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((index: number) => {
    engineRef.current?.seekTo(index);
  }, []);

  const skipForward = useCallback(() => {
    engineRef.current?.skipForward(10);
  }, []);

  const skipBackward = useCallback(() => {
    engineRef.current?.skipBackward(10);
  }, []);

  const stop = useCallback(() => {
    setPlaying(false);
    engineRef.current?.stop();
  }, []);

  // Control playback based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      engineRef.current?.seekTo(currentWordIndex);
      engineRef.current?.play();
    } else {
      engineRef.current?.pause();
    }
  }, [isPlaying]);

  return {
    loadText,
    play,
    pause,
    toggle,
    stop,
    seekTo,
    skipForward,
    skipBackward,
    currentWord: processedWordsRef.current[currentWordIndex] || null,
    currentWordIndex,
    totalWords: processedWordsRef.current.length,
    isPlaying,
    processedWords: processedWordsRef.current,
  };
}

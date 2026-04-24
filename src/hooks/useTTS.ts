import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useSettingsStore } from '../stores/useSettingsStore';

/**
 * Text-to-Speech hook using Web Speech API (web) or expo-speech (native).
 * Provides bimodal reading support — words are spoken as they are displayed.
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { wpm } = useSettingsStore();

  // Map WPM to a speech rate (0.1–2.0 range)
  // 250 WPM ≈ 1.0 rate, 100 WPM ≈ 0.5, 500 WPM ≈ 1.8
  const getSpeechRate = useCallback((): number => {
    return Math.max(0.3, Math.min(2.0, wpm / 250));
  }, [wpm]);

  const speak = useCallback(async (text: string) => {
    if (Platform.OS === 'web') {
      // Use Web Speech API
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = getSpeechRate();
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v =>
          v.lang.startsWith('en') && v.localService
        ) || voices.find(v => v.lang.startsWith('en'));

        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Native: use expo-speech
      try {
        const Speech = await import('expo-speech');
        setIsSpeaking(true);
        await Speech.speak(text, {
          rate: getSpeechRate(),
          pitch: 1.0,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      } catch {
        // expo-speech not available
        console.warn('TTS not available on this platform');
      }
    }
  }, [getSpeechRate]);

  const speakWord = useCallback(async (word: string) => {
    // For individual words, use a slightly different approach
    // to avoid choppy speech
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      // Don't interrupt ongoing speech for single words
      // Just queue it
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = getSpeechRate();
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v =>
        v.lang.startsWith('en') && v.localService
      );
      if (englishVoice) utterance.voice = englishVoice;

      window.speechSynthesis.speak(utterance);
    }
  }, [getSpeechRate]);

  const stop = useCallback(() => {
    if (Platform.OS === 'web') {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      import('expo-speech')
        .then(Speech => Speech.stop())
        .catch(() => {});
    }
    setIsSpeaking(false);
  }, []);

  const speakSentence = useCallback(async (words: string[], startIndex: number, count: number = 10) => {
    // Speak a chunk of words as a sentence for smoother TTS
    const sentence = words.slice(startIndex, startIndex + count).join(' ');
    await speak(sentence);
  }, [speak]);

  return {
    speak,
    speakWord,
    speakSentence,
    stop,
    isSpeaking,
  };
}

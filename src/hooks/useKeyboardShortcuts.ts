import { useEffect } from 'react';
import { Platform } from 'react-native';

interface KeyboardShortcuts {
  onToggle: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onStop: () => void;
  onSpeedUp?: () => void;
  onSpeedDown?: () => void;
}

/**
 * Keyboard shortcuts for the RSVP reader.
 * Space = play/pause, Arrow keys = skip, Escape = stop
 */
export function useKeyboardShortcuts({
  onToggle,
  onSkipForward,
  onSkipBackward,
  onStop,
  onSpeedUp,
  onSpeedDown,
}: KeyboardShortcuts) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onToggle();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onSkipForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onSkipBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onSpeedUp?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onSpeedDown?.();
          break;
        case 'Escape':
          e.preventDefault();
          onStop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle, onSkipForward, onSkipBackward, onStop, onSpeedUp, onSpeedDown]);
}

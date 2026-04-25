import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useReaderStore } from '../../src/stores/useReaderStore';
import { useLibraryStore } from '../../src/stores/useLibraryStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { COLOR_PROFILES } from '../../src/theme/colors';
import { RSVPDisplay } from '../../src/components/reader/RSVPDisplay';
import { RSVPControls } from '../../src/components/reader/RSVPControls';
import { BookOverview } from '../../src/components/reader/BookOverview';
import { BookmarkPanel } from '../../src/components/reader/BookmarkPanel';
import { useRSVP } from '../../src/hooks/useRSVP';
import { useTTS } from '../../src/hooks/useTTS';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';

type OverlayMode = 'none' | 'overview' | 'bookmarks';

export default function ReaderScreen() {
  const { colorProfile, bionicReading, orpHighlight, ttsEnabled } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const { books } = useLibraryStore();
  const { currentBookId, progress, currentChapter } = useReaderStore();
  const { logReading } = useStreakStore();
  const [overlay, setOverlay] = useState<OverlayMode>('none');
  const prevWordIndexRef = useRef(0);

  const {
    loadText,
    toggle,
    stop,
    seekTo,
    skipForward,
    skipBackward,
    currentWord,
    currentWordIndex,
    totalWords,
    isPlaying,
  } = useRSVP();

  const { speakWord, stop: stopTTS, isSpeaking } = useTTS();

  const wpm = useSettingsStore((s) => s.wpm);

  // Keyboard shortcuts (web only)
  useKeyboardShortcuts({
    onToggle: toggle,
    onSkipForward: skipForward,
    onSkipBackward: skipBackward,
    onStop: stop,
    onSpeedUp: () => useSettingsStore.getState().updateSetting('wpm', Math.min(800, wpm + 25)),
    onSpeedDown: () => useSettingsStore.getState().updateSetting('wpm', Math.max(100, wpm - 25)),
  });

  // Load book text when currentBookId changes
  useEffect(() => {
    if (!currentBookId) return;
    const book = books.find(b => b.id === currentBookId);
    if (!book || book.chapters.length === 0) return;
    const fullText = book.chapters.map(c => c.text).join('\n\n');
    loadText(fullText);
  }, [currentBookId]);

  // Track words read for streak
  useEffect(() => {
    if (isPlaying && currentWordIndex > 0 && currentWordIndex % 10 === 0) {
      logReading(10);
    }
  }, [currentWordIndex, isPlaying]);

  // TTS: speak chunk by chunk (sentence by sentence) to prevent TTS queue lag
  useEffect(() => {
    if (ttsEnabled && isPlaying && currentWord && currentWordIndex !== prevWordIndexRef.current) {
      const wordsArray = useReaderStore.getState().words;
      // Start a new sentence if we are at index 0 or the previous word ended a sentence
      const prevWord = currentWordIndex > 0 ? wordsArray[currentWordIndex - 1] : null;
      const isStartOfSentence = currentWordIndex === 0 || (prevWord && /[.!?]$/.test(prevWord));
      
      if (isStartOfSentence) {
        // Find the length of the current sentence
        let count = 1;
        while (
          currentWordIndex + count < wordsArray.length &&
          !/[.!?]$/.test(wordsArray[currentWordIndex + count - 1])
        ) {
          count++;
        }
        
        // Speak the sentence chunk
        speakSentence(wordsArray, currentWordIndex, count);
      }
    }
    prevWordIndexRef.current = currentWordIndex;
  }, [currentWordIndex, isPlaying, ttsEnabled]);

  // Stop TTS when playback stops
  useEffect(() => {
    if (!isPlaying) {
      stopTTS();
    }
  }, [isPlaying]);

  const currentBook = books.find(b => b.id === currentBookId) || books[0];

  const handleWordSelect = (wordIndex: number) => {
    stopTTS();
    seekTo(wordIndex);
    setOverlay('none');
  };

  const handleBookmarkSeek = (wordIndex: number) => {
    stopTTS();
    seekTo(wordIndex);
    setOverlay('none');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }} numberOfLines={1}>
              {currentBook?.title || 'RSVP Reader'}
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
              {bionicReading && (
                <View style={{
                  backgroundColor: colors.accent + '22',
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '600' }}>BIONIC</Text>
                </View>
              )}
              {orpHighlight && (
                <View style={{
                  backgroundColor: colors.accent + '22',
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '600' }}>ORP</Text>
                </View>
              )}
              {ttsEnabled && (
                <View style={{
                  backgroundColor: '#48CAE422',
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 8,
                }}>
                  <Text style={{ color: '#48CAE4', fontSize: 11, fontWeight: '600' }}>🔊 TTS</Text>
                </View>
              )}
            </View>
          </View>

          {/* Action buttons */}
          {totalWords > 0 && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => setOverlay('overview')}
                style={{
                  backgroundColor: colors.card,
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16 }}>📑</Text>
              </Pressable>
              <Pressable
                onPress={() => setOverlay('bookmarks')}
                style={{
                  backgroundColor: colors.card,
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16 }}>🔖</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* RSVP Display Area */}
        <View style={{
          flex: 1,
          backgroundColor: colors.card,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          {totalWords === 0 ? (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 48 }}>🦭</Text>
              <Text style={{ color: colors.text, fontSize: 16, opacity: 0.5, textAlign: 'center' }}>
                Load a book from the Library tab{'\n'}to start reading!
              </Text>
            </View>
          ) : (
            <RSVPDisplay word={currentWord} />
          )}
        </View>

        {/* Controls */}
        {totalWords > 0 && (
          <RSVPControls
            isPlaying={isPlaying}
            onToggle={toggle}
            onSkipBack={skipBackward}
            onSkipForward={skipForward}
            onStop={stop}
            wpm={wpm}
            onWpmChange={(newWpm) => useSettingsStore.getState().updateSetting('wpm', newWpm)}
            progress={progress}
            currentWord={currentWordIndex}
            totalWords={totalWords}
          />
        )}
      </View>

      {/* Overlay modals */}
      <Modal
        visible={overlay !== 'none'}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setOverlay('none')}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
          {overlay === 'overview' && currentBook && (
            <BookOverview
              book={currentBook}
              onSelectWordIndex={handleWordSelect}
              onClose={() => setOverlay('none')}
            />
          )}
          {overlay === 'bookmarks' && (
            <BookmarkPanel
              onSeekTo={handleBookmarkSeek}
              onClose={() => setOverlay('none')}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

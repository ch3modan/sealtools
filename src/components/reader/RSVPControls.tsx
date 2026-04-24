import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { COLOR_PROFILES } from '../../theme/colors';

interface RSVPControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onStop: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  progress: number;
  currentWord: number;
  totalWords: number;
}

export function RSVPControls({
  isPlaying,
  onToggle,
  onSkipBack,
  onSkipForward,
  onStop,
  wpm,
  onWpmChange,
  progress,
  currentWord,
  totalWords,
}: RSVPControlsProps) {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];

  const buttonStyle = {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const accentButton = {
    ...buttonStyle,
    backgroundColor: colors.accent,
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Progress bar */}
      <View style={{
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <View style={{
          height: '100%',
          width: `${Math.min(progress * 100, 100)}%`,
          backgroundColor: colors.accent,
          borderRadius: 3,
        }} />
      </View>

      {/* Word count */}
      <Text style={{ color: colors.text, textAlign: 'center', fontSize: 13, opacity: 0.6 }}>
        {currentWord} / {totalWords} words · {Math.round(progress * 100)}%
      </Text>

      {/* Playback controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}>
        <Pressable onPress={onStop} style={buttonStyle}>
          <Text style={{ color: colors.text, fontSize: 18 }}>⏹</Text>
        </Pressable>

        <Pressable onPress={onSkipBack} style={buttonStyle}>
          <Text style={{ color: colors.text, fontSize: 18 }}>⏮</Text>
        </Pressable>

        <Pressable onPress={onToggle} style={accentButton}>
          <Text style={{ color: colors.bg, fontSize: 22, fontWeight: '700' }}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </Pressable>

        <Pressable onPress={onSkipForward} style={buttonStyle}>
          <Text style={{ color: colors.text, fontSize: 18 }}>⏭</Text>
        </Pressable>
      </View>

      {/* WPM controls */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
      }}>
        <Pressable
          onPress={() => onWpmChange(Math.max(50, wpm - 25))}
          style={buttonStyle}
        >
          <Text style={{ color: colors.text, fontSize: 14 }}>−25</Text>
        </Pressable>

        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 16,
          backgroundColor: colors.secondary,
        }}>
          <Text style={{ color: colors.accent, fontSize: 18, fontWeight: '700' }}>
            {wpm} WPM
          </Text>
        </View>

        <Pressable
          onPress={() => onWpmChange(Math.min(800, wpm + 25))}
          style={buttonStyle}
        >
          <Text style={{ color: colors.text, fontSize: 14 }}>+25</Text>
        </Pressable>
      </View>
    </View>
  );
}

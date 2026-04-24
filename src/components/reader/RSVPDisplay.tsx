import React from 'react';
import { View, Text } from 'react-native';
import { ProcessedWord } from '../../engine/textProcessor';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { COLOR_PROFILES } from '../../theme/colors';

interface RSVPDisplayProps {
  word: ProcessedWord | null;
  fontSize?: number;
}

/**
 * The core RSVP word display with ORP (Optimal Recognition Point) highlighting.
 * Shows a single word with the ORP character highlighted in accent color,
 * positioned at the center of the display.
 */
export function RSVPDisplay({ word, fontSize }: RSVPDisplayProps) {
  const { colorProfile, orpHighlight, bionicReading, fontSize: settingsFontSize } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const size = fontSize || settingsFontSize * 2;

  if (!word) {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 160,
      }}>
        <Text style={{ color: colors.text, fontSize: size * 0.6, opacity: 0.4, fontFamily: 'RobotoMono-Regular' }}>
          ▶ Press play
        </Text>
      </View>
    );
  }

  const text = word.original;
  const orpIdx = word.orpIndex;

  if (bionicReading) {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        minHeight: 160,
      }}>
        <Text style={{ fontSize: size, fontFamily: 'RobotoMono-Regular' }}>
          <Text style={{ color: colors.text, fontWeight: '800' }}>{word.boldPart}</Text>
          <Text style={{ color: colors.text, opacity: 0.6 }}>{word.normalPart}</Text>
        </Text>
      </View>
    );
  }

  // ORP highlighting mode
  const before = text.slice(0, orpIdx);
  const orpChar = text[orpIdx] || '';
  const after = text.slice(orpIdx + 1);

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      minHeight: 160,
    }}>
      {/* ORP position marker */}
      {orpHighlight && (
        <View style={{
          width: 2,
          height: 12,
          backgroundColor: colors.accent,
          marginBottom: 8,
          borderRadius: 1,
        }} />
      )}
      <Text style={{ fontSize: size, fontFamily: 'RobotoMono-Regular' }}>
        <Text style={{ color: colors.text }}>{before}</Text>
        <Text style={{
          color: orpHighlight ? colors.accent : colors.text,
          fontWeight: orpHighlight ? '800' : 'normal',
        }}>
          {orpChar}
        </Text>
        <Text style={{ color: colors.text }}>{after}</Text>
      </Text>
      {/* Bottom guide line */}
      {orpHighlight && (
        <View style={{
          width: 2,
          height: 12,
          backgroundColor: colors.accent,
          marginTop: 8,
          borderRadius: 1,
        }} />
      )}
    </View>
  );
}

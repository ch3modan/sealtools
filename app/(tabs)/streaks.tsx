import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { COLOR_PROFILES } from '../../src/theme/colors';

export default function StreaksScreen() {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const {
    currentStreak,
    longestStreak,
    totalWordsRead,
    todayWordsRead,
    dailyGoal,
    readingHistory,
  } = useStreakStore();

  const goalProgress = Math.min(todayWordsRead / dailyGoal, 1);

  // Generate last 28 days for the heatmap
  const today = new Date();
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (27 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
          Streaks 🔥
        </Text>

        {/* Streak hero */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ fontSize: 64 }}>
            {currentStreak >= 100 ? '🏆' : currentStreak >= 30 ? '🌟' : currentStreak >= 7 ? '🔥' : '🦭'}
          </Text>
          <Text style={{ color: colors.accent, fontSize: 48, fontWeight: '800', marginTop: 8 }}>
            {currentStreak}
          </Text>
          <Text style={{ color: colors.text, fontSize: 16, opacity: 0.6 }}>
            day streak
          </Text>
        </View>

        {/* Stats grid */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>Best Streak</Text>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
              {longestStreak}
            </Text>
            <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4 }}>days</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>Total Words</Text>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
              {totalWordsRead.toLocaleString()}
            </Text>
            <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4 }}>read</Text>
          </View>
        </View>

        {/* Today's goal */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Today's Goal</Text>
          <View style={{
            height: 12,
            backgroundColor: colors.border,
            borderRadius: 6,
            overflow: 'hidden',
            marginTop: 12,
          }}>
            <View style={{
              height: '100%',
              width: `${goalProgress * 100}%`,
              backgroundColor: goalProgress >= 1 ? '#66BB6A' : colors.accent,
              borderRadius: 6,
            }} />
          </View>
          <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5, marginTop: 6 }}>
            {todayWordsRead.toLocaleString()} / {dailyGoal.toLocaleString()} words
            {goalProgress >= 1 ? ' ✅' : ''}
          </Text>
        </View>

        {/* Reading heatmap */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 16 }}>
            Last 28 Days
          </Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
          }}>
            {days.map((day) => {
              const isActive = readingHistory.includes(day);
              const isToday = day === today.toISOString().split('T')[0];
              return (
                <View
                  key={day}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: isActive ? colors.accent : colors.border,
                    opacity: isActive ? 1 : 0.3,
                    borderWidth: isToday ? 2 : 0,
                    borderColor: isToday ? colors.text : 'transparent',
                  }}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

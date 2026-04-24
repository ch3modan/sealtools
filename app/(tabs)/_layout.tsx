import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { COLOR_PROFILES } from '../../src/theme/colors';

function TabIcon({ emoji, focused, color }: { emoji: string; focused: boolean; color: string }) {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: focused ? color + '22' : 'transparent',
    }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function TabLayout() {
  const colorProfile = useSettingsStore((s) => s.colorProfile);
  const colors = COLOR_PROFILES[colorProfile];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text + '88',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📚" focused={focused} color={colors.accent} />,
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: 'Reader',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📖" focused={focused} color={colors.accent} />,
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: 'Streaks',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔥" focused={focused} color={colors.accent} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} color={colors.accent} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🦭" focused={focused} color={colors.accent} />,
        }}
      />
    </Tabs>
  );
}

import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { COLOR_PROFILES, ColorProfileName } from '../../src/theme/colors';
import { FONT_OPTIONS, FontFamilyName, TYPOGRAPHY_RANGES } from '../../src/theme/fonts';

function SettingSection({ title, children, colors }: { title: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ gap: 12 }}>
      <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 16,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.border,
      }}>
        {children}
      </View>
    </View>
  );
}

function SettingRow({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: colors.text, fontSize: 15 }}>{label}</Text>
      {children}
    </View>
  );
}

function ValueStepper({ value, onDecrease, onIncrease, label, colors }: {
  value: number; onDecrease: () => void; onIncrease: () => void; label: string; colors: any;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable onPress={onDecrease} style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>−</Text>
      </Pressable>
      <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600', minWidth: 50, textAlign: 'center' }}>
        {label}
      </Text>
      <Pressable onPress={onIncrease} style={{
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>+</Text>
      </Pressable>
    </View>
  );
}

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const { updateSetting, colorProfile } = settings;
  const colors = COLOR_PROFILES[colorProfile];

  const profileKeys = Object.keys(COLOR_PROFILES) as ColorProfileName[];
  const fontKeys = Object.keys(FONT_OPTIONS) as FontFamilyName[];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 40 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
          Settings ⚙️
        </Text>

        {/* Color Profiles */}
        <SettingSection title="🎨 Appearance" colors={colors}>
          <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>Color Profile</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {profileKeys.map((key) => {
              const profile = COLOR_PROFILES[key];
              const isSelected = colorProfile === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => updateSetting('colorProfile', key)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: profile.bg,
                    borderWidth: 2,
                    borderColor: isSelected ? profile.accent : profile.border,
                  }}
                >
                  <Text style={{ color: profile.text, fontSize: 13, fontWeight: isSelected ? '700' : '400' }}>
                    {profile.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingSection>

        {/* Typography */}
        <SettingSection title="🔤 Typography" colors={colors}>
          <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>Font Family</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {fontKeys.map((key) => {
              const font = FONT_OPTIONS[key];
              const isSelected = settings.fontFamily === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => updateSetting('fontFamily', key)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: isSelected ? colors.accent + '22' : colors.secondary,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.accent : colors.border,
                  }}
                >
                  <Text style={{ color: isSelected ? colors.accent : colors.text, fontSize: 13, fontWeight: isSelected ? '700' : '400' }}>
                    {font.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SettingRow label="Font Size" colors={colors}>
            <ValueStepper
              value={settings.fontSize}
              onDecrease={() => updateSetting('fontSize', Math.max(TYPOGRAPHY_RANGES.fontSize.min, settings.fontSize - 1))}
              onIncrease={() => updateSetting('fontSize', Math.min(TYPOGRAPHY_RANGES.fontSize.max, settings.fontSize + 1))}
              label={`${settings.fontSize}px`}
              colors={colors}
            />
          </SettingRow>

          <SettingRow label="Letter Spacing" colors={colors}>
            <ValueStepper
              value={settings.letterSpacing}
              onDecrease={() => updateSetting('letterSpacing', Math.max(0, settings.letterSpacing - 0.5))}
              onIncrease={() => updateSetting('letterSpacing', Math.min(4, settings.letterSpacing + 0.5))}
              label={`${settings.letterSpacing}px`}
              colors={colors}
            />
          </SettingRow>

          <SettingRow label="Line Height" colors={colors}>
            <ValueStepper
              value={settings.lineHeight}
              onDecrease={() => updateSetting('lineHeight', Math.max(1.4, +(settings.lineHeight - 0.1).toFixed(1)))}
              onIncrease={() => updateSetting('lineHeight', Math.min(2.5, +(settings.lineHeight + 0.1).toFixed(1)))}
              label={`${settings.lineHeight.toFixed(1)}`}
              colors={colors}
            />
          </SettingRow>

          <SettingRow label="Bold Text" colors={colors}>
            <Switch
              value={settings.boldText}
              onValueChange={(v) => updateSetting('boldText', v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </SettingRow>
        </SettingSection>

        {/* Reading */}
        <SettingSection title="📖 Reading" colors={colors}>
          <SettingRow label="RSVP Speed" colors={colors}>
            <ValueStepper
              value={settings.wpm}
              onDecrease={() => updateSetting('wpm', Math.max(50, settings.wpm - 25))}
              onIncrease={() => updateSetting('wpm', Math.min(800, settings.wpm + 25))}
              label={`${settings.wpm}`}
              colors={colors}
            />
          </SettingRow>

          <SettingRow label="Words per Flash" colors={colors}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([1, 2, 3] as const).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => updateSetting('wordsPerFlash', n)}
                  style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: settings.wordsPerFlash === n ? colors.accent : colors.secondary,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: settings.wordsPerFlash === n ? colors.accent : colors.border,
                  }}
                >
                  <Text style={{
                    color: settings.wordsPerFlash === n ? colors.bg : colors.text,
                    fontWeight: '700',
                  }}>
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SettingRow>

          <SettingRow label="ORP Highlighting" colors={colors}>
            <Switch
              value={settings.orpHighlight}
              onValueChange={(v) => updateSetting('orpHighlight', v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </SettingRow>

          <SettingRow label="Bionic Reading" colors={colors}>
            <Switch
              value={settings.bionicReading}
              onValueChange={(v) => updateSetting('bionicReading', v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </SettingRow>

          <SettingRow label="Smart Pause" colors={colors}>
            <Switch
              value={settings.smartPause}
              onValueChange={(v) => updateSetting('smartPause', v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </SettingRow>
        </SettingSection>

        {/* Audio */}
        <SettingSection title="🔊 Audio" colors={colors}>
          <SettingRow label="Text-to-Speech" colors={colors}>
            <Switch
              value={settings.ttsEnabled}
              onValueChange={(v) => updateSetting('ttsEnabled', v)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </SettingRow>
        </SettingSection>

        {/* Goals */}
        <SettingSection title="🔥 Goals" colors={colors}>
          <SettingRow label="Daily Word Goal" colors={colors}>
            <ValueStepper
              value={settings.dailyGoal}
              onDecrease={() => updateSetting('dailyGoal', Math.max(100, settings.dailyGoal - 100))}
              onIncrease={() => updateSetting('dailyGoal', Math.min(10000, settings.dailyGoal + 100))}
              label={`${settings.dailyGoal}`}
              colors={colors}
            />
          </SettingRow>
        </SettingSection>

        {/* About */}
        <View style={{ alignItems: 'center', paddingTop: 20, gap: 4 }}>
          <Text style={{ color: colors.text, fontSize: 13, opacity: 0.3 }}>
            SealTools v1.0.0
          </Text>
          <Text style={{ color: colors.text, fontSize: 12, opacity: 0.2 }}>
            Made with 🦭 for neurodivergent readers
          </Text>
          <Text style={{ color: colors.text, fontSize: 12, opacity: 0.2 }}>
            autisticseal.tech
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { COLOR_PROFILES } from '../../src/theme/colors';
import { SealLogo } from '../../src/components/seal/SealLogo';

const APP_VERSION = '0.1.0';

export default function AboutScreen() {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const sections = [
    {
      title: '🦭 What is SealTools?',
      body: `SealTools is a free, open-source RSVP (Rapid Serial Visual Presentation) reading application designed specifically for neurodivergent individuals.

It was born from a simple idea: what if instead of doomscrolling, you could channel that same screen time into reading books — at your own pace, in your own way?

RSVP reading presents one word at a time at a controlled speed, reducing the cognitive load of tracking lines and managing eye movement. Combined with accessibility features like Bionic Reading, ORP highlighting, and dyslexia-friendly fonts, SealTools makes reading more accessible and enjoyable.`,
    },
    {
      title: '✨ Features',
      body: `• RSVP Reader with adjustable speed (100–800 WPM)
• Bionic Reading — bold word beginnings for faster recognition
• ORP (Optimal Recognition Point) highlighting
• 6 color profiles designed to reduce visual stress
• Dyslexia-friendly fonts (OpenDyslexic, Atkinson Hyperlegible, Lexend)
• PDF & EPUB import — read your own books
• Text-to-Speech (bimodal reading)
• Reading streak tracker with daily goals
• Bookmarks with notes
• Keyboard shortcuts for distraction-free reading
• No ads, no tracking, no data selling`,
    },
    {
      title: '♿ Accessibility',
      body: `SealTools is built with accessibility as a core principle, not an afterthought:

• All color profiles avoid pure black backgrounds to prevent halation (a common issue for people with astigmatism)
• Font choices include OpenDyslexic and Atkinson Hyperlegible
• Adjustable letter spacing, line height, and font size
• High-contrast mode available
• Keyboard-navigable on desktop
• Smart pauses on punctuation for natural reading rhythm`,
    },
    {
      title: '🔒 Privacy',
      body: `Your books are YOUR books. SealTools does not:
• Read, analyze, or share your uploaded books
• Track your reading habits for advertising
• Sell any data to third parties

All uploaded books are stored in your personal Azure Blob Storage space and are only accessible with your account credentials. Reading progress syncs to Azure Cosmos DB for convenience but can be used fully offline.`,
    },
    {
      title: '🐾 Why Seals?',
      body: `Because the creator is autistic and really likes seals! 🦭

Harbor seals are calm, curious, and perfectly content just existing. They don't rush. They don't doomscroll. They just float, bask, and occasionally wiggle their flippers. We should all be a bit more like seals.`,
    },
    {
      title: '💻 Open Source',
      body: `SealTools is free and open source. The entire codebase is available for anyone to inspect, contribute to, or fork.

Built with: Expo SDK 54, React Native Web, Azure Functions, Cosmos DB, and a lot of seal energy.`,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
          <SealLogo size={80} color={colors.accent} accentColor={colors.text} />
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800' }}>
            SealTools
          </Text>
          <View style={{
            backgroundColor: colors.accent + '22',
            paddingHorizontal: 14,
            paddingVertical: 5,
            borderRadius: 10,
          }}>
            <Text style={{ color: colors.accent, fontSize: 13, fontWeight: '600' }}>
              v{APP_VERSION} · Open Source
            </Text>
          </View>
          <Text style={{ color: colors.text, fontSize: 14, opacity: 0.5, textAlign: 'center' }}>
            An accessible RSVP reader{'\n'}for neurodivergent folks
          </Text>
        </View>

        {/* Content sections */}
        {sections.map((section, index) => (
          <View
            key={index}
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 20,
              gap: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
              {section.title}
            </Text>
            <Text style={{
              color: colors.text,
              fontSize: 14,
              opacity: 0.7,
              lineHeight: 22,
            }}>
              {section.body}
            </Text>
          </View>
        ))}

        {/* Links */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          gap: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
            🔗 Links
          </Text>
          {[
            { label: '🐙 GitHub Repository', url: 'https://github.com/yourusername/sealtools' },
            { label: '🌐 Website', url: 'https://autisticseal.tech' },
            { label: '🐛 Report a Bug', url: 'https://github.com/yourusername/sealtools/issues' },
          ].map((link, i) => (
            <Pressable
              key={i}
              onPress={() => openLink(link.url)}
              style={{
                backgroundColor: colors.secondary,
                padding: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: '600' }}>
                {link.label}
              </Text>
              <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4 }}>
                {link.url}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 16 }}>
          <Text style={{ fontSize: 32 }}>🦭</Text>
          <Text style={{ color: colors.text, fontSize: 12, opacity: 0.3, textAlign: 'center' }}>
            Made with 💙 for the neurodivergent community{'\n'}
            autisticseal.tech · {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

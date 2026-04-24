import React, { useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { COLOR_PROFILES } from '../../theme/colors';
import { Book } from '../../types/book';

interface BookOverviewProps {
  book: Book;
  onSelectWordIndex: (wordIndex: number) => void;
  onClose: () => void;
}

interface ParagraphItem {
  key: string;
  text: string;
  startWordIndex: number;
  isTitle?: boolean;
}

export function BookOverview({
  book,
  onSelectWordIndex,
  onClose,
}: BookOverviewProps) {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];

  // Pre-compute paragraphs and their global word indices
  const paragraphs = useMemo(() => {
    const items: ParagraphItem[] = [];

    book.chapters.forEach((chapter, cIndex) => {
      // Insert Chapter Title
      items.push({
        key: `chap-${cIndex}-title`,
        text: chapter.title,
        startWordIndex: chapter.startWordIndex,
        isTitle: true,
      });

      // We split by \n\n or \n depending on how fileExtractor parses it.
      // The fileExtractor uses \n\n for EPUB chapters and PDF pages.
      const lines = chapter.text.split(/\n+/);
      let currentWordIndex = chapter.startWordIndex;

      lines.forEach((line, pIndex) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const words = trimmed.split(/\s+/).filter(Boolean);
        
        items.push({
          key: `chap-${cIndex}-p-${pIndex}`,
          text: trimmed,
          startWordIndex: currentWordIndex,
        });

        currentWordIndex += words.length;
      });
    });

    return items;
  }, [book]);

  const renderItem = ({ item }: { item: ParagraphItem }) => {
    if (item.isTitle) {
      return (
        <View style={{ marginTop: 32, marginBottom: 16 }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 24, 
            fontWeight: '700',
            fontFamily: 'SpaceMono' 
          }}>
            {item.text}
          </Text>
        </View>
      );
    }

    return (
      <Pressable
        onPress={() => {
          onSelectWordIndex(item.startWordIndex);
          onClose();
        }}
        style={({ pressed }) => ({
          marginBottom: 16,
          backgroundColor: pressed ? colors.accent + '22' : 'transparent',
          borderRadius: 8,
          padding: 4,
          marginHorizontal: -4,
        })}
      >
        <Text style={{
          color: colors.text,
          fontSize: 16,
          lineHeight: 28,
          opacity: 0.85,
        }}>
          {item.text}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.bg,
    }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.bg,
        zIndex: 10,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>
            {book.author} · Tap any paragraph to read from there
          </Text>
        </View>
        <Pressable
          onPress={onClose}
          style={{
            backgroundColor: colors.card,
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 18 }}>✕</Text>
        </Pressable>
      </View>

      {/* PDF-like Document Area */}
      <View style={{ flex: 1, alignItems: 'center', backgroundColor: colors.secondary }}>
        <View style={{
          width: '100%',
          maxWidth: 800,
          flex: 1,
          backgroundColor: colors.bg,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <FlatList
            data={paragraphs}
            keyExtractor={(item) => item.key}
            renderItem={renderItem}
            contentContainerStyle={{
              padding: 32,
              paddingBottom: 100,
            }}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    </View>
  );
}

import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { COLOR_PROFILES } from '../../theme/colors';
import { Book, Chapter } from '../../types/book';

interface BookOverviewProps {
  book: Book;
  currentChapterIndex: number;
  onSelectChapter: (chapter: Chapter) => void;
  onClose: () => void;
}

export function BookOverview({
  book,
  currentChapterIndex,
  onSelectChapter,
  onClose,
}: BookOverviewProps) {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];

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
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }} numberOfLines={1}>
            {book.title}
          </Text>
          <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>
            {book.author} · {book.totalWords.toLocaleString()} words
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

      {/* Chapter grid */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        {book.chapters.map((chapter, index) => {
          const isCurrent = index === currentChapterIndex;
          const wordCount = chapter.endWordIndex - chapter.startWordIndex + 1;
          const previewText = chapter.text.slice(0, 120).replace(/\s+/g, ' ').trim();

          return (
            <Pressable
              key={chapter.index}
              onPress={() => onSelectChapter(chapter)}
              style={{
                backgroundColor: isCurrent ? colors.accent + '18' : colors.card,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: isCurrent ? colors.accent + '44' : colors.border,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{
                    backgroundColor: isCurrent ? colors.accent : colors.secondary,
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      color: isCurrent ? colors.bg : colors.text,
                      fontSize: 13,
                      fontWeight: '700',
                    }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={{
                    color: colors.text,
                    fontSize: 15,
                    fontWeight: isCurrent ? '700' : '600',
                  }} numberOfLines={1}>
                    {chapter.title}
                  </Text>
                </View>
                <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4 }}>
                  {wordCount.toLocaleString()} w
                </Text>
              </View>

              <Text
                style={{
                  color: colors.text,
                  fontSize: 13,
                  opacity: 0.5,
                  lineHeight: 18,
                }}
                numberOfLines={2}
              >
                {previewText}…
              </Text>

              {isCurrent && (
                <View style={{
                  backgroundColor: colors.accent + '22',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}>
                  <Text style={{ color: colors.accent, fontSize: 11, fontWeight: '600' }}>
                    📖 Currently reading
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

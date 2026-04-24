import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { useReaderStore } from '../../stores/useReaderStore';
import { COLOR_PROFILES } from '../../theme/colors';
import { Bookmark } from '../../types/book';

interface BookmarkPanelProps {
  onSeekTo: (wordIndex: number) => void;
  onClose: () => void;
}

export function BookmarkPanel({ onSeekTo, onClose }: BookmarkPanelProps) {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const { bookmarks, currentWordIndex, words, addBookmark, removeBookmark } = useReaderStore();
  const [noteText, setNoteText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBookmark = () => {
    const contextWords = words.slice(
      Math.max(0, currentWordIndex - 3),
      currentWordIndex + 4
    ).join(' ');

    const bookmark: Bookmark = {
      id: `bm-${Date.now()}`,
      wordIndex: currentWordIndex,
      note: noteText.trim() || `Word ${currentWordIndex + 1}`,
      createdAt: new Date().toISOString(),
    };

    addBookmark(bookmark);
    setNoteText('');
    setShowAddForm(false);
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
      }}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
          🔖 Bookmarks
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: colors.bg, fontSize: 13, fontWeight: '600' }}>
              + Add
            </Text>
          </Pressable>
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
      </View>

      {/* Add bookmark form */}
      {showAddForm && (
        <View style={{
          backgroundColor: colors.card,
          margin: 16,
          borderRadius: 16,
          padding: 16,
          gap: 12,
          borderWidth: 1,
          borderColor: colors.accent + '44',
        }}>
          <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>
            Bookmark at word {currentWordIndex + 1}
          </Text>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.text + '44'}
            style={{
              backgroundColor: colors.secondary,
              color: colors.text,
              padding: 12,
              borderRadius: 10,
              fontSize: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
          <Pressable
            onPress={handleAddBookmark}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 10,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.bg, fontSize: 14, fontWeight: '600' }}>
              Save Bookmark
            </Text>
          </Pressable>
        </View>
      )}

      {/* Bookmark list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        {bookmarks.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 40, gap: 12 }}>
            <Text style={{ fontSize: 40 }}>🔖</Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.5, textAlign: 'center' }}>
              No bookmarks yet.{'\n'}Pause reading and tap "+ Add" to save your place.
            </Text>
          </View>
        ) : (
          bookmarks
            .sort((a, b) => a.wordIndex - b.wordIndex)
            .map((bookmark) => (
              <Pressable
                key={bookmark.id}
                onPress={() => onSeekTo(bookmark.wordIndex)}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 14,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  borderWidth: 1,
                  borderColor: bookmark.wordIndex === currentWordIndex
                    ? colors.accent + '44'
                    : colors.border,
                }}
              >
                <View style={{
                  backgroundColor: colors.accent + '22',
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 16 }}>🔖</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                    {bookmark.note}
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 12, opacity: 0.4 }}>
                    Word {bookmark.wordIndex + 1} · {new Date(bookmark.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    removeBookmark(bookmark.id);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#FF6B6B22',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#FF6B6B', fontSize: 14 }}>✕</Text>
                </Pressable>
              </Pressable>
            ))
        )}
      </ScrollView>
    </View>
  );
}

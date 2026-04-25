import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { useLibraryStore } from '../../src/stores/useLibraryStore';
import { useStreakStore } from '../../src/stores/useStreakStore';
import { useReaderStore } from '../../src/stores/useReaderStore';
import { COLOR_PROFILES } from '../../src/theme/colors';
import { SealLogo } from '../../src/components/seal/SealLogo';
import { useBookImport } from '../../src/hooks/useBookImport';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../src/stores/useAuthStore';
import * as api from '../../src/lib/api';

const DEMO_TEXT = `The ocean stretched endlessly before her, a vast canvas of blues and greens that seemed to breathe with the rhythm of the earth itself. She stood at the water's edge, feeling the cold foam lap at her bare feet, each wave a gentle invitation to wade deeper.

In the distance, a group of harbor seals lounged on the rocky outcropping, their sleek bodies glistening in the afternoon sun. They seemed utterly content, unbothered by the world's chaos, existing in a state of pure, blissful presence that she envied deeply.

She had come to this beach to escape the noise. The constant buzzing of notifications, the endless scroll of social media feeds, the relentless pressure to consume content faster, faster, always faster. Here, time moved differently. Here, a seal could spend an entire afternoon doing nothing more than basking in warmth, and that was enough.

Reading had once been her sanctuary too. Before screens fragmented her attention into tiny, restless pieces, she could lose herself in a book for hours. The words would flow like water, carrying her to places she had never been, introducing her to people she would never meet, teaching her things she never knew she needed to learn.

She opened her book and began to read, one word at a time, letting each one land softly in her mind like a pebble dropped into still water. The ripples spread outward, each word connecting to the next, building meaning like coral building a reef — slowly, beautifully, inevitably.`;

export default function LibraryScreen() {
  const { colorProfile } = useSettingsStore();
  const colors = COLOR_PROFILES[colorProfile];
  const { books, addBook, removeBook } = useLibraryStore();
  const { currentStreak, todayWordsRead, dailyGoal } = useStreakStore();
  const { pickAndImportFile, isImporting, progress, error } = useBookImport();
  const router = useRouter();
  const { userId } = useAuthStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter books to only show the ones belonging to the current user (or demo books)
  const userBooks = books.filter(b => 
    (userId && b.userId === userId) || 
    (!userId && !b.userId) || 
    b.id.startsWith('demo-')
  );

  useEffect(() => {
    async function syncCloud() {
      if (!userId) return;
      setIsSyncing(true);
      try {
        const { books: cloudBooks } = await api.getBooks(userId);
        
        // 1. Keep all books that DO NOT belong to the current user
        const otherUsersBooks = books.filter(b => b.userId !== userId && !b.id.startsWith('demo-'));
        
        // 2. Prepare a map of books for the CURRENT user
        // We start with existing local books for this user, then overwrite with cloud data
        const currentUserBooksMap = new Map(
          books.filter(b => b.userId === userId).map(b => [b.id, b])
        );
        
        cloudBooks.forEach((cb: any) => {
          currentUserBooksMap.set(cb.id, {
            id: cb.id,
            title: cb.title,
            author: cb.author,
            fileType: cb.fileType,
            totalWords: cb.totalWords || 0,
            chapters: cb.chapters || [],
            addedAt: cb.createdAt,
            userId: userId, // Explicitly set the owner
          });
        });

        // 3. Combine them back together
        const allBooks = [
          ...otherUsersBooks,
          ...Array.from(currentUserBooksMap.values()),
          ...books.filter(b => b.id.startsWith('demo-')) // Keep demo books
        ];

        // Deduplicate demo books
        const uniqueBooks = Array.from(new Map(allBooks.map(b => [b.id, b])).values());
        
        useLibraryStore.getState().setBooks(uniqueBooks);
      } catch (e) {
        console.error('Failed to sync cloud books:', e);
      } finally {
        setIsSyncing(false);
      }
    }

    syncCloud();
  }, [userId]);

  const loadDemoBook = () => {
    const demoBook = {
      id: 'demo-seal-story',
      title: 'The Seal\'s Beach',
      author: 'SealTools Demo',
      fileType: 'epub' as const,
      totalWords: DEMO_TEXT.split(/\s+/).length,
      chapters: [{
        index: 0,
        title: 'Chapter 1',
        startWordIndex: 0,
        endWordIndex: DEMO_TEXT.split(/\s+/).length - 1,
        text: DEMO_TEXT,
      }],
      addedAt: new Date().toISOString(),
    };

    if (!books.find(b => b.id === demoBook.id)) {
      addBook(demoBook);
    }

    // Set the book ID — Reader screen will handle loading text
    useReaderStore.getState().setBook(
      demoBook.id,
      DEMO_TEXT.split(/\s+/).filter(Boolean),
      demoBook.totalWords
    );
    router.push('/reader');
  };

  const handleOpenBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book || book.chapters.length === 0) return;

    // Set the book ID — Reader screen will handle loading text
    const fullText = book.chapters.map(c => c.text).join('\n\n');
    const words = fullText.split(/\s+/).filter(Boolean);
    useReaderStore.getState().setBook(book.id, words, words.length);
    router.push('/reader');
  };

  const handleImport = async () => {
    const book = await pickAndImportFile();
    if (book) {
      handleOpenBook(book.id);
    }
  };

  const goalProgress = Math.min(todayWordsRead / dailyGoal, 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SealLogo size={44} color={colors.accent} accentColor={colors.text} />
          <View>
            <Text style={{ color: colors.text, fontSize: 26, fontWeight: '800' }}>
              SealTools
            </Text>
            <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>
              Read at your own pace 🦭
            </Text>
          </View>
        </View>

        {/* Today's progress card */}
        <View style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>Today</Text>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700' }}>
                {todayWordsRead.toLocaleString()} words
              </Text>
            </View>
            {currentStreak > 0 && (
              <View style={{
                backgroundColor: colors.accent + '22',
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 16,
              }}>
                <Text style={{ color: colors.accent, fontSize: 16, fontWeight: '700' }}>
                  🔥 {currentStreak} day{currentStreak > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
          <View style={{
            height: 8,
            backgroundColor: colors.border,
            borderRadius: 4,
            marginTop: 16,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: `${goalProgress * 100}%`,
              backgroundColor: colors.accent,
              borderRadius: 4,
            }} />
          </View>
          <Text style={{ color: colors.text, fontSize: 12, opacity: 0.5, marginTop: 6 }}>
            {todayWordsRead} / {dailyGoal} daily goal
          </Text>
        </View>

        {/* Import error */}
        {error && (
          <View style={{
            backgroundColor: '#FF6B6B22',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: '#FF6B6B44',
          }}>
            <Text style={{ color: '#FF6B6B', fontSize: 13 }}>⚠️ {error}</Text>
          </View>
        )}

        {/* Library section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              My Library
            </Text>
            {isSyncing && <ActivityIndicator size="small" color={colors.accent} />}
          </View>
          <Pressable
            onPress={handleImport}
            disabled={isImporting}
            style={{
              backgroundColor: colors.accent,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              opacity: isImporting ? 0.6 : 1,
            }}
          >
            {isImporting ? (
              <>
                <ActivityIndicator size="small" color={colors.bg} />
                <Text style={{ color: colors.bg, fontSize: 13, fontWeight: '600' }}>{progress}</Text>
              </>
            ) : (
              <Text style={{ color: colors.bg, fontSize: 13, fontWeight: '600' }}>
                📂 Upload Book
              </Text>
            )}
          </Pressable>
        </View>

        {userBooks.length === 0 ? (
          <View style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 32,
            alignItems: 'center',
            gap: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 48 }}>🦭</Text>
            <Text style={{ color: colors.text, fontSize: 16, textAlign: 'center', opacity: 0.7 }}>
              Your library is empty.{'\n'}Upload a PDF/EPUB or try the demo!
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={loadDemoBook}
                style={{
                  backgroundColor: colors.accent,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: colors.bg, fontSize: 14, fontWeight: '700' }}>
                  📖 Demo Story
                </Text>
              </Pressable>
              <Pressable
                onPress={handleImport}
                disabled={isImporting}
                style={{
                  backgroundColor: colors.secondary,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>
                  📂 Upload File
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {userBooks.map((book) => (
              <View
                key={book.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={() => handleOpenBook(book.id)}
                  style={{
                    flex: 1,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                  }}
                >
                  <View style={{
                    width: 48,
                    height: 64,
                    backgroundColor: book.fileType === 'pdf' ? '#FF634722' : '#48CAE422',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 24 }}>{book.fileType === 'pdf' ? '📕' : '📗'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 13, opacity: 0.5 }}>
                      {book.author} · {book.totalWords.toLocaleString()} words · {book.chapters.length} ch.
                    </Text>
                  </View>
                </Pressable>
                
                <Pressable
                  onPress={() => removeBook(book.id)}
                  style={{
                    padding: 16,
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderLeftWidth: 1,
                    borderLeftColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

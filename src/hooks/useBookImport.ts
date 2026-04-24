import { useState, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { useLibraryStore } from '../stores/useLibraryStore';
import { extractTextFromPDF, extractTextFromEPUB } from '../engine/fileExtractor';
import { Book } from '../types/book';

interface ImportState {
  isImporting: boolean;
  progress: string;
  error: string | null;
}

export function useBookImport() {
  const [state, setState] = useState<ImportState>({
    isImporting: false,
    progress: '',
    error: null,
  });
  const { addBook } = useLibraryStore();

  const pickAndImportFile = useCallback(async () => {
    setState({ isImporting: true, progress: 'Picking file...', error: null });

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/epub+zip',
          'application/x-epub+zip',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setState({ isImporting: false, progress: '', error: null });
        return null;
      }

      const file = result.assets[0];
      const fileName = file.name || 'Unknown';
      const fileType = fileName.toLowerCase().endsWith('.epub') ? 'epub' : 'pdf';

      setState({ isImporting: true, progress: 'Reading file...', error: null });

      // Read file as ArrayBuffer
      let arrayBuffer: ArrayBuffer;

      if (Platform.OS === 'web') {
        // On web, fetch the blob URI
        const response = await fetch(file.uri);
        arrayBuffer = await response.arrayBuffer();
      } else {
        // On native, use FileSystem to read as base64 then convert
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = bytes.buffer;
      }

      setState({ isImporting: true, progress: 'Extracting text...', error: null });

      // Extract text based on file type
      let chapters;
      let totalWords;

      if (fileType === 'pdf') {
        const result = await extractTextFromPDF(arrayBuffer);
        chapters = result.chapters;
        totalWords = result.totalWords;
      } else {
        const result = await extractTextFromEPUB(arrayBuffer);
        chapters = result.chapters;
        totalWords = result.totalWords;
      }

      if (totalWords === 0) {
        setState({
          isImporting: false,
          progress: '',
          error: 'No text could be extracted from this file. It may be a scanned document.',
        });
        return null;
      }

      // Create book record
      const bookId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const titleGuess = fileName.replace(/\.(pdf|epub)$/i, '').replace(/[-_]/g, ' ');

      const book: Book = {
        id: bookId,
        title: titleGuess,
        author: 'Unknown',
        fileType,
        totalWords,
        chapters,
        addedAt: new Date().toISOString(),
      };

      addBook(book);

      setState({ isImporting: false, progress: '', error: null });

      return book;
    } catch (error: any) {
      console.error('Import error:', error);
      setState({
        isImporting: false,
        progress: '',
        error: error.message || 'Failed to import file',
      });
      return null;
    }
  }, [addBook]);

  return {
    pickAndImportFile,
    ...state,
  };
}

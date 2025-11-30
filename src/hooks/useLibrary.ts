import { useState, useCallback } from "react";
import {
  type LibraryItem,
  loadLibrary,
  addToLibrary,
  removeFromLibrary,
  updateProgress,
  getProgress,
  generateBookId,
} from "@/lib/storage";

export function useLibrary() {
  const [library, setLibrary] = useState<LibraryItem[]>(() => loadLibrary());

  const addBook = useCallback(async (file: File, title?: string) => {
    const id = await generateBookId(file);
    const item = addToLibrary({
      id,
      title: title || file.name.replace(/\.epub$/i, ""),
      filename: file.name,
    });
    setLibrary(loadLibrary());
    return item;
  }, []);

  const removeBook = useCallback((id: string) => {
    removeFromLibrary(id);
    setLibrary(loadLibrary());
  }, []);

  const saveProgress = useCallback((id: string, cfi: string, progress?: number) => {
    updateProgress(id, cfi, progress);
    setLibrary(loadLibrary());
  }, []);

  const loadProgress = useCallback((id: string) => {
    return getProgress(id);
  }, []);

  return {
    library,
    addBook,
    removeBook,
    saveProgress,
    loadProgress,
  };
}

import { useState, useCallback, useEffect } from "react";
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
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setLibrary(loadLibrary());
    setIsLoading(false);
  }, []);

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

  const saveProgress = useCallback((id: string, cfi: string) => {
    updateProgress(id, cfi);
    setLibrary(loadLibrary());
  }, []);

  const loadProgress = useCallback((id: string) => {
    return getProgress(id);
  }, []);

  return {
    library,
    isLoading,
    addBook,
    removeBook,
    saveProgress,
    loadProgress,
  };
}

export type LibraryItem = {
  id: string;
  title: string;
  filename: string;
  addedAt: string;
  lastOpenedAt?: string;
  lastLocation?: string;
  progress?: number; // 0-100
};

const LIBRARY_KEY = "epub-library";

export function loadLibrary(): LibraryItem[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(items: LibraryItem[]) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(items));
}

export function addToLibrary(item: Omit<LibraryItem, "addedAt">): LibraryItem {
  const library = loadLibrary();
  const existing = library.find((i) => i.id === item.id);
  if (existing) {
    return existing;
  }

  const newItem: LibraryItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };
  saveLibrary([...library, newItem]);
  return newItem;
}

export function removeFromLibrary(id: string) {
  const library = loadLibrary();
  saveLibrary(library.filter((item) => item.id !== id));
  localStorage.removeItem(`epub-progress:${id}`);
}

export function getProgress(id: string): string | null {
  return localStorage.getItem(`epub-progress:${id}`);
}

export function updateProgress(id: string, cfi: string, progress?: number) {
  localStorage.setItem(`epub-progress:${id}`, cfi);

  const library = loadLibrary();
  const now = new Date().toISOString();
  const updated = library.map((item) =>
    item.id === id
      ? { ...item, lastLocation: cfi, lastOpenedAt: now, progress: progress ?? item.progress }
      : item,
  );
  saveLibrary(updated);
}

export async function generateBookId(file: File): Promise<string> {
  const buffer = await file.slice(0, 1024 * 10).arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex.slice(0, 16);
}

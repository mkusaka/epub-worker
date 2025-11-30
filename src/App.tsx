import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryItem } from "@/lib/storage";
import { saveEpubData, loadEpubData, deleteEpubData } from "@/lib/epub-storage";
import { Reader } from "@/components/Reader";
import { Library } from "@/components/Library";
import { FileUpload } from "@/components/FileUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

type ActiveBook = {
  item: LibraryItem;
  data: ArrayBuffer;
};

function BookReader({
  library,
  saveProgress,
  loadProgress,
}: {
  library: LibraryItem[];
  saveProgress: (id: string, cfi: string) => void;
  loadProgress: (id: string) => string | null;
}) {
  const { bookId } = useParams<{ bookId: string }>();
  const [activeBook, setActiveBook] = useState<ActiveBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;

    const item = library.find((b) => b.id === bookId);
    if (!item) {
      setError("Book not found in library");
      return;
    }

    setIsLoading(true);
    setError(null);
    loadEpubData(bookId)
      .then((data) => {
        if (data) {
          setActiveBook({ item, data });
        } else {
          setError("EPUB file not found. Please re-add the file.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [bookId, library]);

  const handleLocationChange = useCallback(
    (cfi: string) => {
      if (activeBook) {
        saveProgress(activeBook.item.id, cfi);
      }
    },
    [activeBook, saveProgress]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }

  if (!activeBook) {
    return null;
  }

  return (
    <Reader
      key={activeBook.item.id}
      bookData={activeBook.data}
      bookId={activeBook.item.id}
      title={activeBook.item.title}
      initialLocation={loadProgress(activeBook.item.id)}
      onLocationChange={handleLocationChange}
    />
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <div className="text-center">
        <p className="text-lg">No book selected</p>
        <p className="text-sm mt-2">
          Add an EPUB file or select one from the library
        </p>
      </div>
    </div>
  );
}

function AppLayout({ bookId }: { bookId?: string }) {
  const { library, addBook, removeBook, saveProgress, loadProgress } = useLibrary();
  const navigate = useNavigate();

  const handleFileSelect = useCallback(
    async (file: File) => {
      const item = await addBook(file);
      const data = await file.arrayBuffer();
      await saveEpubData(item.id, data);
      navigate(`/book/${item.id}`);
    },
    [addBook, navigate]
  );

  const handleBookSelect = useCallback(
    (item: LibraryItem) => {
      navigate(`/book/${item.id}`);
    },
    [navigate]
  );

  const handleRemoveBook = useCallback(
    async (id: string) => {
      removeBook(id);
      await deleteEpubData(id);
      if (bookId === id) {
        navigate("/");
      }
    },
    [removeBook, bookId, navigate]
  );

  const activeItem = library.find((b) => b.id === bookId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <h1 className="font-semibold text-lg">EPUB Reader</h1>
            <FileUpload onFileSelect={handleFileSelect} />
          </SidebarHeader>
          <SidebarContent>
            <Library
              items={library}
              onSelect={handleBookSelect}
              onRemove={handleRemoveBook}
              selectedId={bookId}
            />
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="h-12 border-b flex items-center px-4 gap-2">
            <SidebarTrigger />
            <span className="font-medium truncate flex-1">
              {activeItem?.title || "Select a book to read"}
            </span>
            <ThemeToggle />
          </header>

          <div className="flex-1 relative">
            {bookId ? (
              <BookReader
                library={library}
                saveProgress={saveProgress}
                loadProgress={loadProgress}
              />
            ) : (
              <EmptyState />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function HomePage() {
  return <AppLayout />;
}

function BookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  return <AppLayout bookId={bookId} />;
}

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="book/:bookId" element={<BookPage />} />
    </Routes>
  );
}

export default App;

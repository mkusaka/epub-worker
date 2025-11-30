import { Suspense, useCallback } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryItem } from "@/lib/storage";
import { saveEpubData, loadEpubData, deleteEpubData } from "@/lib/epub-storage";
import { createResource, invalidateResource } from "@/lib/suspense";
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

type BookData = {
  item: LibraryItem;
  data: ArrayBuffer;
};

function useBookData(bookId: string, library: LibraryItem[]): BookData {
  return createResource(`book:${bookId}`, async () => {
    const item = library.find((b) => b.id === bookId);
    if (!item) {
      throw new Error("Book not found in library");
    }
    const data = await loadEpubData(bookId);
    if (!data) {
      throw new Error("EPUB file not found. Please re-add the file.");
    }
    return { item, data };
  });
}

function BookReaderContent({
  bookId,
  library,
  saveProgress,
  loadProgress,
}: {
  bookId: string;
  library: LibraryItem[];
  saveProgress: (id: string, cfi: string) => void;
  loadProgress: (id: string) => string | null;
}) {
  const { item, data } = useBookData(bookId, library);

  const handleLocationChange = useCallback(
    (cfi: string) => {
      saveProgress(item.id, cfi);
    },
    [item.id, saveProgress]
  );

  return (
    <Reader
      key={item.id}
      bookData={data}
      bookId={item.id}
      title={item.title}
      initialLocation={loadProgress(item.id)}
      onLocationChange={handleLocationChange}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p>Loading...</p>
    </div>
  );
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <p>{error.message}</p>
    </div>
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
      invalidateResource(`book:${id}`);
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
              <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[bookId]}>
                <Suspense fallback={<LoadingFallback />}>
                  <BookReaderContent
                    bookId={bookId}
                    library={library}
                    saveProgress={saveProgress}
                    loadProgress={loadProgress}
                  />
                </Suspense>
              </ErrorBoundary>
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

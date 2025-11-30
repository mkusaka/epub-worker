import { Suspense, useCallback } from "react";
import { Routes, Route, useParams, useNavigate, Link } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryItem } from "@/lib/storage";
import { saveEpubData, loadEpubData, deleteEpubData } from "@/lib/epub-storage";
import { createResource, invalidateResource } from "@/lib/suspense";
import { Reader } from "@/components/Reader";
import { Library } from "@/components/Library";
import { FileUpload } from "@/components/FileUpload";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FlowModeToggle } from "@/components/FlowModeToggle";
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
  saveProgress: (id: string, cfi: string, progress?: number) => void;
  loadProgress: (id: string) => string | null;
}) {
  const { item, data } = useBookData(bookId, library);

  const handleLocationChange = useCallback(
    (cfi: string, progress: number) => {
      saveProgress(item.id, cfi, progress);
    },
    [item.id, saveProgress],
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

function MainLibrary({
  items,
  onSelect,
  onRemove,
  onFileSelect,
}: {
  items: LibraryItem[];
  onSelect: (item: LibraryItem) => void;
  onRemove: (id: string) => void;
  onFileSelect: (file: File) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg">No books in library</p>
          <p className="text-sm mt-2">Add an EPUB file to get started</p>
          <div className="mt-4">
            <FileUpload onFileSelect={onFileSelect} />
          </div>
        </div>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const aTime = a.lastOpenedAt || a.addedAt;
    const bTime = b.lastOpenedAt || b.addedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <div className="h-full overflow-auto p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent"
            onClick={() => onSelect(item)}
          >
            <h3 className="font-medium truncate">{item.title}</h3>
            <p className="text-sm text-muted-foreground truncate mt-1">{item.filename}</p>
            {item.progress !== undefined && item.progress > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{item.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            )}
            {item.lastOpenedAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Last read: {new Date(item.lastOpenedAt).toLocaleDateString()}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                className="flex-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(item);
                }}
              >
                {item.lastLocation ? "Continue" : "Read"}
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
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
    [addBook, navigate],
  );

  const handleBookSelect = useCallback(
    (item: LibraryItem) => {
      navigate(`/book/${item.id}`);
    },
    [navigate],
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
    [removeBook, bookId, navigate],
  );

  const activeItem = library.find((b) => b.id === bookId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <Link to="/" className="font-semibold text-lg hover:opacity-80">
              EPUB Reader
            </Link>
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
            <FlowModeToggle />
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
              <MainLibrary
                items={library}
                onSelect={handleBookSelect}
                onRemove={handleRemoveBook}
                onFileSelect={handleFileSelect}
              />
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

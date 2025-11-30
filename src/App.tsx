import { useState, useCallback } from "react";
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

function App() {
  const { library, addBook, removeBook, saveProgress, loadProgress } = useLibrary();
  const [activeBook, setActiveBook] = useState<ActiveBook | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true);
      try {
        const item = await addBook(file);
        const data = await file.arrayBuffer();
        await saveEpubData(item.id, data);
        setActiveBook({ item, data });
      } finally {
        setIsLoading(false);
      }
    },
    [addBook]
  );

  const handleBookSelect = useCallback(
    async (item: LibraryItem) => {
      setIsLoading(true);
      try {
        const data = await loadEpubData(item.id);
        if (data) {
          setActiveBook({ item, data });
        } else {
          alert("EPUB file not found. Please re-add the file.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleRemoveBook = useCallback(
    async (id: string) => {
      removeBook(id);
      await deleteEpubData(id);
      if (activeBook?.item.id === id) {
        setActiveBook(null);
      }
    },
    [removeBook, activeBook]
  );

  const handleLocationChange = useCallback(
    (cfi: string) => {
      if (activeBook) {
        saveProgress(activeBook.item.id, cfi);
      }
    },
    [activeBook, saveProgress]
  );

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
              selectedId={activeBook?.item.id}
            />
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="h-12 border-b flex items-center px-4 gap-2">
            <SidebarTrigger />
            <span className="font-medium truncate flex-1">
              {activeBook?.item.title || "Select a book to read"}
            </span>
            <ThemeToggle />
          </header>

          <div className="flex-1 relative">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Loading...</p>
              </div>
            ) : activeBook ? (
              <Reader
                key={activeBook.item.id}
                bookData={activeBook.data}
                bookId={activeBook.item.id}
                title={activeBook.item.title}
                initialLocation={loadProgress(activeBook.item.id)}
                onLocationChange={handleLocationChange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg">No book selected</p>
                  <p className="text-sm mt-2">
                    Add an EPUB file or select one from the library
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default App;

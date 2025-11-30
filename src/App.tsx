import { useState, useCallback } from "react";
import { useLibrary } from "@/hooks/useLibrary";
import type { LibraryItem } from "@/lib/storage";
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
  url: string;
};

function App() {
  const { library, addBook, removeBook, saveProgress, loadProgress } = useLibrary();
  const [activeBook, setActiveBook] = useState<ActiveBook | null>(null);
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());

  const handleFileSelect = useCallback(
    async (file: File) => {
      const item = await addBook(file);
      setFileMap((prev) => new Map(prev).set(item.id, file));
      const url = URL.createObjectURL(file);
      setActiveBook({ item, url });
    },
    [addBook]
  );

  const handleBookSelect = useCallback(
    (item: LibraryItem) => {
      const existingFile = fileMap.get(item.id);
      if (existingFile) {
        const url = URL.createObjectURL(existingFile);
        setActiveBook({ item, url });
      } else {
        setActiveBook(null);
        alert("Please re-add the EPUB file to read it again.");
      }
    },
    [fileMap]
  );

  const handleRemoveBook = useCallback(
    (id: string) => {
      removeBook(id);
      if (activeBook?.item.id === id) {
        setActiveBook(null);
      }
      setFileMap((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
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
            {activeBook ? (
              <Reader
                key={activeBook.item.id}
                fileUrl={activeBook.url}
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

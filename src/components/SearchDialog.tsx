import { useState, useCallback } from "react";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export type SearchResult = {
  cfi: string;
  excerpt: string;
};

type SearchDialogProps = {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (cfi: string) => void;
};

export function SearchDialog({ onSearch, onResultClick }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    try {
      const searchResults = await onSearch(query.trim());
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  const handleResultClick = useCallback(
    (cfi: string) => {
      onResultClick(cfi);
      setOpen(false);
    },
    [onResultClick],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch],
  );

  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset state when closing
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Search">
          <SearchIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search in book</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            placeholder="Enter search term..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
            {isSearching ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
        <ScrollArea className="h-[300px] mt-2">
          {isSearching ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2Icon className="h-6 w-6 animate-spin mr-2" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 rounded-md border hover:bg-accent transition-colors"
                  onClick={() => handleResultClick(result.cfi)}
                >
                  <p
                    className="text-sm line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </button>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <XIcon className="h-8 w-8 mb-2" />
              <p>No results found</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Enter a search term to find text in the book</p>
            </div>
          )}
        </ScrollArea>
        {results.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

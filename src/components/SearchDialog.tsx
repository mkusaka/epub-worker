import { useState, useCallback, useEffect, useRef } from "react";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SearchResult } from "@/components/Reader";
import { useDebounce } from "use-debounce";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

type SearchDialogProps = {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onResultClick: (cfi: string) => void;
};

const DEBOUNCE_DELAY = 300;

export function SearchDialog({ onSearch, onResultClick }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const isComposingRef = useRef(false);

  const [debouncedQuery] = useDebounce(query, DEBOUNCE_DELAY);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback((e: React.CompositionEvent<HTMLInputElement>) => {
    isComposingRef.current = false;
    // Ensure the final composed value is set
    setQuery(e.currentTarget.value);
  }, []);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (!open) return;

    const doSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);
      try {
        const searchResults = await onSearch(debouncedQuery.trim());
        setResults(searchResults);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    doSearch();
  }, [debouncedQuery, onSearch, open]);

  const handleResultClick = useCallback(
    (cfi: string) => {
      onResultClick(cfi);
      setOpen(false);
    },
    [onResultClick],
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
          <DialogDescription>Find text within the current book</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={handleInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="pl-9"
            autoFocus
          />
          {isSearching && (
            <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
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

import type { LibraryItem } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type LibraryProps = {
  items: LibraryItem[];
  onSelect: (item: LibraryItem) => void;
  onRemove: (id: string) => void;
  selectedId?: string;
};

export function Library({ items, onSelect, onRemove, selectedId }: LibraryProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        <p className="text-sm">No books in library</p>
        <p className="text-xs mt-1">Add an EPUB file to get started</p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const aTime = a.lastOpenedAt || a.addedAt;
    const bTime = b.lastOpenedAt || b.addedAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2">
        {sortedItems.map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedId === item.id ? "border-primary" : ""
            }`}
            onClick={() => onSelect(item)}
          >
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-sm font-medium truncate">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-1">
              <p className="text-xs text-muted-foreground truncate">
                {item.filename}
              </p>
              {item.lastOpenedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last read: {new Date(item.lastOpenedAt).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1 h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                >
                  {item.lastLocation ? "Continue" : "Read"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

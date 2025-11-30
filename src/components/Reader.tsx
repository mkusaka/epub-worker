import { useState, useEffect } from "react";
import { ReactReader } from "react-reader";

type ReaderProps = {
  fileUrl: string;
  bookId: string;
  title: string;
  onLocationChange?: (cfi: string) => void;
  initialLocation?: string | null;
};

export function Reader({
  fileUrl,
  bookId,
  title,
  onLocationChange,
  initialLocation,
}: ReaderProps) {
  const [location, setLocation] = useState<string | null>(
    initialLocation ?? null
  );

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation, bookId]);

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    onLocationChange?.(loc);
  };

  return (
    <div className="h-full w-full">
      <ReactReader
        url={fileUrl}
        location={location}
        locationChanged={handleLocationChange}
        title={title}
        showToc={true}
      />
    </div>
  );
}

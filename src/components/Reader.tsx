import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ReactReader, type IReactReaderStyle } from "react-reader";
import { useTheme } from "@/contexts/ThemeContext";
import { useReaderSettings } from "@/contexts/ReaderSettingsContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rendition = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Book = any;

export type SearchResult = {
  cfi: string;
  excerpt: string;
};

export type ReaderHandle = {
  search: (query: string) => Promise<SearchResult[]>;
  goToCfi: (cfi: string) => void;
};

type ReaderProps = {
  bookData: ArrayBuffer;
  bookId: string;
  title: string;
  onLocationChange?: (cfi: string, progress: number) => void;
  initialLocation?: string | null;
};

const lightReaderStyles: IReactReaderStyle = {
  container: {
    overflow: "hidden",
    height: "100%",
  },
  readerArea: {
    position: "relative",
    zIndex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "#ffffff",
    transition: "all 0.3s ease",
  },
  containerExpanded: {
    transform: "translateX(256px)",
  },
  titleArea: {
    position: "absolute",
    top: 20,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#999999",
  },
  reader: {
    position: "absolute",
    top: 50,
    left: 50,
    bottom: 20,
    right: 50,
  },
  swipeWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 200,
  },
  prev: {
    left: 1,
  },
  next: {
    right: 1,
  },
  arrow: {
    outline: "none",
    border: "none",
    background: "none",
    position: "absolute",
    top: "50%",
    marginTop: -32,
    fontSize: 64,
    padding: "0 10px",
    color: "#666666",
    fontFamily: "arial, sans-serif",
    cursor: "pointer",
    userSelect: "none",
    appearance: "none",
    fontWeight: "normal",
  },
  arrowHover: {
    color: "#000000",
  },
  tocBackground: {
    position: "absolute",
    left: 256,
    top: 0,
    bottom: 0,
    right: 0,
    zIndex: 1,
  },
  tocArea: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
    width: 256,
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
    background: "#f8f8f8",
    padding: "10px 0",
  },
  tocAreaButton: {
    userSelect: "none",
    appearance: "none",
    background: "none",
    border: "none",
    display: "block",
    fontFamily: "sans-serif",
    width: "100%",
    fontSize: 14,
    textAlign: "left",
    padding: "8px 16px",
    borderBottom: "1px solid #e0e0e0",
    color: "#333333",
    cursor: "pointer",
  },
  tocButton: {
    background: "none",
    border: "none",
    width: 32,
    height: 32,
    position: "absolute",
    top: 10,
    left: 10,
    borderRadius: 2,
    outline: "none",
    cursor: "pointer",
  },
  tocButtonExpanded: {
    background: "#e0e0e0",
  },
  tocButtonBar: {
    position: "absolute",
    width: "60%",
    background: "#666666",
    height: 2,
    left: "50%",
    margin: "-1px -30%",
    top: "50%",
    transition: "all 0.5s ease",
  },
  tocButtonBarTop: {
    top: "35%",
  },
  tocButtonBottom: {
    top: "65%",
  },
  toc: {},
  loadingView: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    color: "#666666",
    textAlign: "center",
    marginTop: -20,
  },
  errorView: {
    position: "absolute",
    top: "50%",
    left: "10%",
    right: "10%",
    color: "#cc0000",
    textAlign: "center",
    marginTop: -20,
  },
};

const darkReaderStyles: IReactReaderStyle = {
  ...lightReaderStyles,
  readerArea: {
    ...lightReaderStyles.readerArea,
    backgroundColor: "#1a1a1a",
  },
  titleArea: {
    ...lightReaderStyles.titleArea,
    color: "#888888",
  },
  arrow: {
    ...lightReaderStyles.arrow,
    color: "#888888",
  },
  arrowHover: {
    color: "#ffffff",
  },
  tocArea: {
    ...lightReaderStyles.tocArea,
    background: "#252525",
  },
  tocAreaButton: {
    ...lightReaderStyles.tocAreaButton,
    color: "#e0e0e0",
    borderBottom: "1px solid #333333",
  },
  tocButtonExpanded: {
    background: "#444444",
  },
  tocButtonBar: {
    ...lightReaderStyles.tocButtonBar,
    background: "#e0e0e0",
  },
  loadingView: {
    ...lightReaderStyles.loadingView,
    color: "#888888",
  },
};

export const Reader = forwardRef<ReaderHandle, ReaderProps>(function Reader(
  { bookData, bookId, title, onLocationChange, initialLocation },
  ref,
) {
  const [location, setLocation] = useState<string | null>(initialLocation ?? null);
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const { flowMode } = useReaderSettings();

  // Expose search and navigation methods via ref
  useImperativeHandle(
    ref,
    () => ({
      search: async (query: string): Promise<SearchResult[]> => {
        if (!book) return [];

        const results: SearchResult[] = [];
        const spine = book.spine;

        // Search through all spine items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of spine.spineItems as any[]) {
          await item.load(book.load.bind(book));
          const matches = item.find(query);
          if (matches && matches.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            matches.forEach((match: any) => {
              results.push({
                cfi: match.cfi,
                excerpt: match.excerpt,
              });
            });
          }
          item.unload();
        }

        return results;
      },
      goToCfi: (cfi: string) => {
        if (rendition) {
          rendition.display(cfi);
        }
      },
    }),
    [book, rendition],
  );

  const readerStyles = useMemo(() => {
    const baseStyles = isDark ? darkReaderStyles : lightReaderStyles;
    // Hide navigation arrows in scrolled mode
    if (flowMode === "scrolled") {
      return {
        ...baseStyles,
        arrow: {
          ...baseStyles.arrow,
          display: "none",
        },
      };
    }
    return baseStyles;
  }, [isDark, flowMode]);

  // Handle container resize (e.g., sidebar toggle)
  useEffect(() => {
    if (!rendition || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize to avoid excessive calls
      requestAnimationFrame(() => {
        if (rendition) {
          rendition.resize();
        }
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [rendition]);

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    }
  }, [initialLocation, bookId]);

  useEffect(() => {
    if (!rendition) return;

    if (isDark) {
      rendition.themes.override("color", "#e0e0e0");
      rendition.themes.override("background", "#1a1a1a");
    } else {
      rendition.themes.override("color", "#000000");
      rendition.themes.override("background", "#ffffff");
    }
  }, [rendition, isDark]);

  const handleLocationChange = (loc: string) => {
    setLocation(loc);
    if (rendition && onLocationChange) {
      // Try to get percentage from locations
      const locations = rendition.book?.locations;
      if (locations && locations.total > 0) {
        const percentage = locations.percentageFromCfi(loc);
        if (percentage !== undefined && !isNaN(percentage)) {
          const progress = Math.round(percentage * 100);
          onLocationChange(loc, progress);
          return;
        }
      }
      // Fallback: try currentLocation
      const currentLocation = rendition.currentLocation();
      if (currentLocation?.start?.percentage !== undefined) {
        const progress = Math.round(currentLocation.start.percentage * 100);
        onLocationChange(loc, progress);
      } else {
        onLocationChange(loc, 0);
      }
    }
  };

  const handleRendition = useCallback(
    (rendition: Rendition) => {
      setRendition(rendition);
      setBook(rendition.book);

      // Generate locations for progress calculation
      rendition.book.ready.then(() => {
        return rendition.book.locations.generate(1024);
      });

      // Add custom CSS to fix layout issues with formulas and tables in paginated mode
      if (flowMode === "paginated") {
        rendition.themes.register("fix-layout", {
          "img, svg, math, table, figure": {
            "max-width": "100% !important",
            "page-break-inside": "avoid",
            "break-inside": "avoid",
          },
          ".MathJax, .MathJax_Display, [class*='math'], [class*='formula']": {
            "page-break-inside": "avoid",
            "break-inside": "avoid",
            overflow: "visible",
          },
        });
        rendition.themes.select("fix-layout");
      }

      // Apply initial theme
      const dark = document.documentElement.classList.contains("dark");
      if (dark) {
        rendition.themes.override("color", "#e0e0e0");
        rendition.themes.override("background", "#1a1a1a");
      }
    },
    [flowMode],
  );

  return (
    <div ref={containerRef} className="h-full w-full">
      <ReactReader
        key={`${bookId}-${isDark ? "dark" : "light"}-${flowMode}`}
        url={bookData}
        location={location}
        locationChanged={handleLocationChange}
        title={title}
        showToc={true}
        getRendition={handleRendition}
        readerStyles={readerStyles}
        epubOptions={{
          allowScriptedContent: true,
          flow: flowMode,
          manager: flowMode === "scrolled" ? "continuous" : "default",
        }}
      />
    </div>
  );
});

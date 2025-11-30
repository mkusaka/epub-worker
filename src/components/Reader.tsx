import { useState, useEffect, useCallback, useMemo } from "react";
import { ReactReader, type IReactReaderStyle } from "react-reader";
import { useTheme } from "@/contexts/ThemeContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rendition = any;

type ReaderProps = {
  bookData: ArrayBuffer;
  bookId: string;
  title: string;
  onLocationChange?: (cfi: string) => void;
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

export function Reader({
  bookData,
  bookId,
  title,
  onLocationChange,
  initialLocation,
}: ReaderProps) {
  const [location, setLocation] = useState<string | null>(
    initialLocation ?? null
  );
  const [rendition, setRendition] = useState<Rendition | null>(null);
  const { isDark } = useTheme();

  const readerStyles = useMemo(() => isDark ? darkReaderStyles : lightReaderStyles, [isDark]);

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
    onLocationChange?.(loc);
  };

  const handleRendition = useCallback((rendition: Rendition) => {
    setRendition(rendition);

    // Apply initial theme
    const dark = document.documentElement.classList.contains("dark");
    if (dark) {
      rendition.themes.override("color", "#e0e0e0");
      rendition.themes.override("background", "#1a1a1a");
    }
  }, []);

  return (
    <div className="h-full w-full">
      <ReactReader
        key={`${bookId}-${isDark ? "dark" : "light"}`}
        url={bookData}
        location={location}
        locationChanged={handleLocationChange}
        title={title}
        showToc={true}
        getRendition={handleRendition}
        readerStyles={readerStyles}
        epubOptions={{
          allowScriptedContent: true,
        }}
      />
    </div>
  );
}

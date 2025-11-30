import { BookOpenIcon, ScrollIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReaderSettings, type FlowMode } from "@/contexts/ReaderSettingsContext";

const flowModeIcons: Record<FlowMode, React.ReactNode> = {
  paginated: <BookOpenIcon className="h-4 w-4" />,
  scrolled: <ScrollIcon className="h-4 w-4" />,
};

export function FlowModeToggle() {
  const { flowMode, setFlowMode } = useReaderSettings();

  return (
    <Select value={flowMode} onValueChange={(value) => setFlowMode(value as FlowMode)}>
      <SelectTrigger
        className="w-9 h-9 px-0 gap-0 justify-center [&_svg.size-4.opacity-50]:hidden"
        aria-label="Reading mode"
      >
        <SelectValue>{flowModeIcons[flowMode]}</SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-0">
        <SelectItem value="paginated">
          <BookOpenIcon className="h-4 w-4" />
        </SelectItem>
        <SelectItem value="scrolled">
          <ScrollIcon className="h-4 w-4" />
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

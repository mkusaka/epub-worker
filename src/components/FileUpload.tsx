import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
};

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".epub")) {
      onFileSelect(file);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        type="file"
        accept=".epub"
        onChange={handleChange}
        className="hidden"
        id="epub-upload"
      />
      <Button
        variant="outline"
        className="w-full"
        onClick={() => inputRef.current?.click()}
      >
        Add EPUB
      </Button>
    </div>
  );
}

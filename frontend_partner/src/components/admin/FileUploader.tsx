import { useRef } from "react";
import { Plus } from "lucide-react";

interface FileUploaderProps {
  onFileUploaded: (file: File) => void;
}

export default function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file);
    if (file) {
      onFileUploaded(file);
    }
  };

  return (
    <>
      <div
        onClick={handleDivClick}
        className="w-28 h-28 md:w-32 md:h-32 border-2 border-dashed flex items-center justify-center rounded-lg text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition"
      >
        <Plus className="w-6 h-6" />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

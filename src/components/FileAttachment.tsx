
import { useState, useRef } from "react";
import { Paperclip, Image, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileAttachmentProps {
  onFileSelect: (files: File[]) => void;
}

export const FileAttachment = ({ onFileSelect }: FileAttachmentProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
      onFileSelect([...selectedFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...selectedFiles];
    updatedFiles.splice(index, 1);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    if (fileType === 'image') {
      return <Image className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };
  
  const getFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                onClick={handleOpenFileDialog}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach files</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {selectedFiles.map((file, index) => {
              const preview = getFilePreview(file);
              return (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-1.5 bg-accent/50 text-xs py-1 pl-2 pr-7 rounded-full">
                    {getFileIcon(file)}
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <button 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-background/80"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {preview && (
                    <div className="absolute -top-20 left-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <img 
                        src={preview} 
                        alt={file.name} 
                        className="max-h-16 max-w-32 rounded-md border border-border shadow-md" 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const UploadDatasetButton = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulate file upload
    setTimeout(() => {
      setIsUploading(false);
      toast({
        title: "File uploaded",
        description: `Successfully uploaded ${files[0].name}`,
      });
      
      // Reset file input
      if (e.target) {
        e.target.value = '';
      }
    }, 1500);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".csv,.xlsx,.json"
      />
      <Button 
        variant="outline" 
        className="flex gap-2"
        onClick={handleButtonClick}
        disabled={isUploading}
      >
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload My Dataset"}
      </Button>
    </>
  );
};


import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UploadDatasetButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload here
      
      // Reset the input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Button variant="outline" className="flex gap-2" onClick={handleButtonClick}>
        <Upload className="h-4 w-4" />
        Upload My Dataset
      </Button>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".csv,.xlsx,.json"
      />
    </>
  );
};


import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const UploadDatasetButton = () => {
  return (
    <Button variant="outline" className="flex gap-2">
      <Upload className="h-4 w-4" />
      Upload My Dataset
    </Button>
  );
};

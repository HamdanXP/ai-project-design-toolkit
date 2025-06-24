import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const NoDatasetWarning = () => (
  <Alert className="mb-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      <strong>No dataset selected.</strong> You can proceed, but without data, your AI project will need alternative data sources or collection strategies before development can begin.
    </AlertDescription>
  </Alert>
);
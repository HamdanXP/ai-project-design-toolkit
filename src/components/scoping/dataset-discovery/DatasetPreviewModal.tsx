
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dataset } from "@/types/scoping-phase";

interface DatasetPreviewModalProps {
  previewDataset: Dataset | null;
  setPreviewDataset: (dataset: Dataset | null) => void;
  handleSelectDataset: (dataset: Dataset) => void;
}

export const DatasetPreviewModal = ({
  previewDataset,
  setPreviewDataset,
  handleSelectDataset,
}: DatasetPreviewModalProps) => {
  if (!previewDataset) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle>{previewDataset.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Source: {previewDataset.source}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPreviewDataset(null)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[calc(80vh-120px)]">
          <div className="p-4">
            <h3 className="font-medium mb-2">Dataset Information</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Format</p>
                <p className="font-medium">{previewDataset.format}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Size</p>
                <p className="font-medium">{previewDataset.size}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">License</p>
                <p className="font-medium">{previewDataset.license}</p>
              </div>
            </div>
            
            {previewDataset.columns && previewDataset.sampleRows && (
              <>
                <h3 className="font-medium mb-2">Sample Data</h3>
                <div className="overflow-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-secondary/20">
                        {previewDataset.columns.map((col, i) => (
                          <th key={i} className="p-2 border border-border text-left text-sm">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewDataset.sampleRows.map((row, i) => (
                        <tr key={i}>
                          {row.map((cell, j) => (
                            <td key={j} className="p-2 border border-border text-sm">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 p-4">
          <Button variant="outline" onClick={() => setPreviewDataset(null)}>
            Close
          </Button>
          <Button onClick={() => {
            handleSelectDataset(previewDataset);
            setPreviewDataset(null);
          }}>
            Select Dataset
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

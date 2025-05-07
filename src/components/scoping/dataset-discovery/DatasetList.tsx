
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/types/scoping-phase";

interface DatasetListProps {
  filteredDatasets: Dataset[];
  selectedDataset: Dataset | null;
  loadingDatasets: boolean;
  handleSelectDataset: (dataset: Dataset) => void;
  handlePreviewDataset: (dataset: Dataset) => void;
}

export const DatasetList = ({
  filteredDatasets,
  selectedDataset,
  loadingDatasets,
  handleSelectDataset,
  handlePreviewDataset,
}: DatasetListProps) => {
  if (loadingDatasets) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border border-border">
            <CardContent className="p-4">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-1/3 mb-2" />
                <Skeleton className="h-5 w-1/5" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between mt-3">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredDatasets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No datasets match your search criteria
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
      {filteredDatasets.map(dataset => (
        <Card 
          key={dataset.id} 
          className={`border cursor-pointer transition-all hover:shadow-md ${
            selectedDataset?.id === dataset.id ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onClick={() => handleSelectDataset(dataset)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{dataset.title}</h3>
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full">
                {dataset.format}
              </span>
            </div>
            <p className="text-sm text-muted-foreground my-2">{dataset.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Source: {dataset.source}</span>
              <span>Size: {dataset.size}</span>
            </div>
            <div className="flex justify-between mt-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewDataset(dataset);
                }}
              >
                Preview Data
              </Button>
              <Button 
                variant={selectedDataset?.id === dataset.id ? "default" : "secondary"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDataset(dataset);
                }}
              >
                {selectedDataset?.id === dataset.id ? "Selected" : "Select Dataset"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

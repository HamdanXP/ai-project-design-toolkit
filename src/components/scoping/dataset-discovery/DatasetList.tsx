import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { Dataset } from "@/types/scoping-phase";

interface DatasetListProps {
  filteredDatasets: Dataset[];
  selectedDataset: Dataset | null;
  loadingDatasets: boolean;
  handleSelectDataset: (dataset: Dataset | null) => void;
}

export const DatasetList = ({
  filteredDatasets,
  selectedDataset,
  loadingDatasets,
  handleSelectDataset,
}: DatasetListProps) => {
  if (loadingDatasets) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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

  const formatDescription = (description: string) => {
    if (!description) return "No description available";
    let cleaned = description
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/Organization:.*$/i, '')
      .replace(/Tags:.*$/i, '')
      .replace(/Resources:.*$/i, '')
      .trim();
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150) + "...";
    }
    return cleaned || "Food security and nutrition data for humanitarian analysis";
  };

  const getDatasetSource = (dataset: Dataset) => {
    if (dataset.source.includes('humdata.org')) return 'HDX';
    if (dataset.source.includes('reliefweb')) return 'ReliefWeb';
    if (dataset.source.includes('who.int')) return 'WHO';
    if (dataset.source.includes('fao.org')) return 'FAO';
    if (dataset.source.includes('worldbank.org')) return 'World Bank';
    return 'Humanitarian Data Source';
  };

  return (
    <div className="space-y-4">
      {filteredDatasets.map((dataset) => {
        const isSelected = selectedDataset?.id === dataset.id;
        return (
          <Card
            key={dataset.id}
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() =>
              isSelected
                ? handleSelectDataset(null)
                : handleSelectDataset(dataset)
            }
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
                    {dataset.title}
                  </h3>
                </div>
                {isSelected && (
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {formatDescription(dataset.description)}
              </p>

              <div className="flex justify-between items-center pt-2">
                <div className="text-xs text-gray-500">
                  Source: {getDatasetSource(dataset)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(dataset.source, '_blank', 'noopener,noreferrer');
                    }}
                    className="flex items-center gap-1 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Source
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

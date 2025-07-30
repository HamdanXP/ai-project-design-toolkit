import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { Dataset } from "@/types/scoping-phase";
import { DatasetSearchBar } from "./dataset-discovery/DatasetSearchBar";
import { DatasetList } from "./dataset-discovery/DatasetList";
import { UploadDatasetButton } from "./dataset-discovery/UploadDatasetButton";
import { NoDatasetsFound } from "./dataset-discovery/NoDatasetsFound";
import { NoDatasetWarning } from "./dataset-discovery/NoDatasetWarning";

type DatasetDiscoveryProps = {
  datasets: Dataset[];
  filteredDatasets: Dataset[];
  searchTerm: string;
  selectedCategory: string;
  selectedDataset: Dataset | null;
  loadingDatasets: boolean;
  noDatasets?: boolean;
  handleSearch: (term: string) => void;
  handleCategorySelect: (category: string) => void;
  handleSelectDataset: (dataset: Dataset | null) => void;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
  onRetryDatasetSearch?: () => void;
  onTriggerSearch?: () => void;
  hasSearchedDatasets?: boolean;
};

export const DatasetDiscovery = ({
  datasets,
  filteredDatasets,
  searchTerm,
  selectedCategory,
  selectedDataset,
  loadingDatasets,
  noDatasets = false,
  handleSearch,
  handleCategorySelect,
  handleSelectDataset,
  moveToPreviousStep,
  moveToNextStep,
  onRetryDatasetSearch,
  onTriggerSearch,
  hasSearchedDatasets = false,
}: DatasetDiscoveryProps) => {
  const hasNoDatasets = !loadingDatasets && (noDatasets || datasets.length === 0);
  const showSearchTrigger = !hasSearchedDatasets && !loadingDatasets && datasets.length === 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">3</span>
          Dataset Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Find or upload relevant datasets for your AI project. The quality and characteristics of your data will significantly impact your results.
        </p>

        {showSearchTrigger && onTriggerSearch && (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ready to search for datasets?</h3>
              <p className="text-muted-foreground mb-6">
                We'll search humanitarian data sources and repositories to find relevant datasets for your project.
              </p>
            </div>
            <Button onClick={onTriggerSearch} size="lg" className="px-8">
              <RefreshCw className="mr-2 h-4 w-4" />
              Search for Datasets
            </Button>
          </div>
        )}

        {hasSearchedDatasets && !showSearchTrigger && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <DatasetSearchBar
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              handleSearch={handleSearch}
              handleCategorySelect={handleCategorySelect}
            />
            <UploadDatasetButton />
          </div>
        )}

        {loadingDatasets && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Searching humanitarian data sources...</span>
          </div>
        )}

        {hasNoDatasets && hasSearchedDatasets && (
          <NoDatasetsFound 
            onRetry={onRetryDatasetSearch}
            isRetrying={loadingDatasets}
          />
        )}

        {!loadingDatasets && !hasNoDatasets && hasSearchedDatasets && (
          <DatasetList
            filteredDatasets={filteredDatasets}
            selectedDataset={selectedDataset}
            loadingDatasets={loadingDatasets}
            handleSelectDataset={handleSelectDataset}
          />
        )}

        {!loadingDatasets && !selectedDataset && !hasNoDatasets && hasSearchedDatasets && (
          <NoDatasetWarning />
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {!loadingDatasets && (
              <>
                {hasNoDatasets && hasSearchedDatasets ? (
                  "No datasets found - you can continue without one"
                ) : selectedDataset && hasSearchedDatasets ? (
                  `Dataset selected: ${selectedDataset.title}`
                ) : hasSearchedDatasets ? (
                  `${filteredDatasets.length} dataset${filteredDatasets.length !== 1 ? 's' : ''} available`
                ) : showSearchTrigger ? (
                  "Click above to start searching for datasets"
                ) : (
                  ""
                )}
              </>
            )}
          </div>
          <Button 
            onClick={moveToNextStep}
            variant={selectedDataset ? "default" : "outline"}
          >
            {hasNoDatasets || !selectedDataset ? "Continue Without Dataset" : "Next Step"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
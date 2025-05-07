
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Dataset } from "@/types/scoping-phase";
import { DatasetSearchBar } from "./DatasetSearchBar";
import { DatasetList } from "./DatasetList";
import { DatasetPreviewModal } from "./DatasetPreviewModal";
import { UploadDatasetButton } from "./UploadDatasetButton";

type DatasetDiscoveryProps = {
  datasets: Dataset[];
  filteredDatasets: Dataset[];
  searchTerm: string;
  selectedCategory: string;
  selectedDataset: Dataset | null;
  previewDataset: Dataset | null;
  loadingDatasets: boolean;
  handleSearch: (term: string) => void;
  handleCategorySelect: (category: string) => void;
  handleSelectDataset: (dataset: Dataset) => void;
  handlePreviewDataset: (dataset: Dataset) => void;
  setPreviewDataset: (dataset: Dataset | null) => void;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const DatasetDiscovery = ({
  datasets,
  filteredDatasets,
  searchTerm,
  selectedCategory,
  selectedDataset,
  previewDataset,
  loadingDatasets,
  handleSearch,
  handleCategorySelect,
  handleSelectDataset,
  handlePreviewDataset,
  setPreviewDataset,
  moveToPreviousStep,
  moveToNextStep,
}: DatasetDiscoveryProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">3</span>
          Dataset Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Find or upload relevant datasets for your AI project. The quality and characteristics of your data will significantly impact your results.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <DatasetSearchBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            handleSearch={handleSearch}
            handleCategorySelect={handleCategorySelect}
          />
          
          <UploadDatasetButton />
        </div>
        
        <DatasetList
          filteredDatasets={filteredDatasets}
          selectedDataset={selectedDataset}
          loadingDatasets={loadingDatasets}
          handleSelectDataset={handleSelectDataset}
          handlePreviewDataset={handlePreviewDataset}
        />
        
        <DatasetPreviewModal
          previewDataset={previewDataset}
          setPreviewDataset={setPreviewDataset}
          handleSelectDataset={handleSelectDataset}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button onClick={moveToNextStep} disabled={!selectedDataset}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

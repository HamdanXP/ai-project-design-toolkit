import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Database, Search, Upload, ExternalLink, Eye } from "lucide-react";
import { Dataset } from "@/types/scoping-phase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DatasetDiscoveryProps = {
  datasets: Dataset[];
  filteredDatasets: Dataset[];
  searchTerm: string;
  selectedCategory: string;
  selectedDataset: Dataset | null;
  previewDataset: Dataset | null;
  loadingDatasets: boolean;
  noDatasets?: boolean;
  handleSearch: (term: string) => void;
  handleCategorySelect: (category: string) => void;
  handleSelectDataset: (dataset: Dataset) => void;
  handlePreviewDataset: (dataset: Dataset) => void;
  setPreviewDataset: (dataset: Dataset | null) => void;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

// Search Bar Component
const DatasetSearchBar = ({ 
  searchTerm, 
  selectedCategory, 
  handleSearch, 
  handleCategorySelect 
}: {
  searchTerm: string;
  selectedCategory: string;
  handleSearch: (term: string) => void;
  handleCategorySelect: (category: string) => void;
}) => {
  const categories = ["Health", "Education", "Food Security", "Water", "Disaster Response"];
  
  return (
    <div className="flex flex-col md:flex-row gap-2 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search datasets..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategorySelect("")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategorySelect(category)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Upload Dataset Button Component
const UploadDatasetButton = () => (
  <Button variant="outline" className="flex items-center gap-2">
    <Upload className="h-4 w-4" />
    Upload Dataset
  </Button>
);

// Dataset List Component
const DatasetList = ({
  filteredDatasets,
  selectedDataset,
  loadingDatasets,
  handleSelectDataset,
  handlePreviewDataset
}: {
  filteredDatasets: Dataset[];
  selectedDataset: Dataset | null;
  loadingDatasets: boolean;
  handleSelectDataset: (dataset: Dataset) => void;
  handlePreviewDataset: (dataset: Dataset) => void;
}) => {
  if (loadingDatasets) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDatasets.map((dataset) => (
        <Card 
          key={dataset.id} 
          className={`cursor-pointer transition-all ${
            selectedDataset?.id === dataset.id ? 'border-primary bg-primary/5' : 'hover:shadow-md'
          }`}
          onClick={() => handleSelectDataset(dataset)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-lg">{dataset.title}</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">{dataset.format}</Badge>
                <Badge variant="outline">{dataset.source}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {dataset.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Size: {dataset.size}</span>
                <span>License: {dataset.license}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewDataset(dataset);
                }}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Dataset Preview Modal Component
const DatasetPreviewModal = ({
  previewDataset,
  setPreviewDataset,
  handleSelectDataset
}: {
  previewDataset: Dataset | null;
  setPreviewDataset: (dataset: Dataset | null) => void;
  handleSelectDataset: (dataset: Dataset) => void;
}) => (
  <Dialog open={!!previewDataset} onOpenChange={() => setPreviewDataset(null)}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          {previewDataset?.title}
          <Badge variant="outline">{previewDataset?.source}</Badge>
        </DialogTitle>
      </DialogHeader>
      
      {previewDataset && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{previewDataset.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Format</h4>
              <p className="text-sm">{previewDataset.format}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Size</h4>
              <p className="text-sm">{previewDataset.size}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Columns</h4>
            <div className="flex flex-wrap gap-2">
              {previewDataset.columns.map((column, index) => (
                <Badge key={index} variant="secondary">{column}</Badge>
              ))}
            </div>
          </div>
          
          {previewDataset.sampleRows && previewDataset.sampleRows.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sample Data</h4>
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      {previewDataset.columns.map((column, index) => (
                        <th key={index} className="p-2 text-left font-medium">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewDataset.sampleRows.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="p-2">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button onClick={() => handleSelectDataset(previewDataset)} className="flex-1">
              Select This Dataset
            </Button>
            <Button variant="outline" asChild>
              <a href={previewDataset.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                View Source
              </a>
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// No Datasets Found Component
const NoDatasetsFound = () => (
  <Card className="border-dashed border-2">
    <CardContent className="pt-6">
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
          <Database className="h-8 w-8 text-orange-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Datasets Found</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          We couldn't find relevant datasets from humanitarian data sources. This is common for specialized AI projects.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-lg mx-auto">
          <h4 className="font-medium text-blue-900 mb-2">What you can do:</h4>
          <ul className="text-sm text-blue-800 text-left space-y-1">
            <li>• Upload your own dataset using the button above</li>
            <li>• Contact humanitarian organizations directly for data access</li>
            <li>• Use publicly available datasets from government sources</li>
            <li>• Consider synthetic or simulated data for initial development</li>
            <li>• Proceed without a dataset to plan your data collection strategy</li>
          </ul>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>Searched: ReliefWeb • UN Data • Humanitarian Data Exchange • WHO • WFP</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Component
export const DatasetDiscovery = ({
  datasets,
  filteredDatasets,
  searchTerm,
  selectedCategory,
  selectedDataset,
  previewDataset,
  loadingDatasets,
  noDatasets = false,
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
        <p className="text-muted-foreground mb-6">
          Find or upload relevant datasets for your AI project. The quality and characteristics of your data will significantly impact your results.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <DatasetSearchBar
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            handleSearch={handleSearch}
            handleCategorySelect={handleCategorySelect}
          />
          
          <UploadDatasetButton />
        </div>
        
        {/* Show loading state */}
        {loadingDatasets && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Searching humanitarian data sources...</span>
          </div>
        )}
        
        {/* Show no datasets found */}
        {!loadingDatasets && noDatasets && (
          <NoDatasetsFound />
        )}
        
        {/* Show datasets list */}
        {!loadingDatasets && !noDatasets && (
          <DatasetList
            filteredDatasets={filteredDatasets}
            selectedDataset={selectedDataset}
            loadingDatasets={loadingDatasets}
            handleSelectDataset={handleSelectDataset}
            handlePreviewDataset={handlePreviewDataset}
          />
        )}
        
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {!loadingDatasets && (
              <>
                {noDatasets ? (
                  "No datasets found - you can continue without one"
                ) : (
                  `${filteredDatasets.length} dataset${filteredDatasets.length !== 1 ? 's' : ''} available`
                )}
              </>
            )}
          </div>
          <Button 
            onClick={moveToNextStep} 
            disabled={!selectedDataset && !noDatasets}
            variant={noDatasets ? "outline" : "default"}
          >
            {noDatasets ? "Continue Without Dataset" : "Next Step"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
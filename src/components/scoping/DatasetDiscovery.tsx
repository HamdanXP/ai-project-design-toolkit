
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Search, Upload, X } from "lucide-react";
import { Dataset } from "@/types/scoping-phase";

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
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search datasets..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="px-3 py-2 border border-input rounded-md bg-background"
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="water">Water</option>
              <option value="disease">Health</option>
              <option value="agriculture">Agriculture</option>
              <option value="refugee">Migration</option>
              <option value="food">Food Security</option>
            </select>
          </div>
          
          <Button variant="outline" className="flex gap-2">
            <Upload className="h-4 w-4" />
            Upload My Dataset
          </Button>
        </div>
        
        {loadingDatasets ? (
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
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {filteredDatasets.length > 0 ? (
              filteredDatasets.map(dataset => (
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
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No datasets match your search criteria
              </div>
            )}
          </div>
        )}
        
        {previewDataset && (
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
                  setSelectedDataset(previewDataset);
                  setPreviewDataset(null);
                }}>
                  Select Dataset
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
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


import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, Search, Bookmark, Upload, Check, AlertTriangle, X, ArrowRight, HelpCircle } from "lucide-react";

// Type for use case items
type UseCase = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  selected: boolean;
};

// Type for dataset items
type Dataset = {
  id: string;
  title: string;
  source: string;
  format: string;
  size: string;
  license: string;
  description: string;
  columns?: string[];
  sampleRows?: any[][];
};

// Feasibility constraint type
type FeasibilityConstraint = {
  id: string;
  label: string;
  value: string | boolean;
  options?: string[];
  type: 'toggle' | 'select' | 'input';
};

// Data suitability check type
type DataSuitabilityCheck = {
  id: string;
  question: string;
  answer: 'yes' | 'no' | 'unknown';
  description: string;
};

export const ScopingPhase = ({
  onUpdateProgress,
  onCompletePhase
}: {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
}) => {
  const { toast } = useToast();
  
  // State for tracking overall progress
  const [activeStep, setActiveStep] = useState<number>(1);
  const totalSteps = 5;
  
  // AI Use Case Explorer state
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [loadingUseCases, setLoadingUseCases] = useState(true);
  
  // Feasibility Constraints state
  const [constraints, setConstraints] = useState<FeasibilityConstraint[]>([
    { id: "time", label: "Time Available", value: "medium-term", options: ["short-term", "medium-term", "long-term"], type: "select" },
    { id: "tech", label: "Technical Capacity", value: "moderate", options: ["limited", "moderate", "extensive"], type: "select" },
    { id: "compute", label: "Computing Resources", value: "cloud", options: ["local", "cloud", "hybrid"], type: "select" },
    { id: "internet", label: "Internet Access", value: true, type: "toggle" },
    { id: "infrastructure", label: "Local Infrastructure", value: true, type: "toggle" }
  ]);
  const [feasibilityScore, setFeasibilityScore] = useState<number>(0);
  const [feasibilityRisk, setFeasibilityRisk] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Dataset Discovery state
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  
  // Data Suitability state
  const [suitabilityChecks, setSuitabilityChecks] = useState<DataSuitabilityCheck[]>([
    { id: "clean", question: "Is the data clean and usable?", answer: "unknown", description: "" },
    { id: "representative", question: "Is it representative and fair?", answer: "unknown", description: "" },
    { id: "privacy", question: "Are there privacy/ethical concerns?", answer: "unknown", description: "" },
    { id: "quality", question: "Is the data quality sufficient?", answer: "unknown", description: "" }
  ]);
  const [suitabilityScore, setSuitabilityScore] = useState<number>(0);
  const [chatQuestion, setChatQuestion] = useState("");
  
  // Final Feasibility state
  const [readyToAdvance, setReadyToAdvance] = useState<boolean | null>(null);

  // Initialize data (in a real app, this would come from an API)
  useEffect(() => {
    // Simulate loading use cases
    setTimeout(() => {
      setUseCases([
        {
          id: "uc1",
          title: "Forecasting water shortages",
          description: "Use historical weather and water usage data to predict shortages in vulnerable areas.",
          tags: ["Forecasting", "Resource Management"],
          selected: false
        },
        {
          id: "uc2", 
          title: "Disease outbreak prediction",
          description: "Analyze population movement and health data to predict potential disease outbreaks.",
          tags: ["Healthcare", "Predictive Analytics"],
          selected: false
        },
        {
          id: "uc3",
          title: "Crop yield optimization",
          description: "Recommend optimal planting strategies based on soil, weather and climate data.",
          tags: ["Agriculture", "Optimization"],
          selected: false
        },
        {
          id: "uc4",
          title: "Refugee movement patterns",
          description: "Analyze migration patterns to better allocate humanitarian resources.",
          tags: ["Migration", "Resource Allocation"],
          selected: false
        },
        {
          id: "uc5",
          title: "Food security monitoring",
          description: "Track food availability and price indicators to identify at-risk communities.",
          tags: ["Food Security", "Monitoring"],
          selected: false
        }
      ]);
      setLoadingUseCases(false);
    }, 1000);

    // Simulate loading datasets
    setTimeout(() => {
      const mockDatasets = [
        {
          id: "ds1",
          title: "Global Water Access Database",
          source: "UN Water",
          format: "CSV",
          size: "2.3 GB",
          license: "CC BY 4.0",
          description: "Comprehensive data on water access across 150 countries, updated quarterly.",
          columns: ["Country", "Region", "Year", "WaterAccessPercent", "WaterQuality"],
          sampleRows: [
            ["Kenya", "Eastern Africa", "2024", "67.5%", "Moderate"],
            ["India", "South Asia", "2024", "89.2%", "Variable"],
            ["Bolivia", "South America", "2024", "78.4%", "Good"]
          ]
        },
        {
          id: "ds2",
          title: "Global Disease Surveillance Data",
          source: "WHO",
          format: "JSON",
          size: "850 MB",
          license: "Open Data Commons",
          description: "Disease incidence reports from health facilities worldwide",
          columns: ["Country", "Disease", "Date", "Confirmed_Cases", "Deaths"],
          sampleRows: [
            ["Brazil", "Dengue", "2024-01-15", "234", "3"],
            ["Nigeria", "Malaria", "2024-01-20", "567", "12"],
            ["Thailand", "Dengue", "2024-01-25", "112", "1"]
          ]
        },
        {
          id: "ds3",
          title: "Agricultural Yield Dataset",
          source: "FAO",
          format: "CSV",
          size: "1.5 GB",
          license: "CC BY-NC 4.0",
          description: "Historical crop yield data with soil and weather conditions",
          columns: ["Region", "Crop", "Year", "Yield_Tons", "Rainfall_mm", "Soil_pH"],
          sampleRows: [
            ["Sub-Saharan Africa", "Maize", "2023", "4.2", "750", "6.5"],
            ["South Asia", "Rice", "2023", "5.8", "1200", "7.1"],
            ["Central America", "Beans", "2023", "1.9", "850", "6.2"]
          ]
        },
        {
          id: "ds4",
          title: "Refugee Movement Patterns",
          source: "UNHCR",
          format: "GeoJSON",
          size: "1.2 GB",
          license: "Open Data Commons",
          description: "Anonymized migration patterns and displacement data",
          columns: ["Origin", "Destination", "Time_Period", "Population_Count", "Reason"],
          sampleRows: [
            ["Syria", "Lebanon", "Q1 2024", "15400", "Conflict"],
            ["Venezuela", "Colombia", "Q1 2024", "18900", "Economic"],
            ["South Sudan", "Uganda", "Q1 2024", "12300", "Conflict"]
          ]
        },
        {
          id: "ds5",
          title: "Global Food Price Index",
          source: "World Food Programme",
          format: "Excel",
          size: "450 MB",
          license: "CC BY 4.0",
          description: "Monthly food price data across 80 countries",
          columns: ["Country", "Month", "Year", "Staple_Food", "Price_USD", "Change_Percent"],
          sampleRows: [
            ["Ethiopia", "March", "2024", "Teff", "2.15", "+4.2%"],
            ["Philippines", "March", "2024", "Rice", "1.30", "+2.8%"],
            ["Haiti", "March", "2024", "Rice", "1.85", "+7.3%"]
          ]
        }
      ];
      setDatasets(mockDatasets);
      setFilteredDatasets(mockDatasets);
      setLoadingDatasets(false);
    }, 1500);

    // Update progress
    onUpdateProgress(0, totalSteps);
  }, [onUpdateProgress]);

  // Calculate feasibility score when constraints change
  useEffect(() => {
    let score = 0;
    
    // Simple scoring logic (would be more sophisticated in a real app)
    if (constraints.find(c => c.id === "time")?.value === "long-term") score += 25;
    else if (constraints.find(c => c.id === "time")?.value === "medium-term") score += 15;
    else score += 5;
    
    if (constraints.find(c => c.id === "tech")?.value === "extensive") score += 25;
    else if (constraints.find(c => c.id === "tech")?.value === "moderate") score += 15;
    else score += 5;
    
    if (constraints.find(c => c.id === "internet")?.value === true) score += 15;
    if (constraints.find(c => c.id === "infrastructure")?.value === true) score += 15;
    
    // Determine risk level
    let risk: 'low' | 'medium' | 'high' = 'medium';
    if (score >= 75) risk = 'low';
    else if (score >= 40) risk = 'medium';
    else risk = 'high';
    
    setFeasibilityScore(score);
    setFeasibilityRisk(risk);
  }, [constraints]);

  // Calculate suitability score when checks change
  useEffect(() => {
    let score = 0;
    
    // Calculate score based on answers
    suitabilityChecks.forEach(check => {
      if (check.answer === "yes") score += 25;
      else if (check.answer === "unknown") score += 10;
      // No points for "no" answers
    });
    
    setSuitabilityScore(score);
  }, [suitabilityChecks]);

  // Update progress when step changes
  useEffect(() => {
    onUpdateProgress(activeStep - 1, totalSteps);
  }, [activeStep, onUpdateProgress]);

  // Handle use case selection
  const handleSelectUseCase = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setUseCases(prevUseCases => 
      prevUseCases.map(uc => ({
        ...uc,
        selected: uc.id === useCase.id
      }))
    );
    
    // Show success toast
    toast({
      title: "Use Case Selected",
      description: `You selected: ${useCase.title}`,
    });
  };

  // Handle dataset search and filtering
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterDatasets(term, selectedCategory);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterDatasets(searchTerm, category);
  };
  
  const filterDatasets = (term: string, category: string) => {
    let filtered = datasets;
    
    // Filter by search term
    if (term) {
      filtered = filtered.filter(ds => 
        ds.title.toLowerCase().includes(term.toLowerCase()) || 
        ds.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    // Filter by category (in a real app this would be more sophisticated)
    if (category) {
      filtered = filtered.filter(ds => ds.title.toLowerCase().includes(category.toLowerCase()));
    }
    
    setFilteredDatasets(filtered);
  };

  // Handle dataset selection
  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    
    toast({
      title: "Dataset Selected",
      description: `You selected: ${dataset.title}`,
    });
  };

  // Handle dataset preview
  const handlePreviewDataset = (dataset: Dataset) => {
    setPreviewDataset(dataset);
  };

  // Handle suitability check update
  const handleSuitabilityUpdate = (id: string, answer: 'yes' | 'no' | 'unknown') => {
    setSuitabilityChecks(prevChecks => 
      prevChecks.map(check => 
        check.id === id ? { ...check, answer } : check
      )
    );
  };

  // Handle AI assistant chat
  const handleSubmitQuestion = () => {
    // In a real app, this would call an AI API
    if (!chatQuestion.trim()) return;
    
    toast({
      title: "AI Assistant",
      description: "This feature would connect to an AI assistant in a production environment.",
    });
    
    setChatQuestion("");
  };

  // Handle constraint updates
  const handleConstraintUpdate = (id: string, value: string | boolean) => {
    setConstraints(prevConstraints =>
      prevConstraints.map(constraint =>
        constraint.id === id ? { ...constraint, value } : constraint
      )
    );
  };

  // Handle step navigation
  const moveToNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  const moveToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Handle phase completion
  const handleCompletePhase = () => {
    // Check if the user has completed the necessary steps
    if (!selectedUseCase) {
      toast({
        title: "Missing Use Case",
        description: "Please select an AI use case before completing.",
        variant: "destructive"
      });
      setActiveStep(1);
      return;
    }
    
    if (!selectedDataset) {
      toast({
        title: "Missing Dataset",
        description: "Please select a dataset before completing.",
        variant: "destructive"
      });
      setActiveStep(3);
      return;
    }
    
    if (readyToAdvance !== true) {
      toast({
        title: "Final Review Required",
        description: "Please confirm the project is ready to proceed.",
        variant: "destructive"
      });
      setActiveStep(5);
      return;
    }
    
    onCompletePhase();
  };

  // Render AI Use Case Explorer (Step 1)
  const renderUseCaseExplorer = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">1</span>
          AI Use Case Explorer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Explore different AI approaches that could help address your problem. Select one that best aligns with your project goals.</p>
        
        {loadingUseCases ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-2/3 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex mt-3 gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map(useCase => (
              <Card 
                key={useCase.id} 
                className={`border cursor-pointer transition-all hover:shadow-md ${useCase.selected ? 'border-primary bg-primary/5' : 'border-border'}`}
                onClick={() => handleSelectUseCase(useCase)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{useCase.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map(tag => (
                      <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">
                        {tag}
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant={useCase.selected ? "default" : "outline"} 
                    size="sm"
                    className="mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUseCase(useCase);
                    }}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {useCase.selected ? "Selected" : "Select Use Case"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedUseCase ? `Selected: ${selectedUseCase.title}` : "No use case selected"}
        </div>
        <Button onClick={moveToNextStep} disabled={!selectedUseCase}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  // Render Feasibility Constraints Form (Step 2)
  const renderFeasibilityForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">2</span>
          Feasibility Constraints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Define the practical constraints for your project. These factors will help determine what's realistically achievable.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {constraints.map(constraint => (
            <div key={constraint.id} className="space-y-2">
              <label className="text-sm font-medium">{constraint.label}</label>
              
              {constraint.type === 'toggle' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={constraint.id}
                    checked={constraint.value as boolean} 
                    onCheckedChange={(checked) => handleConstraintUpdate(constraint.id, !!checked)}
                  />
                  <label 
                    htmlFor={constraint.id}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Available
                  </label>
                </div>
              ) : constraint.type === 'select' && constraint.options ? (
                <select 
                  value={constraint.value as string}
                  onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {constraint.options.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input 
                  value={constraint.value as string}
                  onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Feasibility Summary</h3>
              <div className={`px-3 py-1 rounded-full text-white text-sm ${
                feasibilityRisk === 'low' ? 'bg-green-500' : 
                feasibilityRisk === 'medium' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}>
                {feasibilityRisk === 'low' ? 'Low Risk' : 
                 feasibilityRisk === 'medium' ? 'Medium Risk' : 
                 'High Risk'}
              </div>
            </div>
            <Progress value={feasibilityScore} className="h-2 mt-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {feasibilityScore <= 40 && "This project may face significant challenges. Consider revising your constraints or choosing a different approach."}
              {feasibilityScore > 40 && feasibilityScore < 75 && "This project appears moderately feasible, but may require careful planning and resource management."}
              {feasibilityScore >= 75 && "This project appears highly feasible given your constraints."}
            </p>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button onClick={moveToNextStep}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  // Render Dataset Discovery Panel (Step 3)  
  const renderDatasetDiscovery = () => (
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

  // Render Data Suitability Checklist (Step 4)
  const renderSuitabilityChecklist = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">4</span>
          Data Suitability Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Evaluate how suitable your chosen dataset is for your project. Identifying potential issues now can save time and resources later.</p>
        
        <div className="space-y-4 mb-8">
          {suitabilityChecks.map(check => (
            <Card key={check.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{check.question}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={check.answer === 'yes' ? 'default' : 'outline'}
                      className={check.answer === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'yes')}
                    >
                      <Check className="h-4 w-4 mr-1" /> Yes
                    </Button>
                    <Button 
                      size="sm" 
                      variant={check.answer === 'no' ? 'default' : 'outline'}
                      className={check.answer === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'no')}
                    >
                      <X className="h-4 w-4 mr-1" /> No
                    </Button>
                    <Button 
                      size="sm" 
                      variant={check.answer === 'unknown' ? 'default' : 'outline'}
                      className={check.answer === 'unknown' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'unknown')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" /> Unsure
                    </Button>
                  </div>
                </div>
                {check.answer !== 'unknown' && (
                  <div className="mt-3 flex items-start">
                    <div className={`mt-1 rounded-full p-1 ${
                      check.answer === 'yes' ? 'bg-green-100 text-green-600' : 
                      check.answer === 'no' ? 'bg-red-100 text-red-600' : 
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {check.answer === 'yes' && <Check className="h-3 w-3" />}
                      {check.answer === 'no' && <X className="h-3 w-3" />}
                      {check.answer === 'unknown' && <AlertTriangle className="h-3 w-3" />}
                    </div>
                    <div className="ml-2 text-sm text-muted-foreground">
                      {check.answer === 'yes' && "This is positive for your project."}
                      {check.answer === 'no' && "This could be a concern. Consider addressing this before proceeding."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Ask about potential biases or limitations in your chosen dataset.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Is this data biased or limited in any way?" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitQuestion}>
                    Ask
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border border-border h-full">
              <CardContent className="p-4 flex flex-col h-full justify-center">
                <h3 className="font-medium mb-2">Suitability Score</h3>
                <Progress value={suitabilityScore} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {suitabilityScore <= 40 && "There may be significant data issues to address."}
                  {suitabilityScore > 40 && suitabilityScore < 75 && "The data appears moderately suitable with some concerns."}
                  {suitabilityScore >= 75 && "The data appears highly suitable for your project."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button 
          onClick={moveToNextStep} 
          disabled={suitabilityChecks.every(check => check.answer === 'unknown')}
        >
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  // Render Final Feasibility Gate (Step 5)
  const renderFinalFeasibilityGate = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">5</span>
          Final Feasibility Gate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Review your project plan and decide whether to proceed to development or adjust your scope.</p>
        
        <Card className="border border-border shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Selected Use Case</h3>
                {selectedUseCase ? (
                  <div>
                    <p className="font-medium text-lg">{selectedUseCase.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUseCase.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUseCase.tags.map(tag => (
                        <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No use case selected</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Feasibility Summary</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-3 py-1 rounded-full text-white text-xs ${
                    feasibilityRisk === 'low' ? 'bg-green-500' : 
                    feasibilityRisk === 'medium' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}>
                    {feasibilityRisk.toUpperCase()} RISK
                  </div>
                  <span className="text-muted-foreground text-sm">Score: {feasibilityScore}/100</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Key Constraints</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>Time: {constraints.find(c => c.id === "time")?.value as string}</li>
                    <li>Technical Capacity: {constraints.find(c => c.id === "tech")?.value as string}</li>
                    <li>Internet Access: {constraints.find(c => c.id === "internet")?.value ? "Available" : "Limited"}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border my-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Selected Dataset</h3>
                {selectedDataset ? (
                  <div>
                    <p className="font-medium">{selectedDataset.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedDataset.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Source:</span> {selectedDataset.source}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span> {selectedDataset.format}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span> {selectedDataset.size}
                      </div>
                      <div>
                        <span className="text-muted-foreground">License:</span> {selectedDataset.license}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No dataset selected</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Data Suitability</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={suitabilityScore} className="h-2 flex-1" />
                  <span className="text-muted-foreground text-sm">{suitabilityScore}/100</span>
                </div>
                <div className="mt-3">
                  {suitabilityChecks.map(check => (
                    <div key={check.id} className="flex items-center mb-2">
                      {check.answer === 'yes' && <Check className="h-4 w-4 text-green-600 mr-2" />}
                      {check.answer === 'no' && <X className="h-4 w-4 text-red-600 mr-2" />}
                      {check.answer === 'unknown' && <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />}
                      <span className="text-sm">{check.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center text-center p-4">
          <h3 className="font-medium text-lg mb-3">Is this project ready to move forward?</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Based on your selected use case, dataset, and assessment, do you believe this project is ready to proceed to the Development phase?
          </p>
          
          <div className="flex gap-4">
            <Button 
              variant={readyToAdvance === false ? "default" : "outline"} 
              className={readyToAdvance === false ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setReadyToAdvance(false)}
            >
              <X className="h-4 w-4 mr-2" />
              No, Revise Approach
            </Button>
            
            <Button 
              variant={readyToAdvance === true ? "default" : "outline"}
              className={readyToAdvance === true ? "bg-green-600 hover:bg-green-700" : ""} 
              onClick={() => setReadyToAdvance(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Yes, Ready to Proceed
            </Button>
          </div>
          
          {readyToAdvance === false && (
            <div className="mt-4 text-sm text-muted-foreground">
              Consider revisiting earlier steps to adjust your approach before proceeding.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button onClick={handleCompletePhase} disabled={readyToAdvance !== true}>
          Complete Phase
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Scoping Phase</h1>
        <p className="text-muted-foreground">
          Define and validate the AI approach for your project. Explore use cases, assess feasibility, and ensure data suitability.
        </p>
        
        <div className="mt-6">
          <div className="flex items-center">
            <div className="flex-1">
              <Progress value={(activeStep / totalSteps) * 100} className="h-2" />
            </div>
            <div className="ml-4 text-sm text-muted-foreground">
              Step {activeStep} of {totalSteps}
            </div>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1 text-xs">
            <div className={`px-2 py-0.5 rounded-full ${activeStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Use Case
            </div>
            <div className={`px-2 py-0.5 rounded-full ${activeStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Feasibility
            </div>
            <div className={`px-2 py-0.5 rounded-full ${activeStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Dataset
            </div>
            <div className={`px-2 py-0.5 rounded-full ${activeStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Suitability
            </div>
            <div className={`px-2 py-0.5 rounded-full ${activeStep >= 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              Review
            </div>
          </div>
        </div>
      </div>
      
      {activeStep === 1 && renderUseCaseExplorer()}
      {activeStep === 2 && renderFeasibilityForm()}
      {activeStep === 3 && renderDatasetDiscovery()}
      {activeStep === 4 && renderSuitabilityChecklist()}
      {activeStep === 5 && renderFinalFeasibilityGate()}
    </div>
  );
};

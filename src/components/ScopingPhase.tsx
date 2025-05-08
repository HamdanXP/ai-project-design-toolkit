
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { FeasibilityForm } from "@/components/scoping/FeasibilityForm";
import { DatasetDiscovery } from "@/components/scoping/dataset-discovery/DatasetDiscovery";
import { SuitabilityChecklist } from "@/components/scoping/SuitabilityChecklist";
import { FinalFeasibilityGate } from "@/components/scoping/FinalFeasibilityGate";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

export const ScopingPhase = ({
  onUpdateProgress,
  onCompletePhase,
  updatePhaseStatus,
  currentPhaseStatus = "in-progress"
}: {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  currentPhaseStatus?: "not-started" | "in-progress" | "completed";
}) => {
  const { toast } = useToast();
  
  // State for tracking overall progress
  const [activeStep, setActiveStep] = useState<number>(() => {
    // Try to restore the active step from localStorage
    try {
      const storedStep = localStorage.getItem('scopingActiveStep');
      return storedStep ? parseInt(storedStep, 10) : 1;
    } catch (e) {
      return 1;
    }
  });
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
  
  // Final Feasibility state
  const [readyToAdvance, setReadyToAdvance] = useState<boolean | null>(() => {
    try {
      const storedDecision = localStorage.getItem('scopingFinalDecision');
      if (storedDecision === 'proceed') return true;
      if (storedDecision === 'revise') return false;
      return null;
    } catch (e) {
      return null;
    }
  });

  // Save active step to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('scopingActiveStep', activeStep.toString());
  }, [activeStep]);

  // Initialize data (in a real app, this would come from an API)
  useEffect(() => {
    // Try to load stored use case
    const storedUseCase = localStorage.getItem('selectedUseCase');
    if (storedUseCase) {
      try {
        setSelectedUseCase(JSON.parse(storedUseCase));
      } catch (e) {
        console.error("Error loading stored use case:", e);
      }
    }

    // Try to load stored dataset
    const storedDataset = localStorage.getItem('selectedDataset');
    if (storedDataset) {
      try {
        setSelectedDataset(JSON.parse(storedDataset));
      } catch (e) {
        console.error("Error loading stored dataset:", e);
      }
    }
    
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

    // Check if we're in the final step with a decision already
    const storedDecision = localStorage.getItem('scopingFinalDecision');
    if (storedDecision === 'proceed') {
      // If there's already a "proceed" decision, set to 100%
      updatePhaseStatus("scoping", "in-progress", 100);
    } else if (storedDecision === 'revise') {
      // If there's already a "revise" decision, set to 80%
      updatePhaseStatus("scoping", "in-progress", 80);
    } else {
      // Default progress calculation based on active step
      updateProgressBasedOnStep();
    }
  }, [onUpdateProgress, updatePhaseStatus]);

  // Update progress based on the current step
  const updateProgressBasedOnStep = () => {
    if (currentPhaseStatus !== "completed") {
      // For step 5, we don't update progress automatically - controlled by FinalFeasibilityGate
      if (activeStep === 5) {
        // Don't update progress here for step 5
        return;
      } else {
        // For steps 1-4, calculate progress normally
        onUpdateProgress(activeStep, totalSteps);
      }
    } else {
      // If phase is completed, show full progress
      onUpdateProgress(totalSteps, totalSteps);
    }
  };

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

  // Update progress when activeStep changes
  useEffect(() => {
    updateProgressBasedOnStep();
  }, [activeStep, currentPhaseStatus]);

  // Handle use case selection
  const handleSelectUseCase = (useCase: UseCase) => {
    setSelectedUseCase(useCase);
    setUseCases(prevUseCases => 
      prevUseCases.map(uc => ({
        ...uc,
        selected: uc.id === useCase.id
      }))
    );
    
    // Save selected use case to localStorage
    localStorage.setItem('selectedUseCase', JSON.stringify(useCase));
  };

  // Handle dataset selection
  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);
    
    // Save selected dataset to localStorage
    localStorage.setItem('selectedDataset', JSON.stringify(dataset));
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
      const nextStep = activeStep + 1;
      setActiveStep(nextStep);
      
      // Special handling for moving from step 4 to step 5
      if (nextStep === 5) {
        // Don't update progress automatically here
        // This will be handled by the FinalFeasibilityGate component
      } else {
        // For steps 1-4, update progress normally
        onUpdateProgress(nextStep, totalSteps);
      }
    }
  };
  
  const moveToPreviousStep = () => {
    if (activeStep > 1) {
      const prevStep = activeStep - 1;
      setActiveStep(prevStep);
      
      // For steps 1-4, update progress normally
      if (prevStep < 5) {
        onUpdateProgress(prevStep, totalSteps); 
      }
      // For step 5, don't update progress here
    }
  };

  // Reset phase function
  const resetPhase = () => {
    // Only reset if not already completed
    if (currentPhaseStatus !== "completed") {
      setActiveStep(1);
      onUpdateProgress(0, totalSteps);
      localStorage.removeItem('scopingActiveStep');
      localStorage.removeItem('scopingFinalDecision');
      localStorage.removeItem('selectedUseCase');
      localStorage.removeItem('selectedDataset');
      setSelectedUseCase(null);
      setSelectedDataset(null);
      setReadyToAdvance(null);
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
    
    // Clean up localStorage when phase is completed
    localStorage.removeItem('scopingActiveStep');
    localStorage.removeItem('scopingFinalDecision');
    
    // Call the phase completion handler
    onCompletePhase();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Scoping Phase</h1>
        <p className="text-muted-foreground">
          Define and validate the AI approach for your project. Explore use cases, assess feasibility, and ensure data suitability.
        </p>
        
        <div className="mt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={currentPhaseStatus === "completed" ? 100 : (activeStep / totalSteps) * 100} className="h-2" />
            </div>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {currentPhaseStatus === "completed" ? 
                `${totalSteps}/${totalSteps}` : 
                `Step ${activeStep} of ${totalSteps}`}
            </div>
          </div>
        </div>
      </div>
      
      {activeStep === 1 && (
        <UseCaseExplorer
          useCases={useCases}
          loadingUseCases={loadingUseCases}
          selectedUseCase={selectedUseCase}
          handleSelectUseCase={handleSelectUseCase}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {activeStep === 2 && (
        <FeasibilityForm
          constraints={constraints}
          handleConstraintUpdate={handleConstraintUpdate}
          feasibilityScore={feasibilityScore}
          feasibilityRisk={feasibilityRisk}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {activeStep === 3 && (
        <DatasetDiscovery
          datasets={datasets}
          filteredDatasets={filteredDatasets}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedDataset={selectedDataset}
          previewDataset={previewDataset}
          loadingDatasets={loadingDatasets}
          handleSearch={handleSearch}
          handleCategorySelect={handleCategorySelect}
          handleSelectDataset={handleSelectDataset}
          handlePreviewDataset={handlePreviewDataset}
          setPreviewDataset={setPreviewDataset}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {activeStep === 4 && (
        <SuitabilityChecklist
          suitabilityChecks={suitabilityChecks}
          handleSuitabilityUpdate={handleSuitabilityUpdate}
          suitabilityScore={suitabilityScore}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {activeStep === 5 && (
        <FinalFeasibilityGate
          selectedUseCase={selectedUseCase}
          selectedDataset={selectedDataset}
          constraints={constraints}
          feasibilityScore={feasibilityScore}
          feasibilityRisk={feasibilityRisk}
          suitabilityChecks={suitabilityChecks}
          suitabilityScore={suitabilityScore}
          readyToAdvance={readyToAdvance}
          setReadyToAdvance={setReadyToAdvance}
          moveToPreviousStep={moveToPreviousStep}
          handleCompletePhase={handleCompletePhase}
          updatePhaseStatus={updatePhaseStatus}
          resetPhase={resetPhase}
        />
      )}
    </div>
  );
};

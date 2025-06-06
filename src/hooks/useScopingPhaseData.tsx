
import { useState, useEffect } from "react";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";
import { scopingApi, ApiUseCase, ApiDataset } from "@/lib/scoping-api";
import { toast } from "sonner";

export const useScopingPhaseData = () => {
  // State for UI
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loadingUseCases, setLoadingUseCases] = useState(true);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  
  // Derived state
  const [feasibilityScore, setFeasibilityScore] = useState<number>(0);
  const [feasibilityRisk, setFeasibilityRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [suitabilityScore, setSuitabilityScore] = useState<number>(0);

  const { constraints, suitabilityChecks, selectedUseCase } = useProject();

  // Convert API use case to internal format
  const convertApiUseCase = (apiUseCase: ApiUseCase): UseCase => ({
    id: apiUseCase.id,
    title: apiUseCase.title,
    description: apiUseCase.description,
    tags: [apiUseCase.category, apiUseCase.complexity],
    selected: false
  });

  // Convert API dataset to internal format
  const convertApiDataset = (apiDataset: ApiDataset, index: number): Dataset => ({
    id: `api_${index}`,
    title: apiDataset.name,
    source: apiDataset.source,
    format: "JSON", // Default since API doesn't specify
    size: "Unknown",
    license: "Check source",
    description: apiDataset.description,
    columns: apiDataset.data_types,
    sampleRows: [] // API doesn't provide sample data
  });

  // Initialize use cases from API
  useEffect(() => {
    const loadUseCases = async () => {
      try {
        // For now, use a default project ID - in real app this would come from context
        const projectId = "default";
        const apiUseCases = await scopingApi.getUseCases(projectId);
        const convertedUseCases = apiUseCases.map(convertApiUseCase);
        setUseCases(convertedUseCases);
      } catch (error) {
        console.error("Failed to load use cases from API:", error);
        toast.error("Failed to load use cases. Using fallback data.");
        
        // Fallback to mock data
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
      } finally {
        setLoadingUseCases(false);
      }
    };

    loadUseCases();
  }, []);

  // Load datasets when a use case is selected
  useEffect(() => {
    const loadDatasets = async () => {
      if (!selectedUseCase) return;

      setLoadingDatasets(true);
      try {
        const projectId = "default";
        const apiDatasets = await scopingApi.getRecommendedDatasets(projectId, selectedUseCase.id);
        const convertedDatasets = apiDatasets.map(convertApiDataset);
        setDatasets(convertedDatasets);
        setFilteredDatasets(convertedDatasets);
      } catch (error) {
        console.error("Failed to load datasets from API:", error);
        toast.error("Failed to load recommended datasets. Using fallback data.");
        
        // Fallback to mock data
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
          }
        ];
        setDatasets(mockDatasets);
        setFilteredDatasets(mockDatasets);
      } finally {
        setLoadingDatasets(false);
      }
    };

    loadDatasets();
  }, [selectedUseCase]);

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

  // Dataset filtering functions
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterDatasets(term, selectedCategory);
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterDatasets(searchTerm, category);
  };
  
  // Dataset preview handler
  const handlePreviewDataset = (dataset: Dataset) => {
    setPreviewDataset(dataset);
  };

  // Use case selection handler
  const handleSelectUseCase = (useCase: UseCase, setSelectedUseCase: (useCase: UseCase | null) => void) => {
    setSelectedUseCase(useCase);
    setUseCases(prevUseCases => 
      prevUseCases.map(uc => ({
        ...uc,
        selected: uc.id === useCase.id
      }))
    );
  };

  return {
    // Data
    useCases,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    previewDataset,
    
    // Loading states
    loadingUseCases,
    loadingDatasets,
    
    // Derived data
    feasibilityScore,
    feasibilityRisk,
    suitabilityScore,
    
    // Handler functions
    handleSearch,
    handleCategorySelect,
    handlePreviewDataset,
    setPreviewDataset,
    handleSelectUseCase,
    filterDatasets
  };
};

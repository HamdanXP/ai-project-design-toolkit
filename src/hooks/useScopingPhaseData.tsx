import { useState, useEffect } from "react";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";
import { scopingApi, ApiUseCase, ApiDataset } from "@/lib/scoping-api";

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
  const convertApiDataset = (apiDataset: ApiDataset): Dataset => ({
    id: apiDataset.name.toLowerCase().replace(/\s+/g, '_'),
    title: apiDataset.name,
    source: apiDataset.source,
    format: "JSON", // Default format
    size: "Unknown",
    license: "Various",
    description: apiDataset.description,
    columns: apiDataset.data_types,
    sampleRows: []
  });

  // Load use cases from API
  useEffect(() => {
    const loadUseCases = async () => {
      setLoadingUseCases(true);
      try {
        const apiUseCases = await scopingApi.getUseCases('current');
        const convertedUseCases = apiUseCases.map(convertApiUseCase);
        setUseCases(convertedUseCases);
      } catch (error) {
        console.error('Failed to load use cases:', error);
        // Fallback to existing mock data
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

  // Load datasets when use case is selected
  useEffect(() => {
    const loadDatasets = async () => {
      if (!selectedUseCase) return;
      
      setLoadingDatasets(true);
      try {
        const apiDatasets = await scopingApi.getRecommendedDatasets('current', selectedUseCase.id);
        const convertedDatasets = apiDatasets.map(convertApiDataset);
        setDatasets(convertedDatasets);
        setFilteredDatasets(convertedDatasets);
      } catch (error) {
        console.error('Failed to load datasets:', error);
        // Keep existing fallback data
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
    
    if (term) {
      filtered = filtered.filter(ds => 
        ds.title.toLowerCase().includes(term.toLowerCase()) || 
        ds.description.toLowerCase().includes(term.toLowerCase())
      );
    }
    
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
  
  const handlePreviewDataset = (dataset: Dataset) => {
    setPreviewDataset(dataset);
  };

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

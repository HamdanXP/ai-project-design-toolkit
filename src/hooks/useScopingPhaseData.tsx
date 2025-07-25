import { useState, useEffect } from "react";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";
import { scopingApi, convertApiUseCase, convertApiDataset } from "@/lib/scoping-api";

export const useScopingPhaseData = () => {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loadingUseCases, setLoadingUseCases] = useState(false);
  const [errorUseCases, setErrorUseCases] = useState<string | null>(null);
  const [noUseCasesFound, setNoUseCasesFound] = useState(false);
  const [hasSearchedUseCases, setHasSearchedUseCases] = useState(false);
  
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [filteredDatasets, setFilteredDatasets] = useState<Dataset[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [noDatasets, setNoDatasets] = useState(false);
  const [hasSearchedDatasets, setHasSearchedDatasets] = useState(false);
  
  const [suitabilityScore, setSuitabilityScore] = useState<number>(0);

  const { 
    suitabilityChecks, 
    selectedUseCase,
    setSelectedUseCase,
    setSelectedDataset,
    scopingActiveStep,
    technicalInfrastructure, // Get from context
    infrastructureAssessment // Get from context
  } = useProject();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  const loadUseCases = async () => {
    setLoadingUseCases(true);
    setErrorUseCases(null);
    setNoUseCasesFound(false);
    setHasSearchedUseCases(true);
    
    try {
      console.log('Loading AI-focused use cases with infrastructure context...');
      
      // Use the technical infrastructure from context
      const apiUseCases = await scopingApi.getUseCases(projectId, technicalInfrastructure);
      
      if (!Array.isArray(apiUseCases)) {
        throw new Error('Invalid use cases data format');
      }
      
      if (apiUseCases.length === 0) {
        console.log('No AI use cases found from search');
        setUseCases([]);
        setNoUseCasesFound(true);
        setErrorUseCases(null);
        return;
      }
      
      const convertedUseCases = apiUseCases.map(convertApiUseCase);
      console.log(`Converted ${convertedUseCases.length} AI use cases successfully`);
      
      const validUseCases = convertedUseCases.filter(uc => 
        uc.title && 
        uc.title !== 'Use Case' && 
        uc.description && 
        uc.description !== 'Description not available'
      );
      
      if (validUseCases.length === 0) {
        console.log('No valid use cases after conversion');
        setUseCases([]);
        setNoUseCasesFound(true);
        setErrorUseCases(null);
        return;
      }
      
      setUseCases(validUseCases);
      setNoUseCasesFound(false);
      setErrorUseCases(null);
      
    } catch (error) {
      console.error('Failed to load AI use cases:', error);
      
      setUseCases([]);
      setNoUseCasesFound(false);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrorUseCases('Unable to connect to search services. Please check your connection and try again.');
      } else {
        setErrorUseCases(error instanceof Error ? error.message : 'Unknown error occurred while searching');
      }
      
    } finally {
      setLoadingUseCases(false);
    }
  };

  const loadDatasets = async () => {
    if (!selectedUseCase) {
      setDatasets([]);
      setFilteredDatasets([]);
      setNoDatasets(false);
      return;
    }
    
    setLoadingDatasets(true);
    setNoDatasets(false);
    setHasSearchedDatasets(true);
    
    try {
      console.log(`Loading datasets for use case: ${selectedUseCase.title}`);
      
      const apiDatasets = await scopingApi.getRecommendedDatasets(
        projectId, 
        selectedUseCase.id,
        selectedUseCase.title,
        selectedUseCase.description
      );
      
      if (!Array.isArray(apiDatasets) || apiDatasets.length === 0) {
        console.log('No datasets found from humanitarian sources');
        setDatasets([]);
        setFilteredDatasets([]);
        setNoDatasets(true);
        return;
      }
      
      const convertedDatasets = apiDatasets.map(convertApiDataset);
      setDatasets(convertedDatasets);
      setFilteredDatasets(convertedDatasets);
      setNoDatasets(false);
      console.log(`Loaded ${convertedDatasets.length} datasets from humanitarian sources`);
      
    } catch (error) {
      console.error('Failed to load datasets:', error);
      setDatasets([]);
      setFilteredDatasets([]);
      setNoDatasets(true);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    if (selectedUseCase && scopingActiveStep === 3) {
      loadDatasets();
    } else {
      setDatasets([]);
      setFilteredDatasets([]);
      setNoDatasets(false);
      setHasSearchedDatasets(false);
    }
  }, [selectedUseCase, scopingActiveStep, projectId]);

  useEffect(() => {
    const calculateHumanitarianSuitabilityScore = () => {
      const weights = {
        privacy_ethics: 0.35,
        population_representativeness: 0.30,
        data_completeness: 0.20,
        quality_sufficiency: 0.15
      };
      
      const calculateQuestionScore = (questionId: string, answer: string): number => {
        switch (questionId) {
          case 'privacy_ethics':
          case 'privacy':
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.4;
            return 0.0;
            
          case 'population_representativeness':
          case 'representativeness':
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.6;
            return 0.2;
            
          case 'data_completeness':
          case 'completeness':
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.7;
            return 0.3;
            
          case 'quality_sufficiency':
          case 'sufficiency':
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.6;
            return 0.2;
            
          default:
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.5;
            return 0.0;
        }
      };
      
      let weightedScore = 0;
      let totalWeight = 0;
      
      const idMapping = {
        'completeness': 'data_completeness',
        'representativeness': 'population_representativeness', 
        'privacy': 'privacy_ethics',
        'sufficiency': 'quality_sufficiency'
      };
      
      Object.entries(weights).forEach(([newId, weight]) => {
        const oldId = Object.keys(idMapping).find(key => idMapping[key] === newId);
        const check = suitabilityChecks.find(c => c.id === newId || c.id === oldId);
        
        if (check) {
          const score = calculateQuestionScore(newId, check.answer);
          weightedScore += score * weight;
          totalWeight += weight;
        }
      });
      
      return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
    };
    
    const newScore = calculateHumanitarianSuitabilityScore();
    setSuitabilityScore(newScore);
  }, [suitabilityChecks]);

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

  const handleSelectUseCase = (useCase: UseCase | null, setSelectedUseCaseFunc: (useCase: UseCase | null) => void) => {
    setSelectedUseCaseFunc(useCase);
    setUseCases(prevUseCases => 
      prevUseCases.map(uc => ({
        ...uc,
        selected: useCase ? uc.id === useCase.id : false
      }))
    );

    if (projectId) {
      const selectionData = {
        selected_use_case: useCase,
        available_use_cases: useCases,
        timestamp: new Date().toISOString(),
        reasoning: useCase ? `Selected ${useCase.title} for project goals` : 'Unselected use case'
      };
      
      console.log('Storing use case selection:', selectionData);
    }
  };

  const handleSelectDataset = (dataset: Dataset) => {
    setSelectedDataset(dataset);

    if (projectId) {
      const datasetData = {
        selected_dataset: dataset,
        available_datasets: datasets,
        timestamp: new Date().toISOString()
      };      
      console.log('Storing dataset selection:', datasetData);
    }
  };

  const handleContinueWithoutUseCase = () => {
    setSelectedUseCase({
      id: "no_use_case_selected",
      title: "Proceeding without specific use case",
      description: "Continuing with general AI principles and custom solution development",
      tags: ["Custom Solution"],
      selected: true,
      type: "custom",
      category: "General"
    });
    
    if (projectId) {
      const selectionData = {
        selected_use_case: null,
        available_use_cases: useCases,
        timestamp: new Date().toISOString(),
        reasoning: "User chose to proceed without selecting a specific use case - will develop custom AI solution"
      };
      
      console.log('Storing no use case selection:', selectionData);
    }
  };

  const handleRetryUseCases = () => {
    setErrorUseCases(null);
    setNoUseCasesFound(false);
    setUseCases([]);
    loadUseCases();
  };

  const handleRetryDatasets = () => {
    setNoDatasets(false);
    setDatasets([]);
    setFilteredDatasets([]);
    loadDatasets();
  };

  return {
    useCases,
    errorUseCases,
    noUseCasesFound,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    noDatasets,
    
    loadingUseCases,
    loadingDatasets,
    
    suitabilityScore,
    
    handleSearch,
    handleCategorySelect,
    handleSelectUseCase,
    handleSelectDataset,
    handleContinueWithoutUseCase,
    handleRetryUseCases,
    handleRetryDatasets,
    filterDatasets,
    
    loadUseCases,
    loadDatasets
  };
};
import { useState, useEffect } from "react";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";
import { scopingApi, convertApiUseCase, convertApiDataset } from "@/lib/scoping-api";

export const useScopingPhaseData = () => {
  // State for UI
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
  
  // Derived state
  const [feasibilityScore, setFeasibilityScore] = useState<number>(0);
  const [feasibilityLevel, setFeasibilityLevel] = useState<'high' | 'medium' | 'low'>('medium'); // Changed from feasibilityRisk
  const [suitabilityScore, setSuitabilityScore] = useState<number>(0);

  const { 
    constraints, 
    suitabilityChecks, 
    selectedUseCase,
    setSelectedUseCase,
    setSelectedDataset,
    scopingActiveStep
  } = useProject();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  // Manual function to load use cases
  const loadUseCases = async () => {
    setLoadingUseCases(true);
    setErrorUseCases(null);
    setNoUseCasesFound(false);
    setHasSearchedUseCases(true);
    
    try {
      console.log('Loading AI-focused use cases...');
      const apiUseCases = await scopingApi.getUseCases(projectId);
      
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

  // Manual function to load datasets
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

  // Load datasets when use case is selected AND we're on step 3
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

  // Enhanced feasibility calculation with debugging
  useEffect(() => {
    console.log('=== FEASIBILITY CALCULATION START ===');
    console.log('Current constraints:', constraints);
    
    let score = 0;
    
    // Helper function to find constraint value
    const getConstraintValue = (id: string): string | boolean | undefined => {
      const constraint = constraints.find(c => c.id === id);
      const value = constraint?.value;
      console.log(`Constraint ${id}:`, value);
      return value;
    };
    
    // ORGANIZATIONAL FACTORS (50% total)
    
    // Stakeholder Support (25%) - Most critical factor
    const stakeholderSupport = getConstraintValue("stakeholder-support");
    let stakeholderScore = 0;
    if (stakeholderSupport === "champion") stakeholderScore = 25;
    else if (stakeholderSupport === "high") stakeholderScore = 22;
    else if (stakeholderSupport === "moderate") stakeholderScore = 15;
    else stakeholderScore = 8; // Even low support gets some points
    score += stakeholderScore;
    console.log(`Stakeholder support score: ${stakeholderScore}`);
    
    // Budget (20%) - Important but not everything
    const budget = getConstraintValue("budget");
    let budgetScore = 0;
    if (budget === "unlimited") budgetScore = 20;
    else if (budget === "substantial") budgetScore = 18;
    else if (budget === "moderate") budgetScore = 14;
    else budgetScore = 10; // Limited budget can work with smart planning
    score += budgetScore;
    console.log(`Budget score: ${budgetScore}`);
    
    // Sustainability Planning (5%)
    const sustainability = getConstraintValue("sustainability");
    let sustainabilityScore = 0;
    if (sustainability === true) sustainabilityScore = 5;
    else sustainabilityScore = 2;
    score += sustainabilityScore;
    console.log(`Sustainability score: ${sustainabilityScore}`);
    
    // PRACTICAL CONSTRAINTS (30% total)
    
    // Infrastructure & Connectivity (15%) - Critical in humanitarian contexts
    const internet = getConstraintValue("internet");
    const infrastructure = getConstraintValue("infrastructure");
    const compute = getConstraintValue("compute");
    
    let infraScore = 0;
    if (internet === true && infrastructure === true && (compute === "cloud" || compute === "hybrid" || compute === "enterprise")) {
      infraScore = 15; // Excellent setup
    } else if (internet === true && (infrastructure === true || compute === "cloud" || compute === "enterprise")) {
      infraScore = 12; // Good enough for most projects
    } else if (internet === true || infrastructure === true) {
      infraScore = 9;  // Workable with planning
    } else {
      infraScore = 5;  // Major constraint but not impossible
    }
    score += infraScore;
    console.log(`Infrastructure score: ${infraScore}`);
    
    // Timeline (10%) - More flexible than previously thought
    const time = getConstraintValue("time");
    let timeScore = 0;
    if (time === "ongoing" || time === "long-term") timeScore = 10;
    else if (time === "medium-term") timeScore = 8;
    else timeScore = 6; // Short timeline just means smaller scope
    score += timeScore;
    console.log(`Time score: ${timeScore}`);
    
    // Regulatory Compliance (5%)
    const regulatory = getConstraintValue("regulatory-compliance");
    let regulatoryScore = 0;
    if (regulatory === "minimal") regulatoryScore = 5;
    else if (regulatory === "moderate") regulatoryScore = 4;
    else regulatoryScore = 2;
    score += regulatoryScore;
    console.log(`Regulatory score: ${regulatoryScore}`);
    
    // CAPABILITY FACTORS (20% total)
    
    // Learning Willingness (10%) - More important than current skills
    const learningCapacity = getConstraintValue("learning-capacity");
    let learningScore = 0;
    if (learningCapacity === true) learningScore = 10;
    else learningScore = 5; // Everyone can learn
    score += learningScore;
    console.log(`Learning score: ${learningScore}`);
    
    // Team Size & Support (5%)
    const teamSize = getConstraintValue("team-size");
    let teamScore = 0;
    if (teamSize === "large" || teamSize === "medium") teamScore = 5;
    else if (teamSize === "small") teamScore = 4;
    else teamScore = 3; // Individual projects can work too
    score += teamScore;
    console.log(`Team size score: ${teamScore}`);
    
    // Current Experience (5%) - Lowest weight since toolkit helps with this
    const aiExp = getConstraintValue("ai-experience");
    const techSkills = getConstraintValue("technical-skills");
    
    let experienceScore = 0;
    if (aiExp === "advanced" || techSkills === "excellent") experienceScore = 5;
    else if (aiExp === "intermediate" || techSkills === "good") experienceScore = 4;
    else if (aiExp === "beginner" || techSkills === "moderate") experienceScore = 3;
    else experienceScore = 2; // Base score - everyone starts somewhere!
    score += experienceScore;
    console.log(`Experience score: ${experienceScore}`);
    
    const finalScore = Math.min(Math.round(score), 100);
    console.log(`Total calculated score: ${score}, final score: ${finalScore}`);
    
    // More encouraging feasibility levels
    let level: 'high' | 'medium' | 'low' = 'medium';
    if (finalScore >= 70) level = 'high';    // High feasibility
    else if (finalScore >= 50) level = 'medium'; // Medium feasibility
    else level = 'low'; // Low feasibility
    
    console.log(`Feasibility level: ${level}`);
    console.log('=== FEASIBILITY CALCULATION END ===');
    
    setFeasibilityScore(finalScore);
    setFeasibilityLevel(level); // Changed from setFeasibilityRisk
  }, [constraints]);

  // Humanitarian-focused suitability calculation
  useEffect(() => {
    const calculateHumanitarianSuitabilityScore = () => {
      // Humanitarian-focused weights
      const weights = {
        privacy_ethics: 0.35,           // 35% - Safety and ethics first
        population_representativeness: 0.30,  // 30% - Core to humanitarian impact  
        data_completeness: 0.20,        // 20% - Important but manageable
        quality_sufficiency: 0.15       // 15% - Often workable
      };
      
      // Context-aware scoring
      const calculateQuestionScore = (questionId: string, answer: string): number => {
        switch (questionId) {
          case 'privacy_ethics':
          case 'privacy':
            if (answer === 'yes') return 1.0;    // Privacy Safe
            if (answer === 'unknown') return 0.4; // Need Review - concerning
            return 0.0;                           // High Risk - unacceptable
            
          case 'population_representativeness':
          case 'representativeness':
            if (answer === 'yes') return 1.0;    // Representative
            if (answer === 'unknown') return 0.6; // Partially - workable
            return 0.2;                           // Limited Coverage - major issue
            
          case 'data_completeness':
          case 'completeness':
            if (answer === 'yes') return 1.0;    // Looks Clean
            if (answer === 'unknown') return 0.7; // Some Issues - common and fixable
            return 0.3;                           // Many Problems - significant work
            
          case 'quality_sufficiency':
          case 'sufficiency':
            if (answer === 'yes') return 1.0;    // Sufficient
            if (answer === 'unknown') return 0.6; // Borderline - might work
            return 0.2;                           // Insufficient - need alternatives
            
          default:
            if (answer === 'yes') return 1.0;
            if (answer === 'unknown') return 0.5;
            return 0.0;
        }
      };
      
      let weightedScore = 0;
      let totalWeight = 0;
      
      // Map old IDs to new IDs for backwards compatibility
      const idMapping = {
        'completeness': 'data_completeness',
        'representativeness': 'population_representativeness', 
        'privacy': 'privacy_ethics',
        'sufficiency': 'quality_sufficiency'
      };
      
      // Calculate weighted score for each component
      Object.entries(weights).forEach(([newId, weight]) => {
        // Find check by new ID or old ID
        const oldId = Object.keys(idMapping).find(key => idMapping[key] === newId);
        const check = suitabilityChecks.find(c => c.id === newId || c.id === oldId);
        
        if (check) {
          const score = calculateQuestionScore(newId, check.answer);
          weightedScore += score * weight;
          totalWeight += weight;
        }
      });
      
      // Convert to percentage
      return totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
    };
    
    const newScore = calculateHumanitarianSuitabilityScore();
    setSuitabilityScore(newScore);
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

  // Enhanced use case selection with storage and unselection support
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

  // Enhanced dataset selection with storage
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

  // Continue without use case
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

  // Fixed retry function for use cases
  const handleRetryUseCases = () => {
    setErrorUseCases(null);
    setNoUseCasesFound(false);
    setUseCases([]);
    loadUseCases();
  };

  // Retry function for datasets
  const handleRetryDatasets = () => {
    setNoDatasets(false);
    setDatasets([]);
    setFilteredDatasets([]);
    loadDatasets();
  };

  return {
    // Data
    useCases,
    errorUseCases,
    noUseCasesFound,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    noDatasets,
    
    // Loading states
    loadingUseCases,
    loadingDatasets,
    
    // Derived data
    feasibilityScore,
    feasibilityLevel, // Changed from feasibilityRisk
    suitabilityScore,
    
    // Handler functions
    handleSearch,
    handleCategorySelect,
    handleSelectUseCase,
    handleSelectDataset,
    handleContinueWithoutUseCase,
    handleRetryUseCases,
    handleRetryDatasets,
    filterDatasets,
    
    // Manual trigger functions
    loadUseCases,
    loadDatasets
  };
};
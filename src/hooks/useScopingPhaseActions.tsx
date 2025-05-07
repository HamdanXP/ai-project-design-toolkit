
import { UseCase, Dataset } from "@/types/scoping-phase";

type ScopingPhaseActionsProps = {
  setUseCases: React.Dispatch<React.SetStateAction<UseCase[]>>;
  setSelectedUseCase: React.Dispatch<React.SetStateAction<UseCase | null>>;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setFilteredDatasets: React.Dispatch<React.SetStateAction<Dataset[]>>;
  setSelectedDataset: React.Dispatch<React.SetStateAction<Dataset | null>>;
  setPreviewDataset: React.Dispatch<React.SetStateAction<Dataset | null>>;
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  handleSuitabilityUpdate: (id: string, answer: 'yes' | 'no' | 'unknown') => void;
  datasets: Dataset[];
  toast: any;
};

export const useScopingPhaseActions = ({
  setUseCases,
  setSelectedUseCase,
  setActiveStep,
  setSearchTerm,
  setSelectedCategory,
  setFilteredDatasets,
  setSelectedDataset,
  setPreviewDataset,
  handleConstraintUpdate,
  handleSuitabilityUpdate,
  datasets,
  toast
}: ScopingPhaseActionsProps) => {
  // Handle step navigation
  const moveToNextStep = () => {
    setActiveStep(prev => prev + 1);
  };
  
  const moveToPreviousStep = () => {
    setActiveStep(prev => prev - 1);
  };

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
    filterDatasets(term, "");
  };
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    filterDatasets("", category);
  };
  
  const filterDatasets = (term: string, category: string) => {
    let filtered = datasets;
    
    // Use actual term/category or the stateful values
    const searchTermToUse = term !== undefined ? term : "";
    const categoryToUse = category !== undefined ? category : "";
    
    // Filter by search term
    if (searchTermToUse) {
      filtered = filtered.filter(ds => 
        ds.title.toLowerCase().includes(searchTermToUse.toLowerCase()) || 
        ds.description.toLowerCase().includes(searchTermToUse.toLowerCase())
      );
    }
    
    // Filter by category
    if (categoryToUse) {
      filtered = filtered.filter(ds => ds.title.toLowerCase().includes(categoryToUse.toLowerCase()));
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

  return {
    moveToNextStep,
    moveToPreviousStep,
    handleSelectUseCase,
    handleSearch,
    handleCategorySelect,
    handleSelectDataset,
    handlePreviewDataset
  };
};

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { UseCaseGrid } from "./use-case/UseCaseGrid";
import { NoUseCasesFound } from "./use-case/NoUseCasesFound";

type UseCaseExplorerProps = {
  useCases: UseCase[];
  loadingUseCases: boolean;
  errorUseCases: string | null;
  noUseCasesFound: boolean;
  selectedUseCase: UseCase | null;
  handleSelectUseCase: (useCase: UseCase | null) => void; // Modified to handle null
  moveToNextStep: () => void;
  onRetrySearch?: () => void;
  onContinueWithoutUseCase?: () => void;
  domain?: string;
  onTriggerSearch?: () => void;
  hasSearchedUseCases?: boolean;
};

export const UseCaseExplorer = ({
  useCases,
  loadingUseCases,
  errorUseCases,
  noUseCasesFound,
  selectedUseCase,
  handleSelectUseCase,
  moveToNextStep,
  onRetrySearch,
  onContinueWithoutUseCase,
  domain = "your domain",
  onTriggerSearch,
  hasSearchedUseCases = false
}: UseCaseExplorerProps) => {
  
  // Show search trigger if search hasn't been initiated yet
  const showSearchTrigger = !hasSearchedUseCases && !loadingUseCases && useCases.length === 0 && !errorUseCases;
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={1} title="AI Use Case Explorer" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Explore different AI approaches that could help address your problem. 
          Select one that best aligns with your project goals, or proceed without one.
        </p>
        
        {/* Show search trigger button */}
        {showSearchTrigger && onTriggerSearch && (
          <div className="text-center py-12">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Ready to explore AI use cases?</h3>
              <p className="text-muted-foreground mb-6">
                We'll search academic papers, humanitarian reports, and datasets to find relevant AI solutions for your project.
              </p>
            </div>
            <Button onClick={onTriggerSearch} size="lg" className="px-8">
              <RefreshCw className="mr-2 h-4 w-4" />
              Search for AI Use Cases
            </Button>
          </div>
        )}
        
        {/* Show loading state - same as NoUseCasesFound when retrying */}
        {loadingUseCases && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground">Searching for AI use cases...</span>
          </div>
        )}
        
        {/* Show error state */}
        {errorUseCases && !loadingUseCases && (
          <NoUseCasesFound 
            domain={domain}
            onRetry={onRetrySearch}
            onContinueWithoutUseCase={onContinueWithoutUseCase}
            isRetrying={loadingUseCases}
            hasError={true} // Pass error state
          />
        )}
        
        {/* Show no results found - consistent with error handling */}
        {noUseCasesFound && !loadingUseCases && !errorUseCases && (
          <NoUseCasesFound 
            domain={domain}
            onRetry={onRetrySearch}
            onContinueWithoutUseCase={onContinueWithoutUseCase}
            isRetrying={loadingUseCases}
            hasError={false} // No error, just no results
          />
        )}
        
        {/* Show use cases grid */}
        {!loadingUseCases && !errorUseCases && !noUseCasesFound && useCases.length > 0 && (
          <UseCaseGrid 
            useCases={useCases} 
            selectedUseCase={selectedUseCase} 
            loadingUseCases={loadingUseCases}
            handleSelectUseCase={handleSelectUseCase}
          />
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {!loadingUseCases && !errorUseCases && hasSearchedUseCases && (
            <>
              {noUseCasesFound ? (
                "No specific use cases found - you can continue without one"
              ) : (
                `Found ${useCases.length} AI use case${useCases.length !== 1 ? 's' : ''}`
              )}
            </>
          )}
          {showSearchTrigger && (
            "Click above to start searching for relevant AI use cases"
          )}
        </div>
        
        <Button 
          onClick={moveToNextStep} 
          disabled={false} // Always enabled - can proceed with or without selection
          variant={noUseCasesFound || showSearchTrigger || errorUseCases ? "outline" : "default"}
        >
          {noUseCasesFound || errorUseCases ? "Continue Without Use Case" : 
           showSearchTrigger ? "Skip to Feasibility" : "Next Step"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
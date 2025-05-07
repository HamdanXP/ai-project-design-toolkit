
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { UseCaseGrid } from "./use-case/UseCaseGrid";

type UseCaseExplorerProps = {
  useCases: UseCase[];
  loadingUseCases: boolean;
  selectedUseCase: UseCase | null;
  handleSelectUseCase: (useCase: UseCase) => void;
  moveToNextStep: () => void;
};

export const UseCaseExplorer = ({
  useCases,
  loadingUseCases,
  selectedUseCase,
  handleSelectUseCase,
  moveToNextStep,
}: UseCaseExplorerProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={1} title="AI Use Case Explorer" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Explore different AI approaches that could help address your problem. 
          Select one that best aligns with your project goals.
        </p>
        
        <UseCaseGrid 
          useCases={useCases} 
          selectedUseCase={selectedUseCase} 
          loadingUseCases={loadingUseCases}
          handleSelectUseCase={handleSelectUseCase}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={moveToNextStep} disabled={!selectedUseCase}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

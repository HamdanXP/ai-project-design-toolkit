
import { UseCase } from "@/types/scoping-phase";
import { UseCaseCard } from "./UseCaseCard";
import { UseCaseCardSkeleton } from "./UseCaseCardSkeleton";

interface UseCaseGridProps {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  loadingUseCases: boolean;
  handleSelectUseCase: (useCase: UseCase) => void;
}

export const UseCaseGrid = ({ 
  useCases, 
  selectedUseCase, 
  loadingUseCases, 
  handleSelectUseCase 
}: UseCaseGridProps) => {
  if (loadingUseCases) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <UseCaseCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {useCases.map(useCase => (
        <UseCaseCard 
          key={useCase.id}
          useCase={useCase}
          isSelected={selectedUseCase?.id === useCase.id}
          onSelect={handleSelectUseCase}
        />
      ))}
    </div>
  );
};

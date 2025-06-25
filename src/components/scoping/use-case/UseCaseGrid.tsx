import { useState, useEffect } from "react";
import { UseCase } from "@/types/scoping-phase";
import { UseCaseCard } from "./UseCaseCard";
import { UseCaseCardSkeleton } from "./UseCaseCardSkeleton";
import { useIsMobile } from "@/hooks/useMobile";

interface UseCaseGridProps {
  useCases: UseCase[];
  selectedUseCase: UseCase | null;
  loadingUseCases: boolean;
  handleSelectUseCase: (useCase: UseCase | null) => void; // Modified to handle null
}

export const UseCaseGrid = ({ 
  useCases, 
  selectedUseCase, 
  loadingUseCases, 
  handleSelectUseCase 
}: UseCaseGridProps) => {
  const isMobile = useIsMobile();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Reset expanded cards when selected use case changes
  useEffect(() => {
    setExpandedCards({});
  }, [selectedUseCase]);

  // Handle card expansion toggle
  const handleToggleExpand = (id: string, isExpanded: boolean) => {
    if (isMobile) {
      // On mobile, only allow one card to be expanded at a time
      setExpandedCards(isExpanded ? { [id]: true } : {});
    } else {
      // On desktop, allow multiple cards to be expanded
      setExpandedCards(prev => ({
        ...prev,
        [id]: isExpanded
      }));
    }
  };

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
          onSelect={handleSelectUseCase} // Pass the updated handler
          isExpanded={!!expandedCards[useCase.id]}
          onToggleExpand={handleToggleExpand}
        />
      ))}
    </div>
  );
};
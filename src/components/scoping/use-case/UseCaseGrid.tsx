
import { UseCase } from "@/types/scoping-phase";
import { UseCaseCard } from "./UseCaseCard";
import { UseCaseCardSkeleton } from "./UseCaseCardSkeleton";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  // State to track which cards are expanded
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const isMobile = useIsMobile();

  // Handle toggling card expansion
  const handleCardExpand = (id: string) => {
    if (isMobile) {
      // On mobile, only allow one card to be expanded at a time
      setExpandedCards(expandedCards.includes(id) ? [] : [id]);
    } else {
      // On desktop, allow multiple cards to be expanded
      setExpandedCards(prev => 
        prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
      );
    }
  };

  // When a card is selected, collapse all expanded cards
  useEffect(() => {
    if (selectedUseCase) {
      setExpandedCards([]);
    }
  }, [selectedUseCase]);

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
          isExpanded={expandedCards.includes(useCase.id)}
          onSelect={handleSelectUseCase}
          onExpand={handleCardExpand}
        />
      ))}
    </div>
  );
};

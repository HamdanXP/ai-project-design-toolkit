
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";

interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  onSelect: (useCase: UseCase) => void;
}

export const UseCaseCard = ({ useCase, isSelected, onSelect }: UseCaseCardProps) => {
  return (
    <Card 
      className={`border cursor-pointer transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
      onClick={() => onSelect(useCase)}
    >
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-2">{useCase.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">{useCase.description}</p>
        <div className="flex flex-wrap gap-2">
          {useCase.tags.map(tag => (
            <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">
              {tag}
            </div>
          ))}
        </div>
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm"
          className="mt-3"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(useCase);
          }}
        >
          {isSelected ? <><Check className="h-4 w-4 mr-2" /> Selected</> : "Select Use Case"}
        </Button>
      </CardContent>
    </Card>
  );
};

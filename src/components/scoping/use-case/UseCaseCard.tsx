
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Book, Database, Globe } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  onSelect: (useCase: UseCase) => void;
  onExpand?: (id: string) => void;
  isExpanded: boolean;
}

// Map domain tags to appropriate icons
const getDomainIcon = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('agriculture')) return <agriculture className="h-4 w-4" />;
  if (lowerTag.includes('water') || lowerTag.includes('resource')) return <water className="h-4 w-4" />;
  if (lowerTag.includes('health')) return <leaf className="h-4 w-4" />;
  if (lowerTag.includes('climate') || lowerTag.includes('weather')) return <cloud className="h-4 w-4" />;
  return <globe className="h-4 w-4" />;
};

export const UseCaseCard = ({ 
  useCase, 
  isSelected, 
  onSelect,
  onExpand,
  isExpanded 
}: UseCaseCardProps) => {
  const isMobile = useIsMobile();

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand(useCase.id);
    }
  };

  // Additional details for the expanded view
  const detailContent = {
    howItWorks: "This AI approach analyzes historical data patterns and uses machine learning algorithms to identify correlations and make predictions based on similar conditions.",
    inputOutput: {
      inputs: ["Historical weather data", "Geographical information", "Resource usage metrics"],
      outputs: ["Predictive risk maps", "Early warning indicators", "Resource allocation recommendations"]
    },
    realWorldExample: "In East Africa, this approach helped predict water shortages 3 months in advance, allowing NGOs to pre-position resources and reduce affected population by 40%."
  };

  return (
    <Card 
      className={`border transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
      onClick={() => onSelect(useCase)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{useCase.title}</h3>
          <CollapsibleTrigger 
            asChild 
            onClick={handleExpandClick}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3">{useCase.description}</p>
        
        <Collapsible open={isExpanded} className="w-full">
          <CollapsibleContent className="pt-2 pb-3 border-t mt-2">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                  <Book className="h-4 w-4" /> How it works
                </h4>
                <p className="text-sm text-muted-foreground">{detailContent.howItWorks}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                  <Database className="h-4 w-4" /> Data Input & Output
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs font-medium mb-1">Inputs:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {detailContent.inputOutput.inputs.map((input, idx) => (
                        <li key={idx}>{input}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Outputs:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      {detailContent.inputOutput.outputs.map((output, idx) => (
                        <li key={idx}>{output}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm flex items-center gap-1 mb-1">
                  <Globe className="h-4 w-4" /> Real-world Impact
                </h4>
                <p className="text-sm text-muted-foreground">{detailContent.realWorldExample}</p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {useCase.tags.map(tag => (
            <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1">
              {getDomainIcon(tag)}
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

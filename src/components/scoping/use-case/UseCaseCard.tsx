
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Leaf, Droplet, Globe, Cloud } from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  onSelect: (useCase: UseCase) => void;
  isExpanded?: boolean;
  onToggleExpand: (id: string, isExpanded: boolean) => void;
}

export const UseCaseCard = ({ 
  useCase, 
  isSelected, 
  onSelect,
  isExpanded = false,
  onToggleExpand
}: UseCaseCardProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(isExpanded);
  
  // Update local state when parent state changes
  useEffect(() => {
    setOpen(isExpanded);
  }, [isExpanded]);

  // Toggle expansion and notify parent
  const handleToggle = () => {
    const newState = !open;
    setOpen(newState);
    onToggleExpand(useCase.id, newState);
  };

  // Example content for the expanded section
  const getAIExplanation = (type: string) => {
    switch(type) {
      case "Forecasting water shortages":
        return {
          description: "This AI approach uses historical climate data and water usage patterns to predict future shortages in regions at risk.",
          inputOutput: "Inputs: Weather patterns, reservoir levels, population density. Outputs: Risk maps, shortage predictions with timeframes.",
          impact: "In Kenya, this system helped authorities prepare for drought conditions 3 months in advance, reducing water insecurity for 1.2M people."
        };
      case "Disease outbreak prediction":
        return {
          description: "This system analyzes population movement data alongside health reports to identify potential disease hotspots before outbreaks occur.",
          inputOutput: "Inputs: Travel data, health clinic reports, historical outbreak patterns. Outputs: Risk zones, outbreak probability scores.",
          impact: "Used in Southeast Asia to deploy preventive resources, reducing dengue outbreaks by 30% in targeted regions."
        };
      case "Crop yield optimization":
        return {
          description: "This AI model recommends optimal planting strategies by analyzing soil conditions, weather patterns, and crop performance data.",
          inputOutput: "Inputs: Soil samples, weather forecasts, historical yield data. Outputs: Planting schedules, crop selection recommendations.",
          impact: "Helped smallholder farmers in Tanzania increase yields by 22% while reducing water usage by implementing AI-guided farming practices."
        };
      case "Refugee movement patterns":
        return {
          description: "This system predicts refugee movement by analyzing conflict data, migration routes, and resource distribution.",
          inputOutput: "Inputs: Conflict reports, border crossing data, satellite imagery. Outputs: Migration pathway predictions, resource allocation maps.",
          impact: "Enabled humanitarian organizations to preposition supplies and set up reception facilities before large migrations in East Africa."
        };
      case "Food security monitoring":
        return {
          description: "This AI approach tracks food availability and price indicators to identify communities at risk of food insecurity.",
          inputOutput: "Inputs: Market prices, crop forecasts, supply chain disruptions. Outputs: Food security risk assessments, price trend predictions.",
          impact: "Enabled early intervention in South Sudan, preventing severe food shortages for over 50,000 people through timely aid distribution."
        };
      default:
        return {
          description: "This AI solution analyzes data patterns to generate valuable insights and predictions.",
          inputOutput: "Inputs: Domain-specific data. Outputs: Actionable insights and recommendations.",
          impact: "Has demonstrated measurable impact in real-world scenarios through enhanced decision-making capabilities."
        };
    }
  };

  const aiInfo = getAIExplanation(useCase.title);
  
  // Map domains to icons
  const getDomainIcon = (tag: string) => {
    switch(tag.toLowerCase()) {
      case "agriculture":
      case "crop":
        return <Leaf size={16} className="text-green-500" />;
      case "water":
      case "resource management":
        return <Droplet size={16} className="text-blue-500" />;
      case "monitoring":
      case "food security":
        return <Globe size={16} className="text-purple-500" />;
      case "healthcare":
      case "predictive analytics":
        return <Cloud size={16} className="text-sky-500" />;
      default:
        return <Globe size={16} className="text-gray-500" />;
    }
  };

  // When user selects the use case, also close any expanded sections
  const handleSelectUseCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false); // Close expanded content
    onToggleExpand(useCase.id, false); // Notify parent
    onSelect(useCase); // Select the use case
  };

  return (
    <Card 
      className={`border transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{useCase.title}</h3>
          <CollapsibleTrigger 
            onClick={handleToggle} 
            className="p-1 rounded-full hover:bg-secondary/20 transition-colors"
            aria-label={open ? "Collapse details" : "Expand details"}
          >
            {open ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </CollapsibleTrigger>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3">{useCase.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {useCase.tags.map(tag => (
            <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1">
              {getDomainIcon(tag)}
              {tag}
            </div>
          ))}
        </div>
        
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
            <div>
              <h4 className="font-medium text-sm mb-1">How it works:</h4>
              <p className="text-sm text-muted-foreground">{aiInfo.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Example inputs & outputs:</h4>
              <p className="text-sm text-muted-foreground">{aiInfo.inputOutput}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-1">Real-world impact:</h4>
              <p className="text-sm text-muted-foreground">{aiInfo.impact}</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm"
          className="mt-3"
          onClick={handleSelectUseCase}
        >
          {isSelected ? <><Check className="h-4 w-4 mr-2" /> Selected</> : "Select Use Case"}
        </Button>
      </CardContent>
    </Card>
  );
};

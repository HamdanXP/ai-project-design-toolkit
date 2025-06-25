import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Target,
  Lightbulb,
  CheckCircle,
  Database,
  BookOpen,
  FileText,
  Globe,
  Stethoscope,
  GraduationCap,
  Wheat,
  Droplet,
  Home,
  AlertCircle,
  Shield,
  TrendingUp,
  Eye,
  BarChart,
  Zap,
  HelpCircle,
  ArrowRight,
  Compass,
  Info,
  X
} from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/useMobile";

interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  onSelect: (useCase: UseCase | null) => void; // Modified to allow null for unselection
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

  // Safe string conversion function
  const safeString = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      // Handle objects that might have been passed from backend
      if (value.example && value.outcome) {
        return `${value.example} ${value.outcome}`;
      }
      if (value.description) {
        return String(value.description);
      }
      // Convert object to string safely
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Safe array conversion function
  const safeArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(item => safeString(item)).filter(Boolean);
    }
    if (typeof value === "string") {
      return [value];
    }
    return [safeString(value)];
  };

  // Check if educational content is available (with safe checks)
  const hasEducationalContent = Boolean(
    safeString(useCase.how_it_works) || 
    safeString(useCase.real_world_impact) || 
    safeString(useCase.similarity_to_project) || 
    safeString(useCase.real_world_examples) || 
    safeString(useCase.implementation_approach) || 
    safeString(useCase.decision_guidance) ||
    safeArray(useCase.key_success_factors).length > 0 ||
    safeArray(useCase.resource_requirements).length > 0
  );

  // Improved domain/category icon mapping
  const getCategoryIcon = (category?: string, type?: string) => {
    const categoryLower = category?.toLowerCase() || '';
    const typeLower = type?.toLowerCase() || '';
    
    // Health-related
    if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('diagnosis')) {
      return <Stethoscope size={16} className="text-red-500" />;
    }
    
    // Food/Agriculture
    if (categoryLower.includes('food') || categoryLower.includes('agriculture') || categoryLower.includes('crop')) {
      return <Wheat size={16} className="text-green-500" />;
    }
    
    // Education
    if (categoryLower.includes('education') || categoryLower.includes('learning')) {
      return <GraduationCap size={16} className="text-blue-500" />;
    }
    
    // Water/Resources
    if (categoryLower.includes('water') || categoryLower.includes('resource')) {
      return <Droplet size={16} className="text-cyan-500" />;
    }
    
    // Disaster/Emergency
    if (categoryLower.includes('disaster') || categoryLower.includes('emergency')) {
      return <AlertCircle size={16} className="text-orange-500" />;
    }
    
    // Shelter/Housing
    if (categoryLower.includes('shelter') || categoryLower.includes('housing')) {
      return <Home size={16} className="text-purple-500" />;
    }
    
    // AI Technical Categories
    if (categoryLower.includes('prediction') || categoryLower.includes('forecasting')) {
      return <TrendingUp size={16} className="text-blue-600" />;
    }
    if (categoryLower.includes('classification') || categoryLower.includes('detection')) {
      return <Target size={16} className="text-green-600" />;
    }
    if (categoryLower.includes('optimization')) {
      return <Zap size={16} className="text-yellow-600" />;
    }
    if (categoryLower.includes('monitoring')) {
      return <Eye size={16} className="text-purple-600" />;
    }
    if (categoryLower.includes('analysis')) {
      return <BarChart size={16} className="text-indigo-600" />;
    }
    
    // Source types
    if (typeLower.includes('academic') || typeLower.includes('research')) {
      return <BookOpen size={16} className="text-orange-500" />;
    }
    if (typeLower.includes('humanitarian') || typeLower.includes('report')) {
      return <FileText size={16} className="text-blue-500" />;
    }
    if (typeLower.includes('repository') || typeLower.includes('template')) {
      return <Database size={16} className="text-purple-500" />;
    }
    
    // Default
    return <Lightbulb size={16} className="text-gray-500" />;
  };

  // Get source type icon
  const getSourceIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "academic_paper": return <BookOpen size={14} className="text-orange-500" />;
      case "humanitarian_report": return <FileText size={14} className="text-blue-500" />;
      case "case_study": case "ai_application": return <Lightbulb size={14} className="text-green-500" />;
      case "use_case_repository": case "curated_template": return <Database size={14} className="text-purple-500" />;
      default: return <Globe size={14} className="text-gray-500" />;
    }
  };

  // Handle use case selection/unselection
  const handleSelectUseCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onToggleExpand(useCase.id, false);
    
    // If already selected, unselect (pass null), otherwise select
    if (isSelected) {
      onSelect(null);
    } else {
      onSelect(useCase);
    }
  };

  return (
    <Card 
      className={`border transition-all hover:shadow-md ${
        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <CardContent className="p-4">
        {/* Header with title and controls */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-3">
            <h3 className="font-medium text-lg leading-tight mb-1">{useCase.title}</h3>
            
            {/* Source and metadata info */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
              {useCase.source && (
                <div className="flex items-center gap-1">
                  {getSourceIcon(useCase.type)}
                  <span>{useCase.source}</span>
                </div>
              )}
              
              {useCase.category && (
                <div className="flex items-center gap-1">
                  {getCategoryIcon(useCase.category, useCase.type)}
                  <span>{useCase.category}</span>
                </div>
              )}
              
              {/* Indicator for educational content availability */}
              {hasEducationalContent && (
                <div className="flex items-center gap-1 text-green-600">
                  <Info size={14} />
                  <span className="text-xs">Guidance available</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Expand/collapse button - only show if there's educational content or source URL */}
          {(hasEducationalContent || useCase.source_url) && (
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleTrigger 
                onClick={handleToggle} 
                className="p-1 rounded-full hover:bg-secondary/20 transition-colors shrink-0"
                aria-label={open ? "Collapse details" : "Expand details"}
              >
                {open ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
          {useCase.description}
        </p>
        
        {/* Similarity to project (always visible if available) */}
        {safeString(useCase.similarity_to_project) && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Compass className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm text-blue-900 mb-1">Relevance to your project</h4>
                <p className="text-sm text-blue-800">{safeString(useCase.similarity_to_project)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Tags and Type */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Type badge */}
          {useCase.type && (
            <Badge variant="secondary" className="text-xs">
              {useCase.type.replace(/_/g, ' ')}
            </Badge>
          )}
          
          {/* Category badge */}
          {useCase.category && useCase.category !== "General" && (
            <Badge variant="outline" className="text-xs">
              {useCase.category}
            </Badge>
          )}
        </div>
        
        {/* Source link - Always visible when available */}
        {useCase.source_url && useCase.source_url !== "" && (
          <div className="mb-3 pb-3 border-b">
            <a 
              href={useCase.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View source: {useCase.source}
            </a>
          </div>
        )}
        
        {/* No educational content notice */}
        {!hasEducationalContent && useCase.source_url && (
          <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-700">
                  Visit the source link above to learn more about this use case and its implementation details.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Expanded Content - Show only if there's educational content */}
        {hasEducationalContent && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleContent className="mt-4 space-y-4 border-t pt-4">
              
              {/* How it works - Simplified for humanitarian professionals */}
              {safeString(useCase.how_it_works) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-sm">How this approach works</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {safeString(useCase.how_it_works)}
                  </p>
                </div>
              )}
              
              {/* Real world examples */}
              {safeString(useCase.real_world_examples) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-sm">Real-world examples</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {safeString(useCase.real_world_examples)}
                  </p>
                </div>
              )}
              
              {/* Expected impact */}
              {safeString(useCase.real_world_impact) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-sm">Expected impact</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {safeString(useCase.real_world_impact)}
                  </p>
                </div>
              )}
              
              {/* Implementation approach */}
              {safeString(useCase.implementation_approach) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium text-sm">Implementation approach</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                    {safeString(useCase.implementation_approach)}
                  </p>
                </div>
              )}
              
              {/* Decision guidance */}
              {safeString(useCase.decision_guidance) && (
                <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm text-amber-900 mb-1">Should you choose this approach?</h4>
                      <p className="text-sm text-amber-800">{safeString(useCase.decision_guidance)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Key success factors and Resource requirements in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Success factors */}
                {safeArray(useCase.key_success_factors).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-sm">Key success factors</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                      {safeArray(useCase.key_success_factors).slice(0, 3).map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-400 mt-1 shrink-0">•</span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Resource requirements */}
                {safeArray(useCase.resource_requirements).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-medium text-sm">Resource requirements</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                      {safeArray(useCase.resource_requirements).slice(0, 3).map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-400 mt-1 shrink-0">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Select/Unselect button */}
        <Button 
          variant={isSelected ? "default" : "outline"} 
          size="sm"
          className="mt-3 w-full"
          onClick={handleSelectUseCase}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4 mr-2" /> 
              Selected
            </>
          ) : (
            "Select Use Case"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
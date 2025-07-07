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
} from "lucide-react";
import { UseCase } from "@/types/scoping-phase";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseCaseCardProps {
  useCase: UseCase;
  isSelected: boolean;
  onSelect: (useCase: UseCase | null) => void;
  isExpanded?: boolean;
  onToggleExpand: (id: string, isExpanded: boolean) => void;
}

export const UseCaseCard = ({
  useCase,
  isSelected,
  onSelect,
  isExpanded = false,
  onToggleExpand,
}: UseCaseCardProps) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(isExpanded);

  useEffect(() => {
    setOpen(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    const newState = !open;
    setOpen(newState);
    onToggleExpand(useCase.id, newState);
  };

  const safeString = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.example && value.outcome) {
        return `${value.example} ${value.outcome}`;
      }
      if (value.description) {
        return String(value.description);
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const safeArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(safeString).filter(Boolean);
    }
    if (typeof value === "string") {
      return [value];
    }
    return [safeString(value)];
  };

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

  const getCategoryIcon = (category?: string, type?: string) => {
    const categoryLower = category?.toLowerCase() || "";
    const typeLower = type?.toLowerCase() || "";

    if (categoryLower.includes("health")) {
      return <Stethoscope size={16} className="text-red-500" />;
    }
    if (categoryLower.includes("food")) {
      return <Wheat size={16} className="text-green-500" />;
    }
    if (categoryLower.includes("education")) {
      return <GraduationCap size={16} className="text-blue-500" />;
    }
    if (categoryLower.includes("water")) {
      return <Droplet size={16} className="text-cyan-500" />;
    }
    if (categoryLower.includes("disaster")) {
      return <AlertCircle size={16} className="text-orange-500" />;
    }
    if (categoryLower.includes("shelter")) {
      return <Home size={16} className="text-purple-500" />;
    }

    if (categoryLower.includes("prediction")) {
      return <TrendingUp size={16} className="text-primary" />;
    }
    if (categoryLower.includes("classification")) {
      return <Target size={16} className="text-green-600" />;
    }
    if (categoryLower.includes("optimization")) {
      return <Zap size={16} className="text-yellow-600" />;
    }
    if (categoryLower.includes("monitoring")) {
      return <Eye size={16} className="text-purple-600" />;
    }
    if (categoryLower.includes("analysis")) {
      return <BarChart size={16} className="text-indigo-600" />;
    }

    if (typeLower.includes("academic")) {
      return <BookOpen size={16} className="text-orange-500" />;
    }
    if (typeLower.includes("report")) {
      return <FileText size={16} className="text-blue-500" />;
    }
    if (typeLower.includes("repository")) {
      return <Database size={16} className="text-purple-500" />;
    }

    return <Lightbulb size={16} className="text-muted-foreground" />;
  };

  const getSourceIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "academic_paper":
        return <BookOpen size={14} className="text-orange-500" />;
      case "humanitarian_report":
        return <FileText size={14} className="text-blue-500" />;
      case "case_study":
      case "ai_application":
        return <Lightbulb size={14} className="text-green-500" />;
      case "use_case_repository":
      case "curated_template":
        return <Database size={14} className="text-purple-500" />;
      default:
        return <Globe size={14} className="text-muted-foreground" />;
    }
  };

  const handleSelectUseCase = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    onToggleExpand(useCase.id, false);
    if (isSelected) {
      onSelect(null);
    } else {
      onSelect(useCase);
    }
  };

  return (
    <Card
      className={`border transition-all hover:shadow-md ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-3">
            <h3 className="font-medium text-lg leading-tight mb-1">
              {useCase.title}
            </h3>
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
              {hasEducationalContent && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Info size={14} />
                  <span className="text-xs">Guidance available</span>
                </div>
              )}
            </div>
          </div>
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

        <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
          {useCase.description}
        </p>

        {safeString(useCase.similarity_to_project) && (
          <div className="mb-3 p-3 bg-muted border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <Compass className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-sm mb-1 text-foreground">
                  Relevance to your project
                </h4>
                <p className="text-sm text-muted-foreground">
                  {safeString(useCase.similarity_to_project)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {useCase.type && (
            <Badge variant="secondary" className="text-xs">
              {useCase.type.replace(/_/g, " ")}
            </Badge>
          )}
          {useCase.category && useCase.category !== "General" && (
            <Badge variant="outline" className="text-xs">
              {useCase.category}
            </Badge>
          )}
        </div>

        {useCase.source_url && (
          <div className="mb-3 pb-3 border-b border-border">
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

        {!hasEducationalContent && useCase.source_url && (
          <div className="mb-3 p-3 bg-muted border border-border rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Visit the source link above to learn more about this use case and its implementation details.
              </p>
            </div>
          </div>
        )}

        {hasEducationalContent && (
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleContent className="mt-4 space-y-4 border-t pt-4 border-border">
              {[
                {
                  icon: Lightbulb,
                  label: "How this approach works",
                  content: safeString(useCase.how_it_works),
                  color: "text-primary",
                },
                {
                  icon: CheckCircle,
                  label: "Real-world examples",
                  content: safeString(useCase.real_world_examples),
                  color: "text-green-600",
                },
                {
                  icon: Target,
                  label: "Expected impact",
                  content: safeString(useCase.real_world_impact),
                  color: "text-green-600",
                },
                {
                  icon: ArrowRight,
                  label: "Implementation approach",
                  content: safeString(useCase.implementation_approach),
                  color: "text-purple-600",
                },
              ]
                .filter((item) => item.content)
                .map(({ icon: Icon, label, content, color }, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <h4 className="font-medium text-sm">{label}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                      {content}
                    </p>
                  </div>
                ))}

              {safeString(useCase.decision_guidance) && (
                <div className="space-y-2 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-200 mb-1">
                        Should you choose this approach?
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        {safeString(useCase.decision_guidance)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeArray(useCase.key_success_factors).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h4 className="font-medium text-sm">Key success factors</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                      {safeArray(useCase.key_success_factors)
                        .slice(0, 3)
                        .map((factor, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-400 mt-1 shrink-0">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {safeArray(useCase.resource_requirements).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-500" />
                      <h4 className="font-medium text-sm">Resource requirements</h4>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-6">
                      {safeArray(useCase.resource_requirements)
                        .slice(0, 3)
                        .map((req, i) => (
                          <li key={i} className="flex items-start gap-2">
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

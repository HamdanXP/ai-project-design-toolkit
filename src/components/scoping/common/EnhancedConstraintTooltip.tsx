
import { HelpCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeasibilityConstraint } from "@/types/scoping-phase";

interface EnhancedConstraintTooltipProps {
  constraint: FeasibilityConstraint;
}

export const EnhancedConstraintTooltip = ({ constraint }: EnhancedConstraintTooltipProps) => {
  const getIcon = () => {
    switch (constraint.importance) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important':
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 hover:scale-110 transition-transform">
            {getIcon()}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-sm p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-sm mb-1">{constraint.label}</h4>
              <p className="text-xs text-muted-foreground">{constraint.helpText}</p>
            </div>
            
            {constraint.examples && constraint.examples.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-primary">Examples:</p>
                <ul className="text-xs space-y-1">
                  {constraint.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {constraint.riskLevel && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium mb-1">Risk Level:</p>
                <span className={`text-xs font-medium ${getRiskColor(constraint.riskLevel)}`}>
                  {constraint.riskLevel.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

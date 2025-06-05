
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConstraintTooltipProps {
  title: string;
  description: string;
  examples?: string[];
}

export const ConstraintTooltip = ({ title, description, examples }: ConstraintTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs p-3">
          <div>
            <h4 className="font-medium mb-2">{title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{description}</p>
            {examples && examples.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Examples:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  {examples.map((example, index) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

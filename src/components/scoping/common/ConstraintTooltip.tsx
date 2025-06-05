
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <Info className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-3">
          <div className="space-y-2">
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
            {examples && examples.length > 0 && (
              <div>
                <p className="text-sm font-medium">Examples:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside">
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

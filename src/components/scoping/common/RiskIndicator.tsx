
import { cn } from "@/lib/utils";

type RiskIndicatorProps = {
  risk: 'low' | 'medium' | 'high';
  showLabel?: boolean;
  className?: string;
};

export const RiskIndicator = ({ risk, showLabel = true, className }: RiskIndicatorProps) => {
  return (
    <div
      className={cn(
        "px-3 py-1 rounded-full text-white text-xs",
        risk === 'low' ? 'bg-green-500' : 
        risk === 'medium' ? 'bg-yellow-500' : 
        'bg-red-500',
        className
      )}
    >
      {showLabel && `${risk.toUpperCase()} RISK`}
    </div>
  );
};

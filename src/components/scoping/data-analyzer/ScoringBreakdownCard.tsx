import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScoringBreakdown } from "@/types/scoping-phase";
import { AlertTriangle, Calculator, CheckCircle } from "lucide-react";

export const ScoringBreakdownCard = ({ scoringBreakdown }: { scoringBreakdown: ScoringBreakdown }) => {
  return (
    <div className="space-y-3 mb-4">
      <h4 className="font-medium">Scoring Breakdown:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(scoringBreakdown).map(([key, detail]: [string, any]) => {
          const label = key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          return (
            <div key={key} className="flex justify-between items-center p-3 border rounded-lg">
              <div className="flex-1">
                <span className="text-sm font-medium">{label}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {detail.reasoning}
                </p>
                <div className="text-xs text-primary mt-1">
                  {detail.score}% × {detail.weight}% = {detail.points} pts
                </div>
              </div>
              <Badge variant="outline" className="ml-2">
                {detail.points}/{detail.weight}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type SuitabilityScoreCardProps = {
  score: number;
};

export const SuitabilityScoreCard = ({ score }: SuitabilityScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 75) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = () => {
    if (score >= 75) return CheckCircle;
    if (score >= 40) return AlertTriangle;
    return XCircle;
  };

  const getScoreMessage = () => {
    if (score >= 75) {
      return {
        title: "Excellent Data Suitability",
        message: "Your data appears highly suitable for AI development. You can proceed with confidence.",
        recommendation: "Continue to the next phase and consider documenting your data quality for future reference."
      };
    }
    if (score >= 40) {
      return {
        title: "Moderate Data Suitability", 
        message: "Your data has some concerns but may still be usable with proper preparation.",
        recommendation: "Consider addressing identified issues or getting expert consultation before proceeding."
      };
    }
    return {
      title: "Low Data Suitability",
      message: "There are significant data concerns that could impact your project's success.",
      recommendation: "Strongly recommend improving data quality or seeking alternative datasets before continuing."
    };
  };

  const scoreInfo = getScoreMessage();
  const ScoreIcon = getScoreIcon();

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <ScoreIcon className={`h-5 w-5 mr-2 ${getScoreColor()}`} />
          <h3 className="font-semibold text-lg">Data Suitability Assessment</h3>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Suitability Score</span>
            <span className={`text-lg font-bold ${getScoreColor()}`}>{score}%</span>
          </div>
          <Progress value={score} className="h-3" />
        </div>

        <div className="space-y-3">
          <div>
            <h4 className={`font-medium ${getScoreColor()}`}>{scoreInfo.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{scoreInfo.message}</p>
          </div>
          
          <div className="p-3 bg-muted rounded-lg">
            <h5 className="font-medium text-sm mb-1">Recommendation</h5>
            <p className="text-sm">{scoreInfo.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

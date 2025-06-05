
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Shield, AlertTriangle } from "lucide-react";
import { FeasibilityCategory } from "@/types/scoping-phase";
import { RiskIndicator } from "../common/RiskIndicator";

type FeasibilityScoreCardProps = {
  score: number;
  risk: 'low' | 'medium' | 'high';
  categories: FeasibilityCategory[];
};

export const FeasibilityScoreCard = ({ score, risk, categories }: FeasibilityScoreCardProps) => {
  const getScoreIcon = () => {
    if (score >= 75) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (score >= 50) return <Shield className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getScoreColor = () => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendation = () => {
    if (score >= 75) {
      return "Excellent! Your project shows strong feasibility indicators. You're well-positioned for success.";
    }
    if (score >= 50) {
      return "Good foundation with some areas for improvement. Consider addressing the medium and high-risk factors below.";
    }
    return "Significant challenges identified. We recommend addressing critical constraints before proceeding.";
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getScoreIcon()}
            <span>Feasibility Assessment</span>
          </div>
          <RiskIndicator risk={risk} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {score}%
          </div>
          <Progress value={score} className="h-3 mt-2" />
        </div>
        
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            {score >= 50 ? (
              <Shield className="h-4 w-4 text-primary mt-0.5" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
            )}
            <p>{getRecommendation()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {categories.map(category => {
            const categoryScore = Math.round(Math.random() * 40 + 50); // Mock calculation
            const categoryRisk = categoryScore >= 75 ? 'low' : categoryScore >= 50 ? 'medium' : 'high';
            
            return (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium">{category.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{categoryScore}%</span>
                  <RiskIndicator risk={categoryRisk} showLabel={false} className="text-xs px-2 py-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

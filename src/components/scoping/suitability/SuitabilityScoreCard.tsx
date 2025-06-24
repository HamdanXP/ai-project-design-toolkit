import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Shield } from "lucide-react";

type SuitabilityScoreCardProps = {
  score: number;
};

export const SuitabilityScoreCard = ({ score }: SuitabilityScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = () => {
    if (score >= 70) return CheckCircle;
    if (score >= 50) return AlertTriangle;
    return XCircle;
  };

  const getScoreMessage = () => {
    if (score >= 70) {
      return {
        title: "Data Ready for AI Development",
        message: "Your data shows strong suitability for humanitarian AI projects. You can proceed with confidence.",
        recommendation: "Continue to the final review. Consider documenting your data assessment for future reference.",
        riskLevel: "low"
      };
    }
    if (score >= 50) {
      return {
        title: "Data Usable with Preparation", 
        message: "Your data has good potential but may need some preparation before AI development.",
        recommendation: "Address the identified concerns, especially any privacy or representation issues, before proceeding.",
        riskLevel: "medium"
      };
    }
    if (score >= 30) {
      return {
        title: "Data Needs Significant Work",
        message: "There are important concerns that could impact your project's success and safety.",
        recommendation: "Consider improving data quality, seeking expert consultation, or finding alternative datasets.",
        riskLevel: "high"
      };
    }
    return {
      title: "Data Not Currently Suitable",
      message: "Major concerns make this data unsuitable for AI development in its current state.",
      recommendation: "Address fundamental issues, especially privacy and ethical concerns, before considering AI development.",
      riskLevel: "high"
    };
  };

  const getProgressBarColor = () => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const scoreInfo = getScoreMessage();
  const ScoreIcon = getScoreIcon();

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <ScoreIcon className={`h-5 w-5 mr-2 ${getScoreColor()}`} />
          <h3 className="font-semibold text-lg">Data Suitability Results</h3>
        </div>
       
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Suitability</span>
            <span className={`text-lg font-bold ${getScoreColor()}`}>{score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className={`font-medium ${getScoreColor()}`}>{scoreInfo.title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{scoreInfo.message}</p>
          </div>
         
          <div className={`p-4 rounded-lg border-l-4 ${
            scoreInfo.riskLevel === 'low' ? 'bg-green-50 border-green-400' :
            scoreInfo.riskLevel === 'medium' ? 'bg-yellow-50 border-yellow-400' :
            'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-start">
              <Shield className={`h-4 w-4 mt-0.5 mr-2 ${
                scoreInfo.riskLevel === 'low' ? 'text-green-600' :
                scoreInfo.riskLevel === 'medium' ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <div>
                <h5 className={`font-medium text-sm mb-1 ${
                  scoreInfo.riskLevel === 'low' ? 'text-green-900' :
                  scoreInfo.riskLevel === 'medium' ? 'text-yellow-900' :
                  'text-red-900'
                }`}>
                  Recommendation
                </h5>
                <p className={`text-sm ${
                  scoreInfo.riskLevel === 'low' ? 'text-green-800' :
                  scoreInfo.riskLevel === 'medium' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {scoreInfo.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Key Factors Explanation
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
            <h6 className="font-medium mb-1">Assessment Priorities:</h6>
            <div className="space-y-1">
              <div>• <strong>Privacy & Ethics (35%)</strong> - Safety and legal compliance</div>
              <div>• <strong>Population Coverage (30%)</strong> - Reaching those who need help</div>
              <div>• <strong>Data Completeness (20%)</strong> - Quality and consistency</div>
              <div>• <strong>Sufficiency (15%)</strong> - Volume and adequacy</div>
            </div>
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
};
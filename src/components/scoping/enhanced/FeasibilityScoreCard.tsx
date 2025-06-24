import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Clock, Users, Laptop, Wifi } from "lucide-react";
import { FeasibilityCategory } from "@/types/scoping-phase";

type FeasibilityScoreCardProps = {
  score: number;
  feasibilityLevel: 'high' | 'medium' | 'low'; // Changed from risk to feasibilityLevel
  categories: FeasibilityCategory[];
  constraints: Record<string, string | boolean>;
};

export const FeasibilityScoreCard = ({
  score,
  feasibilityLevel,
  categories,
  constraints
}: FeasibilityScoreCardProps) => {

  const getScoreIcon = () => {
    if (score >= 75) return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (score >= 50) return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <XCircle className="h-6 w-6 text-red-600" />;
  };

  const getScoreColor = () => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessMessage = () => {
    if (score >= 70) {
      return "Excellent foundations for success! Your organizational support and practical setup give you a strong start.";
    }
    if (score >= 50) {
      return "Good potential for success! This toolkit is designed to help projects like yours. Focus on the key areas below.";
    }
    return "Every successful AI project starts somewhere. Let's work together to build stronger foundations for your important work.";
  };

  const getKeyStrengths = () => {
    const strengths = [];

    if (constraints["budget"] === "substantial" || constraints["budget"] === "unlimited") {
      strengths.push("Strong budget allocation");
    }
    if (constraints["time"] === "long-term" || constraints["time"] === "ongoing") {
      strengths.push("Adequate timeframe");
    }
    if (constraints["ai-experience"] === "intermediate" || constraints["ai-experience"] === "advanced") {
      strengths.push("Good AI expertise");
    }
    if (constraints["stakeholder-support"] === "high" || constraints["stakeholder-support"] === "champion") {
      strengths.push("Strong organizational support");
    }
    if (constraints["internet"] === true && constraints["infrastructure"] === true) {
      strengths.push("Solid technical infrastructure");
    }

    return strengths.slice(0, 3);
  };

  const getKeyChallenges = () => {
    const challenges = [];

    if (constraints["budget"] === "limited") {
      challenges.push({
        area: "Budget",
        icon: <Clock className="h-4 w-4" />,
        suggestion: "Consider starting with a pilot project or seeking additional funding"
      });
    }
    if (constraints["ai-experience"] === "none" || constraints["ai-experience"] === "beginner") {
      challenges.push({
        area: "Technical Skills",
        icon: <Users className="h-4 w-4" />,
        suggestion: "Plan for training or consider partnering with technical experts"
      });
    }
    if (constraints["compute"] === "local" && constraints["time"] === "short-term") {
      challenges.push({
        area: "Infrastructure",
        icon: <Laptop className="h-4 w-4" />,
        suggestion: "Consider cloud services for faster setup and scaling"
      });
    }
    if (constraints["stakeholder-support"] === "low") {
      challenges.push({
        area: "Support",
        icon: <Users className="h-4 w-4" />,
        suggestion: "Invest time in stakeholder engagement and communication"
      });
    }
    if (constraints["internet"] === false) {
      challenges.push({
        area: "Connectivity",
        icon: <Wifi className="h-4 w-4" />,
        suggestion: "Ensure reliable internet access or plan for offline capabilities"
      });
    }

    return challenges.slice(0, 3);
  };

  const getNextSteps = () => {
    if (score >= 75) {
      return [
        "Continue to data discovery to find suitable datasets",
        "Begin planning your development timeline",
        "Consider potential ethical considerations early"
      ];
    }
    if (score >= 50) {
      return [
        "Address the key challenges identified below",
        "Consider starting with a smaller pilot project",
        "Secure additional resources or support where needed"
      ];
    }
    return [
      "Focus on building stronger foundations first",
      "Consider delaying the project until constraints are addressed",
      "Seek guidance from AI experts or experienced organizations"
    ];
  };

  const strengths = getKeyStrengths();
  const challenges = getKeyChallenges();
  const nextSteps = getNextSteps();

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {getScoreIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Project Readiness Assessment
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
              Based on your available resources and constraints
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {score}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Readiness Score</div>
          <Progress value={score} className="h-3" />
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-3 max-w-md mx-auto">
            {getReadinessMessage()}
          </p>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Your Strengths
            </h4>
            <div className="grid gap-2">
              {strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  {strength}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenges */}
        {challenges.length > 0 && (
          <div>
            <h4 className="font-medium text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Areas to Address
            </h4>
            <div className="space-y-3">
              {challenges.map((challenge, index) => (
                <div
                  key={index}
                  className="border border-orange-200 dark:border-orange-700 rounded-lg p-3 bg-orange-50 dark:bg-orange-900/20"
                >
                  <div className="flex items-start gap-2">
                    <div className="text-orange-600 dark:text-orange-300 mt-0.5">
                      {challenge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-orange-900 dark:text-orange-200 text-sm">
                        {challenge.area}
                      </div>
                      <div className="text-orange-800 dark:text-orange-300 text-xs mt-1">
                        {challenge.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Recommended Next Steps</h4>
          <div className="space-y-2">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs flex items-center justify-center font-medium mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Feasibility Level Indicator */}
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Project Feasibility Level</span>
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              feasibilityLevel === 'high'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                : feasibilityLevel === 'medium'
                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
            }`}
          >
            {feasibilityLevel === 'high' ? 'High Feasibility' : 
             feasibilityLevel === 'medium' ? 'Medium Feasibility' : 'Low Feasibility'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
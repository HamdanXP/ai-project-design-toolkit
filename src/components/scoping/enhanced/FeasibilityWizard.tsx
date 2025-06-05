
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Shield, TrendingUp, AlertTriangle } from "lucide-react";
import { FeasibilityCategory, RiskMitigation } from "@/types/scoping-phase";
import { StepHeading } from "../common/StepHeading";
import { RiskIndicator } from "../common/RiskIndicator";
import { FeasibilityCategory as CategoryComponent } from "./FeasibilityCategory";
import { FeasibilityScoreCard } from "./FeasibilityScoreCard";
import { RiskMitigationPanel } from "./RiskMitigationPanel";

type FeasibilityWizardProps = {
  categories: FeasibilityCategory[];
  onUpdateConstraint: (categoryId: string, constraintId: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  riskMitigations: RiskMitigation[];
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const FeasibilityWizard = ({
  categories,
  onUpdateConstraint,
  feasibilityScore,
  feasibilityRisk,
  riskMitigations,
  moveToPreviousStep,
  moveToNextStep,
}: FeasibilityWizardProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [showRiskAnalysis, setShowRiskAnalysis] = useState(false);

  const currentCategory = categories[activeCategory];
  const isLastCategory = activeCategory === categories.length - 1;
  const isFirstCategory = activeCategory === 0;

  const handleNext = () => {
    if (isLastCategory) {
      setShowRiskAnalysis(true);
    } else {
      setActiveCategory(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (showRiskAnalysis) {
      setShowRiskAnalysis(false);
    } else if (activeCategory > 0) {
      setActiveCategory(prev => prev - 1);
    } else {
      moveToPreviousStep();
    }
  };

  if (showRiskAnalysis) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <StepHeading stepNumber={2} title="Risk Analysis & Feasibility Assessment" />
        </CardHeader>
        <CardContent className="space-y-6">
          <FeasibilityScoreCard 
            score={feasibilityScore}
            risk={feasibilityRisk}
            categories={categories}
          />
          
          <RiskMitigationPanel 
            riskMitigations={riskMitigations}
            feasibilityRisk={feasibilityRisk}
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assessment
          </Button>
          <Button onClick={moveToNextStep}>
            Continue to Data Discovery <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={2} title="Project Feasibility Assessment" />
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {activeCategory + 1} of {categories.length} categories
            </span>
          </div>
          <Progress value={((activeCategory + 1) / categories.length) * 100} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Let's assess your project's feasibility across key areas. This comprehensive evaluation will help identify potential challenges and ensure you're set up for success.
        </p>
        
        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category, index) => (
            <Button
              key={category.id}
              variant={index === activeCategory ? "default" : index < activeCategory ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(index)}
              className="text-xs"
            >
              {index < activeCategory && <Shield className="mr-1 h-3 w-3" />}
              {category.title}
            </Button>
          ))}
        </div>

        {/* Current Category */}
        <CategoryComponent
          category={currentCategory}
          onUpdateConstraint={(constraintId, value) => 
            onUpdateConstraint(currentCategory.id, constraintId, value)
          }
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={isFirstCategory && !showRiskAnalysis}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFirstCategory ? 'Previous Step' : 'Previous Category'}
        </Button>
        <Button onClick={handleNext}>
          {isLastCategory ? (
            <>
              View Risk Analysis <TrendingUp className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next Category <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

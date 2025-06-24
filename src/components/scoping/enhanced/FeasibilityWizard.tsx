import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Shield, TrendingUp } from "lucide-react";
import { FeasibilityCategory, RiskMitigation } from "@/types/scoping-phase";
import { StepHeading } from "../common/StepHeading";
import { FeasibilityCategory as CategoryComponent } from "./FeasibilityCategory";
import { FeasibilityScoreCard } from "./FeasibilityScoreCard";
import { RiskMitigationPanel } from "./RiskMitigationPanel";

type FeasibilityWizardProps = {
  categories: FeasibilityCategory[];
  onUpdateConstraint: (categoryId: string, constraintId: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityLevel: 'high' | 'medium' | 'low'; // Changed from feasibilityRisk
  riskMitigations: RiskMitigation[];
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
  constraintValues: Record<string, string | boolean>;
};

export const FeasibilityWizard = ({
  categories,
  onUpdateConstraint,
  feasibilityScore,
  feasibilityLevel,
  riskMitigations,
  moveToPreviousStep,
  moveToNextStep,
  constraintValues,
}: FeasibilityWizardProps) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);

  const currentCategory = categories[activeCategory];
  const isLastCategory = activeCategory === categories.length - 1;
  const isFirstCategory = activeCategory === 0;

  const handleNext = () => {
    if (isLastCategory) {
      // Show the assessment summary
      setShowAssessment(true);
    } else {
      setActiveCategory(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (showAssessment) {
      setShowAssessment(false);
    } else if (activeCategory > 0) {
      setActiveCategory(prev => prev - 1);
    } else {
      // When on first category, go back to previous step
      moveToPreviousStep();
    }
  };

  if (showAssessment) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <StepHeading stepNumber={2} title="Project Readiness Assessment" />
        </CardHeader>
        <CardContent className="space-y-6">
          <FeasibilityScoreCard 
            score={feasibilityScore}
            feasibilityLevel={feasibilityLevel} // Changed from risk
            categories={categories}
            constraints={constraintValues}
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
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isFirstCategory ? 'Previous' : 'Previous Category'}
        </Button>
        <Button onClick={handleNext}>
          {isLastCategory ? (
            <>
              View Assessment <TrendingUp className="ml-2 h-4 w-4" />
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
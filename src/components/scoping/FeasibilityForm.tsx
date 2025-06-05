
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { FeasibilityConstraint } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { RiskIndicator } from "./common/RiskIndicator";
import { ConstraintTooltip } from "./common/ConstraintTooltip";

type FeasibilityFormProps = {
  constraints: FeasibilityConstraint[];
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

const constraintInfo = {
  time: {
    title: "How much time do you have?",
    description: "Consider the urgency of your project and available timeline for development and testing.",
    examples: ["Short-term: 1-3 months (urgent need)", "Medium-term: 3-12 months (planned project)", "Long-term: 1+ years (research phase)"]
  },
  tech: {
    title: "Your team's technical experience",
    description: "Assess your team's comfort level with technology and data analysis.",
    examples: ["Limited: Mostly non-technical team", "Moderate: Some tech-savvy members", "Extensive: Dedicated technical experts"]
  },
  compute: {
    title: "Where will your system run?",
    description: "Consider where you'll process data and run your AI system.",
    examples: ["Local: On your own computers", "Cloud: Online services (Google, Amazon)", "Hybrid: Mix of both approaches"]
  },
  internet: {
    title: "Internet connectivity",
    description: "Whether you have reliable internet access for your project location."
  },
  infrastructure: {
    title: "Local technology setup",
    description: "Existing technology infrastructure at your organization or project location.",
    examples: ["Computers, servers, network equipment", "Data storage systems", "Power and connectivity"]
  }
} as const;

export const FeasibilityForm = ({
  constraints,
  handleConstraintUpdate,
  feasibilityScore,
  feasibilityRisk,
  moveToPreviousStep,
  moveToNextStep,
}: FeasibilityFormProps) => {
  const getConstraintLabel = (constraint: FeasibilityConstraint) => {
    const info = constraintInfo[constraint.id as keyof typeof constraintInfo];
    return info?.title || constraint.label;
  };

  const getSelectOptions = (constraint: FeasibilityConstraint) => {
    if (constraint.id === 'time') {
      return [
        { value: 'short-term', label: 'Short-term (1-3 months)' },
        { value: 'medium-term', label: 'Medium-term (3-12 months)' },
        { value: 'long-term', label: 'Long-term (1+ years)' }
      ];
    }
    if (constraint.id === 'tech') {
      return [
        { value: 'limited', label: 'Limited (mostly non-technical)' },
        { value: 'moderate', label: 'Moderate (some technical knowledge)' },
        { value: 'extensive', label: 'Extensive (dedicated experts)' }
      ];
    }
    if (constraint.id === 'compute') {
      return [
        { value: 'local', label: 'Local computers' },
        { value: 'cloud', label: 'Cloud services' },
        { value: 'hybrid', label: 'Both local and cloud' }
      ];
    }
    return constraint.options?.map(option => ({ 
      value: option, 
      label: option.charAt(0).toUpperCase() + option.slice(1) 
    })) || [];
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={2} title="Feasibility Constraints" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Tell us about your practical constraints. This helps us understand what's realistically achievable for your project.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {constraints.map(constraint => {
            const info = constraintInfo[constraint.id as keyof typeof constraintInfo];
            return (
              <div key={constraint.id} className="space-y-2">
                <div className="flex items-center">
                  <label className="text-sm font-medium">
                    {getConstraintLabel(constraint)}
                  </label>
                  {info && (
                    <ConstraintTooltip
                      title={info.title}
                      description={info.description}
                      examples={'examples' in info ? info.examples : undefined}
                    />
                  )}
                </div>
                
                {constraint.type === 'toggle' ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id={constraint.id}
                      checked={constraint.value as boolean} 
                      onCheckedChange={(checked) => handleConstraintUpdate(constraint.id, !!checked)}
                    />
                    <label 
                      htmlFor={constraint.id}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Available
                    </label>
                  </div>
                ) : constraint.type === 'select' && constraint.options ? (
                  <select 
                    value={constraint.value as string}
                    onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                    className="w-full p-2 border border-input rounded-md bg-background"
                  >
                    {getSelectOptions(constraint).map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input 
                    value={constraint.value as string}
                    onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                  />
                )}
                
                {info && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {info.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Feasibility Summary</h3>
              <RiskIndicator risk={feasibilityRisk} />
            </div>
            <Progress value={feasibilityScore} className="h-2 mt-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {feasibilityScore <= 40 && "This project may face significant challenges. Consider revising your constraints or choosing a different approach."}
              {feasibilityScore > 40 && feasibilityScore < 75 && "This project appears moderately feasible, but may require careful planning and resource management."}
              {feasibilityScore >= 75 && "This project appears highly feasible given your constraints."}
            </p>
          </CardContent>
        </Card>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button onClick={moveToNextStep}>
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

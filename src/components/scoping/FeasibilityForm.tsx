
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

type FeasibilityFormProps = {
  constraints: FeasibilityConstraint[];
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

// User-friendly constraint information
const constraintInfo = {
  time: {
    title: "Project Timeline",
    description: "How much time do you have to complete this project?",
    helpText: "Consider deadlines, other commitments, and how urgently you need results."
  },
  tech: {
    title: "Technical Skills & Experience", 
    description: "What's your team's experience with AI and technology projects?",
    helpText: "Be honest about your current skills - you can always learn more or get help."
  },
  compute: {
    title: "Computing Resources & Budget",
    description: "What computing resources do you have access to?",
    helpText: "Cloud services offer more power but may cost money. Local is free but limited."
  },
  internet: {
    title: "Reliable Internet Connection",
    description: "Do you have consistent, fast internet access?",
    helpText: "Most AI tools and data sources require good internet connectivity."
  },
  infrastructure: {
    title: "Local Technology Setup",
    description: "Do you have access to necessary local technology?",
    helpText: "This includes reliable electricity, computers, and workspace."
  }
};

export const FeasibilityForm = ({
  constraints,
  handleConstraintUpdate,
  feasibilityScore,
  feasibilityRisk,
  moveToPreviousStep,
  moveToNextStep,
}: FeasibilityFormProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={2} title="Project Feasibility Check" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-8">
          Let's assess what resources and constraints you're working with. This helps us understand what's realistically achievable for your project.
        </p>
        
        <div className="space-y-8">
          {constraints.map(constraint => {
            const info = constraintInfo[constraint.id as keyof typeof constraintInfo];
            
            return (
              <div key={constraint.id} className="space-y-4 p-6 border rounded-lg bg-card">
                <div>
                  <h3 className="text-lg font-medium mb-2">{info?.title || constraint.label}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{info?.description}</p>
                </div>
                
                <div className="space-y-3">
                  {constraint.type === 'toggle' ? (
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        id={constraint.id}
                        checked={constraint.value as boolean} 
                        onCheckedChange={(checked) => handleConstraintUpdate(constraint.id, !!checked)}
                      />
                      <label 
                        htmlFor={constraint.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Yes, I have this available
                      </label>
                    </div>
                  ) : constraint.type === 'select' && constraint.options ? (
                    <select 
                      value={constraint.value as string}
                      onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                      className="w-full p-3 border border-input rounded-md bg-background text-sm"
                    >
                      {constraint.options.map(option => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      value={constraint.value as string}
                      onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                      className="w-full"
                    />
                  )}
                  
                  {info?.helpText && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded border-l-4 border-primary/20">
                      💡 {info.helpText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <Card className="border border-border shadow-sm mt-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Feasibility Assessment</h3>
              <RiskIndicator risk={feasibilityRisk} />
            </div>
            <Progress value={feasibilityScore} className="h-3 mb-4" />
            <div className="space-y-2">
              {feasibilityScore <= 40 && (
                <p className="text-sm text-muted-foreground">
                  Your project may face significant challenges with current resources. Consider adjusting scope, timeline, or seeking additional support.
                </p>
              )}
              {feasibilityScore > 40 && feasibilityScore < 75 && (
                <p className="text-sm text-muted-foreground">
                  Your project appears moderately feasible, but may require careful planning and resource management.
                </p>
              )}
              {feasibilityScore >= 75 && (
                <p className="text-sm text-muted-foreground">
                  Great! Your project appears highly feasible given your available resources.
                </p>
              )}
            </div>
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

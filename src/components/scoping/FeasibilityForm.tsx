
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

const constraintHelpText: Record<string, { tooltip: string; helpText: string }> = {
  'team_experience': {
    tooltip: "How familiar is your team with AI and technology projects? This includes understanding data, basic programming concepts, or working with technical tools.",
    helpText: "Consider your team's comfort level with technology and learning new tools"
  },
  'budget': {
    tooltip: "What's your total budget for this project? Include costs for tools, services, training, and any external help you might need.",
    helpText: "Think about all project expenses: software subscriptions, cloud services, training, consultants"
  },
  'timeline': {
    tooltip: "How much time do you have to complete this project? Consider deadlines, team availability, and learning time.",
    helpText: "Include time for learning, development, testing, and potential setbacks"
  },
  'data_quality': {
    tooltip: "How good is the data you'll be working with? Clean, organized data makes projects much easier than messy, incomplete data.",
    helpText: "Consider if your data is complete, accurate, and well-organized"
  },
  'technical_infrastructure': {
    tooltip: "Do you have access to computers, internet, and software needed for your project? This includes having reliable technology to work with.",
    helpText: "Think about your current technology setup and what additional tools you might need"
  },
  'external_support': {
    tooltip: "Can you get help from technical experts, consultants, or experienced practitioners when you need it?",
    helpText: "Consider your network of advisors, mentors, or professional services"
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
        <StepHeading stepNumber={2} title="Project Feasibility Assessment" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Let's assess what resources and capabilities you have for this project. 
          This helps us understand what's realistically achievable and identify any areas where you might need additional support.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {constraints.map(constraint => {
            const helpInfo = constraintHelpText[constraint.id];
            
            return (
              <div key={constraint.id} className="space-y-3">
                <div className="flex items-center">
                  <label className="text-sm font-medium">{constraint.label}</label>
                  {helpInfo && <ConstraintTooltip content={helpInfo.tooltip} />}
                </div>
                
                {helpInfo && (
                  <p className="text-xs text-muted-foreground">{helpInfo.helpText}</p>
                )}
                
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
                    className="w-full p-3 border border-input rounded-md bg-background text-sm"
                  >
                    {constraint.options.map(option => (
                      <option key={option} value={option}>
                        {option === 'extensive' && 'High - We have significant experience'}
                        {option === 'moderate' && 'Medium - We have some experience'}
                        {option === 'limited' && 'Low - We are mostly beginners'}
                        {option === 'high' && 'Excellent - Very good quality'}
                        {option === 'medium' && 'Good - Decent quality with some issues'}
                        {option === 'low' && 'Poor - Needs significant cleanup'}
                        {!['extensive', 'moderate', 'limited', 'high', 'medium', 'low'].includes(option) && 
                          option.charAt(0).toUpperCase() + option.slice(1)
                        }
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input 
                    value={constraint.value as string}
                    onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                    placeholder={
                      constraint.id === 'budget' ? 'e.g., $5,000 or €3,000' :
                      constraint.id === 'timeline' ? 'e.g., 3 months or 6 weeks' :
                      'Enter your answer...'
                    }
                    className="text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Feasibility Assessment</h3>
              <RiskIndicator risk={feasibilityRisk} />
            </div>
            <Progress value={feasibilityScore} className="h-2 mt-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {feasibilityScore <= 40 && "Your project may face significant challenges. Consider starting with a smaller scope, getting additional training, or bringing in external expertise."}
              {feasibilityScore > 40 && feasibilityScore < 75 && "Your project appears moderately feasible. You may need to plan carefully, allow extra time for learning, or get help in specific areas."}
              {feasibilityScore >= 75 && "Your project looks very feasible! You seem to have the right resources and experience to move forward confidently."}
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

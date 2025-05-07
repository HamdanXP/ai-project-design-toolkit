
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import { FeasibilityConstraint } from "@/types/scoping-phase";

type FeasibilityFormProps = {
  constraints: FeasibilityConstraint[];
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
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
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">2</span>
          Feasibility Constraints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Define the practical constraints for your project. These factors will help determine what's realistically achievable.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {constraints.map(constraint => (
            <div key={constraint.id} className="space-y-2">
              <label className="text-sm font-medium">{constraint.label}</label>
              
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
                  {constraint.options.map(option => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Input 
                  value={constraint.value as string}
                  onChange={(e) => handleConstraintUpdate(constraint.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        
        <Card className="border border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Feasibility Summary</h3>
              <div className={`px-3 py-1 rounded-full text-white text-sm ${
                feasibilityRisk === 'low' ? 'bg-green-500' : 
                feasibilityRisk === 'medium' ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}>
                {feasibilityRisk === 'low' ? 'Low Risk' : 
                 feasibilityRisk === 'medium' ? 'Medium Risk' : 
                 'High Risk'}
              </div>
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

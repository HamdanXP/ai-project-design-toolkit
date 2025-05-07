
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import { DataSuitabilityCheck } from "@/types/scoping-phase";

type SuitabilityChecklistProps = {
  suitabilityChecks: DataSuitabilityCheck[];
  handleSuitabilityUpdate: (id: string, answer: 'yes' | 'no' | 'unknown') => void;
  suitabilityScore: number;
  chatQuestion: string;
  setChatQuestion: (value: string) => void;
  handleSubmitQuestion: () => void;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const SuitabilityChecklist = ({
  suitabilityChecks,
  handleSuitabilityUpdate,
  suitabilityScore,
  chatQuestion,
  setChatQuestion,
  handleSubmitQuestion,
  moveToPreviousStep,
  moveToNextStep,
}: SuitabilityChecklistProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">4</span>
          Data Suitability Checklist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Evaluate how suitable your chosen dataset is for your project. Identifying potential issues now can save time and resources later.</p>
        
        <div className="space-y-4 mb-8">
          {suitabilityChecks.map(check => (
            <Card key={check.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{check.question}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={check.answer === 'yes' ? 'default' : 'outline'}
                      className={check.answer === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'yes')}
                    >
                      <Check className="h-4 w-4 mr-1" /> Yes
                    </Button>
                    <Button 
                      size="sm" 
                      variant={check.answer === 'no' ? 'default' : 'outline'}
                      className={check.answer === 'no' ? 'bg-red-600 hover:bg-red-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'no')}
                    >
                      <X className="h-4 w-4 mr-1" /> No
                    </Button>
                    <Button 
                      size="sm" 
                      variant={check.answer === 'unknown' ? 'default' : 'outline'}
                      className={check.answer === 'unknown' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      onClick={() => handleSuitabilityUpdate(check.id, 'unknown')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" /> Unsure
                    </Button>
                  </div>
                </div>
                {check.answer && (
                  <div className="mt-3 flex items-start">
                    <div className={`mt-1 rounded-full p-1 ${
                      check.answer === 'yes' ? 'bg-green-100 text-green-600' : 
                      check.answer === 'no' ? 'bg-red-100 text-red-600' : 
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {check.answer === 'yes' && <Check className="h-3 w-3" />}
                      {check.answer === 'no' && <X className="h-3 w-3" />}
                      {check.answer === 'unknown' && <AlertTriangle className="h-3 w-3" />}
                    </div>
                    <div className="ml-2 text-sm text-muted-foreground">
                      {check.answer === 'yes' && "This is positive for your project."}
                      {check.answer === 'no' && "This could be a concern. Consider addressing this before proceeding."}
                      {check.answer === 'unknown' && "More information needed to assess this aspect."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground mb-3">
                  Ask about potential biases or limitations in your chosen dataset.
                </p>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., Is this data biased or limited in any way?" 
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSubmitQuestion}>
                    Ask
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="border border-border h-full">
              <CardContent className="p-4 flex flex-col h-full justify-center">
                <h3 className="font-medium mb-2">Suitability Score</h3>
                <Progress value={suitabilityScore} className="h-2 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {suitabilityScore <= 40 && "There may be significant data issues to address."}
                  {suitabilityScore > 40 && suitabilityScore < 75 && "The data appears moderately suitable with some concerns."}
                  {suitabilityScore >= 75 && "The data appears highly suitable for your project."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button 
          onClick={moveToNextStep} 
          disabled={suitabilityChecks.every(check => check.answer === 'unknown')}
        >
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

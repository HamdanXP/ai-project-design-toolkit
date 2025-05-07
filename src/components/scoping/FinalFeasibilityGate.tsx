
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle } from "lucide-react";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";

type FinalFeasibilityGateProps = {
  selectedUseCase: UseCase | null;
  selectedDataset: Dataset | null;
  constraints: FeasibilityConstraint[];
  feasibilityScore: number;
  feasibilityRisk: 'low' | 'medium' | 'high';
  suitabilityChecks: DataSuitabilityCheck[];
  suitabilityScore: number;
  readyToAdvance: boolean | null;
  setReadyToAdvance: (value: boolean) => void;
  moveToPreviousStep: () => void;
  handleCompletePhase: () => void;
};

export const FinalFeasibilityGate = ({
  selectedUseCase,
  selectedDataset,
  constraints,
  feasibilityScore,
  feasibilityRisk,
  suitabilityChecks,
  suitabilityScore,
  readyToAdvance,
  setReadyToAdvance,
  moveToPreviousStep,
  handleCompletePhase,
}: FinalFeasibilityGateProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <span className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center mr-2 text-sm">5</span>
          Final Feasibility Gate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">Review your project plan and decide whether to proceed to development or adjust your scope.</p>
        
        <Card className="border border-border shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Selected Use Case</h3>
                {selectedUseCase ? (
                  <div>
                    <p className="font-medium text-lg">{selectedUseCase.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedUseCase.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUseCase.tags.map(tag => (
                        <div key={tag} className="bg-secondary/20 text-secondary-foreground px-2 py-1 rounded-full text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No use case selected</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Feasibility Summary</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`px-3 py-1 rounded-full text-white text-xs ${
                    feasibilityRisk === 'low' ? 'bg-green-500' : 
                    feasibilityRisk === 'medium' ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}>
                    {feasibilityRisk.toUpperCase()} RISK
                  </div>
                  <span className="text-muted-foreground text-sm">Score: {feasibilityScore}/100</span>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Key Constraints</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5">
                    <li>Time: {constraints.find(c => c.id === "time")?.value as string}</li>
                    <li>Technical Capacity: {constraints.find(c => c.id === "tech")?.value as string}</li>
                    <li>Internet Access: {constraints.find(c => c.id === "internet")?.value ? "Available" : "Limited"}</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border my-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-3">Selected Dataset</h3>
                {selectedDataset ? (
                  <div>
                    <p className="font-medium">{selectedDataset.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedDataset.description}</p>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Source:</span> {selectedDataset.source}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span> {selectedDataset.format}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Size:</span> {selectedDataset.size}
                      </div>
                      <div>
                        <span className="text-muted-foreground">License:</span> {selectedDataset.license}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No dataset selected</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Data Suitability</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <div className="bg-secondary/20 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-primary" 
                        style={{ width: `${suitabilityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm">{suitabilityScore}/100</span>
                </div>
                <div className="mt-3">
                  {suitabilityChecks.map(check => (
                    <div key={check.id} className="flex items-center mb-2">
                      {check.answer === 'yes' && <Check className="h-4 w-4 text-green-600 mr-2" />}
                      {check.answer === 'no' && <X className="h-4 w-4 text-red-600 mr-2" />}
                      {check.answer === 'unknown' && <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />}
                      <span className="text-sm">{check.question}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col items-center text-center p-4">
          <h3 className="font-medium text-lg mb-3">Is this project ready to move forward?</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Based on your selected use case, dataset, and assessment, do you believe this project is ready to proceed to the Development phase?
          </p>
          
          <div className="flex gap-4">
            <Button 
              variant={readyToAdvance === false ? "default" : "outline"} 
              className={readyToAdvance === false ? "bg-red-600 hover:bg-red-700" : ""}
              onClick={() => setReadyToAdvance(false)}
            >
              <X className="h-4 w-4 mr-2" />
              No, Revise Approach
            </Button>
            
            <Button 
              variant={readyToAdvance === true ? "default" : "outline"}
              className={readyToAdvance === true ? "bg-green-600 hover:bg-green-700" : ""} 
              onClick={() => setReadyToAdvance(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Yes, Ready to Proceed
            </Button>
          </div>
          
          {readyToAdvance === false && (
            <div className="mt-4 text-sm text-muted-foreground">
              Consider revisiting earlier steps to adjust your approach before proceeding.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button onClick={handleCompletePhase} disabled={readyToAdvance !== true}>
          Complete Phase
        </Button>
      </CardFooter>
    </Card>
  );
};

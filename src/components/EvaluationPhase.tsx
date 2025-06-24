
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, ArrowRight, Upload, Check, Star } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { 
  RiskAssessment,  
  ImpactGoalCheck, 
  EvaluationDecision 
} from "@/types/development-phase";
import { StakeholderFeedback } from "@/types/evaluation-phase";
import { useForm } from "react-hook-form";

type EvaluationPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const EvaluationPhase = ({ onUpdateProgress, onCompletePhase }: EvaluationPhaseProps) => {
  const {
    evaluationTestResults,
    setEvaluationTestResults,
    evaluationImpactGoalChecks,
    setEvaluationImpactGoalChecks,
    evaluationRiskAssessments,
    setEvaluationRiskAssessments,
    evaluationStakeholderFeedback,
    setEvaluationStakeholderFeedback,
    evaluationDecision,
    setEvaluationDecision,
    evaluationJustification,
    setEvaluationJustification,
    reflectionAnswers,
  } = useProject();
  
  const [activeTab, setActiveTab] = useState("testing");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentFeedbackItem, setCurrentFeedbackItem] = useState<StakeholderFeedback>({
    id: "",
    name: "",
    role: "",
    notes: "",
    rating: 3
  });

  // Calculate progress
  const updateProgress = () => {
    if (!onUpdateProgress) return;
    
    // A step is considered complete based on these conditions
    const testingComplete = !!evaluationTestResults.trim();
    
    const impactGoalComplete = evaluationImpactGoalChecks.every(
      check => check.notes.trim() !== ""
    );
    
    const riskAssessmentComplete = evaluationRiskAssessments.every(
      risk => risk.level !== "unknown" && risk.notes.trim() !== ""
    );
    
    const stakeholderFeedbackComplete = evaluationStakeholderFeedback.length > 0;
    
    const decisionComplete = !!evaluationDecision && !!evaluationJustification.trim();
    
    // Count completed steps
    const completedSteps = [
      testingComplete,
      impactGoalComplete,
      riskAssessmentComplete,
      stakeholderFeedbackComplete,
      decisionComplete
    ].filter(Boolean).length;
    
    onUpdateProgress(completedSteps, 5);
  };

  // Update impact goal check
  const handleImpactGoalChange = (id: string, field: keyof ImpactGoalCheck, value: any) => {
    setEvaluationImpactGoalChecks(prev => 
      prev.map(check => 
        check.id === id ? { ...check, [field]: value } : check
      )
    );
    updateProgress();
  };

  // Update risk assessment
  const handleRiskAssessmentChange = (id: string, field: keyof RiskAssessment, value: any) => {
    setEvaluationRiskAssessments(prev => 
      prev.map(risk => 
        risk.id === id ? { ...risk, [field]: value } : risk
      )
    );
    updateProgress();
  };

  // Handle adding new feedback
  const handleAddFeedback = () => {
    if (!currentFeedbackItem.name || !currentFeedbackItem.role) return;
    
    const newFeedback = {
      ...currentFeedbackItem,
      id: `feedback-${Date.now()}`
    };
    
    setCurrentFeedbackItem({
      id: "",
      name: "",
      role: "",
      notes: "",
      rating: 3
    });
    
    updateProgress();
  };

  // Handle updating test results
  const handleTestResultsChange = (value: string) => {
    setEvaluationTestResults(value);
    updateProgress();
  };

  // Handle decision selection
  const handleDecisionChange = (decision: EvaluationDecision) => {
    setEvaluationDecision(decision);
    updateProgress();
  };

  // Handle justification change
  const handleJustificationChange = (value: string) => {
    setEvaluationJustification(value);
    updateProgress();
  };

  // Check if all required fields are filled
  const canCompletePhase = () => {
    return (
      !!evaluationTestResults.trim() &&
      evaluationImpactGoalChecks.every(check => check.notes.trim() !== "") &&
      evaluationRiskAssessments.every(risk => risk.level !== "unknown" && risk.notes.trim() !== "") &&
      evaluationStakeholderFeedback.length > 0 &&
      !!evaluationDecision &&
      !!evaluationJustification.trim()
    );
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateProgress();
  };

  // Handle complete phase
  const handleCompletePhase = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Evaluation Phase?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete the Evaluation Phase? This will mark this phase as complete and move you to the next step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompletePhase}>
              Complete Phase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Evaluation Phase</h2>
        <p className="text-muted-foreground">
          Evaluate your prototype and assess its impact, risks, and alignment with goals.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1">
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>

        {/* Testing Environment Tab */}
        <TabsContent value="testing" className="flex flex-col h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Prototype Testing Environment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-data">Test Data Input</Label>
                  <div className="flex items-center mt-1">
                    <Input id="test-data" placeholder="Enter test data..." className="flex-1 mr-2" />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSV
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Model Output Preview</h3>
                  <div className="h-40 flex items-center justify-center border border-dashed rounded-md bg-background">
                    <p className="text-sm text-muted-foreground">Preview will appear here...</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="test-notes">Testing Notes</Label>
                  <Textarea 
                    id="test-notes"
                    placeholder="Document your observations about the model's performance..."
                    className="min-h-[120px] mt-1"
                    value={evaluationTestResults}
                    onChange={(e) => handleTestResultsChange(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <div />
            <Button onClick={() => handleTabChange("impact")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Impact Goal Alignment Tab */}
        <TabsContent value="impact" className="flex flex-col h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Impact Goal Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4 bg-muted/30">
                  <h3 className="font-medium mb-2">Original Goal (from Reflection Phase)</h3>
                  <p className="text-sm">
                    {reflectionAnswers['problem_definition']?.substring(0, 200) || "No reflection data available."}
                    {reflectionAnswers['problem_definition']?.length > 200 ? "..." : ""}
                  </p>
                </div>

                {evaluationImpactGoalChecks.map(check => (
                  <div key={check.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{check.question}</Label>
                      <div className="flex items-center">
                        <Label htmlFor={`aligned-${check.id}`} className="mr-2 text-sm">Aligned?</Label>
                        <input 
                          id={`aligned-${check.id}`}
                          type="checkbox" 
                          checked={check.isAligned}
                          onChange={(e) => handleImpactGoalChange(check.id, "isAligned", e.target.checked)}
                          className="form-checkbox h-4 w-4"
                        />
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Add your notes here..."
                      value={check.notes}
                      onChange={(e) => handleImpactGoalChange(check.id, "notes", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => handleTabChange("testing")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleTabChange("risk")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Risk & Harm Assessment Tab */}
        <TabsContent value="risk" className="flex flex-col h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Risk & Harm Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evaluationRiskAssessments.map(risk => (
                  <div key={risk.id} className="space-y-4">
                    <h3 className="font-medium">{risk.category}</h3>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Risk Level:</span>
                        <span className="font-medium">
                          {risk.level === "unknown" ? "Not assessed" : risk.level.charAt(0).toUpperCase() + risk.level.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-4">
                        {(["low", "medium", "high"] as const).map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={`${risk.id}-${level}`}
                              name={`${risk.id}-level`}
                              checked={risk.level === level}
                              onChange={() => handleRiskAssessmentChange(risk.id, "level", level)}
                              className="form-radio h-4 w-4"
                            />
                            <Label htmlFor={`${risk.id}-${level}`} className="text-sm">
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Describe potential risks and mitigation strategies..."
                        value={risk.notes}
                        onChange={(e) => handleRiskAssessmentChange(risk.id, "notes", e.target.value)}
                        className="min-h-[80px] mt-1"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <Label htmlFor="failure-modes">Known Failure Modes</Label>
                  <Textarea 
                    id="failure-modes"
                    placeholder="Document any known edge cases or situations where the model fails..."
                    className="min-h-[80px] mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => handleTabChange("impact")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleTabChange("feedback")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        {/* Stakeholder Feedback Tab */}
        <TabsContent value="feedback" className="flex flex-col h-full">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Feedback from Users or Experts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Add New Feedback</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="reviewer-name">Reviewer Name</Label>
                      <Input 
                        id="reviewer-name"
                        value={currentFeedbackItem.name}
                        onChange={(e) => setCurrentFeedbackItem(prev => ({...prev, name: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="reviewer-role">Role/Expertise</Label>
                      <Input 
                        id="reviewer-role"
                        value={currentFeedbackItem.role}
                        onChange={(e) => setCurrentFeedbackItem(prev => ({...prev, role: e.target.value}))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="feedback-notes">Feedback Notes</Label>
                    <Textarea 
                      id="feedback-notes"
                      value={currentFeedbackItem.notes}
                      onChange={(e) => setCurrentFeedbackItem(prev => ({...prev, notes: e.target.value}))}
                      className="min-h-[80px] mt-1"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <Label>Rating</Label>
                      <span className="text-sm">{currentFeedbackItem.rating}/5</span>
                    </div>
                    <Slider
                      value={[currentFeedbackItem.rating]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(values) => setCurrentFeedbackItem(prev => ({...prev, rating: values[0]}))}
                    />
                  </div>
                  
                  <Button onClick={handleAddFeedback} className="w-full">
                    Add Feedback
                  </Button>
                </div>

              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => handleTabChange("risk")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => handleTabChange("decision")}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};


import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PipelineType, 
  PipelineTemplate, 
  EthicalGuardrail, 
  PrototypeMilestone,
  TestResult,
  EvaluationCriteria,
  DevelopmentDecision
} from "@/types/development-phase";
import { useProject } from "@/contexts/ProjectContext";

// Mock data for pipeline templates
const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  { 
    id: "classification", 
    name: "Classification Pipeline", 
    type: "classification", 
    description: "For categorizing data into predefined classes", 
    icon: "tag" 
  },
  { 
    id: "regression", 
    name: "Regression Pipeline", 
    type: "regression", 
    description: "For predicting continuous numerical values", 
    icon: "line-chart" 
  },
  { 
    id: "forecasting", 
    name: "Forecasting Pipeline", 
    type: "forecasting", 
    description: "For predicting future values based on historical data", 
    icon: "trending-up" 
  },
  { 
    id: "clustering", 
    name: "Clustering Pipeline", 
    type: "clustering", 
    description: "For grouping similar data points together", 
    icon: "group" 
  },
  { 
    id: "nlp", 
    name: "NLP Pipeline", 
    type: "nlp", 
    description: "For processing and analyzing natural language", 
    icon: "message-square" 
  },
  { 
    id: "computer-vision", 
    name: "Computer Vision Pipeline", 
    type: "computer-vision", 
    description: "For analyzing and processing visual data", 
    icon: "eye" 
  },
  { 
    id: "tabular", 
    name: "Tabular Data Pipeline", 
    type: "tabular", 
    description: "For processing structured tabular data", 
    icon: "table" 
  }
];

// Initial ethical guardrails
const INITIAL_GUARDRAILS: EthicalGuardrail[] = [
  { 
    id: "fairness", 
    name: "Fairness Metrics", 
    description: "Select appropriate fairness metrics for your model", 
    completed: false 
  },
  { 
    id: "privacy", 
    name: "Privacy Preservation", 
    description: "Implement privacy-preserving mechanisms", 
    completed: false 
  },
  { 
    id: "bias", 
    name: "Bias Mitigation", 
    description: "Apply bias detection and mitigation techniques", 
    completed: false 
  },
  { 
    id: "alignment", 
    name: "Stakeholder Alignment", 
    description: "Ensure solution aligns with stakeholder needs and expectations", 
    completed: false 
  }
];

// Initial prototype milestones
const INITIAL_MILESTONES: PrototypeMilestone[] = [
  { 
    id: "data-prep", 
    name: "Data Preprocessing", 
    description: "Clean, transform, and prepare data for modeling", 
    completed: false 
  },
  { 
    id: "feature-eng", 
    name: "Feature Engineering", 
    description: "Create and select relevant features", 
    completed: false 
  },
  { 
    id: "model-train", 
    name: "Model Training", 
    description: "Train and optimize your model", 
    completed: false 
  },
  { 
    id: "model-eval", 
    name: "Model Evaluation", 
    description: "Evaluate model performance using appropriate metrics", 
    completed: false 
  },
  { 
    id: "prototype", 
    name: "Build Prototype", 
    description: "Create a functional prototype of your solution", 
    completed: false 
  }
];

// Initial evaluation criteria
const INITIAL_EVALUATION_CRITERIA: EvaluationCriteria[] = [
  { 
    id: "goal-achievement", 
    question: "Did the model achieve its intended goal?", 
    answer: "unknown", 
    notes: "" 
  },
  { 
    id: "interpretability", 
    question: "Are outputs interpretable and explainable?", 
    answer: "unknown", 
    notes: "" 
  },
  { 
    id: "unintended-consequences", 
    question: "Were any unintended consequences identified?", 
    answer: "unknown", 
    notes: "" 
  },
  { 
    id: "bias-detection", 
    question: "Was bias or potential harm detected?", 
    answer: "unknown", 
    notes: "" 
  }
];

type DevelopmentPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const DevelopmentPhase = ({ onUpdateProgress, onCompletePhase }: DevelopmentPhaseProps) => {
  const { 
    developmentSelectedPipeline, 
    setDevelopmentSelectedPipeline,
    developmentGuardrails,
    setDevelopmentGuardrails,
    developmentMilestones,
    setDevelopmentMilestones,
    developmentTestResults,
    setDevelopmentTestResults,
    developmentEvaluationCriteria,
    setDevelopmentEvaluationCriteria,
    developmentDecision,
    setDevelopmentDecision
  } = useProject();

  const [activeTab, setActiveTab] = useState("pipeline");
  const [newTest, setNewTest] = useState<Partial<TestResult>>({ inputs: "", outputs: "", notes: "" });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Initialize state from context or use defaults
  const [guardrails, setGuardrails] = useState<EthicalGuardrail[]>(
    developmentGuardrails?.length ? developmentGuardrails : INITIAL_GUARDRAILS
  );
  const [milestones, setMilestones] = useState<PrototypeMilestone[]>(
    developmentMilestones?.length ? developmentMilestones : INITIAL_MILESTONES
  );
  const [testResults, setTestResults] = useState<TestResult[]>(
    developmentTestResults || []
  );
  const [evaluationCriteria, setEvaluationCriteria] = useState<EvaluationCriteria[]>(
    developmentEvaluationCriteria?.length ? developmentEvaluationCriteria : INITIAL_EVALUATION_CRITERIA
  );
  const [selectedPipeline, setSelectedPipeline] = useState<string>(
    developmentSelectedPipeline || ""
  );
  const [decision, setDecision] = useState<DevelopmentDecision>(
    developmentDecision || null
  );

  // Calculate progress
  const calculateProgress = () => {
    let totalItems = 0;
    let completedItems = 0;

    // Pipeline selection (1 item)
    totalItems++;
    if (selectedPipeline) completedItems++;

    // Guardrails (each is an item)
    totalItems += guardrails.length;
    completedItems += guardrails.filter(g => g.completed).length;

    // Milestones (each is an item)
    totalItems += milestones.length;
    completedItems += milestones.filter(m => m.completed).length;

    // Test results (at least 1 expected)
    totalItems++;
    if (testResults.length > 0) completedItems++;

    // Evaluation criteria (each with an answer other than 'unknown' is completed)
    totalItems += evaluationCriteria.length;
    completedItems += evaluationCriteria.filter(c => c.answer !== 'unknown').length;

    // Final decision (1 item)
    totalItems++;
    if (decision) completedItems++;

    return { completedItems, totalItems };
  };

  // Update progress whenever relevant state changes
  const updateProgress = () => {
    if (!onUpdateProgress) return;
    
    const { completedItems, totalItems } = calculateProgress();
    onUpdateProgress(completedItems, totalItems);
    
    // Save state to context
    setDevelopmentSelectedPipeline(selectedPipeline);
    setDevelopmentGuardrails(guardrails);
    setDevelopmentMilestones(milestones);
    setDevelopmentTestResults(testResults);
    setDevelopmentEvaluationCriteria(evaluationCriteria);
    setDevelopmentDecision(decision);
  };

  // Handle pipeline selection
  const handleSelectPipeline = (pipelineId: string) => {
    setSelectedPipeline(pipelineId);
    updateProgress();
  };

  // Handle guardrail toggling
  const handleToggleGuardrail = (id: string) => {
    setGuardrails(guardrails.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
    updateProgress();
  };

  // Handle milestone toggling
  const handleToggleMilestone = (id: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
    updateProgress();
  };

  // Handle adding a new test result
  const handleAddTestResult = () => {
    if (!newTest.inputs || !newTest.outputs) return;
    
    const testResult: TestResult = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      inputs: newTest.inputs || "",
      outputs: newTest.outputs || "",
      notes: newTest.notes || ""
    };
    
    setTestResults([...testResults, testResult]);
    setNewTest({ inputs: "", outputs: "", notes: "" });
    updateProgress();
  };

  // Handle updating evaluation criteria
  const handleUpdateCriteria = (id: string, answer: 'yes' | 'no' | 'partially' | 'unknown', notes: string = "") => {
    setEvaluationCriteria(evaluationCriteria.map(c => 
      c.id === id ? { ...c, answer, notes } : c
    ));
    updateProgress();
  };

  // Handle final decision
  const handleSetDecision = (newDecision: DevelopmentDecision) => {
    setDecision(newDecision);
    updateProgress();
    
    if (newDecision === 'proceed') {
      setConfirmDialogOpen(true);
    }
  };

  // Handle phase completion
  const handleCompletePhase = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
    setConfirmDialogOpen(false);
  };

  // Calculate current progress for the progress bar
  const { completedItems, totalItems } = calculateProgress();
  const progressPercentage = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="flex flex-col space-y-6">
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Development Phase?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete the Development Phase and move to Evaluation? This action cannot be undone.
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

      <div>
        <h2 className="text-2xl font-bold mb-2">Development Phase</h2>
        <p className="text-muted-foreground mb-4">
          Build and test your AI solution with ethical considerations in mind.
        </p>
        
        <div className="mb-6 flex items-center">
          <div className="flex-1 mr-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {completedItems} of {totalItems} completed
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
        </TabsList>
        
        {/* 1. AI Pipeline Builder */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Pipeline Builder</CardTitle>
              <CardDescription>
                Select a template or build a custom AI pipeline for your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PIPELINE_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all ${selectedPipeline === template.id ? 'border-primary border-2' : 'hover:border-primary/50'}`}
                    onClick={() => handleSelectPipeline(template.id)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button 
              onClick={() => setActiveTab("guardrails")} 
              disabled={!selectedPipeline}
            >
              Next: Configure Guardrails
            </Button>
          </div>
        </TabsContent>
        
        {/* 2. Ethical Guardrails Configurator */}
        <TabsContent value="guardrails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ethical Guardrails</CardTitle>
              <CardDescription>
                Configure ethical safeguards for your AI solution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {guardrails.map((guardrail) => (
                  <div key={guardrail.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`guardrail-${guardrail.id}`} 
                      checked={guardrail.completed}
                      onCheckedChange={() => handleToggleGuardrail(guardrail.id)}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor={`guardrail-${guardrail.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {guardrail.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {guardrail.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("pipeline")}>
              Back: Pipeline
            </Button>
            <Button 
              onClick={() => setActiveTab("workspace")} 
              disabled={guardrails.every(g => !g.completed)}
            >
              Next: Workspace
            </Button>
          </div>
        </TabsContent>
        
        {/* 3. Prototype/Implementation Workspace */}
        <TabsContent value="workspace" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Implementation Workspace</CardTitle>
              <CardDescription>
                Build your prototype and track development milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Development Environment</h4>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="code-editor">Code Editor</SelectItem>
                    <SelectItem value="notebook">Jupyter Notebook</SelectItem>
                    <SelectItem value="huggingface">Hugging Face Spaces</SelectItem>
                    <SelectItem value="colab">Google Colab</SelectItem>
                    <SelectItem value="low-code">Low-code Builder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium">Development Milestones</h4>
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={`milestone-${milestone.id}`} 
                      checked={milestone.completed}
                      onCheckedChange={() => handleToggleMilestone(milestone.id)}
                    />
                    <div className="space-y-1">
                      <label 
                        htmlFor={`milestone-${milestone.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {milestone.name}
                      </label>
                      <p className="text-sm text-muted-foreground">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("guardrails")}>
              Back: Guardrails
            </Button>
            <Button 
              onClick={() => setActiveTab("simulation")} 
              disabled={milestones.every(m => !m.completed)}
            >
              Next: Simulation
            </Button>
          </div>
        </TabsContent>
        
        {/* 4. Simulation & Test Environment */}
        <TabsContent value="simulation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation & Test Environment</CardTitle>
              <CardDescription>
                Test your model with real data and capture the results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="test-input" className="text-sm font-medium">
                      Test Input Data
                    </label>
                    <Textarea 
                      id="test-input" 
                      placeholder="Enter test inputs or scenarios here"
                      value={newTest.inputs}
                      onChange={(e) => setNewTest({ ...newTest, inputs: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label htmlFor="test-output" className="text-sm font-medium">
                      Test Output/Results
                    </label>
                    <Textarea 
                      id="test-output" 
                      placeholder="Enter test outputs or results here"
                      value={newTest.outputs}
                      onChange={(e) => setNewTest({ ...newTest, outputs: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="test-notes" className="text-sm font-medium">
                    Notes & Observations
                  </label>
                  <Textarea 
                    id="test-notes" 
                    placeholder="Any notes or observations about the test"
                    value={newTest.notes}
                    onChange={(e) => setNewTest({ ...newTest, notes: e.target.value })}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleAddTestResult} disabled={!newTest.inputs || !newTest.outputs}>
                    Save Test Result
                  </Button>
                </div>
                
                {testResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Previous Test Results</h4>
                    <div className="space-y-2">
                      {testResults.map((result) => (
                        <Card key={result.id} className="p-4">
                          <div className="text-xs text-muted-foreground mb-2">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm mb-1">
                            <span className="font-medium">Input:</span> {result.inputs}
                          </div>
                          <div className="text-sm mb-1">
                            <span className="font-medium">Output:</span> {result.outputs}
                          </div>
                          {result.notes && (
                            <div className="text-sm">
                              <span className="font-medium">Notes:</span> {result.notes}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("workspace")}>
              Back: Workspace
            </Button>
            <Button 
              onClick={() => setActiveTab("evaluation")} 
              disabled={testResults.length === 0}
            >
              Next: Evaluation
            </Button>
          </div>
        </TabsContent>
        
        {/* 5. Prototype Evaluation Checklist */}
        <TabsContent value="evaluation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prototype Evaluation</CardTitle>
              <CardDescription>
                Assess your prototype against key criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {evaluationCriteria.map((criteria) => (
                  <div key={criteria.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {criteria.question}
                    </label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={criteria.answer === "yes" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleUpdateCriteria(criteria.id, "yes")}
                      >
                        Yes
                      </Button>
                      <Button 
                        variant={criteria.answer === "no" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleUpdateCriteria(criteria.id, "no")}
                      >
                        No
                      </Button>
                      <Button 
                        variant={criteria.answer === "partially" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleUpdateCriteria(criteria.id, "partially")}
                      >
                        Partially
                      </Button>
                      <Button 
                        variant={criteria.answer === "unknown" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => handleUpdateCriteria(criteria.id, "unknown")}
                      >
                        Unknown
                      </Button>
                    </div>
                    <Textarea 
                      placeholder="Additional notes (optional)"
                      value={criteria.notes}
                      onChange={(e) => handleUpdateCriteria(criteria.id, criteria.answer, e.target.value)}
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("simulation")}>
              Back: Simulation
            </Button>
            <Button 
              onClick={() => setActiveTab("decision")} 
              disabled={evaluationCriteria.some(c => c.answer === "unknown")}
            >
              Next: Final Decision
            </Button>
          </div>
        </TabsContent>
        
        {/* 6. Final Decision Block */}
        <TabsContent value="decision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Final Decision</CardTitle>
              <CardDescription>
                Decide how to proceed with your AI project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all p-4 ${decision === 'proceed' ? 'border-primary border-2' : 'hover:border-primary/50'}`}
                    onClick={() => handleSetDecision('proceed')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">✅</div>
                      <h3 className="font-medium">Proceed to Evaluation</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        The prototype is ready for formal evaluation
                      </p>
                    </div>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all p-4 ${decision === 'iterate' ? 'border-primary border-2' : 'hover:border-primary/50'}`}
                    onClick={() => handleSetDecision('iterate')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔁</div>
                      <h3 className="font-medium">Iterate Prototype</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        The prototype needs further refinement
                      </p>
                    </div>
                  </Card>
                  
                  <Card 
                    className={`cursor-pointer transition-all p-4 ${decision === 'revisit' ? 'border-primary border-2' : 'hover:border-primary/50'}`}
                    onClick={() => handleSetDecision('revisit')}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">❌</div>
                      <h3 className="font-medium">Revisit Scoping</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fundamental issues require re-evaluation
                      </p>
                    </div>
                  </Card>
                </div>
                
                {decision && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Decision Summary</h4>
                    {decision === 'proceed' && (
                      <p className="text-sm">
                        Your prototype is ready for formal evaluation. The next phase will include more in-depth assessment of your AI solution's impact and performance.
                      </p>
                    )}
                    {decision === 'iterate' && (
                      <p className="text-sm">
                        Your prototype needs further refinement. Review your test results and evaluation criteria to identify areas for improvement.
                      </p>
                    )}
                    {decision === 'revisit' && (
                      <p className="text-sm">
                        There are fundamental issues with your current approach. It's recommended to revisit the scoping phase to redefine your project goals and constraints.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("evaluation")}>
              Back: Evaluation
            </Button>
            <Button 
              onClick={() => setConfirmDialogOpen(true)} 
              disabled={!decision || decision !== 'proceed'}
            >
              Complete Development Phase
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, AlertTriangle, Loader2, Users, Clock, Wifi, CheckCircle, Target, Database, BarChart3, Globe, ExternalLink, ArrowRight, RefreshCw } from "lucide-react";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck, ScopingCompletionData } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { scopingApi } from "@/lib/scoping-api";
import { useState } from "react";

type FinalFeasibilityGateProps = {
  selectedUseCase: UseCase | null;
  selectedDataset: Dataset | null;
  constraints: FeasibilityConstraint[];
  feasibilityScore: number;
  feasibilityLevel: 'high' | 'medium' | 'low'; // Changed from feasibilityRisk
  suitabilityChecks: DataSuitabilityCheck[];
  suitabilityScore: number;
  readyToAdvance: boolean;
  setReadyToAdvance: (value: boolean) => void;
  moveToPreviousStep: () => void;
  handleCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  resetPhase: () => void;
};

export const FinalFeasibilityGate = ({
  selectedUseCase,
  selectedDataset,
  constraints,
  feasibilityScore,
  feasibilityLevel,
  suitabilityChecks,
  suitabilityScore,
  readyToAdvance,
  setReadyToAdvance,
  moveToPreviousStep,
  handleCompletePhase,
  updatePhaseStatus,
  resetPhase,
}: FinalFeasibilityGateProps) => {

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId') || 'current';
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleReadyToProceed = () => {
    setReadyToAdvance(true);
    setSubmitError(null);
  };
  
  const handleReviseApproach = () => {
    setReadyToAdvance(false);
    setSubmitError(null);
  };
  
  const onCompletePhase = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      console.log("FinalFeasibilityGate: Complete Phase clicked");
      
      // Create placeholder data if selections are missing
      const useCaseData: UseCase = selectedUseCase || {
        id: "no_use_case_selected",
        title: "Custom AI Solution",
        description: "Proceeding without a specific predefined use case",
        category: "Custom",
        complexity: "medium",
        source: "",
        source_url: '',
        type: "Custom",
        tags: ["Custom Solution"],
        selected: true,
        how_it_works: "Custom implementation based on project needs",
        real_world_impact: "To be determined based on implementation"
      };

      const datasetData: Dataset = selectedDataset || {
        name: "Custom Dataset",
        source: "User-provided data", 
        url: '',
        description: "Using user-provided data for the project",
        size_estimate: "Unknown",
        data_types: [],
        ethical_concerns: [],
        id: "custom_dataset",
        title: "Custom Dataset",
        format: "Various",
        size: "Unknown",
        license: "Various"
      };
      
      // Helper functions aligned with humanitarian focus
      const getSuitabilityLevel = (score: number): 'excellent' | 'good' | 'moderate' | 'poor' => {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'moderate';
        return 'poor';
      };

      const extractHumanitarianConstraints = (constraints: FeasibilityConstraint[]): string[] => {
        const constraintMap: {
          [key: string]: { values: (string | boolean)[]; label: string }
        } = {
          'budget': { values: ['limited'], label: 'Limited Budget' },
          'stakeholder-support': { values: ['low'], label: 'Low Stakeholder Support' },
          'ai-experience': { values: ['none'], label: 'No AI Experience' },
          'time': { values: ['short-term'], label: 'Tight Timeline' },
          'internet': { values: [false], label: 'Connectivity Issues' },
          'technical-skills': { values: ['limited'], label: 'Technical Skills Gap' }
        };

        return constraints
          .filter(c => {
            const mapping = constraintMap[c.id as keyof typeof constraintMap];
            return mapping && mapping.values.includes(c.value);
          })
          .map(c => constraintMap[c.id as keyof typeof constraintMap].label)
          .slice(0, 3); // Top 3 constraints
      };

      const generateSimpleReasoning = (
        readyToProceed: boolean,
        feasibilityScore: number,
        suitabilityScore: number,
        constraints: FeasibilityConstraint[]
      ): string => {
        if (readyToProceed) {
          const strengths = [];
          if (feasibilityScore >= 70) strengths.push("strong project foundations");
          if (suitabilityScore >= 60) strengths.push("suitable data available");
          
          const constraintIssues = extractHumanitarianConstraints(constraints);
          if (constraintIssues.length === 0) strengths.push("no major barriers identified");
          
          return `Project is ready to proceed with ${strengths.join(", ")}. ${
            constraintIssues.length > 0 ? `Areas to monitor: ${constraintIssues.join(", ")}.` : ""
          }`;
        } else {
          const issues = [];
          if (feasibilityScore < 50) issues.push("needs stronger foundations");
          if (suitabilityScore < 40) issues.push("data concerns need addressing");
          
          const constraintIssues = extractHumanitarianConstraints(constraints);
          if (constraintIssues.length > 0) issues.push("resource limitations");
          
          return `Recommend strengthening project setup: ${issues.join(", ")}. Consider revisiting earlier steps.`;
        }
      };
      
      // Prepare scoping completion data
      const scopingCompletionData: ScopingCompletionData = {
        selected_use_case: useCaseData,
        selected_dataset: datasetData,
        feasibility_summary: {
          overall_percentage: feasibilityScore,
          feasibility_level: feasibilityLevel,
          key_constraints: extractHumanitarianConstraints(constraints)
        },
        data_suitability: {
          percentage: suitabilityScore,
          suitability_level: getSuitabilityLevel(suitabilityScore)
        },
        constraints: constraints.map(c => ({
          id: c.id,
          label: c.label,
          value: c.value,
          type: c.type
        })),
        suitability_checks: suitabilityChecks.map(c => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          description: c.description
        })),
        active_step: 5,
        ready_to_proceed: readyToAdvance,
        reasoning: generateSimpleReasoning(
          readyToAdvance, 
          feasibilityScore, 
          suitabilityScore, 
          constraints
        )
      };

      console.log('Submitting scoping completion data:', scopingCompletionData);

      // Submit scoping phase data to backend
      const response = await scopingApi.completeScopingPhase(projectId, scopingCompletionData);
      
      if (response.success) {
        console.log('Scoping phase completion response:', response);
        handleCompletePhase();
      } else {
        throw new Error(response.message || 'Failed to complete scoping phase');
      }
      
    } catch (error) {
      console.error('Failed to complete scoping phase:', error);
      setSubmitError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRevisePhase = () => {
    resetPhase();
  };

  const getProjectStrengths = () => {
    const strengths = [];
    
    // Check for organizational strengths
    const stakeholderSupport = constraints.find(c => c.id === "stakeholder-support")?.value;
    if (stakeholderSupport === "high" || stakeholderSupport === "champion") {
      strengths.push("Strong organizational support");
    }
    
    // Check for resource strengths
    const budget = constraints.find(c => c.id === "budget")?.value;
    if (budget === "substantial" || budget === "unlimited") {
      strengths.push("Good budget allocation");
    }
    
    // Check for infrastructure strengths
    const internet = constraints.find(c => c.id === "internet")?.value;
    const infrastructure = constraints.find(c => c.id === "infrastructure")?.value;
    if (internet && infrastructure) {
      strengths.push("Solid technical setup");
    }
    
    return strengths;
  };

  const getAreasToImprove = () => {
    const constraintMap: {
      [key: string]: { values: (string | boolean)[]; label: string }
    } = {
      'budget': { values: ['limited'], label: 'Limited Budget' },
      'stakeholder-support': { values: ['low'], label: 'Low Stakeholder Support' },
      'ai-experience': { values: ['none'], label: 'No AI Experience' },
      'time': { values: ['short-term'], label: 'Tight Timeline' },
      'internet': { values: [false], label: 'Connectivity Issues' },
      'technical-skills': { values: ['limited'], label: 'Technical Skills Gap' }
    };

    const constraintIssues = constraints
      .filter(c => {
        const mapping = constraintMap[c.id as keyof typeof constraintMap];
        return mapping && mapping.values.includes(c.value);
      })
      .map(c => constraintMap[c.id as keyof typeof constraintMap].label)
      .slice(0, 3);

    return constraintIssues.map(issue => ({
      area: issue,
      icon: getConstraintIcon(issue)
    }));
  };

  const getConstraintIcon = (constraint: string) => {
    if (constraint.includes('Support')) return <Users className="h-4 w-4" />;
    if (constraint.includes('Timeline')) return <Clock className="h-4 w-4" />;
    if (constraint.includes('Connectivity')) return <Wifi className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const overallReadiness = Math.round((feasibilityScore * 0.6) + (suitabilityScore * 0.4));
  const projectStrengths = getProjectStrengths();
  const areasToImprove = getAreasToImprove();

  // Component for displaying phase completion status
  const PhaseCompletionStatus = ({ title, completed, score }: { title: string, completed: boolean, score?: number }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 dark:bg-muted/20">
      <div className="flex items-center gap-2">
        {completed ? (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-orange-500 dark:text-orange-400" />
        )}
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      {score !== undefined && (
        <Badge variant={completed ? "default" : "secondary"} className="text-xs">
          {score}%
        </Badge>
      )}
    </div>
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={5} title="Project Readiness Summary" />
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Review your project setup and decide if you're ready to move forward with development.
        </p>
        
        {submitError && (
          <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="font-medium">Submission Error</span>
            </div>
            <p className="text-destructive/80 text-sm mt-1">{submitError}</p>
          </div>
        )}

        {/* Overall Readiness Score */}
        <Card className="border-2 border-border shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Overall Project Readiness</h3>
              <div className="text-4xl font-bold text-primary mb-2">{overallReadiness}%</div>
              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant={feasibilityLevel === 'high' ? 'default' : feasibilityLevel === 'medium' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {feasibilityLevel === 'high' ? 'HIGH FEASIBILITY' : 
                   feasibilityLevel === 'medium' ? 'MEDIUM FEASIBILITY' : 'LOW FEASIBILITY'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {feasibilityLevel === 'high' ? 'Ready to proceed' : 
                   feasibilityLevel === 'medium' ? 'Good with some planning' : 
                   'Needs strengthening'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-green-800 dark:text-green-400">Your Strengths</h4>
                {projectStrengths.length > 0 ? (
                  <ul className="space-y-2">
                    {projectStrengths.map((strength, index) => (
                      <li key={index} className="flex items-center text-sm text-green-700 dark:text-green-300">
                        <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Focus on building stronger foundations</p>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3 text-orange-800 dark:text-orange-400">Areas to Monitor</h4>
                {areasToImprove.length > 0 ? (
                  <ul className="space-y-2">
                    {areasToImprove.map((area, index) => (
                      <li key={index} className="flex items-center text-sm text-orange-700 dark:text-orange-300">
                        <span className="text-orange-600 dark:text-orange-400 mr-2">{area.icon}</span>
                        {area.area}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-700 dark:text-green-300">No major concerns identified</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Completion Overview */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4 text-foreground">Scoping Phase Overview</h3>
            <div className="space-y-3">
              <PhaseCompletionStatus 
                title="AI Use Case Selection" 
                completed={!!selectedUseCase}
              />
              <PhaseCompletionStatus 
                title="Project Feasibility Assessment" 
                completed={feasibilityScore > 0}
                score={feasibilityScore}
              />
              <PhaseCompletionStatus 
                title="Dataset Discovery" 
                completed={!!selectedDataset}
              />
              <PhaseCompletionStatus 
                title="Data Suitability Review" 
                completed={suitabilityChecks.some(c => c.answer !== 'unknown')}
                score={suitabilityScore}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Project Components Summary */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4 text-foreground">Selected Project Components</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  AI Approach
                </h4>
                {selectedUseCase ? (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{selectedUseCase.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedUseCase.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedUseCase.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {selectedUseCase.source_url && (
                      <a 
                        href={selectedUseCase.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View source
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-3 border border-muted rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Custom AI Solution</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Proceeding with general AI principles
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Source
                </h4>
                {selectedDataset ? (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{selectedDataset.title || selectedDataset.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {selectedDataset.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Size:</span> 
                        <span className="text-foreground ml-1">{selectedDataset.size || selectedDataset.size_estimate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Format:</span> 
                        <span className="text-foreground ml-1">{selectedDataset.format || "Various"}</span>
                      </div>
                    </div>
                    {selectedDataset.url && (
                      <a 
                        href={selectedDataset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View dataset
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="p-3 border border-muted rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">Custom Dataset</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Will work with user-provided data
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        {/* Decision Section */}
        <div className="text-center p-6 bg-muted/50 dark:bg-muted/20 rounded-lg">
          <h3 className="font-medium text-lg mb-3 text-foreground">Ready to Begin Development?</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Based on your project assessment, do you feel ready to start building your AI solution?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant={!readyToAdvance ? "default" : "outline"} 
              className={!readyToAdvance ? "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700" : ""}
              onClick={handleReviseApproach}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Not Yet - Need More Preparation
            </Button>
            
            <Button 
              variant={readyToAdvance ? "default" : "outline"}
              className={readyToAdvance ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700" : ""} 
              onClick={handleReadyToProceed}
              disabled={isSubmitting}
            >
              <Check className="h-4 w-4 mr-2" />
              Yes - Ready to Start Building
            </Button>
          </div>
          
          {!readyToAdvance && (
            <div className="mt-4 text-sm text-muted-foreground">
              Consider strengthening your foundations or adjusting your approach before proceeding.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep} disabled={isSubmitting}>
          Previous
        </Button>
        {readyToAdvance ? (
          <Button 
            onClick={onCompletePhase} 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Progress...
              </>
            ) : (
              <>
                Start Development Phase
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button 
            onClick={handleRevisePhase} 
            variant="secondary"
            disabled={isSubmitting}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Revise Project Setup
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
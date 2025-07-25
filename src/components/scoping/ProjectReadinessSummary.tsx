import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  CheckCircle, 
  Target, 
  Database, 
  BarChart3, 
  Globe, 
  ExternalLink, 
  ArrowRight, 
  ArrowLeft,
  RefreshCw,
  Server
} from "lucide-react";
import { UseCase, Dataset, DataSuitabilityCheck, ScopingCompletionData, TechnicalInfrastructure, InfrastructureAssessment } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { scopingApi } from "@/lib/scoping-api";
import { useState } from "react";

type ProjectReadinessSummaryProps = {
  selectedUseCase: UseCase | null;
  selectedDataset: Dataset | null;
  technicalInfrastructure: TechnicalInfrastructure;
  infrastructureAssessment: InfrastructureAssessment | null;
  suitabilityChecks: DataSuitabilityCheck[];
  suitabilityScore: number;
  readyToAdvance: boolean;
  setReadyToAdvance: (value: boolean) => void;
  moveToPreviousStep: () => void;
  handleCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  resetPhase: () => void;
};

export const ProjectReadinessSummary = ({
  selectedUseCase,
  selectedDataset,
  technicalInfrastructure,
  infrastructureAssessment,
  suitabilityChecks,
  suitabilityScore,
  readyToAdvance,
  setReadyToAdvance,
  moveToPreviousStep,
  handleCompletePhase,
  updatePhaseStatus,
  resetPhase,
}: ProjectReadinessSummaryProps) => {

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
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
      
      const getSuitabilityLevel = (score: number): 'excellent' | 'good' | 'moderate' | 'poor' => {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'moderate';
        return 'poor';
      };

      if (!infrastructureAssessment) {
        throw new Error('Infrastructure assessment is required');
      }
      
      const scopingCompletionData: ScopingCompletionData = {
        selected_use_case: useCaseData,
        selected_dataset: datasetData,
        infrastructure_assessment: infrastructureAssessment,
        data_suitability: {
          percentage: suitabilityScore,
          suitability_level: getSuitabilityLevel(suitabilityScore)
        },
        technical_infrastructure: technicalInfrastructure,
        suitability_checks: suitabilityChecks.map(c => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          description: c.description
        })),
        active_step: 5,
        ready_to_proceed: readyToAdvance,
        reasoning: `Project assessed with ${infrastructureAssessment.score}% infrastructure readiness and ${suitabilityScore}% data suitability.`
      };

      const response = await scopingApi.completeScopingPhase(projectId, scopingCompletionData);
      
      if (response.success) {
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

  const overallReadiness = infrastructureAssessment ? 
    Math.round((infrastructureAssessment.score * 0.7) + (suitabilityScore * 0.3)) : 
    Math.round(suitabilityScore);

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

        <Card className="border-2 border-border shadow-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Overall Project Readiness</h3>
              <div className="text-4xl font-bold text-primary mb-2">{overallReadiness}%</div>
              <div className="flex items-center justify-center gap-2">
                <Badge 
                  variant={overallReadiness >= 70 ? 'default' : overallReadiness >= 50 ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {overallReadiness >= 70 ? 'HIGH READINESS' : 
                   overallReadiness >= 50 ? 'MEDIUM READINESS' : 'LOW READINESS'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {overallReadiness >= 70 ? 'Ready to proceed' : 
                   overallReadiness >= 50 ? 'Good with some planning' : 
                   'Needs strengthening'}
                </span>
              </div>
            </div>

            {infrastructureAssessment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3 text-green-800 dark:text-green-400">Infrastructure Strengths</h4>
                  <ul className="space-y-2">
                    {infrastructureAssessment.recommendations.slice(0, 3).map((rec, index) => (
                      <li key={index} className="flex items-start text-sm text-green-700 dark:text-green-300">
                        <Check className="h-4 w-4 mr-2 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-orange-800 dark:text-orange-400">Infrastructure Assessment</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Score:</span>
                      <span className="text-foreground ml-2 font-medium">{infrastructureAssessment.score}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{infrastructureAssessment.reasoning}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4 text-foreground">Scoping Phase Overview</h3>
            <div className="space-y-3">
              <PhaseCompletionStatus 
                title="Technical Infrastructure Assessment" 
                completed={!!infrastructureAssessment}
                score={infrastructureAssessment?.score}
              />
              <PhaseCompletionStatus 
                title="AI Use Case Selection" 
                completed={!!selectedUseCase}
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

            {infrastructureAssessment && (
              <div className="mt-6">
                <h4 className="font-medium mb-3 text-foreground flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Technical Infrastructure
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Computing:</span>
                    <span className="text-foreground ml-2">{technicalInfrastructure.computing_resources}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Storage:</span>
                    <span className="text-foreground ml-2">{technicalInfrastructure.storage_data}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Connectivity:</span>
                    <span className="text-foreground ml-2">{technicalInfrastructure.internet_connectivity}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Deployment:</span>
                    <span className="text-foreground ml-2">{technicalInfrastructure.deployment_environment}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Separator />
        
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
          <ArrowLeft className="mr-2 h-4 w-4" />
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
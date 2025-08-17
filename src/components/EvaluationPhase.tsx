import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Circle,
  Upload,
  Download,
  PlayCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  FileText,
  Settings,
  Shield,
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Brain,
  Target,
  CheckSquare,
  X,
  Info,
  Lightbulb,
  Copy,
  Users,
  Rocket,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/useToast";
import { useEvaluationPhase } from "@/hooks/useEvaluationPhase";
import { AVAILABLE_DOCUMENTS } from "@/types/evaluation-phase";

interface EvaluationPhaseProps {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
  onReturnToDevelopment?: () => void;
}

const getDocumentIcon = (iconName: string) => {
  switch (iconName) {
    case "Download":
      return Download;
    case "FileText":
      return FileText;
    case "Settings":
      return Settings;
    case "Rocket":
      return Rocket;
    case "Shield":
      return Shield;
    case "Users":
      return Users;
    default:
      return FileText;
  }
};

export const EvaluationPhase = ({
  onUpdateProgress,
  onCompletePhase,
  onReturnToDevelopment,
}: EvaluationPhaseProps) => {
  const { toast } = useToast();
  const {
    currentStep,
    loading,
    error,
    evaluationContext,
    simulationResult,
    evaluationResult,
    evaluationLoading,
    simulationLoading,
    uploadedFile,

    steps,
    progressPercentage,

    setCurrentStep,
    handleFileUpload,
    runSimulation,
    regenerateScenarios,
    regeneratingScenarios,
    evaluateResults,
    downloadFile,
    retryLoading,
    canProceedToNextPhase,
    canDownloadProject,
  } = useEvaluationPhase();

  useEffect(() => {
    if (onUpdateProgress) {
      const completedSteps = steps.filter((s) => s.completed).length;
      onUpdateProgress(completedSteps, steps.length);
    }
  }, [steps, onUpdateProgress]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRunSimulation = async () => {
    try {
      await runSimulation();
    } catch (error) {}
  };

  const handleEvaluateResults = async () => {
    try {
      await evaluateResults();
    } catch (error) {}
  };

  const handleReturnToDevelopment = () => {
    if (evaluationResult && onReturnToDevelopment) {
      onReturnToDevelopment();
    } else if (onReturnToDevelopment) {
      onReturnToDevelopment();
    }
  };

  const handleCompleteProject = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description:
          "Development feedback has been copied and is ready to paste",
      });
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy Failed",
        description:
          "Unable to copy to clipboard. Please select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">
          Loading evaluation environment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">
            Error Loading Evaluation
          </h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={retryLoading} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!evaluationContext) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          Evaluation Phase
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Test your AI solution and download the complete project when satisfied
        </p>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {steps.filter((s) => s.completed).length} of {steps.length}{" "}
            completed
          </span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
              <span
                className={`text-sm ${
                  step.completed
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Generated Solution Review
              </CardTitle>
              <CardDescription>
                Review your generated AI solution before testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    Solution Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Title:</span>{" "}
                      {evaluationContext.selected_solution?.title ||
                        "AI Solution"}
                    </p>
                    <p>
                      <span className="font-medium">Generated:</span>{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge>Ready for Testing</Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
                    What's Included
                  </h4>
                  <div className="space-y-1 text-sm">
                    {evaluationContext.available_downloads?.map(
                      (download: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{download.replace("_", " ")}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Protected:</strong> Only statistical summaries
                  of your data are analyzed to assess compatibility. Your raw
                  data remains on your device and is never sent to our servers.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleReturnToDevelopment}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Development
            </Button>
            <Button onClick={() => setCurrentStep(1)}>Start Testing</Button>
          </div>
        </div>
      )}

      {currentStep === 1 && !evaluationContext.evaluation_bypass && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Test Your AI Solution Components
              </CardTitle>
              <CardDescription>
                {evaluationContext.simulation_capabilities.testing_method ===
                "dataset"
                  ? evaluationContext.simulation_capabilities.explanation
                  : "Test your generated AI components with realistic humanitarian scenarios to see actual outputs"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {evaluationContext.selected_solution?.llm_requirements && (
                <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>LLM Component Testing:</strong> We'll test your
                    generated system prompt with real scenarios using OpenAI LLM
                    models to show you actual outputs.
                  </AlertDescription>
                </Alert>
              )}

              {evaluationContext.selected_solution?.nlp_requirements && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>NLP Component Testing:</strong> We'll simulate your{" "}
                    {
                      evaluationContext.selected_solution.nlp_requirements
                        .processing_approach
                    }{" "}
                    pipeline with real scenarios to show expected processing
                    results.
                  </AlertDescription>
                </Alert>
              )}

              {evaluationContext.simulation_capabilities.testing_method ===
              "dataset" ? (
                <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <Upload className="h-8 w-8 mx-auto text-primary" />
                      <div>
                        <h3 className="font-medium mb-2">
                          Assess Dataset Compatibility
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Upload your dataset to check compatibility with this
                          AI solution and get suitability recommendations
                        </p>

                        <div className="space-y-3">
                          <Label
                            htmlFor="dataset-upload"
                            className="cursor-pointer"
                          >
                            <Input
                              id="dataset-upload"
                              type="file"
                              onChange={handleFileChange}
                              accept={evaluationContext.simulation_capabilities.data_formats_supported
                                .map((f) => `.${f}`)
                                .join(",")}
                              className="hidden"
                            />
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-primary transition-colors">
                              {uploadedFile ? (
                                <div className="text-sm">
                                  <p className="font-medium">
                                    {uploadedFile.name}
                                  </p>
                                  <p className="text-gray-500">
                                    {(uploadedFile.size / 1024 / 1024).toFixed(
                                      2
                                    )}{" "}
                                    MB
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500">
                                  Click to upload dataset (
                                  {evaluationContext.simulation_capabilities.data_formats_supported.join(
                                    ", "
                                  )}
                                  )
                                </p>
                              )}
                            </div>
                          </Label>

                          <Button
                            onClick={handleRunSimulation}
                            disabled={!uploadedFile || simulationLoading}
                            className="w-full"
                          >
                            {simulationLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Assessing Compatibility...
                              </>
                            ) : (
                              "Assess Dataset Compatibility"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <Card className="border-blue-200 dark:border-blue-700">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <Brain className="h-8 w-8 mx-auto text-blue-500" />
                        <div>
                          <h3 className="font-medium mb-2">
                            Component Testing Ready
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Test your generated AI components with realistic
                            scenarios to see how they perform with actual
                            humanitarian inputs
                          </p>

                          <Button
                            onClick={handleRunSimulation}
                            disabled={
                              regeneratingScenarios || simulationLoading
                            }
                            className="w-full"
                          >
                            {simulationLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testing Components...
                              </>
                            ) : (
                              "Test AI Components"
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {evaluationContext.testing_scenarios &&
                    evaluationContext.testing_scenarios.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            Scenarios for Component Testing
                          </h4>
                          {!regeneratingScenarios && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => regenerateScenarios()}
                              disabled={simulationLoading}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Regenerate
                            </Button>
                          )}
                        </div>

                        {regeneratingScenarios ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <div className="text-center">
                              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Regenerating Scenarios
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Creating new test scenarios for your AI
                                components...
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              These scenarios will be processed through your
                              generated{" "}
                              {evaluationContext.selected_solution
                                ?.llm_requirements
                                ? "LLM system prompt"
                                : "NLP pipeline"}{" "}
                              to show real outputs:
                            </div>
                            <div className="grid gap-3">
                              {evaluationContext.testing_scenarios.map(
                                (scenario: any, index: number) => (
                                  <Card
                                    key={index}
                                    className="border-gray-200 dark:border-gray-700"
                                  >
                                    <CardContent className="p-4">
                                      <h5 className="font-medium mb-1">
                                        {scenario.name}
                                      </h5>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {scenario.description}
                                      </p>
                                      <div className="text-xs space-y-1">
                                        <p>
                                          <span className="font-medium">
                                            Test Input:
                                          </span>{" "}
                                          {scenario.input_description}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Expected Processing:
                                          </span>{" "}
                                          {scenario.process_description}
                                        </p>
                                        <p>
                                          <span className="font-medium">
                                            Humanitarian Purpose:
                                          </span>{" "}
                                          {scenario.humanitarian_impact}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(0)}>
              Back to Review
            </Button>
          </div>
        </div>
      )}

      {currentStep === 1 && evaluationContext.evaluation_bypass && (
        <div className="space-y-6">
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Evaluation Guidance:</strong>{" "}
              {evaluationContext.evaluation_bypass.message}
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Specialist Consultation Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {evaluationContext.evaluation_bypass.guidance}
              </p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Next Steps:</h4>
                <ul className="text-sm space-y-1">
                  {evaluationContext.evaluation_bypass.next_steps.map(
                    (step, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        <span>{step}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              <Alert className="mt-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Specialist Consultation:</strong>{" "}
                  {evaluationContext.evaluation_bypass.specialist_consultation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="text-center p-6 bg-muted/50 dark:bg-muted/20 rounded-lg">
            <h3 className="font-medium text-lg mb-3 text-foreground">
              Your Project is Ready for Download
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              The generated code is complete and ready for specialist evaluation
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleReturnToDevelopment}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Try Different Solution
              </Button>

              <Button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                Continue to Summary
              </Button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 &&
        simulationResult &&
        simulationResult.simulation_type && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {simulationResult.testing_method === "dataset"
                    ? "Dataset Assessment Results"
                    : "Component Testing Results"}
                </CardTitle>
                <CardDescription>
                  {simulationResult.testing_method === "dataset"
                    ? "Review the compatibility assessment for your dataset and AI solution"
                    : "Review the actual testing results from your generated AI components"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {simulationResult.component_transparency && (
                  <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Component Being Tested
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {simulationResult.component_transparency
                        .component_type === "llm" && (
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-sm">
                              System Prompt:
                            </span>
                            <pre className="bg-white dark:bg-gray-800 p-3 rounded text-xs mt-1 overflow-auto max-h-32 border">
                              {
                                simulationResult.component_transparency
                                  .system_prompt
                              }
                            </pre>
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              Model Used:
                            </span>
                            <span className="ml-2 text-sm">
                              {
                                simulationResult.component_transparency
                                  .model_used
                              }
                            </span>
                          </div>
                        </div>
                      )}
                      {simulationResult.component_transparency
                        .component_type === "nlp" && (
                        <div>
                          <span className="font-medium text-sm">
                            Processing Approach:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {
                              simulationResult.component_transparency
                                .processing_approach
                            }
                          </p>
                        </div>
                      )}
                      {simulationResult.component_transparency
                        .component_type === "none" && (
                        <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-amber-800 dark:text-amber-200">
                            This solution doesn't have testable components for
                            automated evaluation. The results below are
                            theoretical - you'll need to test the actual
                            generated code manually.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {simulationResult.scenario_results &&
                simulationResult.scenario_results.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Real Testing Results
                      </CardTitle>
                      <CardDescription>
                        Actual outputs from your generated{" "}
                        {simulationResult.component_transparency?.component_type?.toUpperCase()}{" "}
                        component
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {simulationResult.scenario_results.map(
                        (result, index) => (
                          <Card
                            key={index}
                            className="border-gray-200 dark:border-gray-700"
                          >
                            <CardContent className="p-4">
                              <h5 className="font-medium mb-3">
                                {result.scenario_name}
                              </h5>
                              <div className="space-y-3">
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Input:
                                  </span>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {result.input_provided}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Actual Output:
                                  </span>
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mt-1 border border-blue-200 dark:border-blue-700">
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                      {result.actual_output}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Assessment:
                                  </span>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {result.humanitarian_relevance_assessment}
                                  </p>
                                </div>
                                {result.relevance_score !== undefined && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Relevance Score:{" "}
                                    {(result.relevance_score * 100).toFixed(0)}%
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>
                                    Component: {result.component_used}
                                  </span>
                                  {result.execution_time_ms && (
                                    <span>
                                      Processed in{" "}
                                      {(
                                        result.execution_time_ms / 1000
                                      ).toFixed(1)}
                                      s
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      This solution doesn't have testable components for
                      automated evaluation.
                    </AlertDescription>
                  </Alert>
                )}

                {simulationResult.suitability_assessment && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg border ${
                        simulationResult.suitability_assessment.is_suitable
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {simulationResult.suitability_assessment.is_suitable ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        )}
                        <Badge
                          variant={
                            simulationResult.suitability_assessment.is_suitable
                              ? "default"
                              : "secondary"
                          }
                        >
                          {Math.round(
                            simulationResult.suitability_assessment
                              .overall_score * 100
                          )}
                          % Suitability
                        </Badge>
                      </div>

                      <p
                        className={`text-sm ${
                          simulationResult.suitability_assessment.is_suitable
                            ? "text-green-800 dark:text-green-200"
                            : "text-amber-800 dark:text-amber-200"
                        }`}
                      >
                        {
                          simulationResult.suitability_assessment
                            .feature_compatibility.gap_explanation
                        }
                      </p>
                    </div>

                    <Card className="border-blue-200 dark:border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Feature Compatibility
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {simulationResult.suitability_assessment
                            .feature_compatibility.available_required.length >
                            0 && (
                            <div>
                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                Available Features ✓
                              </h4>
                              <ul className="text-sm space-y-1">
                                {simulationResult.suitability_assessment.feature_compatibility.available_required.map(
                                  (feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span>{feature}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          {simulationResult.suitability_assessment
                            .feature_compatibility.missing_required.length >
                            0 && (
                            <div>
                              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                                Missing Required Features
                              </h4>
                              <ul className="text-sm space-y-1">
                                {simulationResult.suitability_assessment.feature_compatibility.missing_required.map(
                                  (feature, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-center gap-2"
                                    >
                                      <X className="h-3 w-3 text-red-500" />
                                      <span>{feature}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 dark:border-purple-700">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Data Volume Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Available Rows:</span>
                            <span className="font-medium">
                              {simulationResult.suitability_assessment.data_volume_assessment.available_rows.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Required Rows:</span>
                            <span className="font-medium">
                              {simulationResult.suitability_assessment.data_volume_assessment.required_rows.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={
                              simulationResult.suitability_assessment
                                .data_volume_assessment.volume_score * 100
                            }
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {
                              simulationResult.suitability_assessment
                                .data_volume_assessment.recommendation
                            }
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {simulationResult.suitability_assessment
                      .performance_estimate && (
                      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                        <Target className="h-4 w-4" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <strong>Performance Estimate:</strong>{" "}
                          {
                            simulationResult.suitability_assessment
                              .performance_estimate
                          }
                        </AlertDescription>
                      </Alert>
                    )}

                    {simulationResult.suitability_assessment.recommendations
                      .length > 0 && (
                      <Card className="border-orange-200 dark:border-orange-700">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {simulationResult.suitability_assessment.recommendations.map(
                              (rec, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded border ${
                                    rec.priority === "high"
                                      ? "border-red-200 bg-red-50 dark:bg-red-900/10"
                                      : rec.priority === "medium"
                                      ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                                      : "border-blue-200 bg-blue-50 dark:bg-blue-900/10"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <Badge
                                      variant={
                                        rec.priority === "high"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {rec.priority}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {rec.issue}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {rec.suggestion}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {simulationResult.scenario_suitability_assessment && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      simulationResult.scenario_suitability_assessment.is_suitable
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700"
                        : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {simulationResult.scenario_suitability_assessment.is_suitable ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        )}
                        <Badge variant={
                          simulationResult.scenario_suitability_assessment.is_suitable ? "default" : "secondary"
                        }>
                          {Math.round(simulationResult.scenario_suitability_assessment.overall_score * 100)}% Performance
                        </Badge>
                      </div>
                      <p className={`text-sm ${
                        simulationResult.scenario_suitability_assessment.is_suitable
                          ? "text-green-800 dark:text-green-200"
                          : "text-amber-800 dark:text-amber-200"
                      }`}>
                        {simulationResult.scenario_suitability_assessment.performance_summary}
                      </p>
                    </div>

                    <Card className="border-blue-200 dark:border-blue-700">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Component Effectiveness
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Overall Effectiveness:</span>
                            <span className="font-medium">
                              {(simulationResult.scenario_suitability_assessment.component_effectiveness.overall_effectiveness * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          {simulationResult.scenario_suitability_assessment.component_effectiveness.strengths.length > 0 && (
                            <div>
                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Strengths</h4>
                              <ul className="text-sm space-y-1">
                                {simulationResult.scenario_suitability_assessment.component_effectiveness.strengths.map((strength, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {simulationResult.scenario_suitability_assessment.component_effectiveness.weaknesses.length > 0 && (
                            <div>
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Areas for Improvement</h4>
                              <ul className="text-sm space-y-1">
                                {simulationResult.scenario_suitability_assessment.component_effectiveness.weaknesses.map((weakness, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-amber-500" />
                                    <span>{weakness}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {simulationResult.scenario_suitability_assessment.recommendations.length > 0 && (
                                            <Card className="border-orange-200 dark:border-orange-700">
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {simulationResult.scenario_suitability_assessment.recommendations.map(
                              (rec, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded border ${
                                    rec.priority === "high"
                                      ? "border-red-200 bg-red-50 dark:bg-red-900/10"
                                      : rec.priority === "medium"
                                      ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10"
                                      : "border-blue-200 bg-blue-50 dark:bg-blue-900/10"
                                  }`}
                                >
                                  <div className="flex items-start gap-2">
                                    <Badge
                                      variant={
                                        rec.priority === "high"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {rec.priority}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">
                                        {rec.issue}
                                      </p>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {rec.suggestion}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      How These Results Were Generated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Methodology:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {simulationResult.simulation_explanation.methodology}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Data Usage:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {simulationResult.simulation_explanation.data_usage}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-sm">
                        Testing Basis:
                      </span>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                        {simulationResult.simulation_explanation.calculation_basis.map(
                          (basis, index) => (
                            <li key={index}>{basis}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important Limitations:</strong>{" "}
                        {simulationResult.simulation_explanation.limitations.join(
                          ". "
                        )}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Testing
              </Button>
              <Button
                onClick={handleEvaluateResults}
                disabled={evaluationLoading}
              >
                {evaluationLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Evaluating Results...
                  </>
                ) : (
                  "Complete Evaluation"
                )}
              </Button>
            </div>
          </div>
        )}

      {currentStep === steps.length - 1 && evaluationResult && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Project Evaluation Summary
              </CardTitle>
              <CardDescription>
                Your AI solution has been evaluated and is ready for decision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {evaluationResult.evaluation_summary.overall_assessment}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge
                    variant={
                      evaluationResult.status === "ready_for_deployment"
                        ? "default"
                        : evaluationResult.status === "needs_minor_improvements"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-sm"
                  >
                    {evaluationResult.status === "ready_for_deployment"
                      ? "READY FOR DEPLOYMENT"
                      : evaluationResult.status === "needs_minor_improvements"
                      ? "MINOR IMPROVEMENTS NEEDED"
                      : "SIGNIFICANT IMPROVEMENTS NEEDED"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {evaluationResult.evaluation_summary.recommendation}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {evaluationResult.evaluation_summary.key_strengths.length >
                  0 && (
                  <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-green-800 dark:text-green-200">
                        <CheckCircle className="h-4 w-4" />
                        Key Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        {evaluationResult.evaluation_summary.key_strengths.map(
                          (strength, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                              <span className="text-green-700 dark:text-green-300">
                                {strength}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <Target className="h-4 w-4" />
                      Areas for Consideration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {evaluationResult.evaluation_summary.areas_for_improvement.map(
                        (improvement, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-amber-600 flex-shrink-0" />
                            <span className="text-amber-700 dark:text-amber-300">
                              {improvement}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {evaluationResult.status !== "ready_for_deployment" &&
                evaluationResult.development_feedback && (
                  <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2 text-blue-800 dark:text-blue-200">
                        <Lightbulb className="h-4 w-4" />
                        Feedback for Next Solution Request
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Use this feedback when requesting a different solution
                          in the Development phase:
                        </p>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {evaluationResult.development_feedback}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              evaluationResult.development_feedback!
                            )
                          }
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy to Clipboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

              <div className="text-center p-6 bg-muted/50 dark:bg-muted/20 rounded-lg">
                <h3 className="font-medium text-lg mb-3 text-foreground">
                  Ready to Proceed?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Choose your next step based on the evaluation results
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleReturnToDevelopment}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {evaluationResult.status !== "ready_for_deployment"
                      ? "Refine Solution"
                      : "Explore Alternatives"}
                  </Button>

                  {canProceedToNextPhase() && (
                    <Button
                      onClick={handleCompleteProject}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Project & Complete
                    </Button>
                  )}
                </div>

                {!canProceedToNextPhase() && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Address compatibility issues or try a different solution
                    before downloading
                  </p>
                )}
              </div>

              {evaluationResult.status === "ready_for_deployment" && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Your AI project has been successfully generated and
                    evaluated. The solution meets your requirements and is ready
                    for deployment.
                  </AlertDescription>
                </Alert>
              )}

              {evaluationResult.status !== "ready_for_deployment" && (
                <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    The current solution may benefit from improvements. You can
                    download the project as-is or return to the development
                    phase to try a different AI solution approach.
                  </AlertDescription>
                </Alert>
              )}

              {canDownloadProject() && (
                <div>
                  <h4 className="font-medium mb-4 text-center">
                    Download Project Documentation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {AVAILABLE_DOCUMENTS.map((doc) => {
                      const IconComponent = getDocumentIcon(doc.icon);
                      return (
                        <Button
                          key={doc.key}
                          variant={
                            doc.priority === "primary" ? "default" : "outline"
                          }
                          onClick={() => downloadFile(doc.key)}
                          className="flex items-center gap-2 p-4 h-auto flex-col text-center w-full"
                          size="sm"
                        >
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <div className="w-full">
                            <div className="font-medium text-xs break-words">
                              {doc.title}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 break-words whitespace-normal">
                              {doc.description}
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(steps.length - 2)}
            >
              Back to Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

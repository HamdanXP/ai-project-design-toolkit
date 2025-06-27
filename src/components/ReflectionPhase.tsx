import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Flag, Lightbulb, Target, RefreshCw } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { Question, EthicalAssessment } from "@/types/reflection-phase";
import { QuestionGuidance } from "@/components/reflection/QuestionGuidance";
import { api } from "@/lib/api";
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
import { useLocation } from "react-router-dom";

type ReflectionPhaseProps = {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const ReflectionPhase = ({ onUpdateProgress, onCompletePhase }: ReflectionPhaseProps) => {
  const { reflectionAnswers, setReflectionAnswers, updatePhaseSteps } = useProject();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [backendQuestions, setBackendQuestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [ethicalAssessment, setEthicalAssessment] = useState<EthicalAssessment | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  const fetchQuestions = async () => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    
    try {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Try to get cached enhanced questions first
      const cachedQuestions = localStorage.getItem(`project-${projectId}-reflection-questions`);
      
      if (cachedQuestions) {
        console.log('Using cached enhanced reflection questions');
        const parsedQuestions = JSON.parse(cachedQuestions);
        setBackendQuestions(parsedQuestions);
        
        const convertedQuestions: Question[] = Object.entries(parsedQuestions.questions).map(([key, data]: [string, any], index) => ({
          id: (index + 1).toString(),
          text: data.question,
          key: key,
          guidanceSources: data.guidance_sources || []
        }));
        setQuestions(convertedQuestions);
        updatePhaseSteps("reflection", convertedQuestions.length);
        return;
      }

      console.log('Fetching enhanced reflection questions from API');
      const response = await api.backend.reflection.getQuestions(projectId); // Include guidance
      
      if (response.success) {
        setBackendQuestions(response.data);
        localStorage.setItem(
          `project-${projectId}-reflection-questions`, 
          JSON.stringify(response.data)
        );
        
        const convertedQuestions: Question[] = Object.entries(response.data.questions).map(([key, data]: [string, any], index) => ({
          id: (index + 1).toString(),
          text: data.question,
          key: key,
          guidanceSources: data.guidance_sources || []
        }));
        setQuestions(convertedQuestions);
        updatePhaseSteps("reflection", convertedQuestions.length);
      } else {
        throw new Error(response.message || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Failed to fetch reflection questions:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load reflection questions from server');
      setQuestions([]);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchQuestions();
  }, [projectId]);

  const handleRetry = async () => {
    setIsRetrying(true);
    // Clear cache to force fresh fetch
    if (projectId) {
      localStorage.removeItem(`project-${projectId}-reflection-questions`);
    }
    await fetchQuestions();
    setIsRetrying(false);
  };

  const totalQuestions = questions.length;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
    updateProgress();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
    updateProgress();
  };

  const updateProgress = () => {
    const completedCount = Object.keys(reflectionAnswers).filter(key => 
      reflectionAnswers[key] && reflectionAnswers[key].trim() !== ""
    ).length;
    onUpdateProgress(completedCount, totalQuestions);
  };

  useEffect(() => {
    updateProgress();
  }, [reflectionAnswers, totalQuestions]);

  const handleAnswerChange = (value: string) => {
    if (!questions[currentQuestionIndex]) return;
    const currentQuestion = questions[currentQuestionIndex];
    setReflectionAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const handleCompletePhase = async () => {
    if (!projectId) return;
    
    setIsAnalyzing(true);
    try {
      // Build dynamic answers object based on current questions
      const answers: Record<string, string> = {};
      questions.forEach(q => {
        answers[q.key] = reflectionAnswers[q.key] || '';
      });
      
      const response = await api.backend.reflection.completePhase(projectId, answers);
      
      if (response.success) {
        setEthicalAssessment(response.data);
        setAssessmentDialogOpen(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your responses. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToNextPhase = async () => {
    if (!projectId) return;
    
    setIsAdvancing(true);
    try {
      const response = await api.backend.reflection.advancePhase(projectId);
      
      if (response.success) {
        toast({
          title: "Reflection Phase Complete",
          description: "Moving to the Scoping phase.",
        });
        
        setAssessmentDialogOpen(false);
        
        if (onCompletePhase) {
          updateProgress();
          onCompletePhase();
        }
      }
    } catch (error) {
      console.error('Phase advancement failed:', error);
      toast({
        title: "Failed to Advance",
        description: "Could not advance to the next phase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleReviseAnswers = () => {
    setAssessmentDialogOpen(false);
  };

  // Helper to get question title from key
  const getQuestionTitle = (key: string) => {
    const question = questions.find(q => q.key === key);
    return question ? question.text : key;
  };

  // Helper to get severity color
  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Reflection Phase</h2>
          <p className="text-muted-foreground">Loading reflection questions...</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Reflection Phase</h2>
          <p className="text-muted-foreground">
            Answer reflection questions to help clarify your project goals and requirements.
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Unable to Load Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We couldn't retrieve your reflection questions from the server. 
                  Please check your connection and try again.
                </p>
              </div>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRetry} 
                disabled={isRetrying}
                className="w-full"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No questions available
  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Reflection Phase</h2>
          <p className="text-muted-foreground">
            Answer reflection questions to help clarify your project goals and requirements.
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No Questions Available</h3>
              <p className="text-sm text-muted-foreground">
                No reflection questions could be generated for this project.
              </p>
              <Button onClick={handleRetry} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentAnswer = reflectionAnswers[currentQuestion.key] || "";
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredQuestionsCount = Object.keys(reflectionAnswers).filter(key => 
    reflectionAnswers[key] && reflectionAnswers[key].trim() !== ""
  ).length;
  const isPhaseComplete = answeredQuestionsCount === totalQuestions;

  return (
    <div className="flex flex-col h-full">
      {/* Ethical Assessment Dialog */}
      <AlertDialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {ethicalAssessment?.threshold_met ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Ethical Assessment Results
            </AlertDialogTitle>
            <AlertDialogDescription>
              Review the analysis of your responses and decide how to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {ethicalAssessment && (
            <div className="space-y-6">
              {/* Score and Summary */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Ethical Readiness Score</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{Math.round(ethicalAssessment.ethical_score * 100)}%</span>
                    {ethicalAssessment.threshold_met ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                <Progress value={ethicalAssessment.ethical_score * 100} className="h-3" />
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{ethicalAssessment.summary}</p>
              </div>

              {/* Question Flags */}
              {ethicalAssessment.question_flags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Questions Needing Attention
                  </h4>
                  <div className="space-y-3">
                    {ethicalAssessment.question_flags.map((flag, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-sm">{getQuestionTitle(flag.question_key)}</p>
                          <Badge variant={getSeverityColor(flag.severity)}>
                            {flag.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{flag.issue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actionable Recommendations */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-600">
                  <Lightbulb className="h-4 w-4" />
                  Next Steps
                </h4>
                <ul className="space-y-2">
                  {ethicalAssessment.actionable_recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Recommendation */}
              <div className={`p-4 rounded-lg border-2 ${
                ethicalAssessment.proceed_recommendation 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800'
              }`}>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  {ethicalAssessment.proceed_recommendation ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  )}
                  AI Recommendation: {ethicalAssessment.proceed_recommendation ? 'Proceed' : 'Review First'}
                </h4>
                <p className={`text-sm ${
                  ethicalAssessment.proceed_recommendation 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-amber-700 dark:text-amber-300'
                }`}>
                  {ethicalAssessment.proceed_recommendation 
                    ? 'Your project demonstrates strong ethical foundations and is ready to move forward.'
                    : 'Consider addressing the concerns above to strengthen your project\'s ethical foundation.'
                  }
                </p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel onClick={handleReviseAnswers} disabled={isAdvancing}>
              Revise Answers
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleProceedToNextPhase}
              disabled={isAdvancing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAdvancing ? 'Proceeding...' : 'Proceed to Scoping'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Reflection Phase</h2>
        <p className="text-muted-foreground">
          Answer these questions to help clarify your project goals and requirements.
        </p>
      </div>

      <div className="mb-4 flex items-center">
        <div className="flex-1 mr-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>

      <Card className="flex-1">
        <CardContent className="p-6">
          <h3 className="text-xl font-medium mb-4">
            {currentQuestion.text}
          </h3>
          <Textarea
            className="min-h-[200px] mb-4"
            placeholder="Enter your answer here..."
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
          />
          
          {/* QuestionGuidance component */}
          <QuestionGuidance
            questionKey={currentQuestion.key}
            guidanceSources={currentQuestion.guidanceSources || []}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        {isLastQuestion ? (
          <Button
            onClick={handleCompletePhase}
            disabled={!isPhaseComplete || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Complete Phase'}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
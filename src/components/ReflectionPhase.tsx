import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/useToast";
import { Question, EthicalReadinessAssessment } from "@/types/reflection-phase";
import { QuestionGuidance } from "@/components/reflection/QuestionGuidance";
import { EthicalReadinessModal } from "@/components/reflection/EthicalReadinessModal";
import { api } from "@/lib/api";
import { REFLECTION_MAX_CHARS, REFLECTION_MIN_CHARS } from "@/config";
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
  const [EthicalReadinessAssessment, setEthicalReadinessAssessment] = useState<EthicalReadinessAssessment | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const MIN_CHARACTERS = REFLECTION_MIN_CHARS;
  const MAX_CHARACTERS = REFLECTION_MAX_CHARS;
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);
  
  const validationTimeoutRef = useRef<NodeJS.Timeout>();

  const getCharacterCountStatus = useCallback((text: string) => {
    const trimmedLength = text.trim().length;
    if (trimmedLength < MIN_CHARACTERS) {
      return { status: 'below-min', color: 'text-amber-600' };
    } else if (trimmedLength >= MAX_CHARACTERS) {
      return { status: 'at-max', color: 'text-red-600' };
    } else if (trimmedLength >= MAX_CHARACTERS - 100) {
      return { status: 'approaching-max', color: 'text-orange-600' };
    } else {
      return { status: 'valid', color: 'text-green-600' };
    }
  }, [MIN_CHARACTERS, MAX_CHARACTERS]);

  const progressData = useMemo(() => {
    const answeredCount = Object.keys(reflectionAnswers).filter(key => {
      const answer = reflectionAnswers[key]?.trim() || "";
      return answer.length >= MIN_CHARACTERS;
    }).length;
    const totalQuestions = questions.length;
    const isComplete = answeredCount === totalQuestions;
    return { answeredCount, totalQuestions, isComplete };
  }, [reflectionAnswers, questions.length, MIN_CHARACTERS]);

  const debouncedUpdateProgress = useCallback(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    
    validationTimeoutRef.current = setTimeout(() => {
      onUpdateProgress(progressData.answeredCount, progressData.totalQuestions);
    }, 200);
  }, [onUpdateProgress, progressData.answeredCount, progressData.totalQuestions]);

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
        updatePhaseSteps("reflection", convertedQuestions.length || 0);
        return;
      }

      console.log('Fetching enhanced reflection questions from API');
      const response = await api.backend.reflection.getQuestions(projectId);
      
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
        updatePhaseSteps("reflection", convertedQuestions.length || 0);
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

  useEffect(() => {
    debouncedUpdateProgress();
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [debouncedUpdateProgress]);

  const handleRetry = async () => {
    setIsRetrying(true);
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
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = useCallback((value: string) => {
    if (!questions[currentQuestionIndex]) return;
    
    const trimmedValue = value.trim();
    
    // Prevent input if trimmed content exceeds max
    if (trimmedValue.length > MAX_CHARACTERS) {
      const truncated = trimmedValue.slice(0, MAX_CHARACTERS);
      setReflectionAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].key]: truncated
      }));
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    setReflectionAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  }, [questions, currentQuestionIndex, setReflectionAnswers, MAX_CHARACTERS]);

  const handleCompletePhase = async () => {
    if (!projectId) return;
    
    setIsAnalyzing(true);
    try {
      const answers: Record<string, string> = {};
      questions.forEach(q => {
        const answer = reflectionAnswers[q.key] || '';
        answers[q.key] = answer.trim();
      });
      
      const response = await api.backend.reflection.completePhase(projectId, answers);
      
      if (response.success) {
        const assessment: EthicalReadinessAssessment = {
          ethical_score: response.data.ethical_score,
          ethical_summary: response.data.summary,
          ai_appropriateness_score: response.data.ai_appropriateness_score || 0.5,
          ai_appropriateness_summary: response.data.ai_appropriateness_summary || "AI appropriateness not fully evaluated",
          ai_recommendation: response.data.ai_recommendation || 'appropriate',
          alternative_solutions: response.data.alternative_solutions,
          overall_readiness_score: response.data.overall_readiness_score || response.data.ethical_score,
          proceed_recommendation: response.data.proceed_recommendation,
          summary: response.data.summary,
          actionable_recommendations: response.data.actionable_recommendations,
          question_flags: response.data.question_flags,
          threshold_met: response.data.threshold_met,
          can_proceed: response.data.can_proceed
        };
        
        setEthicalReadinessAssessment(assessment);
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

  const getQuestionTitle = (key: string) => {
    const question = questions.find(q => q.key === key);
    return question ? question.text : key;
  };

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
  
  const trimmedAnswer = currentAnswer.trim();
  const charStatus = getCharacterCountStatus(currentAnswer);
  const remainingChars = MAX_CHARACTERS - trimmedAnswer.length;

  return (
    <div className="flex flex-col h-full">
      <EthicalReadinessModal
        isOpen={assessmentDialogOpen}
        onOpenChange={setAssessmentDialogOpen}
        assessment={EthicalReadinessAssessment}
        onProceed={handleProceedToNextPhase}
        onRevise={handleReviseAnswers}
        isAdvancing={isAdvancing}
        getQuestionTitle={getQuestionTitle}
      />

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
          
          <div className="flex justify-between items-center">
            <QuestionGuidance
              questionKey={currentQuestion.key}
              guidanceSources={currentQuestion.guidanceSources || []}
            />
            
            <div className={`text-sm ${charStatus.color}`}>
              {trimmedAnswer.length}/{MAX_CHARACTERS}
              {trimmedAnswer.length < MIN_CHARACTERS && (
                <span className="ml-2 text-amber-600">(Need {MIN_CHARACTERS - trimmedAnswer.length} more)</span>
              )}
              {remainingChars <= 100 && remainingChars > 0 && trimmedAnswer.length >= MIN_CHARACTERS && (
                <span className="ml-2 text-orange-600">({remainingChars} remaining)</span>
              )}
              {remainingChars === 0 && (
                <span className="ml-2 text-red-600">(Limit reached)</span>
              )}
            </div>
          </div>
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
            disabled={!progressData.isComplete || isAnalyzing}
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
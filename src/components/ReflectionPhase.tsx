import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { Question, ProjectReadinessAssessment } from "@/types/reflection-phase";
import { QuestionGuidance } from "@/components/reflection/QuestionGuidance";
import { ProjectReadinessModal } from "@/components/reflection/ProjectReadinessModal";
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
  const [projectReadinessAssessment, setProjectReadinessAssessment] = useState<ProjectReadinessAssessment | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const MIN_CHARACTERS = REFLECTION_MIN_CHARS;
  const MAX_CHARACTERS = REFLECTION_MAX_CHARS;
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  // FIXED: Character count status now uses trimmed text
  const getCharacterCountStatus = (text: string) => {
    const trimmedLength = text.trim().length; // Use trimmed length
    if (trimmedLength < MIN_CHARACTERS) {
      return { status: 'below-min', color: 'text-amber-600' };
    } else if (trimmedLength >= MAX_CHARACTERS) {
      return { status: 'at-max', color: 'text-red-600' };
    } else if (trimmedLength >= MAX_CHARACTERS - 100) { // Warning zone (last 100 chars)
      return { status: 'approaching-max', color: 'text-orange-600' };
    } else {
      return { status: 'valid', color: 'text-green-600' };
    }
  };

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

  // FIXED: Progress calculation uses trimmed length consistently
  const updateProgress = () => {
    const completedCount = Object.keys(reflectionAnswers).filter(key => {
      const answer = reflectionAnswers[key]?.trim() || "";
      return answer.length >= MIN_CHARACTERS; // This already uses trimmed length
    }).length;
    onUpdateProgress(completedCount, totalQuestions);
  };

  useEffect(() => {
    updateProgress();
  }, [reflectionAnswers, totalQuestions]);

  // IMPROVED: Handle character limit based on trimmed length
  const handleAnswerChange = (value: string) => {
    if (!questions[currentQuestionIndex]) return;
    
    // Allow typing but enforce max limit on trimmed content
    const trimmedValue = value.trim();
    
    // If trimmed content exceeds max, don't allow the change
    if (trimmedValue.length > MAX_CHARACTERS) {
      // Find the last valid position by trimming to max length
      const truncated = trimmedValue.slice(0, MAX_CHARACTERS);
      setReflectionAnswers(prev => ({
        ...prev,
        [questions[currentQuestionIndex].key]: truncated
      }));
      return;
    }
    
    // Allow the change (including trailing spaces for user experience)
    // but the validation will be based on trimmed content
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
      // FIXED: Build answers object with trimmed values
      const answers: Record<string, string> = {};
      questions.forEach(q => {
        const answer = reflectionAnswers[q.key] || '';
        answers[q.key] = answer.trim(); // Send trimmed answers to backend
      });
      
      const response = await api.backend.reflection.completePhase(projectId, answers);
      
      if (response.success) {
        // Map the response to ProjectReadinessAssessment format
        const assessment: ProjectReadinessAssessment = {
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
        
        setProjectReadinessAssessment(assessment);
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
  
  // FIXED: Use trimmed length for all validations
  const answeredQuestionsCount = Object.keys(reflectionAnswers).filter(key => {
    const answer = reflectionAnswers[key]?.trim() || "";
    return answer.length >= MIN_CHARACTERS;
  }).length;
  const isPhaseComplete = answeredQuestionsCount === totalQuestions;
  
  // FIXED: Character status and remaining chars based on trimmed content
  const trimmedAnswer = currentAnswer.trim();
  const charStatus = getCharacterCountStatus(currentAnswer);
  const remainingChars = MAX_CHARACTERS - trimmedAnswer.length;

  return (
    <div className="flex flex-col h-full">
      {/* Project Readiness Assessment Modal */}
      <ProjectReadinessModal
        isOpen={assessmentDialogOpen}
        onOpenChange={setAssessmentDialogOpen}
        assessment={projectReadinessAssessment}
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
            
            {/* FIXED: Character counter shows trimmed length */}
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
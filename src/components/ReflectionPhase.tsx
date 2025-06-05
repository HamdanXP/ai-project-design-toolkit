import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api, ReflectionQuestions, ReflectionAnswers } from "@/lib/api";
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

type Question = {
  id: string;
  text: string;
  key: keyof ReflectionQuestions;
};

const FALLBACK_REFLECTION_QUESTIONS: Question[] = [
  { id: "1", text: "What problem are you trying to solve with your project?", key: "problem_definition" },
  { id: "2", text: "Who are the primary users or beneficiaries of your solution?", key: "target_beneficiaries" },
  { id: "3", text: "What potential harm could this AI system cause?", key: "potential_harm" },
  { id: "4", text: "What data do you have access to for this project?", key: "data_availability" },
  { id: "5", text: "What are your resource constraints (time, budget, team)?", key: "resource_constraints" },
  { id: "6", text: "How will you measure the success of your project?", key: "success_metrics" },
  { id: "7", text: "How will stakeholders be involved in the design process?", key: "stakeholder_involvement" },
  { id: "8", text: "How will your solution account for cultural considerations?", key: "cultural_sensitivity" },
];

type ReflectionPhaseProps = {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const ReflectionPhase = ({ onUpdateProgress, onCompletePhase }: ReflectionPhaseProps) => {
  const { reflectionAnswers, setReflectionAnswers, updatePhaseSteps } = useProject();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(FALLBACK_REFLECTION_QUESTIONS);
  const [backendQuestions, setBackendQuestions] = useState<ReflectionQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();
  
  // Get projectId from URL query params
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId') || 'current';

  useEffect(() => {
    const fetchQuestions = async () => {
      if (projectId !== 'current') {
        try {
          const response = await api.backend.reflection.getQuestions(projectId);
          if (response.success) {
            setBackendQuestions(response.data);
            // Convert backend questions to our format
            const convertedQuestions: Question[] = Object.entries(response.data).map(([key, text], index) => ({
              id: (index + 1).toString(),
              text: text,
              key: key as keyof ReflectionQuestions
            }));
            setQuestions(convertedQuestions);
            
            // Update the phase step count in the context
            updatePhaseSteps("reflection", convertedQuestions.length);
          }
        } catch (error) {
          console.log('Using fallback questions');
          // Keep using fallback questions and update step count
          updatePhaseSteps("reflection", FALLBACK_REFLECTION_QUESTIONS.length);
        }
      } else {
        // Update step count for fallback questions
        updatePhaseSteps("reflection", FALLBACK_REFLECTION_QUESTIONS.length);
      }
      setIsLoading(false);
    };
    
    fetchQuestions();
  }, [projectId, updatePhaseSteps]);

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
    // Update progress on initial load and when answers change
    updateProgress();
  }, [reflectionAnswers]);

  const handleAnswerChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setReflectionAnswers(prev => ({
      ...prev,
      [currentQuestion.key]: value
    }));
  };

  const handleCompletePhaseConfirm = async () => {
    if (projectId !== 'current' && backendQuestions) {
      try {
        // Submit answers to backend
        const answers: ReflectionAnswers = {
          problem_definition: reflectionAnswers['problem_definition'] || '',
          target_beneficiaries: reflectionAnswers['target_beneficiaries'] || '',
          potential_harm: reflectionAnswers['potential_harm'] || '',
          data_availability: reflectionAnswers['data_availability'] || '',
          resource_constraints: reflectionAnswers['resource_constraints'] || '',
          success_metrics: reflectionAnswers['success_metrics'] || '',
          stakeholder_involvement: reflectionAnswers['stakeholder_involvement'] || '',
          cultural_sensitivity: reflectionAnswers['cultural_sensitivity'] || '',
        };
        
        const response = await api.backend.reflection.submitAnswers(projectId, answers);
        
        if (response.success) {
          setAiAnalysis(response.data.ai_analysis);
          toast({
            title: "Reflection Analysis Complete",
            description: `Ethical score: ${Math.round(response.data.ethical_score * 100)}%. ${response.data.proceed_recommendation ? 'Recommended to proceed.' : 'Review concerns before proceeding.'}`,
          });
          
          if (response.data.concerns.length > 0) {
            console.log('AI Analysis Concerns:', response.data.concerns);
          }
        }
      } catch (error) {
        console.log('Backend submission failed, proceeding with local completion');
      }
    }
    
    if (onCompletePhase) {
      updateProgress();
      onCompletePhase();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Reflection Phase</h2>
          <p className="text-muted-foreground">
            Loading reflection questions...
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentAnswer = reflectionAnswers[currentQuestion.key] || "";
  
  // Check if the user has reached the last question and provided an answer
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  // Calculate how many questions have been answered
  const answeredQuestionsCount = Object.keys(reflectionAnswers).filter(key => 
    reflectionAnswers[key] && reflectionAnswers[key].trim() !== ""
  ).length;
  
  // Phase is complete if all questions are answered
  const isPhaseComplete = answeredQuestionsCount === totalQuestions;

  return (
    <div className="flex flex-col h-full">
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Reflection Phase?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete the Reflection Phase? This will mark this phase as complete and move you to the next step.
              {projectId !== 'current' && ' Your answers will be analyzed by AI for ethical considerations and feasibility.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompletePhaseConfirm}>
              Complete Phase
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
          
          {aiAnalysis && isLastQuestion && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">AI Analysis</h4>
              <p className="text-sm text-muted-foreground">{aiAnalysis}</p>
            </div>
          )}
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
            onClick={() => setConfirmDialogOpen(true)}
            disabled={!isPhaseComplete}
          >
            Complete Phase
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

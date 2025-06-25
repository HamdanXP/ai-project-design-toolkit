import { useState, useEffect, useRef } from "react";
import { useProject } from "@/contexts/ProjectContext";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";

export interface ReflectionQuestion {
  id: string;
  text: string;
  key: string;
}

const FALLBACK_REFLECTION_QUESTIONS: ReflectionQuestion[] = [
  { id: "1", text: "What problem are you trying to solve with your project?", key: "problem_definition" },
  { id: "2", text: "Who are the primary users or beneficiaries of your solution?", key: "target_beneficiaries" },
  { id: "3", text: "What potential harm could this AI system cause?", key: "potential_harm" },
  { id: "4", text: "What data do you have access to for this project?", key: "data_availability" }
];

interface EthicalAssessment {
  ethical_score: number;
  proceed_recommendation: boolean;
  summary: string;
  actionable_recommendations: string[];
  question_flags: Array<{ question_key: string; issue: string; severity: 'low' | 'medium' | 'high'; }>;
  threshold_met: boolean;
  can_proceed: boolean;
}

export interface UseReflectionPhaseOptions {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
}

export const useReflectionPhase = (options: UseReflectionPhaseOptions) => {
  const { onUpdateProgress, onCompletePhase } = options;
  const { reflectionAnswers, setReflectionAnswers, updatePhaseSteps } = useProject();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<ReflectionQuestion[]>([]);
  const [backendQuestions, setBackendQuestions] = useState<Record<string, string> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [ethicalAssessment, setEthicalAssessment] = useState<EthicalAssessment | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId') || 'current';

  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || fetchingRef.current) return;

    const fetchQuestions = async () => {
      fetchingRef.current = true;
      initializedRef.current = true;

      try {
        if (projectId !== 'current') {
          const cachedQuestions = localStorage.getItem(`project-${projectId}-reflection-questions`);
          if (cachedQuestions) {
            const parsed = JSON.parse(cachedQuestions);
            setBackendQuestions(parsed);
            const converted: ReflectionQuestion[] = Object.entries(parsed).map(([key, text], index) => ({
              id: (index + 1).toString(),
              text: text as string,
              key
            }));
            setQuestions(converted);
            updatePhaseSteps('reflection', converted.length);
          } else {
            const response = await api.backend.reflection.getQuestions(projectId);
            if (response.success) {
              setBackendQuestions(response.data);
              localStorage.setItem(`project-${projectId}-reflection-questions`, JSON.stringify(response.data));
              const converted: ReflectionQuestion[] = Object.entries(response.data).map(([key, text], index) => ({
                id: (index + 1).toString(),
                text: text as string,
                key
              }));
              setQuestions(converted);
              updatePhaseSteps('reflection', converted.length);
            }
          }
        } else {
          setQuestions(FALLBACK_REFLECTION_QUESTIONS);
          updatePhaseSteps('reflection', FALLBACK_REFLECTION_QUESTIONS.length);
        }
      } catch (error) {
        setQuestions(FALLBACK_REFLECTION_QUESTIONS);
        updatePhaseSteps('reflection', FALLBACK_REFLECTION_QUESTIONS.length);
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchQuestions();
  }, [projectId, updatePhaseSteps]);

  const totalQuestions = questions.length;

  const updateProgress = () => {
    const completedCount = Object.keys(reflectionAnswers).filter((key) => reflectionAnswers[key] && reflectionAnswers[key].trim() !== "").length;
    onUpdateProgress(completedCount, totalQuestions);
  };

  useEffect(() => {
    updateProgress();
  }, [reflectionAnswers, totalQuestions]);

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

  const handleAnswerChange = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setReflectionAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleCompletePhase = async () => {
    if (projectId === 'current') {
      if (onCompletePhase) {
        updateProgress();
        onCompletePhase();
      }
      return;
    }
    setIsAnalyzing(true);
    try {
      const answers: Record<string, string> = {};
      questions.forEach((q) => { answers[q.key] = reflectionAnswers[q.key] || ''; });
      const response = await api.backend.reflection.completePhase(projectId, answers);
      if (response.success) {
        setEthicalAssessment(response.data);
        setAssessmentDialogOpen(true);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({ title: 'Analysis Failed', description: 'Could not analyze your responses. Please try again.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToNextPhase = async () => {
    setIsAdvancing(true);
    try {
      const response = await api.backend.reflection.advancePhase(projectId);
      if (response.success) {
        toast({ title: 'Reflection Phase Complete', description: 'Moving to the Scoping phase.' });
        setAssessmentDialogOpen(false);
        if (onCompletePhase) {
          updateProgress();
          onCompletePhase();
        }
      }
    } catch (error) {
      console.error('Phase advancement failed:', error);
      toast({ title: 'Failed to Advance', description: 'Could not advance to the next phase. Please try again.', variant: 'destructive' });
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleReviseAnswers = () => {
    setAssessmentDialogOpen(false);
  };

  const getQuestionTitle = (key: string) => {
    const question = questions.find((q) => q.key === key);
    return question ? question.text : key;
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / (totalQuestions || 1)) * 100;
  const currentAnswer = reflectionAnswers[currentQuestion?.key] || '';
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const answeredQuestionsCount = Object.keys(reflectionAnswers).filter((key) => reflectionAnswers[key] && reflectionAnswers[key].trim() !== '').length;
  const isPhaseComplete = answeredQuestionsCount === totalQuestions;

  return {
    questions,
    reflectionAnswers,
    totalQuestions,
    currentQuestionIndex,
    currentQuestion,
    currentAnswer,
    progress,
    isLastQuestion,
    isPhaseComplete,
    assessmentDialogOpen,
    setAssessmentDialogOpen,
    isAnalyzing,
    isAdvancing,
    isLoading,
    ethicalAssessment,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    handleCompletePhase,
    handleProceedToNextPhase,
    handleReviseAnswers,
    getQuestionTitle,
    getSeverityColor
  };
};

export type UseReflectionPhaseReturn = ReturnType<typeof useReflectionPhase>;

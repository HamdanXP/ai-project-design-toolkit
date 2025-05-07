
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Question = {
  id: number;
  text: string;
};

const EVALUATION_QUESTIONS: Question[] = [
  { id: 1, text: "Does the prototype fit a clear, actionable or important business need?" },
  { id: 2, text: "Evaluate performance against project goals - does the output provide tangible business value?" },
  { id: 3, text: "Check for risks or edge case consequences - identify bias, failures, etc." },
  { id: 4, text: "Get feedback from potential users or experts - incorporate reporting mechanisms" },
];

type EvaluationPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const EvaluationPhase = ({ onUpdateProgress, onCompletePhase }: EvaluationPhaseProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const totalQuestions = EVALUATION_QUESTIONS.length;

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
    if (!onUpdateProgress) return;
    
    const completedCount = Object.keys(answers).filter(key => 
      answers[parseInt(key)] && answers[parseInt(key)].trim() !== ""
    ).length;
    onUpdateProgress(completedCount, totalQuestions);
  };

  const handleAnswerChange = (value: string) => {
    const currentQuestion = EVALUATION_QUESTIONS[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const currentQuestion = EVALUATION_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentAnswer = answers[currentQuestion.id] || "";
  
  // Check if the user has reached the last question and provided an answer
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  
  // Calculate how many questions have been answered
  const answeredQuestionsCount = Object.keys(answers).filter(key => 
    answers[parseInt(key)] && answers[parseInt(key)].trim() !== ""
  ).length;
  
  // Phase is complete if all questions are answered
  const isPhaseComplete = answeredQuestionsCount === totalQuestions;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Evaluation Phase</h2>
        <p className="text-muted-foreground">
          Review and evaluate your completed project.
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
            onClick={onCompletePhase}
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

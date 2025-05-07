
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

const SCOPING_QUESTIONS: Question[] = [
  { id: 1, text: "Define the problem - what do you want to solve, and what are the key problems you're trying to address?" },
  { id: 2, text: "Define the end users - who will be using the solution? Are you solving for a specific user persona?" },
  { id: 3, text: "Explore the context - specify requirements, success metrics, and implementation constraints." },
  { id: 4, text: "List success metrics that will determine whether your project has successfully solved the problem." },
  { id: 5, text: "Predict any technical or ethical challenges that might arise during development. How will you address them?" },
  { id: 6, text: "Define project goals and specifications - what determines a successful completion of a phase?" },
];

type ScopingPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const ScopingPhase = ({ onUpdateProgress, onCompletePhase }: ScopingPhaseProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const totalQuestions = SCOPING_QUESTIONS.length;

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
    const currentQuestion = SCOPING_QUESTIONS[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const currentQuestion = SCOPING_QUESTIONS[currentQuestionIndex];
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
        <h2 className="text-2xl font-bold mb-2">Scoping Phase</h2>
        <p className="text-muted-foreground">
          Define the scope and requirements for your project.
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

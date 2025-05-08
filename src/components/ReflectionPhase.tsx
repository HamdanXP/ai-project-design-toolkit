
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";

type Step = {
  title: string;
  questions: {
    id: string;
    text: string;
    answer: string;
  }[];
};

export const ReflectionPhase = ({ 
  onUpdateProgress,
  onCompletePhase 
}: { 
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
}) => {
  // Define reflection steps
  const [steps] = useState<Step[]>([
    {
      title: "Project Goals",
      questions: [
        { id: "goal", text: "What is the main goal of your AI-driven project?", answer: "" },
        { id: "problem", text: "What specific problem are you trying to solve?", answer: "" }
      ]
    },
    {
      title: "Target Users",
      questions: [
        { id: "users", text: "Who are the primary users or beneficiaries?", answer: "" },
        { id: "needs", text: "What are their specific needs or pain points?", answer: "" }
      ]
    },
    {
      title: "Available Resources",
      questions: [
        { id: "data", text: "What data sources do you have access to?", answer: "" },
        { id: "skills", text: "What technical skills are available on your team?", answer: "" }
      ]
    },
    {
      title: "Success Criteria",
      questions: [
        { id: "metrics", text: "How will you measure success for this project?", answer: "" },
        { id: "impact", text: "What specific impact do you hope to achieve?", answer: "" }
      ]
    },
    {
      title: "Constraints & Risks",
      questions: [
        { id: "constraints", text: "What are the key constraints for this project?", answer: "" },
        { id: "risks", text: "What potential risks or ethical concerns exist?", answer: "" }
      ]
    },
    {
      title: "Implementation Path",
      questions: [
        { id: "timeline", text: "What is your expected timeline for implementation?", answer: "" },
        { id: "resources", text: "What resources will you need to implement this solution?", answer: "" }
      ]
    },
    {
      title: "Summary & Next Steps",
      questions: [
        { id: "summary", text: "Summarize your project vision in 1-2 sentences.", answer: "" },
        { id: "next_steps", text: "What are the immediate next steps for your project?", answer: "" }
      ]
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    // Try to restore step from localStorage
    try {
      const storedStep = localStorage.getItem('reflectionActiveStep');
      return storedStep ? parseInt(storedStep) : 0;
    } catch (e) {
      return 0;
    }
  });

  // Store activeStep in localStorage
  useEffect(() => {
    localStorage.setItem('reflectionActiveStep', currentStepIndex.toString());
  }, [currentStepIndex]);

  // Load answers from localStorage on component mount
  useEffect(() => {
    try {
      const storedAnswers = localStorage.getItem('reflectionAnswers');
      if (storedAnswers) {
        const parsedAnswers = JSON.parse(storedAnswers);
        steps.forEach((step, stepIndex) => {
          step.questions.forEach((question, questionIndex) => {
            if (parsedAnswers[question.id]) {
              steps[stepIndex].questions[questionIndex].answer = parsedAnswers[question.id];
            }
          });
        });
      }
    } catch (error) {
      console.error("Error loading reflection answers:", error);
    }

    // Update progress on component mount
    onUpdateProgress(currentStepIndex, steps.length);
  }, []);

  const saveAnswers = () => {
    const answers: Record<string, string> = {};
    steps.forEach(step => {
      step.questions.forEach(question => {
        answers[question.id] = question.answer;
      });
    });
    localStorage.setItem('reflectionAnswers', JSON.stringify(answers));
  };

  const handleInputChange = (stepIndex: number, questionIndex: number, value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex].questions[questionIndex].answer = value;
    steps[stepIndex].questions[questionIndex].answer = value;
    
    // Save answers when input changes
    saveAnswers();
  };

  const moveToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = currentStepIndex + 1;
      setCurrentStepIndex(nextStep);
      onUpdateProgress(nextStep, steps.length);
      saveAnswers();
    } else {
      // Save all answers
      saveAnswers();
      
      // Complete phase
      onCompletePhase();
    }
  };

  const moveToPreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = currentStepIndex - 1;
      setCurrentStepIndex(prevStep);
      onUpdateProgress(prevStep, steps.length);
      saveAnswers();
    }
  };

  const isCurrentStepValid = () => {
    return steps[currentStepIndex].questions.every(q => q.answer.trim().length > 0);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Reflection Phase</h1>
        <p className="text-muted-foreground mb-6">
          Reflect on your project goals, target users, available resources, and success criteria to lay the foundation for your AI project.
        </p>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={(currentStepIndex / (steps.length - 1)) * 100} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="bg-muted/50">
          <h2 className="text-xl font-medium">{steps[currentStepIndex].title}</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {steps[currentStepIndex].questions.map((question, qIndex) => (
              <div key={question.id} className="space-y-2">
                <label htmlFor={question.id} className="block font-medium">
                  {question.text}
                </label>
                <textarea
                  id={question.id}
                  value={question.answer}
                  onChange={(e) => handleInputChange(currentStepIndex, qIndex, e.target.value)}
                  className="w-full min-h-[120px] p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your answer..."
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={moveToPreviousStep}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>
          
          <Button 
            onClick={moveToNextStep}
            disabled={!isCurrentStepValid()}
          >
            {currentStepIndex === steps.length - 1 ? "Complete Phase" : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle, XCircle, Flag, Lightbulb, Target } from "lucide-react";
import { useReflectionPhase } from "@/hooks/useReflectionPhase";
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

type ReflectionPhaseProps = {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

export const ReflectionPhase = ({ onUpdateProgress, onCompletePhase }: ReflectionPhaseProps) => {
  const {
    questions,
    reflectionAnswers,
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
    totalQuestions,
    ethicalAssessment,
    handleAnswerChange,
    handleNext,
    handlePrevious,
    handleCompletePhase,
    handleProceedToNextPhase,
    handleReviseAnswers,
    getQuestionTitle,
    getSeverityColor
  } = useReflectionPhase({ onUpdateProgress, onCompletePhase });

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
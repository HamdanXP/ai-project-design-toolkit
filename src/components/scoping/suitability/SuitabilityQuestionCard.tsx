
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, ChevronUp, Check, X, AlertTriangle } from "lucide-react";
import { SuitabilityHelpPanel } from "./SuitabilityHelpPanel";
import { EnhancedSuitabilityQuestion } from "@/types/scoping-phase";

type SuitabilityQuestionCardProps = {
  question: EnhancedSuitabilityQuestion;
  currentAnswer: 'yes' | 'no' | 'unknown' | null;
  isHelpExpanded: boolean;
  onAnswerSelect: (answer: 'yes' | 'no' | 'unknown') => void;
  onToggleHelp: () => void;
};

export const SuitabilityQuestionCard = ({
  question,
  currentAnswer,
  isHelpExpanded,
  onAnswerSelect,
  onToggleHelp,
}: SuitabilityQuestionCardProps) => {
  const getAnswerIcon = (value: string) => {
    switch (value) {
      case 'yes': return Check;
      case 'no': return X;
      case 'unknown': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getAnswerColorClasses = (value: string, isSelected: boolean) => {
    if (!isSelected) return 'border-border hover:border-primary/50';
    
    switch (value) {
      case 'yes': return 'border-green-500 bg-green-50 text-green-700';
      case 'no': return 'border-red-500 bg-red-50 text-red-700';
      case 'unknown': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      default: return 'border-border';
    }
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{question.title}</h3>
            <p className="text-base mb-2">{question.question}</p>
            <p className="text-sm text-muted-foreground">{question.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHelp}
            className="ml-4 flex-shrink-0"
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            Help
            {isHelpExpanded ? (
              <ChevronUp className="h-4 w-4 ml-1" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>

        {isHelpExpanded && (
          <SuitabilityHelpPanel helpContent={question.helpContent} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {question.responseOptions.map((option) => {
            const Icon = getAnswerIcon(option.value);
            const isSelected = currentAnswer === option.value;
            
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all duration-200 ${getAnswerColorClasses(
                  option.value,
                  isSelected
                )}`}
                onClick={() => onAnswerSelect(option.value as 'yes' | 'no' | 'unknown')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <p className="text-sm opacity-90">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {currentAnswer && (
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <div className="flex items-start">
              <div className={`mt-1 rounded-full p-1 ${
                currentAnswer === 'yes' ? 'bg-green-100 text-green-600' : 
                currentAnswer === 'no' ? 'bg-red-100 text-red-600' : 
                'bg-yellow-100 text-yellow-600'
              }`}>
                {currentAnswer === 'yes' && <Check className="h-3 w-3" />}
                {currentAnswer === 'no' && <X className="h-3 w-3" />}
                {currentAnswer === 'unknown' && <AlertTriangle className="h-3 w-3" />}
              </div>
              <div className="ml-3 text-sm">
                {currentAnswer === 'yes' && "This is positive for your project success."}
                {currentAnswer === 'no' && "This indicates a significant concern that should be addressed before proceeding."}
                {currentAnswer === 'unknown' && "Consider getting additional guidance or conducting further data analysis."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  AlertTriangle,
  Target,
  CheckCircle,
} from "lucide-react";
import {
  DataSuitabilityCheck,
  ManualAssessmentQuestion,
  TargetLabelQuestion,
  ManualAssessmentResults,
  QuestionCardProps,
} from "@/types/scoping-phase";

const DATASET_QUESTIONS: ManualAssessmentQuestion[] = [
  {
    id: "data_completeness",
    title: "Data Completeness Assessment",
    question: "When you examine the data, what do you observe?",
    description: "Assess how complete and consistent your dataset appears",
    helpContent: {
      lookFor: [
        "Most rows have values in important columns",
        "Dates and numbers follow consistent formats",
        "Text entries use similar language and structure",
        "Geographic locations are properly spelled",
      ],
      warningsSigns: [
        "Many empty cells or missing values",
        "Inconsistent date formats (DD/MM vs MM/DD)",
        "Mixed languages or encoding issues",
        "Unclear or inconsistent category labels",
      ],
      whyMatters:
        "Complete, consistent data is essential for AI models to learn accurate patterns and make reliable predictions for humanitarian decisions.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Looks Clean",
        description: "Most data is complete and consistent",
      },
      {
        value: "unknown",
        label: "Some Issues",
        description: "Noticeable problems but still usable",
      },
      {
        value: "no",
        label: "Many Problems",
        description: "Significant cleaning needed",
      },
    ],
  },
  {
    id: "population_representativeness",
    title: "Population Representativeness",
    question: "Does this data fairly represent the people you want to help?",
    description:
      "Evaluate if the data covers your target communities adequately",
    helpContent: {
      lookFor: [
        "Data includes diverse demographic groups",
        "Geographic coverage matches your project area",
        "Time period is recent and relevant",
        "Sample size appears adequate for conclusions",
      ],
      warningsSigns: [
        "Missing data from vulnerable populations",
        "Geographic bias toward urban areas",
        "Data is several years old",
        "Very small sample sizes for subgroups",
      ],
      whyMatters:
        "Biased or unrepresentative data can lead to AI solutions that don't work for the most vulnerable populations, potentially worsening inequalities.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Representative",
        description: "Covers target population well",
      },
      {
        value: "unknown",
        label: "Partially",
        description: "Some gaps but generally adequate",
      },
      {
        value: "no",
        label: "Limited Coverage",
        description: "Missing key populations or areas",
      },
    ],
  },
  {
    id: "privacy_ethics",
    title: "Privacy & Ethics Assessment",
    question: "Could using this data cause harm or raise privacy concerns?",
    description: "Consider potential risks to individuals and communities",
    helpContent: {
      lookFor: [
        "Data is properly anonymized",
        "Clear consent for intended use",
        "No sensitive personal identifiers",
        "Appropriate data sharing agreements",
      ],
      warningsSigns: [
        "Individual names or ID numbers visible",
        "Location data precise enough to identify people",
        "Sensitive health or financial information",
        "No clear permissions for AI use",
      ],
      whyMatters:
        "Privacy violations can harm vulnerable populations, damage trust in humanitarian organizations, and violate legal regulations.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Privacy Safe",
        description: "Low risk of privacy concerns",
      },
      {
        value: "unknown",
        label: "Need Review",
        description: "Some concerns need addressing",
      },
      {
        value: "no",
        label: "High Risk",
        description: "Significant privacy or ethical issues",
      },
    ],
  },
  {
    id: "quality_sufficiency",
    title: "Quality & Sufficiency Check",
    question: "Do you have enough good quality data for your project?",
    description:
      "Assess if the data volume and quality meet your project needs",
    helpContent: {
      lookFor: [
        "Sufficient records for statistical analysis",
        "Data covers relevant time periods",
        "Key variables needed for your use case",
        "Data source is credible and reliable",
      ],
      warningsSigns: [
        "Very small dataset (less than 100 records)",
        "Missing key variables for your analysis",
        "Data quality varies significantly",
        "Uncertain about data collection methods",
      ],
      whyMatters:
        "Insufficient or poor quality data will limit your AI model's effectiveness and could lead to unreliable results in humanitarian contexts.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Sufficient",
        description: "Good quality and adequate volume",
      },
      {
        value: "unknown",
        label: "Borderline",
        description: "May work but with limitations",
      },
      {
        value: "no",
        label: "Insufficient",
        description: "Need more or better quality data",
      },
    ],
  },
];

const TARGET_LABEL_QUESTIONS: TargetLabelQuestion[] = [
  {
    id: "target_ethics",
    title: "Ethical Considerations for Target",
    question: "Are there ethical concerns with predicting this outcome?",
    description: "Consider the humanitarian implications of your predictions",
    helpContent: {
      lookFor: [
        "Predictions will be used to help, not harm people",
        "Model errors won't disadvantage vulnerable groups",
        "Clear accountability for prediction outcomes",
        "Transparent communication about model limitations",
      ],
      warningsSigns: [
        "Predictions could stigmatize individuals or groups",
        "False positives/negatives have serious consequences",
        "Predictions might be used for punitive measures",
        "Limited ability to appeal or correct predictions",
      ],
      whyMatters:
        "AI predictions in humanitarian contexts directly affect people's lives and access to services, requiring careful ethical consideration.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Ethically Sound",
        description: "Low risk of harmful outcomes",
      },
      {
        value: "unknown",
        label: "Some Concerns",
        description: "Manageable risks with proper safeguards",
      },
      {
        value: "no",
        label: "High Risk",
        description: "Significant ethical concerns",
      },
    ],
  },
  {
    id: "target_actionability",
    title: "Actionability of Predictions",
    question: "Can you take meaningful action based on these predictions?",
    description:
      "Assess whether predictions will lead to practical interventions",
    helpContent: {
      lookFor: [
        "Clear interventions available for different predictions",
        "Sufficient resources to act on predictions",
        "Predictions arrive in time to be useful",
        "Stakeholders are prepared to use predictions",
      ],
      warningsSigns: [
        "No clear action plan for different predictions",
        "Predictions arrive too late to be useful",
        "Limited resources to act on findings",
        "Stakeholders skeptical of AI predictions",
      ],
      whyMatters:
        "AI predictions are only valuable if they lead to better humanitarian outcomes - actionability is essential for impact.",
    },
    responseOptions: [
      {
        value: "yes",
        label: "Highly Actionable",
        description: "Clear action plans for predictions",
      },
      {
        value: "unknown",
        label: "Somewhat Actionable",
        description: "Some actions possible with planning",
      },
      {
        value: "no",
        label: "Limited Action",
        description: "Unclear how to act on predictions",
      },
    ],
  },
];

const QuestionCard = ({
  question,
  currentAnswer,
  isHelpExpanded,
  onAnswerSelect,
  onToggleHelp,
}: QuestionCardProps) => {
  const getAnswerIcon = (value: string) => {
    switch (value) {
      case "yes":
        return Check;
      case "no":
        return X;
      case "unknown":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getAnswerColorClasses = (value: string, isSelected: boolean) => {
    if (!isSelected) return "border-border hover:border-primary/50";

    switch (value) {
      case "yes":
        return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
      case "no":
        return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
      case "unknown":
        return "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300";
      default:
        return "border-border";
    }
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{question.title}</h3>
            <p className="text-base mb-2">{question.question}</p>
            <p className="text-sm text-muted-foreground">
              {question.description}
            </p>
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
          <div className="mb-4 p-4 bg-muted/50 dark:bg-muted/30 border border-muted-foreground/20 rounded-lg">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-green-700 dark:text-green-300 mb-2">
                  Look for:
                </h4>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  {question.helpContent.lookFor.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-2">
                  Warning signs:
                </h4>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  {question.helpContent.warningsSigns.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-600 dark:text-red-400 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Why this matters:
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {question.helpContent.whyMatters}
                </p>
              </div>
            </div>
          </div>
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
                onClick={() =>
                  onAnswerSelect(option.value as "yes" | "no" | "unknown")
                }
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
          <div className="mt-4 p-3 rounded-lg bg-muted/50 dark:bg-muted/30 border border-muted-foreground/10">
            <div className="flex items-start">
              <div
                className={`mt-1 rounded-full p-1 ${
                  currentAnswer === "yes"
                    ? "bg-green-500/20 text-green-600 dark:text-green-400"
                    : currentAnswer === "no"
                    ? "bg-red-500/20 text-red-600 dark:text-red-400"
                    : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                }`}
              >
                {currentAnswer === "yes" && <Check className="h-3 w-3" />}
                {currentAnswer === "no" && <X className="h-3 w-3" />}
                {currentAnswer === "unknown" && (
                  <AlertTriangle className="h-3 w-3" />
                )}
              </div>
              <div className="ml-3 text-sm text-foreground">
                {currentAnswer === "yes" &&
                  "This is positive for your project success."}
                {currentAnswer === "no" &&
                  "This indicates a significant concern that should be addressed before proceeding."}
                {currentAnswer === "unknown" &&
                  "Consider getting additional guidance or conducting further data analysis."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ManualDatasetAssessmentProps {
  onComplete: (results: ManualAssessmentResults) => void;
  onPrevious: () => void;
}

export const ManualDatasetAssessment = ({
  onComplete,
  onPrevious,
}: ManualDatasetAssessmentProps) => {
  const [datasetAnswers, setDatasetAnswers] = useState<
    Record<string, "yes" | "no" | "unknown">
  >({});
  const [targetLabelAnswers, setTargetLabelAnswers] = useState<
    Record<string, "yes" | "no" | "unknown">
  >({});
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  const toggleHelp = (questionId: string) => {
    setExpandedHelp(expandedHelp === questionId ? null : questionId);
  };

  const handleDatasetAnswer = (
    questionId: string,
    answer: "yes" | "no" | "unknown"
  ) => {
    setDatasetAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleTargetLabelAnswer = (
    questionId: string,
    answer: "yes" | "no" | "unknown"
  ) => {
    setTargetLabelAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateScores = () => {
    const scoreAnswer = (
      answer: "yes" | "no" | "unknown" | undefined
    ): number => {
      switch (answer) {
        case "yes":
          return 100;
        case "unknown":
          return 50;
        case "no":
          return 0;
        default:
          return 0;
      }
    };

    const datasetScores = DATASET_QUESTIONS.map((q) =>
      scoreAnswer(datasetAnswers[q.id])
    );
    const targetLabelScores = TARGET_LABEL_QUESTIONS.map((q) =>
      scoreAnswer(targetLabelAnswers[q.id])
    );

    const datasetScore =
      datasetScores.length > 0
        ? Math.round(
            datasetScores.reduce((a, b) => a + b, 0) / datasetScores.length
          )
        : 0;
    const targetLabelScore =
      targetLabelScores.length > 0
        ? Math.round(
            targetLabelScores.reduce((a, b) => a + b, 0) /
              targetLabelScores.length
          )
        : 0;

    const overallScore = Math.round(
      datasetScore * 0.7 + targetLabelScore * 0.3
    );

    return { datasetScore, targetLabelScore, overallScore };
  };

  const allDatasetQuestionsAnswered = DATASET_QUESTIONS.every(
    (q) => datasetAnswers[q.id]
  );
  const allTargetLabelQuestionsAnswered = TARGET_LABEL_QUESTIONS.every(
    (q) => targetLabelAnswers[q.id]
  );
  const canComplete =
    allDatasetQuestionsAnswered && allTargetLabelQuestionsAnswered;

  const handleComplete = () => {
    if (!canComplete) return;

    const { datasetScore, targetLabelScore, overallScore } = calculateScores();

    const datasetChecks: DataSuitabilityCheck[] = DATASET_QUESTIONS.map(
      (q) => ({
        id: q.id,
        question: q.question,
        answer: datasetAnswers[q.id] as "yes" | "no" | "unknown",
        description: q.description,
      })
    );

    const targetLabelChecks: DataSuitabilityCheck[] =
      TARGET_LABEL_QUESTIONS.map((q) => ({
        id: q.id,
        question: q.question,
        answer: targetLabelAnswers[q.id] as "yes" | "no" | "unknown",
        description: q.description,
      }));

    const results: ManualAssessmentResults = {
      datasetChecks,
      targetLabelChecks,
      overallScore,
      datasetScore,
      targetLabelScore,
    };

    onComplete(results);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        {DATASET_QUESTIONS.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            currentAnswer={datasetAnswers[question.id] || null}
            isHelpExpanded={expandedHelp === question.id}
            onAnswerSelect={(answer) =>
              handleDatasetAnswer(question.id, answer)
            }
            onToggleHelp={() => toggleHelp(question.id)}
          />
        ))}

        {TARGET_LABEL_QUESTIONS.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            currentAnswer={targetLabelAnswers[question.id] || null}
            isHelpExpanded={expandedHelp === question.id}
            onAnswerSelect={(answer) =>
              handleTargetLabelAnswer(question.id, answer)
            }
            onToggleHelp={() => toggleHelp(question.id)}
          />
        ))}
      </div>

      {canComplete && (
        <div className="border-t border-border pt-8">
          <Card className="bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/10 dark:border-blue-500/30">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-lg font-semibold mb-3 text-foreground">
                Assessment Complete
              </h4>
              <p className="text-muted-foreground mb-6">
                You've answered all questions. Click below to see your results
                and continue.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleComplete} size="lg">
                  View Assessment Results
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
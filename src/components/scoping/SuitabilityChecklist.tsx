
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DataSuitabilityCheck } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { SuitabilityQuestionCard } from "./suitability/SuitabilityQuestionCard";
import { SuitabilityScoreCard } from "./suitability/SuitabilityScoreCard";

type SuitabilityChecklistProps = {
  suitabilityChecks: DataSuitabilityCheck[];
  handleSuitabilityUpdate: (id: string, answer: 'yes' | 'no' | 'unknown') => void;
  suitabilityScore: number;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const SuitabilityChecklist = ({
  suitabilityChecks,
  handleSuitabilityUpdate,
  suitabilityScore,
  moveToPreviousStep,
  moveToNextStep,
}: SuitabilityChecklistProps) => {
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);

  // Enhanced questions with practical guidance
  const enhancedQuestions = [
    {
      id: "completeness",
      title: "Data Completeness Assessment",
      question: "When you examine the data, what do you observe?",
      description: "Assess how complete and consistent your dataset appears",
      helpContent: {
        lookFor: [
          "Most rows have values in important columns",
          "Dates and numbers follow consistent formats",
          "Text entries use similar language and structure",
          "Geographic locations are properly spelled"
        ],
        warningsSigns: [
          "Many empty cells or missing values",
          "Inconsistent date formats (DD/MM vs MM/DD)",
          "Mixed languages or encoding issues",
          "Unclear or inconsistent category labels"
        ],
        whyMatters: "Complete, consistent data is essential for AI models to learn accurate patterns and make reliable predictions for humanitarian decisions."
      },
      responseOptions: [
        { value: "yes", label: "Looks Clean", description: "Most data is complete and consistent" },
        { value: "unknown", label: "Some Issues", description: "Noticeable problems but still usable" },
        { value: "no", label: "Many Problems", description: "Significant cleaning needed" }
      ]
    },
    {
      id: "representativeness",
      title: "Population Representativeness",
      question: "Does this data fairly represent the people you want to help?",
      description: "Evaluate if the data covers your target communities adequately",
      helpContent: {
        lookFor: [
          "Data includes diverse demographic groups",
          "Geographic coverage matches your project area",
          "Time period is recent and relevant",
          "Sample size appears adequate for conclusions"
        ],
        warningsSigns: [
          "Missing data from vulnerable populations",
          "Geographic bias toward urban areas",
          "Data is several years old",
          "Very small sample sizes for subgroups"
        ],
        whyMatters: "Biased or unrepresentative data can lead to AI solutions that don't work for the most vulnerable populations, potentially worsening inequalities."
      },
      responseOptions: [
        { value: "yes", label: "Representative", description: "Covers target population well" },
        { value: "unknown", label: "Partially", description: "Some gaps but generally adequate" },
        { value: "no", label: "Limited Coverage", description: "Missing key populations or areas" }
      ]
    },
    {
      id: "privacy",
      title: "Privacy & Ethics Assessment",
      question: "Could using this data cause harm or raise privacy concerns?",
      description: "Consider potential risks to individuals and communities",
      helpContent: {
        lookFor: [
          "Data is properly anonymized",
          "Clear consent for intended use",
          "No sensitive personal identifiers",
          "Appropriate data sharing agreements"
        ],
        warningsSigns: [
          "Individual names or ID numbers visible",
          "Location data precise enough to identify people",
          "Sensitive health or financial information",
          "No clear permissions for AI use"
        ],
        whyMatters: "Privacy violations can harm vulnerable populations, damage trust in humanitarian organizations, and violate legal regulations."
      },
      responseOptions: [
        { value: "yes", label: "Privacy Safe", description: "Low risk of privacy concerns" },
        { value: "unknown", label: "Need Review", description: "Some concerns need addressing" },
        { value: "no", label: "High Risk", description: "Significant privacy or ethical issues" }
      ]
    },
    {
      id: "sufficiency",
      title: "Quality & Sufficiency Check",
      question: "Do you have enough good quality data for your project?",
      description: "Assess if the data volume and quality meet your project needs",
      helpContent: {
        lookFor: [
          "Sufficient records for statistical analysis",
          "Data covers relevant time periods",
          "Key variables needed for your use case",
          "Data source is credible and reliable"
        ],
        warningsSigns: [
          "Very small dataset (less than 100 records)",
          "Missing key variables for your analysis",
          "Data quality varies significantly",
          "Uncertain about data collection methods"
        ],
        whyMatters: "Insufficient or poor quality data will limit your AI model's effectiveness and could lead to unreliable results in humanitarian contexts."
      },
      responseOptions: [
        { value: "yes", label: "Sufficient", description: "Good quality and adequate volume" },
        { value: "unknown", label: "Borderline", description: "May work but with limitations" },
        { value: "no", label: "Insufficient", description: "Need more or better quality data" }
      ]
    }
  ];

  const toggleHelp = (questionId: string) => {
    setExpandedHelp(expandedHelp === questionId ? null : questionId);
  };

  const getAnswerForQuestion = (questionId: string) => {
    const check = suitabilityChecks.find(c => c.id === questionId);
    return check?.answer || null;
  };

  const allQuestionsAnswered = enhancedQuestions.every(q => 
    getAnswerForQuestion(q.id) !== null
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <StepHeading stepNumber={4} title="Data Suitability Assessment" />
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-6">
          Evaluate how suitable your chosen dataset is for your AI project. This assessment helps identify potential issues early and guides you toward success.
        </p>
        
        <div className="space-y-6 mb-8">
          {enhancedQuestions.map(question => (
            <SuitabilityQuestionCard
              key={question.id}
              question={question}
              currentAnswer={getAnswerForQuestion(question.id)}
              isHelpExpanded={expandedHelp === question.id}
              onAnswerSelect={(answer) => handleSuitabilityUpdate(question.id, answer)}
              onToggleHelp={() => toggleHelp(question.id)}
            />
          ))}
        </div>
        
        <SuitabilityScoreCard score={suitabilityScore} />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={moveToPreviousStep}>
          Previous
        </Button>
        <Button 
          onClick={moveToNextStep} 
          disabled={!allQuestionsAnswered}
        >
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

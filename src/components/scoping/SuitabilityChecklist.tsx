import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { DataSuitabilityCheck, EnhancedSuitabilityQuestion } from "@/types/scoping-phase";
import { StepHeading } from "./common/StepHeading";
import { SuitabilityQuestionCard } from "./suitability/SuitabilityQuestionCard";
import { SuitabilityScoreCard } from "./suitability/SuitabilityScoreCard";
import { useProject } from "@/contexts/ProjectContext";

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
  const { setSuitabilityChecks } = useProject();

  // Enhanced questions with humanitarian-focused guidance
  const enhancedQuestions: EnhancedSuitabilityQuestion[] = [
    {
      id: "data_completeness", // Updated to match calculation
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
        { value: "yes" as const, label: "Looks Clean", description: "Most data is complete and consistent" },
        { value: "unknown" as const, label: "Some Issues", description: "Noticeable problems but still usable" },
        { value: "no" as const, label: "Many Problems", description: "Significant cleaning needed" }
      ]
    },
    {
      id: "population_representativeness", // Updated to match calculation
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
        { value: "yes" as const, label: "Representative", description: "Covers target population well" },
        { value: "unknown" as const, label: "Partially", description: "Some gaps but generally adequate" },
        { value: "no" as const, label: "Limited Coverage", description: "Missing key populations or areas" }
      ]
    },
    {
      id: "privacy_ethics", // Updated to match calculation
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
        { value: "yes" as const, label: "Privacy Safe", description: "Low risk of privacy concerns" },
        { value: "unknown" as const, label: "Need Review", description: "Some concerns need addressing" },
        { value: "no" as const, label: "High Risk", description: "Significant privacy or ethical issues" }
      ]
    },
    {
      id: "quality_sufficiency", // Updated to match calculation
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
        { value: "yes" as const, label: "Sufficient", description: "Good quality and adequate volume" },
        { value: "unknown" as const, label: "Borderline", description: "May work but with limitations" },
        { value: "no" as const, label: "Insufficient", description: "Need more or better quality data" }
      ]
    }
  ];

  const toggleHelp = (questionId: string) => {
    setExpandedHelp(expandedHelp === questionId ? null : questionId);
  };

  const getAnswerForQuestion = (questionId: string) => {
    // Support both new and old IDs for backwards compatibility
    const idMapping = {
      'data_completeness': 'completeness',
      'population_representativeness': 'representativeness', 
      'privacy_ethics': 'privacy',
      'quality_sufficiency': 'sufficiency'
    };
    
    const oldId = idMapping[questionId as keyof typeof idMapping];
    const check = suitabilityChecks.find(c => c.id === questionId || c.id === oldId);
    return check?.answer || null;
  };

  const handleAnswerUpdate = (questionId: string, answer: 'yes' | 'no' | 'unknown') => {
    console.log('Updating answer for question:', questionId, 'with answer:', answer);
    
    // Update the context state with new ID format
    setSuitabilityChecks(prevChecks => {
      // Remove any existing check with old or new ID
      const idMapping = {
        'data_completeness': 'completeness',
        'population_representativeness': 'representativeness', 
        'privacy_ethics': 'privacy',
        'quality_sufficiency': 'sufficiency'
      };
      
      const oldId = idMapping[questionId as keyof typeof idMapping];
      const filteredChecks = prevChecks.filter(c => c.id !== questionId && c.id !== oldId);
      
      // Add the new check with correct ID
      const question = enhancedQuestions.find(q => q.id === questionId);
      const newCheck = {
        id: questionId, // Use new ID format
        question: question?.question || '',
        answer,
        description: question?.description || ''
      };
      
      return [...filteredChecks, newCheck];
    });
    
    handleSuitabilityUpdate(questionId, answer);
  };

  const allQuestionsAnswered = enhancedQuestions.every(q => 
    getAnswerForQuestion(q.id) !== null
  );

  const handleNextStep = () => {
    if (!allQuestionsAnswered) return;

    console.log('All suitability questions answered, proceeding to next step');
    console.log('Current suitability score:', suitabilityScore);
    
    moveToNextStep();
  };

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
              onAnswerSelect={(answer) => handleAnswerUpdate(question.id, answer)}
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
          onClick={handleNextStep} 
          disabled={!allQuestionsAnswered}
        >
          Next Step <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, MessageSquare, CheckCircle2, Search, Database, FileText } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type ScopingPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
};

// Toolkit steps for AI for Good scoping
const TOOLKIT_STEPS = [
  {
    id: "use-case",
    title: "Define AI Use Case",
    description: "Explore and define AI use cases for your social impact project",
    icon: CheckCircle2
  },
  {
    id: "feasibility",
    title: "Assess Technical Feasibility",
    description: "Evaluate technical feasibility and constraints",
    icon: Search
  },
  {
    id: "data",
    title: "Dataset Selection",
    description: "Find and evaluate responsible datasets for your project",
    icon: Database
  },
  {
    id: "evaluation",
    title: "Suitability Assessment",
    description: "Evaluate project suitability and ethical considerations",
    icon: FileText
  }
];

// Example AI use cases for social impact
const AI_USE_CASES = [
  { 
    id: 1, 
    name: "Healthcare Diagnostics", 
    description: "AI systems that analyze medical images or data to assist with diagnosis",
    example: "Computer vision models to detect diseases from x-rays or scans"
  },
  { 
    id: 2, 
    name: "Environmental Monitoring", 
    description: "AI solutions for monitoring and protecting natural resources",
    example: "Satellite imagery analysis to track deforestation or pollution"
  },
  { 
    id: 3, 
    name: "Accessibility Tools", 
    description: "AI to improve accessibility for people with disabilities",
    example: "Speech-to-text or image captioning technologies"
  },
  { 
    id: 4, 
    name: "Crisis Response", 
    description: "AI systems to assist in disaster or crisis situations",
    example: "Natural language processing for emergency message triage"
  },
  { 
    id: 5, 
    name: "Education Access", 
    description: "AI to improve access to quality education",
    example: "Personalized learning assistants or content translation"
  }
];

// Example datasets for AI projects
const EXAMPLE_DATASETS = [
  {
    id: 1,
    name: "Open Medical Imaging Dataset",
    source: "Medical Research Institute",
    license: "CC BY-NC",
    sampleSize: "50,000 images",
    domain: "Healthcare"
  },
  {
    id: 2,
    name: "Global Forest Watch",
    source: "Environmental NGO Consortium",
    license: "Open Data Commons",
    sampleSize: "Global satellite imagery",
    domain: "Environment"
  },
  {
    id: 3,
    name: "Common Voice",
    source: "Mozilla Foundation",
    license: "CC0",
    sampleSize: "9,000 hours of voice data",
    domain: "Accessibility"
  },
  {
    id: 4,
    name: "Crisis Text Messages",
    source: "Crisis Response Organization",
    license: "Research Only",
    sampleSize: "200,000 anonymized messages",
    domain: "Crisis Response"
  },
];

export const ScopingPhase = ({ onUpdateProgress, onCompletePhase }: ScopingPhaseProps) => {
  // State to track current toolkit step
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // State for use case definition
  const [useCaseData, setUseCaseData] = useState({
    selectedUseCase: "",
    customUseCase: "",
    targetBeneficiaries: "",
    successMetrics: "",
    ethicalConsiderations: ""
  });

  // State for feasibility assessment
  const [feasibilityData, setFeasibilityData] = useState({
    technicalApproach: "",
    requiredExpertise: "",
    estimatedTimeline: "",
    technicalRisks: "",
    resourceRequirements: ""
  });

  // State for dataset selection
  const [datasetData, setDatasetData] = useState({
    selectedDataset: "",
    customDataset: "",
    dataPrivacyPlan: "",
    dataProcessingApproach: "",
    dataGaps: ""
  });
  
  // State for suitability assessment
  const [suitabilityData, setSuitabilityData] = useState({
    impactAssessment: "",
    stakeholderFeedback: "",
    ethicsChecklist: {
      privacyAddressed: false,
      biasEvaluated: false,
      transparencyEnsured: false,
      securityMeasures: false,
      inclusiveDesign: false,
      harmPrevention: false
    },
    additionalConsiderations: ""
  });

  // Track completed sections
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
    "use-case": false,
    "feasibility": false,
    "data": false,
    "evaluation": false
  });

  // Calculate overall progress
  const calculateProgress = () => {
    const totalSteps = TOOLKIT_STEPS.length;
    const completedCount = Object.values(completedSections).filter(Boolean).length;
    
    if (onUpdateProgress) {
      onUpdateProgress(completedCount, totalSteps);
    }
    
    return (completedCount / totalSteps) * 100;
  };

  // Handle step navigation
  const handleNext = () => {
    // Mark current step as completed
    const currentStepId = TOOLKIT_STEPS[currentStepIndex].id;
    
    setCompletedSections(prev => ({
      ...prev,
      [currentStepId]: true
    }));

    // Move to next step if not at the end
    if (currentStepIndex < TOOLKIT_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setShowAIAssistant(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setShowAIAssistant(false);
    }
  };

  // Handle phase completion
  const handleCompletePhase = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
  };

  // Check if all required fields are filled in current step
  const isCurrentStepComplete = () => {
    const currentStepId = TOOLKIT_STEPS[currentStepIndex].id;
    
    switch (currentStepId) {
      case "use-case":
        return (
          (!!useCaseData.selectedUseCase || !!useCaseData.customUseCase) && 
          !!useCaseData.targetBeneficiaries &&
          !!useCaseData.successMetrics
        );
      case "feasibility":
        return (
          !!feasibilityData.technicalApproach &&
          !!feasibilityData.requiredExpertise
        );
      case "data":
        return (
          (!!datasetData.selectedDataset || !!datasetData.customDataset) &&
          !!datasetData.dataPrivacyPlan
        );
      case "evaluation":
        return (
          !!suitabilityData.impactAssessment &&
          Object.values(suitabilityData.ethicsChecklist).filter(Boolean).length >= 3
        );
      default:
        return false;
    }
  };
  
  // Check if all steps are completed to enable the "Complete Phase" button
  const isAllStepsCompleted = () => {
    return Object.values(completedSections).every(Boolean);
  };

  // Toggle AI assistant panel
  const toggleAIAssistant = () => {
    setShowAIAssistant(!showAIAssistant);
  };

  // Render functions for each step
  const renderUseCaseStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Select an AI for Good Use Case</h3>
        <p className="text-muted-foreground mb-4">
          Choose an existing category or define your custom use case
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select 
            value={useCaseData.selectedUseCase} 
            onValueChange={(value) => setUseCaseData({...useCaseData, selectedUseCase: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a use case category" />
            </SelectTrigger>
            <SelectContent>
              {AI_USE_CASES.map(useCase => (
                <SelectItem key={useCase.id} value={useCase.name}>
                  {useCase.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Use Case</SelectItem>
            </SelectContent>
          </Select>
          
          {useCaseData.selectedUseCase === "custom" && (
            <Input 
              placeholder="Enter your custom use case" 
              value={useCaseData.customUseCase}
              onChange={(e) => setUseCaseData({...useCaseData, customUseCase: e.target.value})}
            />
          )}
        </div>
        
        {useCaseData.selectedUseCase && useCaseData.selectedUseCase !== "custom" && (
          <Card className="bg-accent/50 mb-6">
            <CardContent className="pt-6">
              <h4 className="font-medium">
                {AI_USE_CASES.find(u => u.name === useCaseData.selectedUseCase)?.name}
              </h4>
              <p className="text-muted-foreground mt-1">
                {AI_USE_CASES.find(u => u.name === useCaseData.selectedUseCase)?.description}
              </p>
              <div className="mt-2">
                <span className="text-sm font-medium">Example: </span>
                <span className="text-sm">
                  {AI_USE_CASES.find(u => u.name === useCaseData.selectedUseCase)?.example}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="beneficiaries">Target Beneficiaries</Label>
          <Textarea 
            id="beneficiaries"
            placeholder="Who will benefit from this solution? Be as specific as possible."
            value={useCaseData.targetBeneficiaries}
            onChange={(e) => setUseCaseData({...useCaseData, targetBeneficiaries: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="metrics">Success Metrics</Label>
          <Textarea 
            id="metrics"
            placeholder="What metrics will you use to measure success?"
            value={useCaseData.successMetrics}
            onChange={(e) => setUseCaseData({...useCaseData, successMetrics: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="ethics">Ethical Considerations</Label>
          <Textarea 
            id="ethics"
            placeholder="What are the potential ethical challenges or considerations for this use case?"
            value={useCaseData.ethicalConsiderations}
            onChange={(e) => setUseCaseData({...useCaseData, ethicalConsiderations: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderFeasibilityStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Technical Feasibility Assessment</h3>
        <p className="text-muted-foreground mb-4">
          Evaluate the technical approach and requirements for your AI solution
        </p>
      </div>
      
      <Tabs defaultValue="approach" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="approach">Approach</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="approach" className="space-y-4">
          <div>
            <Label htmlFor="technical-approach">Technical Approach</Label>
            <Textarea 
              id="technical-approach"
              placeholder="Describe your technical approach (e.g., machine learning models, data processing pipeline)"
              value={feasibilityData.technicalApproach}
              onChange={(e) => setFeasibilityData({...feasibilityData, technicalApproach: e.target.value})}
              className="min-h-[150px] mt-2"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <div>
            <Label htmlFor="expertise">Required Expertise</Label>
            <Textarea 
              id="expertise"
              placeholder="What expertise is required for this project?"
              value={feasibilityData.requiredExpertise}
              onChange={(e) => setFeasibilityData({...feasibilityData, requiredExpertise: e.target.value})}
              className="min-h-[100px] mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="timeline">Estimated Timeline</Label>
            <Select 
              value={feasibilityData.estimatedTimeline}
              onValueChange={(value) => setFeasibilityData({...feasibilityData, estimatedTimeline: value})}
            >
              <SelectTrigger id="timeline">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3 months">1-3 months</SelectItem>
                <SelectItem value="3-6 months">3-6 months</SelectItem>
                <SelectItem value="6-12 months">6-12 months</SelectItem>
                <SelectItem value="1+ year">1+ year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="resources">Resource Requirements</Label>
            <Textarea 
              id="resources"
              placeholder="What resources (technology, infrastructure, etc.) are needed?"
              value={feasibilityData.resourceRequirements}
              onChange={(e) => setFeasibilityData({...feasibilityData, resourceRequirements: e.target.value})}
              className="min-h-[100px] mt-2"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="risks" className="space-y-4">
          <div>
            <Label htmlFor="risks">Technical Risks</Label>
            <Textarea 
              id="risks"
              placeholder="What are the potential technical challenges or risks?"
              value={feasibilityData.technicalRisks}
              onChange={(e) => setFeasibilityData({...feasibilityData, technicalRisks: e.target.value})}
              className="min-h-[150px] mt-2"
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="text-base">Feasibility Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="check-1" />
              <label 
                htmlFor="check-1" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Technology exists to implement this solution
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check-2" />
              <label 
                htmlFor="check-2" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Required expertise is available or accessible
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check-3" />
              <label 
                htmlFor="check-3" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Timeline is realistic for the proposed solution
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check-4" />
              <label 
                htmlFor="check-4" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Technical risks have mitigation strategies
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDatasetStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Responsible Dataset Selection</h3>
        <p className="text-muted-foreground mb-4">
          Find and evaluate datasets suitable for your AI for Good project
        </p>
      </div>
      
      <div className="mb-6">
        <RadioGroup 
          value={datasetData.selectedDataset}
          onValueChange={(value) => setDatasetData({...datasetData, selectedDataset: value})}
        >
          <div className="mb-4">
            <Label className="text-base">Select Dataset Approach</Label>
          </div>
          
          {EXAMPLE_DATASETS.map(dataset => (
            <div key={dataset.id} className="flex items-start space-x-2 mb-4">
              <RadioGroupItem value={dataset.name} id={`dataset-${dataset.id}`} className="mt-1" />
              <div className="grid gap-1.5">
                <Label htmlFor={`dataset-${dataset.id}`} className="font-medium">
                  {dataset.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Source: {dataset.source}<br />
                  License: {dataset.license}<br />
                  Sample size: {dataset.sampleSize}<br />
                  Domain: {dataset.domain}
                </p>
              </div>
            </div>
          ))}
          
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="custom" id="dataset-custom" className="mt-1" />
            <div className="grid gap-1.5 w-full">
              <Label htmlFor="dataset-custom" className="font-medium">
                Custom Dataset
              </Label>
              {datasetData.selectedDataset === "custom" && (
                <Textarea 
                  placeholder="Describe your custom dataset (source, size, collection method, etc.)"
                  value={datasetData.customDataset}
                  onChange={(e) => setDatasetData({...datasetData, customDataset: e.target.value})}
                  className="min-h-[100px] mt-2"
                />
              )}
            </div>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="data-privacy">Data Privacy & Ethics Plan</Label>
          <Textarea 
            id="data-privacy"
            placeholder="How will you ensure data privacy and ethical use of the dataset?"
            value={datasetData.dataPrivacyPlan}
            onChange={(e) => setDatasetData({...datasetData, dataPrivacyPlan: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="data-processing">Data Processing Approach</Label>
          <Textarea 
            id="data-processing"
            placeholder="How will you process, clean, and prepare the data?"
            value={datasetData.dataProcessingApproach}
            onChange={(e) => setDatasetData({...datasetData, dataProcessingApproach: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="data-gaps">Data Gaps & Limitations</Label>
          <Textarea 
            id="data-gaps"
            placeholder="What are the known limitations or gaps in the dataset?"
            value={datasetData.dataGaps}
            onChange={(e) => setDatasetData({...datasetData, dataGaps: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderSuitabilityStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Project Suitability Assessment</h3>
        <p className="text-muted-foreground mb-4">
          Evaluate overall project suitability and ethical considerations
        </p>
      </div>
      
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="impact">Impact Assessment</Label>
          <Textarea 
            id="impact"
            placeholder="Describe the expected social impact of your project"
            value={suitabilityData.impactAssessment}
            onChange={(e) => setSuitabilityData({...suitabilityData, impactAssessment: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="stakeholders">Stakeholder Feedback</Label>
          <Textarea 
            id="stakeholders"
            placeholder="Summarize feedback from stakeholders or beneficiaries (if applicable)"
            value={suitabilityData.stakeholderFeedback}
            onChange={(e) => setSuitabilityData({...suitabilityData, stakeholderFeedback: e.target.value})}
            className="min-h-[100px] mt-2"
          />
        </div>
      </div>
      
      <Card className="bg-accent/50 mb-6">
        <CardHeader>
          <CardTitle className="text-base">Ethics & Responsibility Checklist</CardTitle>
          <CardDescription>Check all items that have been addressed in your project planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-1" 
                checked={suitabilityData.ethicsChecklist.privacyAddressed}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      privacyAddressed: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-1" className="text-sm font-medium leading-none">
                Privacy and data protection measures
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-2"
                checked={suitabilityData.ethicsChecklist.biasEvaluated}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      biasEvaluated: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-2" className="text-sm font-medium leading-none">
                Bias and fairness evaluation
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-3"
                checked={suitabilityData.ethicsChecklist.transparencyEnsured}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      transparencyEnsured: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-3" className="text-sm font-medium leading-none">
                Transparency and explainability
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-4"
                checked={suitabilityData.ethicsChecklist.securityMeasures}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      securityMeasures: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-4" className="text-sm font-medium leading-none">
                Security and vulnerability assessment
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-5"
                checked={suitabilityData.ethicsChecklist.inclusiveDesign}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      inclusiveDesign: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-5" className="text-sm font-medium leading-none">
                Inclusive design practices
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="ethics-6"
                checked={suitabilityData.ethicsChecklist.harmPrevention}
                onCheckedChange={(checked) => 
                  setSuitabilityData({
                    ...suitabilityData, 
                    ethicsChecklist: {
                      ...suitabilityData.ethicsChecklist,
                      harmPrevention: checked as boolean
                    }
                  })
                }
              />
              <label htmlFor="ethics-6" className="text-sm font-medium leading-none">
                Harm prevention and mitigation strategies
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div>
        <Label htmlFor="additional">Additional Considerations</Label>
        <Textarea 
          id="additional"
          placeholder="Note any additional ethical considerations or suitability factors"
          value={suitabilityData.additionalConsiderations}
          onChange={(e) => setSuitabilityData({...suitabilityData, additionalConsiderations: e.target.value})}
          className="min-h-[100px] mt-2"
        />
      </div>
    </div>
  );

  // AI Assistant suggestions based on current step
  const getAIAssistantContent = () => {
    const currentStepId = TOOLKIT_STEPS[currentStepIndex].id;
    
    switch (currentStepId) {
      case "use-case":
        return (
          <>
            <h4 className="font-medium mb-2">AI Use Case Suggestions</h4>
            <ul className="space-y-2 text-sm">
              <li>• Consider how your AI solution addresses a specific social need rather than using AI for its own sake</li>
              <li>• Define success metrics that directly relate to social impact, not just technical performance</li>
              <li>• Identify specific beneficiary groups and how they will interact with your solution</li>
              <li>• Explore potential unintended consequences of your AI system</li>
            </ul>
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h5 className="font-medium text-sm mb-1">Example</h5>
              <p className="text-xs text-muted-foreground">
                "Our AI image analysis system will help rural healthcare workers identify skin conditions with limited training. 
                Success will be measured by diagnostic accuracy and increased patient access to dermatological care in underserved regions."
              </p>
            </div>
          </>
        );
      
      case "feasibility":
        return (
          <>
            <h4 className="font-medium mb-2">Technical Feasibility Tips</h4>
            <ul className="space-y-2 text-sm">
              <li>• Start with simpler ML models before attempting more complex approaches</li>
              <li>• Consider edge deployment for areas with limited connectivity</li>
              <li>• Identify technical expertise gaps early in the project</li>
              <li>• Evaluate cloud vs. on-premise infrastructure needs</li>
              <li>• Account for model maintenance and updating in your timeline</li>
            </ul>
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h5 className="font-medium text-sm mb-1">Resource Consideration</h5>
              <p className="text-xs text-muted-foreground">
                "AI for Good projects often have resource constraints. Consider using transfer learning to reduce computational requirements, 
                and explore partnerships with academic institutions or tech companies for additional support."
              </p>
            </div>
          </>
        );
      
      case "data":
        return (
          <>
            <h4 className="font-medium mb-2">Responsible Dataset Selection</h4>
            <ul className="space-y-2 text-sm">
              <li>• Evaluate datasets for representation of your target beneficiaries</li>
              <li>• Consider data ownership and sovereignty issues, especially in global contexts</li>
              <li>• Document data limitations and potential biases</li>
              <li>• Establish clear data governance processes</li>
              <li>• Ensure proper consent for data collection and usage</li>
            </ul>
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h5 className="font-medium text-sm mb-1">Data Ethics Tip</h5>
              <p className="text-xs text-muted-foreground">
                "When working with vulnerable populations, consider participatory data collection methods 
                that involve community members in decisions about what data is collected and how it's used."
              </p>
            </div>
          </>
        );
      
      case "evaluation":
        return (
          <>
            <h4 className="font-medium mb-2">Suitability Assessment Guidance</h4>
            <ul className="space-y-2 text-sm">
              <li>• Consider whether AI is the most appropriate solution for the problem</li>
              <li>• Involve stakeholders in project evaluation and decision-making</li>
              <li>• Plan for ongoing ethical review as the project develops</li>
              <li>• Develop harm mitigation strategies before deployment</li>
              <li>• Create mechanisms for user feedback and redress</li>
            </ul>
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h5 className="font-medium text-sm mb-1">Ethics Framework</h5>
              <p className="text-xs text-muted-foreground">
                "Consider adopting an existing AI ethics framework suited for your domain, such as the WHO guidance 
                for AI in healthcare or the Montreal Declaration for Responsible AI Development."
              </p>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  // Render current step content
  const renderCurrentStep = () => {
    const currentStepId = TOOLKIT_STEPS[currentStepIndex].id;
    
    switch (currentStepId) {
      case "use-case":
        return renderUseCaseStep();
      case "feasibility":
        return renderFeasibilityStep();
      case "data":
        return renderDatasetStep();
      case "evaluation":
        return renderSuitabilityStep();
      default:
        return null;
    }
  };

  const progress = calculateProgress();
  const currentStep = TOOLKIT_STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === TOOLKIT_STEPS.length - 1;

  return (
    <div className="flex flex-col h-full">      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Scoping Phase: AI for Good Project Toolkit</h2>
        <p className="text-muted-foreground">
          Define the scope, feasibility, and ethical considerations for your AI for Good project.
        </p>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
        {/* Sidebar with steps */}
        <div className="hidden md:block">
          <Card className="sticky top-20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Toolkit Steps</h3>
              <div className="space-y-1">
                {TOOLKIT_STEPS.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      currentStepIndex === index 
                        ? 'bg-primary/10 border-l-2 border-primary' 
                        : index < currentStepIndex 
                          ? (completedSections[step.id] ? 'text-green-500' : '') 
                          : 'text-muted-foreground'
                    }`}
                    onClick={() => {
                      // Only allow navigation to already visited steps or the next available step
                      if (index <= currentStepIndex + 1) {
                        setCurrentStepIndex(index);
                        setShowAIAssistant(false);
                      }
                    }}
                  >
                    <div className="mr-3">
                      {completedSections[step.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{step.title}</p>
                      {currentStepIndex === index && (
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAIAssistant}
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                {showAIAssistant ? "Hide Assistant" : "AI Assistant"}
              </Button>
            </CardHeader>
            
            <CardContent>
              {showAIAssistant && (
                <Card className="bg-accent/30 mb-6">
                  <CardContent className="p-4">
                    {getAIAssistantContent()}
                  </CardContent>
                </Card>
              )}
              
              {renderCurrentStep()}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-6 pb-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              
              {isLastStep ? (
                <Button
                  onClick={handleCompletePhase}
                  disabled={!isAllStepsCompleted()}
                >
                  Complete Phase
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!isCurrentStepComplete()}
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

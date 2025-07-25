import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Server,
  Database,
  Wifi,
  Cloud,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Info,
  Lightbulb,
  Lock,
  Loader2,
  Monitor,
  HardDrive,
  Smartphone,
  Building2,
  Shield,
  Globe,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { scopingApi } from "@/lib/scoping-api";
import { useProject } from "@/contexts/ProjectContext";
import { TechnicalInfrastructure, InfrastructureAssessment } from "@/types/scoping-phase";

type TechnicalInfrastructureAssessmentProps = {
  moveToNextStep: () => void;
  updatePhaseStatus: (
    phaseId: string,
    status: "not-started" | "in-progress" | "completed",
    progress: number
  ) => void;
};

export const TechnicalInfrastructureAssessment = ({
  moveToNextStep,
  updatePhaseStatus,
}: TechnicalInfrastructureAssessmentProps) => {
  // Use context state instead of local state
  const { 
    technicalInfrastructure, 
    setTechnicalInfrastructure,
    infrastructureAssessment,
    setInfrastructureAssessment
  } = useProject();

  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>("computing_resources");

  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get("projectId");

  const infrastructureOptions = {
    computing_resources: {
      label: "Computing Resources",
      description: "What computing equipment does your organization have access to?",
      icon: <Monitor className="h-5 w-5" />,
      options: [
        {
          value: "cloud_platforms",
          label: "Cloud Computing Platforms",
          description: "AWS, Google Cloud, Azure, or other cloud services",
          icon: <Cloud className="h-5 w-5" />,
        },
        {
          value: "organizational_computers",
          label: "Organizational Computers",
          description: "Dedicated laptops/desktops owned by your organization",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          value: "partner_shared",
          label: "Partner Organization Resources",
          description: "Computing resources shared with partner organizations",
          icon: <Server className="h-5 w-5" />,
        },
        {
          value: "community_shared",
          label: "Community Shared Resources",
          description: "Internet cafes, libraries, community centers, or universities",
          icon: <Globe className="h-5 w-5" />,
        },
        {
          value: "mobile_devices",
          label: "Mobile Devices Only",
          description: "Primarily tablets and smartphones",
          icon: <Smartphone className="h-5 w-5" />,
        },
        {
          value: "basic_hardware",
          label: "Basic/Older Hardware",
          description: "Limited computing power or older equipment",
          icon: <Monitor className="h-5 w-5" />,
        },
        {
          value: "no_computing",
          label: "No Dedicated Computing Resources",
          description: "No regular access to computers or digital devices",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ],
    },
    storage_data: {
      label: "Data Storage & Management",
      description: "How does your organization store and manage data?",
      icon: <Database className="h-5 w-5" />,
      options: [
        {
          value: "secure_cloud",
          label: "Secure Cloud Storage",
          description: "Cloud storage with data governance and security protocols",
          icon: <Shield className="h-5 w-5" />,
        },
        {
          value: "organizational_servers",
          label: "Organizational Servers",
          description: "Your organization's own servers and storage systems",
          icon: <Server className="h-5 w-5" />,
        },
        {
          value: "partner_systems",
          label: "Partner Data Systems",
          description: "Data storage through partner organization systems",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          value: "government_systems",
          label: "Government/Institutional Systems",
          description: "Government or institutional data management systems",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          value: "basic_digital",
          label: "Basic Digital Storage",
          description: "USB drives, external hard drives, personal cloud accounts",
          icon: <HardDrive className="h-5 w-5" />,
        },
        {
          value: "local_storage",
          label: "Local Storage Systems",
          description: "On-premises servers, local databases, or internal storage systems",
          icon: <Server className="h-5 w-5" />,
        },
        {
          value: "paper_based",
          label: "Primarily Paper-Based",
          description: "Mainly paper records with minimal digital storage",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ],
    },
    internet_connectivity: {
      label: "Internet Connectivity",
      description: "What is the quality of your internet connection?",
      icon: <Wifi className="h-5 w-5" />,
      options: [
        {
          value: "stable_broadband",
          label: "Stable High-Speed Internet",
          description: "Reliable broadband, fiber, or consistent wireless connection",
          icon: <Globe className="h-5 w-5" />,
        },
        {
          value: "satellite_internet",
          label: "Satellite Internet",
          description: "Satellite-based internet connection (may have latency)",
          icon: <Globe className="h-5 w-5" />,
        },
        {
          value: "intermittent_connection",
          label: "Intermittent Connection",
          description: "Sometimes reliable, occasional outages or slower speeds",
          icon: <Wifi className="h-5 w-5" />,
        },
        {
          value: "mobile_data_primary",
          label: "Mobile Data Primary",
          description: "Primarily mobile/cellular data with usage limits",
          icon: <Smartphone className="h-5 w-5" />,
        },
        {
          value: "shared_community",
          label: "Shared Community Internet",
          description: "Access through community centers, cafes, or public wifi",
          icon: <Wifi className="h-5 w-5" />,
        },
        {
          value: "limited_connectivity",
          label: "Very Limited Connectivity",
          description: "Unreliable, very slow, or infrequent internet access",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
        {
          value: "no_internet",
          label: "No Regular Internet Access",
          description: "No consistent internet connectivity",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ],
    },
    deployment_environment: {
      label: "Deployment Environment",
      description: "Where would you deploy and run your AI solution?",
      icon: <Cloud className="h-5 w-5" />,
      options: [
        {
          value: "cloud_deployment",
          label: "Cloud Deployment",
          description: "Cloud platforms for wide accessibility and scalability",
          icon: <Cloud className="h-5 w-5" />,
        },
        {
          value: "hybrid_approach",
          label: "Hybrid Cloud-Local",
          description: "Combination of cloud and local deployment systems",
          icon: <Server className="h-5 w-5" />,
        },
        {
          value: "organizational_infrastructure",
          label: "Organizational Infrastructure",
          description: "Deploy within your organization's existing infrastructure",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          value: "partner_infrastructure",
          label: "Partner Organization Infrastructure",
          description: "Deploy through partner organization systems",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          value: "field_mobile",
          label: "Field Mobile Deployment",
          description: "Mobile devices and tablets for field operations",
          icon: <Smartphone className="h-5 w-5" />,
        },
        {
          value: "offline_systems",
          label: "Offline/Standalone Systems",
          description: "Systems that can operate without internet connectivity",
          icon: <Monitor className="h-5 w-5" />,
        },
        {
          value: "no_deployment",
          label: "No Deployment Capability",
          description: "Unable to deploy digital solutions currently",
          icon: <AlertTriangle className="h-5 w-5" />,
        },
      ],
    },
  };

  const isFormComplete = () => {
    return (
      technicalInfrastructure.computing_resources &&
      technicalInfrastructure.storage_data &&
      technicalInfrastructure.internet_connectivity &&
      technicalInfrastructure.deployment_environment
    );
  };

  const handleInfrastructureChange = (
    category: keyof TechnicalInfrastructure,
    value: string
  ) => {
    // Update context state instead of local state
    setTechnicalInfrastructure((prev) => ({
      ...prev,
      [category]: value,
    }));
    
    // Clear assessment when infrastructure changes
    setInfrastructureAssessment(null);
    setAssessmentError(null);
  };

  const handleAssessInfrastructure = async () => {
    if (!projectId || !isFormComplete()) return;

    setIsAssessing(true);
    setAssessmentError(null);

    try {
      const result = await scopingApi.assessInfrastructure(projectId, technicalInfrastructure);
      
      // Update context state with the assessment result
      setInfrastructureAssessment(result);
      updatePhaseStatus("scoping", "in-progress", 20);
    } catch (error) {
      setAssessmentError(
        error instanceof Error ? error.message : "Assessment failed"
      );
    } finally {
      setIsAssessing(false);
    }
  };

  const handleReviseInfrastructure = () => {
    setInfrastructureAssessment(null);
    setAssessmentError(null);
  };

  const handleContinueToUseCases = () => {
    if (infrastructureAssessment?.can_proceed) {
      moveToNextStep();
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? "" : sectionId);
  };

  const getButtonState = () => {
    if (isAssessing) return "assessing";
    if (!isFormComplete()) return "incomplete";
    if (assessmentError) return "error";
    if (!infrastructureAssessment) return "ready_to_assess";
    if (!infrastructureAssessment.can_proceed) return "failed";
    return "can_proceed";
  };

  const getButtonAction = () => {
    const state = getButtonState();
    switch (state) {
      case "ready_to_assess":
        return handleAssessInfrastructure;
      case "failed":
      case "error":
        return handleReviseInfrastructure;
      case "can_proceed":
        return handleContinueToUseCases;
      default:
        return () => {};
    }
  };

  const getButtonDisabled = () => {
    const state = getButtonState();
    return state === "incomplete" || state === "assessing";
  };

  const getButtonVariant = () => {
    const state = getButtonState();
    switch (state) {
      case "failed":
      case "error":
        return "outline" as const;
      case "can_proceed":
        return "default" as const;
      default:
        return "default" as const;
    }
  };

  const getButtonClassName = () => {
    const state = getButtonState();
    switch (state) {
      case "can_proceed":
        return "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700";
      case "failed":
      case "error":
        return "border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950";
      default:
        return "";
    }
  };

  const getButtonContent = () => {
    const state = getButtonState();
    switch (state) {
      case "incomplete":
        return (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Complete All Sections
          </>
        );
      case "assessing":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Infrastructure...
          </>
        );
      case "ready_to_assess":
        return (
          <>
            <Info className="mr-2 h-4 w-4" />
            Assess Infrastructure
          </>
        );
      case "failed":
      case "error":
        return (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Revise Infrastructure Setup
          </>
        );
      case "can_proceed":
        return (
          <>
            Continue to AI Use Cases
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        );
      default:
        return "Assess Infrastructure";
    }
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Setup";
    if (score >= 60) return "Good Setup";
    if (score >= 40) return "Limited Setup";
    return "Insufficient Setup";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            1
          </div>
          <h2 className="text-xl font-semibold">Technical Infrastructure Assessment</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Let's assess your organization's technical infrastructure to ensure it can support
          your AI project and help us recommend suitable AI approaches.
        </p>

        <div className="space-y-4">
          {Object.entries(infrastructureOptions).map(([category, config]) => {
            const isExpanded = expandedSection === category;
            const isCompleted = technicalInfrastructure[category as keyof TechnicalInfrastructure];
            
            return (
              <Card key={category} className={`border-2 ${isCompleted ? 'border-green-200 dark:border-green-800' : 'border-border'}`}>
                <CardHeader 
                  className="pb-3 cursor-pointer"
                  onClick={() => toggleSection(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{config.icon}</div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {config.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Selected
                        </Badge>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <RadioGroup
                      value={technicalInfrastructure[category as keyof TechnicalInfrastructure]}
                      onValueChange={(value) =>
                        handleInfrastructureChange(
                          category as keyof TechnicalInfrastructure,
                          value
                        )
                      }
                      className="grid grid-cols-1 gap-3"
                    >
                      {config.options.map((option) => (
                        <div key={option.value} className="relative">
                          <RadioGroupItem
                            value={option.value}
                            id={`${category}-${option.value}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${category}-${option.value}`}
                            className="flex items-center p-4 rounded-lg border-2 border-muted cursor-pointer hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-primary">{option.icon}</div>
                              <div className="flex-1">
                                <div className="font-medium text-foreground">
                                  {option.label}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {assessmentError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Assessment Error</AlertTitle>
            <AlertDescription>{assessmentError}</AlertDescription>
          </Alert>
        )}

        {infrastructureAssessment && (
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Infrastructure Assessment Results
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {infrastructureAssessment.score}%
                </div>
                <Badge
                  variant={getScoreVariant(infrastructureAssessment.score)}
                  className="text-sm"
                >
                  {getScoreLabel(infrastructureAssessment.score)}
                </Badge>
              </div>

              {infrastructureAssessment.scoring_breakdown && (
                <div className="space-y-3">
                  <h4 className="font-medium">Scoring Breakdown:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(infrastructureAssessment.scoring_breakdown).map(
                      ([key, breakdown]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <span className="text-sm font-medium capitalize">
                              {key.replace("_", " ")}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {breakdown.reasoning}
                            </p>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {breakdown.score}/{breakdown.max_score}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Assessment For Your Specific Project</AlertTitle>
                <AlertDescription className="mt-2">
                  {infrastructureAssessment.reasoning}
                </AlertDescription>
              </Alert>

              {infrastructureAssessment.recommendations && infrastructureAssessment.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {infrastructureAssessment.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {!infrastructureAssessment.can_proceed && infrastructureAssessment.non_ai_alternatives && infrastructureAssessment.non_ai_alternatives.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Infrastructure Assessment Failed</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-4 mt-2">
                      <p>
                        Your current technical setup cannot support the AI
                        project you're planning.
                      </p>

                      <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Recommended Non-AI Alternatives:
                        </h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {infrastructureAssessment.non_ai_alternatives.map((alt, index) => (
                            <li key={index}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {!infrastructureAssessment &&
            !isAssessing &&
            isFormComplete() &&
            "Ready to assess your technical setup"}
          {infrastructureAssessment?.can_proceed &&
            "Infrastructure meets requirements for AI development"}
          {infrastructureAssessment &&
            !infrastructureAssessment.can_proceed &&
            "Infrastructure needs strengthening for AI projects"}
        </div>
        <div className="flex justify-center pt-6">
          <Button
            onClick={getButtonAction()}
            disabled={getButtonDisabled()}
            size="lg"
            variant={getButtonVariant()}
            className={getButtonClassName()}
          >
            {getButtonContent()}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
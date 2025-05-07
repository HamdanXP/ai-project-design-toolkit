
import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectBlueprintSidebar, ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { ScopingPhase } from "@/components/ScopingPhase";
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const ProjectBlueprint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activePhaseId, setActivePhaseId] = useState("reflection");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const [projectPrompt, setProjectPrompt] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  
  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: "reflection",
      name: "Reflection",
      status: "in-progress",
      progress: 0,
      totalSteps: 7,
      completedSteps: 0
    },
    {
      id: "scoping",
      name: "Scoping",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "development",
      name: "Development",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "evaluation",
      name: "Evaluation",
      status: "not-started",
      progress: 0,
      totalSteps: 4,
      completedSteps: 0
    }
  ]);

  // Load project information when component mounts
  useEffect(() => {
    const prompt = localStorage.getItem('projectPrompt');
    const files = localStorage.getItem('projectFiles');
    
    if (prompt) {
      setProjectPrompt(prompt);
    }
    
    if (files) {
      try {
        setProjectFiles(JSON.parse(files));
      } catch (error) {
        console.error("Error parsing project files:", error);
      }
    }
  }, []);

  // Check if current phase is completed
  const currentPhaseCompleted = phases.find(phase => phase.id === activePhaseId)?.status === "completed";

  useEffect(() => {
    // Close sidebar by default on mobile
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile && 
        sidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) && 
        toggleBtnRef.current && 
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          const progress = Math.round((completed / total) * 100);
          const status = 
            progress === 0 ? "not-started" :
            progress === 100 ? "completed" : "in-progress";
          
          return {
            ...phase,
            progress,
            completedSteps: completed,
            status
          };
        }
        return phase;
      })
    );
  };

  const handleCompletePhase = (phaseId: string) => {
    // Store phase data in localStorage when a phase is completed
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    // Store in localStorage under a key specific to this phase and project
    localStorage.setItem(`project_phase_${phaseId}`, JSON.stringify(phaseData));

    // Mark the current phase as completed
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            status: "completed",
            progress: 100,
            completedSteps: phase.totalSteps
          };
        }
        return phase;
      })
    );
    
    // Determine the next phase to activate
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const currentIndex = phaseOrder.indexOf(phaseId);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhaseId = phaseOrder[currentIndex + 1];
      toast({
        title: `${phases.find(p => p.id === phaseId)?.name} Phase Completed!`,
        description: `Moving to ${phases.find(p => p.id === nextPhaseId)?.name} Phase.`,
      });
      
      // Update the next phase to in-progress
      setPhases(prevPhases => 
        prevPhases.map(phase => {
          if (phase.id === nextPhaseId) {
            return {
              ...phase,
              status: "in-progress"
            };
          }
          return phase;
        })
      );
      
      // Move to the next phase
      setActivePhaseId(nextPhaseId);
    } else {
      // If all phases are completed, show a notification
      toast({
        title: "All Phases Completed!",
        description: "Your project blueprint is complete. Click 'Complete Project' to continue.",
      });
    }
  };

  const handleReflectionProgress = (completed: number, total: number) => {
    updatePhaseProgress("reflection", completed, total);
  };

  const handleScopingProgress = (completed: number, total: number) => {
    updatePhaseProgress("scoping", completed, total);
  };

  const handleDevelopmentProgress = (completed: number, total: number) => {
    updatePhaseProgress("development", completed, total);
  };

  const handleEvaluationProgress = (completed: number, total: number) => {
    updatePhaseProgress("evaluation", completed, total);
  };

  const handleCompleteProject = () => {
    // Save all project data before completion
    const projectData = {
      prompt: projectPrompt,
      files: projectFiles,
      phases,
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem('completed_project', JSON.stringify(projectData));
    navigate('/project-completion');
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // Phase completion status for conditional rendering
  const allPhasesCompleted = phases.every(phase => phase.status === "completed");
  const isPhaseActive = (phaseId: string) => {
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const currentIndex = phaseOrder.indexOf(activePhaseId);
    const targetIndex = phaseOrder.indexOf(phaseId);
    return targetIndex <= currentIndex;
  };

  // Check if the current phase is accessible
  const canAccessPhase = (phaseId: string) => {
    if (phaseId === "reflection") return true;
    
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const targetIndex = phaseOrder.indexOf(phaseId);
    const previousPhase = phases.find(p => p.id === phaseOrder[targetIndex - 1]);
    
    return previousPhase?.status === "completed";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col md:flex-row pt-16">
        <div ref={sidebarRef}>
          <ProjectBlueprintSidebar 
            phases={phases} 
            activePhase={activePhaseId}
            setActivePhase={(phaseId) => {
              // Only allow setting active phase if previous phases are completed
              if (canAccessPhase(phaseId)) {
                setActivePhaseId(phaseId);
              } else {
                toast({
                  title: "Phase Locked",
                  description: "You need to complete previous phases first.",
                  variant: "destructive"
                });
              }
            }}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        </div>
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <BackButton />

            {isMobile && (
              <Button 
                ref={toggleBtnRef}
                variant="outline" 
                size="icon" 
                onClick={toggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            {activePhaseId === "reflection" && (
              <ReflectionPhase 
                onUpdateProgress={handleReflectionProgress}
                onCompletePhase={() => handleCompletePhase("reflection")} 
              />
            )}
            
            {activePhaseId === "scoping" && (
              canAccessPhase("scoping") ? (
                <ScopingPhase 
                  onUpdateProgress={handleScopingProgress}
                  onCompletePhase={() => handleCompletePhase("scoping")} 
                />
              ) : (
                <PhaseLockedMessage phaseName="Scoping" />
              )
            )}
            
            {activePhaseId === "development" && (
              canAccessPhase("development") ? (
                <DevelopmentPhase 
                  onUpdateProgress={handleDevelopmentProgress}
                  onCompletePhase={() => handleCompletePhase("development")} 
                />
              ) : (
                <PhaseLockedMessage phaseName="Development" />
              )
            )}
            
            {activePhaseId === "evaluation" && (
              canAccessPhase("evaluation") ? (
                <EvaluationPhase 
                  onUpdateProgress={handleEvaluationProgress}
                  onCompletePhase={() => handleCompletePhase("evaluation")}
                />
              ) : (
                <PhaseLockedMessage phaseName="Evaluation" />
              )
            )}
            
            {allPhasesCompleted && (
              <div className="mt-8 flex justify-center">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg px-8"
                  onClick={handleCompleteProject}
                >
                  Complete Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to show when a phase is locked
const PhaseLockedMessage = ({ phaseName }: { phaseName: string }) => {
  return (
    <Card className="my-8">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold mb-4">{phaseName} Phase Locked</h2>
        <p className="text-muted-foreground mb-6">
          You need to complete all previous phases before accessing the {phaseName} phase.
        </p>
        <ArrowRight className="h-10 w-10 text-muted-foreground mb-4" />
        <Button className="mt-2" disabled>
          Continue to {phaseName} Phase
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectBlueprint;

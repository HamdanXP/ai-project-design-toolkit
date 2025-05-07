
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { TopBar } from "@/components/TopBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { PhaseNavigation } from "@/components/PhaseNavigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DevelopmentPhasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [canAccessPhase, setCanAccessPhase] = useState(false);
  
  // Load phases from localStorage on component mount
  useEffect(() => {
    const storedPhases = localStorage.getItem('project_phases');
    if (storedPhases) {
      const parsedPhases = JSON.parse(storedPhases);
      setPhases(parsedPhases);
      
      // Check if user can access this phase
      const scopingPhase = parsedPhases.find((p: ProjectPhase) => p.id === "scoping");
      setCanAccessPhase(scopingPhase?.status === "completed");
    }
  }, []);

  const updatePhaseProgress = (completed: number, total: number) => {
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "development") {
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
      });
      
      localStorage.setItem('project_phases', JSON.stringify(updatedPhases));
      return updatedPhases;
    });
  };

  const handleCompletePhase = () => {
    // Mark the development phase as completed
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "development") {
          return {
            ...phase,
            status: "completed",
            progress: 100,
            completedSteps: phase.totalSteps
          };
        } else if (phase.id === "evaluation") {
          return {
            ...phase,
            status: "in-progress"
          };
        }
        return phase;
      });
      
      localStorage.setItem('project_phases', JSON.stringify(updatedPhases));
      return updatedPhases;
    });
    
    // Store phase data in localStorage when a phase is completed
    const phaseData = {
      phaseId: "development",
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`project_phase_development`, JSON.stringify(phaseData));
    
    toast({
      title: "Development Phase Completed!",
      description: "Moving to Evaluation Phase.",
    });
    
    // Navigate to the next phase
    navigate('/project/phases/evaluation');
  };

  if (!canAccessPhase) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <div className="flex-1 flex flex-col pt-16">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <PhaseNavigation currentPhase="development" phases={phases} />
              
              <Card className="my-8">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold mb-4">Development Phase Locked</h2>
                  <p className="text-muted-foreground mb-6">
                    You need to complete the Scoping phase before accessing the Development phase.
                  </p>
                  <ArrowRight className="h-10 w-10 text-muted-foreground mb-4" />
                  <Button 
                    className="mt-2" 
                    onClick={() => navigate('/project/phases/scoping')}
                  >
                    Go to Scoping Phase
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <PhaseNavigation currentPhase="development" phases={phases} />
            
            <DevelopmentPhase 
              onUpdateProgress={updatePhaseProgress}
              onCompletePhase={handleCompletePhase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentPhasePage;

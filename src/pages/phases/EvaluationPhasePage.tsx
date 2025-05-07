
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { TopBar } from "@/components/TopBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { PhaseNavigation } from "@/components/PhaseNavigation";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const EvaluationPhasePage = () => {
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
      const developmentPhase = parsedPhases.find((p: ProjectPhase) => p.id === "development");
      setCanAccessPhase(developmentPhase?.status === "completed");
    }
  }, []);

  const updatePhaseProgress = (completed: number, total: number) => {
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "evaluation") {
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
    // Mark the evaluation phase as completed
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "evaluation") {
          return {
            ...phase,
            status: "completed",
            progress: 100,
            completedSteps: phase.totalSteps
          };
        }
        return phase;
      });
      
      localStorage.setItem('project_phases', JSON.stringify(updatedPhases));
      return updatedPhases;
    });
    
    // Store phase data in localStorage when a phase is completed
    const phaseData = {
      phaseId: "evaluation",
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`project_phase_evaluation`, JSON.stringify(phaseData));
    
    toast({
      title: "All Phases Completed!",
      description: "Your project blueprint is complete.",
    });
    
    // Navigate to project completion
    navigate('/project-completion');
  };

  if (!canAccessPhase) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <TopBar />
        <div className="flex-1 flex flex-col pt-16">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <PhaseNavigation currentPhase="evaluation" phases={phases} />
              
              <Card className="my-8">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <h2 className="text-2xl font-bold mb-4">Evaluation Phase Locked</h2>
                  <p className="text-muted-foreground mb-6">
                    You need to complete the Development phase before accessing the Evaluation phase.
                  </p>
                  <ArrowRight className="h-10 w-10 text-muted-foreground mb-4" />
                  <Button 
                    className="mt-2" 
                    onClick={() => navigate('/project/phases/development')}
                  >
                    Go to Development Phase
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
            <PhaseNavigation currentPhase="evaluation" phases={phases} />
            
            <EvaluationPhase 
              onUpdateProgress={updatePhaseProgress}
              onCompletePhase={handleCompletePhase}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPhasePage;

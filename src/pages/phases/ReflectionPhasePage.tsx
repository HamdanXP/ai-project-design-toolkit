
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { TopBar } from "@/components/TopBar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { PhaseNavigation } from "@/components/PhaseNavigation";
import { useToast } from "@/hooks/use-toast";

const ReflectionPhasePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  
  // Load phases from localStorage on component mount
  useEffect(() => {
    const storedPhases = localStorage.getItem('project_phases');
    if (storedPhases) {
      setPhases(JSON.parse(storedPhases));
    } else {
      // Initialize phases if they don't exist
      const initialPhases = [
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
      ];
      setPhases(initialPhases);
      localStorage.setItem('project_phases', JSON.stringify(initialPhases));
    }
  }, []);

  const updatePhaseProgress = (completed: number, total: number) => {
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "reflection") {
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
    // Mark the reflection phase as completed
    setPhases(prevPhases => {
      const updatedPhases = prevPhases.map(phase => {
        if (phase.id === "reflection") {
          return {
            ...phase,
            status: "completed",
            progress: 100,
            completedSteps: phase.totalSteps
          };
        } else if (phase.id === "scoping") {
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
      phaseId: "reflection",
      completedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`project_phase_reflection`, JSON.stringify(phaseData));
    
    toast({
      title: "Reflection Phase Completed!",
      description: "Moving to Scoping Phase.",
    });
    
    // Navigate to the next phase
    navigate('/project/phases/scoping');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col pt-16">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <PhaseNavigation currentPhase="reflection" phases={phases} />
            
            <ReflectionPhase 
              onUpdateProgress={updatePhaseProgress}
              onCompletePhase={handleCompletePhase} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReflectionPhasePage;

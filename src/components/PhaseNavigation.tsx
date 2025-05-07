
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectPhase } from "./ProjectBlueprintSidebar";
import { Progress } from '@/components/ui/progress';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useNavigate } from 'react-router-dom';

interface PhaseNavigationProps {
  currentPhase: string;
  phases: ProjectPhase[];
}

export const PhaseNavigation = ({ currentPhase, phases }: PhaseNavigationProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(currentPhase);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Check if user can access this phase
    const phaseIndex = getPhaseIndex(value);
    const canAccess = canAccessPhase(value);
    
    if (canAccess) {
      navigate(`/project/phases/${value}`);
    }
  };
  
  const getPhaseIndex = (phaseId: string) => {
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    return phaseOrder.indexOf(phaseId);
  };
  
  const canAccessPhase = (phaseId: string) => {
    if (phaseId === "reflection") return true;
    
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const targetIndex = phaseOrder.indexOf(phaseId);
    const previousPhaseId = phaseOrder[targetIndex - 1];
    const previousPhase = phases.find(p => p.id === previousPhaseId);
    
    return previousPhase?.status === "completed";
  };
  
  return (
    <Card className="mb-8">
      <CardContent className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Project Blueprint</h1>
          <p className="text-muted-foreground">Track your project's progress through each phase</p>
        </div>
        
        <Tabs 
          value={currentPhase} 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-4">
            {phases.map(phase => (
              <TabsTrigger 
                key={phase.id} 
                value={phase.id}
                disabled={!canAccessPhase(phase.id)}
                className={!canAccessPhase(phase.id) ? "opacity-50 cursor-not-allowed" : ""}
              >
                {phase.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="mt-4 space-y-2">
          {phases.map(phase => (
            <div key={phase.id} className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{phase.name}</span>
                <span>{phase.completedSteps}/{phase.totalSteps}</span>
              </div>
              <Progress 
                value={phase.progress} 
                className="h-1.5" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

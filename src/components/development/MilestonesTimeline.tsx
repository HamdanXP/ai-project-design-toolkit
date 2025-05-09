
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowLeft, ArrowRight, Plus, Trash } from "lucide-react";
import { Milestone } from "@/types/development-phase";

type MilestonesTimelineProps = {
  milestones: Milestone[];
  setMilestones: ((milestones: Milestone[]) => void) | undefined;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const MilestonesTimeline = ({ 
  milestones,
  setMilestones,
  moveToPreviousStep,
  moveToNextStep 
}: MilestonesTimelineProps) => {
  const [newMilestone, setNewMilestone] = useState("");
  const isReadOnly = !setMilestones;

  // Handler for toggling milestone completion
  const handleToggleMilestone = (id: string) => {
    if (isReadOnly) return;
    
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id 
          ? { ...milestone, isCompleted: !milestone.isCompleted } 
          : milestone
      )
    );
  };

  // Handler for updating milestone notes
  const handleUpdateNotes = (id: string, notes: string) => {
    if (isReadOnly) return;
    
    setMilestones(
      milestones.map((milestone) =>
        milestone.id === id ? { ...milestone, notes } : milestone
      )
    );
  };

  // Handler for adding a new custom milestone
  const handleAddMilestone = () => {
    if (isReadOnly || !newMilestone.trim()) return;
    
    const newMilestoneItem: Milestone = {
      id: `custom-${Date.now()}`,
      title: newMilestone.trim(),
      description: "Custom milestone",
      isCompleted: false,
      notes: ""
    };
    
    setMilestones([...milestones, newMilestoneItem]);
    setNewMilestone("");
  };

  // Handler for deleting a milestone
  const handleDeleteMilestone = (id: string) => {
    if (isReadOnly) return;
    setMilestones(milestones.filter(milestone => milestone.id !== id));
  };

  // Calculate if ready to proceed (at least one milestone completed)
  const hasCompletedMilestone = milestones.some(m => m.isCompleted);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Milestones</CardTitle>
          <CardDescription>
            Track your AI development progress with these milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {milestones.map((milestone, index) => (
            <div 
              key={milestone.id}
              className={`p-4 border rounded-md transition-all ${
                milestone.isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-3 items-start">
                  <Button
                    variant={milestone.isCompleted ? "default" : "outline"}
                    size="icon"
                    className={milestone.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                    onClick={() => handleToggleMilestone(milestone.id)}
                    disabled={isReadOnly}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="font-medium">
                      {index + 1}. {milestone.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {milestone.description}
                    </p>
                  </div>
                </div>
                
                {milestone.id.startsWith('custom-') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    disabled={isReadOnly}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="mt-4 pl-10">
                <Textarea
                  placeholder="Add notes or status updates for this milestone..."
                  value={milestone.notes}
                  onChange={(e) => handleUpdateNotes(milestone.id, e.target.value)}
                  className="resize-none"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          ))}
          
          {!isReadOnly && (
            <div className="flex gap-2">
              <Input
                placeholder="Add custom milestone..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMilestone.trim()) {
                    handleAddMilestone();
                  }
                }}
              />
              <Button onClick={handleAddMilestone} disabled={!newMilestone.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={moveToPreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={moveToNextStep} disabled={!hasCompletedMilestone}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

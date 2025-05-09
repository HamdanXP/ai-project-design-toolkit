
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

type ReadinessCheckProps = {
  readiness: number;
  setReadiness: ((value: number) => void) | undefined;
  isReadyToComplete: boolean;
  moveToPreviousStep: () => void;
  onCompletePhase: () => void;
};

export const ReadinessCheck = ({
  readiness,
  setReadiness,
  isReadyToComplete,
  moveToPreviousStep,
  onCompletePhase
}: ReadinessCheckProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const isReadOnly = !setReadiness;

  // Get readiness level label
  const getReadinessLabel = (value: number) => {
    if (value < 30) return "Not Ready";
    if (value < 70) return "Needs Improvements";
    if (value < 90) return "Ready";
    return "Fully Ready";
  };

  // Get readiness level color
  const getReadinessColor = (value: number) => {
    if (value < 30) return "text-destructive";
    if (value < 70) return "text-amber-500";
    return "text-emerald-500";
  };

  const handleSliderChange = (value: number[]) => {
    if (isReadOnly) return;
    setReadiness(value[0]);
  };

  const handleCompletePhase = () => {
    setConfirmDialogOpen(false);
    onCompletePhase();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Readiness Check</CardTitle>
          <CardDescription>
            Evaluate your model's readiness for the evaluation phase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Model Readiness Score</span>
              <span className={`font-medium ${getReadinessColor(readiness)}`}>
                {readiness}% - {getReadinessLabel(readiness)}
              </span>
            </div>
            
            <Slider
              defaultValue={[readiness]}
              max={100}
              step={5}
              onValueChange={handleSliderChange}
              disabled={isReadOnly}
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not Ready</span>
              <span>Needs Work</span>
              <span>Ready</span>
              <span>Fully Ready</span>
            </div>
          </div>
          
          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              {isReadyToComplete ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              Readiness Assessment
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Pipeline Selection</span>
                  <span className="text-emerald-500">Complete</span>
                </div>
                <Progress value={100} className="h-1 mt-1" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Milestones Progress</span>
                  <span className="text-emerald-500">Complete</span>
                </div>
                <Progress value={100} className="h-1 mt-1" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Ethical Considerations</span>
                  <span className={readiness >= 70 ? "text-emerald-500" : "text-amber-500"}>
                    {readiness >= 70 ? "Addressed" : "Needs Review"}
                  </span>
                </div>
                <Progress 
                  value={readiness >= 70 ? 100 : Math.min(readiness + 20, 60)} 
                  className="h-1 mt-1" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm">
                  <span>Model Performance</span>
                  <span className={readiness >= 60 ? "text-emerald-500" : "text-amber-500"}>
                    {readiness >= 60 ? "Sufficient" : "Needs Improvement"}
                  </span>
                </div>
                <Progress 
                  value={readiness >= 60 ? 100 : Math.min(readiness + 30, 50)} 
                  className="h-1 mt-1" 
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={moveToPreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="default" 
            onClick={() => setConfirmDialogOpen(true)} 
            disabled={!isReadyToComplete}
          >
            Complete Development Phase
          </Button>
        </CardFooter>
      </Card>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Development Phase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete the Development Phase? This will mark this phase as complete
              and move you to the evaluation phase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompletePhase}>
              Complete Phase
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { EthicalCheck } from "@/types/development-phase";

type EthicalCheckpointsProps = {
  ethicalChecks: EthicalCheck[];
  setEthicalChecks: ((checks: EthicalCheck[]) => void) | undefined;
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const EthicalCheckpoints = ({
  ethicalChecks,
  setEthicalChecks,
  moveToPreviousStep,
  moveToNextStep
}: EthicalCheckpointsProps) => {
  const isReadOnly = !setEthicalChecks;
  
  // Handler for updating an ethical check answer
  const handleUpdateAnswer = (id: string, answer: "yes" | "no" | "unknown") => {
    if (isReadOnly) return;
    
    setEthicalChecks(
      ethicalChecks.map((check) =>
        check.id === id ? { ...check, answer } : check
      )
    );
  };

  // Handler for updating notes for an ethical check
  const handleUpdateNotes = (id: string, notes: string) => {
    if (isReadOnly) return;
    
    setEthicalChecks(
      ethicalChecks.map((check) =>
        check.id === id ? { ...check, notes } : check
      )
    );
  };

  // Check if at least one question has been answered
  const hasAnsweredSome = ethicalChecks.some(check => check.answer !== "unknown");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ethical AI Checkpoints</CardTitle>
          <CardDescription>
            Evaluate ethical considerations for your AI development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {ethicalChecks.map((check) => (
              <div key={check.id} className="border-b pb-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-medium text-lg">{check.question}</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground"
                    title="Get ethical guidance"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mb-4">
                  <RadioGroup
                    value={check.answer}
                    onValueChange={(value) => 
                      handleUpdateAnswer(check.id, value as "yes" | "no" | "unknown")
                    }
                    disabled={isReadOnly}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id={`${check.id}-yes`} />
                      <Label htmlFor={`${check.id}-yes`}>Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id={`${check.id}-no`} />
                      <Label htmlFor={`${check.id}-no`}>No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id={`${check.id}-unknown`} />
                      <Label htmlFor={`${check.id}-unknown`}>Needs investigation</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Textarea
                  placeholder="Add notes or actions needed..."
                  value={check.notes}
                  onChange={(e) => handleUpdateNotes(check.id, e.target.value)}
                  disabled={isReadOnly}
                  className="resize-none"
                />
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={moveToPreviousStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={moveToNextStep} disabled={!hasAnsweredSome}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

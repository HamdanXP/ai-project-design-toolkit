
import { Card, CardContent } from "@/components/ui/card";

export const EvaluationPhase = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Evaluation Phase</h2>
        <p className="text-muted-foreground">
          Review and evaluate your completed project.
        </p>
      </div>

      <Card className="flex-1">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            This phase will be implemented in the future. <br />
            Please complete all previous phases first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

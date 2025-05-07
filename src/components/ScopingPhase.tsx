
import { Card, CardContent } from "@/components/ui/card";

export const ScopingPhase = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Scoping Phase</h2>
        <p className="text-muted-foreground">
          Define the scope and requirements for your project.
        </p>
      </div>

      <Card className="flex-1">
        <CardContent className="p-6 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            This phase will be implemented in the future. <br />
            Please complete the Reflection phase first.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

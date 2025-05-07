
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PhaseLockedMessageProps = {
  phaseName: string;
};

export const PhaseLockedMessage = ({ phaseName }: PhaseLockedMessageProps) => {
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

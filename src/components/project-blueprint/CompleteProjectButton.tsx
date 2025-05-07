
import { Button } from "@/components/ui/button";

interface CompleteProjectButtonProps {
  onComplete: () => void;
}

export const CompleteProjectButton = ({ onComplete }: CompleteProjectButtonProps) => {
  return (
    <div className="mt-8 flex justify-center">
      <Button 
        className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg px-8"
        onClick={onComplete}
      >
        Complete Project
      </Button>
    </div>
  );
};

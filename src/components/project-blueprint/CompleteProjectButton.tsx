
import { Button } from "@/components/ui/button";

interface CompleteProjectButtonProps {
  onClick: () => void; // Changed from 'onComplete' to 'onClick' to match usage
}

export const CompleteProjectButton = ({ onClick }: CompleteProjectButtonProps) => {
  return (
    <Button 
      className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg px-8"
      onClick={onClick}
    >
      Complete Project
    </Button>
  );
};

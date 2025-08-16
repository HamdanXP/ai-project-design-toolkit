
import { TopBar } from "@/components/TopBar";
import HomePage from "@/components/HomePage";
import { useToast } from "@/hooks/useToast";

const Index = () => {
  const { toast } = useToast();

  const handleSignIn = () => {
    toast({
      title: "Sign in successful!",
      description: "Welcome back to AI Project Design Toolkit!",
    });
  };

  const handleSignUp = () => {
    toast({
      title: "Account created!",
      description: "Welcome to AI Project Design Toolkit!",
    });
  };

  return (
    <div className="min-h-screen">
      <TopBar 
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
      <HomePage />
    </div>
  );
};

export default Index;


import { TopBar } from "@/components/TopBar";
import HomePage from "@/components/HomePage";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();

  const handleSignIn = () => {
    toast({
      title: "Sign in successful!",
      description: "Welcome back to Lovable!",
    });
  };

  const handleSignUp = () => {
    toast({
      title: "Account created!",
      description: "Welcome to Lovable!",
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

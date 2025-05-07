
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export const useSignUp = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (name: string, email: string, password: string, agreedToTerms: boolean) => {
    setIsLoading(true);
    
    // Simulate sign up
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock successful registration
      if (name && email && password && agreedToTerms) {
        // Use the mocked sign in function we exposed on the window object
        if (typeof window !== 'undefined' && (window as any).mockSignIn) {
          (window as any).mockSignIn();
        }
        
        toast({
          title: "Account created",
          description: "You have successfully created your account",
        });
        
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Please fill in all fields and agree to terms",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const handleSocialSignUp = (provider: string) => {
    toast({
      title: "Social Sign Up",
      description: `Sign up with ${provider} is not implemented in this demo`,
    });
  };

  const handleSignIn = () => {
    navigate("/sign-in");
  };

  return {
    isLoading,
    handleSubmit,
    handleSocialSignUp,
    handleSignIn
  };
};

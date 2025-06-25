
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/useToast";

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
        // Store user info in localStorage
        const userData = {
          name,
          email,
          isLoggedIn: true
        };
        localStorage.setItem("lovableUser", JSON.stringify(userData));
        
        // Use the mocked sign in function we exposed on the window object
        if (typeof window !== 'undefined' && (window as any).mockSignIn) {
          (window as any).mockSignIn(userData);
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
    // Mock social sign up
    const mockUserData = {
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      isLoggedIn: true
    };
    
    // Store in localStorage
    localStorage.setItem("lovableUser", JSON.stringify(mockUserData));
    
    // Use the mocked sign in function
    if (typeof window !== 'undefined' && (window as any).mockSignIn) {
      (window as any).mockSignIn(mockUserData);
    }
    
    toast({
      title: "Social Sign Up",
      description: `Sign up with ${provider} successful!`,
    });
    
    navigate("/");
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

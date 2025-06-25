import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/useToast";

export const useSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (email && password) {
        const userData = { name: email.split("@")[0], email, isLoggedIn: true };
        localStorage.setItem("lovableUser", JSON.stringify(userData));
        if (typeof window !== "undefined" && (window as any).mockSignIn) {
          (window as any).mockSignIn(userData);
        }
        toast({ title: "Success", description: "You have successfully signed in" });
        navigate("/");
      } else {
        toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      }
    }, 1500);
  };

  const handleSocialSignIn = (provider: string) => {
    const mockUserData = {
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
      isLoggedIn: true,
    };

    localStorage.setItem("lovableUser", JSON.stringify(mockUserData));

    if (typeof window !== "undefined" && (window as any).mockSignIn) {
      (window as any).mockSignIn(mockUserData);
    }

    toast({ title: "Social Sign In", description: `Sign in with ${provider} successful!` });
    navigate("/");
  };

  const handleForgotPassword = () => {
    toast({
      title: "Forgot Password",
      description: "Password reset functionality is not implemented in this demo",
    });
  };

  const handleSignUp = () => {
    navigate("/sign-up");
  };

  return {
    email,
    password,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handleSocialSignIn,
    handleForgotPassword,
    handleSignUp,
  };
};


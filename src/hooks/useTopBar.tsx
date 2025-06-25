import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/useToast";
import { useIsMobile } from "@/hooks/useMobile";

export const useTopBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mockUser, setMockUser] = useState<{ name: string; email?: string; image?: string } | undefined>(
    undefined
  );
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    const storedUser = localStorage.getItem("lovableUser");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData && userData.isLoggedIn) {
          setIsLoggedIn(true);
          setMockUser(userData);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage", error);
      }
    }
  }, []);

  const handleSignIn = () => navigate("/sign-in");

  const handleSignUp = () => navigate("/sign-up");

  const handleSignOut = () => {
    localStorage.removeItem("lovableUser");
    setIsLoggedIn(false);
    setMockUser(undefined);
    toast({ title: "Signed out", description: "You have been successfully signed out" });
    navigate("/");
  };

  const handleNavigate = (path: string) => navigate(path);

  const mockSignIn = (userData?: any) => {
    setIsLoggedIn(true);
    setMockUser(userData || { name: "John Doe" });
  };

  if (typeof window !== "undefined") {
    (window as any).mockSignIn = mockSignIn;
  }

  return {
    isLoggedIn,
    mockUser,
    isMobile,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    handleNavigate,
  };
};

